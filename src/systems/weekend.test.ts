import { describe, expect, it } from 'vitest'
import {
  AP_MIN,
  apMaxOf,
  COMPANY_LEVELS,
  INITIAL_GAME,
  MENTAL_PENALTY,
  MENTAL_RECOVERY,
  mentalPenalty,
  WEEKEND_DUE_WEEKS,
  WEEKEND_FEE_MULT,
  WEEKEND_MENTAL_COST,
} from '../data/game'
import { reward } from './money'
import { PIPELINE } from './pipeline'
import { recovered, weekendEvent, worked } from './weekend'

/** 이 파일이 지키는 것: **주말 이벤트의 재현성**과 **정신력 → 행동력 규칙**이다.
 *  둘 다 주차 진행과 돈을 만드는 불변식이라 규칙을 뒤집어 실패를 확인한다. */

/** 이벤트가 실제로 뜨는 주차 하나(확률이라 주차를 훑어 찾는다). */
const eventWeek = (() => {
  for (let w = 1; w <= 60; w++) if (weekendEvent(w)) return w
  throw new Error('60주 안에 주말 이벤트가 한 번도 없다 — 확률이 0에 가깝다')
})()

describe('주말 돌발 이벤트', () => {
  it('같은 주차는 늘 같은 의뢰다(시드 재현성)', () => {
    // ⚠️ 이것이 깨지면 창을 닫았다 열어 마음에 드는 의뢰가 나올 때까지 굴릴 수 있다.
    expect(weekendEvent(eventWeek)).toEqual(weekendEvent(eventWeek))
  })

  it('주차가 다르면 답도 갈린다 — 늘 같은 주말이 아니다', () => {
    const seen = new Set(
      Array.from({ length: 40 }, (_, i) => (weekendEvent(i + 1) ? 'on' : 'off')),
    )
    expect(seen).toEqual(new Set(['on', 'off']))
  })

  it('급한 의뢰다 — 마감이 짧고 기존 공정의 줄을 그대로 탄다', () => {
    const req = weekendEvent(eventWeek)!
    expect(req.dueWeeks).toBe(WEEKEND_DUE_WEEKS)
    // ⚠️ 새 업무 축이 아니다 — `PIPELINE`에 있는 종류여야 받은 뒤가 평소 업무와 같다.
    expect(PIPELINE[req.kind]).toBeDefined()
    // 팝업은 게시 기간 불변식(`dueWeeks > toWeeks`) 때문에 급한 의뢰가 될 수 없다.
    expect(req.kind).not.toBe('popup')
    expect(req.popup).toBeUndefined()
    expect(req.ad).toBeUndefined()
  })

  it('id에 주차가 들어가 한 주에 한 건이다', () => {
    expect(weekendEvent(eventWeek)!.id).toBe(`we:${eventWeek}`)
  })
})

describe('정신력', () => {
  it('주말에 일하면 줄고, 0 밑으로는 안 내려간다', () => {
    expect(worked(100)).toBe(100 - WEEKEND_MENTAL_COST)
    expect(worked(WEEKEND_MENTAL_COST - 1)).toBe(0)
  })

  it('주차 진행으로 회복하고, 최대 위로는 안 올라간다', () => {
    expect(recovered(50, 100)).toBe(50 + MENTAL_RECOVERY)
    expect(recovered(100, 100)).toBe(100)
  })

  it('회복이 주말 소모보다 작다 — 안 그러면 주말 근무에 대가가 없다', () => {
    expect(MENTAL_RECOVERY).toBeLessThan(WEEKEND_MENTAL_COST)
    // ⚠️ 0보다는 커야 한다. 줄기만 하는 값은 축이 아니라 카운트다운이다.
    expect(MENTAL_RECOVERY).toBeGreaterThan(0)
  })
})

describe('정신력 → 행동력 상한', () => {
  it('정신력이 낮을수록 상한이 깎인다', () => {
    expect(mentalPenalty(INITIAL_GAME.mentalMax)).toBe(0)
    expect(mentalPenalty(0)).toBeGreaterThan(0)
    // 표가 단조롭다 — 정신력이 줄었는데 페널티가 줄어드는 구간이 있으면 안 된다.
    for (let m = 1; m <= 100; m++) {
      expect(mentalPenalty(m)).toBeLessThanOrEqual(mentalPenalty(m - 1))
    }
  })

  it('`apMaxOf`가 상한의 유일한 출처다 — 회사레벨에서 깎는다', () => {
    const top = COMPANY_LEVELS[COMPANY_LEVELS.length - 1]!
    expect(apMaxOf(top.minRevenue, 100)).toBe(top.apMax)
    expect(apMaxOf(top.minRevenue, 0)).toBe(top.apMax - mentalPenalty(0))
  })

  it('⚠️ 상한이 1 밑으로 안 내려간다 — 0이면 회복 불가능한 죽은 판이다', () => {
    // 어떤 회사레벨·어떤 정신력에서도 1 밑은 없다(하한이 실제로 걸리는지 전부 훑는다).
    for (const l of COMPANY_LEVELS) {
      for (let m = 0; m <= 100; m++) expect(apMaxOf(l.minRevenue, m)).toBeGreaterThanOrEqual(AP_MIN)
    }
    // 규칙을 뒤집어 확인한다: 하한이 없었다면 시작 레벨 + 최악 정신력이 여기서 0 이하가 된다.
    const worst = Math.max(...MENTAL_PENALTY.map((p) => p.ap))
    expect(apMaxOf(0, 0)).toBe(AP_MIN)
    expect(AP_MIN).toBeGreaterThan(0)
    expect(COMPANY_LEVELS[0].apMax - worst).toBeLessThanOrEqual(AP_MIN)
  })
})

// ⚠️ 뒤집기: 배율이 안 실리면 주말 근무는 정신력만 물고 얻는 것이 없는 **순손해**가 된다
//    (실제로 그런 채로 굴러갔다 — 상수는 있는데 아무도 안 썼다).
describe('돌발 의뢰의 단가', () => {
  it('배율을 달고 나온다 — 마감이 짧은 값이다', () => {
    const ev = weekendEvent(eventWeek)!
    expect(ev.feeMult).toBe(WEEKEND_FEE_MULT)
    expect(WEEKEND_FEE_MULT).toBeGreaterThan(1)
  })

  it('대금이 실제로 그만큼 는다', () => {
    const plain = reward('fix', 'C')
    const rush = reward('fix', 'C', WEEKEND_FEE_MULT)
    expect(rush.fee).toBeGreaterThan(plain.fee)
    expect(rush.fee).toBe(Math.round(plain.fee * WEEKEND_FEE_MULT))
  })
})
