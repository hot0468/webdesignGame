import { AppIcon } from '../icons/AppIcon'
import { STAT_ICONS } from '../data/icons'
import { DEADLINE_URGENT_WEEKS, REPUTATION_CRISIS, REPUTATION_MAX } from '../data/game'
import { formatWeek, toCalendar } from '../systems/calendar'
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
  const { year, month, weekOfMonth } = toCalendar(g.week)

  return (
    <div className="hud">
      <p className="hud__panel hud__week">
        <AppIcon name={STAT_ICONS.week} />
        {year}년 {month}월 {weekOfMonth}째 주
      </p>

      <div className="hud__col">
        <dl className="hud__panel stats" aria-label="회사 현황">
          <Stat
            icon={STAT_ICONS.ap}
            label="행동력"
            value={`${g.ap}/${g.apMax}`}
            bar={<Ticks value={g.ap} max={g.apMax} tone="accent" />}
          />
          <Stat
            icon={STAT_ICONS.mental}
            label="정신력"
            value={`${g.mental}/${g.mentalMax}`}
            bar={<Bar value={g.mental} max={g.mentalMax} tone="success" />}
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

        <Jobs />
      </div>
    </div>
  )
}

/** 수주한 업무의 목록 판. 신규(메일)든 유지보수(고객게시판)든 견적을 보내면 여기 쌓인다.
 *
 * ⚠️ **읽는 목록이다 — 누르는 자리가 아니다.** 취소선은 업무를 실제로 끝냈을 때
 *    (`completeJob`) 자동으로 그어진다. 사람이 켜는 체크박스를 도로 달지 말 것. */
function Jobs() {
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
                title={`${j.from} · ${j.title}`}
              >
                {/* 취소선만으로는 색맹·저시력에서 약하다 — 표식과 색이 함께 상태를 말한다. */}
                <AppIcon
                  name={j.done ? STAT_ICONS.jobDone : STAT_ICONS.jobOpen}
                  className="job__mark"
                />
                <span className="job__from">{j.from}</span>
                <span className="job__title">{j.title}</span>
                {/* 마감은 **날짜로** 적는다 — 남은 주만 적으면 달력을 보며 계획을 세울 수
                    없다. 임박하면 빨갛게 서고, ⚠️ 색만으로 말하지 않게 남은 주를 읽는
                    이름에 함께 준다. */}
                <span
                  className={`job__due${left <= DEADLINE_URGENT_WEEKS ? ' job__due--soon' : ''}`}
                  aria-label={`마감 ${formatWeek(j.due)} (${left}주 남음)`}
                >
                  {formatWeek(j.due)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Stat({
  icon,
  label,
  value,
  bar,
}: {
  icon: string
  label: string
  value: string
  bar?: React.ReactNode
}) {
  return (
    <div className={`stat${bar ? ' stat--bar' : ''}`}>
      <dt className="stat__label">
        <AppIcon name={icon} />
        {label}
      </dt>
      <dd className="stat__value">{value}</dd>
      {bar}
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

/** 눈금 막대. ⚠️ 행동력은 **정수 자원**이라 칸으로 센다 — 연속 막대로 그리면 "2.5쯤 남았다"로
 *  읽히는데, 실제로는 공정 하나를 더 돌릴 수 있느냐 없느냐뿐이다.
 *  칸 수는 `apMax`라 회사레벨이 올라 최대치가 늘면 칸도 같이 는다. */
function Ticks({ value, max, tone }: { value: number; max: number; tone?: Tone }) {
  return (
    <div className={`gauge gauge--ticks${toneClass(tone)}`} aria-hidden="true">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`gauge__tick${i < value ? ' gauge__tick--on' : ''}`} />
      ))}
    </div>
  )
}

/** 막대 색. ⚠️ **밝기가 아니라 색상으로** 가른다 — primary/secondary는 같은 인디고라
 *  8px 막대에서 구분이 안 됐다. 막대가 늘어난다고 없는 색을 지어내지 마라(그 순간 새 시각
 *  언어다). 색 값과 출처는 index.css의 `--color-success` 주석에 있다. */
type Tone = 'accent' | 'success'
const toneClass = (tone?: Tone) => (tone ? ` gauge--${tone}` : '')
