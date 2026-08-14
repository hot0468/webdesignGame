import { CLIENTS } from '../data/company'
import {
  MENTAL_HIT,
  MENTAL_RECOVERY,
  WEEKEND_DUE_WEEKS,
  WEEKEND_EVENT_CHANCE,
  WEEKEND_FEE_MULT,
  WEEKEND_MENTAL_COST,
} from '../data/game'
import type { Request } from '../data/inbox'
import { formatWeek } from './calendar'
import type { JobKind } from './pipeline'
import { roller } from './seed'

/** 주말 돌발 이벤트의 규칙 전부. **순수 함수다**(`src/systems/` 규칙 — React·mutation 없음).
 *
 * ⚠️ **`Math.random`이 없다.** 발생도 어떤 의뢰인지도 전부 `systems/seed.ts`의 `roller`가
 *    씨앗을 받아 굴린다 — 씨앗은 **주차 하나**에서 파생하므로 새 상태 축이 필요 없고,
 *    같은 판을 불러오면 늘 같은 주말이 온다(지원자·직원 요청과 같은 규칙). 창을 닫았다
 *    열어 마음에 드는 의뢰가 나올 때까지 굴릴 수 없다.
 *
 * 고리는 이렇다:
 *   주차 → (시드) 이번 주말에 돌발 의뢰가 있는가 → 있으면 그 의뢰 한 건
 *     → 플레이어가 **일할지 고른다**(안 고르면 아무 일도 없다 — 의뢰를 놓칠 뿐이다)
 *     → 일하면 정신력을 `WEEKEND_MENTAL_COST`만큼 물고 그 의뢰가 `acceptJob`으로 들어간다
 *     → 낮은 정신력은 **다음 주 행동력 상한**을 깎는다(`data/game.ts`의 `apMaxOf`)
 *
 * ⚠️ 돌발 의뢰는 **새 업무 축이 아니다** — 여기서 만드는 것은 평범한 `Request`이고,
 *    수주·공정·회신·마감·클레임 규칙을 전부 그대로 물려받는다. 받은 뒤에 평소 업무와
 *    다르게 굴러야 할 이유가 없다(다른 것은 마감이 짧고 단가가 높다는 것뿐이다). */

/** 돌발 의뢰가 되는 업무 종류. ⚠️ **팝업은 뺀다** — 팝업은 게시 기간(`popup`)을 지고
 *  `dueWeeks > toWeeks`라는 불변식이 있어(`data/inbox.ts`) 마감 1주짜리 급한 의뢰로는
 *  성립하지 않는다. 나머지 셋은 공정의 줄만 타므로 그대로 급해질 수 있다. */
const WEEKEND_KINDS = ['fix', 'ppt', 'site'] as const satisfies readonly JobKind[]

/** 종류별 의뢰 문안. ⚠️ **급하다는 것이 글에서 읽혀야 한다** — 목록에서 마감 날짜를
 *  세어 보고 나서야 급한 줄 알면 "돌발"이 아니다. 그래서 제목이 `[급함]`으로 시작한다.
 *
 * ⚠️ 제목은 **기존 의뢰(`data/inbox.ts`)와 비슷한 길이로 짧게** 유지한다 — 계기판의
 *    업무목록은 한 줄이고, 제목이 길면 그 줄의 최소 폭이 `.hud__col`의 상한을 넘어
 *    업체 이름까지 줄임표를 물거나 판이 화면 밖으로 밀린다(겪었다). 사정은 `body`가 적는다. */
const TEXT: Record<(typeof WEEKEND_KINDS)[number], { subject: string; body: string }> = {
  fix: {
    subject: '[급함] 페이지가 이상해요',
    body: '쉬시는데 연락드려 죄송합니다. 방금 확인해 보니 메인 페이지 문구가 예전 것으로 돌아가 있어요. 월요일 아침에 손님들이 보기 전에 고쳐 주실 수 있을까요? 급한 건이라 비용은 더 드리겠습니다.',
  },
  ppt: {
    subject: '[급함] 발표자료가 날아갔어요',
    body: '주말에 죄송합니다. 월요일 오전 발표인데 자료 파일이 통째로 날아갔어요. 원고는 그대로 있으니 장표만 다시 만들어 주시면 됩니다. 급하게 부탁드리는 만큼 값은 더 쳐 드릴게요.',
  },
  site: {
    subject: '[급함] 사이트가 아직입니다',
    body: '주말에 연락드려 정말 죄송합니다. 다음 주에 매장을 여는데 맡겼던 곳이 연락이 끊겼어요. 급하게라도 한 벌 만들어 주실 수 있을까요? 사정이 사정이라 단가는 맞춰 드리겠습니다.',
  },
}

/** 이번 주말에 오는 돌발 의뢰. **없으면 undefined다.**
 *
 * 씨앗은 `weekend:<주차>` — 주차는 이미 있는 값이라 **새 상태 축이 필요 없다**.
 * 같은 주를 다시 계산해도 같은 답이 나온다(재현성).
 *
 * ⚠️ id에 주차가 들어간다(`we:<주차>`) — 한 주에 한 건이라는 사실이 id에 있고,
 *    `readIds`·`rejectedIds`·`jobs`가 전부 이 id 하나로 그 주말을 가리킨다. */
export function weekendEvent(week: number): Request | undefined {
  const roll = roller(`weekend:${week}`)
  if (!roll.chance(WEEKEND_EVENT_CHANCE)) return undefined
  const kind = roll.pick(WEEKEND_KINDS)
  const client = roll.pick(CLIENTS)
  const text = TEXT[kind]
  return {
    id: `we:${week}`,
    // ⚠️ **메일이다.** 돌발 연락은 신규 의뢰의 성격이고(고객게시판은 계약 업체의
    //    유지보수 창구다), 회신·완료 메일도 같은 채널로 돌아가야 한다.
    channel: 'mail',
    from: client.name,
    subject: text.subject,
    body: text.body,
    at: `${formatWeek(week)} 주말`,
    dueWeeks: WEEKEND_DUE_WEEKS,
    // ⚠️ **마감이 짧은 값이다** — 이 배율이 없으면 주말 근무는 정신력만 물고 얻는 것이
    //    없는 순손해가 된다(그런 채로 굴러갔다).
    feeMult: WEEKEND_FEE_MULT,
    kind,
  }
}

/** 주말 근무 뒤의 정신력. ⚠️ **0 밑으로 내려가지 않는다** — 음수 정신력에는 뜻이 없고
 *  페널티 표(`MENTAL_PENALTY`)만 흐려진다. 자를 자리는 이 함수와 `recovered` 둘뿐이다. */
export const worked = (mental: number) => Math.max(0, mental - WEEKEND_MENTAL_COST)

/** 그 주에 일어난 나쁜 일이 깎는 정신력의 **합**.
 *
 * ⚠️ 사건을 새로 만들지 않는다 — 이미 평판을 깎는 넷(클레임·계약 파기·퇴사)에 값을
 *    하나 더 붙일 뿐이다. 세는 방식도 그쪽과 같다(클레임은 업체·주 단위로 한 번).
 *
 * ⚠️ **회복보다 먼저 세지 마라.** 호출 쪽은 `recovered`로 회복시킨 뒤 이 값을 뺀다 —
 *    순서를 뒤집으면 바닥에서 회복분만큼 되살아나 벌이 사라진다. */
export const mentalHit = (counts: {
  claims: number
  breaches: number
  quits: number
}): number =>
  counts.claims * MENTAL_HIT.claim +
  counts.breaches * MENTAL_HIT.breach +
  counts.quits * MENTAL_HIT.quit

/** 주차를 넘길 때 도는 정신력. **회복시킨 뒤 그 주의 나쁜 일을 뺀다.**
 *  ⚠️ **`mentalMax` 위로도 0 밑으로도 나가지 않는다**(자르는 자리는 여기와 `worked` 둘뿐). */
export const recovered = (mental: number, mentalMax: number, hit = 0) =>
  Math.max(0, Math.min(mentalMax, mental + MENTAL_RECOVERY) - hit)
