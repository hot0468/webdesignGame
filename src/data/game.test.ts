import { describe, expect, it } from 'vitest'
import { COMPANY_GRADES, companyGrade, nextGrade } from './game'

describe('회사등급', () => {
  it('경계값이 위 칸에 붙는다', () => {
    expect(companyGrade(0).label).toBe('극소기업')
    expect(companyGrade(19).label).toBe('극소기업')
    expect(companyGrade(20).label).toBe('소기업')
    expect(companyGrade(100).label).toBe('대기업')
  })

  // 표가 오름차순이 아니면 reduce가 조용히 틀린 칸을 고른다 — 표를 늘릴 때 이 줄이 잡는다.
  it('표는 0에서 시작하는 오름차순이고 채용 상한도 같이 는다', () => {
    expect(COMPANY_GRADES[0].minReputation).toBe(0)
    COMPANY_GRADES.slice(1).forEach((g, i) => {
      const prev = COMPANY_GRADES[i]!
      expect(g.minReputation).toBeGreaterThan(prev.minReputation)
      expect(g.hireMax).toBeGreaterThan(prev.hireMax)
    })
  })

  it('대기업 위는 없다', () => {
    expect(nextGrade(companyGrade(0))?.label).toBe('소기업')
    expect(nextGrade(companyGrade(100))).toBeUndefined()
  })
})
