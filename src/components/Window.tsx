import { useEffect, useRef, type ReactNode } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { SHELL_ICONS } from '../data/icons'
import type { ProgramId } from '../data/programs'
import { focusedWindowId, useGame } from '../store'

type Props = {
  id: ProgramId
  title: string
  /** 사이드바 메뉴가 있는 백오피스형 창. 폭 출처는 PROGRAMS의 `wide`다. */
  wide?: boolean
  children: ReactNode
}

/** 모든 창 UI가 쓰는 공용 창. 타이틀바 드래그 · 닫기 · 클릭 포커스 · Escape 닫기.
 *
 * ⚠️ 이동은 transform으로만 한다. top/left/width/height를 애니메이션하면 매 프레임
 *    레이아웃을 다시 계산해 드래그가 끊긴다. */
export function Window({ id, title, wide, children }: Props) {
  const win = useGame((s) => s.windows.find((w) => w.id === id))
  const focused = useGame((s) => focusedWindowId(s.windows)) === id
  const { closeWindow, focusWindow, moveWindow } = useGame.getState()

  /** 포인터를 잡은 지점과 창 좌상단의 차이. null이면 드래그 중이 아니다. */
  const grab = useRef<{ dx: number; dy: number } | null>(null)

  useEffect(() => {
    if (!focused) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWindow(id)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [focused, id, closeWindow])

  if (!win) return null

  return (
    <section
      className={`window${wide ? ' window--wide' : ''}${focused ? ' window--focused' : ''}`}
      style={{ transform: `translate(${win.x}px, ${win.y}px)`, zIndex: win.z }}
      onPointerDown={() => focusWindow(id)}
      aria-label={title}
    >
      <div
        className="window__titlebar"
        onPointerDown={(e) => {
          // 닫기 버튼을 누른 것은 드래그가 아니다.
          if ((e.target as HTMLElement).closest('button')) return
          grab.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!grab.current) return
          // 상한 clamp는 스토어가 한다 — 화면 크기는 DOM만 알므로 여기서 넘긴다.
          moveWindow(id, e.clientX - grab.current.dx, e.clientY - grab.current.dy, {
            w: window.innerWidth,
            h: window.innerHeight,
          })
        }}
        onPointerUp={() => {
          grab.current = null
        }}
        onPointerCancel={() => {
          grab.current = null
        }}
      >
        <span className="window__title">{title}</span>
        <button
          type="button"
          className="window__close"
          aria-label={`${title} 창 닫기`}
          onClick={() => closeWindow(id)}
        >
          <AppIcon name={SHELL_ICONS.close} />
        </button>
      </div>
      <div className="window__body">{children}</div>
    </section>
  )
}
