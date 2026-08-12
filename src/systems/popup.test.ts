import { describe, expect, it } from 'vitest'
import { claimMail, judgePopups, popupFileId, type Popup, type PopupJob } from './popup'

/** 팝업 판정은 **평판을 만드는 불변식**이다 — 규칙을 뒤집어 실패를 확인하는 테스트를 붙인다.
 *  세 갈래(틀린 파일 · 기간 지났는데 있음 · 기간인데 없음)와 "같은 주 한 통"이 핵심이다. */

const job = (over: Partial<PopupJob> = {}): PopupJob => ({
  id: 'j1',
  clientId: 'dalbit',
  from: 3,
  to: 5,
  done: false,
  ...over,
})

const hung = (over: Partial<Popup> = {}): Popup => ({
  id: 'p1',
  clientId: 'dalbit',
  fileId: popupFileId('j1', 1),
  from: 3,
  to: 5,
  ...over,
})

describe('judgePopups', () => {
  // ⚠️ 이것이 뒤집은 쪽이다. 맞게 걸었는데 클레임이 나오면 플레이어에게 빠져나갈 길이 없다.
  it('요청 기간과 파일이 맞으면 클레임이 없다', () => {
    expect(judgePopups(3, [job()], [hung()])).toEqual([])
    expect(judgePopups(5, [job()], [hung()])).toEqual([])
  })

  // 양끝 포함이다. 반열림으로 바꾸면 "3주간"이라 쓴 의뢰문과 한 주씩 어긋난다.
  it('요청 기간의 양끝은 포함이다', () => {
    expect(judgePopups(2, [job()], [])).toEqual([])
    expect(judgePopups(3, [job()], [])).toHaveLength(1)
    expect(judgePopups(5, [job()], [])).toHaveLength(1)
    expect(judgePopups(6, [job()], [])).toEqual([])
  })

  it('기간인데 아무것도 안 걸려 있으면 missing이다', () => {
    expect(judgePopups(4, [job()], [])[0]!.kinds).toEqual(['missing'])
  })

  it('기간인데 다른 업무의 파일이 걸려 있으면 wrong-file이다', () => {
    const wrong = hung({ fileId: popupFileId('j2', 1) })
    expect(judgePopups(4, [job()], [wrong])[0]!.kinds).toEqual(['wrong-file'])
  })

  it('기간이 지났는데 아직 걸려 있으면 overstay다', () => {
    // 걸린 기간만 늘려 둔다 — 요청은 5주에 끝나는데 팝업이 8주까지 산다.
    const long = hung({ to: 8 })
    expect(judgePopups(7, [job()], [long])[0]!.kinds).toEqual(['overstay'])
  })

  it('다른 업체에 걸린 팝업은 이 업무를 이행하지 않는다', () => {
    const elsewhere = hung({ clientId: 'corner' })
    expect(judgePopups(4, [job()], [elsewhere])[0]!.kinds).toEqual(['missing'])
  })

  // 끝난 일로 계속 항의가 오면 빠져나갈 길이 없다.
  it('완료된 업무는 검사하지 않는다', () => {
    expect(judgePopups(4, [job({ done: true })], [])).toEqual([])
  })

  // ⚠️ 같은 주에 세 통이 오면 받은편지함이 무너진다. 평판도 중복해서 깎이면 안 된다.
  it('같은 업체·같은 주는 여러 갈래가 어긋나도 한 건이다', () => {
    const jobs = [
      job({ id: 'j1', from: 3, to: 5 }), // 4주에 있어야 하는데 남의 파일이 걸려 있다
      job({ id: 'j2', from: 1, to: 2 }), // 끝났는데 아직 걸려 있다
    ]
    const popups = [hung({ id: 'pa', fileId: popupFileId('j2', 1), from: 1, to: 9 })]

    const claims = judgePopups(4, jobs, popups)
    expect(claims).toHaveLength(1)
    expect(claims[0]!.clientId).toBe('dalbit')
    expect(claims[0]!.jobIds).toEqual(['j1', 'j2'])
    expect(new Set(claims[0]!.kinds)).toEqual(new Set(['wrong-file', 'overstay']))
  })

  it('업체가 다르면 따로 센다 — 각자에게 한 통씩', () => {
    const claims = judgePopups(4, [job({ id: 'j1' }), job({ id: 'j2', clientId: 'corner' })], [])
    expect(claims.map((c) => c.clientId)).toEqual(['dalbit', 'corner'])
  })

  // 순수 함수다 — 넣은 것을 바꾸면 스토어가 같은 상태를 두 번 못 판정한다.
  it('인자를 바꾸지 않는다', () => {
    const jobs = [job()]
    const popups = [hung({ to: 9 })]
    const snap = JSON.stringify({ jobs, popups })
    judgePopups(7, jobs, popups)
    expect(JSON.stringify({ jobs, popups })).toBe(snap)
  })
})

describe('claimMail', () => {
  // 같은 업체가 다음 주에 또 항의하면 다른 글이어야 안 읽은 뱃지가 다시 선다.
  it('주차가 다르면 다른 글이다', () => {
    const c = { clientId: 'dalbit', jobIds: ['j1'], kinds: ['missing' as const] }
    expect(claimMail(c, 4, '달빛공방').id).not.toBe(claimMail(c, 5, '달빛공방').id)
  })

  // ⚠️ `ad` 갈래여야 한다 — 아니면 JobActions가 항의에 견적보내기를 붙인다.
  it('고를 것이 없는 글이다', () => {
    const mail = claimMail({ clientId: 'dalbit', jobIds: ['j1'], kinds: ['overstay'] }, 4, '달빛공방')
    expect(mail.ad).toBe(true)
    expect(mail.channel).toBe('mail')
    // 세 갈래를 뭉치지 않고 그대로 적는다 — 색이 없는 팔레트라 글자가 유일한 전달 수단이다.
    expect(mail.body).toContain('내려가지 않았습니다')
  })
})
