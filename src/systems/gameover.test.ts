import { describe, expect, it } from 'vitest'
import { CRISIS_WEEKS_TO_SHUTDOWN } from '../data/game'
import { judgeOver } from './gameover'

describe('게임 오버 판정', () => {
  it('멀쩡하면 끝나지 않는다', () => {
    expect(judgeOver(5, 1_000_000, 0)).toBeUndefined()
    // 0원은 아직 파산이 아니다 — 음수가 되어야 한다(빚을 진 것이 파산이다).
    expect(judgeOver(5, 0, 0)).toBeUndefined()
  })

  it('소지금이 음수면 파산', () => {
    expect(judgeOver(8, -1, 0)).toEqual({ kind: 'bankrupt', week: 8 })
  })

  // ⚠️ 이 카운터가 없으면 평판 0짜리 회사가 잔고만 두둑할 때 영원히 안 끝난다
  //    (직원이 다 나가 지출이 줄기 때문 — 설계 결정표의 "폐업은 파생이 아니다").
  it('위기가 정해진 주만큼 이어지면 폐업', () => {
    expect(judgeOver(9, 500_000, CRISIS_WEEKS_TO_SHUTDOWN - 1)).toBeUndefined()
    expect(judgeOver(9, 500_000, CRISIS_WEEKS_TO_SHUTDOWN)).toEqual({
      kind: 'shutdown',
      week: 9,
    })
  })

  it('둘이 겹치면 파산이 먼저다', () => {
    expect(judgeOver(9, -1, CRISIS_WEEKS_TO_SHUTDOWN)?.kind).toBe('bankrupt')
  })
})
