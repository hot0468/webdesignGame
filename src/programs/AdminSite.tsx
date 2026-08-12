import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { BROWSER_ICONS } from '../data/icons'
import { CLIENTS } from '../data/company'
import { checkLogin } from '../systems/url'
import { useGame } from '../store'

/** 업체별 관리자 페이지. 브라우저 주소창에 그 업체의 관리자 주소를 쳐야 닿는다
 * (`systems/url.ts`의 `resolveUrl`이 주소를 업체로 푼다).
 *
 * ⚠️ **로그인 상태는 여기 `useState`다.** 창을 닫으면 풀린다 — 창을 보는 방식은
 *    세이브에 넣지 않는다는 규칙이고, 스토어에 넣으면 세이브 버전을 올리게 된다.
 *    반대로 **올린 팝업 수는 게임 상태**라 스토어(`popups`)에 있다.
 *
 * ⚠️ 계정의 정본은 `CLIENTS`다 — 여기 적지 않는다. 플레이어는 `사내시스템 > 업체정보`에서
 *    계정을 찾아 여기 옮겨 적는다. 그 왕복이 이 화면의 의도된 동선이라
 *    화면에 계정을 힌트로 흘리지 마라.
 *
 * ⚠️ 메뉴는 **팝업등록 하나뿐이다.** 갈 데 없는 메뉴를 그리지 않는다. */
export function AdminSite({ clientId }: { clientId: string }) {
  const client = CLIENTS.find((c) => c.id === clientId)
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [failed, setFailed] = useState(false)
  const [me, setMe] = useState<string | null>(null)

  const count = useGame((s) => s.popups[clientId] ?? 0)
  const uploadPopup = useGame((s) => s.uploadPopup)

  if (!client) return null

  const inside = me === clientId

  if (!inside) {
    return (
      <div className="nv-site">
        <div className="nv-site__login">
          <h3 className="nv-site__brand">{client.name} 관리자</h3>
          <form
            className="nv-site__form"
            onSubmit={(e) => {
              e.preventDefault()
              // 실패는 **보낸 뒤에만** 말한다. 치는 중에 빨개지면 아직 다 안 쳤을 뿐인데 혼난다.
              if (checkLogin(clientId, id, pw)) {
                setMe(clientId)
                setFailed(false)
              } else {
                setFailed(true)
              }
            }}
          >
            <label className="nv-site__field">
              <AppIcon name={BROWSER_ICONS.account} size={16} />
              <input
                className="nv-site__input"
                value={id}
                onChange={(e) => setId(e.target.value)}
                aria-label="아이디"
                placeholder="아이디"
              />
            </label>
            <label className="nv-site__field">
              <AppIcon name={BROWSER_ICONS.key} size={16} />
              <input
                className="nv-site__input"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                aria-label="비밀번호"
                placeholder="비밀번호"
              />
            </label>
            <button type="submit" className="nv-site__go">
              로그인
            </button>
          </form>

          {failed && (
            <p className="nv-site__fail" role="alert">
              <AppIcon name={BROWSER_ICONS.warn} size={16} />
              아이디 또는 비밀번호가 맞지 않습니다. 사내시스템의 업체정보에서 확인하세요.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="nv-site">
      <header className="nv-site__bar">
        <h3 className="nv-site__brand">{client.name} 관리자</h3>
        <button type="button" className="nv-site__out" onClick={() => setMe(null)}>
          <AppIcon name={BROWSER_ICONS.logout} size={16} />
          로그아웃
        </button>
      </header>

      <div className="nv-site__body">
        {/* 메뉴는 이것 하나다. 빈 메뉴를 옆에 세워 관리자 페이지처럼 보이게 하지 않는다. */}
        <section className="nv-site__panel">
          <h4 className="nv-site__title">
            <AppIcon name={BROWSER_ICONS.popup} size={18} />
            팝업 등록
          </h4>
          {/* ⚠️ 행동력을 적지 않는다 — 등록은 값을 물리지 않는다(비용은 만드는 공정의 몫). */}
          <p className="nv-site__desc">홈페이지 첫화면에 뜰 팝업을 올립니다.</p>

          <button type="button" className="nv-site__go" onClick={() => uploadPopup(clientId)}>
            팝업 등록
          </button>

          <p className="nv-site__count">
            등록된 팝업 <strong>{count}</strong>개
          </p>
        </section>
      </div>
    </div>
  )
}
