import { CLIENTS } from '../data/company'
import {
  HOLIDAYS,
  PEAK_DUE_WEEKS,
  PEAK_FEE_MULT,
  PEAK_JOBS,
  PEAK_POPUP,
  type Holiday,
} from '../data/holiday'
import type { Message, Request } from '../data/inbox'
import { formatWeek, toCalendar } from './calendar'
import { roller } from './seed'

/** 공휴일 앞의 **피크타임**. 대목에 맞춰 팝업을 걸려는 의뢰가 그 직전 주에 몰린다.
 *
 * ⚠️ 순수 함수다(`src/systems/` 규칙 — React·mutation·`Math.random` 없음).
 *    무작위는 전부 `seed.ts`의 `roller`가 **주차에서 파생한 씨앗**으로 굴린다 —
 *    새 상태 축이 없고, 같은 판을 불러오면 늘 같은 의뢰가 온다.
 *
 * ⚠️ **새 업무 축이 아니다.** 여기서 만드는 것은 평범한 팝업 `Request`이고 수주·공정·
 *    회신·마감·클레임 규칙을 전부 그대로 물려받는다. 다른 것은 **한꺼번에 여러 건이
 *    오고, 마감이 짧고, 단가가 높다**는 것뿐이다.
 *
 * ⚠️ 해를 보지 않는다 — 공휴일은 **달·주**로만 잡혀 있어 2년차에도 같은 자리에 온다. */

/** 그 주가 어떤 공휴일의 **직전 주**인가. 아니면 undefined. */
export function peakOf(week: number): Holiday | undefined {
  // 다음 주가 공휴일이면 이번 주가 피크다.
  const nextWeek = toCalendar(week + 1)
  return HOLIDAYS.find(
    (h) => h.month === nextWeek.month && h.weekOfMonth === nextWeek.weekOfMonth,
  )
}

/** 이번 주에 몰려 오는 팝업 의뢰들. 피크가 아니면 **빈 배열**이다.
 *
 * ⚠️ 업체는 **계약 업체(`CLIENTS`)에서만** 고른다 — 팝업은 관리자 페이지에 걸어야 하고
 *    그 주소·계정을 가진 곳은 계약 업체뿐이다(`data/inbox.ts`가 같은 이유로 그렇게 한다).
 * ⚠️ 한 업체에 두 건이 가지 않게 고른 곳을 뺀다 — 같은 관리자 페이지에 팝업 두 개를
 *    걸면 클레임 판정(`systems/popup.ts`)이 서로를 "틀린 파일"로 본다. */
export function peakRequests(week: number): Request[] {
  const holiday = peakOf(week)
  if (!holiday) return []

  const roll = roller(`peak:${week}`)
  const pool = [...CLIENTS]
  const count = Math.min(PEAK_JOBS, pool.length)

  return Array.from({ length: count }, () => {
    const client = pool.splice(roll.int(0, pool.length - 1), 1)[0]!
    return {
      id: `peak:${week}:${client.id}`,
      // ⚠️ **고객게시판이다** — 이미 계약된 업체가 자기 사이트에 걸어 달라는 요청이라
      //    신규 의뢰(메일)가 아니다. 그래서 거절 없이 확인만 하는 갈래를 탄다.
      channel: 'board',
      from: client.name,
      subject: `${holiday.name} 팝업 부탁드려요`,
      body:
        `${holiday.name}에 맞춰 안내 팝업을 걸려고 합니다. 기간이 지나면 꼭 내려 주세요.\n` +
        `대목이라 서두르는 만큼 값은 더 쳐 드리겠습니다.`,
      at: `${formatWeek(week)} 접수`,
      dueWeeks: PEAK_DUE_WEEKS,
      feeMult: PEAK_FEE_MULT,
      kind: 'popup',
      popup: {
        clientId: client.id,
        fromWeeks: PEAK_POPUP.fromWeeks,
        toWeeks: PEAK_POPUP.toWeeks,
      },
    } satisfies Request
  })
}

/** 피크가 온다는 예고. **한 주 앞서** 알려 주어야 행동력을 아껴 둘 수 있다 —
 *  당일에 알면 이미 그 주의 행동력을 다 쓴 뒤라 몰려온 일을 못 받는다.
 *
 * ⚠️ `ad: true` 갈래다 — 알리는 글이지 의뢰가 아니라서 견적보내기가 붙으면 안 된다. */
export function peakNotice(week: number): Message | undefined {
  // 다음 주가 피크면 이번 주에 예고한다.
  const holiday = peakOf(week + 1)
  if (!holiday) return undefined
  return {
    id: `peaknotice:${week}`,
    channel: 'mail',
    from: '웹디검색',
    subject: `다음 주는 ${holiday.name} 대목입니다`,
    body:
      `${holiday.name}이 다가옵니다. 다음 주에는 업체들이 안내 팝업을 걸려고 몰릴 것으로\n` +
      `보입니다. 행동력을 조금 남겨 두시면 좋겠습니다.`,
    at: formatWeek(week),
    ad: true,
  }
}
