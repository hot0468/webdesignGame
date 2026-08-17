import {
  AD_REFERRAL_MULT,
  INVESTS,
  WELFARE_GRUDGE,
  WELFARE_MENTAL,
  findInvest,
  type InvestId,
} from '../data/invest'

/** 월 투자의 규칙. **순수 함수다**(`src/systems/` 규칙).
 *
 * ⚠️ **효과를 여기서만 읽는다** — 화면도 스토어도 이 함수들을 부른다. 곱하는 값을
 *    두 곳에 적으면 "켰다고 적힌 것과 다르게 도는" 판이 된다(`apCost`가 한 함수인 것과
 *    같은 이유).
 *
 * ⚠️ 켜 둔 목록(`on`)만 받는다 — 무엇을 켰는지는 스토어가 들고, 그 값이 뜻하는 바는
 *    여기가 안다. */

/** 켜 둔 투자의 월 지출 합. */
export const investCost = (on: readonly string[]): number =>
  INVESTS.filter((i) => on.includes(i.id)).reduce((sum, i) => sum + i.cost, 0)

/** 소개 확률에 곱할 값. 광고를 안 켰으면 1(그대로)이다. */
export const referralMult = (on: readonly string[]): number =>
  on.includes('ad') ? AD_REFERRAL_MULT : 1

/** 복지가 더해 주는 주당 정신력. */
export const welfareMental = (on: readonly string[]): number =>
  on.includes('welfare') ? WELFARE_MENTAL : 0

/** 복지가 매주 풀어 주는 직원 불만. ⚠️ **쌓인 것이 있을 때만** 준다 — 0 밑으로 내리면
 *  거절을 미리 사 두는 셈이 되어 요청을 무시하는 것이 최적이 된다. */
export const welfareGrudge = (on: readonly string[], grudge: number): number =>
  on.includes('welfare') ? Math.max(0, grudge - WELFARE_GRUDGE) : grudge

/** 그 투자를 켤 수 있는가. ⚠️ **이미 켰으면 못 켠다**(중복 지출을 막는다).
 *  돈은 보지 않는다 — 월 지출이라 켜는 순간 나가는 것이 아니고, 정산에서 못 내면
 *  급여 밀림과 같은 길로 벌을 받는다(`unpaidMonths`). */
export const canInvest = (id: InvestId, on: readonly string[]): boolean =>
  !on.includes(id) && findInvest(id) !== undefined
