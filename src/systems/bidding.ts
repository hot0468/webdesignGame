import {
  BID_BASE,
  BID_MAX,
  BID_MIN,
  LISTINGS_PER_WEEK,
  LISTING_DUE_WEEKS,
  LISTING_KINDS,
  LISTING_TEXT,
  LISTING_TIERS,
  ORDERER_HEADS,
  ORDERER_TAILS,
  REPUTATION_WEIGHT,
  STAT_WEIGHT,
  findTier,
  type ListingTier,
  type Requirement,
  type TierId,
} from '../data/bidding'
import { REPUTATION_CRISIS, type Grade } from '../data/game'
import type { Request } from '../data/inbox'
import { formatWeek } from './calendar'
import { GRADE_ORDER, type JobKind } from './pipeline'
import { roller } from './seed'

/** 업무 수주 사이트(수주센터)의 규칙 전부. **순수 함수다**(`src/systems/` 규칙 —
 *  React·mutation·`Math.random` 없음).
 *
 * ⚠️ **메일 의뢰와 완전히 다른 고리다.** 메일로 온 의뢰는 오면 무조건 받을 수 있다.
 *    공고는 이렇게 굴러간다:
 *      ①공고마다 **참가 조건**(최소 직원수·시안 장수·기획안 랭크) → 못 맞추면 응모 불가
 *      ②맞추면 **응모**(행동력 `BID_AP`) — 확정 수주가 아니라 **추첨**이다
 *      ③당첨 확률은 **회사평판 + 능력치**가 정하고 화면이 **응모 전에** 그것을 적는다
 *      ④당첨되면 평범한 `Request`가 되어 `acceptJob`을 그대로 탄다(새 업무 축이 아니다)
 *
 * ⚠️ **`Math.random`이 없다.** 공고 목록도 추첨 결과도 `systems/seed.ts`의 `roller`가
 *    씨앗을 받아 굴린다. 씨앗은 **주차**와 **공고 id**라 저장할 것이 없고, 무엇보다
 *    **다시 굴릴 수 없다** — 응모를 취소했다 다시 하거나 창을 닫았다 열어 당첨될 때까지
 *    반복할 수 있으면 확률이 뜻을 잃는다(`request.ts`의 성패 판정과 같은 규칙).
 *
 * ⚠️ 평판이 위기선(`REPUTATION_CRISIS`) 아래면 **목록이 빈다**(설계 결정표: 낮으면 단가
 *    하락 → 위기선 아래면 아무것도 안 뜬다). 그래서 위기 탈출은 기수주 업무의 납품뿐이다. */

/** 뜬 공고 하나. ⚠️ **저장하지 않는다** — 주차에서 파생하므로(`listings`) 저장하면 두
 *  번째 출처가 생기고 세이브가 불어난다(지원자와 같은 규칙). 저장하는 것은 **응모한
 *  공고의 id뿐**이다(스토어 `bids`). */
export type Listing = {
  /** ⚠️ **주차가 들어간다**(`wk:<주차>:<번호>`) — 추첨 씨앗이 이 id라서 같은 공고는 늘
   *  같은 결과를 낸다. 당첨되면 그대로 `Job.id`가 된다(한 공고가 두 업무가 되지 않는다). */
  id: string
  tier: TierId
  kind: JobKind
  /** 발주처. `CLIENTS`에 없는 처음 보는 곳이다. */
  from: string
  subject: string
  body: string
  /** 뜬 주차. 목록이 이 주차의 것인지 화면이 확인한다. */
  week: number
}

/** 회사가 지금 들고 있는 것 — 자격 판정의 재료. ⚠️ 스토어 전체를 받지 않는다(순수 함수가
 *  UI·세이브의 모양에 묶이지 않게 한다 — `pipeline.ts`의 `StepJob`과 같은 규칙). */
export type Portfolio = {
  /** 고용된 직원 수. */
  employees: number
  /** 만들어 둔 시안 장수(피그마 `drafts`). */
  drafts: number
  /** 만들어 둔 기획안(PPT `slides`)의 등급들. **가장 높은 것**이 랭크가 된다. */
  slideGrades: readonly Grade[]
}

/** 자격 판정의 답. ⚠️ **무엇이 모자란지**를 함께 낸다 — 화면이 그냥 흐리게만 두면
 *  플레이어는 무엇을 해야 응모할 수 있는지 알 수 없다(죽은 컨트롤 금지 규칙의 연장). */
export type Eligibility = {
  ok: boolean
  /** 못 맞춘 조건의 사람이 읽는 이유. 맞췄으면 빈 배열이다. */
  missing: string[]
}

/** 그 등급 이상인가. 사다리의 정본은 `pipeline.ts`의 `GRADE_ORDER` 하나다. */
const meetsRank = (have: Grade | undefined, need: Grade): boolean =>
  have !== undefined && GRADE_ORDER.indexOf(have) >= GRADE_ORDER.indexOf(need)

/** 가진 기획안 중 **가장 높은** 등급. 없으면 undefined.
 *  ⚠️ 완료 보상(`satisfaction`)이 **가장 낮은** 등급을 보는 것과 방향이 반대다 —
 *     거기는 실수를 벌하는 자리고 여기는 회사가 무엇까지 할 수 있는지를 증명하는 자리다. */
export const bestGrade = (grades: readonly Grade[]): Grade | undefined =>
  grades.length === 0
    ? undefined
    : grades.reduce((top, g) => (GRADE_ORDER.indexOf(g) > GRADE_ORDER.indexOf(top) ? g : top))

/** 참가 자격. **셋을 다 맞춰야 추첨에 들어간다.** */
export function eligibility(require: Requirement, have: Portfolio): Eligibility {
  const missing: string[] = []
  if (have.employees < require.employees)
    missing.push(`직원 ${require.employees}명 이상 (현재 ${have.employees}명)`)
  if (have.drafts < require.drafts)
    missing.push(`시안 ${require.drafts}장 이상 (현재 ${have.drafts}장)`)
  const top = bestGrade(have.slideGrades)
  if (require.rank !== undefined && !meetsRank(top, require.rank))
    missing.push(`기획안 ${require.rank}랭크 이상 (현재 ${top ?? '없음'})`)
  return { ok: missing.length === 0, missing }
}

/** 당첨 확률(0~1). **회사평판 + 능력치**가 정한다.
 *
 * ⚠️ **`BID_MIN`~`BID_MAX` 밖으로 나가지 않는다** — 0이면 조건을 맞춰 응모했는데 이길
 *    길이 없어 응모가 뜻을 잃고, 1이면 추첨이 아니라 지급이다.
 * ⚠️ 화면이 **응모 전에** 이 값을 적는다(모르고 거는 도박이 아니라 판단이어야 한다).
 *
 * `stats`는 그 업무에 쓰이는 능력치들의 평균이다 — 어떤 값을 넘길지는 부르는 쪽이 정한다
 * (지금은 디자인·기획력). ⚠️ 여기서 스탯 종류를 고르지 마라: 스탯 축이 늘면 이 함수가
 * 스토어의 모양을 알아야 하게 된다. */
export function winChance(tier: ListingTier, reputation: number, stats: number): number {
  const base = BID_BASE / tier.rivals
  const bonus = reputation * REPUTATION_WEIGHT + stats * STAT_WEIGHT
  return Math.min(BID_MAX, Math.max(BID_MIN, base + bonus))
}

/** 이 주에 뜨는 공고들. **씨앗은 주차 하나다** — 저장할 것이 없고 같은 주는 늘 같은
 *  목록이다(창을 닫았다 열어 마음에 드는 공고가 나올 때까지 굴릴 수 없다).
 *
 * ⚠️ **평판이 위기선 아래면 빈 배열이다**(설계 결정표). 화면은 그 자리에 이유를 적는다.
 * ⚠️ 평판이 규모를 정한다 — `minReputation`을 넘긴 단만 후보가 된다. 낮은 평판에는
 *    작은 공고만 뜨므로 단가도 함께 낮아진다("낮으면 단가 하락"이 이 줄로 산다). */
export function listings(week: number, reputation: number, count = LISTINGS_PER_WEEK): Listing[] {
  if (reputation < REPUTATION_CRISIS) return []
  const tiers = LISTING_TIERS.filter((t) => reputation >= t.minReputation)
  return Array.from({ length: count }, (_, i) => {
    const r = roller(`work:${week}:${i}`)
    const tier = r.pick(tiers)
    const kind = r.pick(LISTING_KINDS)
    const text = LISTING_TEXT[kind]
    return {
      id: `wk:${week}:${i}`,
      tier: tier.id,
      kind,
      from: `${r.pick(ORDERER_HEADS)}${r.pick(ORDERER_TAILS)}`,
      subject: text.subject,
      body: text.body,
      week,
    }
  })
}

/** 추첨 결과. **씨앗은 공고 id 하나다.**
 *
 * ⚠️ **다시 굴릴 수 없어야 한다.** 응모를 취소했다 다시 하거나 창을 닫았다 열어 당첨될
 *    때까지 반복할 수 있으면 확률이 뜻을 잃는다 — 그래서 씨앗은 주차가 박힌 공고 id이고,
 *    응모 시점·횟수는 답에 들어가지 않는다(`request.ts`의 `feedbackWorks`와 같은 규칙).
 * ⚠️ 확률은 응모하는 **그 순간의** 평판·능력치가 정한다. 부르는 쪽이 `winChance`의 값을
 *    그대로 넘긴다 — 여기서 다시 계산하면 확률을 두 곳에서 재게 된다. */
export const wins = (listingId: string, chance: number): boolean =>
  roller(`bid:${listingId}`).chance(chance)

/** 당첨된 공고 → **평범한 `Request`**. ⚠️ 새 업무 축을 만들지 않는다 — 받은 뒤의 진행이
 *  평소 업무와 같아야 수주센터가 게임의 다른 규칙(공정·회신·마감·파기)을 전부 물려받는다
 *  (`systems/weekend.ts`가 같은 이유로 같은 모양을 낸다).
 *
 * ⚠️ `id`가 공고 id 그대로다 — 한 공고가 두 업무가 되지 않는다. */
export function asRequest(listing: Listing, week: number): Request {
  return {
    id: listing.id,
    // ⚠️ **메일이다.** 처음 거래하는 발주처의 신규 건이고(고객게시판은 계약 업체의
    //    유지보수 창구다), 회신·완료 메일도 같은 채널로 돌아가야 한다.
    channel: 'mail',
    from: listing.from,
    subject: listing.subject,
    body: listing.body,
    at: `${formatWeek(week)} 낙찰`,
    dueWeeks: LISTING_DUE_WEEKS,
    kind: listing.kind,
  }
}

/** 낙찰·낙방을 알리는 메일. **결과를 전하는 유일한 자리다** — 응모하고 나서 무슨 일이
 *  있었는지 받은편지함에서 읽힌다.
 *
 * ⚠️ `ad: true` 갈래다 — 알림이지 의뢰가 아니라서 견적보내기·거절하기가 붙으면 안 된다
 *    (클레임 메일과 같은 이유). 낙찰 건의 업무는 이미 `acceptJob`으로 들어가 있다. */
export function bidMail(listing: Listing, week: number, won: boolean) {
  const tier = findTier(listing.tier)
  return {
    id: `bidmail:${listing.id}`,
    channel: 'mail' as const,
    from: listing.from,
    subject: won ? `[낙찰] ${listing.subject}` : `[유감] ${listing.subject}`,
    body: won
      ? `${tier.label} 건 심사 결과를 알려 드립니다. 귀사가 최종 선정되었습니다. 계약 내용은 별도 안내드리며, 착수 부탁드립니다.`
      : `${tier.label} 건 심사 결과를 알려 드립니다. 아쉽게도 이번에는 다른 업체가 선정되었습니다. 다음 기회에 다시 뵙기를 바랍니다.`,
    at: formatWeek(week),
    ad: true as const,
  }
}
