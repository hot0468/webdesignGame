import { AppIcon } from '../icons/AppIcon'
import { SHELL_ICONS } from '../data/icons'
import { findProgram } from '../data/programs'
import { toCalendar } from '../systems/calendar'
import { focusedWindowId, useGame } from '../store'

/** 작업 표시줄 = 왼쪽에 지금 주차, 그 오른쪽에 열린 창 목록.
 *
 * ⚠️ 주차는 스탯 판(`Hud`)에 두지 않는다. 시간은 다른 스탯처럼 오르내리는 값이 아니라
 *    한 방향으로만 가는 축이고, OS 셸에서 시계가 사는 자리가 작업 표시줄이다.
 *
 * ⚠️ 시작 버튼은 없다 — 열 메뉴가 없는 버튼은 동작하지 않는 컨트롤이다. */
export function Taskbar() {
  const windows = useGame((s) => s.windows)
  const week = useGame((s) => s.week)
  const focusWindow = useGame((s) => s.focusWindow)
  const focused = focusedWindowId(windows)
  const { year, month, weekOfMonth } = toCalendar(week)

  return (
    <div className="taskbar">
      <p className="taskbar__week">
        <AppIcon name={SHELL_ICONS.week} />
        {year}년 {month}월 {weekOfMonth}째 주
      </p>

      <div className="taskbar__windows">
        {windows.map((w) => (
          <button
            key={w.id}
            type="button"
            className={`taskbar__item${w.id === focused ? ' taskbar__item--active' : ''}`}
            onClick={() => focusWindow(w.id)}
          >
            {findProgram(w.id).title}
          </button>
        ))}
      </div>
    </div>
  )
}
