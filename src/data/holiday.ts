/** 공휴일과 그 앞의 **피크타임**. 업체들이 명절·연말에 맞춰 팝업을 걸려고 하므로
 *  그 직전 주에 팝업 의뢰가 몰린다.
 *
 * ⚠️ **한 달은 4주 고정이다**(`WEEKS_PER_MONTH`) — 실제 달력의 날짜를 쓰지 않고
 *    "몇 월 몇째 주"로 잡는다. 실제 공휴일 날짜를 넣으면 이 게임의 주차와 어긋난다.
 *
 * ⚠️ **해가 바뀌어도 같은 자리에 온다**(달·주만 본다) — 통산 주차로 적으면 2년차에
 *    공휴일이 사라진다. `isPeakWeek`이 해를 무시하는 이유다. */

/** 공휴일 하나. `month`·`weekOfMonth`는 **공휴일이 있는 주**이고, 피크는 그 **앞 주**다. */
export type Holiday = {
  id: string
  name: string
  month: number
  weekOfMonth: number
}

/** ⚠️ 너무 촘촘하면 피크가 일상이 되어 뜻을 잃는다 — 한 해에 넷이면 대략 3개월에 한 번,
 *  플레이어가 "다음 대목"을 기다릴 만한 간격이다. */
export const HOLIDAYS = [
  { id: 'newyear', name: '설 연휴', month: 2, weekOfMonth: 1 },
  { id: 'family', name: '가정의 달', month: 5, weekOfMonth: 1 },
  { id: 'chuseok', name: '추석 연휴', month: 9, weekOfMonth: 3 },
  { id: 'yearend', name: '연말 시즌', month: 12, weekOfMonth: 3 },
] as const satisfies readonly Holiday[]

/** 피크 주에 **추가로** 오는 팝업 의뢰 수. ⚠️ 행동력 상한(초반 3)을 생각하면 서넛이
 *  한계다 — 더 주면 어차피 못 받는 글이 목록만 채우고, 마감을 넘겨 파기만 늘어난다. */
export const PEAK_JOBS = 3

/** 피크 의뢰의 단가 배율. **대목이라 값을 더 쳐 준다** — 짧은 마감을 무는 이유가 된다
 *  (주말 돌발 의뢰가 `WEEKEND_FEE_MULT`를 지는 것과 같은 규칙). */
export const PEAK_FEE_MULT = 1.4

/** 피크 의뢰의 게시 기간. **수주한 주(피크 주)에서 센 상대값**이고, 공휴일은 그 다음
 *  주이므로 **1주 뒤 하루만** 걸면 된다 — 대목에 걸려 있는 것이 이 팝업의 전부다.
 *
 * ⚠️ `PEAK_DUE_WEEKS`가 이 값보다 **뒤여야 한다**(`data/inbox.ts`의 팝업 불변식:
 *    게시가 끝난 뒤에 마감이 온다). 어기면 기간 안에 제대로 걸어 두고도 마감을 못
 *    지키는 판이 된다 — 실제로 그렇게 적었다가 테스트가 잡았다. */
export const PEAK_POPUP = { fromWeeks: 1, toWeeks: 1 } as const

/** 피크 의뢰의 마감(주). ⚠️ **게시가 끝난 뒤**여야 한다(위 불변식) — 그래서
 *  `PEAK_POPUP.toWeeks`보다 크다. 길게 주면 "대목에 몰린다"는 사실이 사라진다. */
export const PEAK_DUE_WEEKS = 2
