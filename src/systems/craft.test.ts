import { describe, expect, it } from 'vitest'
import { QUALITY } from '../data/game'
import { gradeOf } from './craft'

describe('작업물 등급', () => {
  // 밴드는 퀄리티가, 칸은 스탯이 정한다 — 이 둘이 바뀌면 선택이나 성장 둘 중 하나가 죽는다.
  it('같은 스탯이라도 공들일수록 위 밴드가 나온다', () => {
    expect(gradeOf('light', 30)).toBe('D')
    expect(gradeOf('hard', 30)).toBe('C')
    expect(gradeOf('care', 30)).toBe('S')
  })

  it('같은 퀄리티에서는 스탯이 높을수록 위 칸이 나온다', () => {
    expect(gradeOf('light', 0)).toBe('F')
    expect(gradeOf('light', 99)).toBe('B')
    expect(gradeOf('care', 0)).toBe('S')
    expect(gradeOf('care', 99)).toBe('SSS')
  })

  // 100은 나눗셈이 밴드 밖으로 나간다(= 없는 등급). clamp가 빠지면 undefined가 화면에 뜬다.
  it('스탯 끝값에서도 밴드 밖으로 나가지 않는다', () => {
    for (const q of QUALITY) {
      expect(q.grades).toContain(gradeOf(q.id, 100))
      expect(q.grades).toContain(gradeOf(q.id, 0))
    }
  })
})
