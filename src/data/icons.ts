/** 아이콘 이름의 단일 출처. 규칙은 .claude/skills/project-context/references/icons.md.
 *
 * 세트 배분:
 *  - 바탕화면 앱 아이콘 = `fluent-color`(다색). ⚠️ CSS color를 입히지 않는다.
 *  - HUD·셸 크롬 = `mdi` 단색 한 세트로 통일(`-outline` 변형이 있으면 그쪽).
 *    HUD가 한 세트여야 currentColor로 물들고 액센트의 절제가 유지된다.
 */
export const SHELL_ICONS = {
  close: 'mdi:close',
  week: 'mdi:calendar-week-outline',
} as const

/** 창 내용 안에서 쓰는 단색 글리프. HUD와 같은 이유로 `mdi` 한 세트다. */
export const PROGRAM_ICONS = {
  crisis: 'mdi:alert-outline',
  noSite: 'mdi:link-variant-off',
} as const

export const HUD_ICONS = {
  ap: 'mdi:lightning-bolt-outline',
  mental: 'mdi:emoticon-happy-outline',
  money: 'mdi:wallet-outline',
  reputation: 'mdi:star-outline',
} as const
