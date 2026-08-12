import { describe, expect, it } from 'vitest'
import { MESSAGES, inbox, unreadCount } from './inbox'

describe('받은 글', () => {
  // 뱃지가 id로 읽음을 세므로 id가 겹치면 한 글을 읽었을 때 두 개가 사라진다.
  it('id가 겹치지 않는다', () => {
    expect(new Set(MESSAGES.map((m) => m.id)).size).toBe(MESSAGES.length)
  })

  // ⚠️ 완료 회신은 게시 기간이 끝나야 보낼 수 있다(`systems/pipeline.ts`) — 마감이 기간
  //    안에 있으면 **지킬 수 없는 기한**을 적어 둔 셈이 된다. 데이터 쪽 불변식이라 여기서 막는다.
  it('팝업 의뢰의 마감은 게시 기간이 끝난 뒤다', () => {
    for (const m of MESSAGES) {
      if (m.ad || !m.popup) continue
      expect({ id: m.id, ok: m.dueWeeks > m.popup.toWeeks }).toEqual({ id: m.id, ok: true })
    }
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
