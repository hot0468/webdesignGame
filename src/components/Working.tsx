import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { WORK_ANIM_MS, type Grade } from '../data/game'
import { Thumb, type ThumbKind } from './Thumb'

/** 공정을 돌릴 때 뜨는 작업 창. 막대가 끝까지 차면 **완성되었다!**가 뜬다.
 *
 * ⚠️ **결과는 열기 전에 이미 정해져 있다**(스토어의 제작 액션이 등급까지 굳혀 놓는다).
 *    이 창은 그것을 보여 줄 뿐이라 도중에 닫아도 잃는 것이 없다 — 연출이 게임 상태를
 *    만들면 창을 닫는 손이 결과를 바꾼다(`Meeting.tsx`와 같은 규칙).
 *
 * ⚠️ `body`로 **포털**한다(계기판·창 위에 서야 한다). 묻는 창과 같은 층·같은 판을 쓴다.
 *
 * ⚠️ `prefers-reduced-motion`에서는 **기다리지 않고 바로 완성**이다. 기다리는 것은
 *    연출이지 정보가 아니고, 실측 하네스도 그 길로 화면을 잰다. */
export function Working({
  title,
  grade,
  thumb,
  onClose,
}: {
  /** 무엇을 만드는가(`시안`·`팝업 이미지`처럼 결과물의 이름). */
  title: string
  /** 만든 것의 등급. 퍼블리싱처럼 등급이 없는 공정은 넘기지 않는다. */
  grade?: Grade
  /** 만든 것의 초상(종류 + 파일 id). 넘기면 완성 순간에 그림이 선다 —
   *  등급 글자보다 이것이 먼저 "잘 나왔다/망했다"를 말한다. */
  thumb?: { kind: ThumbKind; seed: string }
  onClose: () => void
}) {
  const reduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const [fill, setFill] = useState(reduced ? 100 : 0)
  const [done, setDone] = useState(reduced)

  useEffect(() => {
    if (reduced) return
    // 다음 프레임에 폭을 바꿔야 CSS 전환이 걸린다(같은 프레임에 0→100이면 그냥 100이다).
    const raf = requestAnimationFrame(() => setFill(100))
    const t = setTimeout(() => setDone(true), WORK_ANIM_MS)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [reduced])

  return createPortal(
    <div className="confirm" role="dialog" aria-modal="true" aria-label={`${title} 작업`}>
      <div className="confirm__panel work">
        <p className="confirm__title">{done ? '완성되었다!' : `${title} 만드는 중…`}</p>

        <div
          className="work__bar"
          role="progressbar"
          aria-valuenow={fill}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* 전환 시간의 정본은 `data/game.ts`다 — CSS에 같은 값을 또 적지 않는다. */}
          <div
            className="work__fill"
            style={{ width: `${fill}%`, transitionDuration: `${WORK_ANIM_MS}ms` }}
          />
        </div>

        {/* ⚠️ 조사를 붙이지 않는다 — 이름이 `시안`·`화면정의서`처럼 받침이 갈려
            "이(가)" 같은 군더더기가 생긴다. */}
        {done && thumb && (
          <span className="work__thumb">
            <Thumb kind={thumb.kind} grade={grade} seed={thumb.seed} />
          </span>
        )}
        {done && (
          <p className="confirm__note work__result">
            <b>{title}</b> 완성
            {grade && (
              <>
                {' '}
                — 등급 <b className="work__grade">{grade}</b>
              </>
            )}
          </p>
        )}

        {/* ⚠️ 다 차기 전에는 닫을 수 없다 — 결과를 못 보고 닫으면 무엇이 나왔는지 알 자리가
            사라진다(등급은 파일 목록에 남지만 그 자리는 이 창이 아니다). */}
        <div className="confirm__buttons">
          <button
            type="button"
            className="confirm__btn confirm__btn--go"
            disabled={!done}
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** 작업 창을 띄우는 한 벌. **공정을 돌리는 창 넷이 같은 문장을 쓴다** —
 *  창마다 상태와 마크업을 다시 적으면 연출이 창마다 달라진다.
 *
 * ```tsx
 * const work = useWorking()
 * onClick={() => { makeDraft(...); work.show({ title: '시안', grade: 방금등급 }) }}
 * ...
 * {work.view}
 * ``` */
export function useWorking() {
  const [work, setWork] = useState<{
    title: string
    grade?: Grade
    thumb?: { kind: ThumbKind; seed: string }
  } | null>(null)
  return {
    show: (w: { title: string; grade?: Grade; thumb?: { kind: ThumbKind; seed: string } }) =>
      setWork(w),
    view: work ? <Working {...work} onClose={() => setWork(null)} /> : null,
  }
}
