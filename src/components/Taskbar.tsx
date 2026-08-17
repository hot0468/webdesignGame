import { AppIcon } from '../icons/AppIcon'
import { STAT_ICONS } from '../data/icons'
import { findProgram } from '../data/programs'
import { formatClock, formatHours } from '../systems/calendar'
import { focusedWindowId, useClock, useGame } from '../store'
import { Jobs, Stats } from './Hud'
import { StartMenu } from './StartMenu'

/** 작업 표시줄 = **시작 버튼 + 열린 창 목록**, 그리고 좁은 화면에서만 서는 **독 버튼 둘**.
 *
 * ⚠️ 시작 버튼이 지는 것은 **세이브뿐이다**(`StartMenu`). 프로그램 목록을 여기 또 만들지
 *    말 것 — 프로그램을 여는 자리는 바탕화면 아이콘 하나이고, 여는 길이 둘이면 어느 쪽이
 *    정본인지가 사라진다. 세이브는 바탕화면에 아이콘을 줄 만한 것이 아니라 여기 산다.
 *
 * ⚠️ **독 버튼은 좁은 화면 전용이다**(`index.css`가 숨긴다). 넓은 화면에서는 계기판이
 *    오른쪽 위에 늘 서 있으므로 같은 것을 여는 버튼이 둘이 된다. 좁은 화면에서는 창이
 *    전체화면이라 계기판이 가려지는데, **남은 시간을 보면서 공정을 고르는 것이 이 게임의
 *    핵심 판단이라** 그 값이 창 위에서도 닿아야 한다.
 *
 * ⚠️ 판을 두 벌로 그리지 않는다 — `Stats`·`Jobs`를 그대로 가져다 쓴다(`Hud`와 같은 것).
 *    스탯 줄이 늘거나 업무 표시가 바뀔 때 한쪽만 고치는 사고를 막는다. */
export function Taskbar() {
  const windows = useGame((s) => s.windows)
  const focusWindow = useGame((s) => s.focusWindow)
  const focused = focusedWindowId(windows)
  const clock = useClock()
  // 끝나지 않은 업무 수. ⚠️ 깨진 계약도 `done`이라 함께 빠진다 — 독 뱃지가 세는 것은
  //    "아직 손이 가야 하는 일"이고, 끝난 방식은 목록을 열어야 읽힌다.
  const open = useGame((s) => s.jobs.filter((j) => !j.done).length)

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

      {/* ⚠️ **네이티브 `popover`다**(React 19). 바깥을 누르면 닫히는 것도, 열린 창 위로
          올라서는 최상위 레이어도 브라우저가 준다 — 바깥 클릭 핸들러도 z-index 다툼도
          직접 만들지 마라(`Confirm`이 포털을 쓰는 이유가 여기서는 공짜다).
          ⚠️ 그래서 팝오버는 **`.taskbar` 안에 있어도 창에 가리지 않는다.** */}
      <div className="dock">
        {/* 값을 버튼에 그대로 적는다 — 시각은 열어 보지 않고도 읽혀야 하는 값이라
            (공정을 고를 때마다 본다) 팝오버를 여는 손짓조차 값이 된다. */}
        <button
          type="button"
          className="dock__btn"
          popoverTarget="dock-stats"
          aria-label={`스탯 열기 — ${formatClock(clock.spent)}, 오늘 ${formatHours(clock.today)} 남음`}
        >
          <AppIcon name={STAT_ICONS.ap} />
          {formatClock(clock.spent)}
        </button>
        <button
          type="button"
          className="dock__btn"
          popoverTarget="dock-jobs"
          aria-label={`업무목록 열기 — 진행 중 ${open}건`}
        >
          <AppIcon name={STAT_ICONS.jobs} />
          {open}
        </button>

        <div id="dock-stats" popover="auto" className="dock__pop">
          <Stats />
        </div>
        <div id="dock-jobs" popover="auto" className="dock__pop">
          <Jobs />
        </div>
      </div>
    </div>
  )
}
