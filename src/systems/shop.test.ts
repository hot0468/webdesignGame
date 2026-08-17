import { describe, expect, it } from 'vitest'
import { INITIAL_GAME, raiseSkill, type SkillId } from '../data/game'
import { SHOP_ITEMS, findItem } from '../data/shop'
import { buyBlock } from './shop'

const has = (over: Partial<Parameters<typeof buyBlock>[1]> = {}) => ({
  money: 100_000_000,
  boughtIds: [] as string[],
  mental: 0,
  mentalMax: INITIAL_GAME.mentalMax,
  skills: { figmaSkill: 30, photoshopSkill: 30, codingSkill: 30 } as Record<string, number>,
  ...over,
})

describe('상점 목록', () => {
  it('id가 겹치지 않는다 — 겹치면 한 번 사고 둘 다 잠긴다', () => {
    const ids = SHOP_ITEMS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // ⚠️ 장비는 한 번만 사는 것이라 `once`가 있어야 한다. 소모품은 없어야 반복해서 산다.
  it('숙련도 장비는 한 번만, 정신력 소모품은 반복해서 산다', () => {
    for (const item of SHOP_ITEMS) {
      if ('skill' in item) expect(item.once).toBe(true)
      else expect('once' in item).toBe(false)
    }
  })

  // ⚠️ 같은 축을 두 번 미는 장비가 생겼다(예: 피그마 +15 → +8). 합쳐도 상한(100)을
  //    넘으면 안 되고, `raiseSkill`이 자르므로 **돈만 나가는 구간**이 없어야 한다.
  it('같은 축의 장비를 다 사도 상한을 넘지 않는다', () => {
    const total: Record<string, number> = {}
    for (const item of SHOP_ITEMS) {
      if ('skill' in item) total[item.skill] = (total[item.skill] ?? 0) + item.gain
    }
    for (const [skill, gain] of Object.entries(total)) {
      const start = INITIAL_GAME[skill as SkillId]
      expect(raiseSkill(start, gain)).toBeLessThanOrEqual(100)
      // 시작값에서 전부 사면 실제로 오른다(잘려서 헛돈이 되지 않는다).
      expect(raiseSkill(start, gain)).toBe(start + gain)
    }
  })

  it('한 번 산 장비는 다시 못 산다', () => {
    const item = SHOP_ITEMS.find((i) => 'skill' in i)!
    expect(buyBlock(findItem(item.id), has())).toBeUndefined()
    expect(buyBlock(findItem(item.id), has({ boughtIds: [item.id] }))).toBe('bought')
  })

  it('상한에 닿았으면 못 산다 — 사도 아무 일 없는데 돈만 나가면 함정이다', () => {
    const gear = SHOP_ITEMS.find((i) => 'skill' in i)!
    expect(
      buyBlock(findItem(gear.id), has({ skills: { [gear.skill]: 100 } })),
    ).toBe('full')

    const potion = SHOP_ITEMS.find((i) => 'mental' in i)!
    expect(
      buyBlock(findItem(potion.id), has({ mental: INITIAL_GAME.mentalMax })),
    ).toBe('full')
  })

  it('돈이 모자라면 못 산다', () => {
    const item = SHOP_ITEMS[0]!
    expect(buyBlock(findItem(item.id), has({ money: item.price - 1 }))).toBe('money')
    expect(buyBlock(findItem(item.id), has({ money: item.price }))).toBeUndefined()
  })
})
