/** 바탕화면에 놓이는 프로그램 목록. 창 제목·아이콘의 단일 출처다.
 *
 * ⚠️ 동작하지 않는 컨트롤을 그리지 않는다 — 창이 실제로 열리는 프로그램만 여기 있다.
 *    피그마·포토샵·카톡 등은 각자의 창이 생기는 커밋에서 추가한다. */
/** `wide`는 사이드바 메뉴가 있는 백오피스형 창이다(기본 폭으로는 메뉴와 내용이 함께 안 들어간다). */
export const PROGRAMS = [
  { id: 'schedule', title: '일정', icon: 'fluent-color:calendar-32' },
  { id: 'company', title: '사내시스템', icon: 'fluent-color:building-32', wide: true },
  // ⚠️ globe는 fluent-color에 32가 없다(20·24뿐). -NN은 디자인 크기라 렌더 크기와 무관하다.
  { id: 'browser', title: '브라우저', icon: 'fluent-color:globe-24' },
] as const

export type ProgramId = (typeof PROGRAMS)[number]['id']

export function findProgram(id: ProgramId) {
  return PROGRAMS.find((p) => p.id === id)!
}
