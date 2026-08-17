import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AppIcon } from '../icons/AppIcon'
import { START_ICONS } from '../data/icons'
import { formatDate } from '../systems/calendar'
import { formatSavedAt, readSlots, type SaveSlot } from '../systems/save'
import { useGame } from '../store'

/** 시작 메뉴 — **세이브를 다루는 유일한 화면**이다.
 *
 * 자동저장(`webdi.save.v1`)은 늘 켜져 있고 판을 계속 덮는다. 여기 있는 세 칸은 그것과
 * 다른 것이다: **사람이 골라 남기는 되돌아갈 지점**이다. 그래서 자동저장을 끄거나
 * 되살리는 버튼은 여기 없다(끌 수 있는 자동저장은 안 켜진 것과 같다).
 *
 * ⚠️ 슬롯 목록은 **스토어가 아니라 저장소가 정본**이다(`store.ts`의 `slotsRevision` 주석) —
 *    슬롯을 스토어에 들이면 세이브 안에 세이브가 들어간다. 그 수가 바뀔 때 다시 읽는다.
 *
 * ⚠️ `body`로 **포털**한다. 작업 표시줄은 `--z-taskbar`라 그 안에 그리면 메뉴가 56px짜리
 *    막대 안에 갇히거나(overflow) 창 뒤로 들어간다 — `Hud.tsx`의 `Confirm`과 같은 이유다. */
export function StartMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={`taskbar__start${open ? ' taskbar__start--on' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <AppIcon name={START_ICONS.start} />
        시작
      </button>
      {open && <Panel onClose={() => setOpen(false)} />}
    </>
  )
}

/** 되돌릴 수 없는 일을 하기 전에 무엇을 물을지. `null`이면 아무것도 안 묻는 상태다. */
type Ask =
  | { kind: 'save'; slot: number; had: SaveSlot }
  | { kind: 'load'; slot: number; slotData: SaveSlot }
  | { kind: 'clear'; slot: number }
  | { kind: 'new' }

function Panel({ onClose }: { onClose: () => void }) {
  const revision = useGame((s) => s.slotsRevision)
  const { saveSlot, loadSlot, clearSlot, newGame } = useGame.getState()
  const [ask, setAsk] = useState<Ask | null>(null)

  // 저장소에서 직접 읽는다. ⚠️ `revision`이 의존성인 것이 핵심이다 — 저장·삭제 뒤에
  // 목록이 그대로면 방금 한 일이 화면에 안 보인다.
  // `revision`이 바뀔 때마다 저장소를 다시 읽는다(정본은 localStorage 쪽이다).
  void revision
  const slots = readSlots()

  // 바깥을 눌러도 Escape로도 닫힌다. ⚠️ 묻는 중에는 **메뉴를 닫지 않는다** — 닫아 버리면
  // 질문이 사라지면서 사람은 자기가 무엇을 취소한 것인지 모른다(묻는 창이 먼저 답을 받는다).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (ask) setAsk(null)
      else onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ask, onClose])

  return createPortal(
    <>
      {/* 바깥 클릭을 받는 층. 메뉴보다 아래에 깔린다. */}
      <div className="startmenu__scrim" onPointerDown={() => (ask ? undefined : onClose())} />

      <div className="startmenu" role="dialog" aria-label="시작 메뉴">
        <p className="startmenu__title">저장 / 불러오기</p>
        <p className="startmenu__note">
          게임은 늘 자동으로 저장된다. 아래 세 칸은 <b>돌아올 지점</b>을 직접 남기는 자리다.
        </p>

        <ul className="slots">
          {slots.map((slot, i) => {
            const n = i + 1
            return (
              <li key={n} className={`slot${slot ? '' : ' slot--empty'}`}>
                <div className="slot__head">
                  <span className="slot__name">슬롯 {n}</span>
                  {slot ? (
                    <span className="slot__when">{formatSavedAt(slot.savedAt)}</span>
                  ) : (
                    <span className="slot__when">비어 있음</span>
                  )}
                </div>

                {/* 요약이 있어야 목록에서 **어느 판인지** 알아본다. 마감과 같은 함수로
                    날짜를 적어 계기판과 다른 시간 표기가 생기지 않게 한다. */}
                {slot && (
                  <p className="slot__summary">
                    {formatDate(slot.summary.week)} · {slot.summary.money.toLocaleString('ko-KR')}원
                    · 평판 {slot.summary.reputation} · 업무 {slot.summary.jobs}건
                  </p>
                )}

                <div className="slot__buttons">
                  <button
                    type="button"
                    className="slot__btn slot__btn--save"
                    onClick={() =>
                      // 빈 칸은 물을 것이 없다 — 잃을 것이 없으면 바로 저장한다.
                      slot ? setAsk({ kind: 'save', slot: n, had: slot }) : saveSlot(n)
                    }
                  >
                    저장
                  </button>
                  {/* ⚠️ 빈 슬롯에는 불러오기·삭제 버튼을 **아예 그리지 않는다** —
                      눌러도 아무 일 없는 버튼을 회색으로 두는 것도 동작하지 않는 컨트롤이다. */}
                  {slot && (
                    <>
                      <button
                        type="button"
                        className="slot__btn"
                        onClick={() => setAsk({ kind: 'load', slot: n, slotData: slot })}
                      >
                        불러오기
                      </button>
                      <button
                        type="button"
                        className="slot__btn slot__btn--danger"
                        onClick={() => setAsk({ kind: 'clear', slot: n })}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <button type="button" className="startmenu__new" onClick={() => setAsk({ kind: 'new' })}>
          <AppIcon name={START_ICONS.newGame} />
          새 게임
        </button>
      </div>

      {ask && (
        <Confirm
          ask={ask}
          onCancel={() => setAsk(null)}
          onGo={() => {
            if (ask.kind === 'save') saveSlot(ask.slot)
            if (ask.kind === 'clear') clearSlot(ask.slot)
            // ⚠️ 불러오기·새 게임은 판이 통째로 갈리므로 **메뉴를 닫는다** — 새 판을
            //    보여 주지 않고 메뉴가 그대로 서 있으면 무엇이 바뀌었는지 알 수 없다.
            if (ask.kind === 'load') {
              loadSlot(ask.slot)
              onClose()
            }
            if (ask.kind === 'new') {
              newGame()
              onClose()
            }
            setAsk(null)
          }}
        />
      )}
    </>,
    document.body,
  )
}

/** 되돌릴 수 없는 일을 묻는 창. ⚠️ `window.confirm` 금지(`Hud.tsx`의 `Confirm`과 같은 이유:
 *  가짜 OS의 시각 언어를 깨고 JS를 멈춰 세워 실측 하네스가 손을 못 댄다). 클래스도 그쪽과
 *  같은 `.confirm*`을 쓴다 — 같은 성격의 질문이 창마다 다르게 생기면 안 된다. */
function Confirm({ ask, onGo, onCancel }: { ask: Ask; onGo: () => void; onCancel: () => void }) {
  const { title, note, go } = ASK_TEXT(ask)
  return createPortal(
    <div className="confirm" role="dialog" aria-modal="true" aria-label={title}>
      <div className="confirm__panel">
        <p className="confirm__title">{title}</p>
        <p className="confirm__note">{note}</p>
        <div className="confirm__buttons">
          <button type="button" className="confirm__btn confirm__btn--go" onClick={onGo}>
            {go}
          </button>
          <button type="button" className="confirm__btn" onClick={onCancel}>
            취소
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** 무엇을 잃는지 **구체적으로** 적는다 — "정말입니까?"만으로는 무엇이 사라지는지 모른다. */
const ASK_TEXT = (ask: Ask) => {
  switch (ask.kind) {
    case 'save':
      return {
        title: `슬롯 ${ask.slot}에 덮어쓰시겠습니까?`,
        note: `지금 들어 있는 ${formatDate(ask.had.summary.week)} 저장은 사라진다.`,
        go: '덮어쓰기',
      }
    case 'load':
      return {
        title: `슬롯 ${ask.slot}을 불러오시겠습니까?`,
        note: `${formatDate(ask.slotData.summary.week)}로 돌아간다. 지금 진행 중인 판은 사라지고 되돌릴 수 없다.`,
        go: '불러오기',
      }
    case 'clear':
      return {
        title: `슬롯 ${ask.slot}을 삭제하시겠습니까?`,
        note: '저장해 둔 판이 사라지고 되돌릴 수 없다.',
        go: '삭제',
      }
    case 'new':
      return {
        title: '새 게임을 시작하시겠습니까?',
        note: '지금 진행 중인 판은 사라진다. 슬롯에 저장해 둔 판은 그대로 남는다.',
        go: '새로 시작',
      }
  }
}

/** 저장소의 슬롯 셋을 읽는다. ⚠️ `revision`은 **쓰지 않지만 받는다** — 이 값이 인자로
 *  들어와야 저장·삭제 뒤 렌더에서 다시 읽힌다는 것이 코드에 보인다.
 *  ⚠️ localStorage가 없는 환경(테스트·SSR)에서도 터지지 않게 전부 빈 칸으로 떨어진다. */

