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
/** ⚠️ `minLevel`이 **해금 조건이다**(회사레벨 = 누적 매출에서 파생, `data/game.ts`).
 *
 *  ⚠️ **새 수치를 만들지 않는다** — 이미 있는 축 하나로만 잠근다. 조건이 둘 이상이면
 *     플레이어가 "무엇을 올려야 열리는지" 헷갈리고, 화면도 그 조합을 설명해야 한다.
 *
 *  순서에 뜻이 있다: **쇼핑(1)은 처음부터** — 스탯을 사는 곳이라 잠그면 성장의 입구가
 *  같이 잠긴다. **인간인(2)**은 혼자 하던 일을 나눠 맡길 사람을 먼저 얻는 자리고,
 *  **어워더즈(3)**는 그렇게 번 시간을 시안 등급에 쓰는 곳이며, **수주센터(4)**는
 *  입찰 참가 조건(시안 장수·기획안 랭크)을 채울 수 있을 때 열린다. */
export const SHORTCUTS = [
  { id: 'shop', name: '쇼핑', icon: 'shop', url: 'https://webdimall.kr', minLevel: 1 },
  { id: 'hire', name: '인간인', icon: 'hire', url: 'https://ingannin.kr', minLevel: 2 },
  // ⚠️ **일하는 곳이 아니다** — 남의 잘된 작업을 구경하는 자리이고, 그 시간이 행동력으로
  //    나간다(`data/reference.ts`). 수주·채용·쇼핑 옆에 두는 이유는 이것도 결국 행동력을
  //    어디에 쓸까라는 같은 선택이기 때문이다.
  { id: 'reference', name: '어워더즈', icon: 'reference', url: 'https://awwwdi.kr', minLevel: 3 },
  { id: 'work', name: '수주센터', icon: 'work', url: 'https://sooju.kr', minLevel: 4 },
] as const satisfies readonly {
  id: string
  name: string
  icon: keyof typeof SITE_ICONS
  url?: string
  minLevel: number
}[]

export type ShortcutId = (typeof SHORTCUTS)[number]['id']

/** ⚠️ 여기 있던 `openableShortcut`은 **아무도 안 불렀다**(주소 유무는 `url.ts`가 `'url' in s`로
 *  직접 본다). 주석은 "둘이 같은 것을 본다"고 적고 있었지만 사실이 아니었다 — 지웠다.
 *  ⚠️ 되살리지 마라: 지금은 **네 칸 모두 주소가 있고**, 주소 없는 칸을 더하면
 *  `Browser.tsx`의 `s.url`에서 타입 검사가 멈춘다(실제로 확인했다). 그 자리가 안전망이다. */
