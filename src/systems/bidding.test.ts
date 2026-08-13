import { describe, expect, it } from 'vitest'
import {
  BID_MAX,
  BID_MIN,
  BID_OPEN_WEEKS,
  BID_RESULT_WEEKS,
  LISTINGS_PER_WEEK,
  LISTING_TIERS,
  findTier,
} from '../data/bidding'
import { INITIAL_GAME, REPUTATION_CRISIS } from '../data/game'
import {
  asRequest,
  bidDeadline,
  bidMinGrade,
  canBid,
  eligibility,
  isOpen,
  listings,
  loseMail,
  resultWeek,
  winChance,
  winMail,
  wins,
} from './bidding'
import { PIPELINE } from './pipeline'

const small = findTier('small')
const large = findTier('large')

/** 조건을 다 갖춘 회사. 개별 테스트가 필요한 칸만 덮어쓴다. */
const rich = { employees: 9, drafts: 9, slideGrades: ['SSS' as const] }

describe('공고 목록', () => {
  it('같은 주차·같은 평판은 같은 목록이다 — 창을 닫았다 열어 굴릴 수 없다', () => {
    expect(listings(7, 50)).toEqual(listings(7, 50))
  })

  it('주차가 다르면 목록도 달라진다', () => {
    expect(listings(7, 50)).not.toEqual(listings(8, 50))
  })

  it('평판이 위기선 아래면 빈다 — 설계 결정표의 "아무것도 안 뜬다"', () => {
    expect(listings(7, REPUTATION_CRISIS - 1)).toEqual([])
    // 뒤집어 확인한다: 위기선에 닿는 순간 다시 뜬다.
    expect(listings(7, REPUTATION_CRISIS).length).toBe(LISTINGS_PER_WEEK)
  })

  it('평판이 규모를 정한다 — 낮으면 작은 공고만 뜬다(= 단가 하락)', () => {
    const low = listings(7, REPUTATION_CRISIS).map((l) => l.tier)
    expect(new Set(low)).toEqual(new Set(['small']))
    // 높은 평판에서는 큰 단이 후보에 든다(같은 주차라도 목록이 달라진다).
    const high = listings(7, 90).map((l) => l.tier)
    expect(high.some((t) => t !== 'small')).toBe(true)
  })
})

// ⚠️ 공고별 조건과 **다른 축**이다 — 회사 하나에 한 번 걸리는 문이라 조건 없는 공고에도
//    적용된다. 초반의 수주 경로를 메일 하나로 묶어 두는 규칙이라 뒤집어서도 확인한다.
describe('입찰 자격(회사등급)', () => {
  it('소기업 미만은 입찰 자체가 막힌다', () => {
    const need = bidMinGrade()
    expect(canBid(need.minReputation - 1)).toBe(false)
    expect(canBid(need.minReputation)).toBe(true)
    expect(canBid(100)).toBe(true)
    // 시작 평판(30)은 이미 소기업이라 열려 있다 — 첫 화면이 빈 채로 시작하지 않는다.
    expect(canBid(INITIAL_GAME.reputation)).toBe(true)
  })
})

describe('참가 자격', () => {
  it('셋을 다 맞춰야 들어간다 — 하나씩 빼면 그때마다 막힌다', () => {
    expect(eligibility(large.require, rich).ok).toBe(true)
    expect(eligibility(large.require, { ...rich, employees: 0 }).ok).toBe(false)
    expect(eligibility(large.require, { ...rich, drafts: 0 }).ok).toBe(false)
    expect(eligibility(large.require, { ...rich, slideGrades: ['F'] }).ok).toBe(false)
  })

  it('무엇이 모자란지 말한다 — 흐린 버튼만 두지 않는다', () => {
    const { missing } = eligibility(large.require, { employees: 0, drafts: 0, slideGrades: [] })
    expect(missing).toHaveLength(3)
    expect(missing.join()).toContain('직원')
    expect(missing.join()).toContain('시안')
    expect(missing.join()).toContain('기획안')
  })

  it('기획안 랭크는 **가장 높은 것**을 본다 — 회사가 무엇까지 할 수 있는지를 증명한다', () => {
    expect(eligibility(large.require, { ...rich, slideGrades: ['F', 'A'] }).ok).toBe(true)
  })

  it('가장 작은 단은 1인 회사도 들어간다 — 첫 공고를 딸 길이 있어야 한다', () => {
    expect(eligibility(small.require, { employees: 0, drafts: 0, slideGrades: [] }).ok).toBe(true)
  })
})

describe('낙찰 확률', () => {
  it('0~1 밖으로 나가지 않는다 — 양끝에서도 BID_MIN~BID_MAX 안이다', () => {
    for (const tier of LISTING_TIERS) {
      for (const rep of [0, 100]) {
        for (const stat of [0, 100]) {
          const p = winChance(tier, rep, stat)
          expect(p).toBeGreaterThanOrEqual(BID_MIN)
          expect(p).toBeLessThanOrEqual(BID_MAX)
        }
      }
    }
  })

  it('평판과 능력치가 올린다 — 둘 다 확률의 축이다', () => {
    expect(winChance(large, 80, 30)).toBeGreaterThan(winChance(large, 10, 30))
    expect(winChance(large, 30, 90)).toBeGreaterThan(winChance(large, 30, 10))
  })

  it('규모가 클수록 어렵다 — 조건·단가와 함께 오르는 값이다', () => {
    expect(winChance(large, 50, 50)).toBeLessThan(winChance(small, 50, 50))
  })
})

describe('추첨', () => {
  it('같은 공고·같은 확률은 늘 같은 결과다 — 다시 걸어도 안 바뀐다', () => {
    const first = wins('wk:3:1', 0.5)
    for (let i = 0; i < 5; i++) expect(wins('wk:3:1', 0.5)).toBe(first)
  })

  it('공고가 다르면 결과도 갈린다', () => {
    const some = Array.from({ length: 20 }, (_, i) => wins(`wk:3:${i}`, 0.5))
    expect(new Set(some).size).toBe(2)
  })

  it('확률 0은 늘 떨어지고 1은 늘 붙는다 — 양끝의 뜻이 지켜진다', () => {
    expect(wins('wk:3:1', 0)).toBe(false)
    expect(wins('wk:3:1', 1)).toBe(true)
  })
})

describe('낙찰 통보', () => {
  it('평범한 Request가 되어 평소 공정을 탄다 — 새 업무 축이 아니다', () => {
    const l = listings(5, 60)[0]!
    const req = asRequest(l, 5)
    expect(req.id).toBe(l.id)
    expect(req.kind).toBe(l.kind)
    expect(req.dueWeeks).toBeGreaterThan(0)
    // 그 종류의 공정 줄이 실제로 있다(= `acceptJob` 뒤에 창들이 이 업무를 세운다).
    expect(PIPELINE[req.kind].length).toBeGreaterThan(0)
    // 팝업은 공고에 뜨지 않는다(게시 기간 불변식 때문).
    expect(req.kind).not.toBe('popup')
    expect(req.popup).toBeUndefined()
  })
})

describe('입찰 기한', () => {
  it('뜬 주부터 BID_OPEN_WEEKS주 동안 열려 있고 그 뒤로는 닫힌다', () => {
    const l = listings(5, 60)[0]!
    expect(bidDeadline(l)).toBe(5 + BID_OPEN_WEEKS - 1)
    expect(isOpen(l, 5)).toBe(true)
    expect(isOpen(l, bidDeadline(l))).toBe(true)
    // 뒤집어 확인한다: 한 주만 더 가면 닫힌다.
    expect(isOpen(l, bidDeadline(l) + 1)).toBe(false)
  })

  it('결과는 익주다 — 입찰한 주에는 나오지 않는다', () => {
    expect(resultWeek(5)).toBe(5 + BID_RESULT_WEEKS)
    expect(resultWeek(5)).toBeGreaterThan(5)
  })
})

describe('결과 메일', () => {
  it('낙찰은 고를 것이 있는 글(Request)이고 낙방은 알림(ad)이다', () => {
    const l = listings(5, 60)[0]!
    const won = winMail(l, 6)
    // ⚠️ `ad`가 아니어야 `JobActions`가 사업 시작 버튼을 그린다.
    expect(won.ad).toBeUndefined()
    expect(won.bid).toBe(true)
    expect(won.dueWeeks).toBeGreaterThan(0)
    // id가 공고 id 그대로라 `acceptJob`이 만드는 업무 id가 공고 id가 된다.
    expect(won.id).toBe(l.id)

    expect(loseMail(l, 6).ad).toBe(true)
  })
})
