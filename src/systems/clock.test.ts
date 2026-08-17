import { describe, expect, it } from 'vitest'
import { WORKDAY_COUNT } from '../data/game'
import { canSpend, nextDay, spendTime, START_CLOCK, weekLeft } from './clock'

const DAY = 240

describe('weekLeft', () => {
  it('주 첫날 아침에는 닷새치가 남아 있다', () => {
    expect(weekLeft(START_CLOCK, DAY)).toBe(DAY * WORKDAY_COUNT)
  })

  it('쓴 만큼 준다', () => {
    expect(weekLeft({ day: 0, spent: 100 }, DAY)).toBe(DAY * WORKDAY_COUNT - 100)
  })

  it('마지막 날 아침에는 하루치만 남는다', () => {
    expect(weekLeft({ day: WORKDAY_COUNT - 1, spent: 0 }, DAY)).toBe(DAY)
  })
})

/** ⚠️ 이 규칙이 주차 진행을 만든다 — 주를 넘길 수 있게 되면 작업 도중에 `advanceWeek`가
 *  돌아 마감 파기·정산이 사람 몰래 터진다. 그래서 뒤집어서도 확인한다. */
describe('canSpend — 주를 넘기지 못한다', () => {
  it('이번 주에 남은 시간까지는 된다', () => {
    expect(canSpend(START_CLOCK, DAY * WORKDAY_COUNT, DAY)).toBe(true)
  })

  it('한 뼘이라도 넘으면 안 된다', () => {
    expect(canSpend(START_CLOCK, DAY * WORKDAY_COUNT + 1, DAY)).toBe(false)
  })

  it('늦게 집을수록 큰 작업을 못 시작한다 — 이것이 일정표의 판단이다', () => {
    const big = DAY * 3
    expect(canSpend({ day: 0, spent: 0 }, big, DAY)).toBe(true)
    // 마지막 날 아침에는 하루치만 남아 사흘짜리가 안 들어간다.
    expect(canSpend({ day: WORKDAY_COUNT - 1, spent: 0 }, big, DAY)).toBe(false)
  })
})

describe('spendTime', () => {
  it('하루 안에 끝나면 그날에 머문다', () => {
    const { end, blocks } = spendTime(START_CLOCK, 120, DAY)
    expect(end).toEqual({ day: 0, spent: 120 })
    expect(blocks).toEqual([{ day: 0, start: 0, mins: 120 }])
  })

  it('하루를 넘으면 날마다 블록이 쪼개진다', () => {
    const { end, blocks } = spendTime(START_CLOCK, DAY + 60, DAY)
    expect(blocks).toEqual([
      { day: 0, start: 0, mins: DAY },
      { day: 1, start: 0, mins: 60 },
    ])
    expect(end).toEqual({ day: 1, spent: 60 })
  })

  it('하루를 꽉 채우면 다음 날 아침에 선다 — 0분 남은 오늘에 머물지 않는다', () => {
    const { end } = spendTime(START_CLOCK, DAY, DAY)
    expect(end).toEqual({ day: 1, spent: 0 })
  })

  it('쓴 분의 합은 늘 요청한 만큼이다', () => {
    const mins = DAY * 2 + 90
    const { blocks } = spendTime({ day: 0, spent: 30 }, mins, DAY)
    expect(blocks.reduce((n, b) => n + b.mins, 0)).toBe(mins)
  })

  it('블록은 그날 쓴 자리에서 시작한다', () => {
    const { blocks } = spendTime({ day: 1, spent: 60 }, 30, DAY)
    expect(blocks).toEqual([{ day: 1, start: 60, mins: 30 }])
  })
})

describe('nextDay', () => {
  it('금요일에서는 없다 — 주차를 넘기는 것은 스토어의 몫이다', () => {
    expect(nextDay({ day: WORKDAY_COUNT - 1, spent: 10 })).toBeNull()
  })

  it('남은 시간을 버리고 다음 날 아침으로 간다', () => {
    expect(nextDay({ day: 0, spent: 200 })).toEqual({ day: 1, spent: 0 })
  })
})
