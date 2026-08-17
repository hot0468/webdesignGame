import { canHandle, orderWeeks, salaryOf, statFor, type EmployeeStats, type RoleId,
  EMPLOYEE_LEVEL,
  TRAIN_STAT_GAIN,
  TRAIN_WEEKS,
} from '../data/employees'
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
  /** 급여협상으로 붙은 **월급 가산**(원/월). ⚠️ 월급 값을 통째로 저장하지 않는 이유는
   *  `salaryOf` 주석에 있다 — 레벨분은 그대로 파생하고 여기 값만 위에 더한다.
   *  협상한 적이 없으면 없다(0과 같지만, 칸이 없는 옛 세이브도 그대로 선다). */
  raise?: number
  /** 요청을 거절·무시당하며 쌓인 **불만**. `GRUDGE_QUIT`에 닿으면 스스로 나간다
   *  (`systems/request.ts`의 `fedUp`). ⚠️ 위기 퇴사와 **다른 축이다** — 그쪽은 평판이
   *  정하고 이쪽은 내가 답한 방식이 정한다. */
  grudge?: number
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

/** 진행 중인 교육 하나. **`Order`와 같은 모양이다** — 둘 다 "그 직원이 N주간 잡혀 있다"는
 *  같은 사실을 말하므로 점유를 재는 규칙(`isBusy`)이 둘을 함께 본다.
 *
 * ⚠️ 오른 레벨을 여기 적지 않는다 — 끝나는 순간 `employee.level`이 오르고 이 줄은 사라진다.
 *    두 곳에 적으면 하나만 지우는 사고가 난다(`Order`와 같은 이유). */
export type Training = {
  employeeId: string
  from: number
  /** **이 주차가 되면 끝난다**(`week >= doneWeek`). */
  doneWeek: number
  /** 왜 잡혀 있는가. ⚠️ **점유 목록을 둘로 나누지 않는 이유**가 이 칸이다 —
   *  잡히는 사유는 달라도 "그 사람이 N주간 다른 일을 못 한다"는 사실은 하나라
   *  `isBusy`가 한 목록만 보면 된다. 끝날 때 하는 일만 여기서 갈린다
   *  (`train`은 레벨이 오르고, `meeting`·`leave`는 그냥 풀린다).
   *
   *  ⚠️ **레벨이 오르는 것은 `train`뿐이다.** `leave`(휴가 요청)를 더할 때 그 규칙을
   *     깨지 말 것 — 쉬다 온 사람이 강해지면 휴가가 교육의 싼 대체재가 된다. */
  kind: 'train' | 'meeting' | 'leave'
  /** 끝날 때 세 스탯이 오르는 폭. **없으면 `TRAIN_STAT_GAIN`**(내가 보내는 평범한 교육).
   *
   *  ⚠️ 이 칸이 있는 이유는 **교육요청**이다(`systems/request.ts`) — 그쪽은 1.5배를
   *     낼지 말지가 확률이고, 그 판정을 **받아들이는 순간 굳혀** 여기 싣는다. 끝나는
   *     자리(`advanceWeek`)에서 다시 굴리면 같은 판을 불러올 때마다 답이 달라진다.
   *  ⚠️ `kind: 'train'`일 때만 뜻이 있다(나머지는 레벨도 스탯도 안 오른다). */
  gain?: number
}

/** 교육이 끝나는 주차. */
export const trainDoneWeek = (week: number): number => week + TRAIN_WEEKS

/** 지금 **잡혀 있는가** — 지시 중이거나 교육 중이면 그렇다.
 *
 * ⚠️ 교육을 점유로 세는 이유: 가르치는 동안 일도 시킬 수 있으면 교육의 값이 돈뿐이라
 *    고민할 것이 없어진다. 그 사람의 한 주를 내는 것이 교육의 진짜 값이다. */
export const isBusy = (
  employeeId: string,
  orders: readonly Order[],
  trainings: readonly Training[] = [],
): boolean =>
  orders.some((o) => o.employeeId === employeeId) ||
  trainings.some((t) => t.employeeId === employeeId)

/** 교육을 시킬 수 있는가 — **한가하고 아직 최고 레벨이 아닐 때**다.
 *  ⚠️ 돈이 되는지는 여기서 보지 않는다(스토어가 소지금을 안다) — 순수 함수는 규칙만 진다. */
export const canTrain = (
  employee: Employee,
  orders: readonly Order[],
  trainings: readonly Training[],
): boolean => employee.level < EMPLOYEE_LEVEL.max && !isBusy(employee.id, orders, trainings)

/** 이번 주에 끝난 점유들(교육·미팅 모두). `finishedOrders`와 같은 규칙(`>=`)이다. */
export const finishedTrainings = (
  trainings: readonly Training[],
  week: number,
): Training[] => trainings.filter((t) => week >= t.doneWeek)

/** 교육을 마친 직원. **레벨 +1과 스탯 상승이 한 자리에서 일어난다** —
 *  둘을 따로 적으면 레벨만 오르고 스탯이 안 오르는 판이 생긴다.
 *
 * ⚠️ 스탯은 **세 개가 함께** 오르고 100에서 잘린다. 종류를 가려 올리면 디블리셔만
 *    교육 가치가 두 배가 된다. ⚠️ 최고 레벨이면 **그대로 돌려준다**(넘어가지 않는다).
 *
 * @param gain 오르는 폭. 안 주면 `TRAIN_STAT_GAIN`(평범한 교육). **교육요청은 1.5배를
 *   받을 수 있고**(`systems/request.ts`), 그 값은 받아들이는 순간 굳어 `Training.gain`에
 *   실려 온다 — 여기서 배수를 다시 계산하지 말 것(굴리는 자리가 둘이 된다). */
export function trained(employee: Employee, gain: number = TRAIN_STAT_GAIN): Employee {
  if (employee.level >= EMPLOYEE_LEVEL.max) return employee
  // ⚠️ 축을 손으로 나열하지 않는다 — 스탯이 하나 늘 때 여기만 빠뜨리면 새 축은
  //    교육해도 안 오르고, 타입 검사는 그것을 못 잡는다(모양은 그대로이므로).
  const up = (v: number) => Math.min(100, v + gain)
  const stats = Object.fromEntries(
    Object.entries(employee.stats).map(([k, v]) => [k, up(v)]),
  ) as EmployeeStats
  return { ...employee, level: employee.level + 1, stats }
}

/** 언제 한가해지는가. 지시도 교육도 아니면 undefined.
 *  ⚠️ 교육도 함께 본다 — `isBusy`가 둘을 세는데 여기만 지시를 보면 "잡혀 있는데
 *     언제까지인지는 모른다"는 화면이 나온다. */
export const busyUntil = (
  employeeId: string,
  orders: readonly Order[],
  trainings: readonly Training[] = [],
): number | undefined =>
  orders.find((o) => o.employeeId === employeeId)?.doneWeek ??
  trainings.find((t) => t.employeeId === employeeId)?.doneWeek

/** 이 직원에게 그 공정을 맡길 수 있는가 — **종류가 맞고 한가할 때**다.
 *  ⚠️ 컴포넌트에서 두 조건을 다시 적지 말 것(버튼도 스토어도 이 한 줄을 쓴다). */
export const canOrder = (
  employee: Employee,
  program: ProgramId,
  orders: readonly Order[],
  trainings: readonly Training[] = [],
): boolean => canHandle(employee.role, program) && !isBusy(employee.id, orders, trainings)

/** 지시가 끝나는 주차. **레벨과 그 공정의 스탯이 함께** 당기되 **하한 1주**다
 *  (`data/employees.ts`의 `orderWeeks`). ⚠️ 스탯은 `statOf(employee, program)`로 낸다 —
 *  등급을 정하는 그 값과 같은 것을 본다(잘하는 사람이 잘 만들고 빨리 끝낸다). */
export const orderDoneWeek = (week: number, level: number, stat: number): number =>
  week + orderWeeks(level, stat)

/** 그 공정의 등급을 정하는 직원 스탯 값. **퍼블리싱 공정만 `publishing`이다**(`statFor`). */
export const statOf = (employee: Employee, program: ProgramId): number =>
  employee.stats[statFor(program)]

/** 이번 주에 끝난 지시들. ⚠️ `>=`다 — 어떤 이유로 주를 건너뛰어도 밀린 지시가 남지 않는다. */
export const finishedOrders = (orders: readonly Order[], week: number): Order[] =>
  orders.filter((o) => week >= o.doneWeek)

/** 월말에 나가는 급여 합계. **사람 수가 정본이다**(`SUBSCRIPTIONS`에 더하지 않는 이유). */
export const payroll = (employees: readonly Employee[]): number =>
  employees.reduce((sum, e) => sum + salaryOf(e.level, e.raise), 0)

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

/** 교육을 받으러 간다는 말. */
export const trainReply = (doneWeek: number): string =>
  `교육 다녀오겠습니다. ${formatWeek(doneWeek)}에 돌아옵니다.`

/** 교육을 마치고 돌아온 말. **오른 레벨을 직접 말한다** — 스탯은 화면에 늘 보이지만
 *  "무엇이 달라졌는지"는 이 한 줄이 아니면 알아채기 어렵다. */
export const trainedReply = (level: number): string =>
  `교육 마치고 왔습니다. 레벨 ${level}이 됐습니다.`

/** 미팅에 다녀오겠다는 말. */
export const meetingReply = (title: string, doneWeek: number): string =>
  `${title} 미팅 다녀오겠습니다. ${formatWeek(doneWeek)}에 돌아옵니다.`
