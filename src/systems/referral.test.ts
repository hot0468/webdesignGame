import { describe, expect, it } from 'vitest'
import { INITIAL_CLIENTS, REFERRAL_CLIENTS } from '../data/company'
import {
  AWARD_MIN_GRADE,
  COPYRIGHT_FROM_WEEK,
  REFERRAL_MIN_REPUTATION,
} from '../data/events'
import type { Grade } from '../data/game'
import { awardWon, copyrightHit, referralOf } from './referral'

/** 그 조건에서 실제로 일어나는 주를 찾는다(확률이라 여러 주를 훑는다). */
const someWeek = (fn: (w: number) => boolean, from = 1, to = 400) => {
  for (let w = from; w <= to; w++) if (fn(w)) return w
  return undefined
}

describe('소개·추천', () => {
  const known = [...INITIAL_CLIENTS]

  // ⚠️ 뒤집기: 문턱이 없으면 "평판을 올린 보상"이 아니라 시간이 주는 것이 된다.
  it('평판이 문턱 아래면 절대 오지 않는다', () => {
    expect(
      someWeek((w) => referralOf(w, REFERRAL_MIN_REPUTATION - 1, known) !== undefined),
    ).toBeUndefined()
  })

  it('문턱을 넘으면 언젠가 온다', () => {
    expect(
      someWeek((w) => referralOf(w, REFERRAL_MIN_REPUTATION, known) !== undefined),
    ).toBeDefined()
  })

  it('소개받는 곳은 아직 거래하지 않는 업체다', () => {
    const w = someWeek((x) => referralOf(x, 100, known) !== undefined)!
    const id = referralOf(w, 100, known)!
    expect(REFERRAL_CLIENTS).toContain(id)
    expect(known).not.toContain(id)
  })

  // ⚠️ 같은 곳을 두 번 소개받으면 "새 거래처"라는 뜻이 사라진다.
  it('이미 아는 곳은 다시 소개하지 않는다 — 다 알면 그친다', () => {
    const all = [...INITIAL_CLIENTS, ...REFERRAL_CLIENTS]
    expect(someWeek((w) => referralOf(w, 100, all) !== undefined)).toBeUndefined()
  })

  it('같은 주는 늘 같은 답이다', () => {
    const w = someWeek((x) => referralOf(x, 100, known) !== undefined)!
    expect(referralOf(w, 100, known)).toBe(referralOf(w, 100, known))
  })
})

describe('수상', () => {
  const good: Grade[] = [AWARD_MIN_GRADE as Grade]
  const poor: Grade[] = ['D']

  // ⚠️ 뒤집기: 후보를 안 보면 만든 것도 없는데 상을 받는 판이 된다.
  it('자랑할 작업물이 없으면 절대 못 받는다', () => {
    expect(someWeek((w) => awardWon(w, []))).toBeUndefined()
    expect(someWeek((w) => awardWon(w, poor))).toBeUndefined()
  })

  it('기준 등급 이상이 있으면 언젠가 받는다', () => {
    expect(someWeek((w) => awardWon(w, good))).toBeDefined()
  })
})

describe('저작권 위반', () => {
  // ⚠️ 초반에 현금이 마르면 회복이 불가능하다 — 그래서 늦게 시작한다.
  it('정해진 주차 전에는 오지 않는다', () => {
    expect(someWeek((w) => copyrightHit(w, 5), 1, COPYRIGHT_FROM_WEEK - 1)).toBeUndefined()
  })

  // ⚠️ 납품이 없으면 걸릴 일도 없다(내가 만든 것에서 나오는 사건이다).
  it('납품한 것이 없으면 오지 않는다', () => {
    expect(someWeek((w) => copyrightHit(w, 0))).toBeUndefined()
  })

  it('납품이 쌓이면 언젠가 온다', () => {
    expect(someWeek((w) => copyrightHit(w, 3), COPYRIGHT_FROM_WEEK)).toBeDefined()
  })
})
