import { AppIcon } from '../icons/AppIcon'
import { HUD_ICONS } from '../data/icons'
import { useGame } from '../store'

/** 스탯 패널. 오른쪽 위에 고정된 셸 크롬이다 — 작업 표시줄과 분리되어 있다.
 *
 * ⚠️ 공용 `Window`를 쓰지 않는다. 닫거나 옮길 수 있으면 상태를 못 보는 판이 생기고,
 *    다시 여는 경로(프로그램 아이콘)도 없다. 창이 아니라 항상 보이는 계기판이다.
 *
 * ⚠️ 판이 `--color-card` 위이므로 라벨에 `--color-muted-foreground`를 쓸 수 있다(4.76:1).
 *    바탕화면 위에 직접 얹으면 4.26:1로 미달이라 안 된다 — 판을 빼지 말 것.
 *
 * HUD 아이콘은 mdi 한 세트로 통일한다(currentColor로 물들어야 하고, 다색이 섞이면
 * 액센트가 하나뿐인 이 팔레트의 절제가 무너진다). */
export function Hud() {
  const g = useGame()

  return (
    <dl className="hud" aria-label="회사 현황">
      {/* 주차는 여기 없다 — 시간은 작업 표시줄 왼쪽이 진다(`Taskbar`). */}
      <Stat icon={HUD_ICONS.ap} label="행동력" value={`${g.ap}/${g.apMax}`} />
      <Stat icon={HUD_ICONS.mental} label="정신력" value={`${g.mental}/${g.mentalMax}`} />
      <Stat icon={HUD_ICONS.money} label="소지금" value={`${g.money.toLocaleString('ko-KR')}원`} />
      <Stat icon={HUD_ICONS.reputation} label="회사평판" value={`${g.reputation}`} />
    </dl>
  )
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="hud__stat">
      <dt className="hud__label">
        <AppIcon name={icon} />
        {label}
      </dt>
      <dd className="hud__value">{value}</dd>
    </div>
  )
}
