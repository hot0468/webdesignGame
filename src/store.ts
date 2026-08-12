import { create } from 'zustand'
import { CLAIM_REPUTATION_LOSS, INITIAL_GAME, POPUP_MAKE_AP, WINDOW_DRAG, WINDOW_SPAWN } from './data/game'
import { CLIENTS } from './data/company'
import type { Message, Request } from './data/inbox'
import type { ProgramId } from './data/programs'
import {
  claimMail,
  judgePopups,
  popupFileId,
  type Popup,
  type PopupFile,
  type PopupJob,
} from './systems/popup'

/** 수주한 업무 한 건. `id`는 그 의뢰 글의 id다 — 한 의뢰가 두 업무가 되지 않는다.
 *
 * `due`는 **통산 주차로 굳힌 마감**이다(의뢰의 `dueWeeks`는 상대값이라 그대로 두면
 * 주가 지나도 남은 기한이 안 줄어든다). 남은 주 = `due - week`.
 *
 * `popup`이 있으면 팝업 업무다. **요청 기간도 마감과 같은 이유로 수주 시점에 굳는다** —
 * 의뢰의 `fromWeeks`/`toWeeks`는 상대값이라 그대로 두면 주가 지나도 같은 주를 가리킨다.
 * 이 굳은 값이 클레임 판정의 정본이고, 플레이어가 관리자 페이지에 적는 기간은 사본이다.
 *
 * ⚠️ 공정의 줄·단가는 업무 시스템이 생길 때 붙는다 — 쓸 곳이 없는 칸을 미리 만들지 않는다. */
export type Job = {
  id: string
  from: string
  title: string
  due: number
  done: boolean
  popup?: { clientId: string; from: number; to: number }
}

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
  /** 포토샵으로 만들어 둔 팝업 이미지 파일. **업체별로 나누지 않는다** —
   *  등록 화면에서 **전부 고를 수 있어야** "틀린 파일을 골랐다"가 성립한다.
   *  ⚠️ 목록을 업무별로 걸러 보여 주면 이 게임의 실수할 자유가 사라진다. */
  files: PopupFile[]
  /** 관리자 페이지에 실제로 걸린 팝업. ⚠️ 개수가 아니라 **무엇을 언제부터 언제까지**다 —
   *  세 갈래 판정이 전부 이 세 칸에서 나온다. */
  popups: Popup[]
  /** 주차가 넘어갈 때 들어온 항의 메일. **메일 창의 받은편지함에 그대로 선다**
   *  (`inbox('mail', claims)`). 읽음은 스토어 `readIds` 하나가 계속 진다. */
  claims: Message[]

  windows: OpenWindow[]

  openWindow: (id: ProgramId) => void
  closeWindow: (id: ProgramId) => void
  focusWindow: (id: ProgramId) => void
  moveWindow: (id: ProgramId, x: number, y: number, viewport: Viewport) => void
  markRead: (id: string) => void
  acceptJob: (request: Request) => void
  rejectJob: (id: string) => void
  completeJob: (id: string) => void
  /** 팝업 이미지 제작(포토샵). **비용은 여기가 진다**(`POPUP_MAKE_AP`). */
  makePopup: (jobId: string) => void
  /** 팝업 등록. ⚠️ **행동력을 먹지 않는다** — 등록 자체는 공정이 아니라 그 결과를
   *  올리는 손짓이다. 비용은 팝업을 **만드는** 공정(포토샵)이 진다. */
  uploadPopup: (clientId: string, fileId: string, from: number, to: number) => void
  /** 걸어 둔 팝업의 게시 기간 수정. 목록에서 고쳐 클레임을 막는 유일한 길이다. */
  updatePopupPeriod: (popupId: string, from: number, to: number) => void
  /** 다음 주로. **팝업 판정이 도는 유일한 자리다** — 행동력을 채우고, 어긋난 팝업이
   *  있으면 항의 메일이 들어오며 평판이 깎인다. */
  advanceWeek: () => void
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
  files: [],
  popups: [],
  claims: [],
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
              {
                id: m.id,
                from: m.from,
                title: m.subject,
                due: s.week + m.dueWeeks,
                done: false,
                // 요청 기간도 **받는 주에 굳는다**(마감과 같은 이유). 상대값으로 들고
                // 있으면 주가 지나도 늘 같은 주를 가리켜 판정이 뜻을 잃는다.
                ...(m.popup && {
                  popup: {
                    clientId: m.popup.clientId,
                    from: s.week + m.popup.fromWeeks,
                    to: s.week + m.popup.toWeeks,
                  },
                }),
              },
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

  // 제작이 비용을 진다. ⚠️ 행동력이 모자라면 **아무 일도 일어나지 않는다** —
  //    음수 행동력으로 넘어가면 그다음 주까지 빚이 이어져 회복이 뜻을 잃는다.
  makePopup: (jobId) =>
    set((s) => {
      if (s.ap < POPUP_MAKE_AP) return {}
      // seq는 그 업무로 만든 파일 수다 — 같은 업무를 다시 만들어도 id가 겹치지 않는다.
      const seq = s.files.filter((f) => f.jobId === jobId).length + 1
      const job = s.jobs.find((j) => j.id === jobId)
      return {
        ap: s.ap - POPUP_MAKE_AP,
        files: [
          ...s.files,
          {
            id: popupFileId(jobId, seq),
            jobId,
            // 이름은 **업체와 제목**에서 온다 — 목록에서 파일만 보고 고를 때
            // 무엇의 팝업인지 알 수 있어야 "틀린 파일"이 실수이지 함정이 아니다.
            name: `${job?.from ?? jobId}_팝업${seq > 1 ? seq : ''}.png`,
            madeWeek: s.week,
          },
        ],
      }
    }),

  // ⚠️ 행동력을 깎지 않는다. 비용은 팝업을 **만드는** 공정이 지고, 여기는 만든 것을
  //    올리는 자리다 — 등록에까지 값을 매기면 한 팝업에 두 번 값을 물린다.
  uploadPopup: (clientId, fileId, from, to) =>
    set((s) => ({
      popups: [
        ...s.popups,
        { id: `pu:${clientId}:${s.popups.length + 1}`, clientId, fileId, from, to },
      ],
    })),

  updatePopupPeriod: (popupId, from, to) =>
    set((s) => ({
      popups: s.popups.map((p) => (p.id === popupId ? { ...p, from, to } : p)),
    })),

  // ⚠️ 판정은 여기서 하지 않는다 — `systems/popup.ts`의 순수 함수가 내고 스토어는
  //    **적용만** 한다(평판을 만드는 규칙이 테스트 밖으로 새지 않게).
  //
  // 행동력은 `apMax`로 완전 회복하고 **이월하지 않는다**(설계 결정). 남은 행동력을
  // 다음 주로 넘기면 아무것도 안 하고 모았다가 한 주에 쏟는 전략이 최적이 된다.
  advanceWeek: () =>
    set((s) => {
      const next = s.week + 1
      const popupJobs: PopupJob[] = s.jobs
        .filter((j) => j.popup)
        .map((j) => ({ id: j.id, clientId: j.popup!.clientId, from: j.popup!.from, to: j.popup!.to, done: j.done }))

      const claims = judgePopups(next, popupJobs, s.popups)
      const mails = claims.map((c) =>
        claimMail(c, next, CLIENTS.find((x) => x.id === c.clientId)?.name ?? c.clientId),
      )

      return {
        week: next,
        ap: s.apMax,
        // ⚠️ 업체당 한 번만 깎는다(같은 주에 세 갈래가 어긋나도 `claims`는 한 건이다).
        //    0 밑으로는 내려가지 않는다 — 음수 평판에는 뜻이 없고 위기 판정만 흐려진다.
        reputation: Math.max(0, s.reputation - claims.length * CLAIM_REPUTATION_LOSS),
        claims: [...mails, ...s.claims],
      }
    }),
}))
