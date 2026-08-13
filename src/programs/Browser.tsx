import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { BROWSER_ICONS, PROGRAM_ICONS, SITE_ICONS } from '../data/icons'
import { SHORTCUTS, SEARCH_HOME } from '../data/sites'
import { normalizeUrl, resolveUrl, siteTitle, type Destination } from '../systems/url'
import { useGame } from '../store'
import { AdminSite } from './AdminSite'
import { HireSite } from './HireSite'
import { WorkSite } from './WorkSite'
import './browser.css'

/** `브라우저` 창 — 주소 표시줄 + 그 주소가 가리키는 화면.
 *
 * 시각 언어는 `browser.css`가 자기 팔레트로 가둔다(셸 인디고를 쓰지 않는다).
 *
 * ⚠️ **주소 표시줄은 이제 입력칸이다.** 읽는 자리였던 것을 바꾼 이유는 갈 곳이 생겼기
 *    때문이다 — 업체 관리자 페이지는 **처음 한 번은 주소를 쳐야만** 닿는다. 플레이어가
 *    `사내시스템 > 업체정보`에서 주소와 계정을 찾아 여기 옮겨 적는 왕복이 의도된 동선이다.
 *    ⚠️ 첫화면 바로가기 칸(`SHORTCUTS`)에 업체를 넣지 말 것 — 그 왕복이 통째로 사라진다.
 *    **즐겨찾기는 그 왕복을 겪은 뒤에만** 생긴다(별은 도착한 주소에만 뜬다). 그래서
 *    반복 방문만 짧아지고 처음 찾아가는 일은 그대로 남는다.
 *
 * 주소 → 화면의 해석은 **`systems/url.ts`의 순수 함수**가 진다. 이 컴포넌트는 그 답을
 * 그리기만 한다(주소 문자열을 여기서 비교하지 말 것). */
export function Browser() {
  const [query, setQuery] = useState('')
  /** 마지막으로 **보낸** 검색어. 입력 중에는 답하지 않는다(칠 때마다 답이 튀면 시끄럽다). */
  const [asked, setAsked] = useState('')
  /** 주소창에 **치는 중인** 글자. 실제로 간 곳(`at`)과 다르다 — 엔터를 쳐야 옮겨 간다. */
  const [typed, setTyped] = useState<string>(SEARCH_HOME.url)
  const [at, setAt] = useState<Destination>({ kind: 'home' })
  /** 지금 **와 있는** 주소. `typed`는 치는 중이라 별이 엉뚱한 곳을 가리킬 수 있다. */
  const [atUrl, setAtUrl] = useState<string>(SEARCH_HOME.url)
  /** 못 찾은 주소를 그대로 되뇌어 준다(오타를 눈으로 잡게). */
  const [badUrl, setBadUrl] = useState('')

  const bookmarks = useGame((s) => s.bookmarks)
  const toggleBookmark = useGame((s) => s.toggleBookmark)
  const starred = bookmarks.includes(normalizeUrl(atUrl))

  const go = (raw: string) => {
    const dest = resolveUrl(raw)
    setAt(dest)
    setAtUrl(raw)
    setBadUrl(dest.kind === 'unknown' ? raw.trim() : '')
  }

  /** 즐겨찾기에서 간다 — 주소창 글자도 같이 옮겨야 별과 주소가 어긋나지 않는다. */
  const goTo = (url: string) => {
    setTyped(url)
    go(url)
  }

  return (
    <div className="nv">
      <div className="nv__chrome">
        {/* 뒤로·앞으로는 아직 방문 기록이 없다 — 살아 있는 척하지 않는다. */}
        <button type="button" className="nv__nav" disabled aria-label="뒤로">
          <AppIcon name={BROWSER_ICONS.back} size={18} />
        </button>
        <button type="button" className="nv__nav" disabled aria-label="앞으로">
          <AppIcon name={BROWSER_ICONS.forward} size={18} />
        </button>
        {/* 새로고침은 실제로 동작한다 — 지금 주소를 다시 푼다. */}
        <button
          type="button"
          className="nv__nav"
          aria-label="새로고침"
          onClick={() => go(typed)}
        >
          <AppIcon name={BROWSER_ICONS.reload} size={18} />
        </button>
        <form
          className="nv__url"
          onSubmit={(e) => {
            e.preventDefault()
            go(typed)
          }}
        >
          <AppIcon name={BROWSER_ICONS.lock} size={14} />
          <input
            className="nv__url-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            aria-label="주소"
            placeholder="주소를 입력하세요"
            spellCheck={false}
          />
          {/* ⚠️ 엔터 하나로 끝내지 않는다 — 이 게임은 마우스로 굴러가고, 실제 모바일
              브라우저도 주소창에 이동 버튼을 둔다. 폼 안의 submit이라 엔터도 같이 산다. */}
          <button type="submit" className="nv__go" aria-label="이동">
            <AppIcon name={BROWSER_ICONS.forward} size={16} />
          </button>
        </form>
        {/* ⚠️ 별은 **도착한 곳이 갈 수 있는 주소일 때만** 뜬다 — 없는 주소를 즐겨찾기에
            담으면 나중에 눌러도 "연결할 수 없음"만 나오는 줄이 남는다. */}
        {at.kind !== 'unknown' && (
          <button
            type="button"
            className={`nv__nav${starred ? ' nv__nav--on' : ''}`}
            aria-pressed={starred}
            aria-label={starred ? '즐겨찾기에서 빼기' : '즐겨찾기에 넣기'}
            onClick={() => toggleBookmark(atUrl)}
          >
            <AppIcon name={starred ? BROWSER_ICONS.starOn : BROWSER_ICONS.star} size={18} />
          </button>
        )}
      </div>

      {/* 즐겨찾기 줄. 비었으면 줄 자체가 없다 — 빈 띠는 자리만 먹는다. */}
      {bookmarks.length > 0 && (
        <div className="nv__marks">
          {bookmarks.map((url) => (
            <button key={url} type="button" className="nv__mark" onClick={() => goTo(url)}>
              <AppIcon name={BROWSER_ICONS.starOn} size={14} />
              {siteTitle(url)}
            </button>
          ))}
        </div>
      )}

      {at.kind === 'admin' ? (
        // key로 업체를 갈라 준다 — 다른 업체로 옮기면 로그인이 따라가지 않는다.
        <AdminSite key={at.clientId} clientId={at.clientId} />
      ) : at.kind === 'site' ? (
        // 화면을 가진 바로가기는 수주센터·채용사이트 둘이다. 나머지(쇼핑)는 `SHORTCUTS`에
        // 주소가 없어 애초에 여기 닿지 않는다(준비 중 꼬리표가 그것을 말한다).
        at.siteId === 'work' ? (
          <WorkSite />
        ) : (
          <HireSite />
        )
      ) : at.kind === 'unknown' ? (
        <div className="nv__lost">
          <AppIcon name={PROGRAM_ICONS.noSite} size={40} />
          <p className="nv__lost-title">사이트에 연결할 수 없음</p>
          <p className="nv__said">
            {badUrl ? `‘${badUrl}’ 주소를 찾을 수 없다.` : '주소를 입력해야 한다.'} 업체
            관리자 주소는 <b>사내시스템 &gt; 업체정보</b>에서 확인한다.
          </p>
        </div>
      ) : (
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
              ‘{asked}’ 검색 결과가 없다. 아직 이 브라우저는 <b>주소를 직접 쳐야</b> 갈 수
              있다 — 업체 관리자 주소는 사내시스템의 업체정보에 있다.
            </p>
          )}

          {/* ⚠️ **주소가 붙은 칸만 버튼이다.** 나머지는 읽는 글자로 남는다 —
              눌러도 아무 일 없는 버튼을 그리지 않는 것이 이 리포의 규칙이다. */}
          <ul className="nv__shortcuts">
            {SHORTCUTS.map((s) =>
              'url' in s ? (
                <li key={s.id} className="nv__shortcut">
                  <button type="button" className="nv__shortcut-go" onClick={() => goTo(s.url)}>
                    {/* 다색 아이콘이다 — CSS color를 입히지 않는다. */}
                    <AppIcon name={SITE_ICONS[s.icon]} size={32} />
                    <span className="nv__shortcut-name">{s.name}</span>
                  </button>
                </li>
              ) : (
                <li key={s.id} className="nv__shortcut">
                  <AppIcon name={SITE_ICONS[s.icon]} size={32} />
                  <span className="nv__shortcut-name">{s.name}</span>
                  <span className="nv__soon">준비 중</span>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
