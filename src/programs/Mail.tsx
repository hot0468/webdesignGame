import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { JobActions } from '../components/JobActions'
import { MAIL_ICONS } from '../data/icons'
import { inbox, unreadCount, type Message } from '../data/inbox'
import { useGame } from '../store'
import './mail.css'

/** `메일` 창. **신규 의뢰**가 여기로 온다(유지보수 의뢰는 사내시스템 고객게시판).
 *
 * 실제 아웃룩과 같은 세 칸(폴더 · 목록 · 읽는 칸)이다. 시각 언어는 셸이 아니라
 * `mail.css`의 Fluent 팔레트가 진다 — 프로그램 창은 자기 팔레트를 가둔다.
 *
 * ⚠️ 리본·검색창·보내기 버튼은 그리지 않는다. 아웃룩처럼 **보이기만** 하고 누르면
 *    아무 일도 안 하는 컨트롤은 이 프로젝트가 금지한다. 여기 있는 폴더·필터·목록은
 *    전부 실제로 목록을 바꾼다. 답장은 그럴 시스템이 생길 때 붙인다.
 *
 * ⚠️ 고른 폴더·필터·메일은 전부 `useState`다(스토어에 넣으면 세이브에 들어간다).
 *    스토어가 지는 것은 **읽음(readIds)** 하나뿐이다. */

const FOLDERS = [
  { id: 'inbox', label: '받은 편지함', icon: MAIL_ICONS.inbox },
  { id: 'sent', label: '보낸 편지함', icon: MAIL_ICONS.sent },
] as const

type FolderId = (typeof FOLDERS)[number]['id']

export function Mail() {
  const [folder, setFolder] = useState<FolderId>('inbox')
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const readIds = useGame((s) => s.readIds)
  const markRead = useGame((s) => s.markRead)
  // 게임 중에 들어온 글(클레임 메일). 상수 목록과 **같은 받은편지함**에 선다 —
  // 따로 칸을 만들면 항의가 메일이 아닌 무언가로 보인다.
  const claims = useGame((s) => s.claims)

  // 보낸 편지함은 아직 쌓일 것이 없다 — 답장 기능이 생기면 여기가 채워진다.
  const items = folder === 'inbox' ? inbox('mail', claims) : []
  const shown = onlyUnread ? items.filter((m) => !readIds.includes(m.id)) : items
  const open = items.find((m) => m.id === openId) ?? null

  return (
    <div className="mail">
      <nav className="mail__rail" aria-label="메일 폴더">
        {FOLDERS.map((f) => {
          const unread = f.id === 'inbox' ? unreadCount('mail', readIds, claims) : 0
          return (
            <button
              key={f.id}
              type="button"
              className={`mail__folder${folder === f.id ? ' mail__folder--on' : ''}`}
              aria-current={folder === f.id ? 'page' : undefined}
              aria-label={unread ? `${f.label}, 안 읽음 ${unread}개` : undefined}
              onClick={() => {
                setFolder(f.id)
                setOpenId(null)
              }}
            >
              <AppIcon name={f.icon} />
              <span className="mail__folder-label">{f.label}</span>
              {unread > 0 && (
                <span className="mail__count" aria-hidden="true">
                  {unread}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mail__list">
        <div className="mail__tabs">
          {/* 아웃룩의 "중요/기타" 자리다. 우리에게는 중요도 데이터가 없으므로
              실제로 목록을 거르는 두 가지로 바꿔 둔다. */}
          {[
            { label: '전체', on: !onlyUnread, set: false },
            { label: '안 읽음', on: onlyUnread, set: true },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              className={`mail__tab${t.on ? ' mail__tab--on' : ''}`}
              aria-current={t.on ? 'true' : undefined}
              onClick={() => setOnlyUnread(t.set)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mail__items">
          {shown.length === 0 ? (
            <p className="mail__blank">
              {folder === 'sent' ? '보낸 메일이 없다.' : '안 읽은 메일이 없다.'}
            </p>
          ) : (
            shown.map((m) => (
              <MailRow
                key={m.id}
                message={m}
                unread={!readIds.includes(m.id)}
                selected={m.id === openId}
                onOpen={() => {
                  setOpenId(m.id)
                  markRead(m.id)
                }}
              />
            ))
          )}
        </div>
      </div>

      <article className="mail__read" aria-live="polite">
        {open ? (
          <>
            <h3 className="mail__subject-line">{open.subject}</h3>
            <div className="mail__sender">
              <Avatar from={open.from} />
              <span className="mail__sender-name">{open.from}</span>
              <span className="mail__at">{open.at}</span>
            </div>
            <p className="mail__body">{open.body}</p>
            <JobActions message={open} />
          </>
        ) : (
          <div className="mail__blank">
            <AppIcon name={MAIL_ICONS.blank} size={48} />
            <p>읽을 메일을 고르면 여기 열린다.</p>
          </div>
        )}
      </article>
    </div>
  )
}

/** 보낸 사람의 첫 글자 원. 아웃룩의 목록이 사람 단위로 읽히게 하는 표식이다. */
function Avatar({ from }: { from: string }) {
  return (
    <span className="mail__avatar" aria-hidden="true">
      {from.slice(0, 1)}
    </span>
  )
}

function MailRow({
  message,
  unread,
  selected,
  onOpen,
}: {
  message: Message
  unread: boolean
  selected: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      className={`mail__item${unread ? ' mail__item--unread' : ''}${selected ? ' mail__item--on' : ''}`}
      aria-current={selected ? 'true' : undefined}
      aria-label={unread ? `안 읽음, ${message.from}, ${message.subject}` : undefined}
      onClick={onOpen}
    >
      <Avatar from={message.from} />
      <span className="mail__from">{message.from}</span>
      <span className="mail__at">{message.at}</span>
      <span className="mail__subject">{message.subject}</span>
      {/* 미리보기는 본문 그대로다 — 자르는 것은 CSS(한 줄 ellipsis)가 한다. */}
      <span className="mail__preview">{message.body}</span>
    </button>
  )
}
