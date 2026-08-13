import { beforeEach, describe, expect, it } from 'vitest'
import { PORTFOLIO_BONUS_MAX, PORTFOLIO_BONUS_PER } from './data/bidding'
import { INITIAL_GAME, type Grade } from './data/game'
import { INSPIRE_SHIFT, REFERENCE_AP } from './data/reference'
import type { Request } from './data/inbox'
import { bidStats, useGame } from './store'
import { portfolioBonus, showpieces } from './systems/portfolio'
import type { Draft } from './systems/craft'

/** 쌓인 작업물이 수주 확률에 얹히는 축(`systems/portfolio.ts`)과, 레퍼런스 사이트에서
 *  얻은 영감이 시안 등급을 미는 축(`data/reference.ts`)을 함께 본다.
 *
 * ⚠️ 두 축 다 **새 목록을 만들지 않는다** — 앞은 이미 있는 세 목록의 등급에서 파생하고,
 *    뒤는 주차 한 칸(`inspiredWeek`)만 남긴다. 그래서 여기서 지키는 것은 "파생이 실제로
 *    화면·확률에 닿는가"다. */

const draft = (id: string, grade: Grade): Draft => ({
  id,
  jobId: 'j1',
  name: `${id}.fig`,
  madeWeek: 1,
  grade,
})

beforeEach(() => {
  useGame.setState({
    ...INITIAL_GAME,
    windows: [],
    jobs: [],
    readIds: [],
    meetings: {},
    rejectedIds: [],
    files: [],
    drafts: [],
    slides: [],
    popups: [],
    mails: [],
    employees: [],
    orders: [],
    trainings: [],
    bids: [],
    chats: [],
    requests: [],
    weekendWorked: [],
    crisisWeeks: 0,
    revenue: 0,
    unpaidMonths: 0,
    over: undefined,
    inspiredWeek: undefined,
  })
})

describe('포트폴리오 보정', () => {
  it('낮은 등급은 세지 않는다 — 찍어 내는 것이 최적이 되면 안 된다', () => {
    expect(showpieces(['F', 'D', 'C', 'B'])).toBe(0)
    expect(showpieces(['A', 'S', 'SSS'])).toBe(3)
  })

  it('상한이 있다 — 오래 굴린 판이 확률을 지급으로 만들지 않는다', () => {
    const many = Array.from({ length: 100 }, () => 'SSS' as Grade)
    expect(portfolioBonus(many)).toBe(PORTFOLIO_BONUS_MAX)
  })

  it('세 목록이 다 실린다 — 만든 것 전부가 포트폴리오다', () => {
    const base = bidStats(useGame.getState())
    useGame.setState({
      files: [{ ...draft('f1', 'S'), id: 'f1' }],
      drafts: [draft('d1', 'S')],
      slides: [draft('s1', 'S')],
    })
    expect(bidStats(useGame.getState())).toBe(base + 3 * PORTFOLIO_BONUS_PER)
  })
})

describe('레퍼런스 영감', () => {
  /** 시안을 만들 수 있는 자리까지 판을 세운다 — 사이트 업무의 첫 공정(화면정의서)을
   *  건너뛰고 바로 시안 차례가 되게 `step`/`replied`를 맞춘다. */
  const readyForDraft = () => {
    const req: Request = {
      id: 'j1',
      channel: 'mail',
      from: '별빛문구',
      subject: '사이트',
      body: '',
      at: '',
      dueWeeks: 8,
      kind: 'site',
    }
    useGame.getState().acceptJob(req)
    useGame.setState((s) => ({
      jobs: s.jobs.map((j) => (j.id === 'j1' ? { ...j, step: 1, replied: 1 } : j)),
      ap: 9,
    }))
  }

  it('행동력을 물고, 같은 주에 두 번은 안 된다', () => {
    const before = useGame.getState().ap
    useGame.getState().surfReference()
    expect(useGame.getState().ap).toBe(before - REFERENCE_AP)
    expect(useGame.getState().inspiredWeek).toBe(useGame.getState().week)

    // 두 번째는 아무 일도 일어나지 않는다 — 행동력으로 등급을 계속 살 수 없다.
    useGame.getState().surfReference()
    expect(useGame.getState().ap).toBe(before - REFERENCE_AP)
  })

  // ⚠️ 규칙을 뒤집어 확인한다: 영감이 **없을 때의 등급**과 **있을 때의 등급**을 둘 다 봐야
  //    "한 칸 올랐다"가 우연이 아니라 규칙임이 증명된다.
  it('영감을 받은 주의 시안만 등급이 한 칸 오른다', () => {
    readyForDraft()
    useGame.getState().makeDraft('j1', 'hard')
    const plain = useGame.getState().drafts.at(-1)!.grade

    useGame.setState((s) => ({
      jobs: s.jobs.map((j) => (j.id === 'j1' ? { ...j, step: 1, replied: 1 } : j)),
      ap: 9,
    }))
    useGame.getState().surfReference()
    useGame.getState().makeDraft('j1', 'hard')
    const inspired = useGame.getState().drafts.at(-1)!.grade

    const order: Grade[] = ['F', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']
    expect(order.indexOf(inspired)).toBe(order.indexOf(plain) + INSPIRE_SHIFT)
  })

  it('주가 넘어가면 영감이 식는다 — 걷어 내는 자리를 따로 두지 않는 근거다', () => {
    useGame.getState().surfReference()
    const week = useGame.getState().week
    useGame.setState({ week: week + 1 })
    expect(useGame.getState().inspiredWeek).not.toBe(useGame.getState().week)
  })
})
