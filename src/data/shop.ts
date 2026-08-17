/** 쇼핑몰에서 파는 것. **소지금이 나가는 유일한 출구다**(급여·월정액은 자동으로 빠지고,
 *  이쪽만 사람이 고른다) — 벌기만 하고 쓸 데가 없으면 대금이 숫자로만 커진다.
 *
 * ⚠️ 파는 것은 **이미 있는 축**만 민다: 숙련도 3종과 정신력. 새 축(장비 슬롯·내구도 따위)을
 *    만들면 상점 하나 때문에 게임이 두 겹으로 늘어난다.
 * ⚠️ 숙련도는 `gainSkill`이 100에서 자르고 정신력은 `mentalMax`에서 잘린다 — **상한 위로
 *    사면 돈만 나간다**. 그래서 화면이 "이미 최고다"를 먼저 말한다(`ShopSite.tsx`).
 * ⚠️ 값은 스펙에 없는 **임시치**다. 기준은 "사이트 한 건(150만)이면 장비 하나"다. */

import type { SkillId } from './game'

export type ShopItem = {
  id: string
  name: string
  desc: string
  price: number
  /** 한 번만 살 수 있는가(장비). 없으면 소모품이라 반복해서 산다. */
  once?: true
} & ({ skill: SkillId; gain: number } | { mental: number })

export const SHOP_ITEMS = [
  {
    id: 'tablet',
    name: '액정 타블렛',
    desc: '손이 화면에 붙어 시안 작업이 빨라집니다. 피그마 숙련도가 오릅니다.',
    price: 900_000,
    once: true,
    skill: 'figmaSkill',
    gain: 15,
  },
  {
    id: 'wacom-pen',
    name: '보정 펜촉 세트',
    desc: '선이 덜 떨립니다. 포토샵 숙련도가 오릅니다.',
    price: 700_000,
    once: true,
    skill: 'photoshopSkill',
    gain: 15,
  },
  {
    id: 'keyboard',
    name: '기계식 키보드',
    desc: '오타가 줄고 손목이 덜 아픕니다. 코딩 숙련도가 오릅니다.',
    price: 600_000,
    once: true,
    skill: 'codingSkill',
    gain: 15,
  },
  // ── 둘째 장비 단 ─────────────────────────────────────────
  // ⚠️ 첫 장비(+15)를 산 뒤에도 **살 것이 남아 있어야** 상점이 초반 한 번 들르고 끝나는
  //    곳이 안 된다. 값은 첫 단의 두 배 남짓이고 오르는 폭은 절반이다(+8) — 같은 축을
  //    두 번째로 밀 때는 덜 오르는 것이 자연스럽고, 그래야 100 상한에 바로 닿지 않는다.
  {
    id: 'monitor',
    name: '색 보정 모니터',
    desc: '색이 화면마다 달라 보이지 않습니다. 피그마 숙련도가 조금 더 오릅니다.',
    price: 1_800_000,
    once: true,
    skill: 'figmaSkill',
    gain: 8,
  },
  {
    id: 'plugin-pack',
    name: '리터칭 플러그인 묶음',
    desc: '반복 작업이 한 번에 끝납니다. 포토샵 숙련도가 조금 더 오릅니다.',
    price: 1_400_000,
    once: true,
    skill: 'photoshopSkill',
    gain: 8,
  },
  {
    id: 'ide-license',
    name: '유료 코드 편집기',
    desc: '자동 완성이 손보다 빠릅니다. 코딩 숙련도가 조금 더 오릅니다.',
    price: 1_200_000,
    once: true,
    skill: 'codingSkill',
    gain: 8,
  },
  {
    id: 'coffee',
    name: '캡슐 커피 한 박스',
    desc: '한 주는 버틸 만합니다. 정신력이 회복됩니다.',
    price: 80_000,
    mental: 20,
  },
  {
    id: 'chair',
    name: '허리 받쳐 주는 의자',
    desc: '앉아 있는 시간이 덜 괴롭습니다. 정신력이 크게 회복됩니다.',
    price: 400_000,
    mental: 45,
  },
  // ⚠️ 소모품은 **`once`가 없다** — 반복해서 산다. 정신력 회복은 상한(100)에서 잘리므로
  //    큰 것 하나보다 필요할 때 맞춰 사는 쪽이 낫도록 폭을 갈라 둔다.
  {
    id: 'day-off',
    name: '하루 연차',
    desc: '하루 통째로 쉽니다. 정신력이 가장 크게 회복됩니다.',
    price: 900_000,
    mental: 70,
  },
] as const satisfies readonly ShopItem[]

export type ShopItemId = (typeof SHOP_ITEMS)[number]['id']

/** ⚠️ 넓은 `ShopItem`으로 돌려준다 — 리터럴 유니온 그대로면 `once`가 **없는 갈래**가 생겨
 *  부르는 쪽이 매번 갈래를 갈라야 한다(있는 것/없는 것이 아니라 optional 하나면 된다). */
export const findItem = (id: ShopItemId): ShopItem => SHOP_ITEMS.find((i) => i.id === id)!
