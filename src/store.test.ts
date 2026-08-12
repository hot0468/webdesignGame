import { beforeEach, describe, expect, it } from 'vitest'
import { INITIAL_GAME, WINDOW_DRAG } from './data/game'
import { MESSAGES } from './data/inbox'
import type { ProgramId } from './data/programs'
import { focusedWindowId, useGame } from './store'

beforeEach(() => {
  useGame.setState({ ...INITIAL_GAME, windows: [], jobs: [], readIds: [], rejectedIds: [], popups: {} })
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

describe('팝업 등록', () => {
  it('업체별로 센다', () => {
    const { uploadPopup } = useGame.getState()
    uploadPopup('dalbit')
    uploadPopup('dalbit')
    uploadPopup('hanbit')
    expect(useGame.getState().popups).toEqual({ dalbit: 2, hanbit: 1 })
  })

  // ⚠️ 등록은 **값을 물리지 않는다.** 여기에 비용이 되살아나면 팝업을 만드는 공정과
  //    합쳐 한 팝업에 두 번 값을 물리게 된다.
  it('행동력을 먹지 않는다 — 0이어도 등록된다', () => {
    useGame.setState({ ap: 0 })
    useGame.getState().uploadPopup('dalbit')
    const s = useGame.getState()
    expect(s.ap).toBe(0)
    expect(s.popups.dalbit).toBe(1)
  })
})
