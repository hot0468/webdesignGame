import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { INTRO, SPOT_GAP, SPOT_PAD } from '../data/intro'
import { useGame } from '../store'

/** 첫 판에서 한 번 도는 소개. **화면을 어둡게 덮고 말하는 자리만 뚫는다**(핀라이트).
 *
 * ⚠️ 어둠은 오버레이 한 장이 아니라 **구멍 하나의 거대한 box-shadow**다. 마스크·SVG·
 *    네 장의 사각형 없이 구멍 하나로 끝나고, 둥근 모서리도 `border-radius`가 그대로 준다.
 *
 * ⚠️ **판마다 한 번뿐이다** — 다 보거나 건너뛰면 `seenIntro`가 켜지고 다시 뜨지 않는다
 *    (새 게임을 시작하면 다시 켜진다).
 *
 * ⚠️ 비추는 자리는 `data/intro.ts`의 `target`이 정한다. 못 찾으면 그 장은 **가운데 카드**로
 *    떨어진다 — 셀렉터 하나가 어긋났다고 소개가 통째로 죽으면 안 된다.
 *
 * ⚠️ 대상은 **읽는 자리이지 누르는 자리가 아니다**. 구멍은 `pointer-events: none`이라
 *    아래 버튼이 눌리지 않는다 — 소개 중에 창이 열리면 다음 장의 조준이 어긋난다. */
export function Intro() {
  const seen = useGame((s) => s.seenIntro)
  const finishIntro = useGame((s) => s.finishIntro)
  const [page, setPage] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const card = INTRO[page]!
  const target = 'target' in card ? card.target : undefined

  // ⚠️ 그리기 **전에** 잰다(`useLayoutEffect`) — 한 프레임이라도 엉뚱한 자리에 카드가
  //    서면 소개가 화면 밖에서 튀어 들어오는 것처럼 보인다.
  // ⚠️ **카드 크기도 재서** 자리를 정한다: 대상이 화면 높이를 거의 다 쓰면(프로그램 줄)
  //    위아래 어느 쪽에도 공간이 없어, 짐작한 높이로 뒤집으면 화면을 뚫고 나간다(겪었다).
  useLayoutEffect(() => {
    if (seen) return
    const measure = () => {
      const el = target ? document.querySelector(target) : null
      const r = el?.getBoundingClientRect() ?? null
      setRect(r)

      const c = cardRef.current?.getBoundingClientRect()
      if (!r || !c) return setPos(null)

      // 아래 → 위 → 옆 순으로 자리를 찾는다. 셋 다 안 되면 clamp가 화면 안으로 끌어온다.
      const fitsBelow = r.bottom + SPOT_GAP + c.height <= innerHeight
      const fitsAbove = r.top - SPOT_GAP - c.height >= 0
      const beside =
        r.right + SPOT_GAP + c.width <= innerWidth ? r.right + SPOT_GAP : r.left - SPOT_GAP - c.width
      const top = fitsBelow ? r.bottom + SPOT_GAP : fitsAbove ? r.top - SPOT_GAP - c.height : r.top
      const left = fitsBelow || fitsAbove ? r.left : beside

      const clamp = (v: number, max: number) => Math.max(SPOT_GAP, Math.min(v, max - SPOT_GAP))
      setPos({ top: clamp(top, innerHeight - c.height), left: clamp(left, innerWidth - c.width) })
    }
    measure()
    // 창 크기가 바뀌면 구멍도 카드도 제자리를 잃는다 — 그때 다시 잰다.
    addEventListener('resize', measure)
    return () => removeEventListener('resize', measure)
  }, [target, seen, page])

  // Escape로도 닫힌다(묻는 창과 같은 손버릇).
  useEffect(() => {
    if (seen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finishIntro()
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [seen, finishIntro])

  if (seen) return null

  const last = page === INTRO.length - 1

  return createPortal(
    <div className="spot" role="dialog" aria-modal="true" aria-label="게임 소개">
      {/* 구멍. ⚠️ 이 한 장이 곧 어둠이다(`box-shadow`가 바깥을 전부 덮는다). */}
      {rect && (
        <div
          className="spot__hole"
          aria-hidden="true"
          style={{
            top: rect.top - SPOT_PAD,
            left: rect.left - SPOT_PAD,
            width: rect.width + SPOT_PAD * 2,
            height: rect.height + SPOT_PAD * 2,
          }}
        />
      )}
      {/* 대상이 없는 장(환영)은 화면 전체를 덮는다 — 구멍이 없으니 어둠도 따로 깐다. */}
      {!rect && <div className="spot__dim" aria-hidden="true" />}

      <div
        ref={cardRef}
        className={`confirm__panel spot__card${pos ? '' : ' spot__card--center'}`}
        style={pos ?? undefined}
      >
        <p className="intro__step">
          {page + 1} / {INTRO.length}
        </p>
        <p className="confirm__title">{card.title}</p>
        <p className="confirm__note intro__body">{card.body}</p>

        <div className="confirm__buttons intro__buttons">
          <button
            type="button"
            className="confirm__btn confirm__btn--go"
            onClick={() => (last ? finishIntro() : setPage(page + 1))}
          >
            {last ? '시작하기' : '다음'}
          </button>
          {/* ⚠️ **건너뛰기는 늘 있다** — 두 번째 판을 시작한 사람에게 다섯 장을 다시
              넘기게 하면 소개가 벌이 된다. */}
          {!last && (
            <button type="button" className="confirm__btn" onClick={() => finishIntro()}>
              건너뛰기
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
