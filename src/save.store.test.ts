import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INITIAL_GAME } from './data/game'
import { slotKey } from './systems/save'
import { useGame } from './store'

/** 테스트는 node라 `localStorage`가 없다 — 슬롯이 **실제로 저장소를 왕복하는지**를
 *  보려면 여기서 하나 심어 준다(스토어의 `noopStorage` 갈래로 떨어지면 저장도 불러오기도
 *  조용히 아무 일도 안 하고 통과한다). */
function installStorage() {
  const map = new Map<string, string>()
  const fake = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size
    },
  }
  ;(globalThis as Record<string, unknown>).localStorage = fake
  return fake
}

let storage: ReturnType<typeof installStorage>

beforeEach(() => {
  storage = installStorage()
  useGame.setState({
    ...INITIAL_GAME,
    windows: [],
    jobs: [],
    readIds: [],
    rejectedIds: [],
    files: [],
    drafts: [],
    slides: [],
    popups: [],
    mails: [],
    bookmarks: [],
    ftpClients: [],
    employees: [],
    orders: [],
    hirePostWeek: undefined,
    hiredApplicantIds: [],
    chats: [],
    crisisWeeks: 0,
    slotsRevision: 0,
  })
})

afterEach(() => {
  delete (globalThis as Record<string, unknown>).localStorage
})

describe('이름 있는 슬롯', () => {
  // 이 게임에서 되돌릴 수 없는 일은 셋이다: 주차 넘김 · 불러오기 · 새 게임.
  // 아래가 그 둘째의 불변식이다 — **저장한 순간으로 정확히 돌아온다**.
  it('저장 → 판을 바꿈 → 불러오기 하면 저장 시점 그대로다', () => {
    useGame.setState({ week: 5, money: 777_000, reputation: 44 })
    useGame.getState().saveSlot(1)

    useGame.getState().advanceWeek()
    useGame.setState({ money: 1, reputation: 99 })
    expect(useGame.getState().week).toBe(6)

    expect(useGame.getState().loadSlot(1)).toBe(true)
    const s = useGame.getState()
    expect({ week: s.week, money: s.money, reputation: s.reputation }).toEqual({
      week: 5,
      money: 777_000,
      reputation: 44,
    })
  })

  // ⚠️ 새 상태 축을 `saveFields`에 넣지 않으면 **그 축만 조용히 안 담긴다** —
  //    불러왔을 때 직원이 사라지고, 세이브가 깨진 것처럼 보인다.
  it('직원 축이 전부 담긴다 — saveFields에서 빠지면 불러왔을 때 직원이 사라진다', () => {
    useGame.setState({
      employees: [
        {
          id: 'e1',
          name: '김지훈',
          role: 'dublisher',
          level: 3,
          stats: { design: 70, publishing: 60, planning: 55, cs: 40 },
          hiredWeek: 2,
        },
      ],
      orders: [
        {
          employeeId: 'e1',
          jobId: 'j1',
          program: 'figma',
          label: '시안',
          from: 2,
          doneWeek: 4,
          grade: 'B',
        },
      ],
      hirePostWeek: 2,
      hiredApplicantIds: ['ap:2:0'],
      chats: [{ employeeId: 'e1', week: 2, text: '맡겠습니다' }],
      crisisWeeks: 2,
    })
    useGame.getState().saveSlot(1)
    useGame.getState().newGame()
    expect(useGame.getState().employees).toHaveLength(0)

    expect(useGame.getState().loadSlot(1)).toBe(true)
    const s = useGame.getState()
    expect(s.employees).toHaveLength(1)
    expect(s.employees[0]!.level).toBe(3)
    expect(s.orders).toHaveLength(1)
    expect(s.hirePostWeek).toBe(2)
    expect(s.hiredApplicantIds).toEqual(['ap:2:0'])
    expect(s.chats).toHaveLength(1)
    expect(s.crisisWeeks).toBe(2)
  })

  it('자동저장 키를 건드리지 않는다 — 섞이면 어느 쪽이 정본인지 사라진다', () => {
    useGame.getState().saveSlot(2)
    expect(storage.getItem(slotKey(2))).not.toBeNull()
    expect(storage.getItem('webdi.save.v1')).toBeNull()
  })

  it('빈 슬롯은 불러올 수 없다 — 아무 일도 일어나지 않는다', () => {
    useGame.setState({ week: 9 })
    expect(useGame.getState().loadSlot(3)).toBe(false)
    expect(useGame.getState().week).toBe(9)
  })

  it('깨진 세이브를 먹여도 판이 죽지 않는다', () => {
    storage.setItem(slotKey(1), '{쓰레기')
    useGame.setState({ week: 9 })
    expect(useGame.getState().loadSlot(1)).toBe(false)
    expect(useGame.getState().week).toBe(9)
  })

  it('옛 세이브에 없던 축은 초기값으로 메워진다 — 불러온 판에 undefined가 남지 않는다', () => {
    storage.setItem(
      slotKey(1),
      JSON.stringify({ v: 1, savedAt: 1, data: { week: 4, money: 5 } }),
    )
    expect(useGame.getState().loadSlot(1)).toBe(true)
    const s = useGame.getState()
    expect(s.week).toBe(4)
    expect(s.jobs).toEqual([])
    expect(s.apMax).toBe(INITIAL_GAME.apMax)
  })

  it('삭제하면 그 칸은 다시 못 불러온다', () => {
    useGame.getState().saveSlot(1)
    useGame.getState().clearSlot(1)
    expect(useGame.getState().loadSlot(1)).toBe(false)
  })

  it('새 게임은 판만 되돌리고 **슬롯은 남긴다** — 되돌아올 자리까지 날리지 않는다', () => {
    useGame.setState({ week: 12, money: 3 })
    useGame.getState().saveSlot(1)
    useGame.getState().newGame()

    expect(useGame.getState().week).toBe(INITIAL_GAME.week)
    expect(useGame.getState().loadSlot(1)).toBe(true)
    expect(useGame.getState().week).toBe(12)
  })
})
