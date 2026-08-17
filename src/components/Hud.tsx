import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AppIcon } from '../icons/AppIcon'
import { PROGRAM_ICONS, STAT_ICONS } from '../data/icons'
import {
  DEADLINE_URGENT_WEEKS,
  mentalPenalty,
  REPUTATION_CRISIS,
  REPUTATION_MAX,
  WORKDAY_COUNT,
} from '../data/game'
import { dayName, formatClock, formatDate, formatHours, formatSpan, toCalendar } from '../systems/calendar'
import { weekLeft } from '../systems/clock'
import { useGame } from '../store'

/** 오른쪽 위 계기판. **주차 판** 옆에 **스탯 판 + 업무목록 판**이 세로로 선다.
 *
 * ⚠️ 주차를 스탯 목록 안에 도로 넣지 마라. 시간은 오르내리는 값이 아니라 한 방향으로만
 *    가는 축이고, 나머지 넷과 같은 줄에 서면 "이번 달 몇째 주"라는 위치 정보가 숫자 하나로
 *    납작해진다.
 *
 * ⚠️ 업무목록은 **스탯과 같은 판에 넣지 않는다** — 스탯은 늘 네 줄이고 업무는 늘어나는
 *    목록이라, 한 판에 있으면 목록이 길어질 때 스탯이 어디서 끝나는지가 흐려진다.
 *
 * ⚠️ 셋 다 **창이 아니다**(공용 `Window` 미사용). 닫거나 옮길 수 있으면 상태를 못 보는
 *    판이 생기고 다시 여는 경로도 없다. 항상 보이는 계기판이다 — 바탕화면 아이콘으로
 *    빼지 말 것.
 *
 * ⚠️ 판(`--color-card`) 위여야 라벨에 `--color-muted-foreground`를 쓸 수 있다(4.76:1).
 *    바탕화면 위에 직접 얹으면 4.26:1로 미달이다.
 *
 * 아이콘은 mdi 한 세트로 통일한다(currentColor로 물들어야 하고, 다색이 섞이면 액센트가
 * 하나뿐인 이 팔레트의 절제가 무너진다). */
export function Hud() {
  const g = useGame()
  const lastDay = g.day >= WORKDAY_COUNT - 1
  const { year, month, weekOfMonth } = toCalendar(g.week)
  /** 넘기기 전에 묻는 창을 띄웠는가. ⚠️ 창을 보는 방식이라 `useState`다(세이브 밖). */
  const [asking, setAsking] = useState(false)

  return (
    <div className="hud">
      {/* 주차를 미는 자리는 **여기 하나뿐이다** — 시간이 적힌 판에 있어야 무엇이 움직이는지가
          보인다. 시간을 다 써도 그 주에 머물 수 있으므로, 넘기는 것은 늘 사람의 선택이다. */}
      <p className="hud__panel hud__week">
        <AppIcon name={STAT_ICONS.week} />
        {year}년 {month}월 {weekOfMonth}째 주
        {/* ⚠️ 손짓이 **둘로 갈린다**: 평일은 하루를 접고(`endDay`), 금요일 퇴근이 곧 주차
            넘김이다. 묻는 창은 **주를 넘길 때만** 뜬다 — 그때만 마감·정산·클레임이 돌기
            때문이다(하루를 접을 때 잃는 것은 그날 남은 시간뿐이고 그 값은 이미 적혀 있다). */}
        <button
          type="button"
          className="hud__next"
          onClick={() => (lastDay ? setAsking(true) : g.endDay())}
        >
          {lastDay ? '다음 주' : '퇴근'}
        </button>
      </p>

      {asking && (
        <Confirm
          left={weekLeft({ day: g.day, spent: g.spent }, g.dayMins)}
          dayMins={g.dayMins}
          onGo={() => {
            g.advanceWeek()
            setAsking(false)
          }}
          onCancel={() => setAsking(false)}
        />
      )}

      <div className="hud__col">
        <Stats />
        <Jobs />
      </div>
    </div>
  )
}

/** 스탯 판. **여기 하나가 정본이고 두 자리에서 쓰인다** — 넓은 화면에서는 계기판에 늘 서
 *  있고(위), 좁은 화면에서는 작업 표시줄의 팝오버 안에 선다(`Taskbar`).
 *
 * ⚠️ 판을 두 벌로 그리지 마라 — 스탯 줄이 늘거나 색이 바뀔 때 한쪽만 고치게 된다.
 *    어디에 서는지는 **CSS가 정한다**(`index.css`의 모바일 블록). */
export function Stats() {
  const g = useGame()

  return (
    <dl className="hud__panel stats" aria-label="회사 현황">
      {/* ⚠️ 시간은 **연속량이라 막대로 센다**(옛 행동력은 정수라 칸이었다 — `Ticks`가
          사라진 이유다). 값에는 **지금 시각과 오늘 남은 시간**을 함께 적는다: 하루 안에
          끝나는지를 재려면 남은 양만으로는 모자라고 몇 시인지가 필요하다.
          ⚠️ 이번 주에 남은 시간은 **자기 줄로** 선다(`stat__warn`) — 값 줄은 nowrap이라
          이어 붙이면 계기판이 화면 밖으로 밀려난다(겪었다). */}
      <Stat
        icon={STAT_ICONS.ap}
        label="시간"
        value={`${formatClock(g.spent)} · ${formatHours(g.dayMins - g.spent)}`}
        bar={<Bar value={g.dayMins - g.spent} max={g.dayMins} tone="accent" />}
        warn={`${dayName(g.day)}요일 · 이번 주 ${formatSpan(weekLeft({ day: g.day, spent: g.spent }, g.dayMins), g.dayMins)} 남음`}
      />
      {/* ⚠️ 정신력이 깎는 것은 **다음 주 하루 근무 시간**이라, 그 몫을 적지 않으면 다음
          주에 칸이 왜 줄었는지 알 자리가 없다(깎일 때가 아니라 깎이기 전에 읽힌다).
          깎을 것이 없으면 아무것도 붙지 않는다 — 늘 서 있는 라벨은 정보가 아니다.
          ⚠️ 값(`stat__value`)에 이어 붙이지 마라. 그 줄은 `white-space: nowrap`이라
          길어지면 `.hud__col`의 폭 상한을 뚫고 계기판이 화면 오른쪽 밖으로 밀려난다
          (겪었다) — 막대와 같은 자리에 **자기 줄로** 선다. */}
      <Stat
        icon={STAT_ICONS.mental}
        label="정신력"
        value={`${g.mental}/${g.mentalMax}`}
        bar={
          <>
            <Bar value={g.mental} max={g.mentalMax} tone="success" />
            {mentalPenalty(g.mental) > 0 && (
              <p className="stat__warn">다음 주 하루 −{formatSpan(mentalPenalty(g.mental), g.dayMins)}</p>
            )}
          </>
        }
      />
      {/* 평판만 기본색(primary)을 쓴다 — 위기에 destructive로 튀는 변화가 가장 커야 한다. */}
      <Stat
        icon={STAT_ICONS.reputation}
        label="회사평판"
        value={`${g.reputation}`}
        bar={
          <Bar
            value={g.reputation}
            max={REPUTATION_MAX}
            crisis={g.reputation < REPUTATION_CRISIS}
          />
        }
      />
      {/* 소지금은 막대가 없다 — 상한이 없는 값이라 채울 끝이 없다. 그래서 맨 아래다. */}
      <Stat
        icon={STAT_ICONS.money}
        label="소지금"
        value={`${g.money.toLocaleString('ko-KR')}원`}
      />
    </dl>
  )
}

/** 수주한 업무의 목록 판. 신규(메일)든 유지보수(고객게시판)든 견적을 보내면 여기 쌓인다.
 *
 * ⚠️ **읽는 목록이다 — 누르는 자리가 아니다.** 취소선은 업무를 실제로 끝냈을 때
 *    (`completeJob`) 자동으로 그어진다. 사람이 켜는 체크박스를 도로 달지 말 것. */
export function Jobs() {
  const jobs = useGame((s) => s.jobs)
  const week = useGame((s) => s.week)

  return (
    <section className="hud__panel hud__jobs" aria-label="업무목록">
      <p className="stat__label">
        <AppIcon name={STAT_ICONS.jobs} />
        업무목록
      </p>

      {jobs.length === 0 ? (
        <p className="hud__none">메일·고객게시판에서 견적을 보내면 여기 쌓인다.</p>
      ) : (
        <ul className="joblist">
          {jobs.map((j) => {
            const left = j.due - week
            return (
              <li
                key={j.id}
                className={`job${j.done ? ' job--done' : ''}`}
                title={`${j.from} · ${j.title}${j.breached ? ' (기한 초과로 파기)' : ''}`}
              >
                {/* 취소선만으로는 색맹·저시력에서 약하다 — 표식과 색이 함께 상태를 말한다.
                    ⚠️ **깨진 계약과 납품 완료는 다른 표식이다** — 둘 다 취소선이라 표식까지
                    같으면 목록에서 성공과 실패가 구분되지 않는다. */}
                <AppIcon
                  name={
                    j.breached
                      ? PROGRAM_ICONS.crisis
                      : j.done
                        ? STAT_ICONS.jobDone
                        : STAT_ICONS.jobOpen
                  }
                  className="job__mark"
                />
                <span className="job__from">{j.from}</span>
                <span className="job__title">{j.title}</span>
                {/* 마감은 **날짜로** 적는다 — 남은 주만 적으면 달력을 보며 계획을 세울 수
                    없다. 임박하면 빨갛게 서고, ⚠️ 색만으로 말하지 않게 남은 주를 읽는
                    이름에 함께 준다. */}
                <span
                  className={`job__due${left <= DEADLINE_URGENT_WEEKS ? ' job__due--soon' : ''}`}
                  aria-label={`마감 ${formatDate(j.due)} (${left}주 남음)`}
                >
                  {formatDate(j.due)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/** 주차를 넘기기 전에 묻는 창. **되돌릴 수 없는 일이라 한 번 묻는다** — 남은 시간은
 *  이월되지 않고, 어긋난 팝업이 있으면 그 자리에서 클레임이 들어온다.
 *
 * ⚠️ `window.confirm`을 쓰지 않는다. 브라우저 기본 대화상자는 이 가짜 OS의 시각 언어를
 *    깨고, **JS를 멈춰 세워** 실측 하네스(CDP)가 클릭도 스크린샷도 못 하게 만든다.
 *
 * ⚠️ `body`로 **포털**한다. 계기판은 `--z-desktop`(창이 덮는 층)이라 그 안에 그리면
 *    열린 창 뒤로 들어간다 — 물어보는 창이 창 뒤에 숨으면 아무것도 못 한다. */
function Confirm({
  left,
  dayMins,
  onGo,
  onCancel,
}: {
  left: number
  dayMins: number
  onGo: () => void
  onCancel: () => void
}) {
  return createPortal(
    <div className="confirm" role="dialog" aria-modal="true" aria-label="다음 주로">
      <div className="confirm__panel">
        <p className="confirm__title">다음 주로 넘어가시겠습니까?</p>
        <p className="confirm__note">
          {left > 0
            ? `이번 주에 남은 ${formatSpan(left, dayMins)}은 이월되지 않는다.`
            : '이번 주에 쓸 시간을 다 썼다.'}{' '}
          걸어 둔 팝업이 요청과 어긋나면 항의가 들어온다.
        </p>
        <div className="confirm__buttons">
          <button type="button" className="confirm__btn confirm__btn--go" onClick={onGo}>
            넘어가기
          </button>
          <button type="button" className="confirm__btn" onClick={onCancel}>
            취소
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Stat({
  icon,
  label,
  value,
  bar,
  warn,
}: {
  icon: string
  label: string
  value: string
  bar?: React.ReactNode
  /** 값 줄에 이어 붙일 수 없는 덧말(`stat__value`는 nowrap이다). 자기 줄로 선다. */
  warn?: string
}) {
  return (
    <div className={`stat${bar ? ' stat--bar' : ''}`}>
      <dt className="stat__label">
        <AppIcon name={icon} />
        {label}
      </dt>
      <dd className="stat__value">{value}</dd>
      {bar}
      {warn && <p className="stat__warn">{warn}</p>}
    </div>
  )
}

/** 연속량 막대. 숫자는 위 `dd`가 이미 읽어 주므로 막대는 장식이다(aria-hidden).
 *
 * ⚠️ 평판에 **위기선 눈금을 얹지 마라** — 위기선까지의 거리는 사내시스템 창이 지는 몫이고,
 *    그것마저 여기 오면 그 창의 회사현황 화면이 할 일이 없어진다. */
function Bar({
  value,
  max,
  tone,
  crisis,
}: {
  value: number
  max: number
  tone?: Tone
  crisis?: boolean
}) {
  return (
    <div className={`gauge${toneClass(tone)}${crisis ? ' gauge--crisis' : ''}`} aria-hidden="true">
      <div className="gauge__fill" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  )
}

/** 막대 색. ⚠️ **밝기가 아니라 색상으로** 가른다 — primary/secondary는 같은 인디고라
 *  8px 막대에서 구분이 안 됐다. 막대가 늘어난다고 없는 색을 지어내지 마라(그 순간 새 시각
 *  언어다). 색 값과 출처는 index.css의 `--color-success` 주석에 있다. */
type Tone = 'accent' | 'success'
const toneClass = (tone?: Tone) => (tone ? ` gauge--${tone}` : '')
