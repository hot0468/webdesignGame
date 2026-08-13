import { describe, expect, it } from 'vitest'
import { awardWorks } from './reference'
import { AWARD_COUNT, SHOT_THEMES } from '../data/reference'

/** 이 파일이 지키는 것은 **파생 규칙 하나**다: 목록은 저장되지 않고 주차에서 나온다.
 *  화면에는 테스트를 붙이지 않는다(수상작은 읽는 글이고 고를 것이 없다). */

describe('수상작 파생', () => {
  it('같은 주차는 늘 같은 목록이다 — 창을 닫았다 열어 굴릴 수 없다', () => {
    expect(awardWorks(7)).toEqual(awardWorks(7))
  })

  it('주가 넘어가면 다른 작품이 걸린다', () => {
    expect(awardWorks(7)).not.toEqual(awardWorks(8))
  })

  it('썸네일 테마는 CSS가 그릴 수 있는 범위 안이다', () => {
    const works = awardWorks(3)
    expect(works).toHaveLength(AWARD_COUNT)
    for (const w of works) {
      expect(w.shot).toBeGreaterThanOrEqual(0)
      expect(w.shot).toBeLessThan(SHOT_THEMES)
    }
  })
})
