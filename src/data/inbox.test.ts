import { describe, expect, it } from 'vitest'
import { MESSAGES, inbox, unreadCount } from './inbox'

describe('받은 글', () => {
  // 뱃지가 id로 읽음을 세므로 id가 겹치면 한 글을 읽었을 때 두 개가 사라진다.
  it('id가 겹치지 않는다', () => {
    expect(new Set(MESSAGES.map((m) => m.id)).size).toBe(MESSAGES.length)
  })

  it('채널로 가르고 남기지 않는다', () => {
    expect(inbox('mail').every((m) => m.channel === 'mail')).toBe(true)
    expect(inbox('mail').length + inbox('board').length).toBe(MESSAGES.length)
  })

  it('읽은 글은 세지 않고, 다른 채널의 읽음은 건드리지 않는다', () => {
    const mailIds = inbox('mail').map((m) => m.id)
    expect(unreadCount('mail', [])).toBe(mailIds.length)
    expect(unreadCount('mail', mailIds.slice(0, 1))).toBe(mailIds.length - 1)
    // 메일 뱃지가 게시판을 읽었다고 줄어들면 두 아이콘이 같은 수를 지게 된다.
    expect(unreadCount('mail', inbox('board').map((m) => m.id))).toBe(mailIds.length)
  })
})
