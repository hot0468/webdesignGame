import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { timeCost, QUALITY, skillFor } from '../data/game'
import { SLIDE_RANGE } from '../data/spec'
import { slideMins, slideShift, targetSlides } from '../systems/spec'
import { PPT_ICONS } from '../data/icons'
import { formatDate, formatSpan } from '../systems/calendar'
import { gradeOf } from '../systems/craft'
import { isTurnOf, showsIn } from '../systems/pipeline'
import { asStep, useClock, useGame } from '../store'
import { useWorking } from '../components/Working'
import { CHANNEL_LABEL } from '../data/inbox'
import './ppt.css'

/** 그 업무가 주문한 문서의 이름. 목록과 작업 창이 **같은 말**을 쓰게 한 곳에서 낸다. */
const what = (kind: string) => (kind === 'site' ? '화면정의서' : '발표자료')

/** 리본 탭 줄. ⚠️ **버튼이 아니라 표시다**(`Photoshop`의 도구 막대, `Editor`의 활동 표시줄과
 *  같은 판단) — 이 창에서 실제로 도는 것은 홈 탭 하나뿐이라 나머지는 갈 곳이 없다.
 *  그래도 그리는 이유는 리본 없는 파워포인트가 파워포인트로 안 읽히기 때문이다. */
const TABS = [
  '파일',
  '홈',
  '삽입',
  '그리기',
  '전환',
  '애니메이션',
  '슬라이드 쇼',
  '검토',
  '보기',
  '도움말',
] as const

/** `PPT` 창. 여기서 **두 가지**를 만든다: PPT 업무의 발표자료와, 신규 사이트 업무의 첫 공정인
 * **화면정의서**. 만드는 손이 같아서 화면도 하나다(무엇을 만든 것인지는 업무의 종류가 안다).
 *
 * ⚠️ **자기 차례인 업무만** 목록에 선다(`systems/pipeline.ts`) — 회신하지 않은 업무는
 *    다음 공정이 열리지 않으므로 여기서도 사라진다. 그것이 공정의 줄을 지키는 방식이다.
 *
 * 시각 언어는 **실제 파워포인트**다(`ppt.css`에 갇힌 자기 팔레트). 게임 기능은 그 자리에
 * 그대로 앉는다: **리본 = 제작 버튼 셋**(무엇을 하는가의 자리) · **왼쪽 레일 = 자기 차례인
 * 업무** · **캔버스 = 그 업무의 문서 한 장** · **상태 표시줄 = 회신 안내와 문서 수**. */
export function Ppt() {
  const jobs = useGame((s) => s.jobs)
  const slides = useGame((s) => s.slides)
  const clock = useClock()
  const skill = useGame((s) => s[skillFor('ppt')])
  const design = useGame((s) => s.design)
  const makeSlides = useGame((s) => s.makeSlides)
  const [pickedId, setPicked] = useState<string | null>(null)
  // ⚠️ 분량은 `useState`다(창을 보는 방식). 기본값을 **범위의 최소로 둔다** — 목표로
  //    미리 채우면 정답이 화면에 적히는 셈이라 의뢰서를 읽을 이유가 사라지고, 저울질도
  //    "그대로 두기"가 늘 정답이 된다. 늘리는 것은 플레이어의 손이다.
  const [count, setCount] = useState<number>(SLIDE_RANGE.min)
  const work = useWorking()

  // 만든 뒤에도 **회신할 때까지는 남는다** — 방금 만든 파일과 등급을 볼 자리가 있어야 한다.
  const todo = jobs.filter((j) => showsIn(asStep(j), 'ppt'))
  // 고르지 않았으면 첫 업무가 열려 있다(빈 패널을 보여 주지 않는다 — 포토샵과 같은 규칙).
  const picked = todo.find((j) => j.id === pickedId) ?? todo[0]
  const mine = picked ? slides.filter((d) => d.jobId === picked.id) : []
  // 만들고 나면 회신 전까지 다시 만들 수 없으므로 그때는 리본에서 버튼을 걷는다.
  const turn = picked ? isTurnOf(asStep(picked), 'ppt') : false

  return (
    <div className="ppt">
      <div className="ppt__titlebar">
        {picked ? `${what(picked.kind)}.pptx` : '프레젠테이션'} - PowerPoint
      </div>

      <div className="ppt__tabs" aria-hidden="true">
        {TABS.map((t) => (
          <span key={t} className={`ppt__tab${t === '홈' ? ' ppt__tab--on' : ''}`}>
            {t}
          </span>
        ))}
      </div>

      <div className="ppt__ribbon">
        {/* 분량 칸. ⚠️ **이것이 이 창의 판단이다** — 장수가 시간을 늘리고(`slideMins`)
            모자라면 등급이 깎인다(`slideShift`). 목표는 의뢰 글에 적혀 있다. */}
        {picked && turn && (
          <div className="ppt__group">
            <div className="ppt__slides">
              <button
                type="button"
                className="ppt__step"
                aria-label="한 장 줄이기"
                disabled={count <= SLIDE_RANGE.min}
                onClick={() => setCount((n) => Math.max(SLIDE_RANGE.min, n - 1))}
              >
                −
              </button>
              <span className="ppt__slides-n">{count}장</span>
              <button
                type="button"
                className="ppt__step"
                aria-label="한 장 늘리기"
                disabled={count >= SLIDE_RANGE.max}
                onClick={() => setCount((n) => Math.min(SLIDE_RANGE.max, n + 1))}
              >
                +
              </button>
            </div>
            <span className="ppt__group-label">분량</span>
          </div>
        )}

        <div className="ppt__group">
          <div className="ppt__buttons">
            {picked && turn ? (
              /* ⚠️ 얼마나 공들일지를 **누르기 전에** 알 수 있어야 고를 수 있다 — 버튼마다 무는
                 행동력과 지금 스탯이면 나올 등급을 함께 적는다(피그마·포토샵과 같은 규칙). */
              QUALITY.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  className="ppt__make"
                  disabled={!clock.can(timeCost(q.mins + slideMins(count), skill))}
                  onClick={() => {
                    makeSlides(picked.id, q.id, count)
                    // ⚠️ 만든 **뒤에** 스토어에서 결과를 집는다 — 등급의 정본은 파일이고
                    //    화면이 미리 계산하면 두 번째 출처가 된다(`gradeOf`를 여기서 부르지 않는다).
                    const made = useGame
                      .getState()
                      .slides.filter((d) => d.jobId === picked.id)
                      .at(-1)
                    if (made)
                      work.show({
                        title: what(picked.kind),
                        grade: made.grade,
                        thumb: { kind: 'doc', seed: made.id },
                      })
                  }}
                >
                  <AppIcon name={PPT_ICONS.make[q.id]} size={24} className="ppt__make-icon" />
                  {q.label}
                  <span className="ppt__cost">
                    {formatSpan(timeCost(q.mins + slideMins(count), skill), clock.dayMins)} ·{' '}
                    {gradeOf(q.id, design, slideShift(count, targetSlides(picked.id)))}
                    {clock.spill(timeCost(q.mins + slideMins(count), skill))}
                  </span>
                </button>
              ))
            ) : (
              <p className="ppt__note">
                {picked ? '회신하기 전에는 다시 만들 수 없다.' : '열린 문서가 없다.'}
              </p>
            )}
          </div>
          <span className="ppt__group-label">{picked ? what(picked.kind) : '슬라이드'}</span>
        </div>

        {picked && turn && !clock.can(timeCost(QUALITY[0].mins + slideMins(count), skill)) && (
          <p className="ppt__note">
            <AppIcon name={PPT_ICONS.warn} size={14} />
            이번 주에 남은 시간으로는 시작할 수 없다.
          </p>
        )}
      </div>

      <div className="ppt__rail">
        {todo.map((j, i) => (
          <button
            key={j.id}
            type="button"
            className={`ppt__slide${j.id === picked?.id ? ' ppt__slide--on' : ''}`}
            aria-pressed={j.id === picked?.id}
            onClick={() => setPicked(j.id)}
          >
            <span className="ppt__num">{i + 1}</span>
            <span className="ppt__thumb">
              <span className="ppt__thumb-title">{j.title}</span>
              <span className="ppt__thumb-bar" />
              <span className="ppt__thumb-bar" />
            </span>
            <span className="ppt__slide-from">{j.from}</span>
          </button>
        ))}
      </div>

      <div className="ppt__stage">
        {picked ? (
          <div className="ppt__paper">
            <div className="ppt__paper-title">{picked.title}</div>
            <p className="ppt__paper-sub">
              {picked.from} · {what(picked.kind)} · 마감 {formatDate(picked.due)}
            </p>
            {mine.length > 0 && (
              <ul className="ppt__docs">
                {mine.map((d) => (
                  <li key={d.id} className="ppt__doc" title={d.name}>
                    <AppIcon name={PPT_ICONS.doc} size={16} />
                    <span className="ppt__doc-name">{d.name}</span>
                    <span className="ppt__grade">{d.grade}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="ppt__blank">
            <div className="ppt__blank-title">지금 만들 문서가 없다</div>
            <p className="ppt__blank-note">
              PPT 업무를 수주하거나, 신규 사이트 업무를 받으면 첫 공정인 화면정의서가 여기 뜬다.
            </p>
          </div>
        )}
      </div>

      <div className="ppt__status">
        <span className="ppt__status-item">
          슬라이드 {picked ? todo.indexOf(picked) + 1 : 0}/{todo.length}
        </span>
        {picked && (
          <span>
            <b>{CHANNEL_LABEL[picked.channel]}</b>의 그 글에서 회신해야 다음으로
            넘어간다.
          </span>
        )}
        <span className="ppt__status-right">
          <span className="ppt__status-item">문서 {mine.length}개</span>
          <span className="ppt__views" aria-hidden="true">
            <AppIcon name={PPT_ICONS.viewNormal} size={14} className="ppt__view--on" />
            <AppIcon name={PPT_ICONS.viewSorter} size={14} />
            <AppIcon name={PPT_ICONS.viewRead} size={14} />
            <AppIcon name={PPT_ICONS.viewShow} size={14} />
          </span>
          <span className="ppt__zoom" aria-hidden="true" />
          <span className="ppt__status-item">100%</span>
        </span>
      </div>
      {work.view}
    </div>
  )
}
