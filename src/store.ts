import { create } from 'zustand'
import { INITIAL_GAME, WINDOW_DRAG, WINDOW_SPAWN } from './data/game'
import type { Request } from './data/inbox'
import type { ProgramId } from './data/programs'

/** 수주한 업무 한 건. `id`는 그 의뢰 글의 id다 — 한 의뢰가 두 업무가 되지 않는다.
 *
 * `due`는 **통산 주차로 굳힌 마감**이다(의뢰의 `dueWeeks`는 상대값이라 그대로 두면
 * 주가 지나도 남은 기한이 안 줄어든다). 남은 주 = `due - week`.
 *
 * ⚠️ 공정의 줄·단가는 업무 시스템이 생길 때 붙는다 — 쓸 곳이 없는 칸을 미리 만들지 않는다. */
export type Job = { id: string; from: string; title: string; due: number; done: boolean }

/** 열려 있는 창 하나. 위치는 transform으로만 적용한다(레이아웃 속성 애니메이션 금지). */
export type OpenWindow = {
  id: ProgramId
  x: number
  y: number
  /** 스택 순서. ⚠️ 포커스는 별도 필드가 아니라 **z 최대값에서 파생**한다 —
   *  관계를 한 방향으로만 적어야 둘이 어긋나지 않는다. */
  z: number
}

type Store = {
  week: number
  ap: number
  apMax: number
  mental: number
  mentalMax: number
  money: number
  reputation: number

  /** 읽은 글의 id(메일·고객게시판 공용). 뱃지 숫자는 여기서만 나온다. */
  readIds: string[]
  /** 수주한 업무. 계기판 맨 아래 업무목록이 이것을 그대로 그린다. */
  jobs: Job[]
  /** 거절한 의뢰의 id. ⚠️ 목록에서 지우지 않는다 — 지우면 같은 글이 다시 새 글로 보인다. */
  rejectedIds: string[]

  windows: OpenWindow[]

  openWindow: (id: ProgramId) => void
  closeWindow: (id: ProgramId) => void
  focusWindow: (id: ProgramId) => void
  moveWindow: (id: ProgramId, x: number, y: number, viewport: Viewport) => void
  markRead: (id: string) => void
  acceptJob: (request: Request) => void
  rejectJob: (id: string) => void
  completeJob: (id: string) => void
}

/** 드래그 clamp에 필요한 화면 크기. 스토어는 DOM을 모르므로 호출자가 준다. */
export type Viewport = { w: number; h: number }

const topZ = (windows: OpenWindow[]) => windows.reduce((max, w) => Math.max(max, w.z), 0)

/** 포커스된 창 = z가 가장 큰 창. 열린 창이 없으면 null. */
export function focusedWindowId(windows: OpenWindow[]): ProgramId | null {
  return windows.reduce<OpenWindow | null>((top, w) => (!top || w.z > top.z ? w : top), null)?.id ?? null
}

export const useGame = create<Store>((set) => ({
  ...INITIAL_GAME,
  readIds: [],
  jobs: [],
  rejectedIds: [],
  windows: [],

  openWindow: (id) =>
    set((s) => {
      // 이미 열려 있으면 새로 만들지 않고 앞으로 가져온다.
      if (s.windows.some((w) => w.id === id)) {
        return { windows: s.windows.map((w) => (w.id === id ? { ...w, z: topZ(s.windows) + 1 } : w)) }
      }
      const step = WINDOW_SPAWN.cascade * s.windows.length
      return {
        windows: [
          ...s.windows,
          { id, x: WINDOW_SPAWN.x + step, y: WINDOW_SPAWN.y + step, z: topZ(s.windows) + 1 },
        ],
      }
    }),

  closeWindow: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

  focusWindow: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, z: topZ(s.windows) + 1 } : w)),
    })),

  // 화면 밖으로 완전히 사라져 되찾을 수 없는 상태를 막는다. ⚠️ 아래쪽 상한이 없으면
  // 창을 작업 표시줄 밑으로 밀어 타이틀바를 잡을 수 없게 된다(작업 표시줄 버튼으로
  // 포커스는 돌아오지만 위치는 못 돌린다). 그래서 양쪽 끝을 다 막는다.
  moveWindow: (id, x, y, viewport) =>
    set((s) => {
      const keep = WINDOW_DRAG.keepVisible
      const clamp = (v: number, max: number) => Math.min(Math.max(0, v), Math.max(0, max))
      return {
        windows: s.windows.map((w) =>
          w.id === id
            ? { ...w, x: clamp(x, viewport.w - keep), y: clamp(y, viewport.h - keep) }
            : w,
        ),
      }
    }),

  // 읽음은 되돌리지 않는다 — 안 읽은 수는 늘 새 글에서만 온다.
  markRead: (id) => set((s) => (s.readIds.includes(id) ? {} : { readIds: [...s.readIds, id] })),

  // ⚠️ 같은 의뢰를 두 번 수주하지 않는다. 같은 id가 두 줄이 되면 완료 표시가 갈리고,
  //    나중에 공정·대금이 붙었을 때 한 건으로 두 번 받는 구멍이 된다.
  // 마감은 **받는 순간** 굳는다(이번 주 + 기한). 상대값으로 들고 있으면 주가 지나도
  // 남은 기한이 줄지 않아 데드라인이 뜻을 잃는다.
  acceptJob: (m) =>
    set((s) =>
      s.jobs.some((j) => j.id === m.id)
        ? {}
        : {
            jobs: [
              ...s.jobs,
              { id: m.id, from: m.from, title: m.subject, due: s.week + m.dueWeeks, done: false },
            ],
          },
    ),

  rejectJob: (id) =>
    set((s) => (s.rejectedIds.includes(id) ? {} : { rejectedIds: [...s.rejectedIds, id] })),

  // ⚠️ 완료는 **한 방향**이다. 업무를 끝내면 목록에 취소선이 그어지고, 되돌아가지 않는다
  //    (토글로 만들면 사람이 켜고 끄는 체크박스가 되고, 그 순간 완료가 뜻을 잃는다).
  //    지금은 부르는 곳이 없다 — 공정의 줄이 생기면 **마지막 공정이** 이것을 부른다.
  completeJob: (id) =>
    set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, done: true } : j)) })),
}))
