import { createPortal } from 'react-dom'
import { OVER_TEXT, survivedText } from '../systems/gameover'
import { formatSavedAt, readSlots } from '../systems/save'
import { useGame } from '../store'

/** 게임이 끝났을 때 덮는 화면. **끝나는 길은 파산과 폐업 둘뿐이다**(설계 결정표).
 *
 * ⚠️ 창이 아니다(공용 `Window` 미사용) — 닫거나 옮길 수 있으면 끝난 판을 계속 만질 수
 *    있다. `Confirm`과 같은 포털이고 **맨 앞 층**(`--z-over`)에 선다.
 *
 * ⚠️ **점수도 도감도 적지 않는다**(설계 결정표: 엔딩·도감 없음). 남는 기록은 몇 주
 *    버텼는가 하나이고, 나머지 자리는 왜 끝났는지와 다시 시작하는 길이 차지한다.
 *
 * ⚠️ 여기서 나가는 길은 **새 게임 하나**가 아니다 — 슬롯에 남겨 둔 판이 있으면 거기서
 *    이어야 한다. 그렇다고 "시작 메뉴에서 불러오라"고 **안내만 하면 안 된다**: 이 스크림이
 *    `--z-over`(맨 앞 층)라 작업 표시줄도 시작 메뉴도 **누를 수가 없다**(그런 채로
 *    굴러갔다). 그래서 불러오기를 **여기서 직접** 진다. */
export function GameOver() {
  const over = useGame((s) => s.over)
  const newGame = useGame((s) => s.newGame)
  const loadSlot = useGame((s) => s.loadSlot)
  // 저장소를 읽는 것은 `systems/save.ts` 하나다(시작 메뉴와 같은 목록을 본다).
  const slots = readSlots()

  if (!over) return null
  const { title, why } = OVER_TEXT[over.kind]

  return createPortal(
    <div className="over" role="dialog" aria-modal="true" aria-label={title}>
      <div className="over__panel">
        <p className="over__title">{title}</p>
        <p className="over__why">{why}</p>
        {/* 유일한 기록이다. 숫자가 하나뿐이라야 다음 판의 목표가 또렷해진다. */}
        <p className="over__survived">{survivedText(over.week)}</p>
        {/* ⚠️ 남겨 둔 칸이 **있을 때만** 그린다 — 빈 칸을 흐리게 세워 두면 누를 수 없는
            버튼이 늘어난다(이 리포의 규칙). 되돌아갈 자리가 없으면 새 게임뿐인 것이 맞다. */}
        {slots.some(Boolean) && (
          <>
            <p className="over__note">남겨 둔 판에서 이어서 할 수 있다.</p>
            <ul className="over__slots">
              {slots.map((slot, i) =>
                slot ? (
                  <li key={i}>
                    <button
                      type="button"
                      className="over__slot"
                      onClick={() => loadSlot(i + 1)}
                    >
                      <span>슬롯 {i + 1}</span>
                      <span className="over__slot-when">{formatSavedAt(slot.savedAt)}</span>
                    </button>
                  </li>
                ) : null,
              )}
            </ul>
          </>
        )}
        <button type="button" className="over__btn" onClick={newGame}>
          새 게임
        </button>
      </div>
    </div>,
    document.body,
  )
}
