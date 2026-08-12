import { describe, expect, it } from 'vitest'
import { CLIENTS } from '../data/company'
import { checkFtp, type FtpInput } from './ftp'

/** 그 업체의 정보를 사내시스템에서 그대로 옮겨 적은 입력. */
function typedFrom(client: (typeof CLIENTS)[number]): FtpInput {
  const field = (label: string) => client.ftp.find((f) => f.label === label)!.value
  return { host: field('호스트'), port: field('포트'), user: field('계정'), pw: field('비밀번호') }
}

describe('checkFtp', () => {
  it('업체의 접속 정보를 그 업체로 푼다 — 정본은 CLIENTS다', () => {
    for (const c of CLIENTS) {
      expect(checkFtp(typedFrom(c))).toBe(c.id)
    }
  })

  it('비밀번호는 대소문자를 봐주지 않는다 — 옮겨 적을 이유가 사라진다', () => {
    const c = CLIENTS[0]
    const right = typedFrom(c)
    expect(checkFtp({ ...right, pw: right.pw.toUpperCase() })).toBeUndefined()
    // 반대로 주소·계정은 접어서 본다(주소창과 같은 관대함).
    expect(checkFtp({ ...right, host: ` FTP://${right.host.toUpperCase()}/ ` })).toBe(c.id)
    expect(checkFtp({ ...right, user: right.user.toUpperCase() })).toBe(c.id)
  })

  it('포트가 다르면 열리지 않는다 — 업체마다 포트가 다르다', () => {
    const dalbit = CLIENTS.find((c) => c.id === 'dalbit')!
    const hanbit = CLIENTS.find((c) => c.id === 'hanbit')!
    const mixed = { ...typedFrom(dalbit), port: typedFrom(hanbit).port }
    expect(checkFtp(mixed)).toBeUndefined()
  })

  it('다른 업체의 계정을 섞으면 열리지 않는다', () => {
    const dalbit = typedFrom(CLIENTS[0])
    const hanbit = typedFrom(CLIENTS[1])
    expect(checkFtp({ ...dalbit, pw: hanbit.pw })).toBeUndefined()
  })
})
