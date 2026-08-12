/** 바탕화면에 놓이는 프로그램 목록. 창 제목·아이콘·놓이는 줄의 단일 출처다.
 *
 * ⚠️ 동작하지 않는 컨트롤을 그리지 않는다 — 창이 실제로 열리는 프로그램만 여기 있다.
 *
 * `col`은 바탕화면의 어느 줄에 서는가다: **왼쪽 = 회사를 굴리는 창**(의뢰·일정·사내시스템·
 * 브라우저 — 브라우저는 수주 사이트·채용 공고가 있는 사내시스템의 이웃이다),
 * **오른쪽 = 손으로 만드는 프로그램**(피그마·포토샵·메신저).
 * `size`는 창 크기 등급이다. 없으면 기본(440px), `app`은 사이드바·세 칸을 가진 큰 프로그램
 * (높이까지 고정하고 안쪽이 따로 스크롤한다).
 * `badge`는 그 아이콘이 지고 있는 받은 글 채널이다(`inbox.ts`) — 안 읽은 수가 아이콘에 붙는다.
 * ⚠️ 사내시스템의 뱃지는 **고객게시판 메뉴 하나**를 가리킨다. 창 안의 다른 화면이 뱃지를
 *    지게 되면 아이콘 뱃지가 무엇을 세는지 모호해지므로 그때 채널이 아니라 합계를 넘긴다. */
export const PROGRAMS = [
  { id: 'mail', title: '메일', icon: 'fluent-color:mail-32', col: 'left', size: 'app', badge: 'mail' },
  { id: 'schedule', title: '일정', icon: 'fluent-color:calendar-32', col: 'left' },
  {
    id: 'company',
    title: '사내시스템',
    icon: 'fluent-color:building-32',
    col: 'left',
    size: 'app',
    badge: 'board',
  },
  // ⚠️ globe는 fluent-color에 32가 없다(20·24뿐). -NN은 디자인 크기라 렌더 크기와 무관하다.
  { id: 'browser', title: '브라우저', icon: 'fluent-color:globe-24', col: 'left', size: 'app' },
  // 프로그램 로고는 devicon 그대로다(다색 — CSS color를 입히지 않는다).
  { id: 'figma', title: '피그마', icon: 'devicon:figma', col: 'right', size: 'app' },
  { id: 'photoshop', title: '포토샵', icon: 'devicon:photoshop', col: 'right', size: 'app' },
  // ⚠️ devicon에 파워포인트 로고가 없다(office 계열이 통째로 없다) — 다색 규칙을 지키려고
  //    fluent-color의 슬라이드 글리프를 쓴다. 로고를 지어내거나 CDN에서 받아 오지 말 것.
  { id: 'ppt', title: 'PPT', icon: 'fluent-color:slide-text-sparkle-32', col: 'right' },
  { id: 'messenger', title: '메신저', icon: 'fluent-color:chat-32', col: 'right', size: 'app' },
  { id: 'editor', title: '에디터', icon: 'devicon:vscode', col: 'right', size: 'app' },
  // ⚠️ `satisfies`가 **줄을 빼먹은 항목에서 빌드를 실패시킨다** — 없으면 그 아이콘이
  //    화면에서 조용히 사라진다(어느 줄에도 안 걸려서).
] as const satisfies readonly {
  id: string
  title: string
  icon: string
  col: 'left' | 'right'
  size?: 'app'
  badge?: 'mail' | 'board'
}[]

export type ProgramId = (typeof PROGRAMS)[number]['id']

export function findProgram(id: ProgramId) {
  return PROGRAMS.find((p) => p.id === id)!
}
