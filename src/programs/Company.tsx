import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { PROGRAM_ICONS } from '../data/icons'
import { CLIENTS, type Client } from '../data/company'
import { CRISIS_WEEKS_TO_SHUTDOWN, REPUTATION_CRISIS, REPUTATION_MAX } from '../data/game'
import { useGame } from '../store'

/** `사내시스템` 창. 왼쪽 메뉴로 화면을 가르는 백오피스형이다.
 *
 * ⚠️ 사이드바는 **화면**만 진다. 업체 목록은 업체정보 화면 안에 있다 — 수주가 늘면
 *    업체도 느는데, 사이드바에 쌓으면 메뉴가 화면보다 길어진다.
 *
 * ⚠️ 고른 화면은 `useState`에 둔다 — 게임 상태가 아니라 창을 보는 방식이라 스토어에 넣으면
 *    세이브에 들어가고, 세이브 버전을 그것 때문에 올리게 된다. */

const MENU = [
  { id: 'status', label: '회사현황' },
  { id: 'info', label: '업체정보' },
] as const

export function Company() {
  const [view, setView] = useState<(typeof MENU)[number]['id']>('status')

  return (
    <div className="company">
      <nav className="company__menu">
        {MENU.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`company__item${view === m.id ? ' company__item--on' : ''}`}
            aria-current={view === m.id ? 'page' : undefined}
            onClick={() => setView(m.id)}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <div className="company__body">{view === 'status' ? <Status /> : <Info />}</div>
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
  const inCrisis = reputation < REPUTATION_CRISIS

  const pct = (v: number) => `${(v / REPUTATION_MAX) * 100}%`

  return (
    <div className="company__panel">
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
      </p>
    </div>
  )
}

/** 업체 목록 + 고른 업체의 접속 정보. 업로드 공정이 생기면 플레이어가 여기를 보고 입력한다. */
function Info() {
  const [id, setId] = useState<Client['id']>(CLIENTS[0].id)
  const client = CLIENTS.find((c) => c.id === id)!
  const groups = [
    { title: 'FTP 접속 정보', rows: client.ftp },
    { title: '관리자 사이트 계정정보', rows: client.admin },
  ]

  return (
    <div className="company__panel">
      <div className="company__tabs">
        {CLIENTS.map((c) => (
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
