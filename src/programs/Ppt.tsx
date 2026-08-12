import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { QUALITY } from '../data/game'
import { PROGRAM_ICONS } from '../data/icons'
import { formatDate } from '../systems/calendar'
import { gradeOf } from '../systems/craft'
import { isTurnOf, showsIn } from '../systems/pipeline'
import { asStep, useGame } from '../store'

/** `PPT` 창. 여기서 **두 가지**를 만든다: PPT 업무의 발표자료와, 신규 사이트 업무의 첫 공정인
 * **화면정의서**. 만드는 손이 같아서 화면도 하나다(무엇을 만든 것인지는 업무의 종류가 안다).
 *
 * ⚠️ **자기 차례인 업무만** 목록에 선다(`systems/pipeline.ts`) — 회신하지 않은 업무는
 *    다음 공정이 열리지 않으므로 여기서도 사라진다. 그것이 공정의 줄을 지키는 방식이다.
 *
 * ⚠️ 시각 언어는 셸 그대로다(작은 창). 파워포인트 흉내를 내려면 자기 팔레트가 필요한데,
 *    이 창이 하는 일은 목록에서 하나 골라 퀄리티를 정하는 것뿐이라 아직 그럴 값이 없다. */
export function Ppt() {
  const jobs = useGame((s) => s.jobs)
  const slides = useGame((s) => s.slides)
  const ap = useGame((s) => s.ap)
  const design = useGame((s) => s.design)
  const makeSlides = useGame((s) => s.makeSlides)
  const [pickedId, setPicked] = useState<string | null>(null)

  // 만든 뒤에도 **회신할 때까지는 남는다** — 방금 만든 파일과 등급을 볼 자리가 있어야 한다.
  const todo = jobs.filter((j) => showsIn(asStep(j), 'ppt'))
  // 고르지 않았으면 첫 업무가 열려 있다(빈 패널을 보여 주지 않는다 — 포토샵과 같은 규칙).
  const picked = todo.find((j) => j.id === pickedId) ?? todo[0]
  const mine = picked ? slides.filter((d) => d.jobId === picked.id) : []

  if (todo.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">지금 만들 문서가 없다</p>
        <p className="empty__note">
          PPT 업무를 수주하거나, 신규 사이트 업무를 받으면 첫 공정인 화면정의서가 여기 뜬다.
        </p>
      </div>
    )
  }

  return (
    <div className="ppt">
      <div className="ppt__list">
        {todo.map((j) => (
          <button
            key={j.id}
            type="button"
            className={`ppt__job${j.id === picked?.id ? ' ppt__job--on' : ''}`}
            aria-pressed={j.id === picked?.id}
            onClick={() => setPicked(j.id)}
          >
            <span className="ppt__title">{j.title}</span>
            <span className="ppt__meta">
              {j.from} · {j.kind === 'site' ? '화면정의서' : '발표자료'} · 마감{' '}
              {formatDate(j.due)}
            </span>
          </button>
        ))}
      </div>

      {picked && (
        <>
          {mine.length > 0 && (
            <ul className="ppt__files">
              {mine.map((d) => (
                <li key={d.id} className="ppt__file" title={d.name}>
                  <AppIcon name={PROGRAM_ICONS.file} size={14} />
                  <span className="ppt__label">{d.name}</span>
                  <span className="ppt__grade">{d.grade}</span>
                </li>
              ))}
            </ul>
          )}

          {/* ⚠️ 얼마나 공들일지를 **누르기 전에** 알 수 있어야 고를 수 있다 — 버튼마다 무는
              행동력과 지금 스탯이면 나올 등급을 함께 적는다(피그마·포토샵과 같은 규칙).
              만들고 나면 회신 전까지 다시 만들 수 없으므로 그때는 버튼을 걷는다. */}
          {isTurnOf(asStep(picked), 'ppt') && (
            <>
              <div className="ppt__makes">
                {QUALITY.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    className="ppt__make"
                    disabled={ap < q.ap}
                    onClick={() => makeSlides(picked.id, q.id)}
                  >
                    {q.label}
                    <span className="ppt__cost">
                      행동력 {q.ap} · {gradeOf(q.id, design)}
                    </span>
                  </button>
                ))}
              </div>
              {ap < QUALITY[0].ap && <p className="ppt__short">행동력이 모자란다.</p>}
            </>
          )}
          <p className="ppt__short">
            <b>{picked.channel === 'board' ? '고객게시판' : '메일'}</b>의 그 글에서 회신해야 다음으로
            넘어간다.
          </p>
        </>
      )}
    </div>
  )
}
