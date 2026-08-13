import { PORTFOLIO_BONUS_MAX, PORTFOLIO_BONUS_PER, PORTFOLIO_MIN_GRADE } from '../data/bidding'
import type { Grade } from '../data/game'
import { GRADE_ORDER } from './pipeline'

/** 쌓인 작업물이 수주에 얹어 주는 몫. **순수 함수다**(`src/systems/` 규칙 —
 *  React·mutation·`Math.random` 없음).
 *
 * ⚠️ **저장하는 것이 없다.** 회사의 포트폴리오는 이미 `files`·`drafts`·`slides` 세 목록에
 *    다 있고, 여기서는 그 등급만 센다(`meetings`의 정답을 저장하지 않는 것과 같은 규칙).
 *
 * ⚠️ 세는 것은 **`PORTFOLIO_MIN_GRADE` 이상**뿐이다 — 개수만 세면 '간단하게'로 잔뜩
 *    찍어 내는 것이 최적이 되어, 공들이는 선택이 뜻을 잃는다. 잘 만든 것만 자랑이 된다.
 *
 * ⚠️ 등급 사다리의 정본은 `pipeline.ts`의 `GRADE_ORDER` 하나다 — 여기서 다시 적지 않는다. */

/** 포트폴리오에 걸 만한 작업물인가. */
export const isShowpiece = (grade: Grade): boolean =>
  GRADE_ORDER.indexOf(grade) >= GRADE_ORDER.indexOf(PORTFOLIO_MIN_GRADE)

/** 자랑할 만한 작업물의 수. 화면(작업물 창)도 이 함수로 센다 — 확률에 실리는 수와
 *  화면이 적는 수가 갈리면 "적힌 것과 다르게 굴렸다"가 된다. */
export const showpieces = (grades: readonly Grade[]): number => grades.filter(isShowpiece).length

/** 낙찰 확률의 `stats` 인자에 **더해지는 값**(0~100 스케일 위에 얹힌다).
 *  ⚠️ 확률에 직접 더하지 않는다 — 확률을 만드는 식은 `winChance` 하나뿐이어야 한다. */
export const portfolioBonus = (grades: readonly Grade[]): number =>
  Math.min(PORTFOLIO_BONUS_MAX, showpieces(grades) * PORTFOLIO_BONUS_PER)
