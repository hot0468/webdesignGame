import {
  APPLICANTS_PER_POST,
  EMPLOYEE_LEVEL,
  EMPLOYEE_ROLES,
  GIVEN_NAMES,
  SURNAMES,
  type EmployeeStats,
  type RoleId,
} from '../data/employees'
import { roller } from './seed'

/** 채용의 무작위 전부. **순수 함수다**(`src/systems/` 규칙 — React·mutation 없음).
 *
 * ⚠️ **`Math.random`이 없다.** 공고를 올린 주차가 씨앗이라 같은 주의 지원자는 늘 같은
 *    사람들이다 — 다시 그릴 때마다 지원자가 바뀌면 "누구를 뽑을까"를 고민하는 동안
 *    목록이 흔들리고, 창을 닫았다 열어 마음에 드는 사람이 나올 때까지 굴릴 수 있다.
 *    씨앗이 주차 하나라 **새 상태 축도 만들지 않는다**(공고를 올린 주만 스토어에 남는다).
 *
 * 굴리는 것은 `systems/seed.ts`의 `roller` 하나다(FNV-1a → mulberry32) — 무작위가 필요한
 * 곳(`request.ts`도)이 각자 난수를 들고 있으면 "시드를 받는 순수 함수"라는 규칙이
 * 여러 벌이 되고, 한쪽만 고쳐지는 사고가 난다. */

/** 공고에 온 지원자 하나. **아직 직원이 아니다** — 고용해야 스토어의 직원 목록에 오른다.
 *  ⚠️ 지원자 목록은 **저장하지 않는다**: 공고를 올린 주차(`hirePostWeek`)에서 파생한다. */
export type Applicant = {
  /** 그 주의 몇 번째 지원자인가. 고용하면 그대로 직원 id가 된다(관계를 한 방향으로). */
  id: string
  name: string
  role: RoleId
  /** 1~`EMPLOYEE_LEVEL.max`. **걸리는 주차와 월급을 함께 정한다**(`data/employees.ts`). */
  level: number
  stats: EmployeeStats
}

/** 레벨이 스탯의 중심을 민다. ⚠️ 레벨만 보고 뽑으면 선택이 사라지므로 **흔들림을 준다** —
 *  월급은 레벨이 정하는데(`salaryOf`) 등급과 걸리는 기간은 **스탯**이 함께 정하므로
 *  (`gradeOf`·`orderWeeks`), 같은 값에 더 잘하는 사람을 골라내는 눈이 이 흔들림에서 나온다. */
const STAT_SPREAD = 20

/** 그 주의 공고에 온 지원자들. **씨앗은 공고를 올린 주차다.**
 *
 * ⚠️ 같은 주차는 늘 같은 지원자다(테스트가 이것을 지킨다). 새로 뽑고 싶으면 주를 넘겨
 *    공고를 다시 올려야 한다 — 그 왕복이 채용에 시간을 들이게 만든다. */
export function applicants(week: number, count = APPLICANTS_PER_POST): Applicant[] {
  return Array.from({ length: count }, (_, i) => {
    const r = roller(`hire:${week}:${i}`)
    const role = r.pick(EMPLOYEE_ROLES).id as RoleId
    const level = r.int(EMPLOYEE_LEVEL.min, EMPLOYEE_LEVEL.max)
    // 레벨이 중심을, 흔들림이 그 주위를 정한다. 0~100 밖으로 나가지 않게 양끝을 막는다.
    const around = (): number => {
      const center = (level / EMPLOYEE_LEVEL.max) * 100
      return Math.min(100, Math.max(0, Math.round(center + r.int(-STAT_SPREAD, STAT_SPREAD))))
    }
    return {
      id: `ap:${week}:${i}`,
      name: `${r.pick(SURNAMES)}${r.pick(GIVEN_NAMES)}`,
      role,
      level,
      stats: { design: around(), publishing: around(), planning: around(), cs: around() },
    }
  })
}
