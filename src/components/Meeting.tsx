import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { findKeyword, MEETING_LINE_MS, type KeywordId } from '../data/keywords'
import { meetingScript } from '../systems/keywords'

/** 클라이언트 미팅 창. **대화가 여기서 오간다** — 피그마가 아니라 미팅 요청 글에서 열린다.
 *
 * ⚠️ 알아낸 키워드는 **열기 전에 이미 정해져 있다**(`store.holdMeeting`이 시간을 물고
 *    기록한다). 이 창은 그 결과를 *대화의 모습으로* 보여 줄 뿐이라, 도중에 닫아도 잃는
 *    것이 없다 — 애니메이션이 게임 상태를 만들면 창을 닫는 손이 결과를 바꾸게 된다.
 *
 * ⚠️ `body`로 **포털**한다(계기판·창 위에 서야 한다). 묻는 창(`Hud`의 `Confirm`)과 같은 이유.
 *
 * ⚠️ `prefers-reduced-motion`에서는 **한 줄씩 뜨지 않고 한 번에 다 뜬다**. 기다리는 것은
 *    연출이지 정보가 아니고, 실측 하네스도 그 길로 화면을 잰다. */
export function Meeting({
  from,
  revealed,
  onClose,
}: {
  from: string
  revealed: readonly KeywordId[]
  onClose: () => void
}) {
  const lines = meetingScript(from, revealed)
  const reduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  /** 지금까지 뜬 줄 수. 다 뜨면 결과가 선다. */
  const [shown, setShown] = useState(reduced ? lines.length : 1)
  const done = shown >= lines.length

  useEffect(() => {
    if (done) return
    const t = setTimeout(() => setShown((n) => n + 1), MEETING_LINE_MS)
    return () => clearTimeout(t)
  }, [shown, done])

  // ⚠️ 새 말은 **맨 아래**에 붙는다 — 따라 내리지 않으면 마지막 대사가 접힌 채로 끝난다
  //    (건너뛰기로 한 번에 다 뜰 때가 특히 그렇다).
  const log = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = log.current
    if (el) el.scrollTop = el.scrollHeight
  }, [shown])

  return createPortal(
    <div className="confirm" role="dialog" aria-modal="true" aria-label={`${from} 미팅`}>
      <div className="confirm__panel meet">
        <p className="confirm__title">{from} 미팅</p>

        {/* ⚠️ 말이 늘어나는 자리다 — 높이를 고정해 결과 칸이 아래에서 튀어 오르지 않게 한다. */}
        <div className="meet__log" ref={log} aria-live="polite">
          {lines.slice(0, shown).map((l, i) => (
            <p key={i} className={`meet__line meet__line--${l.who}`}>
              {l.text}
            </p>
          ))}
          {!done && (
            <p className="meet__line meet__line--typing" aria-hidden="true">
              …
            </p>
          )}
        </div>

        {/* 결과는 **대화가 끝나야** 선다 — 먼저 보이면 대화를 볼 이유가 없다. */}
        {done && (
          <div className="meet__result">
            <p className="meet__result-head">알아낸 키워드</p>
            {revealed.length === 0 ? (
              <p className="confirm__note">
                이번엔 건진 게 없다. 기획력이 오르면 더 알아들을 수 있다.
              </p>
            ) : (
              <>
                <ul className="meet__keys">
                  {revealed.map((id) => (
                    <li key={id} className="meet__key">
                      {findKeyword(id).label}
                    </li>
                  ))}
                </ul>
                <p className="confirm__note">
                  피그마에서 이 업무의 시안을 만들 때 <b>확인됨</b>으로 표시된다.
                </p>
              </>
            )}
          </div>
        )}

        {/* ⚠️ 건너뛰기는 **닫기가 아니다** — 대화를 접어도 결과는 봐야 한다.
            닫기와 같은 버튼으로 두면 급한 손이 알아낸 것을 못 보고 창을 없앤다. */}
        <div className="confirm__buttons">
          <button
            type="button"
            className="confirm__btn confirm__btn--go"
            onClick={() => (done ? onClose() : setShown(lines.length))}
          >
            {done ? '확인' : '건너뛰기'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
