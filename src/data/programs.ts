/** 바탕화면에 놓이는 프로그램 목록. 창 제목·아이콘의 단일 출처다.
 *
 * ⚠️ 동작하지 않는 컨트롤을 그리지 않는다 — 창이 실제로 열리는 프로그램만 여기 있다.
 *    피그마·포토샵·카톡 등은 각자의 창이 생기는 커밋에서 추가한다. */
export const PROGRAMS = [
  { id: 'schedule', title: '일정', icon: 'fluent-color:calendar-32' },
] as const

export type ProgramId = (typeof PROGRAMS)[number]['id']

export function findProgram(id: ProgramId) {
  return PROGRAMS.find((p) => p.id === id)!
}
