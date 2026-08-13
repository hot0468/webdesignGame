import { describe, expect, it } from 'vitest'
import { CRISIS_WEEKS_TO_SHUTDOWN, UNPAID_MONTHS_TO_BANKRUPT } from '../data/game'
import { judgeOver } from './gameover'

describe('게임 오버 판정', () => {
  it('멀쩡하면 끝나지 않는다', () => {
    expect(judgeOver(5, 0, 0)).toBeUndefined()
  })

  // ⚠️ 한두 달 밀린 것으로 끝나지 않는다 — 착수금·대출로 버틸 수 있는 구간이다.
  it('급여가 정해진 달만큼 연속으로 밀리면 파산', () => {
    expect(judgeOver(8, UNPAID_MONTHS_TO_BANKRUPT - 1, 0)).toBeUndefined()
    expect(judgeOver(8, UNPAID_MONTHS_TO_BANKRUPT, 0)).toEqual({ kind: 'bankrupt', week: 8 })
  })

  // ⚠️ 이 카운터가 없으면 평판 0짜리 회사가 잔고만 두둑할 때 영원히 안 끝난다
  //    (직원이 다 나가 지출이 줄기 때문 — 설계 결정표의 "폐업은 파생이 아니다").
  it('위기가 정해진 주만큼 이어지면 폐업', () => {
    expect(judgeOver(9, 0, CRISIS_WEEKS_TO_SHUTDOWN - 1)).toBeUndefined()
    expect(judgeOver(9, 0, CRISIS_WEEKS_TO_SHUTDOWN)).toEqual({
      kind: 'shutdown',
      week: 9,
    })
  })

  it('둘이 겹치면 파산이 먼저다', () => {
    expect(judgeOver(9, UNPAID_MONTHS_TO_BANKRUPT, CRISIS_WEEKS_TO_SHUTDOWN)?.kind).toBe('bankrupt')
  })
})
