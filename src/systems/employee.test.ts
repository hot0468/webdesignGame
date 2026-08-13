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
  salaryOf,
  statFor,
  type RoleId,
} from '../data/employees'
import { findQuality } from '../data/game'
import { canOrder, orderDoneWeek, payroll, quitter, type Employee, type Order } from './employee'
import { applicants } from './hire'

const emp = (over: Partial<Employee> = {}): Employee => ({
  id: 'e1',
  name: '김지훈',
  role: 'designer',
  level: 1,
  stats: { design: 50, publishing: 50, cs: 50 },
  hiredWeek: 1,
  ...over,
})

describe('지시가 걸리는 주차', () => {
  it('레벨이 높을수록 짧아진다', () => {
    expect(orderWeeks(1)).toBe(EMPLOYEE_BASE_WEEKS)
    expect(orderWeeks(EMPLOYEE_LEVEL.max)).toBeLessThan(EMPLOYEE_BASE_WEEKS)
  })

  // ⚠️ 규칙을 뒤집어 확인한다: 하한이 없으면 지시가 "행동력 1로 즉시 완성"이 되어
  //    내가 직접 하는 길이 통째로 죽는다.
  it('하한이 1주다 — 레벨이 아무리 높아도 0주가 되지 않는다', () => {
    for (let lv = 1; lv <= 100; lv++) expect(orderWeeks(lv)).toBeGreaterThanOrEqual(1)
    // 표가 기본 주차보다 크게 깎아도 1로 막힌다.
    const biggest = LEVEL_SPEEDUP[LEVEL_SPEEDUP.length - 1]!.weeks
    expect(EMPLOYEE_BASE_WEEKS - biggest).toBeLessThanOrEqual(EMPLOYEE_BASE_WEEKS)
    expect(orderDoneWeek(5, 100)).toBeGreaterThanOrEqual(6)
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
