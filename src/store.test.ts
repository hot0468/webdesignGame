import { beforeEach, describe, expect, it } from 'vitest'
import {
  BASE_FEE,
  BREACH_REPUTATION_LOSS,
  CLAIM_REPUTATION_LOSS,
  findQuality,
  GRADE_REWARD,
  INITIAL_GAME,
  WEEKS_PER_MONTH,
  WINDOW_DRAG,
  CRISIS_WEEKS_TO_SHUTDOWN,
} from './data/game'
import { monthlyCost } from './systems/money'
import { MESSAGES, type Request } from './data/inbox'
import type { ProgramId } from './data/programs'
import { focusedWindowId, useGame } from './store'
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
    // ⚠️ 직원·요청·끝난 판까지 되돌린다. 빠뜨리면 앞 테스트가 남긴 직원의 급여가
    //    다음 테스트의 월말 정산에서 빠져 엉뚱한 파산이 난다(실제로 겪었다).
    employees: [],
    orders: [],
    trainings: [],
    requests: [],
    chats: [],
    crisisWeeks: 0,
    over: undefined,
  })
})

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
    }).toEqual({ ...INITIAL_GAME })
  })
})

describe('창', () => {
  it('열고 닫는다', () => {
    useGame.getState().openWindow('schedule')
    expect(useGame.getState().windows.map((w) => w.id)).toEqual(['schedule'])
    useGame.getState().closeWindow('schedule')
    expect(useGame.getState().windows).toEqual([])
  })

  it('이미 열린 창을 다시 열면 중복 생성하지 않고 앞으로 온다', () => {
    const { openWindow } = useGame.getState()
    openWindow('schedule')
    const z1 = useGame.getState().windows[0]!.z
    openWindow('schedule')
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
    useGame.getState().openWindow('schedule')

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

    g().replyJob(site.id)
    useGame.setState({ ap: 3 })
    g().makeDraft(site.id, 'light')
    g().replyJob(site.id)
    useGame.setState({ ap: 3 })
    g().publishJob(site.id)
    expect(g().jobs[0]!.done).toBe(false) // ⚠️ 만든 것으로는 끝나지 않는다
    g().replyJob(site.id)
    expect(g().jobs[0]!.done).toBe(true)
  })

  it('중간 회신에는 답장이, 완료 회신에는 만족도 메일이 온다', () => {
    const g = () => useGame.getState()
    g().acceptJob(site)
    g().makeSlides(site.id, 'light')
    g().replyJob(site.id)
    // 답장은 그 업무에 매인 글이라 `jobId`를 진다(그 글에서도 다음 회신을 보낼 수 있다).
    expect(g().mails[0]!.jobId).toBe(site.id)
    expect(g().mails[0]!.channel).toBe(site.channel)

    useGame.setState({ ap: 3 })
    g().makeDraft(site.id, 'light')
    g().replyJob(site.id)
    useGame.setState({ ap: 3 })
    g().publishJob(site.id)
    g().replyJob(site.id)
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
    g().replyJob(popupJob.id)
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
    g().replyJob(fix.id)
    expect(g().ap).toBe(before)
    expect(g().jobs[0]!.done).toBe(true)
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
    g().replyJob(fix.id)

    // 퍼블리싱만 있는 업무는 등급이 없어 기준선(C)이다 — 대금은 정가, 평판은 그대로.
    expect(g().money).toBe(money + BASE_FEE.fix)
    expect(g().reputation).toBe(rep)
    expect(g().mails[0]!.body).toContain('대금')
  })

  it('공들인 만큼 더 받는다 — 등급이 대금을 정한다', () => {
    const g = () => useGame.getState()
    const ppt = MESSAGES.find((m): m is Request => !m.ad && m.kind === 'ppt')!
    const money = g().money
    g().acceptJob(ppt)
    g().makeSlides(ppt.id, 'care') // 행동력 3 — 등급 S대
    g().replyJob(ppt.id)
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
    useGame.getState().replyJob(site.id)
    useGame.setState({ ap: INITIAL_GAME.apMax })
  }

  it('다 맞히면 오르고, 다 틀리면 안 오른다', () => {
    const answer = clientKeywords(site.id)
    const wrong = KEYWORDS.map((k) => k.id).filter((k) => !answer.includes(k)).slice(0, SITE_KEYWORDS)

    toDraftStep()
    useGame.getState().makeDraft(site.id, 'light', answer)
    const hit = useGame.getState().drafts.at(-1)!.grade

    useGame.setState({ jobs: [], drafts: [], slides: [], mails: [], meetings: {} })
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
  it('월말 정산에서 소지금이 음수가 되면 파산한다', () => {
    // 정산 주차 직전 + 고정 지출도 못 낼 잔고.
    useGame.setState({ week: WEEKS_PER_MONTH - 1, money: 1_000, employees: [] })
    useGame.getState().advanceWeek()
    const s = useGame.getState()
    expect(s.money).toBeLessThan(0)
    expect(s.over?.kind).toBe('bankrupt')
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
