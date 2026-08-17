import { describe, expect, it } from 'vitest'
import { AD_REFERRAL_MULT, INVESTS, WELFARE_MENTAL, findInvest } from '../data/invest'
import {
  canInvest,
  investCost,
  referralMult,
  welfareGrudge,
  welfareMental,
} from './invest'

describe('월 투자', () => {
  it('켠 것만 돈이 나간다', () => {
    expect(investCost([])).toBe(0)
    expect(investCost(['ad'])).toBe(findInvest('ad').cost)
    expect(investCost(['ad', 'welfare'])).toBe(
      findInvest('ad').cost + findInvest('welfare').cost,
    )
  })

  it('모르는 id는 세지 않는다', () => {
    expect(investCost(['없는것'])).toBe(0)
  })

  // ⚠️ 뒤집기: 안 켠 상태의 곱이 1이 아니면 투자 없이도 효과가 걸린다.
  it('안 켰으면 아무 효과도 없다', () => {
    expect(referralMult([])).toBe(1)
    expect(welfareMental([])).toBe(0)
    expect(welfareGrudge([], 3)).toBe(3)
  })

  it('켜면 효과가 걸린다', () => {
    expect(referralMult(['ad'])).toBe(AD_REFERRAL_MULT)
    expect(welfareMental(['welfare'])).toBe(WELFARE_MENTAL)
    expect(welfareGrudge(['welfare'], 3)).toBe(2)
  })

  // ⚠️ 0 밑으로 내리면 거절을 미리 사 두는 셈이 되어 요청을 무시하는 것이 최적이 된다.
  it('불만은 0 밑으로 안 내려간다', () => {
    expect(welfareGrudge(['welfare'], 0)).toBe(0)
  })

  it('이미 켠 것은 다시 못 켠다 — 중복 지출을 막는다', () => {
    expect(canInvest('ad', [])).toBe(true)
    expect(canInvest('ad', ['ad'])).toBe(false)
  })

  it('화면이 적는 값과 규칙이 같은 표에서 나온다', () => {
    for (const i of INVESTS) expect(findInvest(i.id).cost).toBe(i.cost)
  })
})
