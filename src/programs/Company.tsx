import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { PROGRAM_ICONS } from '../data/icons'
import { COMPANY_INFO } from '../data/company'
import { CRISIS_WEEKS_TO_SHUTDOWN, REPUTATION_CRISIS, REPUTATION_MAX } from '../data/game'
import { useGame } from '../store'

/** `사내시스템` 창. 왼쪽 메뉴로 화면을 가르는 백오피스형이다.
 *
 * ⚠️ 고른 메뉴는 `useState`에 둔다 — 게임 상태가 아니라 창을 보는 방식이라
 *    스토어에 넣으면 세이브에 들어가고, 세이브 버전을 그것 때문에 올리게 된다. */

const MENU = [
  { id: 'status', label: '회사현황' },
  { id: 'info', label: '업체정보' },
] as const

export function Company() {
  const [menu, setMenu] = useState<(typeof MENU)[number]['id']>('status')

  return (
    <div className="company">
      <nav className="company__menu">
        {MENU.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`company__item${menu === m.id ? ' company__item--on' : ''}`}
            aria-current={menu === m.id ? 'page' : undefined}
            onClick={() => setMenu(m.id)}
          >
            {m.label}
          </button>
        ))}
      </nav>
      <div className="company__body">{menu === 'status' ? <Status /> : <Info />}</div>
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

/** 접속 정보 모음. 업로드 공정이 생기면 플레이어가 여기를 보고 입력하게 된다. */
function Info() {
  return (
    <div className="company__panel">
      {Object.entries(COMPANY_INFO).map(([key, group]) => (
        <section key={key} className="company__group">
          <h3 className="company__group-title">{group.title}</h3>
          {/* 라벨-값 쌍은 dl이 정본이다. dl > div > dt+dd는 HTML5에서 유효하다. */}
          <dl>
            {group.rows.map((row) => (
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
