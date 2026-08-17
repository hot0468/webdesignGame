import { beforeEach, describe, expect, it } from 'vitest'
import {
  BASE_FEE,
  BREACH_REPUTATION_LOSS,
  CLAIM_REPUTATION_LOSS,
  CS_REPLY_AP,
  csRecover,
  findQuality,
  PUBLISH_QUALITY,
  GRADE_REWARD,
  INITIAL_GAME,
  MAINTENANCE_FEE,
  MAINTENANCE_MIN_DONE,
  WEEKS_PER_MONTH,
  WINDOW_DRAG,
  CRISIS_WEEKS_TO_SHUTDOWN,
  UNPAID_MONTHS_TO_BANKRUPT,
  COMPANY_LEVELS,
  companyLevel,
  AP_MIN,
  apMaxOf,
  MENTAL_PENALTY,
  MENTAL_RECOVERY,
  mentalPenalty,
  WEEKEND_DUE_WEEKS,
  WEEKEND_MENTAL_COST,
  apCost,
  QUALITY,
  SKILL_DISCOUNT,
  gainSkill,
  WINDOW_FIT,
  WINDOW_SPAWN,
} from './data/game'
import { monthlyCost } from './systems/money'
import { MESSAGES, inbox, unreadCount, type Request } from './data/inbox'
import { SHORTCUTS } from './data/sites'
import type { ProgramId } from './data/programs'
import { feedbackWorks, raiseGrade } from './systems/request'
import { asStep, focusedWindowId, useGame } from './store'
import { openStep, satisfaction, stepsOf } from './systems/pipeline'
import { weekendEvent } from './systems/weekend'
import { KEYWORDS, MEETING_AP, SITE_KEYWORDS } from './data/keywords'
import {
  FEEDBACK_AP,
  GRUDGE_PER_REFUSAL,
  GRUDGE_QUIT,
  LEAVE_WEEKS,
  RAISE_AMOUNT,
  REQUEST_EXPIRE_WEEKS,
  salaryOf,
  TRAIN_COST,
  TRAIN_STAT_GAIN,
  TRAIN_WEEKS,
} from './data/employees'
import { canOrder, isBusy, quitMail, trained, type Employee } from './systems/employee'
import type { EmployeeRequest } from './systems/request'
import { makeSlot } from './systems/save'
import { clientKeywords, GRADE_LADDER, revealedKeywords } from './systems/keywords'
import { REVISION_DUE_EXTRA, REVISION_MAX } from './data/followup'
import { needsRevision } from './systems/followup'

/** 넓은 화면. 스폰 위치가 잘리지 않아 계단식 배치가 예전 그대로다. */
const WIDE = { w: 1440, h: 900 }

/** 판을 처음으로 되돌리는 값. ⚠️ `beforeEach`와 **같은 것**을 쓴다 — 한 테스트 안에서
 *  스탯만 바꿔 다시 시작해야 할 때(퍼블리싱 스탯 비교) 두 벌로 적으면 갈린다. */
const emptyState = () =>
  ({
    ...INITIAL_GAME,
    windows: [],
    jobs: [],
    readIds: [],
    meetings: {},
    rejectedIds: [],
    files: [],
    drafts: [],
    slides: [],
    publishes: [],
    popups: [],
    mails: [],
    // ⚠️ 직원·요청·끝난 판까지 되돌린다. 빠뜨리면 앞 테스트가 남긴 직원의 급여가
    //    다음 테스트의 월말 정산에서 빠져 엉뚱한 파산이 난다(실제로 겪었다).
    employees: [],
    orders: [],
    trainings: [],
    requests: [],
    chats: [],
    weekendWorked: [],
    bids: [],
    crisisWeeks: 0,
    figmaSkill: INITIAL_GAME.figmaSkill,
    photoshopSkill: INITIAL_GAME.photoshopSkill,
    codingSkill: INITIAL_GAME.codingSkill,
    revenue: 0,
    apologized: [],
    contracts: [],
    unpaidMonths: 0,
    over: undefined,
  })

beforeEach(() => {
  useGame.setState(emptyState())
})

/** **수정 요청을 끄고** 회신한다. 회신에는 확률로 수정 요청이 붙어 그 회신이 통째로
 *  무르는데(`systems/followup.ts`), 아래 테스트들이 보는 것은 공정의 줄과 대금이지
 *  수정 요청이 아니다 — 거기서 확률이 굴러가면 무엇을 재는 테스트인지가 흐려진다.
 *
 * ⚠️ 확률을 우회하지 않고 **실제 규칙**을 쓴다: 상한(`REVISION_MAX`)에 닿은 업무에는
 *    수정 요청이 오지 않는다. 수정 요청 자체는 아래 전용 테스트가 본다. */
const reply = (id: string) => {
  useGame.setState({
    jobs: useGame.getState().jobs.map((j) => (j.id === id ? { ...j, revisions: REVISION_MAX } : j)),
  })
  useGame.getState().replyJob(id)
}

describe('초기 수치', () => {
  it('src/data/game.ts에서 온다 — 컴포넌트가 만든 두 번째 출처가 없어야 한다', () => {
    const s = useGame.getState()
    expect({
      week: s.week,
      ap: s.ap,
      apMax: s.apMax,
      mental: s.mental,
      mentalMax: s.mentalMax,
      money: s.money,
      reputation: s.reputation,
      design: s.design,
      planning: s.planning,
      publishing: s.publishing,
      cs: s.cs,
      figmaSkill: s.figmaSkill,
      photoshopSkill: s.photoshopSkill,
      codingSkill: s.codingSkill,
    }).toEqual({ ...INITIAL_GAME })
  })
})

describe('창', () => {
  it('열고 닫는다', () => {
    useGame.getState().openWindow('schedule', WIDE)
    expect(useGame.getState().windows.map((w) => w.id)).toEqual(['schedule'])
    useGame.getState().closeWindow('schedule')
    expect(useGame.getState().windows).toEqual([])
  })

  // ⚠️ 좁은 화면에서 창이 **화면 밖에서 태어나면** 잡아 끌 타이틀바까지 잘려 되찾을 수가
  //    없다. 넓은 화면에서는 예전 계단식 스폰이 그대로여야 하므로 둘을 함께 본다.
  it('좁은 화면에서는 스폰 위치가 잘리고, 넓은 화면에서는 그대로다', () => {
    useGame.getState().openWindow('schedule', WIDE)
    expect(useGame.getState().windows[0]!.x).toBe(WINDOW_SPAWN.x)

    useGame.setState({ windows: [] })
    // 가장 넓은 창(`WINDOW_FIT.maxW`)이 들어가고도 남는 자리가 없는 폭이다.
    // ⚠️ 여기서 **창 폭을 다시 계산하지 않는다** — 폭은 CSS가 정하고(`100vw - sp-8`)
    //    스토어는 모른다. 스토어가 보증하는 것은 "왼쪽 여백에서 시작한다" 하나이고,
    //    폭이 뷰포트를 넘지 않는 것은 CSS 쪽의 몫이다(값을 세 곳에 적지 않는다).
    useGame.getState().openWindow('schedule', { w: 760, h: 900 })
    expect(useGame.getState().windows[0]!.x).toBe(WINDOW_FIT.edge)
  })

  it('이미 열린 창을 다시 열면 중복 생성하지 않고 앞으로 온다', () => {
    const { openWindow } = useGame.getState()
    openWindow('schedule', WIDE)
    const z1 = useGame.getState().windows[0]!.z
    openWindow('schedule', WIDE)
    const after = useGame.getState().windows
    expect(after).toHaveLength(1)
    expect(after[0]!.z).toBeGreaterThan(z1)
  })

  it('포커스는 z 최대값에서 파생된다 — 배열 순서가 아니다', () => {
    // 프로그램이 아직 하나뿐이라 두 번째 창은 미래의 id로 세운다(z 로직은 id와 무관하다).
    const later = 'photoshop' as ProgramId
    useGame.setState({
      windows: [
        { id: 'schedule', x: 0, y: 0, z: 1 },
        { id: later, x: 0, y: 0, z: 2 },
      ],
    })
    expect(focusedWindowId(useGame.getState().windows)).toBe(later)

    useGame.getState().focusWindow('schedule')
    expect(focusedWindowId(useGame.getState().windows)).toBe('schedule')

    expect(focusedWindowId([])).toBeNull()
  })

  it('화면 밖으로 잃어버릴 수 없다 — 양쪽 끝을 다 막는다', () => {
    const viewport = { w: 1000, h: 800 }
    const keep = WINDOW_DRAG.keepVisible
    useGame.getState().openWindow('schedule', WIDE)

    useGame.getState().moveWindow('schedule', -50, -80, viewport)
    expect(useGame.getState().windows[0]).toMatchObject({ x: 0, y: 0 })

    // 아래쪽 상한이 없으면 타이틀바가 작업 표시줄 밑으로 들어가 다시 잡을 수 없다.
    useGame.getState().moveWindow('schedule', 9999, 9999, viewport)
    expect(useGame.getState().windows[0]).toMatchObject({
      x: viewport.w - keep,
      y: viewport.h - keep,
    })
  })
})

describe('업무 수주', () => {
  // ⚠️ 광고가 아닌 글만 수주된다(기한이 있는 것). 타입도 그렇게 갈라져 있다.
  const requests = MESSAGES.filter((m) => !m.ad)
  const first = requests[0]!
  const second = requests[1]!

  beforeEach(() => {
    useGame.setState({ jobs: [], rejectedIds: [] })
  })

  // 같은 의뢰가 두 줄이 되면 완료 표시가 갈리고, 공정·대금이 붙는 순간
  // 한 건을 두 번 받는 구멍이 된다.
  it('같은 의뢰를 두 번 수주하지 않는다', () => {
    const { acceptJob } = useGame.getState()
    acceptJob(first)
    acceptJob(first)
    expect(useGame.getState().jobs).toHaveLength(1)

    acceptJob(second)
    expect(useGame.getState().jobs.map((j) => j.id)).toEqual([first.id, second.id])
  })

  // 상대 기한(`dueWeeks`)을 그대로 들고 있으면 주가 지나도 남은 기한이 줄지 않는다.
  // 마감은 **받는 주에 굳어야** 데드라인이 뜻을 가진다.
  it('마감은 수주한 주에 굳는다', () => {
    useGame.setState({ week: 7 })
    useGame.getState().acceptJob(first)
    expect(useGame.getState().jobs[0]!.due).toBe(7 + first.dueWeeks)
  })

  it('거절은 업무를 만들지 않는다', () => {
    useGame.getState().rejectJob(first.id)
    expect(useGame.getState().jobs).toHaveLength(0)
    expect(useGame.getState().rejectedIds).toEqual([first.id])
  })

  // 취소선은 사람이 켜는 것이 아니라 **완료가 붙이는** 표시다 — 되돌아가지 않아야
  // 완료가 뜻을 가진다. 그리고 한 건을 끝냈다고 옆 업무까지 끝나면 안 된다.
  it('완료는 그 업무에만 붙고 되돌아가지 않는다', () => {
    const { acceptJob, completeJob } = useGame.getState()
    acceptJob(first)
    acceptJob(second)
    completeJob(first.id)
    completeJob(first.id)

    expect(Object.fromEntries(useGame.getState().jobs.map((j) => [j.id, j.done]))).toEqual({
      [first.id]: true,
      [second.id]: false,
    })
  })
})

/** 카톡(`톡톡`) 채널 — 클라이언트가 **직접** 말을 거는 자리.
 *  ⚠️ 여기서 증명하는 것은 **새 축이 아니라는 것**이다: 카톡 의뢰도 평소 `Job`이 되어
 *     같은 공정·회신·대금 고리를 탄다. 갈리는 순간 수주 경로가 채널 수만큼 늘어난다. */
describe('카톡 의뢰', () => {
  const chatReq = MESSAGES.find((m): m is Request => !m.ad && m.channel === 'chat')!

  it('평소 Job이 되어 공정을 타고 대금까지 들어온다 — 새 업무 축이 아니다', () => {
    const g = () => useGame.getState()
    g().acceptJob(chatReq)
    const job = g().jobs[0]!
    // 채널만 다르고 나머지는 메일 의뢰와 같다(같은 `acceptJob`을 탔다).
    expect(job.channel).toBe('chat')
    expect(job.id).toBe(chatReq.id)
    expect(openStep(asStep(job))).toEqual(stepsOf(chatReq.kind)[0])

    g().publishJob(chatReq.id)
    expect(g().jobs[0]!.done).toBe(false) // 만든 것으로는 끝나지 않는다
    reply(chatReq.id)
    expect(g().jobs[0]!.done).toBe(true)
    expect(g().money).toBeGreaterThan(INITIAL_GAME.money)
    // 답장·완료 메일은 **그 업무의 채널로** 돌아간다 — 카톡 업무의 답장이 메일함으로
    // 새면 다음 공정이 어디서 열리는지 알 수 없다.
    expect(g().mails[0]!.channel).toBe('chat')
  })

  it('뱃지는 readIds에서 파생한다 — 읽으면 줄고 다른 채널은 안 건드린다', () => {
    const ids = inbox('chat', 99).map((m) => m.id)
    expect(unreadCount('chat', 99, [])).toBe(ids.length)
    expect(unreadCount('chat', 99, ids.slice(0, 1))).toBe(ids.length - 1)
    // 카톡 뱃지가 메일을 읽었다고 줄어들면 두 아이콘이 같은 수를 지게 된다.
    expect(unreadCount('chat', 99, inbox('mail', 99).map((m) => m.id))).toBe(ids.length)
  })
})

/** 퍼블리싱 스탯 — **등급을 정하는 축**이다(비용을 깎는 코딩 숙련도와 다른 축).
 *  ⚠️ 여기서 증명하는 것은 규칙을 **뒤집어** 확인하는 쪽이다: 스탯을 낮추면 완료 등급이
 *     실제로 내려가야 한다. 안 내려가면 퍼블리싱을 대충 해도 결과가 같다는 뜻이다. */
describe('퍼블리싱 스탯', () => {
  const fixReq = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'fix')!

  /** 그 스탯으로 유지보수 업무를 하나 끝내고 만족도 메일을 돌려준다. */
  const finishWith = (publishing: number) => {
    useGame.setState({ ...emptyState(), publishing })
    const g = () => useGame.getState()
    g().acceptJob(fixReq)
    g().publishJob(fixReq.id)
    reply(fixReq.id)
    return g()
  }

  it('스탯이 낮으면 완료 등급이 실제로 내려간다 — 대충 해도 같으면 축이 아니다', () => {
    const low = finishWith(0).mails[0]!.body
    const high = finishWith(100).mails[0]!.body
    // 밴드는 고정(`PUBLISH_QUALITY`)이고 칸만 스탯이 정한다 — 그래서 밴드 양끝이 나온다.
    expect(low).toContain(`만족도 ${findQuality(PUBLISH_QUALITY).grades[0]}`)
    expect(high).toContain(
      `만족도 ${findQuality(PUBLISH_QUALITY).grades[findQuality(PUBLISH_QUALITY).grades.length - 1]}`,
    )
    expect(low).not.toEqual(high)
  })

  it('퍼블리싱 등급이 만족도에 들어간다 — 약한 고리를 깨지 않는다', () => {
    useGame.setState({ ...emptyState(), design: 100, publishing: 0 })
    const g = () => useGame.getState()
    const site = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'site')!
    g().acceptJob(site)
    // 앞의 두 공정은 **최고로** 만든다 — 그런데도 만족도가 퍼블리싱까지 내려가야 한다.
    useGame.setState({ ap: 9 })
    g().makeSlides(site.id, 'care')
    reply(site.id)
    useGame.setState({ ap: 9 })
    g().makeDraft(site.id, 'care')
    reply(site.id)
    useGame.setState({ ap: 9 })
    g().publishJob(site.id)
    reply(site.id)
    const worst = satisfaction([
      ...g().slides.map((f) => f.grade),
      ...g().drafts.map((f) => f.grade),
      ...g().publishes.map((f) => f.grade),
    ])!
    expect(g().publishes[0]!.grade).toBe(worst)
    expect(g().mails[0]!.body).toContain(`만족도 ${worst}`)
  })

  it('행동력이 모자라면 아무 일도 없다 — 등급도 안 남는다', () => {
    useGame.setState({ ...emptyState(), ap: 0 })
    const g = () => useGame.getState()
    g().acceptJob(fixReq)
    g().publishJob(fixReq.id)
    expect(g().publishes).toEqual([])
    expect(g().jobs[0]!.step).toBe(0)
  })
})

// 공정 → 회신 → 다음 공정의 고리. **업무를 끝내는 것은 회신 하나뿐이다.**
describe('공정과 회신', () => {
  const site = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'site')!
  const fix = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'fix')!

  it('사이트 업무는 화면정의서 → 시안 → 퍼블리싱 순으로만 진행된다', () => {
    const g = () => useGame.getState()
    g().acceptJob(site)

    // 앞 공정을 건너뛰려 해도 아무 일이 없다 — 창의 필터가 아니라 스토어가 막는다.
    g().makeDraft(site.id, 'light')
    g().publishJob(site.id)
    expect(g().drafts).toEqual([])
    expect(g().jobs[0]!.step).toBe(0)

    g().makeSlides(site.id, 'light')
    expect(g().jobs[0]!.step).toBe(1)
    // 회신하기 전에는 다음 공정도 막힌다.
    g().makeDraft(site.id, 'light')
    expect(g().drafts).toEqual([])

    reply(site.id)
    useGame.setState({ ap: 3 })
    g().makeDraft(site.id, 'light')
    reply(site.id)
    useGame.setState({ ap: 3 })
    g().publishJob(site.id)
    expect(g().jobs[0]!.done).toBe(false) // ⚠️ 만든 것으로는 끝나지 않는다
    reply(site.id)
    expect(g().jobs[0]!.done).toBe(true)
  })

  it('중간 회신에는 답장이, 완료 회신에는 만족도 메일이 온다', () => {
    const g = () => useGame.getState()
    g().acceptJob(site)
    g().makeSlides(site.id, 'light')
    reply(site.id)
    // 답장은 그 업무에 매인 글이라 `jobId`를 진다(그 글에서도 다음 회신을 보낼 수 있다).
    expect(g().mails[0]!.jobId).toBe(site.id)
    expect(g().mails[0]!.channel).toBe(site.channel)

    useGame.setState({ ap: 3 })
    g().makeDraft(site.id, 'light')
    reply(site.id)
    useGame.setState({ ap: 3 })
    g().publishJob(site.id)
    reply(site.id)
    // 만족도는 산출물 등급 중 가장 낮은 것이다(약한 고리) — 여기서는 전부 '간단하게'다.
    expect(g().mails[0]!.body).toContain('만족도')
  })

  // ⚠️ 남의 관리자 페이지에 올려 놓고 등록 공정을 통과하면, 화면은 진행됐다고 하는데
  //    그 업체 사이트에는 아무것도 안 걸린 상태가 된다.
  it('팝업 등록은 그 업무의 업체에 올려야 공정이 오른다', () => {
    const g = () => useGame.getState()
    const popupJob = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'popup')!
    g().acceptJob(popupJob)
    g().makePopup(popupJob.id, 'light')
    reply(popupJob.id)
    const fileId = g().files[0]!.id
    const step = g().jobs[0]!.step

    g().uploadPopup('hanbit', fileId, 2, 3) // 남의 업체
    expect(g().jobs[0]!.step).toBe(step)

    g().uploadPopup(popupJob.popup!.clientId, fileId, 2, 3)
    expect(g().jobs[0]!.step).toBe(step + 1)
  })

  // ⚠️ 회신하기 전에 올리면 팝업은 걸리는데 **공정은 오르지 않는다**(차례가 아니라서).
  //    관리자 페이지가 그 파일을 잠그는 이유가 이것이다 — 안 잠그면 같은 팝업을 두 번 건다.
  it('제작을 회신하기 전에는 등록해도 공정이 오르지 않는다', () => {
    const g = () => useGame.getState()
    const popupJob = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'popup')!
    g().acceptJob(popupJob)
    g().makePopup(popupJob.id, 'light')
    g().uploadPopup(popupJob.popup!.clientId, g().files[0]!.id, 2, 3)

    expect(g().popups).toHaveLength(1) // 사이트에는 실제로 걸린다
    expect(g().jobs[0]!.step).toBe(1) // 하지만 업무는 제자리다
  })

  it('회신은 행동력을 먹지 않는다', () => {
    const g = () => useGame.getState()
    g().acceptJob(fix)
    g().publishJob(fix.id)
    const before = g().ap
    reply(fix.id)
    expect(g().ap).toBe(before)
    expect(g().jobs[0]!.done).toBe(true)
  })
})

// 수정 요청이 온 회신은 **없던 일이 된다.** 대금이 걸린 불변식이라 규칙을 뒤집어 본다.
describe('수정 요청', () => {
  // ⚠️ `CLIENTS`에 없는 업체다 — 완료 회신에 버그 리포트가 딸려 오면 무엇을 재는
  //    테스트인지 흐려진다(버그 리포트는 `systems/followup.test.ts`가 본다).
  const from = '수정지옥상사'

  /** 이 자리에서 **반드시 수정 요청이 오는** 업무 id. 씨앗은 id·업체·회신 수뿐이라
   *  규칙 함수에 직접 물어 고르면 된다(확률을 우회하지 않는다). */
  const pick = (cs: number) => {
    for (let i = 0; i < 5000; i++) {
      const id = `rv${i}`
      if (needsRevision({ id, from, title: '수정건', kind: 'fix', step: 1, replied: 0 }, cs))
        return id
    }
    throw new Error('수정 요청이 오는 자리가 없다')
  }

  const setup = (id: string, over: Partial<{ revisions: number }> = {}) =>
    useGame.setState({
      jobs: [
        {
          id,
          from,
          title: '수정건',
          channel: 'board',
          kind: 'fix',
          step: 1,
          replied: 0,
          due: 9,
          done: false,
          ...over,
        },
      ],
    })

  it('수정 요청이 온 회신에서는 돈도 평판도 움직이지 않는다 — 안 오면 대금이 들어온다', () => {
    const g = () => useGame.getState()
    const id = pick(g().cs)
    const money = g().money
    const rep = g().reputation
    setup(id)
    g().replyJob(id)

    // ① 수정 요청이 온 쪽 — 회신이 통째로 무른다.
    expect(g().money).toBe(money)
    expect(g().revenue).toBe(0)
    expect(g().reputation).toBe(rep)
    expect(g().jobs[0]!.done).toBe(false)
    expect(g().jobs[0]!.replied).toBe(0)
    expect(g().jobs[0]!.revisions).toBe(1)
    // 다시 만들 시간은 준다 — 안 주면 임박한 업무가 수정 요청 한 통에 즉사한다.
    expect(g().jobs[0]!.due).toBe(9 + REVISION_DUE_EXTRA)
    expect(g().mails[0]!.jobId).toBe(id)
    expect(g().mails[0]!.body).not.toContain('대금')

    // ② 규칙을 뒤집는다 — 수정 요청이 **안 오면** 같은 회신이 대금을 낸다.
    //    둘 다 봐야 "안 준다"가 버그가 아니라 규칙임이 증명된다.
    setup(id, { revisions: REVISION_MAX })
    g().replyJob(id)
    expect(g().jobs[0]!.done).toBe(true)
    expect(g().money).toBe(money + BASE_FEE.fix)
    expect(g().revenue).toBe(BASE_FEE.fix)
    expect(g().mails[0]!.body).toContain('대금')
  })

  it('수정 요청을 받으면 같은 공정이 다시 열린다', () => {
    const g = () => useGame.getState()
    const id = pick(g().cs)
    setup(id)
    const before = openStep(asStep({ ...g().jobs[0]!, step: 0, replied: 0 }))
    g().replyJob(id)

    expect(g().jobs[0]!.step).toBe(0)
    // 회신 전 상태의 공정과 **같은 칸**이 다시 열린다 — 그것이 "다시 만들어 오세요"다.
    expect(openStep(asStep(g().jobs[0]!))).toEqual(before)
  })
})

// 돈·주차·정산을 만드는 불변식이라 **규칙을 뒤집어** 확인한다(CLAUDE.md의 검증 규칙).
describe('대금·파기·정산', () => {
  const fix = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'fix')!

  it('완료 회신이 대금을 넣고 평판을 움직인다', () => {
    const g = () => useGame.getState()
    const money = g().money
    const rep = g().reputation
    g().acceptJob(fix)
    g().publishJob(fix.id)
    reply(fix.id)

    // 퍼블리싱만 있는 업무는 등급이 없어 기준선(C)이다 — 대금은 정가, 평판은 그대로.
    expect(g().money).toBe(money + BASE_FEE.fix)
    expect(g().reputation).toBe(rep)
    expect(g().mails[0]!.body).toContain('대금')
    // ⚠️ 누적 매출도 **같은 자리에서** 는다(회사레벨이 여기서 파생한다).
    expect(g().revenue).toBe(BASE_FEE.fix)
  })

  it('공들인 만큼 더 받는다 — 등급이 대금을 정한다', () => {
    const g = () => useGame.getState()
    const ppt = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'ppt')!
    const money = g().money
    g().acceptJob(ppt)
    g().makeSlides(ppt.id, 'care') // 행동력 3 — 등급 S대
    reply(ppt.id)
    const grade = g().slides[0]!.grade
    expect(g().money).toBe(money + Math.round(BASE_FEE.ppt * GRADE_REWARD[grade].fee))
    expect(g().money).toBeGreaterThan(money + BASE_FEE.ppt)
  })

  // ⚠️ 만들어 놓고 **보내지 않은** 것은 지킨 것이 아니다 — 납품은 보내는 일이다.
  it('마감을 넘기면 대금 0에 평판이 깎인다 — 회신 안 한 완성품도 깨진다', () => {
    const g = () => useGame.getState()
    g().acceptJob(fix)
    g().publishJob(fix.id) // 만들었지만 회신하지 않는다
    const money = g().money
    const rep = g().reputation

    // ⚠️ 월말(4의 배수)에 걸리지 않는 주로 민다 — 정산까지 겹치면 무엇이 돈을 움직였는지 흐려진다.
    useGame.setState({ week: g().jobs[0]!.due + 1 })
    g().advanceWeek()

    const job = g().jobs[0]!
    expect({ done: job.done, breached: job.breached }).toEqual({ done: true, breached: true })
    expect(g().money).toBe(money)
    expect(g().reputation).toBe(rep - BREACH_REPUTATION_LOSS)
    expect(g().mails.some((m) => m.id === `breach:${fix.id}`)).toBe(true)
  })

  it('월말에 고정 지출이 빠지고 정산 메일이 온다', () => {
    const g = () => useGame.getState()
    const money = g().money
    useGame.setState({ week: WEEKS_PER_MONTH - 1 })
    g().advanceWeek() // 4주차 = 월말

    expect(g().money).toBe(money - monthlyCost())
    expect(g().mails[0]!.subject).toContain('월말 정산')

    // 월말이 아닌 주에는 빠지지 않는다(규칙을 뒤집어 확인).
    const after = g().money
    g().advanceWeek()
    expect(g().money).toBe(after)
  })

  // ⚠️ 사과가 클레임을 **완전히 지우면** 팝업을 어긋나게 걸고 사과만 하는 것이 최적이 된다.
  //    평판을 만드는 불변식이라 뒤집어서도 확인한다.
  it('사과는 깎인 것보다 적게 돌려주고, 한 클레임에 한 번뿐이다', () => {
    const g = () => useGame.getState()
    const popupJob = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'popup')!
    g().acceptJob(popupJob)
    g().advanceWeek() // 기간인데 안 걸려 있으니 클레임이 온다

    const claim = g().mails.find((m) => m.claim)!
    const rep = g().reputation
    const ap = g().ap
    g().apologize(claim.id)

    const gain = csRecover(INITIAL_GAME.cs)
    expect(gain).toBeLessThan(CLAIM_REPUTATION_LOSS)
    expect(g().reputation).toBe(rep + gain)
    expect(g().ap).toBe(ap - CS_REPLY_AP)

    // 두 번째는 아무 일도 없다 — 행동력으로 평판을 살 수 없다.
    g().apologize(claim.id)
    expect(g().reputation).toBe(rep + gain)
  })

  // 돈이 **들어오는** 유일한 고정 수입이라 정산 불변식으로 확인한다.
  it('유지보수 계약은 매달 들어오고, 조건을 못 채우면 맺어지지 않는다', () => {
    const g = () => useGame.getState()
    // 조건 미달이면 아무 일도 없다(버튼 disabled만으로는 경로가 남는다).
    g().signContract('dalbit')
    expect(g().contracts).toEqual([])

    // 그 업체 일을 `MAINTENANCE_MIN_DONE`건 끝내면 맺어진다.
    useGame.setState({
      jobs: Array.from({ length: MAINTENANCE_MIN_DONE }, (_, i) => ({
        id: `j${i}`,
        from: '달빛공방',
        title: 't',
        channel: 'mail' as const,
        kind: 'fix' as const,
        step: 1,
        replied: 1,
        due: 9,
        done: true,
      })),
    })
    g().signContract('dalbit')
    expect(g().contracts).toEqual(['dalbit'])

    const money = g().money
    useGame.setState({ week: WEEKS_PER_MONTH - 1 })
    g().advanceWeek() // 월말
    expect(g().money).toBe(money + MAINTENANCE_FEE - monthlyCost())
    expect(g().mails[0]!.body).toContain('유지보수 수입')
  })

  it('평판은 0~100 밖으로 나가지 않는다', () => {
    const g = () => useGame.getState()
    g().acceptJob(fix)
    useGame.setState({ reputation: 2, week: g().jobs[0]!.due })
    g().advanceWeek()
    expect(g().reputation).toBe(0)
  })
})

describe('팝업 제작·등록', () => {
  const popupJob = MESSAGES.find((m): m is Request => !m.ad && m.popup !== undefined)!

  beforeEach(() => {
    useGame.getState().acceptJob(popupJob)
  })

  // 수주 시점에 굳지 않으면 주가 지나도 늘 같은 주를 가리켜 판정이 뜻을 잃는다(마감과 같은 이유).
  it('요청 기간은 수주한 주에 굳는다', () => {
    useGame.setState({ jobs: [], week: 5 })
    useGame.getState().acceptJob(popupJob)
    expect(useGame.getState().jobs[0]!.popup).toEqual({
      clientId: popupJob.popup!.clientId,
      from: 5 + popupJob.popup!.fromWeeks,
      to: 5 + popupJob.popup!.toWeeks,
    })
  })

  // 제작이 비용을 진다. ⚠️ 이 값이 등록 쪽으로 옮겨 가면 한 팝업에 두 번 값을 물린다.
  it('제작은 행동력을 쓴다', () => {
    const before = useGame.getState().ap
    useGame.getState().makePopup(popupJob.id, 'light')
    expect(useGame.getState().ap).toBe(before - findQuality('light').ap)
    expect(useGame.getState().files).toHaveLength(1)
  })

  // 퀄리티가 비용과 등급을 **함께** 정한다 — 한쪽만 따라가면 "비싼데 결과가 같다"가 된다.
  it('공들일수록 행동력을 더 쓰고 등급이 올라간다', () => {
    useGame.setState({ ap: 3, files: [] })
    useGame.getState().makePopup(popupJob.id, 'care')
    const [file] = useGame.getState().files
    expect(useGame.getState().ap).toBe(3 - findQuality('care').ap)
    expect(findQuality('care').grades).toContain(file!.grade)
  })

  // 규칙을 뒤집어 본다: 행동력이 없으면 파일도 생기지 않아야 한다(음수 행동력 금지).
  it('행동력이 모자라면 만들어지지 않는다', () => {
    useGame.setState({ ap: 0 })
    useGame.getState().makePopup(popupJob.id, 'light')
    expect(useGame.getState().files).toEqual([])
    expect(useGame.getState().ap).toBe(0)
  })

  // ⚠️ 등록은 **값을 물리지 않는다.** 여기에 비용이 되살아나면 제작과 합쳐 두 번 문다.
  it('등록은 행동력을 먹지 않는다 — 0이어도 등록된다', () => {
    useGame.getState().makePopup(popupJob.id, 'light')
    const fileId = useGame.getState().files[0]!.id
    useGame.setState({ ap: 0 })
    useGame.getState().uploadPopup('dalbit', fileId, 2, 3)
    const s = useGame.getState()
    expect(s.ap).toBe(0)
    expect(s.popups).toHaveLength(1)
    expect(s.popups[0]).toMatchObject({ clientId: 'dalbit', fileId, from: 2, to: 3 })
  })

  it('게시 기간은 나중에 고칠 수 있다', () => {
    useGame.getState().makePopup(popupJob.id, 'light')
    useGame.getState().uploadPopup('dalbit', useGame.getState().files[0]!.id, 2, 3)
    const id = useGame.getState().popups[0]!.id
    useGame.getState().updatePopupPeriod(id, 4, 9)
    expect(useGame.getState().popups[0]).toMatchObject({ from: 4, to: 9 })
  })
})

describe('주차 진행', () => {
  const popupJob = MESSAGES.find((m): m is Request => !m.ad && m.popup !== undefined)!

  it('행동력을 apMax로 회복시킨다 — 이월 없음', () => {
    useGame.setState({ ap: 0, apMax: 3 })
    useGame.getState().advanceWeek()
    expect(useGame.getState().ap).toBe(3)

    // 남은 행동력을 넘기면 모았다 한 주에 쏟는 것이 최적이 된다.
    useGame.setState({ ap: 3, apMax: 3 })
    useGame.getState().advanceWeek()
    expect(useGame.getState().ap).toBe(3)
  })

  // 규칙을 뒤집어 확인한다: **맞게 걸어 두면 아무 일도 일어나지 않아야 한다.**
  it('기간이 맞으면 클레임도 평판 하락도 없다', () => {
    useGame.getState().acceptJob(popupJob)
    useGame.getState().makePopup(popupJob.id, 'light')
    const job = useGame.getState().jobs[0]!
    useGame
      .getState()
      .uploadPopup(job.popup!.clientId, useGame.getState().files[0]!.id, job.popup!.from, job.popup!.to)

    const rep = useGame.getState().reputation
    useGame.getState().advanceWeek()
    expect(useGame.getState().mails).toEqual([])
    expect(useGame.getState().reputation).toBe(rep)
  })

  it('요청 기간인데 안 걸려 있으면 클레임 메일이 오고 평판이 깎인다', () => {
    useGame.getState().acceptJob(popupJob)
    const rep = useGame.getState().reputation
    useGame.getState().advanceWeek()

    const s = useGame.getState()
    expect(s.mails).toHaveLength(1)
    expect(s.mails[0]!.channel).toBe('mail')
    // ⚠️ 클레임은 `ad` 갈래여야 한다 — 아니면 항의에 견적보내기가 붙는다.
    expect(s.mails[0]!.ad).toBe(true)
    expect(s.reputation).toBe(rep - CLAIM_REPUTATION_LOSS)
  })

  // 평판이 바닥에 닿아도 음수로 가지 않는다 — 음수 평판에는 뜻이 없고 위기 판정만 흐려진다.
  it('평판은 0 밑으로 내려가지 않는다', () => {
    useGame.getState().acceptJob(popupJob)
    useGame.setState({ reputation: 1 })
    useGame.getState().advanceWeek()
    expect(useGame.getState().reputation).toBe(0)
  })

  // 같은 업체가 다음 주에 또 항의하면 **다른 글**이어야 뱃지가 다시 선다.
  it('다음 주의 클레임은 다른 글이다', () => {
    useGame.getState().acceptJob(popupJob)
    useGame.getState().advanceWeek()
    useGame.getState().advanceWeek()
    const ids = useGame.getState().mails.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})


/** 클라이언트 미팅. ⚠️ 여기서 지키는 것은 **행동력이 음수로 새지 않는다**와
 *  **정답을 저장하지 않는다** 둘이다 — 화면의 disabled만으로는 음수 경로가 남는다. */
describe('클라이언트 미팅', () => {
  const site = MESSAGES.find((m) => !m.ad && m.kind === 'site') as Request

  it('행동력 1을 물고 기획력만큼 알아낸다', () => {
    useGame.getState().acceptJob(site)
    const ap = useGame.getState().ap
    useGame.getState().holdMeeting(site.id)
    const s = useGame.getState()
    expect(s.ap).toBe(ap - MEETING_AP)
    expect(s.meetings[site.id]).toEqual(revealedKeywords(site.id, INITIAL_GAME.planning))
  })

  // 뒤집기: 막지 않으면 행동력이 음수로 넘어가 다음 주까지 빚이 이어진다.
  it('행동력이 0이면 미팅이 열리지 않는다', () => {
    useGame.getState().acceptJob(site)
    useGame.setState({ ap: 0 })
    useGame.getState().holdMeeting(site.id)
    const s = useGame.getState()
    expect(s.ap).toBe(0)
    expect(s.meetings[site.id]).toBeUndefined()
  })

  // 뒤집기: 두 번 열리면 행동력만 내고 5개를 다 알 수 있어 기획력 스탯이 뜻을 잃는다.
  it('업무당 한 번뿐이다', () => {
    useGame.getState().acceptJob(site)
    useGame.getState().holdMeeting(site.id)
    const ap = useGame.getState().ap
    useGame.getState().holdMeeting(site.id)
    expect(useGame.getState().ap).toBe(ap)
  })

  it('직원을 보내면 내 행동력은 안 들고 그 직원의 기획력이 개수를 정한다', () => {
    useGame.getState().acceptJob(site)
    useGame.setState({
      employees: [
        {
          id: 'e1',
          name: '보낼사람',
          role: 'designer',
          level: 2,
          // ⚠️ 내 기획력과 **다른 값**이라야 "누가 갔는가"가 결과를 갈랐음이 증명된다.
          stats: { design: 50, publishing: 50, planning: 90, cs: 50 },
          hiredWeek: 1,
        },
      ],
    })
    const ap = useGame.getState().ap
    useGame.getState().holdMeeting(site.id, 'e1')
    const s = useGame.getState()
    expect(s.ap).toBe(ap)
    expect(s.meetings[site.id]).toEqual(revealedKeywords(site.id, 90))
    // 대가는 그 직원의 한 주다 — 잡히지 않으면 직원만 있으면 미팅이 공짜가 된다.
    expect(s.trainings).toHaveLength(1)
    expect(s.trainings[0]?.kind).toBe('meeting')
  })

  // 뒤집기: 미팅 점유를 교육과 구별하지 않으면 다녀온 사람이 레벨까지 오른다.
  it('미팅에 다녀와도 레벨은 오르지 않는다', () => {
    useGame.getState().acceptJob(site)
    useGame.setState({
      employees: [
        {
          id: 'e1',
          name: '보낼사람',
          role: 'designer',
          level: 2,
          stats: { design: 50, publishing: 50, planning: 40, cs: 50 },
          hiredWeek: 1,
        },
      ],
    })
    useGame.getState().holdMeeting(site.id, 'e1')
    useGame.getState().advanceWeek()
    const s = useGame.getState()
    expect(s.employees[0]?.level).toBe(2)
    expect(s.employees[0]?.stats.design).toBe(50)
    expect(s.trainings).toHaveLength(0)
  })

  it('잡혀 있는 직원은 미팅에 못 간다', () => {
    useGame.getState().acceptJob(site)
    useGame.setState({
      employees: [
        {
          id: 'e1',
          name: '바쁜사람',
          role: 'designer',
          level: 2,
          stats: { design: 50, publishing: 50, planning: 90, cs: 50 },
          hiredWeek: 1,
        },
      ],
      trainings: [{ employeeId: 'e1', from: 1, doneWeek: 5, kind: 'train' }],
    })
    useGame.getState().holdMeeting(site.id, 'e1')
    expect(useGame.getState().meetings[site.id]).toBeUndefined()
  })

  it('사이트 업무를 수주하면 미팅 알림이 그 채널로 온다', () => {
    useGame.getState().acceptJob(site)
    const mail = useGame.getState().mails.find((m) => m.jobId === site.id)
    expect(mail?.channel).toBe(site.channel)
  })
})

/** 시안 등급이 키워드로 움직이는 것이 **대금·평판을 만드는 불변식**이다
 *  (등급 → `GRADE_REWARD` → 대금·평판). 규칙을 뒤집어 확인한다. */
describe('키워드가 시안 등급을 민다', () => {
  const site = MESSAGES.find((m) => !m.ad && m.kind === 'site') as Request

  /** 화면정의서를 만들고 회신해 **시안 차례**까지 민다(사이트의 둘째 공정). */
  const toDraftStep = () => {
    useGame.getState().acceptJob(site)
    useGame.getState().makeSlides(site.id, 'light')
    reply(site.id)
    useGame.setState({ ap: INITIAL_GAME.apMax })
  }

  it('다 맞히면 오르고, 다 틀리면 안 오른다', () => {
    const answer = clientKeywords(site.id)
    const wrong = KEYWORDS.map((k) => k.id).filter((k) => !answer.includes(k)).slice(0, SITE_KEYWORDS)

    toDraftStep()
    useGame.getState().makeDraft(site.id, 'light', answer)
    const hit = useGame.getState().drafts.at(-1)!.grade

    useGame.setState({ jobs: [], drafts: [], slides: [], publishes: [], mails: [], meetings: {} })
    toDraftStep()
    useGame.getState().makeDraft(site.id, 'light', wrong)
    const miss = useGame.getState().drafts.at(-1)!.grade

    expect(GRADE_LADDER.indexOf(hit)).toBeGreaterThan(GRADE_LADDER.indexOf(miss))
  })

  // ⚠️ 정답이 세이브에 들어가면 두 번째 출처가 생기고 세이브를 뜯어 답을 볼 수 있다.
  it('정답 5개는 스토어에 저장되지 않는다 — 아는 것만 남는다', () => {
    useGame.getState().acceptJob(site)
    useGame.getState().holdMeeting(site.id)
    expect(useGame.getState().meetings[site.id]!.length).toBeLessThan(SITE_KEYWORDS)
  })
})


// ── 직원 요청사항 ────────────────────────────────────────────────────────
// ⚠️ 이 게임의 불변식은 **확률·돈·퇴사**다. 규칙을 뒤집어 확인한다.
describe('직원 요청사항', () => {
  const worker: Employee = {
    id: 'e1',
    name: '김지훈',
    role: 'designer',
    level: 2,
    stats: { design: 50, publishing: 40, planning: 30, cs: 30 },
    hiredWeek: 1,
  }

  const ask = (
    kind: EmployeeRequest['kind'],
    over: Partial<EmployeeRequest> = {},
  ): EmployeeRequest => ({
    id: 'req:1:e1',
    employeeId: worker.id,
    kind,
    week: 1,
    expires: 1 + REQUEST_EXPIRE_WEEKS,
    ...over,
  })

  const seed = (over: Record<string, unknown> = {}) =>
    useGame.setState({
      employees: [worker],
      orders: [],
      trainings: [],
      chats: [],
      requests: [],
      ...over,
    })

  it('급여협상을 받으면 월급이 오르고, **레벨업 인상과 겹쳐도 어긋나지 않는다**', () => {
    seed({ requests: [ask('raise')] })
    const before = monthlyCost(useGame.getState().employees)
    useGame.getState().acceptRequest('req:1:e1')

    const raised = useGame.getState().employees[0]!
    expect(monthlyCost([raised])).toBe(before + RAISE_AMOUNT)
    // ⚠️ 여기가 핵심이다: 월급을 통째로 굳혔다면 레벨이 올라도 값이 그대로였을 것이다.
    //    가산 칸만 두었으므로 두 인상이 **함께** 산다.
    const grown = trained(raised)
    // ⚠️ 레벨분 인상이 **가산 위에 그대로 더 붙는다**(둘이 서로를 지우지 않는다).
    expect(monthlyCost([grown]) - monthlyCost([raised])).toBe(
      salaryOf(worker.level + 1) - salaryOf(worker.level),
    )
    expect(monthlyCost([grown]) - before).toBe(
      RAISE_AMOUNT + salaryOf(worker.level + 1) - salaryOf(worker.level),
    )
  })

  it('휴가를 받으면 그 기간 잡히고 **지시를 못 받는다**', () => {
    seed({ requests: [ask('leave')] })
    useGame.getState().acceptRequest('req:1:e1')

    const s = useGame.getState()
    // ⚠️ 점유는 새 목록이 아니라 `trainings`(kind: 'leave')가 진다.
    expect(s.trainings).toHaveLength(1)
    expect(s.trainings[0]!.kind).toBe('leave')
    expect(isBusy(worker.id, s.orders, s.trainings)).toBe(true)
    expect(canOrder(worker, 'figma', s.orders, s.trainings)).toBe(false)

    // 가드가 **스토어에도** 있다 — 버튼 disabled만으로는 경로가 남는다.
    const job = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'popup')!
    useGame.getState().acceptJob(job)
    const ap = useGame.getState().ap
    useGame.getState().orderJob(worker.id, job.id)
    expect(useGame.getState().orders).toHaveLength(0)
    expect(useGame.getState().ap).toBe(ap)
  })

  it('휴가가 끝나도 **레벨은 오르지 않는다** — 쉬다 온 것이 교육이 되면 안 된다', () => {
    seed({ requests: [ask('leave')] })
    useGame.getState().acceptRequest('req:1:e1')
    for (let i = 0; i < LEAVE_WEEKS + 1; i++) useGame.getState().advanceWeek()

    const s = useGame.getState()
    expect(s.employees[0]!.level).toBe(worker.level)
    expect(s.employees[0]!.stats.design).toBe(worker.stats.design)
    expect(isBusy(worker.id, s.orders, s.trainings)).toBe(false)
  })

  it('피드백은 **행동력을 실제로 물고** 등급을 한 칸만 올린다', () => {
    const file = { id: 'f1', jobId: 'j1', name: '팝업.png', madeWeek: 1, grade: 'C' as const }
    const req = ask('feedback', { target: { fileId: 'f1', name: '팝업.png', grade: 'C' } })
    seed({ requests: [req], files: [file], ap: 3 })
    useGame.getState().acceptRequest(req.id)

    const s = useGame.getState()
    expect(s.ap).toBe(3 - FEEDBACK_AP)
    // 성패는 요청 id가 씨앗이다 — 어느 쪽이든 **한 칸 이내**여야 한다.
    const moved = GRADE_LADDER.indexOf(s.files[0]!.grade) - GRADE_LADDER.indexOf('C')
    expect(moved === 0 || moved === 1).toBe(true)
    expect(s.requests).toHaveLength(0)
  })

  it('행동력이 없으면 피드백은 **아무 일도 일어나지 않고 요청도 남는다**', () => {
    const file = { id: 'f1', jobId: 'j1', name: '팝업.png', madeWeek: 1, grade: 'C' as const }
    const req = ask('feedback', { target: { fileId: 'f1', name: '팝업.png', grade: 'C' } })
    seed({ requests: [req], files: [file], ap: 0 })
    useGame.getState().acceptRequest(req.id)

    const s = useGame.getState()
    expect(s.ap).toBe(0)
    expect(s.files[0]!.grade).toBe('C')
    // ⚠️ 낼 것이 없다고 요청을 지우면 답할 기회가 사라진다(그건 무시가 아니라 사고다).
    expect(s.requests).toHaveLength(1)
  })

  it('피드백은 **사다리 밖(SSS 위)으로 나가지 않는다**', () => {
    const file = { id: 'f1', jobId: 'j1', name: '최고.png', madeWeek: 1, grade: 'SSS' as const }
    const req = ask('feedback', { target: { fileId: 'f1', name: '최고.png', grade: 'SSS' } })
    seed({ requests: [req], files: [file], ap: 3 })
    useGame.getState().acceptRequest(req.id)
    expect(useGame.getState().files[0]!.grade).toBe('SSS')
  })

  it('교육요청은 교육비를 물고, 끝나면 **평소보다 덜 오르지는 않는다**', () => {
    seed({ requests: [ask('training')], money: TRAIN_COST * 2 })
    useGame.getState().acceptRequest('req:1:e1')
    expect(useGame.getState().money).toBe(TRAIN_COST)

    for (let i = 0; i < TRAIN_WEEKS + 1; i++) useGame.getState().advanceWeek()
    const grown = useGame.getState().employees[0]!
    expect(grown.level).toBe(worker.level + 1)
    // 실패해도 평소 효과는 얻는다(0이면 늘 거절이 정답이 된다).
    expect(grown.stats.design).toBeGreaterThanOrEqual(worker.stats.design + TRAIN_STAT_GAIN)
  })

  it('교육비가 모자라면 아무 일도 일어나지 않는다 — 소지금이 음수로 안 간다', () => {
    seed({ requests: [ask('training')], money: TRAIN_COST - 1 })
    useGame.getState().acceptRequest('req:1:e1')
    const s = useGame.getState()
    expect(s.money).toBe(TRAIN_COST - 1)
    expect(s.trainings).toHaveLength(0)
    expect(s.requests).toHaveLength(1)
  })

  it('거절이 쌓이면 **실제로 퇴사한다** — 임계 아래면 안 나간다', () => {
    seed({})
    for (let i = 0; i < GRUDGE_QUIT; i++) {
      useGame.setState({ requests: [ask('raise', { id: `req:${i}:e1`, expires: 999 })] })
      useGame.getState().refuseRequest(`req:${i}:e1`)
      expect(useGame.getState().employees[0]!.grudge).toBe(i + 1)
      if (i < GRUDGE_QUIT - 1) {
        // 임계 아래에서는 주차를 넘겨도 **안 나간다**.
        useGame.getState().advanceWeek()
        expect(useGame.getState().employees).toHaveLength(1)
      }
    }
    // 임계에 닿았다 — 다음 주차 넘김에서 나간다.
    useGame.getState().advanceWeek()
    expect(useGame.getState().employees).toHaveLength(0)
  })

  it('불만 퇴사는 **위기 퇴사와 다른 메일**로 온다 — 무엇을 고칠지가 갈려야 한다', () => {
    seed({ mails: [], reputation: 50 })
    for (let i = 0; i < GRUDGE_QUIT; i++) {
      useGame.setState({ requests: [ask('raise', { id: `req:${i}:e1`, expires: 999 })] })
      useGame.getState().refuseRequest(`req:${i}:e1`)
    }
    useGame.getState().advanceWeek()

    const mail = useGame.getState().mails.find((m) => m.id.startsWith('grudge:'))
    expect(mail).toBeDefined()
    // 위기 퇴사 메일(`quit:`)이 아니어야 한다 — 평판은 멀쩡하다.
    expect(useGame.getState().mails.some((m) => m.id.startsWith('quit:'))).toBe(false)
    expect(mail!.subject).not.toBe(quitMail(worker, 1).subject)
  })

  it('답하지 않고 기한을 넘기면 **거절과 같은 값**을 문다 — 무시가 싼 길이 아니다', () => {
    seed({ requests: [ask('raise')] })
    for (let i = 0; i <= REQUEST_EXPIRE_WEEKS; i++) useGame.getState().advanceWeek()
    const s = useGame.getState()
    expect(s.employees[0]!.grudge).toBe(GRUDGE_PER_REFUSAL)
    expect(s.requests.some((q) => q.id === 'req:1:e1')).toBe(false)
  })

  it('받아들이면 불만이 쌓이지 않는다 — 그것이 받는 값의 전부다', () => {
    seed({ requests: [ask('raise')] })
    useGame.getState().acceptRequest('req:1:e1')
    expect(useGame.getState().employees[0]!.grudge ?? 0).toBe(0)
  })

  // ⚠️ 새 상태 축은 `saveFields`에 넣어야 세이브에 들어간다 — 빠뜨리면 그 축만 조용히 안 남는다.
  it('세이브 대상에 들어 있다', () => {
    seed({ requests: [ask('leave')] })
    expect(makeSlot(useGame.getState(), 0).data).toHaveProperty('requests')
  })
})

/** 게임 오버. ⚠️ 여기서 지키는 것은 **끝난 판이 계속 굴러가지 않는다**이다 —
 *  판정만 있고 멈추지 않으면 결과 화면 뒤에서 주차가 흘러 기록이 어긋난다. */
describe('게임 오버 (스토어)', () => {
  // ⚠️ 한 달 마이너스는 파산이 아니다 — 착수금·대출로 버틸 수 있는 구간이다(설계 확정).
  it('급여가 밀려도 한 달로는 파산하지 않는다', () => {
    useGame.setState({
      week: WEEKS_PER_MONTH - 1,
      money: 1_000,
      employees: [
        {
          id: 'e1',
          name: '급여받을사람',
          role: 'designer',
          level: 1,
          stats: { design: 50, publishing: 50, planning: 50, cs: 50 },
          hiredWeek: 1,
        },
      ],
      unpaidMonths: 0,
    })
    useGame.getState().advanceWeek()
    const s = useGame.getState()
    expect(s.money).toBeLessThan(0)
    expect(s.unpaidMonths).toBe(1)
    expect(s.over).toBeUndefined()
  })

  it('급여가 정해진 달만큼 연속으로 밀리면 파산한다', () => {
    useGame.setState({
      week: WEEKS_PER_MONTH - 1,
      money: 1_000,
      employees: [
        {
          id: 'e1',
          name: '급여받을사람',
          role: 'designer',
          level: 1,
          stats: { design: 50, publishing: 50, planning: 50, cs: 50 },
          hiredWeek: 1,
        },
      ],
      unpaidMonths: UNPAID_MONTHS_TO_BANKRUPT - 1,
    })
    useGame.getState().advanceWeek()
    expect(useGame.getState().over?.kind).toBe('bankrupt')
  })

  // 뒤집기: 리셋이 없으면 오래 굴린 회사가 한 번 밀린 것만으로도 결국 파산한다.
  it('급여를 다 주면 밀린 달이 0으로 리셋된다', () => {
    useGame.setState({
      week: WEEKS_PER_MONTH - 1,
      money: 10_000_000,
      employees: [],
      unpaidMonths: UNPAID_MONTHS_TO_BANKRUPT - 1,
    })
    useGame.getState().advanceWeek()
    const s = useGame.getState()
    expect(s.unpaidMonths).toBe(0)
    expect(s.over).toBeUndefined()
  })

  it('위기가 이어지면 폐업한다', () => {
    useGame.setState({
      week: 1,
      reputation: 0,
      crisisWeeks: CRISIS_WEEKS_TO_SHUTDOWN - 1,
      // ⚠️ 파산이 먼저 걸리지 않게 잔고를 넉넉히 둔다 — 이 테스트가 보려는 것은 폐업이다.
      money: 10_000_000,
      employees: [],
      jobs: [],
    })
    useGame.getState().advanceWeek()
    expect(useGame.getState().over?.kind).toBe('shutdown')
  })

  // 뒤집기: 막지 않으면 결과 화면 뒤에서 주차가 계속 흘러 "몇 주 버텼는가"가 거짓이 된다.
  it('끝난 판은 더 나아가지 않는다', () => {
    useGame.setState({
      week: 1,
      reputation: 0,
      crisisWeeks: CRISIS_WEEKS_TO_SHUTDOWN - 1,
      money: 10_000_000,
      employees: [],
      jobs: [],
    })
    useGame.getState().advanceWeek()
    const at = useGame.getState().week
    useGame.getState().advanceWeek()
    useGame.getState().advanceWeek()
    expect(useGame.getState().week).toBe(at)
  })

  it('새 게임을 하면 끝난 상태가 풀린다', () => {
    useGame.setState({
      week: 1,
      reputation: 0,
      crisisWeeks: CRISIS_WEEKS_TO_SHUTDOWN - 1,
      money: 10_000_000,
      employees: [],
      jobs: [],
    })
    useGame.getState().advanceWeek()
    expect(useGame.getState().over).toBeDefined()
    useGame.getState().newGame()
    expect(useGame.getState().over).toBeUndefined()
  })
})

/** 회사레벨. ⚠️ 여기서 지키는 것은 **누적 매출이 줄지 않는다**와 **레벨업이 그 주의
 *  행동력을 채우지 않는다** 둘이다 — 둘 다 깨지면 최적 전략이 게임을 망가뜨린다. */
describe('회사레벨', () => {
  const level2 = COMPANY_LEVELS[1]!

  it('누적 매출이 선을 넘으면 행동력 상한이 오른다', () => {
    expect(companyLevel(0).apMax).toBe(INITIAL_GAME.apMax)
    expect(companyLevel(level2.minRevenue).level).toBe(level2.level)
    expect(companyLevel(level2.minRevenue).apMax).toBeGreaterThan(INITIAL_GAME.apMax)
  })

  // 뒤집기: 소지금으로 재면 월정액·급여를 내는 순간 레벨이 내려가고,
  //        돈을 안 쓰고 모으기만 하는 것이 최적이 된다.
  it('돈을 써도 누적 매출은 줄지 않는다', () => {
    useGame.setState({ revenue: level2.minRevenue, money: 10, apMax: level2.apMax })
    // 월말 정산으로 잔고가 크게 줄어도 레벨은 그대로다.
    useGame.setState({ week: WEEKS_PER_MONTH - 1 })
    useGame.getState().advanceWeek()
    const s = useGame.getState()
    expect(s.revenue).toBe(level2.minRevenue)
    expect(companyLevel(s.revenue).apMax).toBe(level2.apMax)
  })

  // 뒤집기: 레벨업이 그 자리에서 ap를 채우면 회신을 미뤘다가 몰아 쓰는 것이 최적이 된다.
  it('레벨이 올라도 이번 주의 남은 행동력은 그대로다', () => {
    useGame.setState({ revenue: 0, apMax: INITIAL_GAME.apMax, ap: 0 })
    const before = useGame.getState().ap
    // 대금이 들어오는 자리를 직접 흉내 낸다(완료 회신은 공정을 다 거쳐야 해서 길다).
    useGame.setState({ revenue: level2.minRevenue, apMax: level2.apMax })
    expect(useGame.getState().ap).toBe(before)
  })
})

// ── 주말 돌발 이벤트 + 정신력 ──────────────────────────────────────
// 정신력 → 행동력과 주차 진행은 이 게임의 불변식이라 규칙을 뒤집어 확인한다.
describe('주말 근무와 정신력', () => {
  /** 돌발 의뢰가 실제로 뜨는 주차. */
  const eventWeek = (() => {
    for (let w = 1; w <= 60; w++) if (weekendEvent(w)) return w
    throw new Error('60주 안에 주말 이벤트가 없다')
  })()

  it('주말에 일하면 정신력이 줄고 그 의뢰가 평소 업무로 선다', () => {
    useGame.setState({ week: eventWeek })
    const before = useGame.getState().mental
    useGame.getState().workWeekend()
    const s = useGame.getState()
    expect(s.mental).toBe(before - WEEKEND_MENTAL_COST)
    // ⚠️ **새 업무 축이 아니다** — `jobs`에 평범한 한 줄이 서고 공정의 줄을 그대로 탄다.
    const job = s.jobs.find((j) => j.id === `we:${eventWeek}`)!
    expect(job).toBeDefined()
    expect(job.step).toBe(0)
    expect(job.replied).toBe(0)
    expect(job.due).toBe(eventWeek + WEEKEND_DUE_WEEKS)
    expect(openStep(asStep(job))).toEqual(stepsOf(job.kind)[0])
  })

  // 뒤집기: 안 고르는 것도 선택이다. 강제로 소모시키면 "주말은 선택"이 거짓이 된다.
  it('주말에 안 일하면 아무 일도 일어나지 않는다', () => {
    useGame.setState({ week: eventWeek })
    const before = useGame.getState()
    expect(before.mental).toBe(INITIAL_GAME.mental)
    expect(before.jobs).toEqual([])
    expect(before.weekendWorked).toEqual([])
  })

  it('한 주말에 두 번 일할 수 없다 — 정신력을 두 번 물지 않는다', () => {
    useGame.setState({ week: eventWeek })
    useGame.getState().workWeekend()
    const once = useGame.getState().mental
    useGame.getState().workWeekend()
    expect(useGame.getState().mental).toBe(once)
    expect(useGame.getState().jobs).toHaveLength(1)
  })

  it('돌발 의뢰가 없는 주말에는 눌러도 아무 일이 없다', () => {
    const quiet = Array.from({ length: 60 }, (_, i) => i + 1).find((w) => !weekendEvent(w))!
    useGame.setState({ week: quiet })
    useGame.getState().workWeekend()
    const s = useGame.getState()
    expect(s.mental).toBe(INITIAL_GAME.mental)
    expect(s.jobs).toEqual([])
  })

  it('주차를 넘기면 정신력이 회복된다 — 줄기만 하지 않는다', () => {
    useGame.setState({ mental: 40 })
    useGame.getState().advanceWeek()
    expect(useGame.getState().mental).toBe(40 + MENTAL_RECOVERY)
    // ⚠️ 최대 위로는 안 올라간다.
    useGame.setState({ mental: INITIAL_GAME.mentalMax })
    useGame.getState().advanceWeek()
    expect(useGame.getState().mental).toBe(INITIAL_GAME.mentalMax)
  })

  // 뒤집기: 페널티가 안 걸리면 주말 근무는 대가 없이 돈만 버는 길이 된다.
  it('정신력이 낮으면 다음 주 행동력이 실제로 깎인다', () => {
    // 회복까지 마친 뒤에도 페널티 구간에 남을 만큼 낮은 값에서 시작한다.
    const low = MENTAL_PENALTY[MENTAL_PENALTY.length - 1]!.maxMental - MENTAL_RECOVERY
    useGame.setState({ mental: low, revenue: 0 })
    useGame.getState().advanceWeek()
    const s = useGame.getState()
    expect(mentalPenalty(s.mental)).toBeGreaterThan(0)
    expect(s.apMax).toBe(apMaxOf(0, s.mental))
    expect(s.apMax).toBeLessThan(COMPANY_LEVELS[0]!.apMax)
    // 그 주에 실제로 쓸 수 있는 행동력도 깎인 상한만큼이다(칸만 줄고 값이 남으면 안 된다).
    expect(s.ap).toBe(s.apMax)
  })

  it('⚠️ 행동력 상한이 1 밑으로 안 내려간다 — 0이면 죽은 판이다', () => {
    useGame.setState({ mental: 0, revenue: 0 })
    useGame.getState().advanceWeek()
    expect(useGame.getState().apMax).toBeGreaterThanOrEqual(AP_MIN)
  })

  it('정신력이 회복되면 상한도 돌아온다 — 되돌아올 길이 있다', () => {
    useGame.setState({ mental: 0, revenue: 0 })
    useGame.getState().advanceWeek()
    const hurt = useGame.getState().apMax
    useGame.setState({ mental: INITIAL_GAME.mentalMax })
    useGame.getState().advanceWeek()
    expect(useGame.getState().apMax).toBe(COMPANY_LEVELS[0].apMax)
    expect(hurt).toBeLessThan(COMPANY_LEVELS[0].apMax)
  })
})

/** 숙련도. ⚠️ 여기서 지키는 것은 **비용이 실제로 깎인다**와 **하한 1을 안 뚫는다** 둘이다 —
 *  0이 되면 행동력을 안 쓰고 무한히 만들 수 있어 이 게임의 유일한 제약이 사라진다. */
describe('숙련도', () => {
  it('구간을 넘으면 비용이 깎이고 하한은 1이다', () => {
    const d1 = SKILL_DISCOUNT[1]!
    const d2 = SKILL_DISCOUNT[2]!
    expect(apCost(3, 0)).toBe(3)
    expect(apCost(3, d1.minSkill)).toBe(3 - d1.ap)
    expect(apCost(3, d2.minSkill)).toBe(3 - d2.ap)
    // 뒤집기: 하한이 없으면 '간단하게'(1)가 0이 되어 공짜로 무한히 만들 수 있다.
    expect(apCost(1, 100)).toBe(1)
    expect(apCost(2, 100)).toBe(1)
  })

  it('내 손으로 돌리면 그 프로그램의 숙련도가 오른다', () => {
    const g = () => useGame.getState()
    const ppt = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'ppt')!
    g().acceptJob(ppt)
    const before = g().photoshopSkill
    g().makeSlides(ppt.id, 'light')
    expect(g().photoshopSkill).toBe(gainSkill(before))
    // ⚠️ 같이 오르지 않는다 — 축이 갈려 있어야 무엇을 익혔는지가 뜻을 갖는다.
    expect(g().figmaSkill).toBe(INITIAL_GAME.figmaSkill)
    expect(g().codingSkill).toBe(INITIAL_GAME.codingSkill)
  })

  it('숙련도는 100을 넘지 않는다', () => {
    expect(gainSkill(100)).toBe(100)
    expect(gainSkill(99)).toBe(100)
  })

  it('제작이 깎인 값만큼만 행동력을 문다', () => {
    const g = () => useGame.getState()
    const ppt = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'ppt')!
    // 포토샵 숙련도가 PPT 공정의 비용을 깎는다(`skillFor`).
    useGame.setState({ photoshopSkill: SKILL_DISCOUNT[1]!.minSkill })
    g().acceptJob(ppt)
    const before = g().ap
    g().makeSlides(ppt.id, 'hard')
    const hard = QUALITY.find((q) => q.id === 'hard')!
    expect(before - g().ap).toBe(apCost(hard.ap, SKILL_DISCOUNT[1]!.minSkill))
  })
})


/** 작업물 목록은 **넷이다**(`files`·`drafts`·`slides`·`publishes`). 넷을 훑어야 하는 자리가
 *  셋만 보는 사고가 이 리포에서 두 번 났다(완료 만족도·직원 피드백).
 *  ⚠️ 새 목록을 더하면 **이 테스트가 먼저 깨져야** 한다. */
describe('작업물 목록을 훑는 자리', () => {
  it('직원 피드백이 퍼블리싱 결과물도 올려 준다 — 한 목록만 빠지면 영영 못 고친다', () => {
    const g = () => useGame.getState()
    const fixReq = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'fix')!
    useGame.setState({ ...emptyState(), publishing: 0 })
    g().acceptJob(fixReq)
    g().publishJob(fixReq.id)

    const made = g().publishes[0]!
    expect(made.grade).not.toBe('SSS')

    // 그 결과물을 콕 집은 피드백 요청을 넣고 받아들인다.
    useGame.setState({
      employees: [
        {
          id: 'e1',
          name: '봐주는사람',
          role: 'designer',
          level: 3,
          stats: { design: 50, publishing: 50, planning: 50, cs: 50 },
          hiredWeek: 1,
        },
      ],
      requests: [
        {
          // ⚠️ 성패는 요청 id가 씨앗이다 — `r2`는 **성공하는 id**라 등급이 실제로 올라야 한다.
          id: 'r2',
          employeeId: 'e1',
          kind: 'feedback',
          week: g().week,
          expires: g().week + 1,
          target: { fileId: made.id, name: made.name, grade: made.grade },
        },
      ],
      ap: 3,
    })
    expect(feedbackWorks('r2')).toBe(true)
    g().acceptRequest('r2')
    // ⚠️ 뒤집기: `publishes`가 `bump` 목록에서 빠져 있으면 **성공해도 등급이 그대로**다.
    expect(g().publishes[0]!.grade).toBe(raiseGrade(made.grade))
  })
})

/** 해금 알림. ⚠️ 여기서 지키는 것은 **넘는 순간에만 온다**이다 —
 *  매번 오면 받은편지함이 같은 글로 덮이고 알림이 뜻을 잃는다. */
describe('사이트 해금 알림', () => {
  const g = () => useGame.getState()
  /** 그 레벨에서 열리는 사이트 이름. 이름을 테스트에 박지 않으려고 표에서 뽑는다. */
  const nameAtLevel = (level: number) => SHORTCUTS.find((s) => s.minLevel === level)!.name
  const fixReq = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'fix')!

  /** 유지보수 업무 하나를 끝까지 돌려 대금을 받는다(매출이 느는 유일한 자리).
   *  ⚠️ 같은 의뢰를 다시 쓰므로 **앞 판의 흔적을 지우고** 부른다(`acceptJob`은 같은
   *     id를 두 번 받지 않는다). */
  const earnOnce = () => {
    useGame.setState({ jobs: [], publishes: [], readIds: [], ap: 9 })
    g().acceptJob(fixReq)
    g().publishJob(fixReq.id)
    reply(fixReq.id)
  }

  it('경계를 넘을 때마다 그때 열린 것만 알린다', () => {
    // 레벨 2(어워더즈) 경계 바로 아래 — `fix` 대금이 경계 간격보다 작으므로 -1에서 시작한다.
    useGame.setState({ ...emptyState(), revenue: COMPANY_LEVELS[1]!.minRevenue - 1 })
    earnOnce()
    const first = g().mails.filter((m) => m.id.startsWith('unlock:'))
    expect(first).toHaveLength(1)
    // ⚠️ 이름을 적지 않는다 — 해금 순서를 바꿔도 규칙은 그대로여야 한다(표에서 파생).
    expect(first[0]!.body).toContain(nameAtLevel(2))

    // ⚠️ 여기가 핵심이다: **또 다른 경계(레벨 3)**를 넘게 해 둔다. "지금 열린 것을 매번
    //    알리는" 구현이면 이때 어워더즈가 **다시** 실려 온다 — 그러면 안 된다.
    useGame.setState({ revenue: COMPANY_LEVELS[2]!.minRevenue - 1 })
    earnOnce()
    const mails = g().mails.filter((m) => m.id.startsWith('unlock:'))
    expect(mails).toHaveLength(2)
    expect(mails[0]!.body).toContain(nameAtLevel(3))
    expect(mails[0]!.body).not.toContain(nameAtLevel(2))
  })

  it('새로 열린 것이 없으면 알림도 없다', () => {
    // 레벨 1 구간 한가운데 — 이번 대금으로는 아무 경계도 안 넘는다.
    useGame.setState({ ...emptyState(), revenue: 0 })
    earnOnce()
    expect(g().mails.filter((m) => m.id.startsWith('unlock:'))).toHaveLength(0)
  })

  // ⚠️ 뒤집기: 알림이 `ad`가 아니면 견적보내기 버튼이 붙어 "알림을 수주하는" 판이 된다.
  it('알림은 고를 것이 없는 글이다', () => {
    useGame.setState({ ...emptyState(), revenue: COMPANY_LEVELS[1]!.minRevenue - 1 })
    earnOnce()
    expect(g().mails.find((m) => m.id.startsWith('unlock:'))!.ad).toBe(true)
  })
})
