import { describe, expect, it } from 'vitest'
import { formatSavedAt, makeSlot, parseSlot, slotKey, summarize } from './save'

describe('슬롯 키', () => {
  it('자동저장 키와 섞이지 않는다 — 같은 칸을 나눠 쓰면 한쪽이 다른 쪽을 덮는다', () => {
    expect(slotKey(1)).toBe('webdi.slot.1')
    expect(slotKey(1)).not.toBe('webdi.save.v1')
  })
})

describe('요약', () => {
  it('목록 한 줄이 어느 판인지 말한다 — 주차·소지금·평판·업무 수', () => {
    expect(summarize({ week: 7, money: 900_000, reputation: 42, jobs: [1, 2] })).toEqual({
      week: 7,
      money: 900_000,
      reputation: 42,
      jobs: 2,
    })
  })

  it('모양이 다른 옛 세이브도 한 줄은 선다 — 못 서면 지울 수도 덮을 수도 없는 칸이 된다', () => {
    expect(summarize({})).toEqual({ week: 0, money: 0, reputation: 0, jobs: 0 })
  })
})

describe('믿을 수 없는 세이브', () => {
  // ⚠️ 규칙을 뒤집는 증명이다: 아래 중 하나라도 슬롯으로 통과하면 **불러오는 순간
  //    게임이 죽고** 되돌릴 자리가 없다.
  it.each([
    ['빈 칸', null],
    ['깨진 JSON', '{not json'],
    ['JSON이지만 객체가 아님', '"hello"'],
    ['판 번호가 다름(옛 슬롯)', JSON.stringify({ v: 99, savedAt: 1, data: {} })],
    ['저장 시각이 없음', JSON.stringify({ v: 1, data: {} })],
    ['상태가 없음', JSON.stringify({ v: 1, savedAt: 1 })],
    ['상태가 배열', JSON.stringify({ v: 1, savedAt: 1, data: [] })],
  ])('%s은 빈 슬롯으로 떨어진다', (_label, raw) => {
    expect(parseSlot(raw as string | null)).toBeNull()
  })

  it('요약만 깨진 세이브는 버리지 않는다 — 상태에서 다시 뽑아 목록에 세운다', () => {
    const raw = JSON.stringify({ v: 1, savedAt: 1, summary: 'x', data: { week: 5, jobs: [] } })
    expect(parseSlot(raw)?.summary.week).toBe(5)
  })
})

describe('왕복', () => {
  it('만든 슬롯은 그대로 다시 읽힌다', () => {
    const slot = makeSlot({ week: 3, money: 1, reputation: 2, jobs: [] }, 1_700_000_000_000)
    expect(parseSlot(JSON.stringify(slot))).toEqual(slot)
  })
})

describe('저장 시각', () => {
  it('초까지 적는다 — 같은 분에 두 번 저장하면 두 줄이 구분되지 않는다', () => {
    expect(formatSavedAt(new Date(2026, 7, 13, 9, 5, 7).getTime())).toBe('2026-08-13 09:05:07')
  })
})
