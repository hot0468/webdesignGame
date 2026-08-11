import { WEEKDAYS, WEEKEND_COUNT, WEEKS_PER_MONTH } from '../data/game'
import { toCalendar } from '../systems/calendar'
import { useGame } from '../store'

/** `일정` 창. 스토어의 주차만 읽어 그 달의 달력을 그리는 순수 표시 컴포넌트다.
 *
 * ⚠️ 주말 근무 선택은 스펙에 있지만 시스템이 아직 없다 — 칸을 버튼으로 만들지 않는다.
 *    주말 칸을 따로 칠하는 것은 "여기가 고를 수 있는 이틀"을 미리 보여 두는 것이다.
 *
 * ⚠️ 날짜는 이 게임의 한 달(= WEEKS_PER_MONTH주)을 그대로 센 것이다. 실제 달력처럼
 *    달마다 28~31일로 흔들리게 만들지 마라 — 월말 정산 주차가 같이 흔들린다. */
export function Schedule() {
  const week = useGame((s) => s.week)
  const { year, month, weekOfMonth } = toCalendar(week)

  const isWeekend = (day: number) => day >= WEEKDAYS.length - WEEKEND_COUNT

  return (
    <div>
      <p className="schedule__month">
        {year}년 {month}월
      </p>

      <div className="cal">
        <div className="cal__row cal__head">
          {WEEKDAYS.map((d, i) => (
            <span key={d} className={`cal__cell${isWeekend(i) ? ' cal__cell--weekend' : ''}`}>
              {d}
            </span>
          ))}
        </div>

        {Array.from({ length: WEEKS_PER_MONTH }, (_, w) => (
          <div
            key={w}
            className={`cal__row${w + 1 === weekOfMonth ? ' cal__row--now' : ''}`}
            aria-current={w + 1 === weekOfMonth ? 'date' : undefined}
          >
            {WEEKDAYS.map((d, i) => (
              <span key={d} className={`cal__cell${isWeekend(i) ? ' cal__cell--weekend' : ''}`}>
                {w * WEEKDAYS.length + i + 1}
              </span>
            ))}
          </div>
        ))}
      </div>

      <p className="schedule__note">
        {weekOfMonth}째 주 진행 중 · 통산 {week}주차 · 한 턴은 한 주다
      </p>
    </div>
  )
}
