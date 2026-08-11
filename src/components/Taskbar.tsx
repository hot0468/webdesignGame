import { findProgram } from '../data/programs'
import { focusedWindowId, useGame } from '../store'

/** 작업 표시줄 = 열린 창 목록. 주차와 스탯은 `Hud`가 오른쪽 위에서 따로 진다.
 *
 * ⚠️ 시작 버튼은 없다 — 열 메뉴가 없는 버튼은 동작하지 않는 컨트롤이다. */
export function Taskbar() {
  const windows = useGame((s) => s.windows)
  const focusWindow = useGame((s) => s.focusWindow)
  const focused = focusedWindowId(windows)

  return (
    <div className="taskbar">
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
