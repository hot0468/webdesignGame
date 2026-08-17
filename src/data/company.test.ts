import { describe, expect, it } from 'vitest'
import { CLIENTS, clientsOf, derivedClient, knownClients, STARTER_CLIENT } from './company'

/** 업체정보에 서는 목록. **이 판정이 틀리면 업무가 끝나지 않는다** — 업체가 안 열리면
 *  FTP 정보도 관리자 계정도 볼 수 없어 퍼블리싱·팝업 등록이 통째로 막힌다. */
describe('knownClients', () => {
  it('처음에는 계약된 한 곳만 선다', () => {
    expect(knownClients([]).map((c) => c.id)).toEqual([STARTER_CLIENT])
  })

  // ⚠️ **종류를 가리지 않는다.** 사이트 업무만 열어 주면 팝업을 수주하고도 그 업체의
  //    관리자 계정을 볼 수 없어 등록 공정이 막힌다(수주해 놓고 못 끝내는 업무가 생긴다).
  it('일을 받은 업체가 들어온다 — 업무 종류를 가리지 않는다', () => {
    for (const c of CLIENTS) {
      expect(knownClients([{ from: c.name }]).map((x) => x.id)).toContain(c.id)
    }
  })

  it('의뢰가 와도 수주하지 않으면 열리지 않는다', () => {
    const other = CLIENTS.find((c) => c.id !== STARTER_CLIENT)!
    // 수주한 업무 목록에 없는 업체는 아직 아무 사이도 아니다.
    expect(knownClients([]).map((c) => c.id)).not.toContain(other.id)
  })

  it('CLIENTS의 순서를 지킨다 — 탭이 판마다 뒤바뀌면 안 된다', () => {
    const all = knownClients(CLIENTS.map((c) => ({ from: c.name })))
    expect(all.map((c) => c.id)).toEqual(CLIENTS.map((c) => c.id))
  })
})

/** 수주로 생겨나는 업체. **이것이 없으면 수주센터로 딴 사이트는 영영 퍼블리싱할 수 없다** —
 *  에디터가 세우는 목록이 곧 이 함수의 답이기 때문이다. */
describe('clientsOf', () => {
  it('상수 목록에 없는 업체도 일을 받으면 생겨난다', () => {
    const list = clientsOf([{ from: '새봄공단' }])
    expect(list.map((c) => c.name)).toContain('새봄공단')
    // 퍼블리싱에 필요한 네 칸이 다 있어야 에디터에서 연결할 수 있다.
    const fresh = list.find((c) => c.name === '새봄공단')!
    for (const label of ['호스트', '포트', '계정', '비밀번호'])
      expect(fresh.ftp.find((f) => f.label === label)?.value).toBeTruthy()
  })

  // ⚠️ **저장하지 않는 근거다** — 같은 이름은 늘 같은 정보라야 불러온 판에서 접속 정보가
  //    바뀌어 있지 않다(`ftpClients`가 id를 저장하므로 id도 함께 고정이어야 한다).
  it('같은 이름은 늘 같은 접속 정보를 낸다', () => {
    expect(derivedClient('새봄공단')).toEqual(derivedClient('새봄공단'))
    expect(derivedClient('새봄공단').id).not.toBe(derivedClient('온누리센터').id)
  })

  it('한 업체의 업무가 여럿이어도 한 번만 선다', () => {
    const list = clientsOf([{ from: '새봄공단' }, { from: '새봄공단' }])
    expect(list.filter((c) => c.name === '새봄공단')).toHaveLength(1)
  })

  // ⚠️ 관리자 계정은 **비어 있다** — 팝업 의뢰가 오지 않는 곳이라 쓸 자리가 없다.
  //    화면은 이 빈 배열을 보고 그 묶음을 통째로 감춘다.
  it('생겨난 업체에는 관리자 계정이 없다', () => {
    expect(derivedClient('새봄공단').admin).toHaveLength(0)
  })
})
