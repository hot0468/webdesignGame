import { describe, expect, it } from 'vitest'
import {
  MIN_DAY,
  dayMinsOf,
  COMPANY_LEVELS,
  INITIAL_GAME,
  MENTAL_PENALTY,
  MENTAL_RECOVERY,
  mentalPenalty,
  WEEKEND_DUE_WEEKS,
  MENTAL_HIT,
  WEEKEND_FEE_MULT,
  WEEKEND_MENTAL_COST,
} from '../data/game'
import { reward } from './money'
import { PIPELINE } from './pipeline'
import { mentalHit, recovered, weekendEvent, worked } from './weekend'

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

describe('정신력 → 하루 근무 시간', () => {
  it('정신력이 낮을수록 상한이 깎인다', () => {
    expect(mentalPenalty(INITIAL_GAME.mentalMax)).toBe(0)
    expect(mentalPenalty(0)).toBeGreaterThan(0)
    // 표가 단조롭다 — 정신력이 줄었는데 페널티가 줄어드는 구간이 있으면 안 된다.
    for (let m = 1; m <= 100; m++) {
      expect(mentalPenalty(m)).toBeLessThanOrEqual(mentalPenalty(m - 1))
    }
  })

  it('`dayMinsOf`가 상한의 유일한 출처다 — 회사레벨에서 깎는다', () => {
    const top = COMPANY_LEVELS[COMPANY_LEVELS.length - 1]!
    expect(dayMinsOf(top.minRevenue, 100)).toBe(top.dayMins)
    expect(dayMinsOf(top.minRevenue, 0)).toBe(top.dayMins - mentalPenalty(0))
  })

  it('⚠️ 상한이 MIN_DAY 밑으로 안 내려간다 — 0이면 회복 불가능한 죽은 판이다', () => {
    // 어떤 회사레벨·어떤 정신력에서도 하한 밑은 없다(전부 훑는다).
    for (const l of COMPANY_LEVELS) {
      for (let m = 0; m <= 100; m++) expect(dayMinsOf(l.minRevenue, m)).toBeGreaterThanOrEqual(MIN_DAY)
    }
    // ⚠️ 지금 수치에서는 **하한이 실제로는 안 걸린다**(시작 레벨 + 최악 정신력도 하한 위다).
    //    그것이 의도다 — 하한은 표를 잘못 고쳤을 때를 받는 그물이지 평소에 닿는 바닥이 아니다.
    //    그래서 여기서는 **최악의 경우가 하한보다 넉넉한지**를 지킨다: 이 값이 하한까지
    //    내려오면 정신력이 하루를 통째로 지워 회복할 길이 막힌다는 뜻이다.
    const worst = Math.max(...MENTAL_PENALTY.map((p) => p.mins))
    expect(COMPANY_LEVELS[0].dayMins - worst).toBeGreaterThan(MIN_DAY)
    expect(MIN_DAY).toBeGreaterThan(0)
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

/** 나쁜 일이 깎는 정신력. ⚠️ 이 축이 없으면 주말에 안 일하는 판에서 정신력이
 *  100에 붙어 죽은 자원이 된다(그런 채로 굴러갔다). */
describe('나쁜 일과 정신력', () => {
  it('사건마다 정해진 만큼 깎고 여러 건이면 합쳐진다', () => {
    expect(mentalHit({ claims: 0, breaches: 0, quits: 0 })).toBe(0)
    expect(mentalHit({ claims: 1, breaches: 0, quits: 0 })).toBe(MENTAL_HIT.claim)
    expect(mentalHit({ claims: 2, breaches: 1, quits: 1 })).toBe(
      MENTAL_HIT.claim * 2 + MENTAL_HIT.breach + MENTAL_HIT.quit,
    )
  })

  // ⚠️ 뒤집기: 회복보다 **먼저** 빼면 바닥에서 회복분만큼 되살아나 벌이 사라진다.
  it('회복시킨 뒤에 뺀다 — 순서가 뒤집히면 벌이 사라진다', () => {
    const max = 100
    // 회복(+12) 뒤 클레임 하나(-6)를 맞으면 순증은 6이다.
    expect(recovered(50, max, MENTAL_HIT.claim)).toBe(50 + MENTAL_RECOVERY - MENTAL_HIT.claim)
    // 상한에 붙어 있어도 벌은 그대로 받는다(먼저 뺐다면 100이 됐을 것이다).
    expect(recovered(max, max, MENTAL_HIT.claim)).toBe(max - MENTAL_HIT.claim)
  })

  it('0 밑으로도 상한 위로도 안 나간다', () => {
    expect(recovered(0, 100, 999)).toBe(0)
    expect(recovered(100, 100, 0)).toBe(100)
  })
})
