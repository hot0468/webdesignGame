import { AppIcon } from '../icons/AppIcon'
import { PROGRAM_ICONS, STAT_ICONS } from '../data/icons'
import {
  DEADLINE_URGENT_WEEKS,
  WEEKDAYS,
  WEEKEND_COUNT,
  WEEKEND_MENTAL_COST,
  WEEKS_PER_MONTH,
  mentalPenalty,
} from '../data/game'
import { formatDate, toCalendar } from '../systems/calendar'
import { weekendEvent } from '../systems/weekend'
import { useGame } from '../store'

/** `일정` 창. 그 달의 달력 + **이번 주말에 일할지 고르는 자리**다.
 *
 * ⚠️ 주말 근무는 **선택이고, 여는 것은 늘 돌발 의뢰다**(스펙: "확률적으로 주말에 갑자기
 *    클라이언트 연락이 오는 돌발 이벤트"). 그래서 의뢰가 없는 주말에는 판을 그리지 않는다 —
 *    동작하지 않는 컨트롤을 그리지 않는다는 규칙이 여기 그대로 적용된다.
 * ⚠️ 달력 칸 자체는 여전히 **버튼이 아니다.** 고르는 것은 요일이 아니라 "이번 주말"
 *    하나뿐이라, 칸 열넷을 누를 수 있게 만들면 무엇이 실제 선택인지가 흐려진다.
 *
 * ⚠️ 날짜는 이 게임의 한 달(= WEEKS_PER_MONTH주)을 그대로 센 것이다. 실제 달력처럼
 *    달마다 28~31일로 흔들리게 만들지 마라 — 월말 정산 주차가 같이 흔들린다. */
export function Schedule() {
  const week = useGame((s) => s.week)
  const jobs = useGame((s) => s.jobs)
  const trainings = useGame((s) => s.trainings)
  const employees = useGame((s) => s.employees)
  const { year, month, weekOfMonth } = toCalendar(week)

  const isWeekend = (day: number) => day >= WEEKDAYS.length - WEEKEND_COUNT
  /** 그리는 달의 첫 주. 줄 번호 → 통산 주차 환산의 기준이다. */
  const firstWeek = week - weekOfMonth + 1
  const nameOf = (id: string) => employees.find((e) => e.id === id)?.name ?? '직원'

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

        {Array.from({ length: WEEKS_PER_MONTH }, (_, w) => {
          const rowWeek = firstWeek + w
          // ⚠️ 마감·휴무는 **주차 단위로** 붙는다 — 이 게임의 시간은 한 주가 최소 눈금이라
          //    날짜 칸 하나에 매달면 없는 정밀도를 지어내게 된다. 날짜는 `formatDate`가
          //    말하는 그 주의 마지막 날이고(마감 표기와 같은 함수), 자리는 줄이다.
          const due = jobs.filter((j) => !j.done && j.due === rowWeek)
          const leave = trainings.filter(
            (t) => t.kind === 'leave' && rowWeek >= t.from && rowWeek < t.doneWeek,
          )
          return (
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

              {(due.length > 0 || leave.length > 0) && (
                <ul className="cal__marks">
                  {due.map((j) => (
                    <li
                      key={j.id}
                      className={`cal__mark${rowWeek - week <= DEADLINE_URGENT_WEEKS ? ' cal__mark--soon' : ''}`}
                    >
                      {formatDate(j.due)} 마감 · {j.title}
                    </li>
                  ))}
                  {leave.map((t) => (
                    <li key={t.employeeId} className="cal__mark">
                      휴무 · {nameOf(t.employeeId)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      <Weekend />

      <p className="schedule__note">
        {weekOfMonth}째 주 진행 중 · 통산 {week}주차 · 한 턴은 한 주다
      </p>
    </div>
  )
}

/** 이번 주말 판. **돌발 의뢰가 있을 때만 선다.**
 *
 * ⚠️ 의뢰는 **주차 하나에서 파생한다**(`systems/weekend.ts` — 저장하지 않는다). 창을
 *    닫았다 열어도 같은 주면 같은 의뢰다.
 * ⚠️ 대가(정신력)와 그 대가가 다음 주에 무엇이 되는지를 **누르기 전에** 적는다 —
 *    행동력이 깎이는 것은 다음 주에 일어나므로, 그때 가서 이유를 알면 늦다. */
function Weekend() {
  const week = useGame((s) => s.week)
  const mental = useGame((s) => s.mental)
  const worked = useGame((s) => s.weekendWorked.includes(s.week))
  const workWeekend = useGame((s) => s.workWeekend)

  const event = weekendEvent(week)
  if (!event) return null

  /** 일했을 때의 정신력과, 그것이 다음 주 행동력에서 깎을 칸. */
  const after = Math.max(0, mental - WEEKEND_MENTAL_COST)
  const lose = mentalPenalty(after)

  return (
    <section className="weekend" aria-label="이번 주말">
      <p className="weekend__head">
        <AppIcon name={PROGRAM_ICONS.crisis} />
        주말에 연락이 왔다
      </p>

      <p className="weekend__from">
        {event.from} · 마감 {formatDate(week + event.dueWeeks)}
      </p>
      <p className="weekend__subject">{event.subject}</p>

      {worked ? (
        // ⚠️ 판을 지우지 않는다 — 무엇을 받았는지가 사라지면 정신력이 왜 줄었는지
        //    되짚을 자리가 없다. 이미 한 일은 버튼 대신 사실로 적는다.
        <p className="weekend__done">
          <AppIcon name={STAT_ICONS.jobDone} />
          이번 주말은 일했다 · 업무목록에 올랐다
        </p>
      ) : (
        <>
          <button type="button" className="weekend__go" onClick={workWeekend}>
            주말에 일한다 (정신력 −{WEEKEND_MENTAL_COST})
          </button>
          {/* 안 고르는 것도 선택이다 — 그때 무슨 일이 일어나는지(아무 일도 안 난다)를
              적어야 "넘겨도 된다"가 읽힌다. */}
          <p className="weekend__note">
            <AppIcon name={STAT_ICONS.mental} />
            일하면 정신력 {mental} → {after}
            {lose > 0 && ` · 다음 주 행동력 상한 −${lose}`}. 쉬면 이 의뢰만 놓친다.
          </p>
        </>
      )}
    </section>
  )
}
