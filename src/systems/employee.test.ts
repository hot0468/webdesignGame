import { describe, expect, it } from 'vitest'
import {
  APPLICANTS_PER_POST,
  canHandle,
  EMPLOYEE_BASE_WEEKS,
  EMPLOYEE_LEVEL,
  EMPLOYEE_ROLES,
  LEVEL_SPEEDUP,
  ORDER_QUALITY,
  orderWeeks,
  STAT_SPEEDUP,
  salaryOf,
  statFor,
  TRAIN_STAT_GAIN,
  type RoleId,
} from '../data/employees'
import { findQuality } from '../data/game'
import {
  busyUntil,
  canOrder,
  canTrain,
  isBusy,
  orderDoneWeek,
  payroll,
  quitter,
  trainDoneWeek,
  trained,
  type Employee,
  type Order,
} from './employee'
import { applicants } from './hire'

const emp = (over: Partial<Employee> = {}): Employee => ({
  id: 'e1',
  name: '김지훈',
  role: 'designer',
  level: 1,
  stats: { design: 50, publishing: 50, planning: 50, cs: 50 },
  hiredWeek: 1,
  ...over,
})

describe('지시가 걸리는 주차', () => {
  it('레벨이 높을수록 짧아진다', () => {
    expect(orderWeeks(1, 0)).toBe(EMPLOYEE_BASE_WEEKS)
    expect(orderWeeks(EMPLOYEE_LEVEL.max, 0)).toBeLessThan(EMPLOYEE_BASE_WEEKS)
  })

  /** ⚠️ 레벨과 **다른 축이다** — 같은 레벨에서도 잘하는 사람이 빨리 끝내야
   *  "누구에게 맡기느냐"가 선택이 된다(지원자 스탯이 레벨 주위로 흔들리는 이유). */
  it('같은 레벨이면 스탯이 높은 쪽이 빠르다', () => {
    const low = STAT_SPEEDUP[0]!.minStat
    const high = STAT_SPEEDUP[STAT_SPEEDUP.length - 1]!.minStat
    expect(orderWeeks(3, high)).toBeLessThan(orderWeeks(3, low))
  })

  // 뒤집기: 기본 주차가 레벨 보정만으로 하한에 닿으면 스탯이 아무 일도 못 한다.
  it('스탯이 실제로 들어갈 자리가 있다 — 기본 주차가 레벨 보정보다 넉넉하다', () => {
    const byLevel = LEVEL_SPEEDUP[LEVEL_SPEEDUP.length - 1]!.weeks
    expect(EMPLOYEE_BASE_WEEKS - byLevel).toBeGreaterThan(1)
  })

  // ⚠️ 규칙을 뒤집어 확인한다: 하한이 없으면 지시가 "행동력 1로 즉시 완성"이 되어
  //    내가 직접 하는 길이 통째로 죽는다.
  it('하한이 1주다 — 레벨이 아무리 높아도 0주가 되지 않는다', () => {
    for (let lv = 1; lv <= 100; lv++)
      for (const st of [0, 70, 100]) expect(orderWeeks(lv, st)).toBeGreaterThanOrEqual(1)
    // 표가 기본 주차보다 크게 깎아도 1로 막힌다.
    const biggest = LEVEL_SPEEDUP[LEVEL_SPEEDUP.length - 1]!.weeks
    expect(EMPLOYEE_BASE_WEEKS - biggest).toBeLessThanOrEqual(EMPLOYEE_BASE_WEEKS)
    expect(orderDoneWeek(5, 100, 100)).toBeGreaterThanOrEqual(6)
  })
})

describe('종류가 맡을 수 있는 공정', () => {
  it('웹디자이너는 퍼블리싱을, 웹퍼블리셔는 시안을 못 맡는다', () => {
    expect(canHandle('designer', 'editor')).toBe(false)
    expect(canHandle('publisher', 'figma')).toBe(false)
  })

  it('디블리셔만 둘 다 맡는다', () => {
    expect(canHandle('dublisher', 'figma')).toBe(true)
    expect(canHandle('dublisher', 'editor')).toBe(true)
  })

  // ⚠️ 관리자 페이지 등록은 계정으로 직접 들어가 거는 일이라 아무도 못 맡는다.
  it('관리자 페이지 등록(browser)은 어느 종류도 못 맡는다', () => {
    for (const r of EMPLOYEE_ROLES) expect(canHandle(r.id as RoleId, 'browser')).toBe(false)
  })

  it('맡을 수 없는 공정은 지시할 수 없다', () => {
    expect(canOrder(emp({ role: 'designer' }), 'editor', [])).toBe(false)
    expect(canOrder(emp({ role: 'designer' }), 'figma', [])).toBe(true)
  })
})

describe('점유', () => {
  const order: Order = {
    employeeId: 'e1',
    jobId: 'j1',
    program: 'figma',
    label: '시안',
    from: 1,
    doneWeek: 4,
    grade: 'C',
  }

  it('지시 중인 직원에게는 다시 맡길 수 없다', () => {
    expect(canOrder(emp(), 'figma', [order])).toBe(false)
  })

  it('다른 직원은 영향받지 않는다 — 점유는 사람마다다', () => {
    expect(canOrder(emp({ id: 'e2' }), 'figma', [order])).toBe(true)
  })
})

describe('지시 결과의 등급', () => {
  // ⚠️ 새 사다리를 만들지 않는다 — `gradeOf`가 등급의 단일 출처다.
  it('밴드는 고정이고 그 안의 칸을 직원 스탯이 정한다', () => {
    const band = findQuality(ORDER_QUALITY).grades
    expect(band.length).toBeGreaterThan(1)
  })

  it('퍼블리싱 공정만 publishing 스탯을 본다', () => {
    expect(statFor('editor')).toBe('publishing')
    expect(statFor('figma')).toBe('design')
    expect(statFor('photoshop')).toBe('design')
    expect(statFor('ppt')).toBe('design')
  })
})

describe('급여', () => {
  it('레벨이 높을수록 비싸다 — 싸고 낮은 직원이 선택이 되는 이유다', () => {
    expect(salaryOf(2)).toBeGreaterThan(salaryOf(1))
    expect(salaryOf(EMPLOYEE_LEVEL.max)).toBeGreaterThan(salaryOf(1))
  })

  it('합계는 사람 수에서 나온다', () => {
    expect(payroll([])).toBe(0)
    expect(payroll([emp({ level: 1 }), emp({ id: 'e2', level: 3 })])).toBe(
      salaryOf(1) + salaryOf(3),
    )
  })
})

describe('평판 위기에 먼저 나가는 사람', () => {
  it('레벨 높은 순이다 — 갈 곳 있는 사람부터 떠난다', () => {
    const list = [emp({ id: 'a', level: 2 }), emp({ id: 'b', level: 5 }), emp({ id: 'c', level: 1 })]
    expect(quitter(list)?.id).toBe('b')
  })

  it('레벨이 같으면 먼저 뽑은 사람이 남는다 — 무작위가 아니다', () => {
    const list = [emp({ id: 'a', level: 3 }), emp({ id: 'b', level: 3 })]
    expect(quitter(list)?.id).toBe('a')
    // 같은 목록을 몇 번 물어도 같은 답이다(불러온 판에서 다른 사람이 나가면 안 된다).
    expect(quitter(list)?.id).toBe('a')
  })

  it('직원이 없으면 나갈 사람도 없다', () => {
    expect(quitter([])).toBeUndefined()
  })
})

describe('지원자는 시드를 받는 순수 함수가 낸다', () => {
  // ⚠️ `Math.random`이 있으면 이 테스트가 깨진다 — 그것이 이 테스트의 목적이다.
  it('같은 주차는 늘 같은 지원자다', () => {
    expect(applicants(7)).toEqual(applicants(7))
  })

  it('다른 주차는 다른 지원자다', () => {
    expect(applicants(7)).not.toEqual(applicants(8))
  })

  it('정해진 수만큼 오고 레벨·스탯이 범위 안이다', () => {
    const list = applicants(3)
    expect(list).toHaveLength(APPLICANTS_PER_POST)
    for (const a of list) {
      expect(a.level).toBeGreaterThanOrEqual(EMPLOYEE_LEVEL.min)
      expect(a.level).toBeLessThanOrEqual(EMPLOYEE_LEVEL.max)
      for (const v of Object.values(a.stats)) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(100)
      }
    }
  })

  it('한 공고 안에서 id가 겹치지 않는다', () => {
    const ids = applicants(12).map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('교육', () => {
  const at = (level: number, design = 50): Employee => ({
    id: 'e1',
    name: '테스트',
    role: 'designer',
    level,
    stats: { design, publishing: 50, planning: 50, cs: 50 },
    hiredWeek: 1,
  })

  it('레벨이 1 오르고 세 스탯이 함께 오른다', () => {
    const before = at(2)
    const after = trained(before)
    expect(after.level).toBe(3)
    expect(after.stats.design).toBe(before.stats.design + TRAIN_STAT_GAIN)
    expect(after.stats.publishing).toBe(before.stats.publishing + TRAIN_STAT_GAIN)
    expect(after.stats.cs).toBe(before.stats.cs + TRAIN_STAT_GAIN)
  })

  // 규칙을 뒤집어 확인한다: 상한이 없으면 교육을 반복해 레벨과 스탯이 무한히 오른다.
  it('최고 레벨은 넘지 않고 스탯은 100에서 잘린다', () => {
    const top = at(EMPLOYEE_LEVEL.max)
    expect(trained(top)).toBe(top)

    const nearCap = trained(at(1, 98))
    expect(nearCap.stats.design).toBe(100)
  })

  it('교육 중인 직원은 잡혀 있다 — 지시를 겹쳐 받지 않는다', () => {
    const e = at(1)
    const training = [{ employeeId: e.id, from: 3, doneWeek: trainDoneWeek(3), kind: 'train' as const }]
    expect(isBusy(e.id, [], training)).toBe(true)
    expect(canOrder(e, 'figma', [], training)).toBe(false)
    expect(canTrain(e, [], training)).toBe(false)
    expect(busyUntil(e.id, [], training)).toBe(trainDoneWeek(3))
  })

  it('최고 레벨이면 교육을 보낼 수 없다', () => {
    expect(canTrain(at(EMPLOYEE_LEVEL.max), [], [])).toBe(false)
    expect(canTrain(at(EMPLOYEE_LEVEL.max - 1), [], [])).toBe(true)
  })
})
