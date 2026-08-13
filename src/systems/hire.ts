import {
  APPLICANTS_PER_POST,
  EMPLOYEE_LEVEL,
  EMPLOYEE_ROLES,
  GIVEN_NAMES,
  SURNAMES,
  type EmployeeStats,
  type RoleId,
} from '../data/employees'

/** 채용의 무작위 전부. **순수 함수다**(`src/systems/` 규칙 — React·mutation 없음).
 *
 * ⚠️ **`Math.random`이 없다.** 공고를 올린 주차가 씨앗이라 같은 주의 지원자는 늘 같은
 *    사람들이다 — 다시 그릴 때마다 지원자가 바뀌면 "누구를 뽑을까"를 고민하는 동안
 *    목록이 흔들리고, 창을 닫았다 열어 마음에 드는 사람이 나올 때까지 굴릴 수 있다.
 *    씨앗이 주차 하나라 **새 상태 축도 만들지 않는다**(공고를 올린 주만 스토어에 남는다).
 *
 * 씨앗 만들기는 `systems/keywords.ts`와 **같은 방식**이다(FNV-1a → mulberry32) —
 * 두 곳이 다른 난수를 쓰면 "시드를 받는 순수 함수"라는 규칙이 두 벌이 된다. */

/** 문자열 → 32비트 씨앗(FNV-1a). ⚠️ 암호용이 아니다 — 필요한 것은 "씨앗이 다르면 답도
 *  다르다"뿐이고, 짧고 결정적이면 충분하다. */
function seedOf(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** 씨앗을 한 걸음 굴린다(mulberry32). 0~1 미만을 낸다. */
function next(seed: number): [number, number] {
  const t = (seed + 0x6d2b79f5) >>> 0
  let x = Math.imul(t ^ (t >>> 15), 1 | t)
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
  return [((x ^ (x >>> 14)) >>> 0) / 4294967296, t]
}

/** 굴릴 때마다 씨앗을 들고 다니는 작은 롤러. 순수 함수 안에서만 산다(밖으로 새지 않는다). */
function roller(seedText: string) {
  let seed = seedOf(seedText)
  return {
    /** `min`~`max`(양끝 포함) 정수 하나. */
    int(min: number, max: number): number {
      const [r, s] = next(seed)
      seed = s
      return min + Math.floor(r * (max - min + 1))
    },
    pick<T>(list: readonly T[]): T {
      return list[this.int(0, list.length - 1)]!
    },
  }
}

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
 *  낮은 레벨인데 디자인이 좋은 사람(싸고 빠르진 않지만 잘 그린다)이 나올 수 있어야 한다. */
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
