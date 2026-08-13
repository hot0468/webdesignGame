import { createPortal } from 'react-dom'
import { OVER_TEXT, survivedText } from '../systems/gameover'
import { useGame } from '../store'

/** 게임이 끝났을 때 덮는 화면. **끝나는 길은 파산과 폐업 둘뿐이다**(설계 결정표).
 *
 * ⚠️ 창이 아니다(공용 `Window` 미사용) — 닫거나 옮길 수 있으면 끝난 판을 계속 만질 수
 *    있다. `Confirm`과 같은 포털이고 **맨 앞 층**(`--z-over`)에 선다.
 *
 * ⚠️ **점수도 도감도 적지 않는다**(설계 결정표: 엔딩·도감 없음). 남는 기록은 몇 주
 *    버텼는가 하나이고, 나머지 자리는 왜 끝났는지와 다시 시작하는 길이 차지한다.
 *
 * ⚠️ 여기서 나가는 길은 **새 게임 하나**로 두지 않는다 — 슬롯에 남겨 둔 판이 있으면
 *    거기서 이어야 하므로 시작 메뉴를 함께 안내한다(불러오기는 그쪽이 진다). */
export function GameOver() {
  const over = useGame((s) => s.over)
  const newGame = useGame((s) => s.newGame)

  if (!over) return null
  const { title, why } = OVER_TEXT[over.kind]

  return createPortal(
    <div className="over" role="dialog" aria-modal="true" aria-label={title}>
      <div className="over__panel">
        <p className="over__title">{title}</p>
        <p className="over__why">{why}</p>
        {/* 유일한 기록이다. 숫자가 하나뿐이라야 다음 판의 목표가 또렷해진다. */}
        <p className="over__survived">{survivedText(over.week)}</p>
        <button type="button" className="over__btn" onClick={newGame}>
          새 게임
        </button>
        <p className="over__note">
          남겨 둔 판이 있으면 작업 표시줄의 <b>시작</b>에서 불러올 수 있다.
        </p>
      </div>
    </div>,
    document.body,
  )
}
