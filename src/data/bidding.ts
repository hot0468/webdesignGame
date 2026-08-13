/** 업무 수주 사이트(수주센터)의 수치 단일 출처.
 *
 * ⚠️ 컴포넌트에 숫자를 적지 않는다 — 두 번째 출처가 생기면 밸런스 테스트가 그쪽을 못 본다.
 *
 * **이 고리는 메일 의뢰와 완전히 다르다.** 메일로 온 의뢰는 오면 무조건 받을 수 있지만,
 * 공고는 ①참가 조건을 맞춰야 입찰할 수 있고 ②기한 안에 걸어야 하며 ③입찰해도 **추첨**이라
 * 떨어질 수 있고 ④결과는 **익주**에 온다.
 * 그래서 이쪽의 값은 넷으로 갈린다: **참가 조건**(못 맞추면 입찰 불가) · **입찰 비용**
 * (행동력) · **입찰 기한**(지나면 못 건다) · **낙찰 확률 계수**(평판·능력치가 민다).
 *
 * ⚠️ 규칙은 전부 `systems/bidding.ts`의 순수 함수가 진다 — 여기 있는 것은 **값뿐**이다. */

import type { Grade } from './game'
import type { JobKind } from '../systems/pipeline'

/** 한 주에 뜨는 공고 수. ⚠️ 입찰 비용(`BID_AP`)과 함께 읽어야 한다 —
 *  공고가 행동력보다 훨씬 많으면 "무엇에 걸까"가 선택이 되고, 적으면 전부 걸게 된다.
 *  ⚠️ 기한(`BID_OPEN_WEEKS`)이 있어 화면에는 **이 수보다 많이** 선다(지난 주 공고가 함께). */
export const LISTINGS_PER_WEEK = 4

/** 입찰 한 건의 값(행동력). ⚠️ **0으로 두지 마라** — 공짜면 조건이 맞는 공고에 전부
 *  입찰하는 것이 늘 정답이라 이 화면이 선택이 아니라 버튼 누르기가 된다(`POST_AP`와
 *  같은 이유로 무는 값이다). 떨어져도 돌려주지 않는다 — 추첨에 건 값이라서다. */
export const BID_AP = 1

/** 입찰할 수 있는 **최소 회사등급**(`COMPANY_GRADES`의 id, 설계자 확정 2026-08-13).
 *
 * ⚠️ 극소기업(평판 20 미만)은 입찰 자체가 막힌다 — 관급 공고에 명함을 못 내미는 1인
 *    회사라는 뜻이다. 그래서 **초반의 길은 메일·고객게시판 의뢰 하나**이고, 그걸로 평판을
 *    올려야 수주센터가 열린다(수주 경로 둘이 같은 시점에 열리면 앞의 것이 뜻을 잃는다).
 * ⚠️ 등급은 평판에서 파생하므로 **내려가기도 한다** — 평판이 떨어지면 다시 닫힌다. */
export const BID_MIN_GRADE = 'small'

/** ── 입찰 기한 ─────────────────────────────────────────────
 *
 * 공고는 **뜬 주에만 걸 수 있는 것이 아니다** — `BID_OPEN_WEEKS`주 동안 열려 있고,
 * 그 뒤로는 마감이라 입찰 버튼이 그려지지 않는다(사용자 원문: "입찰 응모 가능 기한").
 *
 * ⚠️ **1 이상이어야 한다.** 0이면 뜬 주에 바로 닫혀 기한이라는 개념이 성립하지 않는다.
 * ⚠️ 기한이 있다는 것은 **지난 주 공고도 화면에 서야 한다**는 뜻이다 — 뜬 주에만 보이면
 *    기한이 하루도 남지 않은 것과 같다(`openListings`가 그 줄을 진다). */
export const BID_OPEN_WEEKS = 2

/** 결과가 나오기까지 걸리는 주. **익주다**(사용자 원문: "기한 안에 입찰 넣으면 익주에
 *  결과 옴"). ⚠️ 판정이 도는 자리는 `advanceWeek` 하나다 — 누르는 즉시 결과가 나오면
 *  기다림이 없고, 주차를 넘기는 것이 결과를 여는 유일한 손짓이라야 기한이 뜻을 가진다. */
export const BID_RESULT_WEEKS = 1

/** ── 참가 조건 ─────────────────────────────────────────────
 *
 * 공고마다 **최소 직원수 · 시안 장수 · 기획안 랭크** 셋을 요구한다(사용자 원문).
 * 셋을 다 맞춰야 추첨에 들어간다. 무엇을 무엇으로 읽는지는 **이미 있는 것에서 온다**:
 *   - 최소 직원수 = 스토어 `employees`의 수
 *   - 시안 장수   = 스토어 `drafts`(피그마로 만든 시안)의 수 — 회사의 포트폴리오다
 *   - 기획안 랭크 = 스토어 `slides`(PPT로 만든 화면정의서·발표자료) 중 **가장 높은 등급**
 * ⚠️ 새 개념을 만들지 않는다. 셋 다 게임을 굴리면 저절로 쌓이는 것이라, 수주센터는
 *    "일을 해 온 회사만 큰 일을 딴다"는 고리가 된다.
 *
 * ⚠️ 랭크는 **가장 높은 것**을 본다(약한 고리 규칙의 반대다) — 완료 보상은 실수를 벌하는
 *    자리라 최저를 보지만, 여기는 회사가 무엇까지 할 수 있는지를 증명하는 자리다. */
export type Requirement = {
  /** 최소 직원수. 0이면 1인 회사도 들어간다. */
  employees: number
  /** 시안 장수(포트폴리오). */
  drafts: number
  /** 기획안 랭크(이 등급 **이상**의 `slides`가 하나라도 있어야 한다).
   *  ⚠️ **없으면 안 따진다** — `'F'`로 적어 두면 "가장 낮은 등급이면 된다"가 아니라
   *     "기획안이 한 장은 있어야 한다"가 되어, 아무것도 없는 1인 회사가 **첫 공고를 딸
   *     길이 사라진다**(그러면 조건을 채울 재료를 모을 수가 없다). */
  rank?: Grade
}

/** 공고 규모 세 단. **조건·단가·경쟁률이 함께 오른다** — 조건만 높고 보상이 같으면
 *  큰 공고를 볼 이유가 없고, 보상만 높으면 조건이 벌이 아니라 관문 표시가 된다.
 *
 * ⚠️ `minReputation` 오름차순이다. 그리고 **평판이 뜨는 공고의 규모를 정한다** —
 *    설계 결정표의 "낮으면 단가 하락"이 이 표로 산다(낮은 평판에는 작은 공고만 뜬다).
 * ⚠️ `feeMult`는 `BASE_FEE`에 곱해지고 등급 배율(`GRADE_REWARD`)과 **또 곱해진다** —
 *    여기서 등급을 따로 손대지 않는다. */
export const LISTING_TIERS = [
  {
    id: 'small',
    label: '소규모',
    minReputation: 0,
    feeMult: 1,
    // ⚠️ 조건이 없다 — **처음 시작한 회사가 들어갈 수 있는 유일한 문**이다.
    //    여기서 딴 일이 시안·기획안을 만들고, 그것이 위 두 단의 자격이 된다.
    require: { employees: 0, drafts: 0 },
    /** 경쟁률(입찰자 수 느낌). 확률의 바닥을 정한다 — 아래 `BID_BASE`와 함께 읽는다. */
    rivals: 3,
  },
  {
    id: 'medium',
    label: '중규모',
    minReputation: 30,
    feeMult: 1.5,
    require: { employees: 1, drafts: 2, rank: 'C' },
    rivals: 5,
  },
  {
    id: 'large',
    label: '대규모',
    minReputation: 55,
    feeMult: 2.4,
    require: { employees: 3, drafts: 5, rank: 'A' },
    rivals: 8,
  },
] as const satisfies readonly {
  id: string
  label: string
  minReputation: number
  feeMult: number
  require: Requirement
  rivals: number
}[]

export type TierId = (typeof LISTING_TIERS)[number]['id']

/** ⚠️ `require`를 **`Requirement`로 넓혀서** 내보낸다. `as const`가 칸을 하나하나
 *  리터럴로 좁혀 버리면 조건이 없는 단(`small`)의 타입에는 `rank` 칸 자체가 없어져,
 *  화면이 `tier.require.rank`를 읽는 순간 타입 오류가 난다(겪었다). */
export type ListingTier = Omit<(typeof LISTING_TIERS)[number], 'require'> & {
  require: Requirement
}

export const findTier = (id: TierId): ListingTier => LISTING_TIERS.find((t) => t.id === id)!

/** ── 낙찰 확률 ─────────────────────────────────────────────
 *
 * **회사평판 + 능력치**가 정한다(사용자 원문). 화면은 입찰 전에 이 값을 적는다 —
 * 모르고 거는 도박이 아니라 판단이어야 한다.
 *
 * 공식(`systems/bidding.ts`의 `winChance`):
 *   기본  = `BID_BASE` / 경쟁률(`rivals`)          ← 규모가 클수록 바닥이 낮다
 *   보정  = 평판 × `REPUTATION_WEIGHT` + 능력치평균 × `STAT_WEIGHT`
 *   결과  = clamp(기본 + 보정, `BID_MIN`, `BID_MAX`)
 *
 * ⚠️ **0도 1도 되지 않는다.** 0이면 조건을 맞춰 입찰했는데 이길 길이 없어 입찰이 뜻을
 *    잃고, 1이면 추첨이 아니라 지급이 된다. 양끝이 `BID_MIN`/`BID_MAX`인 이유다. */

/** 경쟁률로 나누기 전의 바닥값. `BID_BASE / rivals`가 "아무 강점 없는 회사"의 확률이다. */
export const BID_BASE = 1

/** 평판 0~100이 확률에 더하는 몫(최대 `100 × 이 값`). */
export const REPUTATION_WEIGHT = 0.004

/** 능력치 평균 0~100이 더하는 몫. ⚠️ 평판보다 **작다** — 설계 결정표가 "평판 하나가
 *  수주 사이트를 정한다"고 못박았으므로 능력치는 거드는 축이다. */
export const STAT_WEIGHT = 0.002

export const BID_MIN = 0.05
export const BID_MAX = 0.9

/** ── 포트폴리오 보정 ────────────────────────────────────────
 *
 * 잘 만든 작업물이 쌓이면 낙찰 확률이 오른다. **참가 조건(`Requirement`)과 다른 축이다**:
 * 저쪽은 문턱(못 넘으면 입찰 자체가 불가)이고 이쪽은 **심사에서 얹히는 점수**라, 조건을
 * 겨우 맞춘 회사와 좋은 것을 쌓아 온 회사가 같은 확률을 받지 않는다.
 *
 * ⚠️ **새 상태가 아니다** — 이미 있는 `files`·`drafts`·`slides`의 등급에서 파생한다
 *    (`systems/portfolio.ts`). 저장하지 마라.
 * ⚠️ `winChance`의 **`stats` 인자에 더해진다**(0~100 스케일 위의 값이다) — 확률에 직접
 *    더하지 않는다. 확률을 만드는 식이 두 곳으로 갈리면 화면이 적는 값과 스토어가 굴리는
 *    값이 어긋난다(`bidStats` 한 함수가 정본인 이유와 같다). */

/** 포트폴리오에 **얹히는** 최소 등급. ⚠️ 낮추지 마라 — 아무 등급이나 세면 '간단하게'로
 *  잔뜩 찍어 내는 것이 최적이 되어, 공들이는 선택(`QUALITY`)이 뜻을 잃는다. */
export const PORTFOLIO_MIN_GRADE: Grade = 'A'

/** 그런 작업물 하나가 `stats`에 더하는 몫. */
export const PORTFOLIO_BONUS_PER = 5

/** ⚠️ **상한이 있어야 한다.** 없으면 오래 굴린 판이 확률 상한(`BID_MAX`)에 그냥 닿아
 *  추첨이 지급이 된다 — 쌓는 것은 거드는 축이지 평판을 대신하는 축이 아니다. */
export const PORTFOLIO_BONUS_MAX = 50

/** 공고의 마감(주). ⚠️ **낙찰 메일에서 사업을 시작하는 순간부터 센다** — 입찰하고
 *  결과를 기다린 주는 기한을 먹지 않는다(`acceptJob`이 `dueWeeks`를 받는 순간 굳는다). */
export const LISTING_DUE_WEEKS = 4

/** 공고에 뜨는 업무 종류. ⚠️ **팝업은 빠진다** — 게시 기간(`popup`)을 지고
 *  `dueWeeks > toWeeks` 불변식이 있어(`data/inbox.ts`) 발주처가 정해지지 않은 공고로는
 *  성립하지 않는다(`systems/weekend.ts`가 같은 이유로 뺐다). */
export const LISTING_KINDS = ['site', 'ppt', 'fix'] as const satisfies readonly JobKind[]

/** 발주처 이름 재료. ⚠️ 전부 게임 안의 가짜 이름이다(`data/company.ts`와 같은 이유).
 *  ⚠️ `CLIENTS`를 쓰지 않는다 — 수주센터는 **처음 보는 곳**에서 일을 따는 자리다
 *    (계약 업체의 유지보수는 고객게시판이 진다). */
export const ORDERER_HEADS = ['새봄', '온누리', '하나로', '가온', '푸른', '너울', '한결', '다솜'] as const
export const ORDERER_TAILS = ['공단', '문화재단', '협동조합', '연구소', '아카데미', '센터'] as const

/** 종류별 공고 문안. ⚠️ **제목은 짧게** 유지한다 — 계기판 업무목록이 한 줄이라
 *  길면 업체 이름까지 줄임표를 문다(`systems/weekend.ts`가 같은 주의를 적고 있다). */
export const LISTING_TEXT = {
  site: {
    subject: '홈페이지 구축 입찰',
    body: '기관 홈페이지를 새로 구축할 업체를 찾습니다. 화면정의서부터 퍼블리싱까지 일괄 수행 가능한 곳으로 지원 바랍니다. 참가 자격을 충족한 업체 중에서 선정합니다.',
  },
  ppt: {
    subject: '사업설명회 자료 제작',
    body: '연간 사업설명회에 쓸 발표자료 제작을 맡길 업체를 찾습니다. 원고는 저희가 드리고 장표 구성과 디자인을 맡기는 건입니다.',
  },
  fix: {
    subject: '홈페이지 부분 개선',
    body: '운영 중인 홈페이지의 일부 화면을 손봐 주실 업체를 찾습니다. 큰 작업은 아니지만 기존 소스를 다룰 수 있어야 합니다.',
  },
} as const satisfies Record<(typeof LISTING_KINDS)[number], { subject: string; body: string }>
