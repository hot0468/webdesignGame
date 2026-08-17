import { useState } from 'react'
import { inbox, type Channel } from '../data/inbox'
import { JobActions } from './JobActions'
import { useGame } from '../store'

/** 받은 글 목록. `메일` 창과 사내시스템 `고객게시판`이 **같은 컴포넌트**를 쓴다 —
 *  둘의 차이는 채널뿐이고, 여는 방식이 갈라지면 뱃지가 세는 규칙도 같이 갈라진다.
 *
 * ⚠️ 읽음은 **글을 펼칠 때** 붙는다. 창을 여는 것만으로 읽음 처리하면 뱃지가 열자마자
 *    사라져 무엇이 새 글이었는지 알 수 없다.
 *
 * ⚠️ 고른 글은 `useState`다 — 게임 상태가 아니라 창을 보는 방식이라 스토어에 넣으면
 *    세이브에 들어간다(읽음 여부만 스토어가 진다). */
export function MessageList({ channel }: { channel: Channel }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const readIds = useGame((s) => s.readIds)
  const markRead = useGame((s) => s.markRead)
  // ⚠️ 게임 중에 생겨난 글(회신에 대한 답장·완료 메일·클레임)도 **같은 목록에** 선다 —
  //    빠뜨리면 고객게시판 업무의 답장이 어디에도 안 보여 다음 공정이 열리지 않는다.
  const mails = useGame((s) => s.mails)
  // ⚠️ 아직 안 온 글은 목록에도, 뱃지에도 없다 — 둘이 같은 주차를 봐야 숫자가 안 어긋난다.
  const week = useGame((s) => s.week)
  const day = useGame((s) => s.day)

  return (
    <div className="msgs">
      {inbox(channel, week, day, mails).map((m) => {
        const unread = !readIds.includes(m.id)
        const open = openId === m.id
        return (
          <article key={m.id} className={`msg${unread ? ' msg--unread' : ''}`}>
            <button
              type="button"
              className="msg__head"
              aria-expanded={open}
              onClick={() => {
                setOpenId(open ? null : m.id)
                markRead(m.id)
              }}
            >
              <span className="msg__from">{m.from}</span>
              <span className="msg__subject">{m.subject}</span>
              <span className="msg__at">{m.at}</span>
              {unread && <span className="badge badge--dot" role="img" aria-label="새 글" />}
            </button>
            {open && (
              <div className="msg__open">
                <p className="msg__body">{m.body}</p>
                <JobActions message={m} />
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
