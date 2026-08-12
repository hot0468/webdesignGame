import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { BROWSER_ICONS } from '../data/icons'
import { CLIENTS } from '../data/company'
import { formatDate, formatPeriod, formatWeek } from '../systems/calendar'
import { isWaitingReply } from '../systems/pipeline'
import { isFileOf } from '../systems/popup'
import { checkLogin } from '../systems/url'
import { asStep, useGame } from '../store'

/** 업체별 관리자 페이지. 브라우저 주소창에 그 업체의 관리자 주소를 쳐야 닿는다
 * (`systems/url.ts`의 `resolveUrl`이 주소를 업체로 푼다).
 *
 * ⚠️ **로그인 상태는 여기 `useState`다.** 창을 닫으면 풀린다 — 창을 보는 방식은
 *    세이브에 넣지 않는다는 규칙이고, 스토어에 넣으면 세이브 버전을 올리게 된다.
 *    반대로 **걸린 팝업은 게임 상태**라 스토어(`popups`)에 있다.
 *
 * ⚠️ 계정의 정본은 `CLIENTS`다 — 여기 적지 않는다. 플레이어는 `사내시스템 > 업체정보`에서
 *    계정을 찾아 여기 옮겨 적는다. 그 왕복이 이 화면의 의도된 동선이라
 *    화면에 계정을 힌트로 흘리지 마라.
 *
 * ⚠️ **행동력을 적지 않는다** — 등록은 값을 물리지 않는다(비용은 만드는 공정의 몫).
 *
 * ⚠️ 이 팔레트(`--nv-*`)에는 **빨강이 없다.** 어긋남·경고는 아이콘 + 글자가 말한다 —
 *    여기에 새 색을 만드는 순간 브라우저 창이 두 팔레트를 지게 된다. */
export function AdminSite({ clientId }: { clientId: string }) {
  const client = CLIENTS.find((c) => c.id === clientId)
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [failed, setFailed] = useState(false)
  const [me, setMe] = useState<string | null>(null)

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
        <PopupManager clientId={clientId} />
      </div>
    </div>
  )
}

/** 팝업 목록 + 등록. **한 화면 안의 두 칸이다** — 등록을 딴 화면으로 빼면 지금 걸린 것을
 *  못 보면서 기간을 적게 되고, 그게 곧 클레임이다. */
function PopupManager({ clientId }: { clientId: string }) {
  const week = useGame((s) => s.week)
  const files = useGame((s) => s.files)
  // ⚠️ 셀렉터 안에서 `filter`를 돌리지 마라. 매 렌더마다 **새 배열**이 나와 zustand의
  //    Object.is 비교가 늘 "바뀌었다"로 읽고, 그 자리에서 무한 렌더로 화면이 하얘진다.
  //    목록은 통째로 받아 렌더 중에 거른다.
  const allPopups = useGame((s) => s.popups)
  const popups = allPopups.filter((p) => p.clientId === clientId)
  const jobs = useGame((s) => s.jobs)
  const uploadPopup = useGame((s) => s.uploadPopup)
  const [adding, setAdding] = useState(false)

  // 제작은 끝냈지만 아직 회신하지 않은 파일 — 등록 폼에서 잠긴다(그 이유는 `PopupForm` 주석).
  const waiting = files
    .filter((f) => {
      const job = jobs.find((j) => isFileOf(f.id, j.id))
      return job ? isWaitingReply(asStep(job), 'photoshop') : false
    })
    .map((f) => f.id)

  return (
    <>
      <section className="nv-site__panel">
        <h4 className="nv-site__title">
          <AppIcon name={BROWSER_ICONS.popup} size={18} />
          팝업 목록
        </h4>

        {popups.length === 0 ? (
          <p className="nv-site__desc">등록된 팝업이 없습니다.</p>
        ) : (
          <ul className="nv-pop">
            {popups.map((p) => (
              <PopupRow
                key={p.id}
                popupId={p.id}
                fileName={files.find((f) => f.id === p.fileId)?.name ?? p.fileId}
                from={p.from}
                to={p.to}
                week={week}
              />
            ))}
          </ul>
        )}

        {!adding && (
          <button type="button" className="nv-site__go" onClick={() => setAdding(true)}>
            팝업 등록
          </button>
        )}
      </section>

      {adding && (
        <PopupForm
          files={files}
          waiting={waiting}
          week={week}
          onCancel={() => setAdding(false)}
          onSubmit={(fileId, from, to) => {
            uploadPopup(clientId, fileId, from, to)
            setAdding(false)
          }}
        />
      )}
    </>
  )
}

/** 목록의 한 줄. **게시 기간을 여기서 고칠 수 있다** — 잘못 넣은 기간을 되돌릴 길이
 *  없으면 한 번의 오타가 영구 클레임이 된다.
 *
 * ⚠️ 기간은 `formatPeriod`로 읽는다(마감·의뢰문과 같은 표기라야 두 날짜를 비교할 수 있다).
 *    입력은 주차 숫자로 받되 **옆에 그 날짜를 되뇐다** — 숫자만으로는 며칠인지 모른다. */
function PopupRow({
  popupId,
  fileName,
  from,
  to,
  week,
}: {
  popupId: string
  fileName: string
  from: number
  to: number
  week: number
}) {
  const updatePopupPeriod = useGame((s) => s.updatePopupPeriod)
  const [editing, setEditing] = useState(false)

  const live = week >= from && week <= to

  return (
    <li className="nv-pop__row">
      <p className="nv-pop__file">
        <AppIcon name={BROWSER_ICONS.popup} size={16} />
        {fileName}
      </p>
      {/* 지금 걸려 있는지는 **글자로** 말한다 — 이 팔레트에는 상태를 칠할 색이 없다. */}
      <p className="nv-pop__meta">
        게시 {formatPeriod(from, to)} · {live ? '게시 중' : '게시 기간 아님'}
      </p>

      {editing ? (
        <PeriodFields
          initialFrom={from}
          initialTo={to}
          submitLabel="기간 저장"
          onCancel={() => setEditing(false)}
          onSubmit={(f, t) => {
            updatePopupPeriod(popupId, f, t)
            setEditing(false)
          }}
        />
      ) : (
        <button type="button" className="nv-site__out" onClick={() => setEditing(true)}>
          기간 수정
        </button>
      )}
    </li>
  )
}

/** 등록 폼. ⚠️ **고를 파일이 없으면 폼을 그리지 않는다** — 빈 select는 동작하지 않는
 *  컨트롤이다. 대신 무엇을 먼저 해야 하는지 말한다.
 *
 * ⚠️ 파일 목록을 이 업체 것으로 걸러 주지 않는다. 전부 보이는 것이 이 고리의 핵심이다
 *    (틀린 파일을 고를 수 있어야 클레임이 성립한다).
 *
 * ⚠️ 다만 **제작을 아직 회신하지 않은 파일은 고를 수 없다**(`waiting`). 그것까지 올릴 수
 *    있으면 팝업은 실제로 걸리는데 업무 단계는 안 올라(`store.uploadPopup`의 차례 가드)
 *    같은 팝업을 두 번 걸게 된다. **감추지 않고 잠근 이유**는, 사라지면 왜 없는지 알 수
 *    없고 잠겨 있으면 무엇을 먼저 해야 하는지가 그 줄에 적히기 때문이다. */
function PopupForm({
  files,
  waiting,
  week,
  onSubmit,
  onCancel,
}: {
  files: { id: string; name: string; madeWeek: number }[]
  waiting: string[]
  week: number
  onSubmit: (fileId: string, from: number, to: number) => void
  onCancel: () => void
}) {
  const usable = files.filter((f) => !waiting.includes(f.id))
  const [fileId, setFileId] = useState(usable[0]?.id ?? '')

  if (usable.length === 0) {
    return (
      <section className="nv-site__panel">
        <h4 className="nv-site__title">
          <AppIcon name={BROWSER_ICONS.popup} size={18} />
          팝업 등록
        </h4>
        <p className="nv-site__fail">
          <AppIcon name={BROWSER_ICONS.warn} size={16} />
          {files.length === 0
            ? '올릴 이미지가 없습니다. 포토샵에서 팝업 이미지를 먼저 만드세요.'
            : '올릴 수 있는 이미지가 없습니다. 만든 이미지를 의뢰 글에 회신해야 등록할 수 있습니다.'}
        </p>
        <button type="button" className="nv-site__out" onClick={onCancel}>
          닫기
        </button>
      </section>
    )
  }

  return (
    <section className="nv-site__panel">
      <h4 className="nv-site__title">
        <AppIcon name={BROWSER_ICONS.popup} size={18} />
        팝업 등록
      </h4>
      <p className="nv-site__desc">홈페이지 첫화면에 뜰 팝업 이미지와 게시 기간을 정합니다.</p>

      <label className="nv-pop__label" htmlFor="popup-file">
        팝업 이미지
      </label>
      <select
        id="popup-file"
        className="nv-pop__select"
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
      >
        {files.map((f) => {
          const locked = waiting.includes(f.id)
          return (
            <option key={f.id} value={f.id} disabled={locked}>
              {f.name} ({formatWeek(f.madeWeek)} 제작){locked ? ' — 회신 대기' : ''}
            </option>
          )
        })}
      </select>

      <PeriodFields
        initialFrom={week}
        initialTo={week}
        submitLabel="등록"
        onCancel={onCancel}
        onSubmit={(f, t) => onSubmit(fileId, f, t)}
      />
    </section>
  )
}

/** 게시 기간 입력 두 칸. 등록과 수정이 **같은 것을 쓴다** — 두 벌로 두면 한쪽만 고쳐져
 *  같은 값이 서로 다른 규칙으로 들어간다.
 *
 * ⚠️ 시작이 끝보다 뒤면 저장하지 않는다. 그런 구간은 어떤 주에도 걸리지 않아
 *    "등록했는데 왜 클레임이 오지"가 되는데, 화면 어디에도 이유가 없다. */
function PeriodFields({
  initialFrom,
  initialTo,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialFrom: number
  initialTo: number
  submitLabel: string
  onSubmit: (from: number, to: number) => void
  onCancel: () => void
}) {
  const [from, setFrom] = useState(String(initialFrom))
  const [to, setTo] = useState(String(initialTo))

  const f = Number(from)
  const t = Number(to)
  const valid = Number.isInteger(f) && Number.isInteger(t) && f >= 1 && t >= f

  return (
    <div className="nv-pop__period">
      <label className="nv-pop__label" htmlFor="popup-from">
        시작 주차
      </label>
      <input
        id="popup-from"
        className="nv-pop__num"
        inputMode="numeric"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
      />
      {/* 숫자 옆에 날짜를 되뇐다 — "5"만으로는 며칠인지 알 수 없다. ⚠️ 시작 칸은 그 주의
          **첫날**, 종료 칸은 **마지막 날**이다(의뢰문에 적힌 기간과 같은 끝을 봐야 대조가 된다). */}
      <span className="nv-pop__when">
        {Number.isInteger(f) && f >= 1 ? formatDate(f, 'start') : '—'}
      </span>

      <label className="nv-pop__label" htmlFor="popup-to">
        종료 주차
      </label>
      <input
        id="popup-to"
        className="nv-pop__num"
        inputMode="numeric"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <span className="nv-pop__when">{Number.isInteger(t) && t >= 1 ? formatDate(t) : '—'}</span>

      <div className="nv-pop__actions">
        <button
          type="button"
          className="nv-site__go"
          disabled={!valid}
          onClick={() => onSubmit(f, t)}
        >
          {submitLabel}
        </button>
        <button type="button" className="nv-site__out" onClick={onCancel}>
          취소
        </button>
      </div>

      {!valid && (
        <p className="nv-site__fail">
          <AppIcon name={BROWSER_ICONS.warn} size={16} />
          시작 주차는 1 이상이어야 하고, 종료 주차는 시작 주차보다 앞설 수 없습니다.
        </p>
      )}
    </div>
  )
}
