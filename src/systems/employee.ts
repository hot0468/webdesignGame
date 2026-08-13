import { canHandle, orderWeeks, salaryOf, statFor, type EmployeeStats, type RoleId } from '../data/employees'
import type { Grade } from '../data/game'
import type { Message } from '../data/inbox'
import type { ProgramId } from '../data/programs'
import { formatWeek } from './calendar'

/** 직원 규칙의 정본 — 지시할 수 있는가 · 언제 끝나는가 · 누가 먼저 떠나는가.
 *
 * ⚠️ 순수 함수다(`src/systems/` 규칙 — React·mutation·`Math.random` 없음).
 * ⚠️ 수치는 전부 `data/employees.ts`에서 온다 — 여기서 숫자를 지어내지 말 것. */

/** 고용된 직원 하나. **지시 중이면 `busyUntil`이 선다**(그 주차까지 점유).
 *
 * ⚠️ 점유는 별도의 `busy` 플래그가 아니라 **끝나는 주차 하나**다 — 관계를 한 방향으로만
 *    적어야 "바쁜데 끝나는 주가 없다" 같은 어긋난 상태가 생기지 않는다. */
export type Employee = {
  id: string
  name: string
  role: RoleId
  level: number
  stats: EmployeeStats
  /** 고용한 주차. 메신저 첫 인사와 재직 기간이 여기서 나온다. */
  hiredWeek: number
}

/** 진행 중인 지시 하나. **직원과 업무를 잇는 유일한 줄이다.**
 *
 * ⚠️ 직원 쪽에 `busyUntil`을 두지 않고 여기 두는 이유: 지시가 끝나면 이 줄이 사라지고
 *    직원은 자동으로 한가해진다. 두 곳에 적으면 하나를 지우고 다른 하나를 남기는 사고가 난다. */
export type Order = {
  /** 그 지시를 받은 직원. */
  employeeId: string
  jobId: string
  /** 맡긴 공정의 프로그램. 완료 시점에 그 공정을 올린다. */
  program: ProgramId
  /** 맡긴 공정의 이름(메신저 대화에 적힌다). */
  label: string
  /** 지시한 주차. */
  from: number
  /** **이 주차가 되면 끝난다**(`week >= doneWeek`). 지시받은 주 + N. */
  doneWeek: number
  /** 그 직원의 스탯이 정한 등급. ⚠️ **지시하는 순간 굳는다** — 나중에 직원이 성장해도
   *  이미 맡긴 일의 결과가 바뀌지 않는다(제작 결과가 파일에 굳는 것과 같은 규칙). */
  grade: Grade
}

/** 지금 지시 중인가. **`orders`가 정본이다**(직원 쪽에 플래그를 두지 않는다). */
export const isBusy = (employeeId: string, orders: readonly Order[]): boolean =>
  orders.some((o) => o.employeeId === employeeId)

/** 언제 한가해지는가. 지시 중이 아니면 undefined. */
export const busyUntil = (employeeId: string, orders: readonly Order[]): number | undefined =>
  orders.find((o) => o.employeeId === employeeId)?.doneWeek

/** 이 직원에게 그 공정을 맡길 수 있는가 — **종류가 맞고 한가할 때**다.
 *  ⚠️ 컴포넌트에서 두 조건을 다시 적지 말 것(버튼도 스토어도 이 한 줄을 쓴다). */
export const canOrder = (
  employee: Employee,
  program: ProgramId,
  orders: readonly Order[],
): boolean => canHandle(employee.role, program) && !isBusy(employee.id, orders)

/** 지시가 끝나는 주차. 레벨이 높을수록 빠르되 **하한 1주**다(`data/employees.ts`). */
export const orderDoneWeek = (week: number, level: number): number => week + orderWeeks(level)

/** 그 공정의 등급을 정하는 직원 스탯 값. **퍼블리싱 공정만 `publishing`이다**(`statFor`). */
export const statOf = (employee: Employee, program: ProgramId): number =>
  employee.stats[statFor(program)]

/** 이번 주에 끝난 지시들. ⚠️ `>=`다 — 어떤 이유로 주를 건너뛰어도 밀린 지시가 남지 않는다. */
export const finishedOrders = (orders: readonly Order[], week: number): Order[] =>
  orders.filter((o) => week >= o.doneWeek)

/** 월말에 나가는 급여 합계. **사람 수가 정본이다**(`SUBSCRIPTIONS`에 더하지 않는 이유). */
export const payroll = (employees: readonly Employee[]): number =>
  employees.reduce((sum, e) => sum + salaryOf(e.level), 0)

/** 평판 위기에 **먼저 떠나는 사람**. 설계 결정표대로 **레벨 높은 순**이다 —
 *  가라앉는 배에서 갈 곳이 있는 사람부터 나간다. 없으면 undefined(더 나갈 사람이 없다).
 *
 * ⚠️ 레벨이 같으면 **먼저 뽑은 사람**이 남는다(목록 순서가 가르는 유일한 자리다) —
 *    무작위로 고르면 같은 판을 다시 불러왔을 때 다른 사람이 나간다. */
export function quitter(employees: readonly Employee[]): Employee | undefined {
  return employees.reduce<Employee | undefined>(
    (top, e) => (!top || e.level > top.level ? e : top),
    undefined,
  )
}

/** 퇴사 통보. ⚠️ 메일이 아니라 **메신저 마지막 말**로 갈 수도 있지만, 방 자체가 사라지므로
 *  받은편지함에 남긴다 — 사라진 사람의 대화방을 열어 이유를 읽을 수는 없다. */
export function quitMail(employee: Employee, week: number): Message {
  return {
    id: `quit:${employee.id}:${week}`,
    channel: 'mail',
    from: employee.name,
    subject: '죄송합니다, 그만두겠습니다',
    body:
      '요즘 회사 사정이 좋지 않다는 이야기를 들었습니다.\n' +
      '더 버티기가 어려워 이번 주까지만 일하겠습니다. 그동안 감사했습니다.',
    at: formatWeek(week),
    ad: true,
  }
}

/** 메신저 대화 한 줄. **직원이 한 말만 쌓인다** — 내가 한 말은 버튼을 누른 것이고
 *  그 결과가 곧 `orders`에 남으므로, 같은 사실을 두 벌로 적지 않는다.
 *  ⚠️ 방은 `employeeId`가 가른다(방 하나 = 직원 하나). */
export type Chat = { employeeId: string; week: number; text: string }

/** 지시를 받은 직원의 대답. **메신저 대화 한 줄**이고 메일이 아니다 —
 *  업무 지시와 보고는 메신저가 진다(설계 결정표). */
export const orderReply = (order: Order): string =>
  `${order.label} 맡겠습니다. ${formatWeek(order.doneWeek)}까지 끝내 드리겠습니다.`

/** 끝냈다는 보고. 등급을 숫자로 적지 않고 **무엇을 언제 끝냈는지**만 말한다 —
 *  등급은 만든 파일에 굳어 있고, 그 파일을 회신하는 것은 여전히 사람의 손이다. */
export const doneReply = (order: Order, week: number): string =>
  `${order.label} 끝냈습니다. (${formatWeek(week)}) 확인하시고 회신해 주세요.`
