import { describe, expect, it } from 'vitest'
import {
  canReply,
  isFinalReply,
  isTurnOf,
  openStep,
  satisfaction,
  showsIn,
  stepsOf,
  type StepJob,
} from './pipeline'

const job = (over: Partial<StepJob> = {}): StepJob => ({
  kind: 'site',
  step: 0,
  replied: 0,
  ...over,
})

describe('공정의 줄', () => {
  it('신규 사이트는 화면정의서 → 시안 → 퍼블리싱 세 공정이다', () => {
    expect(stepsOf('site').map((s) => s.program)).toEqual(['ppt', 'figma', 'editor'])
    // 유지보수 수정은 하나 — 배너 한 장 바꾸는 일에 화면정의서를 요구하지 않는다.
    expect(stepsOf('fix').map((s) => s.program)).toEqual(['editor'])
  })

  // 규칙을 뒤집어 본다: **회신하지 않으면 다음 공정이 열리지 않아야 한다.**
  // 이것이 무너지면 마지막 공정만 눌러 업무를 끝낼 수 있다.
  it('회신해야 다음 공정이 열린다', () => {
    const made = job({ step: 1, replied: 0 })
    expect(openStep(made)).toBeUndefined()
    expect(isTurnOf(made, 'figma')).toBe(false)

    const sent = job({ step: 1, replied: 1 })
    expect(openStep(sent)?.program).toBe('figma')
    expect(isTurnOf(sent, 'figma')).toBe(true)
    // 첫 공정의 창은 이제 차례가 아니다 — 한 번에 한 창만 그 업무를 진다.
    expect(isTurnOf(sent, 'ppt')).toBe(false)
  })

  // 만든 순간 그 창에서 사라지면 방금 만든 파일과 등급을 볼 자리가 없어진다.
  it('만든 뒤 회신 전까지는 그 창의 목록에 남는다 — 다만 차례는 아니다', () => {
    const made = job({ step: 1, replied: 0 })
    expect(showsIn(made, 'ppt')).toBe(true)
    expect(isTurnOf(made, 'ppt')).toBe(false)
    // 회신하고 나면 그 창에서 빠지고 다음 창으로 넘어간다.
    const sent = job({ step: 1, replied: 1 })
    expect(showsIn(sent, 'ppt')).toBe(false)
    expect(showsIn(sent, 'figma')).toBe(true)
  })

  it('마지막 공정을 회신하면 완료 회신이다', () => {
    expect(isFinalReply(job({ step: 1, replied: 0 }))).toBe(false)
    expect(isFinalReply(job({ step: 3, replied: 2 }))).toBe(true)
    expect(isFinalReply(job({ kind: 'fix', step: 1, replied: 0 }))).toBe(true)
  })
})

describe('회신', () => {
  it('만든 것이 없으면 보낼 것도 없다', () => {
    expect(canReply(job({ step: 0, replied: 0 }), 1)).toBe(false)
    expect(canReply(job({ step: 1, replied: 0 }), 1)).toBe(true)
  })

  // ⚠️ 팝업의 완료 회신을 기간 중에 보낼 수 있으면, 완료된 업무는 주차 판정에서 빠지므로
  //    팝업을 몰래 내려도 클레임이 나지 않는다. 그 구멍을 막는 규칙이다.
  it('팝업의 완료 회신은 게시 기간이 끝나야 보낼 수 있다', () => {
    const uploaded = job({ kind: 'popup', step: 2, replied: 1, popupTo: 5 })
    expect(canReply(uploaded, 5)).toBe(false)
    expect(canReply(uploaded, 6)).toBe(true)
    // 중간 회신(제작 → 등록)은 기간과 무관하다.
    expect(canReply(job({ kind: 'popup', step: 1, replied: 0, popupTo: 5 }), 1)).toBe(true)
  })
})

describe('만족도', () => {
  // 약한 고리 규칙 — 잘 만든 것이 있어도 **가장 낮은 것**이 인상을 정한다.
  it('산출물 중 가장 낮은 등급이 만족도다', () => {
    expect(satisfaction(['SSS', 'C', 'A'])).toBe('C')
    expect(satisfaction(['B'])).toBe('B')
    expect(satisfaction([])).toBeUndefined()
  })
})
