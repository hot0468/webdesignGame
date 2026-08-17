import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { JobActions } from '../components/JobActions'
import { TALK_ICONS } from '../data/icons'
import { inbox, unreadCount, type Message } from '../data/inbox'
import { useGame } from '../store'
import './talk.css'

/** `톡톡` 창. **클라이언트가 직접 말을 거는 자리다**(스펙의 "클라이언트가 메일/카톡으로
 * 직접 업무 수주를 줌").
 *
 * ⚠️ **`메신저`(직원)와 다른 창이다.** 저쪽 상대는 고용한 직원이고 여기 상대는
 *    클라이언트다 — 한 창에 섞으면 지시할 사람과 응대할 사람이 같은 목록에 서고,
 *    "누구에게 맡길까"와 "이 일을 받을까"라는 다른 두 판단이 한 화면에서 뭉갠다.
 *
 * ⚠️ **새 업무 축이 아니다.** 여기서 받는 것도 평소 `Job`이고, 결정 버튼은 메일과
 *    **같은 `JobActions`**이며 수주하면 `acceptJob`을 그대로 탄다. 이 창이 가진 것은
 *    글이 오는 **채널 하나**(`channel: 'chat'`)뿐이다.
 *
 * ⚠️ **성격이 메일과 다르다**(`data/inbox.ts`의 카톡 갈래 주석이 정본): 카톡은 말이
 *    짧고 급한 자리라 **마감이 짧다**. 그래서 이 창의 글은 받는 순간 그 주의 계획을 바꾼다.
 *    화면도 그것을 말한다 — 목록이 대화방이라 한 줄이 짧고, 본문은 말풍선으로 끊어 선다.
 *
 * 시각 언어는 셸이 아니라 `talk.css`가 진다(프로그램 창은 자기 팔레트를 가둔다).
 * ⚠️ 메신저(인디고)와 **다른 색**이어야 두 창이 같은 것으로 보이지 않는다.
 *
 * ⚠️ 고른 방은 `useState`다 — 창을 보는 방식이라 세이브에 넣지 않는다. 스토어가 지는
 *    것은 **읽음(`readIds`)** 하나뿐이고, 뱃지는 거기서만 파생한다. */
export function Talk() {
  const [openId, setOpenId] = useState<string | null>(null)
  const readIds = useGame((s) => s.readIds)
  const markRead = useGame((s) => s.markRead)
  // 게임 중에 생겨난 글(회신 답장·완료 메일·클레임)도 **같은 목록에** 선다 — 빠뜨리면
  // 카톡으로 받은 업무의 답장이 어디에도 안 보여 다음 공정이 열리지 않는다.
  const mails = useGame((s) => s.mails)
  // ⚠️ 아직 안 온 글은 목록에도 뱃지에도 없다 — 둘이 같은 주차를 봐야 숫자가 안 어긋난다.
  const week = useGame((s) => s.week)

  const items = inbox('chat', week, mails)
  const open = items.find((m) => m.id === openId) ?? null
  const unread = unreadCount('chat', week, readIds, mails)

  return (
    <div className="talk">
      <div className="talk__list">
        <h3 className="talk__list-head">
          채팅
          {unread > 0 && <span className="talk__list-count">{unread}</span>}
        </h3>
        {items.length === 0 ? (
          <p className="talk__blank talk__blank--list">아직 온 톡이 없다</p>
        ) : (
          <ul className="talk__rooms">
            {items.map((m) => (
              <li key={m.id}>
                <Room
                  message={m}
                  on={m.id === openId}
                  unread={!readIds.includes(m.id)}
                  onPick={() => {
                    setOpenId(m.id)
                    markRead(m.id)
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="talk__chat" aria-live="polite">
        {open ? (
          <Chat key={open.id} message={open} />
        ) : (
          <div className="talk__blank">
            <AppIcon name={TALK_ICONS.blank} size={40} />
            <p className="talk__blank-title">읽을 톡을 고르면 여기 열린다</p>
            <p className="talk__blank-note">
              업체가 급한 일을 부탁할 때는 메일 대신 여기로 온다. 말이 짧은 만큼 기한도
              짧으니 받기 전에 마감을 먼저 본다.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

/** 대화방 한 줄. ⚠️ 안 읽음은 **점이 아니라 숫자 없는 표식 + 굵기**로 말한다 —
 *  글마다 안 읽은 수가 늘 1이라 숫자를 적으면 전부 "1"이 서서 뜻이 없다. */
function Room({
  message,
  on,
  unread,
  onPick,
}: {
  message: Message
  on: boolean
  unread: boolean
  onPick: () => void
}) {
  return (
    <button
      type="button"
      className={`talk__room${on ? ' talk__room--on' : ''}${unread ? ' talk__room--unread' : ''}`}
      aria-current={on ? 'true' : undefined}
      aria-label={unread ? `안 읽음, ${message.from}, ${message.subject}` : undefined}
      onClick={onPick}
    >
      <span className="talk__face" aria-hidden="true">
        <AppIcon name={TALK_ICONS.client} size={18} />
      </span>
      <span className="talk__room-name">{message.from}</span>
      <span className="talk__room-at">{message.at}</span>
      <span className="talk__room-last">{message.subject}</span>
      {unread && <span className="talk__dot" aria-hidden="true" />}
    </button>
  )
}

/** 대화 칸. **본문을 줄 단위로 끊어 말풍선으로 세운다** — 카톡은 한 문장씩 여러 번
 *  보내는 자리이고, 그 리듬이 이 채널이 급하다는 인상의 절반이다(나머지 절반은 마감).
 *
 * ⚠️ 말풍선을 **새 상태로 저장하지 않는다** — 글 본문(`\n`) 하나에서 파생한다. */
function Chat({ message }: { message: Message }) {
  const lines = message.body.split('\n').filter((l) => l.trim() !== '')

  return (
    <div className="talk__thread">
      <header className="talk__head">
        <span className="talk__face talk__face--big" aria-hidden="true">
          <AppIcon name={TALK_ICONS.client} size={22} />
        </span>
        <span className="talk__head-name">{message.from}</span>
        <span className="talk__head-at">{message.at}</span>
      </header>

      <div className="talk__log">
        <p className="talk__subject">{message.subject}</p>
        {lines.map((line, i) => (
          <p key={i} className="talk__bubble">
            {line}
          </p>
        ))}
        {/* ⚠️ 결정 버튼은 **메일과 같은 컴포넌트다**(`JobActions`) — 채널마다 버튼을
            새로 만들면 수주 고리가 채널 수만큼 갈린다. 색만 이 창이 준다(`--jobact-*`). */}
        <div className="talk__actions">
          <JobActions message={message} />
        </div>
      </div>
    </div>
  )
}
