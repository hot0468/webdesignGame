import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { BROWSER_ICONS, SITE_ICONS } from '../data/icons'
import { SHORTCUTS, SEARCH_HOME } from '../data/sites'
import './browser.css'

/** `브라우저` 창의 첫화면 — 게임 안의 가짜 포털(검색창 + 자주 가는 사이트 칸).
 *
 * 시각 언어는 `browser.css`가 자기 팔레트로 가둔다(셸 인디고를 쓰지 않는다).
 *
 * ⚠️ **동작하지 않는 컨트롤을 멀쩡한 얼굴로 그리지 않는다**는 규칙이 이 화면의 형태를
 *    거의 다 정했다. 지금 갈 수 있는 곳이 하나도 없으므로:
 *    - 뒤로·앞으로·새로고침은 `disabled`(누를 수 있는 척하지 않는다)
 *    - 주소 표시줄은 **읽는 자리**다 — 입력칸으로 만들면 주소를 칠 수 있어야 한다
 *    - 바로가기는 button이 아니라 목록이고 "준비 중" 꼬리표를 단다
 *    - 검색만 **실제로 동작한다**: 친 말을 받아 "아직 검색할 사이트가 없다"고 답한다.
 *      빈 껍데기는 아니면서 없는 기능을 있는 척하지도 않는 유일한 지점이다.
 *
 * 사이트(수주·채용·쇼핑)가 생기는 커밋에서 이 화면이 그 사이트들의 입구가 된다. */
export function Browser() {
  const [query, setQuery] = useState('')
  /** 마지막으로 **보낸** 검색어. 입력 중에는 답하지 않는다(칠 때마다 답이 튀면 시끄럽다). */
  const [asked, setAsked] = useState('')

  return (
    <div className="nv">
      <div className="nv__chrome">
        {/* 셋 다 갈 데가 없다 — 살아 있는 척하지 않는다. */}
        <button type="button" className="nv__nav" disabled aria-label="뒤로">
          <AppIcon name={BROWSER_ICONS.back} size={18} />
        </button>
        <button type="button" className="nv__nav" disabled aria-label="앞으로">
          <AppIcon name={BROWSER_ICONS.forward} size={18} />
        </button>
        <button type="button" className="nv__nav" disabled aria-label="새로고침">
          <AppIcon name={BROWSER_ICONS.reload} size={18} />
        </button>
        <p className="nv__url">
          <AppIcon name={BROWSER_ICONS.lock} size={14} />
          <span className="nv__url-text">{SEARCH_HOME.url}</span>
        </p>
      </div>

      <div className="nv__home">
        <h2 className="nv__logo">
          {SEARCH_HOME.name.slice(0, 1)}
          <span className="nv__logo-mark">{SEARCH_HOME.name.slice(1, 2)}</span>
          {SEARCH_HOME.name.slice(2)}
        </h2>

        <form
          className="nv__search"
          onSubmit={(e) => {
            e.preventDefault()
            setAsked(query.trim())
          }}
        >
          <AppIcon name={BROWSER_ICONS.search} size={20} className="nv__search-icon" />
          <input
            className="nv__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            // 라벨을 자리표시자로 대신하지 않는다 — 보이는 라벨이 없으므로 읽는 이름을 준다.
            aria-label="검색어"
            placeholder="무엇이든 검색해 보세요"
          />
          <button type="submit" className="nv__btn">
            검색
          </button>
        </form>

        {/* 답은 보낸 뒤에만 뜬다. aria-live로 스크린리더에도 바뀐 것이 전해진다. */}
        {asked && (
          <p className="nv__said" aria-live="polite">
            ‘{asked}’ 검색 결과가 없다. 아직 이 브라우저로 갈 수 있는 사이트가 없다 —
            업무 수주·채용·쇼핑 사이트가 열리면 그때부터 검색된다.
          </p>
        )}

        <ul className="nv__shortcuts">
          {SHORTCUTS.map((s) => (
            <li key={s.id} className="nv__shortcut">
              {/* 다색 아이콘이다 — CSS color를 입히지 않는다. */}
              <AppIcon name={SITE_ICONS[s.icon]} size={32} />
              <span className="nv__shortcut-name">{s.name}</span>
              <span className="nv__soon">준비 중</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
