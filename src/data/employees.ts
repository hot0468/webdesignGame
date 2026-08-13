import type { QualityId } from './game'
import type { ProgramId } from './programs'

/** 직원 시스템의 수치·이름 전부. ⚠️ **컴포넌트에 숫자를 적지 않는다** —
 *  두 번째 출처가 생기면 밸런스 테스트가 그쪽을 못 본다(`data/game.ts`와 같은 규칙).
 *
 * 직원 축의 한 줄 요약(설계 결정표):
 *   내가 직접 = 행동력 1~3 / **즉시**
 *   직원 지시 = 행동력 **1 고정** / **N주 뒤**, 그동안 그 직원은 다른 일을 못 한다
 * 그래서 직원은 "행동력을 시간으로 바꾸는 장치"다 — 싸게 여러 건을 벌리되 결과가 늦다. */

/** 직원 종류. **맡을 수 있는 공정(`program`)이 종류의 전부다** —
 *  ⚠️ 공정 제한을 컴포넌트나 스토어에 다시 적지 말 것(`canHandle`이 유일한 판정이다).
 *
 * 디블리셔는 디자인 프로그램(피그마·포토샵·PPT)과 퍼블리싱(에디터)을 **둘 다** 맡는다.
 * ⚠️ 관리자 페이지 등록(`browser`)은 **아무도 못 맡는다** — 그 공정은 업체 계정으로
 *    직접 들어가 거는 일이라 지시로 대신할 수 없고, 애초에 행동력을 물지 않는다. */
export const EMPLOYEE_ROLES = [
  {
    id: 'designer',
    label: '웹디자이너',
    /** 이 종류가 맡을 수 있는 공정의 프로그램(`systems/pipeline.ts`의 `Step.program`). */
    programs: ['figma', 'photoshop', 'ppt'],
    /** 등급을 정하는 스탯 축. ⚠️ **한 축뿐이다** — 디블리셔도 공정마다 축을 바꾸지 않고
     *  `statFor`가 공정에 맞는 축을 고른다. */
    stat: 'design',
  },
  {
    id: 'publisher',
    label: '웹퍼블리셔',
    programs: ['editor'],
    stat: 'publishing',
  },
  {
    id: 'dublisher',
    label: '디블리셔',
    programs: ['figma', 'photoshop', 'ppt', 'editor'],
    stat: 'design',
  },
] as const satisfies readonly {
  id: string
  label: string
  programs: readonly ProgramId[]
  stat: 'design' | 'publishing'
}[]

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number]
export type RoleId = EmployeeRole['id']

export const findRole = (id: RoleId): EmployeeRole => EMPLOYEE_ROLES.find((r) => r.id === id)!

/** 직원 스탯 3종. ⚠️ **숙련도는 없다**(설계 결정표) — 직원의 시간을 줄이는 것은 레벨이다.
 *  `cs`는 아직 공정에 관여하지 않는다(플레이어의 CS와 같다 — 단가·평판 회복 축이다).
 *  쓰지 않는 칸을 지금 지우지 않는 이유: 지원자 카드가 사람을 고르는 화면이고,
 *  세 축이 다 보여야 "이 사람은 무엇을 잘하나"가 선택이 된다. */
export type EmployeeStats = { design: number; publishing: number; cs: number }

/** 그 공정의 등급을 정하는 스탯 축. **퍼블리싱 공정만 `publishing`이고 나머지는 `design`이다.**
 *  ⚠️ 축을 공정별로 컴포넌트에서 고르지 말 것 — 여기 한 줄이 정본이다. */
export const statFor = (program: ProgramId): keyof EmployeeStats =>
  program === 'editor' ? 'publishing' : 'design'

/** 레벨 → 걸리는 주차를 몇 주 줄이는가. **표가 오름차순이고 첫 칸이 0이어야 한다**
 *  (`companyGrade`·`MEETING_REVEAL`과 같은 모양 — 표를 읽는 규칙을 둘로 만들지 않는다).
 *
 * ⚠️ 줄어드는 값이지 곱이 아니다. `N = EMPLOYEE_BASE_WEEKS - 보정`이고 **하한 1**이라
 *    레벨이 아무리 높아도 0주(= 즉시)가 되지 않는다 — 0이 되면 직원 지시가
 *    "행동력 1로 즉시 완성"이 되어 내가 직접 하는 길이 통째로 죽는다. */
export const LEVEL_SPEEDUP = [
  { minLevel: 1, weeks: 0 },
  { minLevel: 3, weeks: 1 },
  { minLevel: 5, weeks: 2 },
] as const

/** 지시 한 건이 기본으로 걸리는 주차. 레벨 보정이 여기서 빠진다. */
export const EMPLOYEE_BASE_WEEKS = 3

/** 지시 결과의 **퀄리티 밴드**. ⚠️ 플레이어가 고르는 값이 아니다 — 지시는 늘 이 밴드이고
 *  그 안의 칸은 **그 직원의 스탯**이 정한다(`systems/craft.ts`의 `gradeOf`).
 *
 * ⚠️ '열심히'(C~A)로 고정한 이유: '매우 신경써서'(S~SSS)를 열어 주면 좋은 직원 한 명이
 *    내 손보다 싸고 좋은 결과를 내어 플레이어가 직접 만들 이유가 사라진다. 지시는
 *    **무난한 결과를 시간으로 사는 길**이고, 최고 등급은 여전히 내 손에서만 나온다. */
export const ORDER_QUALITY: QualityId = 'hard'

/** 지시가 무는 행동력. **퀄리티와 무관하게 1 고정이다**(설계 결정표) —
 *  퀄리티를 고르는 것이 아니라 **누구에게 맡기느냐**가 이 축의 선택이다. */
export const ORDER_AP = 1

/** 직원 레벨의 범위. 지원자는 이 안에서 나온다. */
export const EMPLOYEE_LEVEL = { min: 1, max: 5 } as const

/** 지시받은 일이 몇 주 걸리는가. **하한 1**(0주 = 즉시가 되면 축이 무너진다). */
export const orderWeeks = (level: number): number => {
  const cut = LEVEL_SPEEDUP.reduce<number>(
    (best, r) => (level >= r.minLevel ? r.weeks : best),
    LEVEL_SPEEDUP[0].weeks,
  )
  return Math.max(1, EMPLOYEE_BASE_WEEKS - cut)
}

/** 이 종류가 그 공정을 맡을 수 있는가. **공정 제한의 유일한 판정이다.** */
export const canHandle = (role: RoleId, program: ProgramId): boolean =>
  (findRole(role).programs as readonly ProgramId[]).includes(program)

/** 월급(원/월). **레벨 1당 `SALARY_PER_LEVEL`씩 는다** — 잘하는 사람이 비싸야
 *  "싸고 낮은 직원에게 맡길까"가 선택이 된다.
 *
 * ⚠️ **`SUBSCRIPTIONS`에 더하지 않는다**(`data/game.ts` 주석) — 사람 수가 정본이라
 *    월말 정산은 직원 목록에서 계산한다(`systems/money.ts`의 `monthlyCost`).
 * ⚠️ 수치는 임시치다 — 사이트 한 건(150만)이 레벨 3 직원 두 달치를 겨우 넘는 감각으로
 *    잡아 뒀다. 곡선이 정해지면 여기만 고친다. */
export const SALARY_BASE = 400_000
export const SALARY_PER_LEVEL = 200_000

export const salaryOf = (level: number): number => SALARY_BASE + SALARY_PER_LEVEL * (level - 1)

/** 지원자 이름 풀. ⚠️ 무작위는 **시드를 받는 순수 함수**가 낸다(`systems/hire.ts`) —
 *  여기 있는 것은 재료뿐이고 뽑는 규칙은 그쪽 하나다. */
export const SURNAMES = [
  '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',
  '한', '오', '서', '신', '권', '황', '안', '송', '류', '전',
] as const

export const GIVEN_NAMES = [
  '지훈', '서연', '민준', '하윤', '도윤', '지우', '예준', '수아', '시우', '지민',
  '주원', '유진', '건우', '채원', '현우', '다은', '준서', '소율', '지호', '나윤',
] as const

/** 한 공고가 부르는 지원자 수. ⚠️ 정원보다 넉넉해야 **고를 것**이 생긴다 —
 *  한 명만 오면 채용이 선택이 아니라 절차가 된다. */
export const APPLICANTS_PER_POST = 3

/** 직원이 맡은 공정이 내놓는 파일의 확장자. **내 손으로 만들 때와 같은 확장자**라야
 *  목록에서 나란히 섰을 때 같은 종류의 물건으로 읽힌다(`store.ts`의 제작 액션들과 짝).
 *  ⚠️ 에디터(퍼블리싱)는 여기 없다 — 서버에 올리는 일이라 산출 파일이 없다. */
export const ORDER_FILE_EXT: Partial<Record<ProgramId, string>> = {
  figma: '.fig',
  ppt: '.pptx',
  photoshop: '.png',
}

/** 공고를 올리는 데 드는 행동력. ⚠️ 0이면 매주 눌러 지원자를 무한히 새로 뽑을 수 있다 —
 *  씨앗이 주차라 다시 눌러도 같은 사람이 오지만, 값이 없으면 공고가 선택이 아니다. */
export const POST_AP = 1

/** ── 교육 ────────────────────────────────────────────────────────────────
 *
 * 레벨을 올리는 **유일한 길**이다. ⚠️ 업무를 시킨다고 저절로 오르지 않는다 —
 * 자동으로 오르면 "그냥 오래 굴리면 최고가 된다"가 되어 뽑을 때의 선택(싸고 낮은 사람 vs
 * 비싸고 높은 사람)이 시간만 지나면 사라진다. 교육은 **돈과 그 사람의 한 주**를 낸다. */

/** 교육 한 번의 값(원). ⚠️ 레벨이 오르면 **월급도 영구히 는다**(`salaryOf`) —
 *  그래서 교육비는 한 번 내는 값이지만 진짜 비용은 그 뒤로 계속 나가는 월급이다.
 *  즉시 회수되는 값으로 잡으면 안 시킬 이유가 없어진다. */
export const TRAIN_COST = 500_000

/** 교육이 걸리는 주차. 그동안 그 직원은 **지시를 못 받는다**(`orders`와 같은 점유다) —
 *  가르치는 동안 일도 시킬 수 있으면 값이 돈뿐이라 고민할 것이 없다. */
export const TRAIN_WEEKS = 2

/** 레벨이 1 오를 때 **세 스탯이 함께** 오르는 폭. ⚠️ 종류(웹디자이너·퍼블리셔)를 가리지
 *  않고 다 올린다 — 가려서 올리면 디블리셔만 교육 가치가 두 배가 된다.
 *  ⚠️ 스탯 상한은 100이다(`trainedStats`가 자른다). */
export const TRAIN_STAT_GAIN = 5
