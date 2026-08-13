import type { ShopItem } from '../data/shop'

/** 살 수 있는가. **화면과 스토어가 같은 답을 쓴다** — 버튼만 흐리게 두면 스토어에 경로가
 *  남고, 스토어만 막으면 왜 안 되는지 화면이 말하지 못한다.
 *
 * ⚠️ 순수 함수다(`src/systems/` 규칙).
 * ⚠️ **상한에 닿은 것도 못 사게 막는다** — 사도 아무 일이 없는데 돈만 나가면 그건
 *    선택이 아니라 함정이다(숙련도 100, 정신력 최대). */
export type BuyBlock = 'bought' | 'money' | 'full'

export function buyBlock(
  item: ShopItem,
  have: { money: number; boughtIds: readonly string[]; mental: number; mentalMax: number; skills: Record<string, number> },
): BuyBlock | undefined {
  if (item.once && have.boughtIds.includes(item.id)) return 'bought'
  if ('skill' in item && (have.skills[item.skill] ?? 0) >= 100) return 'full'
  if ('mental' in item && have.mental >= have.mentalMax) return 'full'
  if (have.money < item.price) return 'money'
  return undefined
}

/** 못 사는 이유를 사람 말로. ⚠️ 색이나 흐린 버튼이 아니라 **글자가** 말한다. */
export const BUY_BLOCK_TEXT: Record<BuyBlock, string> = {
  bought: '이미 가지고 있습니다.',
  money: '소지금이 모자랍니다.',
  full: '지금은 더 올릴 자리가 없습니다.',
}
