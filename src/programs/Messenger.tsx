import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { MESSENGER_ICONS } from '../data/icons'
import { findRole, ORDER_AP, ORDER_QUALITY,
  EMPLOYEE_LEVEL,
  TRAIN_COST,
  TRAIN_STAT_GAIN,
} from '../data/employees'
import { formatDate, formatWeek } from '../systems/calendar'
import {
  busyUntil,
  canOrder,
  canTrain,
  orderDoneWeek,
  statOf,
  trainDoneWeek,
  type Employee,
} from '../systems/employee'
import { gradeOf } from '../systems/craft'
import { openStep } from '../systems/pipeline'
import { asStep, useGame } from '../store'
import './messenger.css'

/** `메신저` 창. **직원과의 소통**이 여기서 일어난다 — 업무 지시와 보고가 오가는 자리다.
 * (클라이언트 응대는 `메일`·고객게시판이 진다. 여기 섞지 말 것.)
 *
 * 카카오톡 PC와 같은 세 칸(레일 · 대화 목록 · 대화 칸)이다. 시각 언어는 셸이 아니라
 * `messenger.css`가 진다 — 프로그램 창은 자기 팔레트를 가둔다(`Mail.tsx`와 같은 규칙).
 *
 * ⚠️ **대화방 = 고용된 직원 하나다.** 직원이 없으면 목록이 비어 있는 것이 맞다 —
 *    가짜 방을 미리 그리지 않는다(`Figma.tsx`와 같은 이유).
 *
 * ⚠️ 지시의 선택은 **누구에게 맡기느냐 하나뿐이다** — 퀄리티를 고르지 않는다(설계 확정).
 *    등급은 그 직원의 스탯이 정하고, 걸리는 주차는 그 직원의 레벨이 정한다. */
export function Messenger() {
  const employees = useGame((s) => s.employees)
  // ⚠️ 고른 방은 `useState`다 — 창을 보는 방식이라 세이브에 넣지 않는다(이 리포의 규칙).
  const [openId, setOpenId] = useState<string | null>(null)
  const picked = employees.find((e) => e.id === openId) ?? employees[0]

  return (
    <div className="msgr">
      {/* 화면이 하나뿐이라 레일은 표식이다 — 상세는 messenger.css 주석. */}
      <div className="msgr__rail" aria-hidden="true">
        <span className="msgr__me">나</span>
        <AppIcon name={MESSENGER_ICONS.chat} size={22} className="msgr__rail-on" />
      </div>

      <div className="msgr__list">
        <h3 className="msgr__list-head">채팅 {employees.length > 0 && employees.length}</h3>
        {employees.length === 0 ? (
          <p className="msgr__blank msgr__blank--list">직원이 없다</p>
        ) : (
          <ul className="msgr__rooms">
            {employees.map((e) => (
              <li key={e.id}>
                <Room
                  employee={e}
                  on={picked?.id === e.id}
                  onPick={() => setOpenId(e.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="msgr__chat">
        {picked ? (
          <Chat key={picked.id} employee={picked} />
        ) : (
          <div className="msgr__blank">
            <AppIcon name={MESSENGER_ICONS.blank} size={40} />
            <p className="msgr__blank-title">아직 온 대화가 없다</p>
            <p className="msgr__blank-note">
              직원을 뽑으면 여기로 업무 지시와 보고가 오간다. 채용은 브라우저의 채용 사이트에서
              공고를 올려야 시작된다.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

/** 목록의 한 줄. ⚠️ 지시 중인지가 **여기서** 보여야 누구에게 맡길지 목록만 보고 고른다. */
function Room({
  employee,
  on,
  onPick,
}: {
  employee: Employee
  on: boolean
  onPick: () => void
}) {
  const orders = useGame((s) => s.orders)
  const trainings = useGame((s) => s.trainings)
  const until = busyUntil(employee.id, orders, trainings)

  return (
    <button type="button" className={`msgr__room${on ? ' msgr__room--on' : ''}`} onClick={onPick}>
      <span className="msgr__room-face">{employee.name.slice(0, 1)}</span>
      <span className="msgr__room-body">
        <span className="msgr__room-name">{employee.name}</span>
        {/* 상태는 **글자로** 말한다 — 이 팔레트에 상태를 칠할 색이 없다. */}
        <span className="msgr__room-note">
          {until !== undefined
            ? `작업 중 · ${formatDate(until)}까지`
            : `${findRole(employee.role).label} · 대기 중`}
        </span>
      </span>
    </button>
  )
}

/** 대화 칸 — **지난 말 + 지시할 수 있는 업무 목록**이다.
 *
 * ⚠️ 맡길 수 있는 업무가 없으면 목록을 그리지 않는다(동작하지 않는 컨트롤 금지).
 *    대신 왜 없는지를 적는다 — 종류가 안 맞는 것과 할 일이 없는 것은 다른 사정이다. */
function Chat({ employee }: { employee: Employee }) {
  const week = useGame((s) => s.week)
  const ap = useGame((s) => s.ap)
  const jobs = useGame((s) => s.jobs)
  const orders = useGame((s) => s.orders)
  // ⚠️ 셀렉터 안에서 `filter`를 돌리지 마라 — 새 배열이 나와 무한 렌더가 된다(`AdminSite`).
  const allChats = useGame((s) => s.chats)
  const chats = allChats.filter((c) => c.employeeId === employee.id)
  const orderJob = useGame((s) => s.orderJob)
  const trainings = useGame((s) => s.trainings)
  const train = useGame((s) => s.train)
  const money = useGame((s) => s.money)

  const role = findRole(employee.role)
  const busy = busyUntil(employee.id, orders, trainings)
  // ⚠️ 조건은 `canTrain` 한 줄이 진다(최고 레벨·점유를 여기서 다시 적지 않는다).
  //    돈만 화면이 따로 본다 — 순수 함수는 소지금을 모른다.
  const trainable = canTrain(employee, orders, trainings)
  const maxed = employee.level >= EMPLOYEE_LEVEL.max

  // 맡길 수 있는 업무 = **열린 공정이 있고 그 공정을 이 직원이 맡을 수 있는 것**.
  // ⚠️ 조건은 `canOrder` 한 줄이 진다(종류·점유를 여기서 다시 적지 않는다).
  const offers = jobs
    .filter((j) => !j.done)
    .map((j) => ({ job: j, step: openStep(asStep(j)) }))
    .filter((x) => x.step !== undefined && canOrder(employee, x.step.program, orders, trainings))

  return (
    <div className="msgr__room-view">
      <header className="msgr__head">
        <span className="msgr__head-name">{employee.name}</span>
        <span className="msgr__head-note">
          {role.label} · 레벨 {employee.level} · 디자인 {employee.stats.design} / 퍼블리싱{' '}
          {employee.stats.publishing} / 기획 {employee.stats.planning} / CS {employee.stats.cs}
        </span>
      </header>

      <div className="msgr__log">
        {/* 첫 인사는 저장하지 않는다 — 고용한 주차에서 파생한다(관계를 한 방향으로). */}
        <p className="msgr__bubble">
          안녕하세요, {employee.name}입니다. {formatWeek(employee.hiredWeek)}부터 함께합니다.
          잘 부탁드립니다.
        </p>
        {chats.map((c, i) => (
          <p key={`${c.week}:${i}`} className="msgr__bubble">
            {c.text}
            <span className="msgr__when">{formatWeek(c.week)}</span>
          </p>
        ))}
      </div>

      <div className="msgr__order">
        {busy !== undefined ? (
          <p className="msgr__note">
            지금 맡은 일을 하는 중이다. <b>{formatDate(busy)}</b>에 끝난다.
          </p>
        ) : offers.length === 0 ? (
          <p className="msgr__note">
            지금 맡길 수 있는 일이 없다. {role.label}는{' '}
            {role.programs.map((p) => WORK_NAME[p]).join(' · ')}을(를) 맡는다.
          </p>
        ) : (
          <>
            <p className="msgr__note">
              맡기면 <b>행동력 {ORDER_AP}</b>을 쓰고 결과는 몇 주 뒤에 나온다. 등급은 이 사람의
              실력이 정한다.
            </p>
            <ul className="msgr__offers">
              {offers.map(({ job, step }) => (
                <li key={job.id}>
                  <button
                    type="button"
                    className="msgr__give"
                    disabled={ap < ORDER_AP}
                    onClick={() => orderJob(employee.id, job.id)}
                  >
                    <span className="msgr__give-what">
                      {job.title} — {step!.label}
                    </span>
                    {/* 언제 끝나고 무슨 등급이 나오는지를 **누르기 전에** 적는다 —
                        이것이 "누구에게 맡기느냐"를 선택으로 만드는 유일한 정보다. */}
                    <span className="msgr__give-when">
                      {formatDate(orderDoneWeek(week, employee.level))} 완성 · 예상 등급{' '}
                      {gradeOf(ORDER_QUALITY, statOf(employee, step!.program))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {ap < ORDER_AP && <p className="msgr__note">행동력이 모자라다.</p>}
          </>
        )}
      </div>

      {/* ── 교육 ────────────────────────────────────────────────
          ⚠️ 지시 판과 **다른 칸**이다. 둘은 같은 사람을 잡지만 무는 것이 다르다 —
             지시는 행동력, 교육은 돈이다. 한 칸에 섞으면 무엇을 내는지가 흐려진다. */}
      <div className="msgr__train">
        {maxed ? (
          <p className="msgr__note">
            레벨 {EMPLOYEE_LEVEL.max}, 더 가르칠 것이 없다.
          </p>
        ) : (
          <>
            <button
              type="button"
              className="msgr__teach"
              disabled={!trainable || money < TRAIN_COST}
              onClick={() => train(employee.id)}
            >
              교육 보내기
              <span className="msgr__teach-cost">{TRAIN_COST.toLocaleString()}원</span>
            </button>
            {/* 무엇을 내고 무엇을 얻는지 **누르기 전에** 적는다. 오른 레벨이 월급을
                영구히 올린다는 것까지 적어야 이 선택에 값이 선다. */}
            <p className="msgr__note">
              {formatDate(trainDoneWeek(week))}에 돌아온다. 레벨 {employee.level} →{' '}
              {employee.level + 1}, 세 스탯이 {TRAIN_STAT_GAIN}씩 오르고 월급도 오른다.
            </p>
            {money < TRAIN_COST && <p className="msgr__note">교육비가 모자라다.</p>}
            {!trainable && busy !== undefined && (
              <p className="msgr__note">지금은 잡혀 있어 보낼 수 없다.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/** 프로그램 → 사람이 읽는 일 이름. ⚠️ 공정 제한의 정본은 `EMPLOYEE_ROLES[].programs`다. */
const WORK_NAME: Partial<Record<string, string>> = {
  figma: '시안',
  photoshop: '팝업 이미지',
  ppt: '화면정의서·발표자료',
  editor: '퍼블리싱',
}
