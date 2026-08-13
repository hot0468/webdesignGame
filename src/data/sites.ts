import type { SITE_ICONS } from './icons'

/** 게임 안의 가짜 포털. 브라우저 첫화면이 이것이다.
 *
 * ⚠️ 이름의 **둘째 글자**가 로고에서 파랗게 물든다(`browser.css`의 `.nv__logo-mark`) —
 *    이름을 바꿀 때 두 글자 이상인지 확인할 것. */
export const SEARCH_HOME = {
  name: '웹디검색',
  url: 'https://search.webdi.kr',
} as const

/** 첫화면 바로가기 칸 — 업무 수주 · 직원 고용 · 쇼핑.
 *
 * ⚠️ **`url`이 있는 칸만 열린다.** 없는 칸은 "준비 중" 꼬리표가 붙은 읽는 글자이고,
 *    화면이 생기는 커밋에서 그 칸에 주소를 붙인다(눌러도 아무 일 없는 버튼을 만들지 않는다).
 *
 * ⚠️ 주소는 **`systems/url.ts`가 이 목록을 보고 푼다** — 거기에 주소를 다시 적지 말 것
 *    (업체 관리자 주소가 `CLIENTS`에만 사는 것과 같은 규칙).
 *
 * ⚠️ **사내시스템은 여기 없다** — 바탕화면 프로그램이다(설계 결정표). 스펙이 "브라우저로
 *    접속"이라 적었다고 두 입구를 그리면 어느 쪽이 진짜인지 흐려진다.
 * ⚠️ 고용 사이트는 **알바가 아니라 직원**을 뽑는 곳이다(`메신저`의 대화 상대가 여기서 온다). */
export const SHORTCUTS = [
  { id: 'work', name: '수주센터', icon: 'work', url: 'https://sooju.kr' },
  { id: 'hire', name: '인간인', icon: 'hire', url: 'https://ingannin.kr' },
  { id: 'shop', name: '쇼핑', icon: 'shop' },
] as const satisfies readonly {
  id: string
  name: string
  icon: keyof typeof SITE_ICONS
  url?: string
}[]

export type ShortcutId = (typeof SHORTCUTS)[number]['id']

/** 주소가 붙어 실제로 열리는 바로가기만. `url.ts`와 `Browser.tsx`가 같은 것을 본다. */
export const openableShortcut = (id: ShortcutId) =>
  SHORTCUTS.find((s) => s.id === id && 'url' in s)
