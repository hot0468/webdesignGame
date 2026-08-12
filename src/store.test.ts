import { beforeEach, describe, expect, it } from 'vitest'
import { CLAIM_REPUTATION_LOSS, INITIAL_GAME, POPUP_MAKE_AP, WINDOW_DRAG } from './data/game'
import { MESSAGES, type Request } from './data/inbox'
import type { ProgramId } from './data/programs'
import { focusedWindowId, useGame } from './store'

beforeEach(() => {
  useGame.setState({
    ...INITIAL_GAME,
    windows: [],
    jobs: [],
    readIds: [],
    rejectedIds: [],
    files: [],
    popups: [],
    claims: [],
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
    useGame.getState().makePopup(popupJob.id)
    expect(useGame.getState().ap).toBe(before - POPUP_MAKE_AP)
    expect(useGame.getState().files).toHaveLength(1)
  })

  // 규칙을 뒤집어 본다: 행동력이 없으면 파일도 생기지 않아야 한다(음수 행동력 금지).
  it('행동력이 모자라면 만들어지지 않는다', () => {
    useGame.setState({ ap: 0 })
    useGame.getState().makePopup(popupJob.id)
    expect(useGame.getState().files).toEqual([])
    expect(useGame.getState().ap).toBe(0)
  })

  // ⚠️ 등록은 **값을 물리지 않는다.** 여기에 비용이 되살아나면 제작과 합쳐 두 번 문다.
  it('등록은 행동력을 먹지 않는다 — 0이어도 등록된다', () => {
    useGame.getState().makePopup(popupJob.id)
    const fileId = useGame.getState().files[0]!.id
    useGame.setState({ ap: 0 })
    useGame.getState().uploadPopup('dalbit', fileId, 2, 3)
    const s = useGame.getState()
    expect(s.ap).toBe(0)
    expect(s.popups).toHaveLength(1)
    expect(s.popups[0]).toMatchObject({ clientId: 'dalbit', fileId, from: 2, to: 3 })
  })

  it('게시 기간은 나중에 고칠 수 있다', () => {
    useGame.getState().makePopup(popupJob.id)
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
    useGame.getState().makePopup(popupJob.id)
    const job = useGame.getState().jobs[0]!
    useGame
      .getState()
      .uploadPopup(job.popup!.clientId, useGame.getState().files[0]!.id, job.popup!.from, job.popup!.to)

    const rep = useGame.getState().reputation
    useGame.getState().advanceWeek()
    expect(useGame.getState().claims).toEqual([])
    expect(useGame.getState().reputation).toBe(rep)
  })

  it('요청 기간인데 안 걸려 있으면 클레임 메일이 오고 평판이 깎인다', () => {
    useGame.getState().acceptJob(popupJob)
    const rep = useGame.getState().reputation
    useGame.getState().advanceWeek()

    const s = useGame.getState()
    expect(s.claims).toHaveLength(1)
    expect(s.claims[0]!.channel).toBe('mail')
    // ⚠️ 클레임은 `ad` 갈래여야 한다 — 아니면 항의에 견적보내기가 붙는다.
    expect(s.claims[0]!.ad).toBe(true)
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
    const ids = useGame.getState().claims.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
