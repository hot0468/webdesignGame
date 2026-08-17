import { MONTHS_PER_YEAR, WEEKDAYS, WEEKS_PER_MONTH, WORK_START } from '../data/game'

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

/** 통산 주차 → 날짜. 마감·게시 기간처럼 **언제인지를 말해야 하는 값**에 쓴다.
 *
 * 한 주 7일·한 달 `WEEKS_PER_MONTH`주 고정이라 달은 28일까지만 있다 — 실제 달력의
 * 30·31일은 나오지 않는다. 월말 정산 주차를 고정하려고 택한 값이고(`toCalendar` 참고)
 * 날짜 표기는 그 규칙을 그대로 따른다.
 *
 * ⚠️ 한 주는 날짜 하나가 아니라 이레다. `edge`가 그 주의 어느 끝을 적을지 정한다 —
 *    "언제까지"(마감·기간 종료)는 마지막 날, "언제부터"(기간 시작)는 첫날이다.
 *    기본값이 `end`인 이유: 이 함수를 부르는 자리는 대부분 마감이다. */
export function formatDate(week: number, edge: 'start' | 'end' = 'end') {
  const { month, weekOfMonth } = toCalendar(week)
  return `${month}월 ${edge === 'end' ? weekOfMonth * 7 : weekOfMonth * 7 - 6}일`
}

/** 게시 기간 한 줄. 의뢰문·관리자 페이지·포토샵이 **같은 함수로 적어야** 플레이어가
 *  두 곳을 눈으로 대조할 수 있다(어긋남을 알아채는 것이 팝업 고리의 전부다). */
export const formatPeriod = (from: number, to: number) =>
  `${formatDate(from, 'start')} ~ ${formatDate(to)}`

/** 걸리는 시간(분) → 사람이 읽는 길이. **비용을 적는 모든 자리가 이 함수를 쓴다** —
 *  버튼이 "360분"이라고 적고 일정표가 "6시간"이라고 적으면 같은 값이 둘로 보인다.
 *
 * ⚠️ 하루를 넘는 값은 **날로 말한다**(`dayMins`를 받아 환산한다) — 720분을 "12시간"이라고
 *    적으면 하루가 4~8시간인 이 게임에서 그것이 며칠인지 암산해야 한다. 퀄리티를 올릴수록
 *    일 단위가 되는 것이 이 축의 선택이므로, 그 단위가 그대로 읽혀야 한다. */
export function formatSpan(mins: number, dayMins: number): string {
  if (mins >= dayMins) {
    const days = Math.floor(mins / dayMins)
    const rest = mins % dayMins
    return rest === 0 ? `${days}일` : `${days}일 ${formatHours(rest)}`
  }
  return formatHours(mins)
}

/** 시·분으로만 적는다 — **날로 바꾸지 않는다**.
 *  ⚠️ **하루 안의 양**에 쓴다(오늘 남은 시간 등): 그런 값을 `formatSpan`에 넘기면
 *     하루치가 통째로 "1일"로 접혀, 넉 점 남은 것이 하루 남은 것처럼 읽힌다(겪었다). */
export function formatHours(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h === 0 ? `${m}분` : m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

/** 그날 흐른 분 → 벽시계. `WORK_START`(09:00)에서 시작해 그날 쓴 만큼 흐른다.
 *  ⚠️ 자정을 넘기지 않는다 — 하루 근무는 길어야 여덟 시간이라 넘길 일이 없고,
 *     넘긴다면 그것은 `spendTime`이 날을 안 넘긴 버그다. */
export function formatClock(spent: number) {
  const t = WORK_START + spent
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

/** 요일 인덱스(0=월) → 이름. ⚠️ `WEEKDAYS`가 정본이다 — 화면마다 배열을 다시 적지 마라. */
export const dayName = (day: number) => WEEKDAYS[day] ?? WEEKDAYS[0]

/** 주차 + 요일 → **그 하루의 날짜**. 한 주가 이레라 요일이 곧 그 주 안의 날짜 칸이다.
 *
 * ⚠️ `formatDate`(주의 첫날·마지막 날)와 **다른 함수다** — 저쪽은 마감처럼 "그 주"를
 *    말하는 값이 쓰고, 이쪽은 "지금 며칠인가"를 말한다. 둘을 합치면 마감 표기가 요일에
 *    끌려다닌다. */
export function formatDayDate(week: number, day: number) {
  const { month, weekOfMonth } = toCalendar(week)
  return `${month}월 ${(weekOfMonth - 1) * 7 + day + 1}일(${dayName(day)})`
}
