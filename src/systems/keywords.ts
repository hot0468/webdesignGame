import {
  findKeyword,
  KEYWORD_SHIFT,
  KEYWORDS,
  MEETING_REVEAL,
  MEETING_TALK,
  SITE_KEYWORDS,
  type KeywordId,
} from '../data/keywords'
import type { Grade } from '../data/game'
import type { Message } from '../data/inbox'
import { formatWeek } from './calendar'

/** 시안 키워드의 규칙 전부. **순수 함수다**(`src/systems/` 규칙 — React·mutation 없음).
 *
 * ⚠️ **`Math.random`이 없다.** 클라이언트가 원하는 키워드는 무작위처럼 보여야 하지만
 *    같은 업무는 늘 같은 답이어야 한다 — 다시 그릴 때마다 답이 바뀌면 미팅에서 알아낸
 *    키워드가 거짓말이 되고, 테스트도 쓸 수 없다. 그래서 **씨앗은 업무 id에서 뽑는다**
 *    (이미 있는 값이라 새 상태 축을 만들지 않고, 세이브에도 아무것도 더하지 않는다). */

/** 문자열 → 32비트 씨앗(FNV-1a). ⚠️ 암호용이 아니다 — 필요한 것은 "id가 다르면 답도
 *  다르다"뿐이고, 짧고 결정적이면 충분하다. */
function seedOf(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** 씨앗을 한 걸음 굴린다(mulberry32). 0~1 미만을 낸다. */
function next(seed: number): [number, number] {
  let t = (seed + 0x6d2b79f5) >>> 0
  let x = Math.imul(t ^ (t >>> 15), 1 | t)
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
  return [((x ^ (x >>> 14)) >>> 0) / 4294967296, t]
}

/** 그 업무의 클라이언트가 **정말 원하는 키워드 `SITE_KEYWORDS`개**.
 *
 * ⚠️ 화면에 이대로 다 보이면 안 된다 — 플레이어가 보는 것은 `revealed`가 자른 앞부분뿐이다
 *    (창에서 이 함수를 직접 부르지 말고 스토어가 잘라 둔 값을 쓴다).
 * ⚠️ 뽑기는 **자리 교환(Fisher-Yates)**이라 같은 키워드가 두 번 나오지 않는다. */
export function clientKeywords(jobId: string): KeywordId[] {
  const pool = KEYWORDS.map((k) => k.id as KeywordId)
  let seed = seedOf(jobId)
  for (let i = pool.length - 1; i > 0; i--) {
    const [r, s] = next(seed)
    seed = s
    const j = Math.floor(r * (i + 1))
    ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
  }
  return pool.slice(0, SITE_KEYWORDS)
}

/** 기획력 → 미팅에서 알아내는 개수. 표가 오름차순이라 "조건을 만족하는 마지막 칸"이 답이다
 *  (`companyGrade`와 같은 모양 — 표를 읽는 규칙을 둘로 만들지 않는다). */
export const revealCount = (planning: number): number =>
  MEETING_REVEAL.reduce<number>(
    (best, r) => (planning >= r.minPlanning ? r.count : best),
    MEETING_REVEAL[0].count,
  )

/** 미팅에서 **알아낸 만큼만** 잘라 준다. 순서는 `clientKeywords`가 이미 섞어 놨으므로
 *  앞에서 자르는 것으로 충분하다(어느 것을 알아냈는지도 업무마다 다르다). */
export const revealedKeywords = (jobId: string, planning: number): KeywordId[] =>
  clientKeywords(jobId).slice(0, revealCount(planning))

/** 고른 것 중 **맞춘 개수**. ⚠️ 중복은 세지 않는다(같은 키워드를 두 번 고를 수 없게
 *  화면이 막지만, 규칙 쪽에서도 한 번만 센다). */
export const hitCount = (picked: readonly KeywordId[], wanted: readonly KeywordId[]): number =>
  new Set(picked.filter((k) => wanted.includes(k))).size

/** 등급을 몇 칸 밀 것인가. 표(`KEYWORD_SHIFT`) 밖으로 나가지 않게 양끝을 막는다. */
export const keywordShift = (hits: number): number =>
  KEYWORD_SHIFT[Math.min(KEYWORD_SHIFT.length - 1, Math.max(0, hits))]!

/** 미팅에서 오가는 말 한 줄. `who`가 말풍선의 좌우를 정한다. */
export type MeetingLine = { who: 'client' | 'me'; text: string }

/** 미팅 대화 대본. **알아낸 키워드가 곧 클라이언트가 하는 말이다** — 요구를 알아들은
 *  만큼만 대사가 늘고, 못 알아들은 것은 애초에 말이 나오지 않는다(기획력이 정한다).
 *
 * ⚠️ 순수 함수다. 대사의 정본은 `data/keywords.ts`이고 여기서는 조립만 한다.
 * ⚠️ 알아낸 것이 없어도 **인사는 오간다** — 빈 창을 띄우면 행동력만 버린 것처럼 보인다. */
export function meetingScript(from: string, revealed: readonly KeywordId[]): MeetingLine[] {
  return [
    { who: 'client', text: MEETING_TALK.greet.replace('{from}', from) },
    { who: 'me', text: MEETING_TALK.ask },
    ...revealed.map((id): MeetingLine => ({ who: 'client', text: findKeyword(id).quote })),
    { who: 'me', text: MEETING_TALK.wrap },
    { who: 'client', text: MEETING_TALK.close },
  ]
}

/** 미팅이 잡혔음을 알리는 글. ⚠️ `ad: true` 갈래다 — 미팅 알림에 견적보내기가 붙으면
 *  이미 수주한 업무를 다시 수주하게 된다(`replyMail`과 같은 이유).
 *
 * 채널은 **그 업무가 온 곳**이다(게시판 업무의 미팅이 메일함으로 새지 않게). */
export function meetingMail(
  job: { id: string; from: string; title: string; channel: Message['channel'] },
  week: number,
): Message {
  return {
    id: `mt:${job.id}`,
    channel: job.channel,
    from: job.from,
    subject: `[미팅] ${job.title}`,
    body:
      '작업 시작 전에 저희가 원하는 분위기를 한번 말씀드리고 싶습니다.\n' +
      '이번 주에 잠깐 시간 내 주실 수 있을까요? 아래에서 바로 시작하시면 됩니다.',
    at: formatWeek(week),
    ad: true,
    jobId: job.id,
    // 이 표식 하나가 **그 글에 미팅 버튼을 세운다**(`JobActions`). 글 id로 알아내지 않는다 —
    // 관계는 한 방향으로 적고, id 규칙이 바뀌어도 화면이 조용히 어긋나지 않는다.
    meeting: true,
  }
}

/** 등급을 낮은 것부터. ⚠️ `pipeline.ts`의 `GRADE_ORDER`와 **같은 줄**이어야 한다 —
 *  만족도(약한 고리)와 키워드 보정이 다른 순서를 믿으면 같은 등급이 두 뜻을 가진다.
 *  `keywords.test.ts`가 두 줄이 같은지 지킨다. */
export const GRADE_LADDER: readonly Grade[] = ['F', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']

/** 등급을 `shift` 칸 민다. 사다리 밖으로는 나가지 않는다(F 밑도 SSS 위도 없다). */
export const shiftGrade = (grade: Grade, shift: number): Grade => {
  const i = GRADE_LADDER.indexOf(grade)
  return GRADE_LADDER[Math.min(GRADE_LADDER.length - 1, Math.max(0, i + shift))]!
}
