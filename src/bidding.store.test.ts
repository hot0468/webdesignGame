import { beforeEach, describe, expect, it } from 'vitest'
import { BID_AP, BID_OPEN_WEEKS, findTier } from './data/bidding'
import { INITIAL_GAME } from './data/game'
import type { Request } from './data/inbox'
import { bidStats, useGame } from './store'
import {
  bidDeadline,
  bidMinGrade,
  eligibility,
  isOpen,
  openListings,
  resultWeek,
  winChance,
  wins,
  type Listing,
} from './systems/bidding'

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

/** 그 공고가 지금 상태에서 **입찰 가능하고** 붙는지 — 결과를 미리 알고 단언하기 위해서다.
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

describe('입찰', () => {
  it('행동력을 문다 — 공짜면 조건이 맞는 공고에 전부 거는 것이 늘 정답이 된다', () => {
    const before = useGame.getState().ap
    useGame.getState().bidListing(listing())
    expect(useGame.getState().ap).toBe(before - BID_AP)
    expect(useGame.getState().bids.map((b) => b.listing.id)).toEqual(['wk:1:0'])
  })

  it('입찰한 그 주에는 결과가 없다 — 메일도 업무도 안 생긴다', () => {
    useGame.getState().bidListing(listing())
    expect(useGame.getState().mails).toEqual([])
    expect(useGame.getState().jobs).toEqual([])
    expect(useGame.getState().bids[0]!.won).toBeUndefined()
  })

  it('참가 조건 미달이면 아무 일도 일어나지 않는다 — 행동력도 안 나간다', () => {
    // 대규모는 직원 3·시안 5·기획안 A를 요구한다. 지금 회사는 아무것도 없다.
    const before = useGame.getState().ap
    useGame.getState().bidListing(listing({ tier: 'large' }))
    expect(useGame.getState().ap).toBe(before)
    expect(useGame.getState().bids).toEqual([])
  })

  // ⚠️ 화면이 버튼을 안 그려도 스토어에 길이 남으면 안 된다(이 리포의 확립된 규칙).
  it('소기업 미만은 걸리지 않는다 — 뒤집어 보면 그 등급부터 걸린다', () => {
    useGame.setState({ reputation: bidMinGrade().minReputation - 1 })
    useGame.getState().bidListing(listing())
    expect(useGame.getState().bids).toEqual([])

    useGame.setState({ reputation: bidMinGrade().minReputation })
    useGame.getState().bidListing(listing())
    expect(useGame.getState().bids).toHaveLength(1)
  })

  it('행동력이 모자라면 아무 일도 일어나지 않는다', () => {
    useGame.setState({ ap: 0 })
    useGame.getState().bidListing(listing())
    expect(useGame.getState().bids).toEqual([])
  })

  it('같은 공고에 두 번 걸 수 없다 — 행동력만 계속 태우는 길을 막는다', () => {
    const l = listing()
    useGame.getState().bidListing(l)
    const ap = useGame.getState().ap
    useGame.getState().bidListing(l)
    expect(useGame.getState().ap).toBe(ap)
    expect(useGame.getState().bids).toHaveLength(1)
  })
})

describe('입찰 기한', () => {
  it('기한이 지나면 못 건다 — 뒤집어 보면 마감 주차까지는 걸린다', () => {
    const l = listing() // 1주차에 뜬 공고
    // 마감 주차에는 아직 걸린다.
    useGame.setState({ week: bidDeadline(l) })
    useGame.getState().bidListing(l)
    expect(useGame.getState().bids).toHaveLength(1)

    // 하루(한 주) 더 가면 통째로 막힌다 — 행동력도 안 나간다.
    useGame.setState({ bids: [], week: bidDeadline(l) + 1, ap: INITIAL_GAME.ap })
    useGame.getState().bidListing(l)
    expect(useGame.getState().bids).toEqual([])
    expect(useGame.getState().ap).toBe(INITIAL_GAME.ap)
  })

  it('기한이 살아 있는 지난 주 공고도 화면에 선다 — 아니면 기한이 뜻을 잃는다', () => {
    const week = 1 + BID_OPEN_WEEKS - 1
    const open = openListings(week, 50)
    // 이번 주 것만이 아니다.
    expect(open.some((l) => l.week < week)).toBe(true)
    // 그리고 **전부 걸 수 있는 것들뿐**이다(마감된 것이 섞이지 않는다).
    expect(open.every((l) => isOpen(l, week))).toBe(true)
  })
})

/** 조건이 맞으면서 결과가 `want`인 공고 하나. **주차를 옮겨 가며 찾는다** —
 *  한 주의 목록에 늘 둘 다 있으라는 법이 없고, 있다고 못박으면 수치를 조정할 때마다
 *  이 테스트가 엉뚱한 이유로 깨진다. */
const findListing = (want: boolean): Listing => {
  for (let w = 1; w <= 20; w++) {
    useGame.setState({ week: w })
    const s = useGame.getState()
    const hit = openListings(w, s.reputation).find((l) => canWin(l) === want && eligible(l))
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

describe('결과는 익주에 온다', () => {
  it('주차를 넘겨야 결과 메일이 온다 — 누르는 즉시가 아니다', () => {
    const l = findListing(true)
    useGame.getState().bidListing(l)
    expect(useGame.getState().mails).toEqual([])

    useGame.getState().advanceWeek()
    expect(useGame.getState().bids[0]!.week).toBe(l.week)
    expect(resultWeek(l.week)).toBe(useGame.getState().week)
    expect(useGame.getState().mails.some((m) => m.id === l.id)).toBe(true)
    expect(useGame.getState().bids[0]!.won).toBe(true)
  })

  it('낙찰 메일은 결정 버튼이 붙는 갈래다 — 낙방 메일은 알림 그대로다', () => {
    const win = findListing(true)
    useGame.getState().bidListing(win)
    useGame.getState().advanceWeek()
    const won = useGame.getState().mails.find((m) => m.id === win.id)!
    // `ad`가 아니어야 `JobActions`가 사업 시작 버튼을 그린다.
    expect(won.ad).toBeUndefined()
    expect(won.ad === undefined && won.bid).toBe(true)

    const lose = findListing(false)
    useGame.getState().bidListing(lose)
    useGame.getState().advanceWeek()
    const lost = useGame.getState().mails.find((m) => m.id === `bidmail:${lose.id}`)!
    expect(lost.ad).toBe(true)
  })

  it('낙찰돼도 업무는 아직 없다 — 사업 시작을 눌러야 생긴다', () => {
    const l = findListing(true)
    useGame.getState().bidListing(l)
    useGame.getState().advanceWeek()
    expect(useGame.getState().jobs).toEqual([])
  })

  it('저장·불러오기를 해도 결과가 안 바뀐다 — 씨앗은 공고 id 하나다', () => {
    const l = findListing(true)
    useGame.getState().bidListing(l)
    // 판정 전에 저장했다가 불러온다(= 세이브를 뜯어 굴려 뽑는 길).
    useGame.getState().saveSlot(1)
    useGame.getState().advanceWeek()
    const first = useGame.getState().bids[0]!.won

    useGame.getState().loadSlot(1)
    useGame.getState().advanceWeek()
    expect(useGame.getState().bids[0]!.won).toBe(first)
  })
})

describe('사업 시작', () => {
  it('낙찰 메일에서 누르면 평범한 업무가 된다 — 새 업무 축이 아니다', () => {
    const l = findListing(true)
    useGame.getState().bidListing(l)
    useGame.getState().advanceWeek()
    const mail = useGame.getState().mails.find((m) => m.id === l.id)!
    expect(mail.ad).toBeUndefined()

    useGame.getState().acceptJob(mail as Request)
    const job = useGame.getState().jobs.find((j) => j.id === l.id)
    expect(job).toBeDefined()
    expect(job!.kind).toBe(l.kind)
    expect(job!.step).toBe(0)
    expect(job!.replied).toBe(0)
    expect(job!.done).toBe(false)
    // 마감은 **시작을 누른 주**에서 굳는다 — 결과를 기다린 주는 기한을 먹지 않는다.
    expect(job!.due).toBeGreaterThan(useGame.getState().week)
  })

  it('시작하지 않아도 게임이 안 깨진다 — 안 누르면 그냥 안 하는 것이다', () => {
    const l = findListing(true)
    useGame.getState().bidListing(l)
    useGame.getState().advanceWeek()
    // 몇 주를 그냥 흘려도 업무가 저절로 생기거나 **결과가 다시 판정되지** 않는다.
    // (월말 정산 메일 등 다른 글은 늘어날 수 있으므로 이 공고의 글만 센다.)
    useGame.getState().advanceWeek()
    useGame.getState().advanceWeek()
    expect(useGame.getState().jobs).toEqual([])
    expect(useGame.getState().mails.filter((m) => m.id === l.id)).toHaveLength(1)
    expect(useGame.getState().bids).toHaveLength(1)
    // 그리고 **나중에 눌러도 된다** — 메일이 남아 있다.
    useGame.getState().acceptJob(useGame.getState().mails.find((m) => m.id === l.id) as Request)
    expect(useGame.getState().jobs).toHaveLength(1)
  })

  it('떨어진 공고는 시작할 자리가 없다', () => {
    const l = findListing(false)
    useGame.getState().bidListing(l)
    useGame.getState().advanceWeek()
    expect(useGame.getState().mails.some((m) => m.id === l.id)).toBe(false)
    expect(useGame.getState().jobs).toEqual([])
  })
})
