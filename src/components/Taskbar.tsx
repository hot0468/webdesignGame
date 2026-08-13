import { findProgram } from '../data/programs'
import { focusedWindowId, useGame } from '../store'
import { StartMenu } from './StartMenu'

/** 작업 표시줄 = **시작 버튼 + 열린 창 목록**. 주차와 스탯은 `Hud`가 오른쪽 위에서 따로 진다.
 *
 * ⚠️ 시작 버튼이 지는 것은 **세이브뿐이다**(`StartMenu`). 프로그램 목록을 여기 또 만들지
 *    말 것 — 프로그램을 여는 자리는 바탕화면 아이콘 하나이고, 여는 길이 둘이면 어느 쪽이
 *    정본인지가 사라진다. 세이브는 바탕화면에 아이콘을 줄 만한 것이 아니라 여기 산다. */
export function Taskbar() {
  const windows = useGame((s) => s.windows)
  const focusWindow = useGame((s) => s.focusWindow)
  const focused = focusedWindowId(windows)

  return (
    <div className="taskbar">
      <StartMenu />
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
