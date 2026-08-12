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
} as const

/** 평판 위기선. 이 아래로 내려가면 신규 수주가 끊기고 매주 직원이 떠난다. */
export const REPUTATION_CRISIS = 10
/** 위기가 이만큼 이어지면 폐업(두 번째 게임 오버). */
export const CRISIS_WEEKS_TO_SHUTDOWN = 4
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
