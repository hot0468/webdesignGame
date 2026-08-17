/** **매달 나가는 투자.** 켜고 끌 수 있고, 켜 두면 매 정산에서 돈이 빠진다.
 *
 * ⚠️ 왜 필요한가: 후반(20주쯤)이면 평판·레벨·거래처가 전부 천장을 치고 **돈만 쌓인다**
 *    (50주 굴려 3,600만원). 상점은 한 번 사면 끝이라 지출이 마른다 — 매달 나가는 것이
 *    있어야 돈이 계속 뜻을 갖고, 벌이가 줄면 끄는 선택이 생긴다.
 *
 * ⚠️ **효과는 이미 있는 축에만 붙인다**(정신력 회복·소개 확률·직원 불만). 새 축을
 *    만들면 투자 하나 때문에 게임이 두 겹으로 늘어난다 — 상점이 같은 규칙을 진다.
 *
 * ⚠️ 값은 **월 단위**다(`MAINTENANCE_FEE` 12만·급여 40만~와 같은 자리에서 빠진다).
 *    스펙에 없는 임시치이고, 기준은 "유지보수 계약 한두 곳이면 감당된다"이다.
 *
 * ⚠️ **상점과 다른 축이다** — 저쪽은 한 번 사고 끝, 이쪽은 매달 나간다. 같은 화면에
 *    섞지 말 것(무엇이 반복 지출인지가 흐려진다). */

export type Invest = {
  id: string
  name: string
  desc: string
  /** 월 고정 지출(원). */
  cost: number
  /** 화면이 적는 효과 한 줄. ⚠️ 숫자는 아래 상수에서 온다(문안에 값을 박지 않는다). */
  effect: string
}

/** 광고가 늘리는 소개 확률(곱). ⚠️ 소개는 평판 문턱을 먼저 넘어야 오므로, 광고만으로는
 *  거래처가 늘지 않는다 — **평판을 올린 사람에게 더 빨리 오는 것**이 이 투자의 뜻이다. */
export const AD_REFERRAL_MULT = 2

/** 복지가 더해 주는 주당 정신력 회복. ⚠️ 기본 회복(`MENTAL_RECOVERY` 12)의 절반 남짓이다 —
 *  이보다 크면 주말 근무의 대가가 사라져 매주 주말에 일하는 것이 최적이 된다. */
export const WELFARE_MENTAL = 6

/** 복지가 매주 줄여 주는 직원 불만. ⚠️ 요청을 거절해도 **완전히 상쇄되지는 않게** 1이다
 *  (거절 하나가 `GRUDGE_PER_REFUSAL` 1을 쌓는다) — 상쇄되면 요청을 다 거절해도 그만이다.
 *  쌓인 것이 있을 때만 준다. */
export const WELFARE_GRUDGE = 1

export const INVESTS = [
  {
    id: 'ad',
    name: '검색 광고',
    desc: '웹디검색에 회사를 노출합니다. 소개가 더 자주 들어옵니다.',
    cost: 300_000,
    effect: '소개 확률 2배',
  },
  {
    id: 'welfare',
    name: '직원 복지',
    desc: '간식과 휴게 공간을 마련합니다. 정신력이 더 회복되고 직원 불만이 천천히 풀립니다.',
    cost: 500_000,
    effect: '주당 정신력 +6 · 불만 −1',
  },
] as const satisfies readonly Invest[]

export type InvestId = (typeof INVESTS)[number]['id']

export const findInvest = (id: InvestId): Invest => INVESTS.find((i) => i.id === id)!
