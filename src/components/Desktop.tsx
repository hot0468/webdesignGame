import type { ReactNode } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { PROGRAMS } from '../data/programs'
import { useGame } from '../store'
import { Hud } from './Hud'
import { Taskbar } from './Taskbar'

/** 바탕화면. 배경 + 아이콘 그리드. 열린 창은 children으로 위에 얹는다.
 *
 * ⚠️ 그릴 아이콘은 PROGRAMS에서만 온다 — 창이 열리지 않는 프로그램은 아직 아이콘도 없다. */
export function Desktop({ children }: { children: ReactNode }) {
  const openWindow = useGame((s) => s.openWindow)

  return (
    <div className="desktop">
      <div className="desktop__icons">
        {PROGRAMS.map((p) => (
          <button key={p.id} type="button" className="desktop-icon" onClick={() => openWindow(p.id)}>
            {/* 다색 아이콘이다 — CSS color를 입히지 않는다 */}
            <AppIcon name={p.icon} size={44} />
            <span>{p.title}</span>
          </button>
        ))}
      </div>
      {/* 창 레이어. inset:0 오버레이라서 pointer-events를 끄지 않으면 아이콘 클릭을 삼킨다. */}
      <div className="desktop__windows">{children}</div>
      {/* 스탯 패널도 작업 표시줄과 같은 이유로 창 레이어 밖이다 — 항상 보이는 계기판이다. */}
      <Hud />
      {/* 작업 표시줄은 창 레이어 **밖**에 둔다 — 안에 넣으면 z-index가 창 레이어의
          스택 컨텍스트에 갇혀 --z-taskbar가 뜻을 잃는다. */}
      <Taskbar />
    </div>
  )
}
