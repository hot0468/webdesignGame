import { describe, expect, it } from 'vitest'
import {
  FEEDBACK_SUCCESS,
  GRUDGE_QUIT,
  REQUEST_CHANCE,
  TRAIN_REQUEST_MULT,
  TRAIN_STAT_GAIN,
} from '../data/employees'
import { GRADE_ORDER } from './pipeline'
import type { Employee } from './employee'
import {
  fedUp,
  feedbackWorks,
  grudged,
  makeRequest,
  raiseGrade,
  trainRequestGain,
  trainRequestWorks,
  type Workable,
} from './request'

const emp = (over: Partial<Employee> = {}): Employee => ({
  id: 'e1',
  name: '김지훈',
  role: 'designer',
  level: 2,
  stats: { design: 50, publishing: 40, planning: 30, cs: 30 },
  hiredWeek: 1,
  ...over,
})

const works: Workable[] = [{ id: 'f1', name: '팝업.png', grade: 'C' }]
const opts = { busy: false, maxLevel: false, works }

describe('요청 발생', () => {
  it('같은 씨앗(주차 + 직원 id)은 늘 같은 요청이다 — 창을 닫았다 열어 굴릴 수 없다', () => {
    for (let week = 1; week <= 40; week++) {
      expect(makeRequest(emp(), week, opts)).toEqual(makeRequest(emp(), week, opts))
    }
  })

  it('씨앗이 다르면 답도 다르다 — 한 사람에게만 몰리거나 아무에게도 안 오지 않는다', () => {
    const got = Array.from({ length: 60 }, (_, i) =>
      makeRequest(emp({ id: `e${i}` }), 5, opts),
    ).filter((q) => q !== undefined)
    expect(got.length).toBeGreaterThan(0)
    expect(got.length).toBeLessThan(60)
  })

  it('발생 확률이 `REQUEST_CHANCE` 언저리다 — 수치가 뜻을 가진다', () => {
    const n = 4000
    const hit = Array.from({ length: n }, (_, i) =>
      makeRequest(emp({ id: `e${i}` }), 3, opts),
    ).filter((q) => q !== undefined).length
    expect(hit / n).toBeGreaterThan(REQUEST_CHANCE - 0.04)
    expect(hit / n).toBeLessThan(REQUEST_CHANCE + 0.04)
  })

  it('잡혀 있는 사람은 요청을 보내지 않는다 — 휴가 중에 휴가를 달랄 수 없다', () => {
    for (let week = 1; week <= 60; week++) {
      expect(makeRequest(emp(), week, { ...opts, busy: true })).toBeUndefined()
    }
  })

  // 규칙을 뒤집어 확인한다: 대상이 없으면 그 갈래가 아예 안 나와야 한다.
  it('올릴 작업물이 없으면 피드백 요청이 오지 않는다', () => {
    const kinds = Array.from({ length: 400 }, (_, i) =>
      makeRequest(emp({ id: `e${i}` }), 7, { ...opts, works: [] })?.kind,
    )
    expect(kinds).not.toContain('feedback')
    // 나머지 갈래는 여전히 온다(요청 자체가 죽지 않았다).
    expect(kinds.filter((k) => k !== undefined).length).toBeGreaterThan(0)
  })

  it('작업물이 다 사다리 꼭대기면 피드백 요청이 오지 않는다 — 올릴 칸이 없다', () => {
    const top: Workable[] = [{ id: 'f1', name: '최고.png', grade: 'SSS' }]
    const kinds = Array.from({ length: 400 }, (_, i) =>
      makeRequest(emp({ id: `e${i}` }), 7, { ...opts, works: top })?.kind,
    )
    expect(kinds).not.toContain('feedback')
  })

  it('최고 레벨이면 교육요청이 오지 않는다', () => {
    const kinds = Array.from({ length: 400 }, (_, i) =>
      makeRequest(emp({ id: `e${i}` }), 9, { ...opts, maxLevel: true })?.kind,
    )
    expect(kinds).not.toContain('training')
  })

  it('피드백 요청은 **꼭대기가 아닌** 작업물만 가리킨다', () => {
    const mixed: Workable[] = [
      { id: 'top', name: '최고.png', grade: 'SSS' },
      { id: 'low', name: '보통.png', grade: 'D' },
    ]
    const targets = Array.from({ length: 400 }, (_, i) =>
      makeRequest(emp({ id: `e${i}` }), 11, { ...opts, works: mixed }),
    )
      .filter((q) => q?.kind === 'feedback')
      .map((q) => q!.target!.fileId)
    expect(targets.length).toBeGreaterThan(0)
    expect(new Set(targets)).toEqual(new Set(['low']))
  })
})

describe('확률 판정', () => {
  it('같은 요청 id는 늘 같은 성패다 — 다시 눌러 굴릴 수 없다', () => {
    for (let i = 0; i < 50; i++) {
      const id = `req:${i}:e1`
      expect(feedbackWorks(id)).toBe(feedbackWorks(id))
      expect(trainRequestWorks(id)).toBe(trainRequestWorks(id))
    }
  })

  it('피드백 성공률이 `FEEDBACK_SUCCESS` 언저리다', () => {
    const n = 4000
    const ok = Array.from({ length: n }, (_, i) => feedbackWorks(`req:${i}:e1`)).filter(Boolean)
    expect(ok.length / n).toBeGreaterThan(FEEDBACK_SUCCESS - 0.04)
    expect(ok.length / n).toBeLessThan(FEEDBACK_SUCCESS + 0.04)
  })

  it('실패도 성공도 둘 다 일어난다 — 확률이 상수가 아니다', () => {
    const ok = Array.from({ length: 100 }, (_, i) => feedbackWorks(`req:${i}:e1`))
    expect(ok).toContain(true)
    expect(ok).toContain(false)
  })
})

describe('등급 사다리', () => {
  it('한 칸만 오른다', () => {
    expect(raiseGrade('C')).toBe('B')
    expect(raiseGrade('F')).toBe('D')
  })

  it('사다리 밖(SSS 위)으로 나가지 않는다', () => {
    expect(raiseGrade('SSS')).toBe('SSS')
    expect(GRADE_ORDER).toContain(raiseGrade('SS'))
  })
})

describe('교육요청의 스탯 상승', () => {
  it('성공하면 1.5배, 실패해도 평소 효과는 얻는다 — 0이면 늘 거절이 정답이 된다', () => {
    expect(trainRequestGain(true)).toBe(Math.round(TRAIN_STAT_GAIN * TRAIN_REQUEST_MULT))
    expect(trainRequestGain(false)).toBe(TRAIN_STAT_GAIN)
    expect(trainRequestGain(true)).toBeGreaterThan(trainRequestGain(false))
  })
})

describe('불만', () => {
  it('임계에 닿아야 나간다 — 그 아래면 안 나간다', () => {
    for (let g = 0; g < GRUDGE_QUIT; g++) expect(fedUp(g)).toBe(false)
    expect(fedUp(GRUDGE_QUIT)).toBe(true)
    expect(fedUp(GRUDGE_QUIT + 1)).toBe(true)
  })

  it('거절을 `GRUDGE_QUIT`번 쌓으면 임계에 닿는다', () => {
    let g: number | undefined = undefined
    for (let i = 0; i < GRUDGE_QUIT; i++) {
      expect(fedUp(g)).toBe(false)
      g = grudged(g)
    }
    expect(fedUp(g)).toBe(true)
  })
})
