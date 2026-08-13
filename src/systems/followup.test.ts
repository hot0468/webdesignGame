import { describe, expect, it } from 'vitest'
import { CLIENTS } from '../data/company'
import { BUG_DELAY_WEEKS, REVISION_MAX, type Personality } from '../data/followup'
import { bugChance, bugReport, needsRevision, personalityOf, revisionChance } from './followup'

/** 성격 id로 그런 성격이 나오는 업체 이름을 하나 찾는다.
 *  ⚠️ 이름 → 성격 짝을 테스트에 적어 두지 않는다 — `PERSONALITIES` 순서가 바뀌면
 *     짝도 바뀌는데, 그때 깨져야 하는 것은 규칙이지 이 테스트가 아니다. */
const nameOf = (id: Personality['id']): string => {
  for (let i = 0; i < 5000; i++) {
    const name = `업체${i}`
    if (personalityOf(name).id === id) return name
  }
  throw new Error(`${id} 성격이 나오는 이름이 없다`)
}

const job = (over: Partial<Parameters<typeof needsRevision>[0]> = {}) => ({
  id: 'j1',
  from: nameOf('pixel'),
  title: '홈페이지 제작',
  kind: 'site' as const,
  step: 1,
  replied: 0,
  ...over,
})

describe('클라이언트 성격', () => {
  // 파생이 저장을 대신하는 근거 — 저장하지 않아도 같은 업체는 늘 같은 사람이다.
  it('같은 업체 이름에는 늘 같은 성격이 나온다', () => {
    for (const c of CLIENTS) {
      expect(personalityOf(c.name)).toEqual(personalityOf(c.name))
      expect(personalityOf(c.name).id).toBe(personalityOf(`${c.name}`).id)
    }
    // 이름이 다르면 갈리기는 한다(전부 한 성격이면 축이 아니다).
    const ids = new Set(Array.from({ length: 200 }, (_, i) => personalityOf(`x${i}`).id))
    expect(ids.size).toBeGreaterThan(1)
  })
})

describe('수정 확률', () => {
  it('CS가 높을수록 낮다', () => {
    const from = nameOf('rush')
    expect(revisionChance(from, 100)).toBeLessThan(revisionChance(from, 0))
  })

  it('성격 배율이 확률을 가른다', () => {
    expect(revisionChance(nameOf('easy'), 30)).toBeLessThan(revisionChance(nameOf('pixel'), 30))
    expect(bugChance(nameOf('easy'), 30)).toBeLessThan(bugChance(nameOf('pixel'), 30))
  })
})

describe('needsRevision', () => {
  // ⚠️ 팝업의 등록 공정을 되돌리면 실제로 걸린 팝업과 공정 단계가 어긋난다.
  it('팝업 업무에는 절대 오지 않는다', () => {
    for (let i = 0; i < 200; i++)
      expect(needsRevision(job({ id: `p${i}`, kind: 'popup', step: 2, replied: 1 }), 0)).toBe(false)
  })

  // ⚠️ 상한이 없으면 대금이 영원히 안 들어오는 업무가 생긴다.
  it('상한에 닿으면 더 오지 않는다', () => {
    for (let i = 0; i < 200; i++)
      expect(needsRevision(job({ id: `r${i}`, revisions: REVISION_MAX }), 0)).toBe(false)
  })

  it('되돌릴 공정이 없으면 오지 않는다', () => {
    for (let i = 0; i < 200; i++)
      expect(needsRevision(job({ id: `z${i}`, step: 0, replied: 0 }), 0)).toBe(false)
  })
})

describe('bugReport', () => {
  const anyJob = (id: string, from: string) => ({ id, from, title: '사이트', kind: 'site' as const })

  // ⚠️ 진짜 제약이다: 에디터는 `CLIENTS[].ftp`가 있는 업체만 세우므로 신규 고객에게
  //    신고를 보내면 받고도 **고칠 수 없는 업무**가 생긴다.
  it('CLIENTS에 없는 업체에는 절대 생기지 않는다', () => {
    for (let i = 0; i < 300; i++)
      expect(bugReport(anyJob(`n${i}`, `없는업체${i}`), 5, 0)).toBeUndefined()
  })

  it('버그 수정 업무는 다시 버그를 낳지 않는다', () => {
    const from = CLIENTS[0].name
    for (let i = 0; i < 300; i++)
      expect(bugReport(anyJob(`bug:x${i}`, from), 5, 0)).toBeUndefined()
  })

  it('납품 주차 + BUG_DELAY_WEEKS에 도착한다', () => {
    const from = CLIENTS[0].name
    const week = 7
    let found = 0
    for (let i = 0; i < 300; i++) {
      const r = bugReport(anyJob(`ok${i}`, from), week, 0)
      if (!r) continue
      found++
      expect(r.week).toBe(week + BUG_DELAY_WEEKS)
      expect(r.channel).toBe('board')
      expect(r.kind).toBe('fix')
    }
    expect(found).toBeGreaterThan(0)
  })
})
