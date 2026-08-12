import { describe, expect, it } from 'vitest'
import { CLIENTS } from '../data/company'
import { SEARCH_HOME } from '../data/sites'
import { adminUrl, checkLogin, normalizeUrl, resolveUrl, siteTitle } from './url'

const dalbit = CLIENTS.find((c) => c.id === 'dalbit')!
const hanbit = CLIENTS.find((c) => c.id === 'hanbit')!

// 즐겨찾기가 기대는 두 가지: **한 곳은 한 줄로만 쌓인다**(normalizeUrl) ·
// **이름은 주소에서 나온다**(siteTitle — 즐겨찾기가 업체 이름을 따로 지고 있지 않다).
describe('즐겨찾기가 쓰는 것', () => {
  it('같은 곳을 가리키는 여러 표기가 한 값으로 접힌다', () => {
    const bare = adminUrl(dalbit)!
    for (const typed of [`https://${bare}/`, `WWW.${bare}`, ` ${bare} `]) {
      expect(normalizeUrl(typed)).toBe(normalizeUrl(bare))
    }
  })

  it('이름은 CLIENTS에서 나온다', () => {
    expect(siteTitle(`https://${adminUrl(dalbit)!}`)).toBe(`${dalbit.name} 관리자`)
    expect(siteTitle(SEARCH_HOME.url)).toBe(SEARCH_HOME.name)
  })
})

describe('resolveUrl', () => {
  it('업체의 관리자 주소를 그 업체로 푼다 — 주소의 정본은 CLIENTS다', () => {
    for (const c of CLIENTS) {
      expect(resolveUrl(adminUrl(c)!)).toEqual({ kind: 'admin', clientId: c.id })
    }
  })

  it('https://·www.·끝 슬래시·대문자는 봐준다', () => {
    const bare = adminUrl(dalbit)!
    for (const typed of [`https://${bare}`, `www.${bare}`, `${bare}/`, bare.toUpperCase(), ` ${bare} `]) {
      expect(resolveUrl(typed)).toEqual({ kind: 'admin', clientId: 'dalbit' })
    }
  })

  it('경로는 주소의 일부다 — 한빛치과는 경로로 갈리므로 도메인만으로는 안 간다', () => {
    expect(adminUrl(hanbit)).toContain('/manage')
    expect(resolveUrl('hanbit-dent.example')).toEqual({ kind: 'unknown' })
  })

  it('포털 주소는 첫화면이다', () => {
    expect(resolveUrl(SEARCH_HOME.url)).toEqual({ kind: 'home' })
  })

  it('모르는 주소와 빈 문자열은 unknown', () => {
    expect(resolveUrl('admin.nowhere.example')).toEqual({ kind: 'unknown' })
    expect(resolveUrl('   ')).toEqual({ kind: 'unknown' })
  })
})

describe('checkLogin', () => {
  const id = dalbit.admin.find((f) => f.label === '아이디')!.value
  const pw = dalbit.admin.find((f) => f.label === '비밀번호')!.value

  it('CLIENTS의 계정과 맞아야 통과한다', () => {
    expect(checkLogin('dalbit', id, pw)).toBe(true)
  })

  it('다른 업체의 계정으로는 못 들어간다 — 업체마다 계정이 갈린다', () => {
    expect(checkLogin('hanbit', id, pw)).toBe(false)
  })

  it('아이디는 대소문자를 봐주고 비밀번호는 그대로 본다', () => {
    expect(checkLogin('dalbit', id.toUpperCase(), pw)).toBe(true)
    expect(checkLogin('dalbit', id, pw.toUpperCase())).toBe(false)
  })

  it('빈 값·없는 업체는 실패', () => {
    expect(checkLogin('dalbit', '', '')).toBe(false)
    expect(checkLogin('nope', id, pw)).toBe(false)
  })
})
