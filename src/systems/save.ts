/** 이름 있는 세이브 슬롯 — **자동저장과 다른 자리다.**
 *
 * zustand `persist`는 `webdi.save.v1` **한 칸**에 계속 덮어쓴다(자동저장). 그것만으로는
 * "여기서 갈라져 보고 안 되면 돌아온다"가 안 된다 — 되돌릴 지점이 늘 직전 한 순간뿐이라
 * 이미 지나간 판은 어디에도 없다. 그래서 사람이 **직접 이름을 붙여 남기는 칸**을 따로 둔다.
 *
 * ⚠️ 자동저장 키와 **섞지 않는다**(`webdi.slot.1` …). 같은 키를 나눠 쓰면 슬롯에
 *    저장하는 순간 자동저장이 덮이거나 그 반대가 되어, 어느 쪽이 정본인지가 사라진다.
 *
 * ⚠️ 여기는 **순수 함수만** 있다 — 저장소를 만지는 것은 `store.ts`다. 슬롯 요약을 만드는
 *    규칙과 남의 JSON을 믿지 않는 규칙이 테스트 밖으로 새면 안 된다.
 */

/** 슬롯 수. 3칸이면 "지금 판 · 갈라 본 판 · 아껴 둔 판"이 서고, 더 늘리면 고르는 일이
 *  저장하는 일보다 무거워진다. */
export const SLOT_COUNT = 3

/** 슬롯 번호(1부터) → localStorage 키. ⚠️ 자동저장 키(`webdi.save.v1`)와 **다른 이름**이다. */
export const slotKey = (n: number) => `webdi.slot.${n}`

/** 슬롯에 담기는 게임 상태. 자동저장의 `partialize` 결과와 **같은 모양**이라
 *  구조를 여기 다시 적지 않는다 — 새 상태 축이 늘면 `partialize` 한 곳만 고치면 된다. */
export type SaveData = Record<string, unknown>

/** 슬롯 하나에 실제로 적히는 것. **상태 + 요약**이다 — 요약이 같이 있어야 목록에서
 *  세이브를 통째로 풀지 않고도 어느 판인지 알아본다. */
export type SaveSlot = {
  /** 세이브 판 번호. 슬롯 구조가 바뀌면 올린다 — 옛 슬롯은 그 순간 `null`로 읽혀
   *  덮어쓸 수 있는 빈 칸이 된다(자동저장 키를 v2로 올리는 것과 같은 규칙). */
  v: 1
  /** 저장한 실제 시각(epoch ms). ⚠️ 게임 안의 주차가 아니라 **바깥 시계**다 —
   *  같은 주차에서 두 번 저장했을 때 둘을 가르는 것은 이것뿐이다. */
  savedAt: number
  /** 목록 한 줄에 서는 요약. `data`에서 뽑지만 **저장 시점에 굳힌다** —
   *  읽을 때마다 다시 뽑으면 상태 모양이 바뀐 옛 슬롯을 못 읽는다. */
  summary: SlotSummary
  data: SaveData
}

/** 슬롯 목록 한 줄이 말하는 것. **어느 판인지 알아보는 데 필요한 최소**다 —
 *  판을 가르는 것은 시간(주차)과 결과(소지금·평판), 그리고 얼마나 굴렸는지(업무 수)다. */
export type SlotSummary = {
  week: number
  money: number
  reputation: number
  jobs: number
}

/** 상태에서 요약을 뽑는다. ⚠️ 없는 값은 0으로 떨어진다 — 옛 세이브라도 목록에는 서야 한다
 *  (한 줄이 안 서면 그 슬롯은 지울 수도 덮을 수도 없는 유령 칸이 된다). */
export function summarize(data: SaveData): SlotSummary {
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
  return {
    week: num(data.week),
    money: num(data.money),
    reputation: num(data.reputation),
    jobs: Array.isArray(data.jobs) ? data.jobs.length : 0,
  }
}

export function makeSlot(data: SaveData, savedAt: number): SaveSlot {
  return { v: 1, savedAt, summary: summarize(data), data }
}

/** 저장소에서 읽은 **남의 글자**를 슬롯으로 믿을지 판정한다.
 *
 * ⚠️ 여기가 이 파일의 핵심이다. localStorage는 사람이 손댈 수 있고 판이 바뀌면 모양도
 *    변한다 — 검사 없이 `JSON.parse` 결과를 스토어에 부으면 **불러오는 순간 게임이 죽는다**
 *    (죽은 판은 되돌릴 길도 없다). 못 믿을 것은 전부 `null` = 빈 슬롯으로 떨어뜨린다.
 *
 * 검사는 **모양만** 본다(주차가 몇인지 같은 내용은 보지 않는다) — 게임 규칙이 여기로
 * 새면 규칙이 바뀔 때마다 옛 세이브가 통째로 못 읽는 것이 된다. */
export function parseSlot(raw: string | null): SaveSlot | null {
  if (!raw) return null
  let v: unknown
  try {
    v = JSON.parse(raw)
  } catch {
    return null
  }
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  if (o.v !== 1) return null
  if (typeof o.savedAt !== 'number' || !Number.isFinite(o.savedAt)) return null
  if (!o.data || typeof o.data !== 'object' || Array.isArray(o.data)) return null
  const data = o.data as SaveData
  // 요약은 **저장 시점 것을 그대로 믿지 않는다** — 모양이 깨졌으면 상태에서 다시 뽑아
  // 목록 한 줄은 반드시 선다(요약 하나 때문에 멀쩡한 세이브를 버리지 않는다).
  const summary = isSummary(o.summary) ? o.summary : summarize(data)
  return { v: 1, savedAt: o.savedAt, summary, data }
}

const isSummary = (v: unknown): v is SlotSummary =>
  !!v &&
  typeof v === 'object' &&
  ['week', 'money', 'reputation', 'jobs'].every(
    (k) => typeof (v as Record<string, unknown>)[k] === 'number',
  )

/** 목록 한 줄에 적는 저장 시각. ⚠️ 초까지 적는다 — 같은 분에 두 번 저장하면
 *  두 줄이 글자까지 똑같아져 어느 쪽이 나중인지 알 수 없다. */
export function formatSavedAt(ms: number): string {
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
