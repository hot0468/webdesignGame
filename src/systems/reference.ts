import {
  AWARD_COUNT,
  AWARDS,
  CATEGORIES,
  SHOT_THEMES,
  STUDIOS,
  WORK_KINDS,
  WORK_WORDS,
} from '../data/reference'
import { roller } from './seed'

/** 레퍼런스 사이트(어워더즈)에 걸리는 수상작. **순수 함수다**(`src/systems/` 규칙 —
 * React·mutation·`Math.random` 없음).
 *
 * ⚠️ 목록을 **저장하지 않는다** — 주차 하나에서 파생한다(`systems/hire.ts`의 지원자,
 *    `systems/bidding.ts`의 공고와 같은 관용구). 같은 주는 늘 같은 수상작이라 창을
 *    닫았다 열어 굴릴 수 없고, 새 상태 축도 생기지 않는다.
 *
 * ⚠️ 이 목록에는 **고를 것이 없다** — 구경 버튼은 화면에 하나뿐이고 무엇이 걸렸는지는
 *    영감의 값을 바꾸지 않는다. 그래서 여기서 나온 값은 전부 **읽는 글**이다. */

/** 걸린 수상작 하나. */
export type AwardWork = {
  id: string
  name: string
  studio: string
  category: string
  award: string
  /** 썸네일 테마 번호(0 ~ `SHOT_THEMES` − 1). **이미지가 아니라 CSS로 그린다** —
   *  값은 `browser.css`의 `.nv-ref__shot--<n>`이 진다(외부 이미지·CDN 금지). */
  shot: number
}

/** 그 주의 수상작들. **씨앗은 주차다.** */
export function awardWorks(week: number, count = AWARD_COUNT): AwardWork[] {
  return Array.from({ length: count }, (_, i) => {
    const r = roller(`ref:${week}:${i}`)
    return {
      id: `ref:${week}:${i}`,
      name: `${r.pick(WORK_WORDS)} ${r.pick(WORK_KINDS)}`,
      studio: r.pick(STUDIOS),
      category: r.pick(CATEGORIES),
      award: r.pick(AWARDS),
      shot: r.int(0, SHOT_THEMES - 1),
    }
  })
}
