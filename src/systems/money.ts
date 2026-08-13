import { salaryOf } from '../data/employees'
import {
  BASE_FEE,
  BREACH_REPUTATION_LOSS,
  GRADE_REWARD,
  SUBSCRIPTIONS,
  WEEKS_PER_MONTH,
  type Grade,
} from '../data/game'
import type { Channel, Message } from '../data/inbox'
import { formatWeek } from './calendar'
import { payroll, type Employee } from './employee'
import type { JobKind } from './pipeline'

/** 돈과 평판이 움직이는 규칙. **완료 · 파기 · 월말 정산 셋뿐이다.**
 *
 * ⚠️ 순수 함수다(`src/systems/` 규칙 — React·mutation·Math.random 없음).
 * ⚠️ 수치는 전부 `data/game.ts`에서 온다 — 여기서 숫자를 지어내지 말 것.
 *
 * ⚠️ **평판은 여기서 clamp하지 않는다.** 0~100 상한·하한은 스토어가 적용한다(위기 판정과
 *    같은 자리에서 한 번만 자르지 않으면 두 곳이 서로 다른 값을 믿게 된다). */

/** 완료 회신이 지급하는 대금과 평판 변화. 등급이 없으면(퍼블리싱만 있는 업무) **기준선**이다. */
export function reward(kind: JobKind, grade: Grade | undefined) {
  const g = grade ? GRADE_REWARD[grade] : GRADE_REWARD.C
  return { fee: Math.round(BASE_FEE[kind] * g.fee), reputation: g.reputation }
}

/** 마감을 넘긴 업무의 결과. 대금은 **0이다** — 못 지킨 일에는 돈이 나오지 않는다. */
export const breach = () => ({ fee: 0, reputation: -BREACH_REPUTATION_LOSS })

/** 이 주가 월말인가. ⚠️ 달력 환산과 **같은 단위**를 쓴다(`WEEKS_PER_MONTH`) —
 *  월말 주차가 달마다 흔들리지 않는 이유가 이 한 줄이다. */
export const isSettleWeek = (week: number) => week % WEEKS_PER_MONTH === 0

/** 월말에 나가는 고정 지출 합계 — **월정액 + 직원 급여**다.
 *
 * ⚠️ 급여를 `SUBSCRIPTIONS`에 더하지 않는다(`data/game.ts` 주석) — 그 표는 늘 같은 두 줄이고
 *    급여는 **사람 수와 레벨이 매달 바뀐다**. 정본은 직원 목록 하나여야 뽑고 내보낸 결과가
 *    다음 정산에 그대로 나타난다. */
export const monthlyCost = (employees: readonly Employee[] = []) =>
  SUBSCRIPTIONS.reduce((sum, s) => sum + s.cost, 0) + payroll(employees)

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 마감을 넘겨 계약이 깨졌다는 통보. ⚠️ `ad: true` 갈래다(고를 것이 없는 글).
 *  **`jobId`는 달지 않는다** — 끝난 업무의 글에서 회신 버튼이 다시 서면 안 된다. */
export function breachMail(
  job: { id: string; from: string; title: string; channel: Channel },
  week: number,
): Message {
  return {
    id: `breach:${job.id}`,
    channel: job.channel,
    from: job.from,
    subject: `Re: ${job.title} — 이번 건은 없던 일로 하겠습니다`,
    body: '약속하신 기한이 지났습니다. 더 기다리기 어려워 이번 건은 취소하겠습니다.\n대금은 지급되지 않습니다.',
    at: formatWeek(week),
    ad: true,
  }
}

/** 월말 정산 통보 — 스펙의 **"유지보수보고서"**다. 지출 내역과 남은 소지금을 함께 적는다.
 *  ⚠️ 소지금이 음수가 되는 것이 곧 파산이므로, **이 메일이 그 사실을 알리는 자리**다. */
export function settleMail(
  week: number,
  moneyAfter: number,
  employees: readonly Employee[] = [],
): Message {
  // 급여는 **사람마다 한 줄**이다 — 합계만 적으면 누구를 내보내면 얼마가 주는지 알 수 없다.
  const lines = [
    ...SUBSCRIPTIONS.map((s) => `- ${s.label} ${won(s.cost)}`),
    ...employees.map((e) => `- ${e.name} 급여 ${won(salaryOf(e.level))}`),
  ].join('\n')
  return {
    id: `settle:${week}`,
    channel: 'mail',
    from: '유지보수보고서',
    subject: `${formatWeek(week)} 월말 정산`,
    body:
      `이번 달 고정 지출입니다.\n${lines}\n합계 ${won(monthlyCost(employees))}\n\n` +
      (moneyAfter < 0
        ? `정산 후 잔액 ${won(moneyAfter)} — 지급하지 못한 금액이 있습니다.`
        : `정산 후 잔액 ${won(moneyAfter)}.`),
    at: formatWeek(week),
    ad: true,
  }
}
