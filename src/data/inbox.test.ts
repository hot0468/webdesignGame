import { describe, expect, it } from 'vitest'
import { MESSAGES, inbox, unreadCount, type Message } from './inbox'

/** 예정된 글이 전부 도착한 뒤의 주차 — "채널로 가른다" 같은 규칙은 목록 전체로 확인한다. */
const LATER = 99

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
    expect(inbox('mail', LATER, 0).every((m) => m.channel === 'mail')).toBe(true)
    // ⚠️ 세 채널의 합이 전부여야 한다 — 어느 채널에도 안 걸리는 글은 **어디에도 안 뜨고**
    //    뱃지에도 안 세어져 조용히 사라진다.
    expect(
      inbox('mail', LATER, 0).length + inbox('board', LATER, 0).length + inbox('chat', LATER, 0).length,
    ).toBe(MESSAGES.length)
  })

  /** 카톡은 **급한 자리다** — 그 성격이 기한 숫자에 있다. 메일 의뢰와 같은 기한을 주면
   *  채널을 가른 뜻이 없어진다(말투만 다른 같은 의뢰가 된다). */
  it('카톡 의뢰는 메일 의뢰보다 마감이 짧다', () => {
    const due = (ch: 'mail' | 'chat') =>
      inbox(ch, LATER, 0).flatMap((m) => (m.ad ? [] : [m.dueWeeks]))
    expect(Math.max(...due('chat'))).toBeLessThan(Math.max(...due('mail')))
  })

  // ⚠️ 처음 켠 판이 여덟 통으로 시작하면 무엇부터 해야 하는지가 안 보이고 마감이 한 주에
  //    몰린다. **채널마다 한 통씩**이 시작 상태다(설계자 확정 2026-08-13).
  it('1주차에는 채널마다 한 통씩만 와 있다', () => {
    expect(inbox('mail', 1, 0)).toHaveLength(1)
    expect(inbox('board', 1, 0)).toHaveLength(1)
    // 뒤로 갈수록 늘어난다 — 안 그러면 이 규칙이 곧 "글이 하나뿐인 게임"이 된다.
    expect(inbox('mail', LATER, 0).length).toBeGreaterThan(1)
  })

  it('읽은 글은 세지 않고, 다른 채널의 읽음은 건드리지 않는다', () => {
    const mailIds = inbox('mail', LATER, 0).map((m) => m.id)
    expect(unreadCount('mail', LATER, 0, [])).toBe(mailIds.length)
    expect(unreadCount('mail', LATER, 0, mailIds.slice(0, 1))).toBe(mailIds.length - 1)
    // 메일 뱃지가 게시판을 읽었다고 줄어들면 두 아이콘이 같은 수를 지게 된다.
    expect(unreadCount('mail', LATER, 0, inbox('board', LATER, 0).map((m) => m.id))).toBe(mailIds.length)
  })
})

/** 도착 요일. **회신의 답장이 다음 날 오는 고리가 이 판정 하나에 걸려 있다** —
 *  곧바로 뜨면 보고 있던 목록에 조용히 끼어들어 새 글인 줄도 모른다. */
describe('도착 요일', () => {
  const later: Message = {
    id: 'x-tomorrow',
    channel: 'mail',
    from: '달빛공방',
    subject: '내일 오는 글',
    body: '',
    at: '',
    ad: true,
    week: 5,
    day: 3,
  }

  it('도착 날 전에는 안 서고, 그날부터 선다', () => {
    expect(inbox('mail', 5, 2, [later]).map((m) => m.id)).not.toContain('x-tomorrow')
    expect(inbox('mail', 5, 3, [later]).map((m) => m.id)).toContain('x-tomorrow')
  })

  it('주가 지나면 요일과 무관하게 선다', () => {
    expect(inbox('mail', 6, 0, [later]).map((m) => m.id)).toContain('x-tomorrow')
  })

  // ⚠️ 뱃지가 목록과 **같은 판정**을 봐야 "새 글 1개인데 열면 없다"가 안 생긴다.
  it('뱃지도 같은 날을 본다', () => {
    expect(unreadCount('mail', 5, 2, [], [later])).toBe(unreadCount('mail', 5, 2, [], []))
    expect(unreadCount('mail', 5, 3, [], [later])).toBe(unreadCount('mail', 5, 3, [], []) + 1)
  })

  /** 요일이 없는 글(상수 의뢰)은 그 주 첫날부터 선다 — 옛 글이 조용히 사라지면 안 된다. */
  it('요일이 없으면 그 주 첫날부터 선다', () => {
    const noDay: Message = { ...later, id: 'x-noday', day: undefined }
    expect(inbox('mail', 5, 0, [noDay]).map((m) => m.id)).toContain('x-noday')
  })
})
