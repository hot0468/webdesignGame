import { describe, expect, it } from 'vitest'
import { RAISE_AMOUNT, salaryOf } from '../data/employees'
import { BASE_FEE, GRADE_REWARD } from '../data/game'
import type { Employee } from './employee'
import { monthlyCost, reward, settleMail } from './money'

const emp = (over: Partial<Employee> = {}): Employee => ({
  id: 'e1',
  name: '홍길동',
  role: 'designer',
  level: 2,
  stats: { design: 50, publishing: 50, planning: 50, cs: 50 },
  hiredWeek: 1,
  ...over,
})

/** 정산 메일. ⚠️ 여기서 지키는 것은 **적힌 줄의 합 = 적힌 합계**다 —
 *  갈리면 "누구를 내보내면 얼마가 주는가"를 알 수 없고, 그것이 이 줄의 존재 이유다. */
describe('월말 정산 메일', () => {
  it('사람마다 적힌 급여의 합이 합계와 맞는다 — 급여협상 인상분까지', () => {
    const team = [emp({ id: 'a', name: '가', raise: RAISE_AMOUNT }), emp({ id: 'b', name: '나' })]
    const body = settleMail(4, 0, team).body

    // 본문에서 사람 줄의 금액만 뽑아 더한다.
    const lines = body.split('\n').filter((l) => l.startsWith('- '))
    const won = (t: string) => Number(t.replace(/[^0-9]/g, ''))
    const people = lines.filter((l) => l.includes('급여')).reduce((sum, l) => sum + won(l), 0)
    const fixed = lines.filter((l) => !l.includes('급여')).reduce((sum, l) => sum + won(l), 0)

    // 뒤집기: `raise`를 빼고 적으면 이 합이 `monthlyCost`보다 작아진다.
    expect(people).toBe(salaryOf(2, RAISE_AMOUNT) + salaryOf(2))
    expect(people + fixed).toBe(monthlyCost(team))
  })
})

describe('대금', () => {
  it('단가 배율이 등급 배율과 곱해진다', () => {
    const plain = reward('fix', 'C')
    expect(plain.fee).toBe(Math.round(BASE_FEE.fix * GRADE_REWARD.C.fee))
    expect(reward('fix', 'C', 2).fee).toBe(Math.round(plain.fee * 2))
  })

  it('등급이 없으면 기준선(C)으로 친다', () => {
    expect(reward('fix', undefined).fee).toBe(reward('fix', 'C').fee)
  })
})
