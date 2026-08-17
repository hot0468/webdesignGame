import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { MessageList } from '../components/MessageList'
import { PROGRAM_ICONS } from '../data/icons'
import { CLIENTS, clientsOf, STARTER_CLIENT } from '../data/company'
import { unreadCount } from '../data/inbox'
import {
  CRISIS_WEEKS_TO_SHUTDOWN,
  MAINTENANCE_FEE,
  MAINTENANCE_MIN_DONE,
  REPUTATION_CRISIS,
  REPUTATION_MAX,
  companyGrade,
  nextGrade,
  companyLevel,
  nextLevel,
  SKILL_DISCOUNT,
} from '../data/game'
import { payroll } from '../systems/employee'
import { canContract } from '../systems/money'
import { useGame } from '../store'

/** `사내시스템` 창. 왼쪽 메뉴로 화면을 가르는 백오피스형이다.
 *
 * ⚠️ 사이드바는 **화면**만 진다. 업체 목록은 업체정보 화면 안에 있다 — 수주가 늘면
 *    업체도 느는데, 사이드바에 쌓으면 메뉴가 화면보다 길어진다.
 *
 * ⚠️ 고른 화면은 `useState`에 둔다 — 게임 상태가 아니라 창을 보는 방식이라 스토어에 넣으면
 *    세이브에 들어가고, 세이브 버전을 그것 때문에 올리게 된다. */

/** `badge`가 붙은 메뉴는 안 읽은 수를 진다 — 바탕화면 아이콘 뱃지가 어느 메뉴를
 *  가리키는지 여기서 다시 보이지 않으면 창을 열고 나서 찾아 헤매게 된다. */
const MENU = [
  { id: 'status', label: '회사현황' },
  { id: 'board', label: '고객게시판', badge: 'board' },
  { id: 'info', label: '업체정보' },
] as const

export function Company() {
  const [view, setView] = useState<(typeof MENU)[number]['id']>('status')
  const readIds = useGame((s) => s.readIds)
  // ⚠️ 뱃지도 생겨난 글을 함께 센다(`MessageList`와 같은 목록을 봐야 숫자가 안 어긋난다).
  const mails = useGame((s) => s.mails)
  // ⚠️ 아직 안 온 글은 뱃지에도 없다(고객게시판 목록과 같은 주차를 본다).
  const week = useGame((s) => s.week)

  return (
    <div className="company">
      <nav className="company__menu">
        {MENU.map((m) => {
          const unread = 'badge' in m ? unreadCount(m.badge, week, readIds, mails) : 0
          return (
            <button
              key={m.id}
              type="button"
              className={`company__item${view === m.id ? ' company__item--on' : ''}`}
              aria-current={view === m.id ? 'page' : undefined}
              aria-label={unread ? `${m.label}, 새 글 ${unread}개` : undefined}
              onClick={() => setView(m.id)}
            >
              {m.label}
              {unread > 0 && (
                <span className="badge" aria-hidden="true">
                  {unread}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="company__body">
        {view === 'status' ? <Status /> : view === 'board' ? <MessageList channel="board" /> : <Info />}
      </div>
    </div>
  )
}

/** 회사평판을 위기선과 **함께** 보여준다.
 *
 * ⚠️ HUD와 겹치는 숫자를 다시 늘어놓지 않는다 — HUD가 못 지는 것만 여기 진다.
 *    평판 숫자 하나로는 "10 아래면 수주가 끊기고 4주 뒤 폐업"을 알 수 없다. 그 거리를
 *    눈으로 재게 하는 것이 이 화면의 존재 이유다.
 *
 * ⚠️ 게이지는 `<meter>`가 아니라 role="meter" div다. `<meter>`는 브라우저 기본 스타일을
 *    토큰으로 덮는 방법이 브라우저마다 달라, 확정된 팔레트를 입힐 수가 없다. */
function Status() {
  const reputation = useGame((s) => s.reputation)
  const employees = useGame((s) => s.employees)
  const crisisWeeks = useGame((s) => s.crisisWeeks)
  const revenue = useGame((s) => s.revenue)
  const design = useGame((s) => s.design)
  const planning = useGame((s) => s.planning)
  const figmaSkill = useGame((s) => s.figmaSkill)
  const photoshopSkill = useGame((s) => s.photoshopSkill)
  const codingSkill = useGame((s) => s.codingSkill)
  const inCrisis = reputation < REPUTATION_CRISIS
  const grade = companyGrade(reputation)
  const next = nextGrade(grade)
  // ⚠️ 등급(평판)과 **다른 축**이다 — 레벨은 누적 매출에서 나오고 행동력 상한을 진다.
  const level = companyLevel(revenue)
  const up = nextLevel(level)

  const pct = (v: number) => `${(v / REPUTATION_MAX) * 100}%`

  return (
    <div className="company__panel">
      {/* 등급과 평판을 붙여 둔다 — 등급이 평판에서 나오므로 떨어뜨리면 무엇을 올려야
          등급이 오르는지가 화면에서 끊긴다. */}
      <div className="company__head">
        <span className="company__label">회사등급</span>
        <span className="company__value">{grade.label}</span>
      </div>
      <p className="company__note">
        직원 {employees.length}명 / 채용 가능 인원 {grade.hireMax}명
        {next && ` · 평판 ${next.minReputation}부터 ${next.label}`}
      </p>
      {/* 급여 합계는 **여기에만** 선다 — 계기판은 소지금만 지고, 매달 얼마가 나가는지는
          이 화면이 진다(`Hud`와 겹치는 숫자를 다시 늘어놓지 않는다는 규칙). */}
      <p className="company__note">
        월 급여 합계 {payroll(employees).toLocaleString('ko-KR')}원
      </p>

      {/* 회사레벨. ⚠️ 등급과 **붙여 두되 다른 줄**이다 — 둘 다 "회사가 얼마나 큰가"를
          말하지만 오르는 조건이 다르다(평판 vs 누적 매출). 한 줄에 섞으면 무엇을 올려야
          행동력이 느는지가 흐려진다. */}
      <div className="company__head">
        <span className="company__label">회사레벨</span>
        <span className="company__value">{level.level}</span>
      </div>
      <p className="company__note">
        행동력 상한 {level.apMax} · 누적 매출 {revenue.toLocaleString('ko-KR')}원
        {up && ` · ${up.minRevenue.toLocaleString('ko-KR')}원부터 레벨 ${up.level}(행동력 ${up.apMax})`}
      </p>

      {/* 내 스탯. ⚠️ **두 축을 갈라서 적는다** — 등급을 정하는 축(디자인·기획)과
          행동력을 깎는 축(숙련도 3종)을 한 줄에 섞으면 무엇을 올려야 무엇이 좋아지는지가
          흐려진다. 이 게임의 단골 사고 지점이라 설계 결정표도 한 줄을 따로 쓴다. */}
      <div className="company__head">
        <span className="company__label">내 스탯</span>
      </div>
      <p className="company__note">
        결과물 등급 — 디자인 {design} · 기획 {planning}
      </p>
      <p className="company__note">
        행동력 감면 — 피그마 {figmaSkill} · 포토샵 {photoshopSkill} · 코딩 {codingSkill}
      </p>
      <p className="company__note">
        숙련도 {SKILL_DISCOUNT[1].minSkill}부터 −{SKILL_DISCOUNT[1].ap},{' '}
        {SKILL_DISCOUNT[2].minSkill}부터 −{SKILL_DISCOUNT[2].ap} (최소 1)
      </p>

      <div className="company__head">
        <span className="company__label">회사평판</span>
        <span className="company__value">
          {reputation}
          <span className="company__max"> / {REPUTATION_MAX}</span>
        </span>
      </div>

      <div
        className={`gauge${inCrisis ? ' gauge--crisis' : ''}`}
        role="meter"
        aria-label="회사평판"
        aria-valuenow={reputation}
        aria-valuemin={0}
        aria-valuemax={REPUTATION_MAX}
      >
        <div className="gauge__fill" style={{ width: pct(reputation) }} />
        {/* 위기선. 게이지 안에 그려야 평판과의 거리가 눈에 보인다. */}
        <div className="gauge__crisis" style={{ left: pct(REPUTATION_CRISIS) }} />
      </div>
      <p className="company__note">위기선 {REPUTATION_CRISIS}</p>

      <p className={`company__warn${inCrisis ? ' company__warn--on' : ''}`}>
        <AppIcon name={PROGRAM_ICONS.crisis} />
        평판이 위기선 아래면 신규 수주가 끊기고 매주 직원이 떠난다.{' '}
        {CRISIS_WEEKS_TO_SHUTDOWN}주 연속이면 폐업이다.
        {/* ⚠️ 카운터는 **위기 중일 때만** 적는다 — 평상시에 0/4가 서 있으면 늘 위험한 것처럼
            읽히고, 정작 1이 됐을 때 눈에 띄지 않는다. */}
        {crisisWeeks > 0 && ` 지금 ${crisisWeeks}/${CRISIS_WEEKS_TO_SHUTDOWN}주째다.`}
      </p>
    </div>
  )
}

/** 업체 목록 + 고른 업체의 접속 정보. 업로드 공정이 생기면 플레이어가 여기를 보고 입력한다. */
function Info() {
  const [id, setId] = useState<string>(STARTER_CLIENT)

  // ⚠️ 셀렉터 안에서 filter를 돌리지 마라(새 배열 = 무한 렌더). 목록을 통째로 받아 거른다.
  const jobs = useGame((s) => s.jobs)

  // ⚠️ **관계가 생긴 업체만 선다**(`clientsOf`) — 만나 본 적도 없는 곳의 FTP 계정이
  //    처음부터 보이면 이 화면이 "찾아서 옮겨 적는 자리"가 아니라 그냥 정답표가 된다.
  //    일을 받으면 그 업체가 여기 들어오고, 그때부터 퍼블리싱·팝업 등록이 열린다.
  // ⚠️ 수주센터로 딴 곳처럼 **상수 목록에 없는 업체도 여기 생겨난다**(접속 정보는 이름에서
  //    파생한다) — 에디터가 보는 것과 같은 함수라 "업체정보엔 있는데 에디터엔 없는" 일이 없다.
  const list = clientsOf(jobs)
  // 고른 업체가 아직 안 열린 곳일 수 있다(불러온 판·새 게임) — 그때는 첫 칸으로 떨어진다.
  const client = list.find((c) => c.id === id) ?? list[0]!
  // ⚠️ 관리자 계정이 **없는 업체가 있다** — 수주로 생겨난 곳은 팝업 의뢰를 내지 않아
  //    관리자 페이지가 쓰일 자리가 없다. 빈 판을 그리면 "정보가 사라졌다"로 읽히므로
  //    그 묶음 자체를 세우지 않는다(없는 것을 빈칸으로 보여 주지 않는다).
  const groups = [
    { title: 'FTP 접속 정보', rows: client.ftp },
    ...(client.admin.length > 0
      ? [{ title: '관리자 사이트 계정정보', rows: client.admin }]
      : []),
  ]
  const contracts = useGame((s) => s.contracts)
  const signContract = useGame((s) => s.signContract)
  // 깨진 계약은 세지 않는다 — 잘해 준 사이라는 뜻이 이 조건의 전부다(`canContract`와 같은 규칙).
  const done = jobs.filter((j) => j.from === client.name && j.done && !j.breached).length
  const signed = contracts.includes(client.id)

  return (
    <div className="company__panel">
      <div className="company__tabs">
        {list.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`company__tab${c.id === id ? ' company__tab--on' : ''}`}
            aria-current={c.id === id ? 'true' : undefined}
            onClick={() => setId(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* ⚠️ 목록이 짧은 것이 **고장이 아니라 규칙임을** 말한다 — 아무 설명이 없으면
          업체가 사라진 것처럼 읽힌다. 다 열린 뒤에는 이 줄이 뜻을 잃으므로 걷는다. */}
      {!CLIENTS.every((c) => list.some((x) => x.id === c.id)) && (
        <p className="company__note">
          일을 받은 업체만 여기 선다. 새 업체의 의뢰를 수주하면 그 업체의 접속 정보가 들어온다.
        </p>
      )}

      {/* ── 유지보수 계약 ─────────────────────────────────────
          **매달 들어오는 돈**이다(급여의 반대편). ⚠️ 맺으려면 그 업체 일을
          `MAINTENANCE_MIN_DONE`건 끝내야 한다 — 수주하자마자 고정 수입이 붙으면
          "잘해 준 사이"라는 뜻이 사라진다. 못 맺는 이유는 글자가 말한다. */}
      <section className="company__group">
        <h4 className="company__group-title">유지보수 계약</h4>
        <p className="company__note">
          {signed
            ? `계약 중 — 매달 ${MAINTENANCE_FEE.toLocaleString('ko-KR')}원이 정산에 들어온다.`
            : `납품 ${done}건 / ${MAINTENANCE_MIN_DONE}건. 맺으면 매달 ${MAINTENANCE_FEE.toLocaleString('ko-KR')}원이 들어온다.`}
        </p>
        {!signed && (
          <button
            type="button"
            className="company__sign"
            disabled={!canContract(done, signed)}
            onClick={() => signContract(client.id)}
          >
            계약 맺기
          </button>
        )}
      </section>

      {/* 고른 업체 이름은 칩이 이미 진다 — 바로 아래 제목으로 또 적지 않는다. */}
      {groups.map((g) => (
        <section key={g.title} className="company__group">
          <h4 className="company__group-title">{g.title}</h4>
          {/* 라벨-값 쌍은 dl이 정본이다. dl > div > dt+dd는 HTML5에서 유효하다. */}
          <dl>
            {g.rows.map((row) => (
              <div key={row.label} className="company__row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
