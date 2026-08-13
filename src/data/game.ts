/** 게임 수치의 단일 출처. ⚠️ 컴포넌트에 숫자를 적지 않는다 —
 *  두 번째 출처가 생기면 밸런스 테스트가 그쪽을 못 본다. */

/** 시작 상태. 행동력 3은 코어 설계(§2)에서 확정된 값이다.
 *  ⚠️ mental·money·reputation의 시작값은 아직 스펙에 없다 — 곡선이 정해지면 조정한다. */
export const INITIAL_GAME = {
  /** 1부터 세는 통산 주차. */
  week: 1,
  ap: 3,
  apMax: 3,
  mental: 100,
  mentalMax: 100,
  money: 1_000_000,
  /** 0~100. 이 값 하나가 수주 사이트와 폐업(위기 4주)을 정한다. */
  reputation: 30,
  /** 디자인 스탯(0~100). **작업물 등급을 정하는 축이다**(`systems/craft.ts`) —
   *  시안도 팝업도 이 값으로 밴드 안 등급이 갈린다.
   *  ⚠️ 스펙의 6종 중 지금 쓰이는 하나만 둔다. 퍼블리싱·CS는 그 등급이 실제로
   *  쓰이는 공정이 생길 때 같은 자리에 붙인다(쓸 곳 없는 칸을 미리 만들지 않는다).
   *  ⚠️ 30은 스펙에 없는 임시치다(reputation과 같다). */
  design: 30,
  /** 기획력 스탯(0~100). **클라이언트 미팅에서 알아내는 키워드 수를 정하는 축이다**
   *  (`data/keywords.ts`의 `MEETING_REVEAL`). 디자인과 축이 다르다 — 잘 그리는 것과
   *  무엇을 원하는지 알아내는 것은 다른 일이고, 둘을 한 값으로 묶으면 미팅이 디자인
   *  스탯의 부록이 된다.
   *  ⚠️ 30은 스펙에 없는 **임시치**다(design과 같은 값 — 곡선이 정해지면 조정한다).
   *  올리는 길은 아직 없다. */
  planning: 30,
} as const

/** 평판 위기선. 이 아래로 내려가면 신규 수주가 끊기고 매주 직원이 떠난다. */
export const REPUTATION_CRISIS = 10
/** 위기가 이만큼 이어지면 폐업(두 번째 게임 오버). */
export const CRISIS_WEEKS_TO_SHUTDOWN = 4

/** **급여를 이만큼의 달 연속으로 못 주면 파산이다.**
 *
 * ⚠️ 잔액이 음수인 것 자체는 파산이 아니다 — 착수금이 들어오거나 대출을 받을 수도 있어
 *    한 달 마이너스로 회사가 문을 닫지는 않는다(설계 확정, 2026-08-13). 회사를 실제로
 *    무너뜨리는 것은 **사람에게 줄 돈을 못 주는 것**이고, 그것이 여러 달 이어질 때다.
 *
 * ⚠️ 그래서 세는 것은 **잔액이 아니라 밀린 달 수**다(`unpaidMonths`). 갚으면 0으로
 *    리셋된다 — 갚을 수 있는 빚이어야 위기에서 빠져나오는 길이 있다. */
export const UNPAID_MONTHS_TO_BANKRUPT = 3
export const REPUTATION_MAX = 100

/** 회사등급 5단. **채용 상한을 지는 유일한 표다.**
 *
 * ⚠️ 등급은 **평판에서 파생한다 — 저장하지 않는다.** 새 상태 축을 만들면 세이브 버전이
 *    올라가고 "등급을 올리는 규칙"이라는 두 번째 곡선이 생긴다. 평판은 이미 매주 움직이고
 *    (클레임·납품) 회사가 얼마나 잘 굴러가는지를 재는 값이라 그대로 등급의 축이 된다.
 * ⚠️ 그래서 등급은 **내려가기도 한다.** 채용 시스템이 붙을 때 정원 초과를 어떻게 다룰지
 *    (강등 시 퇴사 / 신규 채용만 막기) 그 자리에서 정한다.
 * ⚠️ `minReputation` 오름차순이고 첫 칸이 0이어야 한다 — `companyGrade`가 그 순서에 기댄다.
 * ⚠️ 극소기업 0명 = 1인 회사가 시작 상태라는 뜻이다(시작 평판 30은 소기업 1명). */
export const COMPANY_GRADES = [
  { id: 'micro', label: '극소기업', minReputation: 0, hireMax: 0 },
  { id: 'small', label: '소기업', minReputation: 20, hireMax: 1 },
  { id: 'sme', label: '중소기업', minReputation: 40, hireMax: 3 },
  { id: 'mid', label: '중견기업', minReputation: 60, hireMax: 6 },
  { id: 'large', label: '대기업', minReputation: 80, hireMax: 12 },
] as const

export type CompanyGrade = (typeof COMPANY_GRADES)[number]

/** 평판 → 등급. 표가 오름차순이라 "조건을 만족하는 마지막 칸"이 답이다. */
export const companyGrade = (reputation: number): CompanyGrade =>
  COMPANY_GRADES.reduce<CompanyGrade>((best, g) => (reputation >= g.minReputation ? g : best), COMPANY_GRADES[0])

/** 다음 등급(대기업이면 없음). 화면이 "얼마나 더 올려야 하나"를 적을 때 쓴다. */
export const nextGrade = (grade: CompanyGrade): CompanyGrade | undefined =>
  COMPANY_GRADES[COMPANY_GRADES.indexOf(grade as never) + 1]

/** 회사레벨 → 필요한 **누적 매출**과 그때의 행동력 상한.
 *
 * ⚠️ **누적 매출이다 — 소지금이 아니다.** 지금 가진 돈으로 재면 월정액·급여를 내는
 *    순간 레벨이 내려가고, 돈을 안 쓰고 모으기만 하는 것이 최적이 된다. 여기서 세는 것은
 *    **지금까지 벌어들인 대금의 합**이라 한 번 오른 레벨은 내려가지 않는다.
 *
 * ⚠️ 회사**등급**(`COMPANY_GRADES`, 평판에서 파생)과 다른 축이다. 등급은 채용 상한을
 *    지고 오르내리며, 레벨은 **행동력 상한**을 지고 오르기만 한다. 둘을 합치지 마라 —
 *    평판이 떨어졌다고 행동력이 줄면 위기에서 빠져나올 길이 함께 막힌다.
 *
 * ⚠️ 표가 오름차순이고 첫 칸이 `INITIAL_GAME.apMax`와 같아야 한다(`companyLevel`이
 *    "조건을 만족하는 마지막 칸"을 답으로 낸다 — `COMPANY_GRADES`와 같은 모양). */
export const COMPANY_LEVELS = [
  { level: 1, minRevenue: 0, apMax: 3 },
  { level: 2, minRevenue: 3_000_000, apMax: 4 },
  { level: 3, minRevenue: 8_000_000, apMax: 5 },
  { level: 4, minRevenue: 18_000_000, apMax: 6 },
  { level: 5, minRevenue: 35_000_000, apMax: 7 },
] as const

export type CompanyLevel = (typeof COMPANY_LEVELS)[number]

/** 누적 매출 → 회사레벨. 표가 오름차순이라 "조건을 만족하는 마지막 칸"이 답이다. */
export const companyLevel = (revenue: number): CompanyLevel =>
  COMPANY_LEVELS.reduce<CompanyLevel>(
    (best, l) => (revenue >= l.minRevenue ? l : best),
    COMPANY_LEVELS[0],
  )

/** 다음 레벨(최고면 없음). 화면이 "얼마나 더 벌어야 하나"를 적을 때 쓴다. */
export const nextLevel = (level: CompanyLevel): CompanyLevel | undefined =>
  COMPANY_LEVELS[COMPANY_LEVELS.indexOf(level as never) + 1]

/** 마감이 **이만큼 남았거나 덜 남으면 임박**이다(업무목록에서 빨갛게 선다).
 *  ⚠️ 1주 = 남은 턴이 이번 주 하나뿐이라는 뜻이다. 데드라인 초과는 계약 파기라
 *  이 경고가 마지막 신호다. */
export const DEADLINE_URGENT_WEEKS = 1

/** 달력 환산의 단위. 주차 → 몇 월 몇째 주는 이 값으로만 나눈다. */
export const WEEKS_PER_MONTH = 4
export const MONTHS_PER_YEAR = 12

/** 한 주의 요일. ⚠️ **뒤 `WEEKEND_COUNT`개가 주말**이다 — 주말 근무는 선택이라
 *  달력이 그 이틀을 따로 칠한다. 순서를 바꾸면 주말 칸이 엉뚱한 요일로 간다. */
export const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'] as const
export const WEEKEND_COUNT = 2

/** 창을 처음 열 때의 위치와, 겹치지 않게 계단식으로 밀어내는 간격(px).
 *  ⚠️ `y`는 **화면 위쪽 기준**이다(바탕화면 아이콘과 같은 24px 여백) — 창이 클수록
 *  아래로 쓸 높이가 필요하므로 위에서 시작한다. 가운데 정렬로 바꾸지 말 것. */
export const WINDOW_SPAWN = { x: 160, y: 24, cascade: 28 } as const

/** 드래그로 창을 화면 밖에 버려 되찾을 수 없게 되는 것을 막는 최소 노출량(px).
 *  ⚠️ 세로 96은 index.css의 `--os-taskbar-h`(56) + `--os-titlebar-h`(40)와 같은 값이다 —
 *  타이틀바가 작업 표시줄 **위에** 온전히 남아야 다시 잡을 수 있다. 그 토큰을 바꾸면 여기도 바꾼다. */
export const WINDOW_DRAG = { keepVisible: 96 } as const

/** 제작 퀄리티 세 갈래. **행동력 비용과 나올 수 있는 등급대를 함께 진다** —
 *  피그마(시안)와 포토샵(팝업)이 **같은 표**를 쓴다(공정이 달라도 "얼마나 공들이나"는
 *  한 축이다. 표를 둘로 나누면 밸런스가 두 곳에서 갈린다).
 *
 * ⚠️ 밴드는 **겹친다**(간단하게 최고 = B, 열심히 최저 = C). 겹치는 구간이 있어야
 *    "스탯이 낮으면 공들여도 별로"와 "스탯이 높으면 대충 해도 쓸 만"이 둘 다 성립한다.
 * ⚠️ 등급이 무엇이 되는지는 스탯이 정한다(`systems/craft.ts`의 `gradeOf`) — 여기 표는
 *    **범위만** 준다. 어느 칸이 나오는지를 이 파일에서 계산하지 말 것(순수 함수의 몫이다).
 * ⚠️ 비용은 코어 설계의 퀄리티 비용(하1·중2·상3) 그대로다. 숙련도 감면은 그 스탯이
 *    생길 때 이 값에서 빼되 **하한 1**을 지킨다(0이면 무한 실행으로 붕괴). */
export const QUALITY = [
  { id: 'light', label: '간단하게', ap: 1, grades: ['F', 'D', 'C', 'B'] },
  { id: 'hard', label: '열심히', ap: 2, grades: ['C', 'B', 'A'] },
  { id: 'care', label: '매우 신경써서', ap: 3, grades: ['S', 'SS', 'SSS'] },
] as const satisfies readonly { id: string; label: string; ap: number; grades: readonly string[] }[]

export type QualityId = (typeof QUALITY)[number]['id']
export type Grade = (typeof QUALITY)[number]['grades'][number]

export const findQuality = (id: QualityId) => QUALITY.find((q) => q.id === id)!

/** 사이트 퍼블리싱(에디터) 1회 비용. 이 공정이 **그 업무의 마지막 공정**이라 여기서
 *  업무가 완료된다. ⚠️ 퀄리티 선택이 붙으면 이 값도 퀄리티 비용표(하1·중2·상3)로 바뀐다 —
 *  지금은 `QUALITY`의 '열심히'와 같은 고정값이다 — 퍼블리싱에도 퀄리티 선택이 붙으면
 *  이 상수 대신 그 표를 쓴다(제작 쪽은 이미 그렇게 돈다). */
export const PUBLISH_AP = 2

/** 팝업 클레임 한 건당 평판 하락. ⚠️ **업체·주 단위로 한 번만** 깎는다 —
 *  한 업체가 같은 주에 세 갈래로 어긋나도 메일은 한 통, 하락도 한 번이다
 *  (`systems/popup.ts`의 `judgePopups`가 묶는다). */
export const CLAIM_REPUTATION_LOSS = 5

/** 업무 종류별 기본단가(원). **완료 회신에서 지급된다**(`systems/money.ts`).
 *  ⚠️ 스펙에 수치가 없는 **임시치**다 — 시작 소지금 100만, 월 고정지출 5만 기준으로
 *  "사이트 한 건이면 두 달을 버틴다"는 감각만 맞춰 뒀다. 곡선이 정해지면 여기만 고친다. */
export const BASE_FEE = {
  popup: 300_000,
  ppt: 400_000,
  site: 1_500_000,
  fix: 150_000,
} as const

/** 등급이 대금과 평판에 함께 미치는 몫. **약한 고리(가장 낮은 등급)가 이 표를 탄다.**
 *  ⚠️ C가 기준선(배율 1.0·평판 0)이다 — 무난하게 하면 잃지도 얻지도 않고, 공들이면
 *  더 받고 평판이 오른다. 대충 하면 대금이 깎이고 평판도 깎인다. */
export const GRADE_REWARD = {
  F: { fee: 0.5, reputation: -6 },
  D: { fee: 0.7, reputation: -3 },
  C: { fee: 1, reputation: 0 },
  B: { fee: 1.1, reputation: 2 },
  A: { fee: 1.3, reputation: 4 },
  S: { fee: 1.6, reputation: 6 },
  SS: { fee: 1.9, reputation: 7 },
  SSS: { fee: 2.2, reputation: 8 },
} as const satisfies Record<Grade, { fee: number; reputation: number }>

/** 마감을 넘긴 업무의 벌. ⚠️ **위약금(현금 차감)은 두지 않는다**(코어 설계) — 초반 즉사를
 *  만든다. 손해는 대금 0 + 평판 하락, 그리고 태운 행동력으로 문다. */
export const BREACH_REPUTATION_LOSS = 10

/** 월정액(원/월). 월말 정산에서 **묶어서 한 번에** 빠진다 — 스펙의 고정 지출이다.
 *  ⚠️ 직원 급여가 생기면 여기에 더하지 말고 **직원 목록에서 계산**한다(사람 수가 정본). */
export const SUBSCRIPTIONS = [
  { label: '피그마', cost: 20_000 },
  { label: '포토샵', cost: 30_000 },
] as const

/** ── 주말 돌발 이벤트 + 정신력 ────────────────────────────────────
 *
 * 스펙: "기본적으로 주중에만 일을 하되, 확률적으로 주말에 갑자기 클라이언트 연락이 오는
 * 돌발 이벤트가 뜸. 주말은 일할 지 안 할 지 선택 가능"
 *
 * ⚠️ 돌발 이벤트는 **새 업무 축이 아니다** — 마감이 짧고 단가가 높은 평범한 `Request`를
 *    만들어 `acceptJob`에 그대로 넘긴다(설계 확정, 2026-08-13). 받은 뒤의 진행이 평소
 *    업무와 같아야 "급한 의뢰"가 게임의 다른 규칙을 전부 물려받는다.
 * ⚠️ 대가는 **정신력**이고, 낮은 정신력은 **다음 주 행동력**으로 갚는다. 게임 오버를
 *    새로 만들지 않는다(패배는 파산·폐업 둘뿐 — 정신력 0은 죽음이 아니라 느려짐이다). */

/** 주말에 돌발 의뢰가 뜰 확률. ⚠️ 시드는 주차에서 파생하므로(`systems/weekend.ts`)
 *  같은 주는 늘 같은 답이다 — 창을 닫았다 열어 굴릴 수 없다.
 *  ⚠️ 스펙에 수치가 없는 **임시치**다. 3주에 한 번 남짓이라 "주말에 늘 일한다"도
 *  "주말이 있는 줄도 모른다"도 아닌 자리를 노렸다. */
export const WEEKEND_EVENT_CHANCE = 0.35

/** 돌발 의뢰의 마감(주). ⚠️ **급한 의뢰라 1주다** — 이번 주 안에 끝내라는 뜻이고,
 *  그것이 단가가 높은 이유다. 늘리면 평소 의뢰와 다를 것이 없어진다. */
export const WEEKEND_DUE_WEEKS = 1

/** 돌발 의뢰의 단가 배율. 마감이 짧은 대신 `BASE_FEE`의 이만큼을 받는다.
 *  ⚠️ 등급 배율(`GRADE_REWARD`)과 **곱해진다** — 여기서 등급을 따로 손대지 않는다. */
export const WEEKEND_FEE_MULT = 1.6

/** 주말에 일하기로 했을 때 무는 정신력. ⚠️ 이것이 주말 근무의 **유일한 대가다** —
 *  행동력을 따로 깎지 않는다(주말은 주중 밖의 이틀이라 그 주의 행동력과 다른 축이다). */
export const WEEKEND_MENTAL_COST = 20

/** 주차를 넘길 때 저절로 도는 정신력. ⚠️ **회복이 소모보다 작아야** 주말 근무가
 *  대가를 지고, **0보다 커야** 한번 바닥난 판이 영영 바닥에 머물지 않는다
 *  (줄기만 하는 값은 결국 늘 0이라 축이 아니라 카운트다운이다). */
export const MENTAL_RECOVERY = 12

/** 정신력 → **행동력 상한에서 깎는 칸 수**.
 *
 * ⚠️ **`apMax`의 정본은 회사레벨이다**(`companyLevel(revenue).apMax`) — 정신력은 그
 *    상한을 **덮어쓰지 않고 거기서 뺀다**. 두 곳이 각자 상한을 계산하면 반드시 어긋난다.
 *    실제 상한 = `apMaxOf(revenue, mental)` **한 함수**가 낸다.
 *
 * ⚠️ 하한은 **1**이다(`AP_MIN`) — 0이면 아무것도 못 해 정신력을 회복시킬 길도, 돈을 벌
 *    길도 없는 죽은 판이 된다. 정신력은 느려지게 할 뿐 멈추지 못한다.
 * ⚠️ `maxMental` 내림차순이고 첫 칸이 `mentalMax`(100)여야 한다 — `mentalPenalty`가
 *    "조건을 만족하는 **마지막** 칸"을 답으로 낸다(`COMPANY_GRADES`와 같은 관용구이고,
 *    방향만 반대다). 여러 칸이 함께 참이므로 **가장 나쁜 칸이 이긴다**. */
export const MENTAL_PENALTY = [
  { maxMental: 100, ap: 0 },
  { maxMental: 59, ap: 1 },
  { maxMental: 29, ap: 2 },
] as const

/** 행동력 상한의 하한. ⚠️ 0으로 내리지 말 것 — 되돌아올 길이 없는 판이 생긴다. */
export const AP_MIN = 1

/** 정신력 → 깎이는 행동력 칸 수. 표가 내림차순이라 조건을 만족하는 칸이 여럿이고,
 *  **마지막 칸(가장 나쁜 칸)이 답이다**. ⚠️ `find`로 첫 칸을 집으면 늘 0이 나온다. */
export const mentalPenalty = (mental: number): number =>
  MENTAL_PENALTY.reduce((worst, p) => (mental <= p.maxMental ? p.ap : worst), 0)

/** **행동력 상한의 유일한 출처.** 회사레벨이 정본이고 정신력이 거기서 깎는다.
 *  ⚠️ 화면도 스토어도 이 함수만 부른다 — `companyLevel(...).apMax`를 직접 쓰지 말 것. */
export const apMaxOf = (revenue: number, mental: number): number =>
  Math.max(AP_MIN, companyLevel(revenue).apMax - mentalPenalty(mental))
