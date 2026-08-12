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
 * ⚠️ 지금은 **어느 것도 열리지 않는다.** 각 사이트 화면이 생기는 커밋에서 이 목록에
 *    여는 대상을 붙이고 `Browser.tsx`의 목록을 링크로 바꾼다 — 그 전까지는 "준비 중"
 *    꼬리표가 붙은 읽는 목록이다(눌러도 아무 일 없는 버튼을 만들지 않는다).
 *
 * ⚠️ **사내시스템은 여기 없다** — 바탕화면 프로그램이다(설계 결정표). 스펙이 "브라우저로
 *    접속"이라 적었다고 두 입구를 그리면 어느 쪽이 진짜인지 흐려진다.
 * ⚠️ 고용 사이트는 **알바가 아니라 직원**을 뽑는 곳이다(`메신저`의 대화 상대가 여기서 온다). */
export const SHORTCUTS = [
  { id: 'work', name: '수주센터', icon: 'work' },
  { id: 'hire', name: '인간인', icon: 'hire' },
  { id: 'shop', name: '쇼핑', icon: 'shop' },
] as const satisfies readonly {
  id: string
  name: string
  icon: keyof typeof SITE_ICONS
}[]
