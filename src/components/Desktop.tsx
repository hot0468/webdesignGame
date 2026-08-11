import type { ReactNode } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { PROGRAMS } from '../data/programs'
import { unreadCount } from '../data/inbox'
import { useGame } from '../store'
import { Hud } from './Hud'
import { Taskbar } from './Taskbar'

/** 바탕화면. 배경 + 아이콘 두 줄. 열린 창은 children으로 위에 얹는다.
 *
 * ⚠️ 그릴 아이콘은 PROGRAMS에서만 온다 — 창이 열리지 않는 프로그램은 아직 아이콘도 없다.
 * ⚠️ 어느 줄에 서는지는 **데이터(`col`)가 정한다.** 여기서 id를 나열해 가르면 프로그램이
 *    늘 때마다 두 곳을 고쳐야 하고, 한쪽을 잊으면 아이콘이 조용히 사라진다. */
export function Desktop({ children }: { children: ReactNode }) {
  const openWindow = useGame((s) => s.openWindow)
  const readIds = useGame((s) => s.readIds)

  return (
    <div className="desktop">
      <div className="desktop__icons">
        {(['left', 'right'] as const).map((col) => (
          <div key={col} className="desktop__col">
            {PROGRAMS.filter((p) => p.col === col).map((p) => {
              const unread = 'badge' in p ? unreadCount(p.badge, readIds) : 0
              return (
                <button
                  key={p.id}
                  type="button"
                  className="desktop-icon"
                  // 뱃지 숫자만으로는 스크린리더에서 "메일 3"으로 읽혀 뜻이 안 선다.
                  aria-label={unread ? `${p.title}, 새 글 ${unread}개` : undefined}
                  onClick={() => openWindow(p.id)}
                >
                  {/* 다색 아이콘이다 — CSS color를 입히지 않는다 */}
                  <AppIcon name={p.icon} size={44} />
                  <span>{p.title}</span>
                  {unread > 0 && (
                    <span className="badge badge--corner" aria-hidden="true">
                      {unread}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
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
