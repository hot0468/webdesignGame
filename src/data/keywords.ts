/** 시안의 **분위기 키워드**. 게임 수치·문자열의 단일 출처다(`src/data/` 규칙 —
 *  컴포넌트에 목록을 적으면 밸런스 테스트가 못 보는 두 번째 출처가 생긴다).
 *
 * 고리는 이렇다:
 *   사이트 수주 → **클라이언트 미팅**(행동력 `MEETING_AP`)에서 원하는 키워드 몇 개를 알아냄
 *     → 피그마에서 시안을 만들 때 `SITE_KEYWORDS` 개를 고름
 *     → 맞춘 수가 **시안 등급을 올리거나 내린다**(`systems/keywords.ts`)
 *
 * ⚠️ 적중이 **대금·평판에 따로 곱하지 않는다.** 등급은 이미 만족도 → 대금 → 평판으로
 *    흐르므로(`systems/money.ts`의 `GRADE_REWARD`), 여기서 축을 새로 만들면 같은 노력이
 *    두 번 값으로 매겨진다. 키워드는 **등급 한 칸을 미는 힘**으로만 산다. */

/** 고를 수 있는 분위기 키워드 전부. ⚠️ 이 목록은 **클라이언트가 원하는 것을 뽑는 통**이자
 *  플레이어가 고르는 통이다 — 둘을 다른 목록으로 나누면 절대 못 맞추는 키워드가 생긴다.
 *
 * ⚠️ 서로 반대인 것들(차분한 ↔ 강렬한, 많은 정보 ↔ 여백이 많은)이 일부러 함께 있다.
 *    무엇을 고르든 손해가 없으면 미팅으로 알아낼 이유가 없다. */
export const KEYWORDS = [
  { id: 'trust', label: '신뢰감있는' },
  { id: 'calm', label: '차분한' },
  { id: 'trendy', label: '트렌디한' },
  { id: 'interactive', label: '많은 인터렉션' },
  { id: 'dense', label: '많은 정보' },
  { id: 'visual', label: '비주얼 위주' },
  { id: 'bold', label: '강렬한' },
  { id: 'airy', label: '여백이 많은' },
  { id: 'warm', label: '따뜻한' },
  { id: 'minimal', label: '미니멀한' },
] as const satisfies readonly { id: string; label: string }[]

export type KeywordId = (typeof KEYWORDS)[number]['id']

export const findKeyword = (id: KeywordId) => KEYWORDS.find((k) => k.id === id)!

/** 사이트 한 건에 걸린 키워드 수. **클라이언트가 원하는 수 = 플레이어가 고르는 수**다 —
 *  둘이 다르면 "몇 개까지 맞출 수 있나"가 화면마다 달라진다. */
export const SITE_KEYWORDS = 5

/** 클라이언트 미팅 1회 비용(행동력). ⚠️ 제작 공정이 아니므로 가장 싼 값 하나다 —
 *  미팅이 시안만큼 비싸면 아무도 하지 않고, 그러면 이 기능이 화면에만 남는다. */
export const MEETING_AP = 1

/** 기획력 → 미팅에서 알아내는 키워드 수. **오름차순이고 첫 칸이 0이어야 한다**
 *  (`revealCount`가 그 순서에 기댄다 — `COMPANY_GRADES`와 같은 규칙).
 *
 * ⚠️ 최고 칸도 `SITE_KEYWORDS`(5)보다 적다. 전부 알아내면 미팅 뒤의 선택이 사라지고
 *    시안이 그냥 받아쓰기가 된다 — **모르는 채로 고르는 칸이 남는 것**이 이 기능의 재미다.
 * ⚠️ 시작 기획력 30은 임시치라(`INITIAL_GAME.planning`) 지금은 2개를 알아낸다. */
export const MEETING_REVEAL = [
  { minPlanning: 0, count: 1 },
  { minPlanning: 25, count: 2 },
  { minPlanning: 50, count: 3 },
  { minPlanning: 75, count: 4 },
] as const

/** 맞춘 키워드 수 → 등급을 미는 칸 수. **`GRADE_ORDER` 위에서 더하고 뺀다**
 *  (`systems/keywords.ts`의 `keywordShift`).
 *
 * ⚠️ 길이가 `SITE_KEYWORDS + 1`이어야 한다(0개~5개 전부). 표가 짧으면 다 맞춘 경우가
 *    표 밖으로 나간다 — `keywords.test.ts`가 이 길이를 지킨다.
 * ⚠️ 기준선은 **절반(2~3개)**이다: 아무 정보 없이 찍어도 평균 절반은 맞으므로, 그 자리가
 *    0이라야 미팅을 한 사람만 이득을 본다. 다 틀리면 두 칸 내려가고 다 맞히면 두 칸 오른다. */
export const KEYWORD_SHIFT = [-2, -1, 0, 0, 1, 2] as const
