import { CLIENTS } from '../data/company'
import {
  BUG_BASE,
  BUG_CHANCE_MAX,
  BUG_DELAY_WEEKS,
  BUG_DUE_WEEKS,
  BUG_SKILL_WEIGHT,
  BUG_SYMPTOMS,
  CS_REVISION_WEIGHT,
  PERSONALITIES,
  REVISION_BASE,
  REVISION_CHANCE_MAX,
  REVISION_MAX,
  type Personality,
} from '../data/followup'
import type { Message, Request } from '../data/inbox'
import { formatWeek } from './calendar'
import type { JobKind, Step } from './pipeline'
import { roller } from './seed'

/** 납품 뒤 클라이언트가 **다시 말을 거는 축**의 규칙 전부.
 *
 * ⚠️ 순수 함수다(`src/systems/` 규칙 — React·mutation·`Math.random` 없음).
 *    흔들리는 것은 전부 `seed.ts`의 `roller`가 굴린다.
 *
 * 이 파일이 새 상태 축을 **거의 만들지 않는 것**이 핵심이다:
 *   - 성격은 **업체 이름에서 파생**한다(저장 없음)
 *   - 수정 요청은 이미 있는 `step`/`replied` 두 칸으로 표현한다(`step`을 도로 내린다)
 *   - 버그 리포트는 **미래 주차를 단 메일 한 통**이다(`inbox()`가 이미 `week`으로 거른다 —
 *     `advanceWeek`에 판정 자리를 새로 만들지 않는다) */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** 그 업체 담당자의 성격. **저장하지 않는다** — 업체 이름 하나가 씨앗이다
 *  (`keywords.ts`의 `clientKeywords`, `hire.ts`의 `applicants`와 같은 규칙).
 *  같은 업체는 늘 같은 성격이라 "저 집은 원래 그렇다"가 플레이어의 지식이 된다. */
export const personalityOf = (from: string): Personality =>
  roller(`cl:${from}`).pick(PERSONALITIES)

/** 수정 판정에 넘기는 업무의 최소 모양. ⚠️ 스토어의 `Job` 전체를 받지 않는다
 *  (`pipeline.ts`의 `StepJob`과 같은 규칙). */
export type FollowupJob = {
  id: string
  from: string
  title: string
  kind: JobKind
  step: number
  replied: number
  /** 지금까지 온 수정 요청 수. */
  revisions?: number
}

/** 이번 회신에 **수정 요청이 붙는가.**
 *
 * ⚠️ 팝업은 빠진다 — 이미 클레임이라는 클레임 축이 있고, 등록 공정을 되돌리면
 *    실제로 걸려 있는 팝업과 공정 단계가 어긋나 판정이 거짓말을 하게 된다.
 * ⚠️ 씨앗에 **주차가 들어가지 않는다** — 같은 자리에서 몇 주를 기다렸다 회신해도 답이
 *    같아야 "주차를 넘겨 가며 회신 타이밍을 굴리는" 길이 막힌다. 대신 회신마다·수정
 *    차수마다 달라야 하므로 `replied`와 `revisions`가 함께 들어간다. */
export function needsRevision(job: FollowupJob, cs: number): boolean {
  if (job.kind === 'popup') return false
  const nth = job.revisions ?? 0
  if (nth >= REVISION_MAX) return false
  // 방어 — 되돌릴 공정이 없으면 수정 요청이 성립하지 않는다.
  if (job.step - 1 < 0) return false

  return roller(`rev:${job.id}:${job.replied}:${nth}`).chance(revisionChance(job.from, cs))
}

/** 수정 확률. CS가 깎고 성격이 곱한다. ⚠️ **곱한 뒤에도 다시 자른다** —
 *  픽셀간섭형(1.8배)이 상한을 넘기면 그 업체 일은 안 받는 것이 늘 정답이 된다. */
export const revisionChance = (from: string, cs: number): number =>
  clamp(
    clamp(REVISION_BASE - cs * CS_REVISION_WEIGHT, 0, REVISION_CHANCE_MAX) *
      personalityOf(from).mult,
    0,
    REVISION_CHANCE_MAX,
  )

/** 수정 요청 메일. **이 글이 오면 그 공정이 도로 열린다**(스토어가 `step`을 1 내린다).
 *
 * ⚠️ `ad: true` 갈래다 — 견적보내기가 붙으면 이미 수주한 업무를 다시 수주하게 된다
 *    (`pipeline.ts`의 `replyMail`과 같은 이유). 대신 `jobId`를 져서 이 글에서 다시 회신한다.
 * ⚠️ id에 **차수가 들어간다** — 두 번째 수정 요청이 같은 글이면 목록에 새로 서지도,
 *    안 읽은 뱃지가 다시 뜨지도 않는다.
 * ⚠️ 제목에 `[수정]` 같은 말머리를 붙이지 않는다 — 계기판 한 줄에 서는 제목을 말머리가
 *    밀어내면 업체 이름까지 줄임표를 문다(`winMail`과 같은 주의).
 *
 * `job`은 **아직 차수가 오르기 전**의 것을 받는다(스토어가 판정 직후에 부른다). */
export function revisionMail(
  job: FollowupJob & { channel: Message['channel'] },
  step: Step,
  personality: Personality,
  week: number,
): Message {
  const nth = (job.revisions ?? 0) + 1
  return {
    id: `rev:${job.id}:${step.id}:${nth}`,
    // ⚠️ 그 업무가 온 곳으로 돌아간다 — 게시판 업무의 수정 요청이 메일함으로 새면 안 된다.
    channel: job.channel,
    from: job.from,
    subject: `Re: ${job.title}`,
    body: `${roller(`revtxt:${job.id}:${nth}`).pick(personality.revise)}\n${step.label} 다시 부탁드립니다.`,
    at: formatWeek(week),
    ad: true,
    jobId: job.id,
  }
}

/** 납품 몇 주 뒤에 오는 **크로스브라우징 버그 신고**. 없으면 `undefined`.
 *
 * 완료 회신 시점에 만들어 **미래 주차(`week`)를 달아** 메일 목록에 넣는다 —
 * `inbox()`가 이미 `week`으로 아직 안 온 글을 거르므로 새 판정 자리가 필요 없다.
 *
 * ⚠️ `CLIENTS`에 없는 업체에는 **절대 안 만든다.** `fix` 업무는 에디터에서 FTP로 고치는데
 *    에디터는 `CLIENTS[].ftp`가 있는 업체만 목록에 세운다 — 신규 고객에게 신고를 보내면
 *    받고도 **고칠 수 없는 업무**가 생겨 기한이 지나 평판만 깎인다.
 * ⚠️ 버그 수정 업무(`bug:`)는 다시 버그를 낳지 않는다 — 무한 연쇄를 막는 유일한 문이다.
 *
 * 신고 글은 `Request`다(`ad`가 아니다 — 고칠 일이 생겼다). `channel: 'board'`라
 * `JobActions`가 **확인 버튼 하나만** 그린다: 계약 업체의 요청이라 거절이 없고,
 * 안 받고 버티면 기한이 지나 **기존 계약 파기 판정**이 평판을 깎는다(그것이 방치의 대가다). */
export function bugReport(
  job: { id: string; from: string; title: string; kind: JobKind },
  week: number,
  codingSkill: number,
): Request | undefined {
  if (job.kind !== 'site' && job.kind !== 'fix') return undefined
  if (job.id.startsWith('bug:')) return undefined
  if (!CLIENTS.some((c) => c.name === job.from)) return undefined

  // ⚠️ 롤러 하나에서 확률과 문안을 함께 뽑는다 — 씨앗이 `bug:<jobId>` 하나라
  //    같은 업무의 신고는 늘 같은 증상이다(다시 그릴 때마다 말이 바뀌지 않는다).
  const r = roller(`bug:${job.id}`)
  if (!r.chance(bugChance(job.from, codingSkill))) return undefined
  const at = week + BUG_DELAY_WEEKS

  return {
    id: `bug:${job.id}`,
    // ⚠️ 유지보수 의뢰라 고객게시판이다(신규 의뢰가 아니다).
    channel: 'board',
    from: job.from,
    subject: `${job.title} 오류 수정`,
    body: `얼마 전에 받은 건으로 연락드립니다.\n${r.pick(BUG_SYMPTOMS)}\n확인해서 고쳐 주실 수 있을까요.`,
    at: formatWeek(at),
    // **이 칸이 도착 시점을 만든다.** 없으면 완료 회신과 동시에 신고가 서서
    // "몇 주 뒤에 돌아온다"는 이 기능의 뜻이 사라진다.
    week: at,
    dueWeeks: BUG_DUE_WEEKS,
    kind: 'fix',
  }
}

/** 버그 확률. 코딩 숙련도가 깎고 성격이 곱한다(`revisionChance`와 같은 모양). */
export const bugChance = (from: string, codingSkill: number): number =>
  clamp(
    clamp(BUG_BASE - codingSkill * BUG_SKILL_WEIGHT, 0, 1) * personalityOf(from).mult,
    0,
    BUG_CHANCE_MAX,
  )
