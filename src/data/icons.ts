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

/** 작업 표시줄 시작 버튼 + 시작 메뉴. ⚠️ 작업 표시줄은 primary 면 위라 currentColor로
 *  물드는 단색 `mdi` 한 세트다(다색을 들이면 그 자리만 색이 뜬다). */
export const START_ICONS = {
  start: 'mdi:view-grid-outline',
  newGame: 'mdi:restart',
} as const

/** 창 내용 안에서 쓰는 단색 글리프. HUD와 같은 이유로 `mdi` 한 세트다. */
export const PROGRAM_ICONS = {
  crisis: 'mdi:alert-outline',
  noSite: 'mdi:link-variant-off',
  /** 포토샵이 만들어 낸 팝업 이미지 파일. */
  file: 'mdi:file-image-outline',
} as const

/** `메일` 창 전용 글리프. ⚠️ 다색을 들이지 않는다 — Fluent 팔레트가 currentColor로
 *  물들어야 창 안에서 색이 하나로 선다(`programs/mail.css`). */
export const MAIL_ICONS = {
  inbox: 'mdi:inbox-arrow-down-outline',
  sent: 'mdi:send-outline',
  blank: 'mdi:email-open-outline',
} as const

/** `메신저` 창 전용 글리프. 메일과 같은 이유로 단색 `mdi` 한 세트다. */
export const MESSENGER_ICONS = {
  chat: 'mdi:chat-outline',
  blank: 'mdi:chat-processing-outline',
} as const

/** `피그마` 창 전용 글리프. 사이드바 메뉴 표식이다 — 메일·메신저와 같은 이유로 단색
 *  `mdi` 한 세트다(파일 카드에 서는 피그마 마크만 devicon 다색 그대로다). */
export const FIGMA_ICONS = {
  recent: 'mdi:clock-outline',
  community: 'mdi:account-group-outline',
  drafts: 'mdi:file-outline',
  projects: 'mdi:folder-multiple-outline',
  resources: 'mdi:puzzle-outline',
  trash: 'mdi:trash-can-outline',
} as const

/** `포토샵` 창 전용 글리프. 왼쪽 도구 막대와 레이어 패널이 쓴다.
 *  ⚠️ 어두운 창이라 다색을 들이지 않는다(에디터와 같은 이유) — 단색 `mdi` 한 세트다. */
export const PHOTOSHOP_ICONS = {
  move: 'mdi:cursor-move',
  marquee: 'mdi:selection',
  lasso: 'mdi:lasso',
  crop: 'mdi:crop',
  brush: 'mdi:brush',
  eraser: 'mdi:eraser',
  text: 'mdi:format-text',
  shape: 'mdi:shape-outline',
  layers: 'mdi:layers-outline',
} as const

/** `에디터`(VS코드) 창 전용 글리프. ⚠️ **어두운 창**이라 currentColor가 밝은 쪽으로
 *  물든다 — 다색을 들이면 그 자리만 색이 뜬다. 메일·메신저와 같은 단색 `mdi` 한 세트다. */
export const EDITOR_ICONS = {
  explorer: 'mdi:file-multiple-outline',
  search: 'mdi:magnify',
  git: 'mdi:source-branch',
  run: 'mdi:play-circle-outline',
  extensions: 'mdi:puzzle-outline',
  folder: 'mdi:folder-outline',
  file: 'mdi:file-code-outline',
  /** FTP 연결 · 실패 알림 · 퍼블리싱 실행. 같은 단색 세트라 창 색에 물든다. */
  connect: 'mdi:lan-connect',
  warn: 'mdi:alert-circle-outline',
  publish: 'mdi:cloud-upload-outline',
} as const

/** `PPT`(파워포인트) 창 전용 글리프. ⚠️ **밝은 창이라 단색 `mdi` 한 세트다** — 다색을
 *  들이면 그 자리만 색이 뜨고, 리본 아이콘이 브랜드색(`--ppt-brand`)으로 물들어야 하는데
 *  currentColor로 물드는 것은 단색뿐이다(메일·피그마와 같은 이유). */
export const PPT_ICONS = {
  /** 리본의 제작 버튼 셋. 퀄리티 id로 짝짓는다 — 순서(index)로 이으면 `QUALITY`가 늘 때
   *  조용히 어긋난다. 같은 글리프 가족이라 세기 차이만 읽힌다. */
  make: {
    light: 'mdi:text-box-outline',
    hard: 'mdi:text-box-plus-outline',
    care: 'mdi:text-box-check-outline',
  },
  /** 캔버스(흰 종이) 위에 선 만든 문서 줄. */
  doc: 'mdi:file-document-outline',
  /** 행동력 부족 알림. 이 팔레트에 빨강이 없어 경고는 아이콘 + 글자가 말한다. */
  warn: 'mdi:alert-circle-outline',
  /** 상태 표시줄의 보기 전환. ⚠️ **표시다**(button 아님 · aria-hidden). */
  viewNormal: 'mdi:presentation',
  viewSorter: 'mdi:view-grid-outline',
  viewRead: 'mdi:book-open-outline',
  viewShow: 'mdi:play-box-outline',
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
  /** 채용사이트 — 공고 올리기. 관리자 페이지 글리프와 같은 단색 mdi 세트다. */
  post: 'mdi:file-document-plus-outline',
  /** 쇼핑몰의 상품 줄. ⚠️ 첫화면 바로가기의 다색 `fluent-color`와 다르다 — 사이트 **안**은
   *  단색 세트라야 `--nv-*` 팔레트가 currentColor로 물든다. */
  shop: 'mdi:cart-outline',
  /** 즐겨찾기. ⚠️ 켜짐만 **꽉 찬 별**이다 — 같은 자리에서 윤곽↔채움이 갈려야 상태가 보인다. */
  star: 'mdi:star-outline',
  starOn: 'mdi:star',
} as const

/** 첫화면 바로가기 칸의 사이트 아이콘. 다색이므로 CSS color를 입히지 않는다. */
export const SITE_ICONS = {
  work: 'fluent-color:briefcase-24',
  hire: 'fluent-color:people-team-24',
  shop: 'fluent-color:building-store-24',
  /** 레퍼런스(어워드) 사이트. 수상작을 구경하는 곳이라 트로피다. */
  reference: 'fluent-color:trophy-32',
} as const
