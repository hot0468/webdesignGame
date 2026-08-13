import { beforeEach, describe, expect, it } from 'vitest'
import {
  APPLICANTS_PER_POST,
  ORDER_AP,
  ORDER_QUALITY,
  orderWeeks,
  POST_AP,
  salaryOf,
  TRAIN_COST,
  TRAIN_STAT_GAIN,
  TRAIN_WEEKS,
} from './data/employees'
import {
  companyGrade,
  CRISIS_WEEKS_TO_SHUTDOWN,
  INITIAL_GAME,
  REPUTATION_CRISIS,
  WEEKS_PER_MONTH,
} from './data/game'
import { gradeOf } from './systems/craft'
import type { Employee } from './systems/employee'
import { applicants } from './systems/hire'
import { monthlyCost } from './systems/money'
import { useGame, type Job } from './store'

beforeEach(() => {
  useGame.setState({
    ...INITIAL_GAME,
    windows: [],
    jobs: [],
    readIds: [],
    meetings: {},
    rejectedIds: [],
    files: [],
    drafts: [],
    slides: [],
    popups: [],
    mails: [],
    employees: [],
    orders: [],
    trainings: [],
    hirePostWeek: undefined,
    hiredApplicantIds: [],
    chats: [],
    crisisWeeks: 0,
  })
})

const emp = (over: Partial<Employee> = {}): Employee => ({
  id: 'e1',
  name: '김지훈',
  role: 'dublisher',
  level: 1,
  stats: { design: 50, publishing: 50, cs: 50 },
  hiredWeek: 1,
  ...over,
})

/** 시안 공정(피그마)이 열려 있는 사이트 업무 하나. */
const siteJob = (over: Partial<Job> = {}): Job => ({
  id: 'j1',
  from: '한빛치과',
  title: '홈페이지 제작',
  channel: 'mail',
  kind: 'site',
  // 화면정의서를 만들고 회신까지 마쳐 **시안(피그마) 차례**다.
  step: 1,
  replied: 1,
  due: 30,
  done: false,
  ...over,
})

describe('채용', () => {
  it('공고는 행동력을 물고 그 주차를 남긴다 — 지원자는 저장하지 않는다', () => {
    useGame.setState({ week: 5, ap: 3 })
    useGame.getState().postHiring()
    const s = useGame.getState()
    expect(s.ap).toBe(3 - POST_AP)
    expect(s.hirePostWeek).toBe(5)
    // 목록은 주차 하나에서 파생한다(세이브에 지원자가 들어가지 않는다).
    expect(applicants(5)).toHaveLength(APPLICANTS_PER_POST)
  })

  it('행동력이 모자라면 공고가 올라가지 않는다', () => {
    useGame.setState({ ap: 0 })
    useGame.getState().postHiring()
    expect(useGame.getState().hirePostWeek).toBeUndefined()
  })

  // ⚠️ 규칙을 뒤집어 확인한다: 정원 가드가 없으면 평판 0짜리 회사가 무한히 사람을 뽑는다.
  it('정원을 넘겨 고용할 수 없다 — 스토어가 막는다(버튼 disabled만으로는 부족)', () => {
    // 시작 평판 30 = 소기업(정원 1명).
    const max = companyGrade(useGame.getState().reputation).hireMax
    expect(max).toBe(1)
    const list = applicants(1, max + 2)
    for (const a of list) useGame.getState().hire(a)
    expect(useGame.getState().employees).toHaveLength(max)
  })

  it('정원 0(극소기업)이면 아무도 못 뽑는다', () => {
    useGame.setState({ reputation: 0 })
    expect(companyGrade(0).hireMax).toBe(0)
    useGame.getState().hire(applicants(1)[0]!)
    expect(useGame.getState().employees).toHaveLength(0)
  })

  // ⚠️ 회사등급이 내려가 정원을 넘겨도 **있는 직원은 자르지 않는다**(설계 확정).
  it('등급이 내려가 정원을 넘겨도 신규 채용만 막힌다 — 있는 직원은 그대로다', () => {
    useGame.setState({ reputation: 40, employees: [emp(), emp({ id: 'e2' }), emp({ id: 'e3' })] })
    expect(companyGrade(40).hireMax).toBe(3)
    // 평판이 떨어져 정원 1명짜리 등급으로 내려간다.
    useGame.setState({ reputation: 20 })
    expect(companyGrade(20).hireMax).toBe(1)
    useGame.getState().hire(applicants(2)[0]!)
    expect(useGame.getState().employees).toHaveLength(3)
  })

  it('같은 지원자를 두 번 뽑지 않는다', () => {
    useGame.setState({ reputation: 60 })
    const a = applicants(1)[0]!
    useGame.getState().hire(a)
    useGame.getState().hire(a)
    expect(useGame.getState().employees).toHaveLength(1)
  })
})

describe('지시', () => {
  it('행동력 1을 물고 N주 뒤로 잡힌다 — 등급은 그 직원 스탯이 정한다', () => {
    const e = emp({ level: 1, stats: { design: 90, publishing: 10, cs: 0 } })
    useGame.setState({ week: 2, ap: 3, employees: [e], jobs: [siteJob()] })
    useGame.getState().orderJob('e1', 'j1')

    const s = useGame.getState()
    expect(s.ap).toBe(3 - ORDER_AP)
    expect(s.orders).toHaveLength(1)
    expect(s.orders[0]!.doneWeek).toBe(2 + orderWeeks(1))
    // 등급의 단일 출처는 `gradeOf`다 — 새 사다리를 만들지 않았다.
    expect(s.orders[0]!.grade).toBe(gradeOf(ORDER_QUALITY, 90))
    // 받았다는 대답이 메신저에 남는다.
    expect(s.chats).toHaveLength(1)
  })

  // ⚠️ 규칙을 뒤집어 확인한다: 점유가 없으면 직원 하나가 한 주에 모든 업무를 가져간다.
  it('지시받은 직원은 N주간 다시 못 쓴다', () => {
    useGame.setState({
      week: 1,
      ap: 5,
      employees: [emp({ level: 1 })],
      jobs: [siteJob(), siteJob({ id: 'j2' })],
    })
    useGame.getState().orderJob('e1', 'j1')
    useGame.getState().orderJob('e1', 'j2')
    expect(useGame.getState().orders).toHaveLength(1)

    // 끝나기 직전 주까지도 여전히 못 쓴다.
    const done = useGame.getState().orders[0]!.doneWeek
    for (let w = 1; w < done - 1; w++) useGame.getState().advanceWeek()
    useGame.getState().orderJob('e1', 'j2')
    expect(useGame.getState().orders).toHaveLength(1)
    expect(useGame.getState().orders[0]!.jobId).toBe('j1')
  })

  it('종류가 맞지 않으면 지시가 걸리지 않는다', () => {
    // 웹퍼블리셔에게 시안(피그마)을 맡길 수 없다.
    useGame.setState({ ap: 3, employees: [emp({ role: 'publisher' })], jobs: [siteJob()] })
    useGame.getState().orderJob('e1', 'j1')
    expect(useGame.getState().orders).toHaveLength(0)
    expect(useGame.getState().ap).toBe(3)
  })

  it('행동력이 모자라면 지시가 걸리지 않는다', () => {
    useGame.setState({ ap: 0, employees: [emp()], jobs: [siteJob()] })
    useGame.getState().orderJob('e1', 'j1')
    expect(useGame.getState().orders).toHaveLength(0)
  })

  it('N주 뒤 공정이 오르고 시안이 목록에 선다 — 회신은 여전히 내 손이다', () => {
    useGame.setState({ week: 1, ap: 3, employees: [emp({ level: 1 })], jobs: [siteJob()] })
    useGame.getState().orderJob('e1', 'j1')
    const done = useGame.getState().orders[0]!.doneWeek
    for (let w = 1; w < done; w++) useGame.getState().advanceWeek()

    const s = useGame.getState()
    expect(s.week).toBe(done)
    expect(s.orders).toHaveLength(0)
    expect(s.jobs[0]!.step).toBe(2)
    // ⚠️ 회신은 오르지 않았다 — 직원이 만들어도 납품은 보내는 일이다.
    expect(s.jobs[0]!.replied).toBe(1)
    expect(s.drafts).toHaveLength(1)
    // 시안은 시안 목록으로 간다(팝업 등록 화면에 .fig가 뜨면 안 된다).
    expect(s.files).toHaveLength(0)
  })
})

describe('급여', () => {
  // ⚠️ 규칙을 뒤집어 확인한다: 급여가 안 빠지면 직원은 공짜가 되고 채용에 대가가 사라진다.
  it('월말에 실제로 빠진다 — 사람 수가 정본이다(SUBSCRIPTIONS가 아니다)', () => {
    const list = [emp({ level: 1 }), emp({ id: 'e2', level: 3 })]
    useGame.setState({ week: WEEKS_PER_MONTH - 1, money: 10_000_000, employees: list })
    const before = useGame.getState().money
    useGame.getState().advanceWeek()

    const s = useGame.getState()
    expect(s.week % WEEKS_PER_MONTH).toBe(0)
    expect(before - s.money).toBe(monthlyCost(list))
    // 급여만큼 실제로 더 나갔다.
    expect(monthlyCost(list) - monthlyCost([])).toBe(salaryOf(1) + salaryOf(3))
  })

  it('직원이 없으면 월정액만 빠진다', () => {
    useGame.setState({ week: WEEKS_PER_MONTH - 1, money: 10_000_000 })
    const before = useGame.getState().money
    useGame.getState().advanceWeek()
    expect(before - useGame.getState().money).toBe(monthlyCost([]))
  })

  it('정산 메일에 사람마다 한 줄이 선다', () => {
    useGame.setState({
      week: WEEKS_PER_MONTH - 1,
      money: 10_000_000,
      employees: [emp({ name: '박서연', level: 2 })],
    })
    useGame.getState().advanceWeek()
    const mail = useGame.getState().mails.find((m) => m.from === '유지보수보고서')
    expect(mail?.body).toContain('박서연 급여')
  })
})

describe('평판 위기', () => {
  // ⚠️ 규칙을 뒤집어 확인한다: 카운터가 없으면 평판 0짜리 회사가 잔고만으로 무한히 버틴다.
  it('4주면 폐업 카운터가 그만큼 는다', () => {
    useGame.setState({ reputation: REPUTATION_CRISIS - 1, money: 10_000_000 })
    for (let i = 0; i < CRISIS_WEEKS_TO_SHUTDOWN; i++) useGame.getState().advanceWeek()
    expect(useGame.getState().crisisWeeks).toBe(CRISIS_WEEKS_TO_SHUTDOWN)
  })

  it('위기선 위로 오르면 0으로 리셋된다 — 갚을 수 있는 빚이다', () => {
    useGame.setState({ reputation: REPUTATION_CRISIS - 1, money: 10_000_000 })
    useGame.getState().advanceWeek()
    expect(useGame.getState().crisisWeeks).toBe(1)
    useGame.setState({ reputation: REPUTATION_CRISIS + 10 })
    useGame.getState().advanceWeek()
    expect(useGame.getState().crisisWeeks).toBe(0)
  })

  it('매주 한 명이 레벨 높은 순으로 나간다', () => {
    useGame.setState({
      reputation: REPUTATION_CRISIS - 1,
      money: 10_000_000,
      employees: [emp({ id: 'a', level: 1 }), emp({ id: 'b', level: 5 })],
    })
    useGame.getState().advanceWeek()
    expect(useGame.getState().employees.map((e) => e.id)).toEqual(['a'])
    // 나간 사실이 받은편지함에 남는다(사라진 사람의 대화방은 열 수 없다).
    expect(useGame.getState().mails.some((m) => m.id.startsWith('quit:'))).toBe(true)

    useGame.getState().advanceWeek()
    expect(useGame.getState().employees).toHaveLength(0)
  })

  it('나간 사람이 들고 있던 지시도 사라진다 — 맡을 사람 없는 일은 끝나지 않는다', () => {
    useGame.setState({
      week: 1,
      ap: 3,
      money: 10_000_000,
      employees: [emp({ id: 'a', level: 1 })],
      jobs: [siteJob()],
    })
    useGame.getState().orderJob('a', 'j1')
    useGame.setState({ reputation: REPUTATION_CRISIS - 1 })
    useGame.getState().advanceWeek()
    expect(useGame.getState().employees).toHaveLength(0)
    expect(useGame.getState().orders).toHaveLength(0)
    // 공정도 오르지 않았다.
    expect(useGame.getState().jobs[0]!.step).toBe(1)
  })

  it('평판이 위기선 위면 아무도 나가지 않는다', () => {
    useGame.setState({ reputation: 50, money: 10_000_000, employees: [emp({ level: 5 })] })
    useGame.getState().advanceWeek()
    expect(useGame.getState().employees).toHaveLength(1)
  })
})

describe('교육 (스토어)', () => {
  it('교육비를 내고 그 주 동안 잡혀 있다가 레벨이 올라 돌아온다', () => {
    useGame.setState({ employees: [emp({ id: 'e1', level: 2 })], money: 5_000_000, week: 1 })
    const before = useGame.getState().money

    useGame.getState().train('e1')
    expect(useGame.getState().money).toBe(before - TRAIN_COST)
    expect(useGame.getState().trainings).toHaveLength(1)

    // 끝나기 전 주에는 아직 그대로다.
    for (let i = 0; i < TRAIN_WEEKS - 1; i++) useGame.getState().advanceWeek()
    expect(useGame.getState().employees[0]?.level).toBe(2)

    useGame.getState().advanceWeek()
    const e = useGame.getState().employees[0]!
    expect(e.level).toBe(3)
    expect(e.stats.design).toBe(50 + TRAIN_STAT_GAIN)
    // 끝난 교육은 목록에서 사라진다 — 점유가 이 목록에서만 파생하기 때문이다.
    expect(useGame.getState().trainings).toHaveLength(0)
  })

  // 규칙을 뒤집어 확인한다: 스토어가 막지 않으면 소지금이 음수로 내려간다.
  it('교육비가 모자라면 아무 일도 일어나지 않는다', () => {
    useGame.setState({ employees: [emp({ id: 'e1', level: 1 })], money: TRAIN_COST - 1 })
    useGame.getState().train('e1')
    expect(useGame.getState().money).toBe(TRAIN_COST - 1)
    expect(useGame.getState().trainings).toHaveLength(0)
  })

  it('오른 레벨만큼 월급도 오른다 — 교육의 진짜 값은 그 뒤로 계속 나간다', () => {
    useGame.setState({ employees: [emp({ id: 'e1', level: 1 })], money: 5_000_000 })
    const was = monthlyCost(useGame.getState().employees)
    useGame.getState().train('e1')
    for (let i = 0; i < TRAIN_WEEKS; i++) useGame.getState().advanceWeek()
    expect(monthlyCost(useGame.getState().employees)).toBe(was + salaryOf(2) - salaryOf(1))
  })
})
