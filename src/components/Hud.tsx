import { AppIcon } from '../icons/AppIcon'
import { HUD_ICONS } from '../data/icons'
import { REPUTATION_CRISIS, REPUTATION_MAX } from '../data/game'
import { toCalendar } from '../systems/calendar'
import { useGame } from '../store'

/** 오른쪽 위 계기판. **주차 판 + 스탯 판** 두 장이 나란히 선다.
 *
 * ⚠️ 주차를 스탯 목록 안에 도로 넣지 마라. 시간은 오르내리는 값이 아니라 한 방향으로만
 *    가는 축이고, 나머지 넷과 같은 줄에 서면 "이번 달 몇째 주"라는 위치 정보가 숫자 하나로
 *    납작해진다.
 *
 * ⚠️ 공용 `Window`를 쓰지 않는다. 닫거나 옮길 수 있으면 상태를 못 보는 판이 생기고,
 *    다시 여는 경로(프로그램 아이콘)도 없다. 창이 아니라 항상 보이는 계기판이다.
 *
 * ⚠️ 두 판 모두 `--color-card` 위여야 라벨에 `--color-muted-foreground`를 쓸 수 있다(4.76:1).
 *    바탕화면 위에 직접 얹으면 4.26:1로 미달이라 안 된다 — 판을 빼지 말 것.
 *
 * HUD 아이콘은 mdi 한 세트로 통일한다(currentColor로 물들어야 하고, 다색이 섞이면
 * 액센트가 하나뿐인 이 팔레트의 절제가 무너진다). */
export function Hud() {
  const g = useGame()
  const { year, month, weekOfMonth } = toCalendar(g.week)

  return (
    <div className="hud">
      <p className="hud__panel hud__week">
        <AppIcon name={HUD_ICONS.week} />
        {year}년 {month}월 {weekOfMonth}째 주
      </p>

      <dl className="hud__panel hud__stats" aria-label="회사 현황">
        <Stat
          icon={HUD_ICONS.ap}
          label="행동력"
          value={`${g.ap}/${g.apMax}`}
          bar={<Ticks value={g.ap} max={g.apMax} />}
        />
        <Stat
          icon={HUD_ICONS.mental}
          label="정신력"
          value={`${g.mental}/${g.mentalMax}`}
          bar={<Bar value={g.mental} max={g.mentalMax} />}
        />
        <Stat icon={HUD_ICONS.money} label="소지금" value={`${g.money.toLocaleString('ko-KR')}원`} />
        <Stat
          icon={HUD_ICONS.reputation}
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
      </dl>
    </div>
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
    <div className={`hud__stat${bar ? ' hud__stat--bar' : ''}`}>
      <dt className="hud__label">
        <AppIcon name={icon} />
        {label}
      </dt>
      <dd className="hud__value">{value}</dd>
      {bar}
    </div>
  )
}

/** 연속량 막대. 숫자는 위 `dd`가 이미 읽어 주므로 막대는 장식이다(aria-hidden).
 *
 * ⚠️ 평판에 **위기선 눈금을 얹지 마라** — 위기선까지의 거리는 사내시스템 창이 지는 몫이고,
 *    그것마저 여기 오면 그 창의 회사현황 화면이 할 일이 없어진다. */
function Bar({ value, max, crisis }: { value: number; max: number; crisis?: boolean }) {
  return (
    <div className={`gauge${crisis ? ' gauge--crisis' : ''}`} aria-hidden="true">
      <div className="gauge__fill" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  )
}

/** 눈금 막대. ⚠️ 행동력은 **정수 자원**이라 칸으로 센다 — 연속 막대로 그리면 "2.5쯤 남았다"로
 *  읽히는데, 실제로는 공정 하나를 더 돌릴 수 있느냐 없느냐뿐이다.
 *  칸 수는 `apMax`라 회사레벨이 올라 최대치가 늘면 칸도 같이 는다. */
function Ticks({ value, max }: { value: number; max: number }) {
  return (
    <div className="gauge gauge--ticks" aria-hidden="true">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`gauge__tick${i < value ? ' gauge__tick--on' : ''}`} />
      ))}
    </div>
  )
}
