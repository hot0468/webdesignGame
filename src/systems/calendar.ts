import { MONTHS_PER_YEAR, WEEKS_PER_MONTH } from '../data/game'

/** 통산 주차 → 달력 위치. `일정` 창과 작업 표시줄이 **같은 출처**를 쓰게 하려고 함수로 뺐다.
 *
 * ⚠️ 실제 달력의 불규칙한 주 경계를 쓰지 않는다 — 한 달을 `WEEKS_PER_MONTH`주로 고정해야
 *    월말 정산 주차가 달마다 흔들리지 않는다. 1주차 = 1년 1월 1째 주.
 *
 * ⚠️ `week`는 1부터 센다. 0 이하를 넣으면 나머지 연산이 음수로 돌아 12월·4째 주가 나오므로
 *    호출 쪽에서 만들어 넣지 말 것(스토어의 `week`는 1에서 시작해 늘기만 한다). */
export function toCalendar(week: number) {
  const monthIndex = Math.floor((week - 1) / WEEKS_PER_MONTH)
  return {
    year: Math.floor(monthIndex / MONTHS_PER_YEAR) + 1,
    month: (monthIndex % MONTHS_PER_YEAR) + 1,
    weekOfMonth: ((week - 1) % WEEKS_PER_MONTH) + 1,
  }
}

/** 통산 주차 → 사람이 읽는 날짜. 마감처럼 **위치를 말해야 하는 값**에 쓴다.
 *
 * ⚠️ 마감을 "3주"처럼 남은 주로만 적지 마라 — 지금이 몇 주차인지 함께 붙들고 빼야 해서
 *    달력 창을 보며 계획을 세울 수가 없다. 남은 주는 **임박했는지**만 말하게 두고
 *    언제까지인지는 이 날짜가 말한다.
 *
 * 해는 붙이지 않는다. 마감은 길어야 몇 주 앞이라 늘 같은 해이고, 매 줄에 "1년"이 서면
 * 정작 다른 달·주가 눈에 안 띈다. */
export function formatWeek(week: number) {
  const { month, weekOfMonth } = toCalendar(week)
  return `${month}월 ${weekOfMonth}째 주`
}
