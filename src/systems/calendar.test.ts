import { describe, expect, it } from 'vitest'
import { formatWeek, toCalendar } from './calendar'

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

describe('마감 날짜 표기', () => {
  // 마감은 "3주 남음"이 아니라 언제까지인지를 말해야 한다.
  it('통산 주차를 달·주로 적는다', () => {
    expect(formatWeek(1)).toBe('1월 1째 주')
    expect(formatWeek(5)).toBe('2월 1째 주')
    // 해가 넘어가도 해는 붙지 않는다 — 마감은 늘 코앞이라 달·주만으로 갈린다.
    expect(formatWeek(49)).toBe('1월 1째 주')
  })
})
