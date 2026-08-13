import type { Grade } from '../data/game'
import type { Message } from '../data/inbox'
import type { ProgramId } from '../data/programs'
import { formatWeek } from './calendar'

/** 업무의 **공정의 줄**과 회신 규칙. 이 게임의 진행이 여기 한 곳에서 정해진다.
 *
 * ⚠️ 순수 함수다(`src/systems/` 규칙 — React·mutation·Math.random 없음).
 *
 * 고리는 이렇다:
 *   공정 실행(그 공정의 프로그램에서, 행동력 소모) → **그 글에 회신**(행동력 0)
 *     → 공정이 남았으면 상대의 답장이 새 글로 오고 그것이 다음 공정을 연다
 *     → 마지막 공정의 회신이 **완료 회신**이고, 만족도가 적힌 완료 메일이 온다
 *
 * 그래서 업무는 **두 개의 칸**을 진다:
 *   `step`    = 실행을 마친 공정 수
 *   `replied` = 회신을 마친 공정 수
 * ⚠️ 둘이 같을 때만 다음 공정을 실행할 수 있고, `step > replied`일 때만 회신할 수 있다.
 *    한 칸으로 합치면 "만들었지만 아직 안 보냈다"는 상태가 사라진다 — 이 게임에서
 *    납품은 만드는 것과 다른 일이다. */

export type JobKind = 'popup' | 'ppt' | 'site' | 'fix'

/** 공정 하나. `program`은 그 공정을 도는 창이고, 창은 **자기 차례인 업무만** 세운다. */
export type Step = { id: string; program: ProgramId; label: string }

/** 종류별 공정의 줄. **순서대로만 진행한다.**
 *
 * ⚠️ `site`(신규 사이트)는 세 공정이다 — 화면정의서(PPT) → 시안(피그마) → 퍼블리싱(에디터).
 *    `fix`(유지보수 수정)는 퍼블리싱 하나다. 둘을 한 종류로 묶지 말 것: 배너 한 장 바꾸는
 *    일에 화면정의서를 요구하면 유지보수가 신규 제작만큼 무거워진다. */
export const PIPELINE = {
  popup: [
    { id: 'popup-make', program: 'photoshop', label: '팝업 제작' },
    { id: 'popup-upload', program: 'browser', label: '관리자 페이지 등록' },
  ],
  ppt: [{ id: 'slides', program: 'ppt', label: '발표자료 제작' }],
  site: [
    { id: 'spec', program: 'ppt', label: '화면정의서' },
    { id: 'draft', program: 'figma', label: '시안' },
    { id: 'publish', program: 'editor', label: '퍼블리싱' },
  ],
  fix: [{ id: 'publish', program: 'editor', label: '퍼블리싱' }],
} as const satisfies Record<JobKind, readonly Step[]>

/** 공정 판정에 필요한 업무의 최소 모양. ⚠️ 스토어의 `Job` 전체를 받지 않는다 —
 *  순수 함수가 UI·세이브의 모양에 묶이지 않게 한다(`popup.ts`의 `PopupJob`과 같은 규칙). */
export type StepJob = {
  kind: JobKind
  step: number
  replied: number
  /** 팝업 업무의 게시 기간 끝. 완료 회신을 언제 보낼 수 있는지가 여기서 갈린다. */
  popupTo?: number
}

export const stepsOf = (kind: JobKind): readonly Step[] => PIPELINE[kind]

/** 지금 **실행할 수 있는** 공정. 회신이 밀려 있거나 다 끝났으면 없다. */
export function openStep(job: StepJob): Step | undefined {
  if (job.step !== job.replied) return undefined
  return stepsOf(job.kind)[job.step]
}

/** 이 창의 차례인가. **실행할 수 있는가**를 묻는다(버튼의 조건). */
export const isTurnOf = (job: StepJob, program: ProgramId) => openStep(job)?.program === program

/** 이 창에서 **방금 끝냈고 아직 회신하지 않은** 업무인가.
 *  ⚠️ 목록에서 이것까지 빼면 방금 만든 파일과 그 등급을 확인할 자리가 사라진다 —
 *     실행하는 순간 화면에서 사라지는 것은 결과를 감추는 것과 같다. */
export const isWaitingReply = (job: StepJob, program: ProgramId) =>
  job.step === job.replied + 1 && repliedStep(job)?.program === program

/** 그래서 목록에 서는가. 창들은 이 한 줄로 자기 업무를 고른다(조건을 창마다 다시 적지 말 것). */
export const showsIn = (job: StepJob, program: ProgramId) =>
  isTurnOf(job, program) || isWaitingReply(job, program)

/** 회신할 수 있는가 — **실행은 했는데 아직 안 보낸 공정**이 있을 때다.
 *
 * ⚠️ 팝업의 **완료 회신만은 게시 기간이 끝나야** 보낼 수 있다. 등록하자마자 끝내 버리면
 *    완료된 업무는 주차 넘김 판정에서 빠지므로(`popup.ts`), 기간 중에 팝업을 내려도
 *    클레임이 나지 않는 구멍이 된다. */
export function canReply(job: StepJob, week: number): boolean {
  if (job.step <= job.replied) return false
  const last = job.replied + 1 === stepsOf(job.kind).length
  if (last && job.kind === 'popup' && job.popupTo !== undefined) return week > job.popupTo
  return true
}

/** 이번 회신이 마지막(완료 회신)인가. */
export const isFinalReply = (job: StepJob) => job.replied + 1 === stepsOf(job.kind).length

/** 지금 회신할 차례인 공정(= 마지막으로 실행을 마친 것). 회신 메일의 문안이 이 이름을 쓴다. */
export const repliedStep = (job: StepJob): Step | undefined => stepsOf(job.kind)[job.replied]

/** 마감을 넘겼는가. ⚠️ **완료 회신을 보내기 전까지는 끝난 것이 아니다** — 만들어 놓고
 *  보내지 않은 업무도 기한이 지나면 깨진다(납품은 보내는 것이다). */
export const isBreached = (job: { due: number; done: boolean }, week: number) =>
  !job.done && week > job.due

/** 등급을 낮은 것부터. **만족도는 새 축이 아니라 여기서 파생한다**(약한 고리 규칙 —
 *  가장 낮은 등급이 그 업무의 인상을 정한다). */
export const GRADE_ORDER: readonly Grade[] = ['F', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']

/** 그 업무에서 나온 산출물들의 등급 중 **가장 낮은 것**. 산출물이 없으면 undefined. */
export function satisfaction(grades: readonly Grade[]): Grade | undefined {
  if (grades.length === 0) return undefined
  return grades.reduce((low, g) => (GRADE_ORDER.indexOf(g) < GRADE_ORDER.indexOf(low) ? g : low))
}

/** 만족도 한 줄. ⚠️ 등급 글자만 적지 않는다 — 클라이언트는 등급표를 모르고, 사람 말이
 *  있어야 "다음엔 더 공들일까"가 선택으로 보인다. */
export const SATISFACTION_TEXT: Record<Grade, string> = {
  F: '솔직히 이건 다시 해 주셔야 할 것 같습니다.',
  D: '기대했던 것과는 좀 많이 다르네요.',
  C: '아쉬운 부분이 있지만 이대로 쓰겠습니다.',
  B: '무난하게 잘 받았습니다.',
  A: '깔끔하네요. 마음에 듭니다.',
  S: '기대 이상입니다. 다음에도 부탁드릴게요.',
  SS: '주변에도 소개하고 싶을 만큼 좋습니다.',
  SSS: '이 정도일 줄은 몰랐습니다. 정말 감사합니다.',
}

/** 회신 뒤에 오는 **상대의 답장**. 이 글이 다음 공정의 요청이다.
 *
 * ⚠️ `ad: true` 갈래다 — 답장에 견적보내기가 붙으면 한 업무를 두 번 수주하게 된다.
 *    대신 `jobId`를 지고 있어서 이 글에서도 다음 회신을 보낼 수 있다(스레드가 이어진다). */
export function replyMail(
  job: { id: string; from: string; title: string; channel: Message['channel'] },
  done: Step,
  next: Step,
  week: number,
): Message {
  return {
    // ⚠️ 공정 번호가 id에 들어간다 — 다음 회신의 답장이 **다른 글**이어야 안 읽은 뱃지가 다시 선다.
    id: `re:${job.id}:${next.id}`,
    channel: job.channel,
    from: job.from,
    subject: `Re: ${job.title}`,
    body: `${done.label} 잘 받았습니다. 확인했고 이대로 진행해 주세요.\n다음은 ${next.label} 부탁드립니다.`,
    at: formatWeek(week),
    ad: true,
    jobId: job.id,
  }
}

/** 완료 회신 뒤에 오는 **완료 메일**. 만족도와 **대금이 적히는 유일한 자리**다 —
 *  얼마를 받았는지가 계기판 숫자로만 바뀌면 무엇 때문에 늘었는지 알 수 없다. */
export function doneMail(
  job: { id: string; from: string; title: string; channel: Message['channel'] },
  grade: Grade | undefined,
  fee: number,
  week: number,
): Message {
  return {
    id: `done:${job.id}`,
    channel: job.channel,
    from: job.from,
    subject: `Re: ${job.title} — 잘 받았습니다`,
    body:
      (grade ? `${SATISFACTION_TEXT[grade]}\n(만족도 ${grade})\n` : '작업물 잘 받았습니다.\n') +
      `대금 ${fee.toLocaleString('ko-KR')}원 입금했습니다.`,
    at: formatWeek(week),
    ad: true,
    jobId: job.id,
  }
}
