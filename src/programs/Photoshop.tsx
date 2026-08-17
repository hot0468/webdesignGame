import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { PHOTOSHOP_ICONS, PROGRAM_ICONS } from '../data/icons'
import { timeCost, QUALITY, skillFor } from '../data/game'
import { POPUP_SIZES } from '../data/spec'
import { gradeOf } from '../systems/craft'
import { formatPeriod, formatSpan } from '../systems/calendar'
import { isTurnOf, showsIn } from '../systems/pipeline'
import { asStep, useClock, useGame } from '../store'
import { useWorking } from '../components/Working'
import './photoshop.css'
import { CHANNEL_LABEL } from '../data/inbox'

/** `포토샵` 창. 팝업 업무의 **제작 공정**이 여기서 돈다(그다음이 브라우저에서의 등록).
 *
 * 실제 포토샵의 네 칸(도구 막대 · 문서 탭 · 캔버스 · 오른쪽 패널)이다. 시각 언어는 셸이
 * 아니라 `photoshop.css`가 진다 — 프로그램 창은 자기 팔레트를 가둔다(`mail.css`와 같은 규칙).
 *
 * ⚠️ **비용을 지는 쪽은 여기다**(고른 퀄리티의 행동력). 등록(관리자 페이지)은 값을 물리지
 *    않는다 — 한 팝업에 두 번 값을 물리지 않으려는 구분이라 되돌리지 말 것.
 *
 * ⚠️ 만든 파일은 **어느 업무 것이든 전부 등록 화면에 뜬다**. 여기서 업체별로 갈라
 *    "맞는 것만" 보이게 하면 이 고리의 실수(틀린 파일)가 성립하지 않는다.
 *
 * ⚠️ 포토샵의 겉모습 중 **실제로 동작하는 것은 문서 탭과 제작 버튼뿐**이다. 도구 막대는
 *    표시고(`photoshop.css` 참고), 메뉴·옵션바는 아예 그리지 않는다 — 눌러도 아무 일 없는
 *    컨트롤은 이 프로젝트가 금지한다.
 *
 * ⚠️ 고른 문서는 `useState`다. 스토어에 넣으면 세이브에 들어가고, 창을 보는 방식 때문에
 *    세이브 버전을 올리게 된다. */
export function Photoshop() {
  const jobs = useGame((s) => s.jobs)
  const files = useGame((s) => s.files)
  const clock = useClock()
  const skill = useGame((s) => s[skillFor('photoshop')])
  const design = useGame((s) => s.design)
  const makePopup = useGame((s) => s.makePopup)
  const [openId, setOpenId] = useState<string | null>(null)
  // ⚠️ 고른 규격은 `useState`다 — 창을 보는 방식이지 게임 상태가 아니다. 기본값을
  //    **첫 후보로 두지 않고 비워 둔다**: 미리 채워 두면 아무 생각 없이 눌러도 6분의 1로
  //    맞아 버려, 의뢰서를 읽는 일이 선택이 아니라 운이 된다.
  const [sizeIdx, setSizeIdx] = useState<number | null>(null)
  const size = sizeIdx === null ? undefined : POPUP_SIZES[sizeIdx]
  const work = useWorking()

  // **제작 차례인 팝업 업무만** 선다(`systems/pipeline.ts`) — 끝난 업무도, 이미 만들어 놓고
  // 아직 회신하지 않은 업무도 빠진다. 끝난 일의 버튼을 살려 두면 행동력만 새어 나간다.
  const popupJobs = jobs.filter((j) => showsIn(asStep(j), 'photoshop'))
  // 탭을 아직 안 골랐거나 고른 업무가 사라졌으면 첫 문서를 연다(빈 캔버스를 보여 주지 않는다).
  const open = popupJobs.find((j) => j.id === openId) ?? popupJobs[0]
  const mine = open ? files.filter((f) => f.jobId === open.id) : []

  return (
    <div className="ps">
      {/* 도구 막대. ⚠️ 표시다 — 브러시만 켜져 있고 나머지는 갈 곳이 없다. */}
      <div className="ps__tools" aria-hidden="true">
        {TOOLS.map((t) => (
          <span key={t.name} className={`ps__tool${t.on ? ' ps__tool--on' : ''}`}>
            <AppIcon name={t.name} size={18} />
          </span>
        ))}
      </div>

      <div className="ps__tabs" role="tablist" aria-label="열린 문서">
        {popupJobs.map((j) => (
          <button
            key={j.id}
            type="button"
            role="tab"
            aria-selected={j.id === open?.id}
            className={`ps__tab${j.id === open?.id ? ' ps__tab--on' : ''}`}
            onClick={() => setOpenId(j.id)}
          >
            {j.from}_팝업.psd
          </button>
        ))}
      </div>

      {!open ? (
        <p className="ps__blank">
          열린 문서가 없다. 팝업 업무를 수주하면 여기서 이미지를 만든다.
        </p>
      ) : (
        <div className="ps__canvas">
          {/* 아트보드가 곧 만들 팝업이다. 만들기 전에는 투명 격자(빈 문서)로 선다. */}
          <div className={`ps__art${mine.length === 0 ? ' ps__art--empty' : ''}`}>
            <p className="ps__art-client">{open.from}</p>
            <p className="ps__art-period">게시 {formatPeriod(open.popup!.from, open.popup!.to)}</p>
          </div>
          {/* ⚠️ **요청 규격이 아니라 내가 고른 규격**이다 — 여기에 정답을 적으면
              의뢰서를 읽는 왕복이 사라진다. */}
          <p className="ps__size">
            {open.title}
            {size ? ` · ${size.w}×${size.h}` : ' · 규격 미정'}
          </p>
        </div>
      )}

      <div className="ps__panels">
        {/* 레이어 패널이 곧 **만든 파일 목록**이다 — 관리자 페이지의 등록 화면에서 고를 것들. */}
        <p className="ps__panel-head">
          <AppIcon name={PHOTOSHOP_ICONS.layers} size={16} />
          레이어
        </p>
        {mine.length === 0 ? (
          <p className="ps__none">
            {open ? '아직 만든 이미지가 없다.' : '문서를 열면 레이어가 선다.'}
          </p>
        ) : (
          <ul className="ps__layers">
            {mine.map((f) => (
              <li key={f.id} className="ps__layer" title={f.name}>
                <AppIcon name={PROGRAM_ICONS.file} size={16} />
                <span className="ps__layer-name">{f.name}</span>
                {/* 등급은 만든 순간 굳는다 — 같은 업무의 두 파일이 서로 다른 등급일 수 있다. */}
                <span className="ps__grade">{f.grade}</span>
              </li>
            ))}
          </ul>
        )}

        {/* 만들고 나면 회신 전까지 다시 만들 수 없다(공정 하나에 한 번) — 그때는 버튼 대신
            다음에 할 일을 적는다. */}
        {open && !isTurnOf(asStep(open), 'photoshop') && (
          <p className="ps__short">
            만들었다. {CHANNEL_LABEL[open.channel]}의 그 글에서 회신해야 등록
            공정이 열린다.
          </p>
        )}
        {open && isTurnOf(asStep(open), 'photoshop') && (
          <div className="ps__makes">
            {/* ⚠️ 얼마나 공들일지를 **누르기 전에** 알 수 있어야 고를 수 있다 —
                버튼마다 무는 시간과 지금 스탯이면 나올 등급을 함께 적는다. */}
            <p className="ps__panel-head">새 문서</p>
            {/* ⚠️ 답을 적지 않는다 — **어디서 찾는지**만 말한다(에디터 FTP와 같은 규칙).
                그것까지 감추면 왕복이 아니라 수수께끼가 된다. */}
            <select
              className="ps__select"
              aria-label="캔버스 규격"
              value={sizeIdx ?? ''}
              onChange={(e) => setSizeIdx(e.target.value === '' ? null : Number(e.target.value))}
            >
              <option value="">규격 고르기…</option>
              {POPUP_SIZES.map((sz, i) => (
                <option key={`${sz.w}x${sz.h}`} value={i}>
                  {sz.w} × {sz.h}
                </option>
              ))}
            </select>
            <p className="ps__hint">의뢰 글의 <b>요청 규격</b>과 같아야 등급이 안 깎인다.</p>

            <p className="ps__panel-head">팝업 만들기</p>
            {QUALITY.map((q) => (
              <button
                key={q.id}
                type="button"
                className="ps__make"
                disabled={!size || !clock.can(timeCost(q.mins, skill))}
                onClick={() => {
                  makePopup(open.id, q.id, size)
                  // ⚠️ 등급은 만든 **뒤에** 파일에서 집는다(등급의 정본은 파일이다).
                  const made = useGame
                    .getState()
                    .files.filter((f) => f.jobId === open.id)
                    .at(-1)
                  if (made)
                    work.show({
                      title: '팝업 이미지',
                      grade: made.grade,
                      thumb: { kind: 'popup', seed: made.id },
                    })
                }}
              >
                {q.label}
                <span className="ps__cost">
                  {formatSpan(timeCost(q.mins, skill), clock.dayMins)} · {gradeOf(q.id, design)}
                </span>
              </button>
            ))}
            {!size && <p className="ps__short">캔버스 규격을 골라야 만들 수 있다.</p>}
            {!clock.can(timeCost(QUALITY[0].mins, skill)) && (
              <p className="ps__short">이번 주에 남은 시간으로는 시작할 수 없다.</p>
            )}
          </div>
        )}
      </div>
      {work.view}
    </div>
  )
}

/** 도구 막대의 글리프 순서. 실제 포토샵의 위에서부터 순서다(이동 → 선택 → 자르기 → 그리기 →
 *  글자 → 도형). ⚠️ 브러시만 켜져 있다 — 이 게임의 제작은 이미지를 그리는 일이다. */
const TOOLS = [
  { name: PHOTOSHOP_ICONS.move },
  { name: PHOTOSHOP_ICONS.marquee },
  { name: PHOTOSHOP_ICONS.lasso },
  { name: PHOTOSHOP_ICONS.crop },
  { name: PHOTOSHOP_ICONS.brush, on: true },
  { name: PHOTOSHOP_ICONS.eraser },
  { name: PHOTOSHOP_ICONS.text },
  { name: PHOTOSHOP_ICONS.shape },
]
