import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { clientsOf } from '../data/company'
import { apCost, PUBLISH_AP, PUBLISH_QUALITY, skillFor } from '../data/game'
import { CHANNEL_LABEL } from '../data/inbox'
import { EDITOR_ICONS } from '../data/icons'
import { formatDate } from '../systems/calendar'
import { gradeOf } from '../systems/craft'
import { checkFtp } from '../systems/ftp'
import { isTurnOf, showsIn } from '../systems/pipeline'
import { asStep, useGame } from '../store'
import { useWorking } from '../components/Working'
import './editor.css'

/** `에디터` 창(VS코드). 사이트 업무의 **퍼블리싱 공정**이 여기서 돈다 — 피그마 시안 다음
 * 차례이자 그 업무의 **마지막 공정**이다(끝내면 업무가 완료된다).
 *
 * 실제 VS Code와 같은 네 자리(활동 표시줄 · 탐색기 · 편집기 · 상태 표시줄)다. 시각 언어는
 * 셸이 아니라 `editor.css`가 진다 — ⚠️ **이 리포에서 유일하게 어두운 창**이다.
 *
 * 동선: **FTP 연결 → 업체 폴더 → 그 업체의 남은 업무 → 실행**.
 * ⚠️ 업체는 `사내시스템 > 업체정보`의 접속 정보를 옮겨 적어야 열린다 — 관리자 페이지를
 *    주소창에 쳐야 닿는 것과 같은 규칙이다. 연결된 업체는 스토어 `ftpClients`가 진다
 *    (창을 닫아도 남는다 — 접속 정보를 매번 다시 치게 하면 왕복이 벌이 된다).
 * ⚠️ 맞는지 판정하는 것은 `systems/ftp.ts`의 순수 함수다. 이 컴포넌트는 그 답을 그린다.
 *
 * ⚠️ **팝업 업무는 여기 목록에 없다.** 팝업의 끝은 관리자 페이지 등록과 주차 넘김 판정이라
 *    여기서 완료 처리하면 클레임을 피하는 구멍이 된다(`store.publishJob`이 한 번 더 막는다). */

/** 한 업체 폴더 안의 파일들. 퍼블리싱이 손대는 것이 무엇인지 이름으로 말한다.
 *  ⚠️ 내용은 없다 — 파일을 여는 기능이 생기면 그때 정한다. */
const SITE_FILES = ['index.html', 'style.css', 'script.js'] as const

const FTP_FIELDS = [
  { key: 'host', label: '호스트' },
  { key: 'port', label: '포트' },
  { key: 'user', label: '계정' },
  { key: 'pw', label: '비밀번호' },
] as const

type FtpForm = Record<(typeof FTP_FIELDS)[number]['key'], string>
const EMPTY_FORM: FtpForm = { host: '', port: '', user: '', pw: '' }

export function Editor() {
  const jobs = useGame((s) => s.jobs)
  const ap = useGame((s) => s.ap)
  const cost = apCost(PUBLISH_AP, useGame((s) => s[skillFor('editor')]))
  // ⚠️ **누르기 전에 나올 등급을 적는다** — 제작 창들(포토샵·피그마·PPT)이 "행동력 N ·
  //    등급 X"를 적는 것과 같은 규칙이다. 모르고 누르는 버튼은 선택이 아니다.
  //    등급은 `gradeOf` 하나에서 나온다(밴드는 고정, 칸은 퍼블리싱 스탯).
  const grade = gradeOf(PUBLISH_QUALITY, useGame((s) => s.publishing))
  const ftpClients = useGame((s) => s.ftpClients)
  const clientIds = useGame((s) => s.clients)
  const connectFtp = useGame((s) => s.connectFtp)
  const publishJob = useGame((s) => s.publishJob)

  /** 고른 업체·연결 폼은 전부 `useState`다 — 창을 보는 방식이라 세이브에 들어가지 않는다. */
  const [openId, setOpenId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [form, setForm] = useState<FtpForm>(EMPTY_FORM)
  const [failed, setFailed] = useState(false)
  const work = useWorking()

  // ⚠️ 업체 목록의 정본은 `clientsOf(jobs)` 하나다 — 상수 `CLIENTS`를 직접 보면 수주센터로
  //    딴 업체가 여기 안 떠서 그 사이트 업무를 영영 끝낼 수 없다(겪은 구멍이다).
  const clients = clientsOf(jobs, clientIds)
  const connected = clients.filter((c) => ftpClients.includes(c.id))
  const open = connected.find((c) => c.id === openId) ?? null
  // **퍼블리싱 차례인 업무만** 선다(`systems/pipeline.ts`) — 시안이 안 끝난 사이트 업무도,
  // 팝업 업무도 여기 오지 않는다. 여기는 그 업체의 **지금 올릴 수 있는 일**의 목록이다.
  // 올린 뒤에도 **회신할 때까지는 남는다**(줄이 회신 대기라고 말한다) — 올리자마자 사라지면
  // 무엇을 올렸는지 확인할 자리가 없다.
  const todo = open ? jobs.filter((j) => j.from === open.name && showsIn(asStep(j), 'editor')) : []

  const submit = () => {
    const hit = checkFtp(form, clients)
    if (!hit) {
      setFailed(true)
      return
    }
    connectFtp(hit)
    setOpenId(hit)
    setConnecting(false)
    setFailed(false)
    // ⚠️ 비밀번호를 폼에 남겨 두지 않는다 — 다음에 열었을 때 남의 계정이 채워져 있으면
    //    옮겨 적는 동선이 사라진다.
    setForm(EMPTY_FORM)
  }

  return (
    <div className="ed">
      {/* 활동 표시줄은 표시다(버튼 아님) — editor.css 주석 참조. */}
      <div className="ed__rail" aria-hidden="true">
        <AppIcon name={EDITOR_ICONS.explorer} size={22} className="ed__rail-on" />
        <AppIcon name={EDITOR_ICONS.search} size={22} />
        <AppIcon name={EDITOR_ICONS.git} size={22} />
        <AppIcon name={EDITOR_ICONS.run} size={22} />
        <AppIcon name={EDITOR_ICONS.extensions} size={22} />
      </div>

      <nav className="ed__side" aria-label="탐색기">
        <div className="ed__head">
          <h3 className="ed__title">업체</h3>
          <button
            type="button"
            className="ed__connect"
            onClick={() => {
              setConnecting(true)
              setFailed(false)
            }}
          >
            <AppIcon name={EDITOR_ICONS.connect} size={14} />
            FTP 연결
          </button>
        </div>

        <div className="ed__tree">
          {connected.length === 0 ? (
            <p className="ed__blank">
              연결한 업체가 없다. <b>FTP 연결</b>에 업체의 접속 정보를 넣으면 그 폴더가 열린다
              (정보는 사내시스템 &gt; 업체정보에 있다).
            </p>
          ) : (
            connected.map((c) => (
              <div key={c.id}>
                <button
                  type="button"
                  className={`ed__folder${c.id === openId ? ' ed__folder--on' : ''}`}
                  aria-current={c.id === openId ? 'true' : undefined}
                  onClick={() => {
                    setOpenId(c.id)
                    setConnecting(false)
                  }}
                >
                  <AppIcon name={EDITOR_ICONS.folder} />
                  <span className="ed__label">{c.name}</span>
                </button>
                {/* 파일은 연 폴더만 펼친다 — 실제 탐색기와 같고, 목록이 길어지지 않는다. */}
                {c.id === openId &&
                  SITE_FILES.map((f) => (
                    <p key={f} className="ed__file">
                      <AppIcon name={EDITOR_ICONS.file} />
                      {f}
                    </p>
                  ))}
              </div>
            ))
          )}
        </div>
      </nav>

      <div className="ed__main">
        {connecting ? (
          <form
            className="ed__form"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <h3 className="ed__form-title">FTP 연결</h3>
            {/* ⚠️ 값을 여기 적어 주지 않는다 — **찾아서 옮겨 적는 왕복이 의도된 동선**이다
                (업체 관리자 페이지와 같은 규칙). 대신 **어디서 찾는지**는 말한다: 그것까지
                감추면 왕복이 아니라 수수께끼가 된다. */}
            <p className="ed__note">사내시스템 &gt; 업체정보에서 그 업체의 접속 정보를 확인해 옮겨 적는다.</p>
            {FTP_FIELDS.map((f) => (
              <label key={f.key} className="ed__field">
                <span className="ed__field-label">{f.label}</span>
                <input
                  className="ed__input"
                  type={f.key === 'pw' ? 'password' : 'text'}
                  value={form[f.key]}
                  onChange={(e) => {
                    setForm({ ...form, [f.key]: e.target.value })
                    setFailed(false)
                  }}
                  spellCheck={false}
                />
              </label>
            ))}
            {/* ⚠️ 어느 칸이 틀렸는지 알려 주지 않는다 — 알려 주면 한 칸씩 맞춰 보는 놀이가 된다. */}
            {failed && (
              <p className="ed__error" role="alert">
                <AppIcon name={EDITOR_ICONS.warn} size={16} />
                접속할 수 없다. 사내시스템 &gt; 업체정보의 값과 다시 대조해야 한다.
              </p>
            )}
            <div className="ed__form-buttons">
              <button type="submit" className="ed__btn ed__btn--go">
                연결
              </button>
              <button type="button" className="ed__btn" onClick={() => setConnecting(false)}>
                취소
              </button>
            </div>
          </form>
        ) : open ? (
          <section className="ed__jobs" aria-live="polite">
            <h3 className="ed__form-title">{open.name} · 남은 업무</h3>
            {todo.length === 0 ? (
              <p className="ed__note">
                지금 올릴 것이 없다. 앞 공정(화면정의서·시안)을 끝내고 회신하면 여기 뜬다 —
                팝업 업무는 포토샵과 관리자 페이지가 진다.
              </p>
            ) : (
              <ul className="ed__job-list">
                {todo.map((j) => (
                  <li key={j.id}>
                    {/* 누르면 **바로 실행된다**(행동력을 문다). 그래서 비용을 버튼 안에 적는다. */}
                    <button
                      type="button"
                      className="ed__job"
                      disabled={!isTurnOf(asStep(j), 'editor') || ap < cost}
                      onClick={() => {
                        publishJob(j.id)
                        // 퀄리티 선택은 없지만 **등급은 난다**(퍼블리싱 스탯이 정한다) —
                        // 결과를 안 보여 주면 스탯을 올릴 이유가 화면에서 사라진다.
                        work.show({ title: '퍼블리싱', grade })
                      }}
                    >
                      <AppIcon name={EDITOR_ICONS.publish} size={16} />
                      <span className="ed__label">{j.title}</span>
                      <span className="ed__job-meta">마감 {formatDate(j.due)}</span>
                      <span className="ed__job-cost">
                        {isTurnOf(asStep(j), 'editor')
                          ? `행동력 ${cost} · 등급 ${grade}`
                          : `올렸다 · ${CHANNEL_LABEL[j.channel]}에서 회신해야 끝난다`}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {ap < cost && todo.length > 0 && (
              <p className="ed__note">행동력이 모자란다. 다음 주가 되면 채워진다.</p>
            )}
          </section>
        ) : (
          <div className="ed__welcome-pane">
            <p className="ed__welcome">webdi</p>
            {/* 값은 `apCost`가 낸다(코딩 숙련도 감면이 이미 걸린 값이다) — 화면이
                따로 계산하지 않는다. */}
            <p className="ed__note">
              업체 폴더를 열면 그 업체의 남은 업무가 여기 뜬다. 올리면 행동력 {cost}를
              쓰고 등급 {grade}짜리 결과가 나온다 — 그 결과를 **그 일이 온 곳**(메일·고객게시판·
              톡톡)에서 회신해야 업무가 끝난다.
            </p>
          </div>
        )}
      </div>

      {/* 상태 표시줄은 읽는 띠다. 왼쪽은 지금 연 폴더, 오른쪽은 실제 VS Code의 고정 표기. */}
      <div className="ed__status">
        <span>{open ? `${open.name} · 남은 업무 ${todo.length}` : '폴더 없음'}</span>
        <span className="ed__status-right">UTF-8 · HTML</span>
      </div>
      {work.view}
    </div>
  )
}
