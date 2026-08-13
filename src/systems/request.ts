import {
  FEEDBACK_SUCCESS,
  GRUDGE_PER_REFUSAL,
  GRUDGE_QUIT,
  LEAVE_WEEKS,
  RAISE_AMOUNT,
  REQUEST_CHANCE,
  REQUEST_EXPIRE_WEEKS,
  TRAIN_REQUEST_MULT,
  TRAIN_REQUEST_SUCCESS,
  TRAIN_STAT_GAIN,
} from '../data/employees'
import type { Grade } from '../data/game'
import type { Message } from '../data/inbox'
import { formatDate, formatWeek } from './calendar'
import { GRADE_ORDER } from './pipeline'
import { roller } from './seed'
import type { Employee } from './employee'

/** 직원 요청사항의 규칙 전부. **순수 함수다**(`src/systems/` 규칙 — React·mutation 없음).
 *
 * ⚠️ **`Math.random`이 없다.** 발생도 확률 판정도 전부 `systems/seed.ts`의 `roller`가
 *    씨앗을 받아 굴린다 — 씨앗은 **주차 + 직원 id**처럼 이미 있는 값에서 파생하므로
 *    같은 판을 불러오면 늘 같은 요청이 같은 결과를 낸다(지원자와 같은 규칙).
 * ⚠️ 수치는 전부 `data/employees.ts`에서 온다 — 여기서 숫자를 지어내지 말 것.
 *
 * 이 축이 하는 일: 지시·교육은 **내가 사람을 쓰는** 방향이고 요청은 그 반대다.
 * 그래서 **거절에 대가가 있어야** 한다(설계 확정) — 없으면 전부 거절이 늘 정답이라
 * 선택이 아니라 알림이 된다. 대가는 불만(`grudge`)이고 임계를 넘으면 스스로 나간다. */

/** 요청 네 갈래. ⚠️ **답하는 방식이 아니라 성격이 갈린다** — 넷 다 받거나 거절하지만
 *  받았을 때 무는 것이 각자 다르다(휴가=시간 / 급여=돈 / 피드백=행동력 / 교육=돈+시간). */
export type RequestKind = 'leave' | 'raise' | 'feedback' | 'training'

/** 답을 기다리는 요청 하나. **`chats`(대화)와 다른 축이다** — 대화는 흘러가는 글이고
 *  요청은 **답을 골라야 사라지는 것**이라, 한 목록에 섞으면 무엇이 아직 안 끝났는지를
 *  대화 전체를 훑어야 알게 된다.
 *
 * ⚠️ 답한 요청은 이 목록에서 **사라진다**(대신 대화에 한 줄이 남는다) — 상태를 두 곳에
 *    적지 않는다(`Order`·`Training`과 같은 규칙). */
export type EmployeeRequest = {
  /** `req:<주차>:<직원 id>`. 한 직원이 한 주에 두 건을 보내지 않는다는 사실이 id에 있다. */
  id: string
  employeeId: string
  kind: RequestKind
  /** 보낸 주차. */
  week: number
  /** **이 주차를 넘기면 무시한 것이다**(`week > expires`면 사라지고 불만이 쌓인다). */
  expires: number
  /** 피드백 요청이 가리키는 작업물. ⚠️ 다른 갈래에는 없다 —
   *  **고칠 것이 없는데 고쳐 달라는 요청은 뜻이 없으므로** 대상이 없으면 이 갈래가
   *  아예 생기지 않는다(`makeRequest`가 후보에서 뺀다). */
  target?: { fileId: string; name: string; grade: Grade }
}

/** 피드백이 올릴 수 있는 작업물 하나. 스토어의 `files`·`drafts`·`slides`가 **모양이 같아**
 *  한 타입으로 받는다 — 어느 목록에서 왔는지는 스토어가 알고, 규칙은 몰라도 된다. */
export type Workable = { id: string; name: string; grade: Grade }

/** 등급 사다리의 꼭대기인가. **`GRADE_ORDER`가 사다리의 단일 출처다** —
 *  여기서 'SSS'를 글자로 적으면 두 번째 출처가 생긴다. */
const isTop = (grade: Grade) => GRADE_ORDER.indexOf(grade) >= GRADE_ORDER.length - 1

/** 등급 한 칸 올리기. ⚠️ **사다리 밖으로 나가지 않는다**(꼭대기면 그대로다). */
export const raiseGrade = (grade: Grade): Grade =>
  GRADE_ORDER[Math.min(GRADE_ORDER.length - 1, GRADE_ORDER.indexOf(grade) + 1)]!

/** 그 주에 그 직원이 보내는 요청. **없으면 undefined다.**
 *
 * 씨앗은 `req:<주차>:<직원 id>` — 주차와 직원 id는 이미 있는 값이라 **새 상태 축이
 * 필요 없다**(지원자와 같은 규칙). 같은 주를 다시 계산해도 같은 답이 나온다.
 *
 * ⚠️ 후보에서 빠지는 갈래들이 있다(있지도 않은 것을 요청하면 답이 하나뿐이라 선택이
 *    아니다): **교육요청**은 최고 레벨이면 빠지고, **피드백**은 올릴 작업물이 없거나
 *    남은 것이 다 사다리 꼭대기면 빠진다. 넷이 다 빠지면 요청 자체가 없다.
 *
 * @param busy 지금 잡혀 있는가(지시·교육·미팅·휴가). ⚠️ 잡힌 사람은 요청을 보내지
 *   않는다 — 휴가 중에 휴가를 달라거나 교육 중에 교육을 보내 달라는 말이 성립하지 않고,
 *   받아 줘도 이미 잡혀 있어 아무 일도 일어나지 않는다. */
export function makeRequest(
  employee: Employee,
  week: number,
  opts: { busy: boolean; maxLevel: boolean; works: readonly Workable[] },
): EmployeeRequest | undefined {
  if (opts.busy) return undefined
  const r = roller(`req:${week}:${employee.id}`)
  // ⚠️ 발생 판정을 **먼저** 굴린다 — 후보 목록이 사람마다 달라도 "요청이 오는가"는
  //    같은 확률이어야 한다(목록 길이가 확률을 흔들면 수치가 뜻을 잃는다).
  if (!r.chance(REQUEST_CHANCE)) return undefined

  // 피드백이 올릴 수 있는 것 = **아직 꼭대기가 아닌 작업물**.
  const fixable = opts.works.filter((w) => !isTop(w.grade))
  const kinds: RequestKind[] = ['leave', 'raise']
  if (fixable.length > 0) kinds.push('feedback')
  if (!opts.maxLevel) kinds.push('training')

  const kind = r.pick(kinds)
  return {
    id: `req:${week}:${employee.id}`,
    employeeId: employee.id,
    kind,
    week,
    expires: week + REQUEST_EXPIRE_WEEKS,
    ...(kind === 'feedback' && {
      target: (() => {
        const w = r.pick(fixable)
        return { fileId: w.id, name: w.name, grade: w.grade }
      })(),
    }),
  }
}

/** 피드백이 **실제로 한 칸 올렸는가**. 씨앗은 그 요청의 id라 **다시 눌러도 답이 같다** —
 *  실패한 뒤 되돌아가 다시 굴릴 길이 없어야 확률이 도박으로 성립한다. */
export const feedbackWorks = (requestId: string): boolean =>
  roller(`fb:${requestId}`).chance(FEEDBACK_SUCCESS)

/** 교육요청이 **1.5배를 냈는가**. 실패해도 평소 효과는 얻는다(`trainRequestGain`). */
export const trainRequestWorks = (requestId: string): boolean =>
  roller(`tr:${requestId}`).chance(TRAIN_REQUEST_SUCCESS)

/** 교육요청으로 오르는 스탯 폭.
 *
 * ⚠️ **실패해도 0이 아니다**(설계 결정): 실패가 0이면 교육비 50만 + 한 주 점유를 내고
 *    아무것도 못 얻는 판이 40% 확률로 생겨, 기대값이 내가 그냥 보내는 교육보다 낮아진다.
 *    그러면 이 요청은 받을 이유가 없고 늘 거절이 정답이 된다 — 요청 축을 만든 이유가
 *    통째로 사라지는 것이다. 그래서 **실패의 벌은 기대만큼 못 얻는 것**이고, 받아 주는
 *    쪽의 기대값은 평범한 교육보다 늘 높다(대신 불만은 안 쌓인다는 값이 따로 있다). */
export const trainRequestGain = (success: boolean): number =>
  success ? Math.round(TRAIN_STAT_GAIN * TRAIN_REQUEST_MULT) : TRAIN_STAT_GAIN

/** 휴가가 끝나는 주차. ⚠️ 점유는 `Training`(`kind: 'leave'`)이 진다 — 목록을 새로
 *  만들지 않는다(사유는 달라도 "N주간 못 쓴다"는 사실은 하나다). */
export const leaveDoneWeek = (week: number): number => week + LEAVE_WEEKS

/** 협상 뒤의 급여 가산. ⚠️ 월급 값을 통째로 굳히지 않는 이유는 `salaryOf` 주석에 있다. */
export const raisedBy = (raise = 0): number => raise + RAISE_AMOUNT

/** 거절·무시가 쌓인 뒤의 불만. */
export const grudged = (grudge = 0): number => grudge + GRUDGE_PER_REFUSAL

/** 불만으로 **나가는가**. ⚠️ 위기 퇴사(`quitter`)와 **다른 이유**다 — 그쪽은 회사가
 *  가라앉아서 나가고 이쪽은 자기 말이 안 받아들여져서 나간다. 나가는 자리는 같지만
 *  (`advanceWeek`) 통보 메일이 갈린다(`grudgeQuitMail`). */
export const fedUp = (grudge = 0): boolean => grudge >= GRUDGE_QUIT

/** 요청이 답을 기다리다 **끝나 버린** 것들. `finishedOrders`와 같은 규칙이다. */
export const expiredRequests = (
  requests: readonly EmployeeRequest[],
  week: number,
): EmployeeRequest[] => requests.filter((q) => week > q.expires)

/** ── 사람 말 ────────────────────────────────────────────────────────────
 *  ⚠️ 요청 갈래마다 문안이 다르다 — "요청이 왔다"는 알림만으로는 무엇을 저울에
 *     올리는지 알 수 없다. 대가(주차·금액)는 화면의 버튼이 적고, 여기는 **왜**를 적는다. */

/** 요청이 왔다는 말. 대화에 한 줄로 남고, 답할 판은 그 아래에 따로 선다. */
export function requestText(request: EmployeeRequest): string {
  switch (request.kind) {
    case 'leave':
      return `대표님, 개인 사정으로 ${LEAVE_WEEKS}주만 휴가를 쓰고 싶습니다. 가능할까요?`
    case 'raise':
      return '요즘 일이 많아졌는데, 급여를 조금만 올려 주실 수 있을까요?'
    case 'feedback':
      return `${request.target?.name ?? '작업물'} 한번 봐 주실 수 있나요? 손볼 데가 있는 것 같은데 혼자서는 잘 모르겠습니다.`
    case 'training':
      return '가고 싶은 교육이 있습니다. 보내 주시면 확실히 배워 오겠습니다.'
  }
}

/** 받아들였을 때의 대답. ⚠️ **결과를 말한다** — 요청 판은 답하면 사라지므로,
 *  무슨 일이 일어났는지를 남기는 자리는 이 한 줄뿐이다. */
export function acceptedText(request: EmployeeRequest, week: number, ok: boolean): string {
  switch (request.kind) {
    case 'leave':
      return `감사합니다. ${formatDate(leaveDoneWeek(week))}까지 다녀오겠습니다.`
    case 'raise':
      return `감사합니다. 앞으로도 열심히 하겠습니다. (월 ${RAISE_AMOUNT.toLocaleString()}원 인상)`
    // 피드백은 **성패를 그 자리에서 말한다** — 행동력을 이미 냈으므로 무엇을 얻었는지가
    // 바로 보여야 다음에 또 받아 줄지를 저울에 올릴 수 있다.
    case 'feedback':
      return ok
        ? `봐 주신 대로 고쳤습니다. ${request.target?.name ?? '작업물'}이 한 단계 나아졌습니다.`
        : `조언 감사합니다. 고쳐 봤는데 이번엔 크게 나아지진 않았네요. 죄송합니다.`
    case 'training':
      return `감사합니다. ${formatWeek(week)}에 교육 다녀오겠습니다.`
  }
}

/** 거절당했을 때의 대답. ⚠️ **불만이 쌓였다는 것이 읽혀야 한다** — 대가가 보이지 않으면
 *  거절이 공짜로 느껴지고, 어느 날 갑자기 퇴사 메일만 온다. */
export const refusedText = (grudge: number): string =>
  fedUp(grudge)
    ? '알겠습니다. …더는 말씀드릴 것도 없네요.'
    : `알겠습니다. 어쩔 수 없죠. (${grudge}번째로 거절당했다)`

/** 답을 못 받고 끝난 요청. 무시도 거절과 **같은 값**을 문다 — 다르게 매기면
 *  "답하지 않는 것"이 거절보다 싼 길이 되어 요청 판이 무시된다. */
export const ignoredText = (grudge: number): string =>
  fedUp(grudge)
    ? '지난번 말씀드린 건은… 답을 못 들었습니다. 더 기다리지 않겠습니다.'
    : `지난번 말씀드린 건은 없던 것으로 하겠습니다. (${grudge}번째로 거절당했다)`

/** 불만이 차서 나가는 사람의 통보. ⚠️ 위기 퇴사(`quitMail`)와 **다른 글이어야 한다** —
 *  둘이 같은 문안이면 화면에서 "회사가 망해서"와 "내 말을 안 들어서"가 구별되지 않고,
 *  플레이어는 무엇을 고쳐야 하는지 알 수 없다. */
export function grudgeQuitMail(employee: Employee, week: number): Message {
  return {
    id: `grudge:${employee.id}:${week}`,
    channel: 'mail',
    from: employee.name,
    subject: '퇴사하겠습니다',
    body:
      '그동안 몇 번 말씀을 드렸지만 받아들여지지 않았습니다.\n' +
      '여기서는 더 일하기 어려울 것 같아 그만두겠습니다. 그동안 감사했습니다.',
    at: formatWeek(week),
    ad: true,
  }
}
