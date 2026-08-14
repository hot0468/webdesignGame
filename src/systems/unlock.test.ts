import { describe, expect, it } from 'vitest'
import { COMPANY_LEVELS } from '../data/game'
import { SHORTCUTS } from '../data/sites'
import { newlyOpened, siteMinLevel, siteOpen } from './unlock'

/** 레벨 n을 만드는 최소 누적 매출. */
const revenueFor = (level: number) =>
  COMPANY_LEVELS.find((l) => l.level === level)!.minRevenue

describe('사이트 해금', () => {
  it('쇼핑은 처음부터 열려 있다 — 스탯을 사는 입구까지 잠그면 성장이 막힌다', () => {
    expect(siteOpen('shop', 0)).toBe(true)
  })

  // ⚠️ 뒤집기: 처음부터 다 열려 있으면 해금이라는 축 자체가 없는 것이다.
  it('나머지 셋은 처음엔 잠겨 있다', () => {
    expect(siteOpen('reference', 0)).toBe(false)
    expect(siteOpen('hire', 0)).toBe(false)
    expect(siteOpen('work', 0)).toBe(false)
  })

  it('정해진 레벨에 닿으면 열린다 — 그 직전까지는 잠겨 있다', () => {
    for (const s of SHORTCUTS) {
      const need = revenueFor(s.minLevel)
      if (s.minLevel > 1) expect(siteOpen(s.id, need - 1)).toBe(false)
      expect(siteOpen(s.id, need)).toBe(true)
    }
  })

  // ⚠️ 누적 매출은 줄지 않으므로 닫히는 길이 없어야 한다. 만약 소지금으로 재면
  //    돈을 쓰는 순간 사이트가 닫혀 "열렸다 잠겼다" 하는 판이 된다.
  it('한 번 열리면 더 벌어도 계속 열려 있다', () => {
    const need = revenueFor(4)
    expect(siteOpen('work', need)).toBe(true)
    expect(siteOpen('work', need * 10)).toBe(true)
  })

  it('새로 열린 것만 알린다 — 이미 열린 것을 매주 다시 알리지 않는다', () => {
    const before = revenueFor(2)
    const after = revenueFor(3)
    expect(newlyOpened(before, after)).toEqual(['hire'])
    // 같은 구간 안에서는 새로 열린 것이 없다.
    expect(newlyOpened(after, after + 1)).toEqual([])
  })

  it('화면이 적는 조건이 판정과 같은 표에서 나온다', () => {
    for (const s of SHORTCUTS) expect(siteMinLevel(s.id)).toBe(s.minLevel)
  })
})
