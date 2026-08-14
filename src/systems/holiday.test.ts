import { describe, expect, it } from 'vitest'
import { WEEKS_PER_MONTH } from '../data/game'
import { HOLIDAYS, PEAK_JOBS } from '../data/holiday'
import { toCalendar } from './calendar'
import { peakNotice, peakOf, peakRequests } from './holiday'

/** 그 공휴일이 있는 통산 주차(1년차). */
const weekOf = (h: (typeof HOLIDAYS)[number]) =>
  (h.month - 1) * WEEKS_PER_MONTH + h.weekOfMonth

describe('공휴일 피크타임', () => {
  it('공휴일 **직전 주**가 피크다', () => {
    for (const h of HOLIDAYS) {
      const holidayWeek = weekOf(h)
      expect(peakOf(holidayWeek - 1)?.id).toBe(h.id)
      // 공휴일 당주와 그 뒤는 피크가 아니다.
      expect(peakOf(holidayWeek)).toBeUndefined()
    }
  })

  it('평범한 주에는 아무 일도 없다', () => {
    const quiet = weekOf(HOLIDAYS[0]!) - 3
    expect(peakOf(quiet)).toBeUndefined()
    expect(peakRequests(quiet)).toEqual([])
  })

  // ⚠️ 해를 보지 않는다 — 통산 주차로 잡았다면 2년차에 공휴일이 사라진다.
  it('2년차에도 같은 자리에 온다', () => {
    const first = weekOf(HOLIDAYS[0]!) - 1
    const second = first + WEEKS_PER_MONTH * 12
    expect(peakOf(second)?.id).toBe(peakOf(first)?.id)
  })

  it('피크에는 여러 건이 한꺼번에 오고 업체가 겹치지 않는다', () => {
    const week = weekOf(HOLIDAYS[0]!) - 1
    const reqs = peakRequests(week)
    expect(reqs).toHaveLength(PEAK_JOBS)
    const clients = reqs.map((r) => r.popup!.clientId)
    expect(new Set(clients).size).toBe(clients.length)
  })

  // ⚠️ 팝업의 불변식: 게시가 끝난 **뒤에** 마감이 온다(`data/inbox.ts`).
  //    깨지면 기간 안에 걸어 두고도 마감을 못 지키는 판이 된다.
  it('마감이 게시 기간보다 뒤다', () => {
    for (const r of peakRequests(weekOf(HOLIDAYS[0]!) - 1)) {
      expect(r.dueWeeks).toBeGreaterThan(r.popup!.toWeeks)
      expect(r.popup!.fromWeeks).toBeLessThanOrEqual(r.popup!.toWeeks)
    }
  })

  it('같은 주는 늘 같은 의뢰다 — 창을 닫았다 열어 다시 굴릴 수 없다', () => {
    const week = weekOf(HOLIDAYS[1]!) - 1
    expect(peakRequests(week)).toEqual(peakRequests(week))
  })

  it('게시 기간이 공휴일 주를 덮는다 — 대목에 걸려 있어야 뜻이 있다', () => {
    const week = weekOf(HOLIDAYS[0]!) - 1
    const holidayWeek = weekOf(HOLIDAYS[0]!)
    for (const r of peakRequests(week)) {
      // 수주 시점(그 주)에서 센 상대값이 공휴일 주를 포함해야 한다.
      expect(week + r.popup!.fromWeeks).toBeLessThanOrEqual(holidayWeek)
      expect(week + r.popup!.toWeeks).toBeGreaterThanOrEqual(holidayWeek)
    }
  })

  // ⚠️ 당일에 알면 그 주 행동력을 이미 다 쓴 뒤다 — 한 주 앞서 알려야 대비가 된다.
  it('피크 한 주 전에 예고가 온다', () => {
    const peak = weekOf(HOLIDAYS[0]!) - 1
    expect(peakNotice(peak - 1)?.id).toBe(`peaknotice:${peak - 1}`)
    expect(peakNotice(peak)).toBeUndefined()
    // 알림이지 의뢰가 아니다.
    expect(peakNotice(peak - 1)!.ad).toBe(true)
  })

  it('공휴일 주 계산이 달력과 어긋나지 않는다', () => {
    for (const h of HOLIDAYS) {
      const c = toCalendar(weekOf(h))
      expect(c.month).toBe(h.month)
      expect(c.weekOfMonth).toBe(h.weekOfMonth)
    }
  })
})
