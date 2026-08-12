/** 게임 수치의 단일 출처. ⚠️ 컴포넌트에 숫자를 적지 않는다 —
 *  두 번째 출처가 생기면 밸런스 테스트가 그쪽을 못 본다. */

/** 시작 상태. 행동력 3은 코어 설계(§2)에서 확정된 값이다.
 *  ⚠️ mental·money·reputation의 시작값은 아직 스펙에 없다 — 곡선이 정해지면 조정한다. */
export const INITIAL_GAME = {
  /** 1부터 세는 통산 주차. */
  week: 1,
  ap: 3,
  apMax: 3,
  mental: 100,
  mentalMax: 100,
  money: 1_000_000,
  /** 0~100. 이 값 하나가 수주 사이트와 폐업(위기 4주)을 정한다. */
  reputation: 30,
} as const

/** 평판 위기선. 이 아래로 내려가면 신규 수주가 끊기고 매주 직원이 떠난다. */
export const REPUTATION_CRISIS = 10
/** 위기가 이만큼 이어지면 폐업(두 번째 게임 오버). */
export const CRISIS_WEEKS_TO_SHUTDOWN = 4
export const REPUTATION_MAX = 100

/** 마감이 **이만큼 남았거나 덜 남으면 임박**이다(업무목록에서 빨갛게 선다).
 *  ⚠️ 1주 = 남은 턴이 이번 주 하나뿐이라는 뜻이다. 데드라인 초과는 계약 파기라
 *  이 경고가 마지막 신호다. */
export const DEADLINE_URGENT_WEEKS = 1

/** 달력 환산의 단위. 주차 → 몇 월 몇째 주는 이 값으로만 나눈다. */
export const WEEKS_PER_MONTH = 4
export const MONTHS_PER_YEAR = 12

/** 한 주의 요일. ⚠️ **뒤 `WEEKEND_COUNT`개가 주말**이다 — 주말 근무는 선택이라
 *  달력이 그 이틀을 따로 칠한다. 순서를 바꾸면 주말 칸이 엉뚱한 요일로 간다. */
export const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'] as const
export const WEEKEND_COUNT = 2

/** 창을 처음 열 때의 위치와, 겹치지 않게 계단식으로 밀어내는 간격(px).
 *  ⚠️ `y`는 **화면 위쪽 기준**이다(바탕화면 아이콘과 같은 24px 여백) — 창이 클수록
 *  아래로 쓸 높이가 필요하므로 위에서 시작한다. 가운데 정렬로 바꾸지 말 것. */
export const WINDOW_SPAWN = { x: 160, y: 24, cascade: 28 } as const

/** 드래그로 창을 화면 밖에 버려 되찾을 수 없게 되는 것을 막는 최소 노출량(px).
 *  ⚠️ 세로 96은 index.css의 `--os-taskbar-h`(56) + `--os-titlebar-h`(40)와 같은 값이다 —
 *  타이틀바가 작업 표시줄 **위에** 온전히 남아야 다시 잡을 수 있다. 그 토큰을 바꾸면 여기도 바꾼다. */
export const WINDOW_DRAG = { keepVisible: 96 } as const

/** 업체 관리자 페이지에 팝업 하나를 올리는 데 드는 행동력.
 *  ⚠️ **업로드 공정은 퀄리티가 없다** — 스탯이 개입하지 않는 고정 비용이라 1이다
 *  (코어 설계의 "업로드 공정은 퀄리티 없이 행동력 1 고정"이 그대로 온다).
 *  퀄리티를 고르는 제작 공정과 섞지 말 것. */
export const POPUP_UPLOAD_AP = 1
