/** 아이콘 이름의 단일 출처. 규칙은 .claude/skills/project-context/references/icons.md.
 *
 * 세트 배분:
 *  - 바탕화면 앱 아이콘 = `fluent-color`(다색). ⚠️ CSS color를 입히지 않는다.
 *  - HUD·셸 크롬 = `mdi` 단색 한 세트로 통일(`-outline` 변형이 있으면 그쪽).
 *    HUD가 한 세트여야 currentColor로 물들고 액센트의 절제가 유지된다.
 */
export const SHELL_ICONS = {
  close: 'mdi:close',
} as const

/** 창 내용 안에서 쓰는 단색 글리프. HUD와 같은 이유로 `mdi` 한 세트다. */
export const PROGRAM_ICONS = {
  crisis: 'mdi:alert-outline',
  noSite: 'mdi:link-variant-off',
} as const

/** `메일` 창 전용 글리프. ⚠️ 다색을 들이지 않는다 — Fluent 팔레트가 currentColor로
 *  물들어야 창 안에서 색이 하나로 선다(`programs/mail.css`). */
export const MAIL_ICONS = {
  inbox: 'mdi:inbox-arrow-down-outline',
  sent: 'mdi:send-outline',
  blank: 'mdi:email-open-outline',
} as const

/** 계기판(주차)과 `스탯` 창이 함께 쓰는 단색 묶음. 한 세트여야 currentColor로 물든다. */
export const STAT_ICONS = {
  week: 'mdi:calendar-week-outline',
  ap: 'mdi:lightning-bolt-outline',
  mental: 'mdi:emoticon-happy-outline',
  money: 'mdi:wallet-outline',
  reputation: 'mdi:star-outline',
  jobs: 'mdi:clipboard-text-outline',
  /** 업무 상태 표식. ⚠️ 체크박스가 아니다 — 완료는 업무를 끝내야 붙는다. */
  jobOpen: 'mdi:circle-outline',
  jobDone: 'mdi:check-circle-outline',
} as const

/** `브라우저` 창 전용 글리프. ⚠️ 크롬(주소창·검색창)은 단색 `mdi`다 — 브라우저 자체의
 *  UI는 색을 쓰지 않아야 그 안의 사이트가 색을 가질 수 있다. 바로가기 칸의 사이트
 *  아이콘만 다색 `fluent-color`로, 바탕화면 아이콘과 같은 규칙이다. */
export const BROWSER_ICONS = {
  back: 'mdi:arrow-left',
  forward: 'mdi:arrow-right',
  reload: 'mdi:refresh',
  search: 'mdi:magnify',
  lock: 'mdi:lock-outline',
  /** 업체 관리자 페이지 — 로그인 자물쇠와 팝업 등록. 크롬과 같은 단색 mdi다. */
  account: 'mdi:account-outline',
  key: 'mdi:key-outline',
  popup: 'mdi:image-plus-outline',
  logout: 'mdi:logout',
  warn: 'mdi:alert-circle-outline',
} as const

/** 첫화면 바로가기 칸의 사이트 아이콘. 다색이므로 CSS color를 입히지 않는다. */
export const SITE_ICONS = {
  work: 'fluent-color:briefcase-24',
  hire: 'fluent-color:people-team-24',
  shop: 'fluent-color:building-store-24',
  company: 'fluent-color:building-24',
} as const
