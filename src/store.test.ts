import { beforeEach, describe, expect, it } from 'vitest'
import { INITIAL_GAME, WINDOW_DRAG } from './data/game'
import type { ProgramId } from './data/programs'
import { focusedWindowId, useGame } from './store'

beforeEach(() => {
  useGame.setState({ ...INITIAL_GAME, windows: [] })
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
