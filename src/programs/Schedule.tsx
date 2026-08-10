import { MONTHS_PER_YEAR, WEEKS_PER_MONTH } from '../data/game'
import { useGame } from '../store'

/** `일정` 창. 스토어의 주차만 읽어 달력으로 환산해 보여주는 순수 표시 컴포넌트다.
 *
 * ⚠️ 주말 근무 선택은 스펙에 있지만 시스템이 아직 없다 — 동작하지 않는 버튼을 그리지 않는다.
 * 환산은 가장 단순한 해석을 쓴다: 1주차 = 1년 1월 1째 주, 한 달은 WEEKS_PER_MONTH주 고정.
 * (실제 달력의 불규칙한 주 경계를 게임에 들이면 정산 주차가 달마다 흔들린다) */
export function Schedule() {
  const week = useGame((s) => s.week)

  const monthIndex = Math.floor((week - 1) / WEEKS_PER_MONTH)
  const year = Math.floor(monthIndex / MONTHS_PER_YEAR) + 1
  const month = (monthIndex % MONTHS_PER_YEAR) + 1
  const weekOfMonth = ((week - 1) % WEEKS_PER_MONTH) + 1

  return (
    <div>
      <p className="schedule__month">
        {year}년 {month}월
      </p>
      <p className="schedule__week">{weekOfMonth}째 주</p>
      <p className="schedule__note">통산 {week}주차 · 한 턴은 한 주다</p>
    </div>
  )
}
