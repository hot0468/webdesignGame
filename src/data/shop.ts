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
] as const satisfies readonly ShopItem[]

export type ShopItemId = (typeof SHOP_ITEMS)[number]['id']

/** ⚠️ 넓은 `ShopItem`으로 돌려준다 — 리터럴 유니온 그대로면 `once`가 **없는 갈래**가 생겨
 *  부르는 쪽이 매번 갈래를 갈라야 한다(있는 것/없는 것이 아니라 optional 하나면 된다). */
export const findItem = (id: ShopItemId): ShopItem => SHOP_ITEMS.find((i) => i.id === id)!
