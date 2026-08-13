import { beforeEach, describe, expect, it } from 'vitest'
import { BID_AP, findTier } from './data/bidding'
import { INITIAL_GAME } from './data/game'
import { bidStats, useGame } from './store'
import { eligibility, listings, winChance, wins, type Listing } from './systems/bidding'

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
    hirePostWeek: undefined,
    hiredApplicantIds: [],
    bids: [],
    chats: [],
    requests: [],
    weekendWorked: [],
    crisisWeeks: 0,
    revenue: 0,
    unpaidMonths: 0,
    over: undefined,
  })
})

/** 확률을 눈금까지 밀어 결과를 정해 놓고 보는 공고. 어느 단인지는 인자가 정한다. */
const listing = (over: Partial<Listing> = {}): Listing => ({
  id: 'wk:1:0',
  tier: 'small',
  kind: 'ppt',
  from: '새봄공단',
  subject: '사업설명회 자료 제작',
  body: '…',
  week: 1,
  ...over,
})

/** 그 공고가 지금 상태에서 **응모 가능하고** 붙는지 — 결과를 미리 알고 단언하기 위해서다.
 *  ⚠️ 자격도 함께 본다: 시작 평판 30이면 중규모 공고도 뜨는데 빈 회사는 못 들어간다. */
const canWin = (l: Listing) => {
  const s = useGame.getState()
  const tier = findTier(l.tier)
  const fit = eligibility(tier.require, {
    employees: s.employees.length,
    drafts: s.drafts.length,
    slideGrades: s.slides.map((d) => d.grade),
  }).ok
  return fit && wins(l.id, winChance(tier, s.reputation, bidStats(s)))
}

describe('응모', () => {
  it('행동력을 문다 — 공짜면 조건이 맞는 공고에 전부 거는 것이 늘 정답이 된다', () => {
    const before = useGame.getState().ap
    useGame.getState().bidListing(listing())
    expect(useGame.getState().ap).toBe(before - BID_AP)
    expect(useGame.getState().bids).toEqual(['wk:1:0'])
  })

  it('결과가 어느 쪽이든 메일이 온다 — 응모하고 무슨 일이 있었는지 읽을 자리다', () => {
    useGame.getState().bidListing(listing())
    expect(useGame.getState().mails[0]?.id).toBe('bidmail:wk:1:0')
  })

  it('참가 조건 미달이면 아무 일도 일어나지 않는다 — 행동력도 안 나간다', () => {
    // 대규모는 직원 3·시안 5·기획안 A를 요구한다. 지금 회사는 아무것도 없다.
    const before = useGame.getState().ap
    useGame.getState().bidListing(listing({ tier: 'large' }))
    expect(useGame.getState().ap).toBe(before)
    expect(useGame.getState().bids).toEqual([])
    expect(useGame.getState().mails).toEqual([])
  })

  it('행동력이 모자라면 아무 일도 일어나지 않는다', () => {
    useGame.setState({ ap: 0 })
    useGame.getState().bidListing(listing())
    expect(useGame.getState().bids).toEqual([])
  })

  it('다시 응모해도 결과가 안 바뀐다 — 당첨될 때까지 굴릴 수 없다', () => {
    const l = listing()
    useGame.getState().bidListing(l)
    const after = { jobs: useGame.getState().jobs.length, mails: useGame.getState().mails.length }
    const ap = useGame.getState().ap

    // 두 번째 응모는 통째로 막힌다 — 행동력도, 업무도, 메일도 늘지 않는다.
    useGame.getState().bidListing(l)
    expect(useGame.getState().ap).toBe(ap)
    expect(useGame.getState().jobs).toHaveLength(after.jobs)
    expect(useGame.getState().mails).toHaveLength(after.mails)

    // 기록을 지우고 다시 걸어도(= 막는 가드를 뒤집어도) **추첨 결과 자체가 같다**.
    const won = useGame.getState().jobs.length === 1
    useGame.setState({ bids: [], jobs: [], mails: [], ap: INITIAL_GAME.ap })
    useGame.getState().bidListing(l)
    expect(useGame.getState().jobs.length === 1).toBe(won)
  })
})

/** 조건이 맞으면서 결과가 `want`인 공고 하나. **주차를 옮겨 가며 찾는다** —
 *  한 주의 목록에 늘 둘 다 있으라는 법이 없고, 있다고 못박으면 수치를 조정할 때마다
 *  이 테스트가 엉뚱한 이유로 깨진다. */
const findListing = (want: boolean): Listing => {
  for (let w = 1; w <= 20; w++) {
    useGame.setState({ week: w })
    const s = useGame.getState()
    const hit = listings(w, s.reputation).find((l) => canWin(l) === want && eligible(l))
    if (hit) return hit
  }
  throw new Error(`${want}인 공고를 20주 안에서 못 찾았다`)
}

const eligible = (l: Listing) => {
  const s = useGame.getState()
  return eligibility(findTier(l.tier).require, {
    employees: s.employees.length,
    drafts: s.drafts.length,
    slideGrades: s.slides.map((d) => d.grade),
  }).ok
}

describe('당첨된 공고', () => {
  it('평범한 업무가 되어 평소 공정을 탄다 — 새 업무 축이 아니다', () => {
    const l = findListing(true)

    useGame.getState().bidListing(l!)
    const job = useGame.getState().jobs.find((j) => j.id === l!.id)
    expect(job).toBeDefined()
    expect(job!.kind).toBe(l!.kind)
    expect(job!.step).toBe(0)
    expect(job!.replied).toBe(0)
    expect(job!.done).toBe(false)
    // 마감이 수주한 주에서 굳는다(상대값으로 두면 남은 기한이 안 준다).
    expect(job!.due).toBeGreaterThan(useGame.getState().week)
  })

  it('떨어진 공고는 업무가 되지 않는다', () => {
    const l = findListing(false)
    useGame.getState().bidListing(l!)
    expect(useGame.getState().jobs).toEqual([])
    expect(useGame.getState().bids).toEqual([l!.id])
  })
})
