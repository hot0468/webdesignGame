import { describe, expect, it } from 'vitest'
import {
  clientKeywords,
  hitCount,
  keywordShift,
  revealCount,
  revealedKeywords,
  shiftGrade,
  GRADE_LADDER,
} from './keywords'
import { KEYWORD_SHIFT, KEYWORDS, SITE_KEYWORDS } from '../data/keywords'
import { GRADE_ORDER } from './pipeline'
import { gradeOf } from './craft'

/** ⚠️ 여기 있는 것은 **대금·평판을 만드는 불변식**뿐이다(키워드 적중 → 등급 → `GRADE_REWARD`).
 *  규칙을 뒤집어 확인하는 증명도 그 고리에만 쓴다. */

describe('클라이언트가 원하는 키워드', () => {
  it('사이트당 SITE_KEYWORDS개이고 겹치지 않는다', () => {
    const got = clientKeywords('m-byeolbit')
    expect(got).toHaveLength(SITE_KEYWORDS)
    expect(new Set(got).size).toBe(SITE_KEYWORDS)
  })

  it('같은 업무 id면 늘 같다 — 다시 그릴 때마다 답이 바뀌면 미팅이 거짓말이 된다', () => {
    expect(clientKeywords('m-byeolbit')).toEqual(clientKeywords('m-byeolbit'))
  })

  // 뒤집기: 씨앗(업무 id)이 다르면 답도 갈려야 한다. 늘 같은 5개면 한 번 외우고 끝이다.
  it('업무가 다르면 답도 다르다', () => {
    const a = clientKeywords('job-a').join()
    const different = ['job-b', 'job-c', 'job-d', 'job-e'].some((id) => clientKeywords(id).join() !== a)
    expect(different).toBe(true)
  })
})

describe('기획력 → 알아내는 개수', () => {
  it('기획력이 높을수록 많이 알아낸다', () => {
    expect(revealCount(0)).toBeLessThan(revealCount(100))
  })

  // 뒤집기: 다 알아내면 미팅 뒤에 고를 것이 없어진다 — 이 규칙이 이 기능의 재미 전부다.
  it('최고 기획력으로도 SITE_KEYWORDS개를 다 알아내지는 못한다', () => {
    expect(revealCount(100)).toBeLessThan(SITE_KEYWORDS)
    expect(revealedKeywords('m-byeolbit', 100).length).toBeLessThan(SITE_KEYWORDS)
  })

  it('알아낸 것은 늘 정답의 부분집합이다 — 미팅이 틀린 정보를 주면 안 된다', () => {
    const answer = clientKeywords('m-byeolbit')
    for (const k of revealedKeywords('m-byeolbit', 30)) expect(answer).toContain(k)
  })
})

describe('적중 → 등급', () => {
  it('다 맞히면 등급이 오르고, 다 틀리면 내려간다', () => {
    expect(keywordShift(SITE_KEYWORDS)).toBeGreaterThan(0)
    expect(keywordShift(0)).toBeLessThan(0)
  })

  // 뒤집기: 절반이 기준선이어야 한다. 찍어도 평균 절반은 맞으므로 그 자리가 0이 아니면
  // 미팅과 무관하게 보정이 공짜로 붙거나 공짜로 깎인다.
  it('절반쯤 맞히면 보정이 없다', () => {
    expect(keywordShift(2)).toBe(0)
    expect(keywordShift(3)).toBe(0)
  })

  it('보정표는 0개~SITE_KEYWORDS개를 전부 덮는다', () => {
    expect(KEYWORD_SHIFT).toHaveLength(SITE_KEYWORDS + 1)
  })

  it('맞춘 수만 센다(중복·오답은 세지 않는다)', () => {
    const answer = clientKeywords('m-byeolbit')
    expect(hitCount([answer[0]!, answer[0]!], answer)).toBe(1)
    const wrong = KEYWORDS.map((k) => k.id).filter((k) => !answer.includes(k))
    expect(hitCount(wrong, answer)).toBe(0)
  })
})

describe('등급 사다리', () => {
  it('만족도(pipeline)와 같은 줄을 쓴다 — 두 줄이 갈리면 같은 등급이 두 뜻을 가진다', () => {
    expect(GRADE_LADDER).toEqual(GRADE_ORDER)
  })

  it('사다리 밖으로 나가지 않는다', () => {
    expect(shiftGrade('F', -5)).toBe('F')
    expect(shiftGrade('SSS', 5)).toBe('SSS')
  })

  // 뒤집기: 보정이 **밴드 밖으로** 나가야 한다. 밴드 안에서 잘리면 '간단하게'로 다 맞혀도
  // B에 막혀 미팅이 헛일이 되고, '매우 신경써서'로 다 틀려도 S 아래로 안 내려가 벌이 사라진다.
  it('키워드 보정은 퀄리티 밴드 밖으로 나간다', () => {
    // 간단하게(F~B)의 상한은 B. 다 맞히면 그 위로 올라간다.
    const top = gradeOf('light', 100)
    expect(gradeOf('light', 100, keywordShift(SITE_KEYWORDS))).not.toBe(top)
    expect(GRADE_LADDER.indexOf(gradeOf('light', 100, keywordShift(SITE_KEYWORDS)))).toBeGreaterThan(
      GRADE_LADDER.indexOf(top),
    )
    // 매우 신경써서(S~SSS)의 하한은 S. 다 틀리면 그 밑으로 내려간다.
    const low = gradeOf('care', 0)
    expect(GRADE_LADDER.indexOf(gradeOf('care', 0, keywordShift(0)))).toBeLessThan(
      GRADE_LADDER.indexOf(low),
    )
  })

  it('보정이 없으면 등급은 그대로다(회귀 — 팝업·PPT는 키워드를 고르지 않는다)', () => {
    for (const q of ['light', 'hard', 'care'] as const) {
      expect(gradeOf(q, 30, 0)).toBe(gradeOf(q, 30))
    }
  })
})
