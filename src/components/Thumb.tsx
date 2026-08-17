import './thumb.css'
import type { Grade } from '../data/game'
import { PORTFOLIO_MIN_GRADE } from '../data/bidding'
import { GRADE_ORDER } from '../systems/pipeline'
import { roller } from '../systems/seed'

/** 만든 것의 썸네일. **그림이지 정보가 아니다** — 등급·이름은 옆 글자가 이미 말하므로
 *  여기에는 글자를 얹지 않고(`aria-hidden`) 합성 대비를 만들 자리도 없다(어워더즈
 *  `.nv-ref__shot`과 같은 판단).
 *
 * 세 가지가 생김새를 정한다:
 * - **종류**가 구도를 — 시안은 사이트 얼개, 팝업은 배너, 문서는 슬라이드, 퍼블리싱은 코드.
 * - **등급**이 마감새를 — F·D는 색이 죽고 비뚤어지고, A부터 윤이 난다(광 스트릭).
 *   문턱은 포트폴리오와 **같은 선**(`PORTFOLIO_MIN_GRADE`)이다 — "잘 만든 것"의 기준이
 *   두 곳에서 갈리면 별은 붙는데 그림은 평범한 파일이 생긴다.
 * - **파일 id**가 색을 — 같은 파일은 늘 같은 그림이다(`roller`, 저장하지 않는다.
 *   `clientKeywords`·`derivedClient`와 같은 규칙).
 */
export type ThumbKind = 'site' | 'popup' | 'doc' | 'code'

/** 등급 → 마감새 단. ⚠️ 경계는 규칙이 이미 정한 두 선이다: 아래는 '간단하게' 밴드의
 *  바닥(F·D — C부터는 기준선 등급이다), 위는 포트폴리오 문턱. 새 문턱을 만들지 않는다. */
const tierOf = (grade?: Grade): 0 | 1 | 2 => {
  if (!grade) return 1
  if (GRADE_ORDER.indexOf(grade) < GRADE_ORDER.indexOf('C')) return 0
  return GRADE_ORDER.indexOf(grade) >= GRADE_ORDER.indexOf(PORTFOLIO_MIN_GRADE) ? 2 : 1
}

const HUES = 4

export function Thumb({ kind, grade, seed }: { kind: ThumbKind; grade?: Grade; seed: string }) {
  const tier = tierOf(grade)
  const hue = roller(`thumb:${seed}`).int(0, HUES - 1)
  return (
    <span className={`thumb thumb--${kind} thumb--h${hue} thumb--t${tier}`} aria-hidden="true">
      {/* 구도 요소는 CSS(::before/::after + 이 칸)가 그린다. */}
      <span className="thumb__bits" />
      {tier === 2 && <span className="thumb__shine" />}
    </span>
  )
}
