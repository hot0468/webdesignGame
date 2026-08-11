import { describe, expect, it } from 'vitest'
import { toCalendar } from './calendar'

describe('달력 환산', () => {
  // 주차 진행은 월말 정산이 올라탈 축이라 경계에서 한 칸 밀리면 정산이 통째로 밀린다.
  it('달과 해의 경계에서 한 칸도 밀리지 않는다', () => {
    expect(toCalendar(1)).toEqual({ year: 1, month: 1, weekOfMonth: 1 })
    expect(toCalendar(4)).toEqual({ year: 1, month: 1, weekOfMonth: 4 })
    expect(toCalendar(5)).toEqual({ year: 1, month: 2, weekOfMonth: 1 })
    expect(toCalendar(48)).toEqual({ year: 1, month: 12, weekOfMonth: 4 })
    expect(toCalendar(49)).toEqual({ year: 2, month: 1, weekOfMonth: 1 })
  })
})
