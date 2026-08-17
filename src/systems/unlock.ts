import { companyLevel } from '../data/game'
import type { Message } from '../data/inbox'
import { SHORTCUTS, type ShortcutId } from '../data/sites'
import { formatWeek } from './calendar'

/** 해금 판정. **순수 함수다**(`src/systems/` 규칙 — React·mutation·`Math.random` 없음).
 *
 * ⚠️ **판정하는 곳은 여기 하나다.** 첫화면 목록·주소 해석·브라우저 화면이 전부 이것을
 *    부른다 — 갈리면 "목록엔 잠겼다고 적혀 있는데 주소를 치면 들어가진다"가 된다
 *    (`timeCost`·`bidStats`가 한 함수인 것과 같은 이유).
 *
 * ⚠️ **저장하지 않는다.** 해금은 누적 매출에서 파생하고, 누적 매출은 줄지 않으므로
 *    한 번 열린 것은 닫히지 않는다 — 따로 상태 축을 만들면 그 둘이 어긋날 자리가 생긴다.
 */

/** 그 사이트가 지금 열려 있는가. */
export function siteOpen(id: ShortcutId, revenue: number): boolean {
  const site = SHORTCUTS.find((s) => s.id === id)
  return site !== undefined && companyLevel(revenue).level >= site.minLevel
}

/** 그 사이트가 열리는 회사레벨. 화면이 "레벨 N부터"를 적을 때 쓴다. */
export const siteMinLevel = (id: ShortcutId): number =>
  SHORTCUTS.find((s) => s.id === id)?.minLevel ?? 1

/** **이번에 새로 열린** 사이트들. 대금이 들어오는 자리가 알림 메일을 만들 때 쓴다.
 *
 * ⚠️ 두 매출을 받아 **경계를 넘은 것만** 낸다 — "지금 열려 있는 것"을 매번 알리면
 *    같은 알림이 계속 온다. 해금은 넘는 순간에만 사건이다. */
export const newlyOpened = (before: number, after: number): ShortcutId[] =>
  SHORTCUTS.filter((s) => !siteOpen(s.id, before) && siteOpen(s.id, after)).map((s) => s.id)

/** 해금 알림. ⚠️ **`ad: true` 갈래다** — 알리는 글이지 의뢰가 아니라서 견적보내기가
 *  붙으면 안 된다(클레임·입찰 낙방 메일과 같은 이유).
 *
 * ⚠️ **주소를 함께 적는다.** 첫화면 바로가기로도 갈 수 있지만, 이 게임은 주소를 쳐서
 *    가는 것이 기본 동선이라 열렸다는 말과 갈 길이 한 줄에 있어야 한다. */
export function unlockMail(ids: readonly ShortcutId[], week: number): Message {
  const sites = ids.map((id) => SHORTCUTS.find((s) => s.id === id)!)
  const lines = sites.map((s) => `- ${s.name} (${s.url})`).join('\n')
  return {
    id: `unlock:${week}:${ids.join(',')}`,
    channel: 'mail',
    from: '웹디검색',
    subject: `이제 이용할 수 있는 사이트가 늘었습니다`,
    body:
      `회사가 커지면서 새로 이용할 수 있게 된 곳을 알려 드립니다.\n${lines}\n\n` +
      `브라우저 첫화면에서 바로 갈 수 있습니다.`,
    at: formatWeek(week),
    ad: true,
  }
}
