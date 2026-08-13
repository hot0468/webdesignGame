import {
  BID_BASE,
  BID_OPEN_WEEKS,
  BID_RESULT_WEEKS,
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
 *      ①공고마다 **참가 조건**(최소 직원수·시안 장수·기획안 랭크) → 못 맞추면 입찰 불가
 *      ②**입찰 기한**(`BID_OPEN_WEEKS`)이 있고 지나면 못 건다
 *      ③맞추면 **입찰**(행동력 `BID_AP`) — 확정 수주가 아니라 **추첨**이다
 *      ④낙찰 확률은 **회사평판 + 능력치**가 정하고 화면이 **입찰 전에** 그것을 적는다
 *      ⑤결과는 **익주**에 온다(`advanceWeek`가 판정한다 — 누르는 즉시가 아니다)
 *      ⑥낙찰 메일에서 **사업 시작**을 누르면 그때 평범한 `Request`가 되어 `acceptJob`을
 *        탄다(새 업무 축이 아니다). ⚠️ 안 눌러도 된다 — 낙찰이 곧 착수는 아니다
 *
 * ⚠️ **`Math.random`이 없다.** 공고 목록도 추첨 결과도 `systems/seed.ts`의 `roller`가
 *    씨앗을 받아 굴린다. 씨앗은 **주차**와 **공고 id**라 저장할 것이 없고, 무엇보다
 *    **다시 굴릴 수 없다** — 입찰을 취소했다 다시 하거나 창을 닫았다 열어 낙찰될 때까지
 *    반복할 수 있으면 확률이 뜻을 잃는다(`request.ts`의 성패 판정과 같은 규칙).
 * ⚠️ **판정이 익주로 밀려도 씨앗은 공고 id 하나 그대로다**(`bid:<id>`) — 입찰 시점이나
 *    판정 시점이 씨앗에 들어가면 저장·불러오기로 결과를 굴려 뽑을 수 있다. 답은 입찰하는
 *    순간 이미 정해져 있고, 익주에 오는 것은 그 답을 **읽는 시점**뿐이다.
 *
 * ⚠️ 평판이 위기선(`REPUTATION_CRISIS`) 아래면 **목록이 빈다**(설계 결정표: 낮으면 단가
 *    하락 → 위기선 아래면 아무것도 안 뜬다). 그래서 위기 탈출은 기수주 업무의 납품뿐이다. */

/** 뜬 공고 하나. ⚠️ **저장하지 않는다** — 주차에서 파생하므로(`listings`) 저장하면 두
 *  번째 출처가 생기고 세이브가 불어난다(지원자와 같은 규칙). 저장하는 것은 **입찰한 것뿐**이다(스토어 `bids` — ⚠️ 익주
 *  판정이 있어 공고 **한 벌 통째로** 든다. 그 주의 목록은 주가 넘어가면 사라진다). */
export type Listing = {
  /** ⚠️ **주차가 들어간다**(`wk:<주차>:<번호>`) — 추첨 씨앗이 이 id라서 같은 공고는 늘
   *  같은 결과를 낸다. 낙찰되면 그대로 `Job.id`가 된다(한 공고가 두 업무가 되지 않는다). */
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
 *  플레이어는 무엇을 해야 입찰할 수 있는지 알 수 없다(죽은 컨트롤 금지 규칙의 연장). */
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

/** 낙찰 확률(0~1). **회사평판 + 능력치**가 정한다.
 *
 * ⚠️ **`BID_MIN`~`BID_MAX` 밖으로 나가지 않는다** — 0이면 조건을 맞춰 입찰했는데 이길
 *    길이 없어 입찰이 뜻을 잃고, 1이면 추첨이 아니라 지급이다.
 * ⚠️ 화면이 **입찰 전에** 이 값을 적는다(모르고 거는 도박이 아니라 판단이어야 한다).
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
 * ⚠️ **다시 굴릴 수 없어야 한다.** 입찰을 취소했다 다시 하거나 창을 닫았다 열어 낙찰될
 *    때까지 반복할 수 있으면 확률이 뜻을 잃는다 — 그래서 씨앗은 주차가 박힌 공고 id이고,
 *    **입찰 시점도 판정 시점도 답에 들어가지 않는다**(`request.ts`의 `feedbackWorks`와
 *    같은 규칙). 익주 판정으로 바뀌어도 답은 입찰하는 순간 이미 정해져 있는 셈이고,
 *    그래서 저장했다 불러와도 결과가 안 바뀐다.
 * ⚠️ 확률은 입찰하는 **그 순간의** 평판·능력치가 정한다(굳혀서 들고 있다가 판정 때 쓴다) —
 *    부르는 쪽이 `winChance`의 값을 그대로 넘긴다. 여기서 다시 계산하면 확률을 두 곳에서
 *    재게 되고, 기다리는 사이 평판이 움직이면 화면에 적힌 것과 다른 확률로 굴리게 된다. */
export const wins = (listingId: string, chance: number): boolean =>
  roller(`bid:${listingId}`).chance(chance)

/** 낙찰된 공고 → **평범한 `Request`**. ⚠️ 새 업무 축을 만들지 않는다 — 받은 뒤의 진행이
 *  평소 업무와 같아야 수주센터가 게임의 다른 규칙(공정·회신·마감·파기)을 전부 물려받는다
 *  (`systems/weekend.ts`가 같은 이유로 같은 모양을 낸다).
 *
 * ⚠️ `id`가 공고 id 그대로다 — 한 공고가 두 업무가 되지 않는다.
 * ⚠️ 이 함수를 부르는 것은 **낙찰 메일의 `사업 시작`**이다(입찰하는 순간이 아니다) —
 *    그래서 `dueWeeks`가 굳는 기준 주차도 시작을 누른 주다. */
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

/** ── 입찰 기한 ─────────────────────────────────────────────
 *
 * 공고는 뜬 주에만 걸 수 있는 것이 아니라 `BID_OPEN_WEEKS`주 동안 열려 있다.
 * ⚠️ **기한이 지난 공고에는 입찰 버튼을 그리지 않는다**(죽은 컨트롤 금지) — 대신 화면이
 *    "마감됐다"고 말한다. 목록에서 지우지 않는 이유: 어제까지 있던 공고가 말없이
 *    사라지면 놓친 것인지 고장인지 알 수 없다. */

/** 그 공고의 입찰 마감 주차. **이 주까지는 걸 수 있다**(양끝 포함 — 게시 기간과 같은 셈법). */
export const bidDeadline = (listing: Listing): number => listing.week + BID_OPEN_WEEKS - 1

/** 지금 걸 수 있는가. */
export const isOpen = (listing: Listing, week: number): boolean => week <= bidDeadline(listing)

/** 결과가 나오는 주차. **입찰한 주의 익주다**(`BID_RESULT_WEEKS`). */
export const resultWeek = (bidWeek: number): number => bidWeek + BID_RESULT_WEEKS

/** 화면에 서는 공고 — **기한이 살아 있는 지난 주 것까지** 함께 낸다.
 *
 * ⚠️ 기한이 있다는 말은 곧 **지난 주 공고도 보인다**는 뜻이다. 이번 주 목록만 그리면
 *    기한이 하루도 남지 않은 것과 같아 `BID_OPEN_WEEKS`가 뜻을 잃는다.
 * ⚠️ 새 것이 위에 선다(`listings`와 같은 순서로 주차 내림차순). 각 주의 목록은 그
 *    주차에서 파생하므로 여기서도 저장할 것이 없다.
 * ⚠️ 평판은 **지금 값**으로 본다 — 위기선 아래로 떨어지면 지난 주 공고도 함께 사라진다
 *    (`listings`가 빈 배열을 내는 규칙 그대로다). */
export function openListings(week: number, reputation: number): Listing[] {
  return Array.from({ length: BID_OPEN_WEEKS }, (_, back) => week - back)
    .filter((w) => w >= 1)
    .flatMap((w) => listings(w, reputation))
    .filter((l) => isOpen(l, week))
}

/** 낙찰을 알리는 메일. ⚠️ **`Request`다**(`ad`가 아니다) — 여기에 고를 것이 생겼기
 *  때문이다. 낙찰이 곧 착수가 아니라서 **사업 시작을 누르는 손짓**이 따로 필요하고,
 *  그 버튼은 `components/JobActions.tsx`가 지는 자리에 붙는다(메일 의뢰의 견적보내기와
 *  **같은 고리**다 — 새 버튼 체계를 만들지 않는다).
 *
 * ⚠️ `id`가 공고 id **그대로다**. 그래야 `acceptJob`이 만드는 `Job.id`가 공고 id가 되어
 *    (다른 경로와 같은 규칙) 한 공고가 두 업무가 되지 않는다. 낙방 메일만 `bidmail:` 접두를
 *    쓰는 이유도 이것이다 — 그쪽은 업무가 될 일이 없다.
 * ⚠️ `bid: true`는 **문안을 가르는 표식**이다(견적보내기가 아니라 사업 시작). 채널로는
 *    가를 수 없다 — 낙찰 메일도 신규 건이라 `mail`이다. */
export function winMail(listing: Listing, week: number): Request {
  const tier = findTier(listing.tier)
  return {
    id: listing.id,
    channel: 'mail',
    from: listing.from,
    // ⚠️ **제목에 `[낙찰]`을 붙이지 않는다.** 이 글의 제목은 `사업 시작`을 누르는 순간
    //    그대로 `Job.title`이 되어 계기판 업무목록 한 줄에 서는데(`acceptJob`), 거기서
    //    말머리는 제목을 밀어내 업체 이름까지 줄임표를 물린다(`shell.md`의 확립된 주의).
    //    낙찰이라는 사실은 도착 시각 칸(`at`)과 본문 첫 줄이 이미 말한다.
    subject: listing.subject,
    body: `${tier.label} 건 심사 결과를 알려 드립니다. 귀사가 최종 선정되었습니다. 계약 내용은 별도 안내드리며, 준비되시는 대로 착수 부탁드립니다.

${listing.body}`,
    at: `${formatWeek(week)} 낙찰`,
    dueWeeks: LISTING_DUE_WEEKS,
    kind: listing.kind,
    bid: true,
  }
}

/** 낙방을 알리는 메일. **`ad: true` 갈래 그대로다** — 고를 것이 없는 알림이라
 *  결정 버튼이 붙으면 안 된다(클레임 메일과 같은 이유). */
export function loseMail(listing: Listing, week: number) {
  const tier = findTier(listing.tier)
  return {
    id: `bidmail:${listing.id}`,
    channel: 'mail' as const,
    from: listing.from,
    subject: `[유감] ${listing.subject}`,
    body: `${tier.label} 건 심사 결과를 알려 드립니다. 아쉽게도 이번에는 다른 업체가 선정되었습니다. 다음 기회에 다시 뵙기를 바랍니다.`,
    at: formatWeek(week),
    ad: true as const,
  }
}
