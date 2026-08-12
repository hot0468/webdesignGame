/** 받은 의뢰 글. **신규 의뢰는 메일로, 유지보수 의뢰는 고객게시판으로** 온다 —
 *  채널이 곧 의뢰의 종류라서 목록을 둘로 나누지 않고 `channel` 한 칸으로 가른다.
 *
 * ⚠️ 전부 게임 안의 가짜 정보다(company.ts와 같은 이유 — 실제 연락처를 넣지 않는다).
 *
 * ⚠️ 지금은 상수다. 수주 시스템이 생기면 스토어에서 오는 목록으로 바뀐다(모양은 그대로) —
 *    그래서 화면은 이 배열을 직접 훑지 않고 아래 두 함수로만 본다. 뱃지 숫자의 단일 출처다.
 *
 * 결정(견적보내기·확인·거절)은 `components/JobActions.tsx`가 진다. */

import { CLIENTS } from './company'

export type Channel = 'mail' | 'board'

type Common = {
  id: string
  channel: Channel
  /** 보낸 사람. 유지보수 의뢰는 이미 계약된 업체라 CLIENTS의 이름을 그대로 쓴다. */
  from: string
  subject: string
  body: string
  /** 목록에 뜨는 도착 시각. ⚠️ 게임에는 아직 시계가 없다(주 단위 턴뿐) — 분위기용
   *  문자열이다. 주차 진행이 생기면 도착 주차에서 계산한다. */
  at: string
}

/** 팝업 의뢰의 요청 내역. **요청 기간의 정본은 의뢰다** — 플레이어가 관리자 페이지에
 *  적어 넣는 기간은 이것의 사본일 뿐이고, 판정(`systems/popup.ts`)은 늘 이쪽을 본다.
 *
 * ⚠️ `fromWeeks`/`toWeeks`는 **수주한 주부터 세는 상대값**이다(`dueWeeks`와 같은 이유 —
 *    상대값으로 두면 늦게 받아도 의뢰 글이 그대로 말이 된다). 수주하는 순간
 *    `store.acceptJob`이 통산 주차로 굳힌다.
 *
 * `clientId`는 그 팝업을 걸 업체(`CLIENTS`의 id)다. 이것이 없으면 어느 관리자 페이지를
 * 검사해야 하는지 알 수 없다. */
export type PopupSpec = { clientId: string; fromWeeks: number; toWeeks: number }

/** 진짜 의뢰. **모든 의뢰에는 기한이 있다** — `dueWeeks`는 수주한 주부터 세는 주 수이고,
 *  마감 주차는 수주 시점에 정해진다(`store.acceptJob`). 그래서 늦게 받을수록 늦게 끝내도 된다.
 *
 *  `popup`이 있으면 **팝업 업무**다 — 포토샵으로 만들고 관리자 페이지에 거는 두 공정을
 *  지고, 매주 넘어갈 때 어긋남을 검사받는다(클레임). */
export type Request = Common & { ad?: undefined; dueWeeks: number; popup?: PopupSpec }

/** 의뢰가 아닌 글(광고·클레임 등). 고를 것도, 기한도 없다.
 *
 *  ⚠️ 클레임 메일이 **이 갈래**인 것이 중요하다 — 클레임에 견적보내기/거절하기가 붙으면
 *     "항의를 수주한다"는, 게임에 없는 선택지가 생긴다(`JobActions`가 `ad`에서 null을 낸다). */
export type Ad = Common & { ad: true }

/** ⚠️ 갈래를 나눈 이유: 기한 없는 업무가 생기지 않게 하려고. 광고에 기한을 적는 것도,
 *  의뢰에서 기한을 빠뜨리는 것도 **타입 검사가 막는다**. */
export type Message = Request | Ad

export const MESSAGES: Message[] = [
  {
    id: 'm-byeolbit',
    channel: 'mail',
    from: '별빛문구',
    subject: '문구점 홈페이지 새로 만들고 싶어요',
    body: '안녕하세요, 동네에서 문구점 하는 사람입니다. 지금 홈페이지가 10년 전에 만든 거라 휴대폰에서 글씨가 다 깨져요. 신제품 사진 올릴 수 있는 페이지까지 포함해서 견적 부탁드립니다.',
    at: '오전 11:10',
    dueWeeks: 4,
  },
  // ⚠️ 팝업 의뢰의 `from`은 **CLIENTS의 업체여야 한다** — 관리자 페이지가 없는 곳에는
  //    팝업을 걸 수가 없다. 그래서 신규 의뢰라도 팝업은 계약 업체에서 온다.
  {
    id: 'm-dalbit-popup',
    channel: 'mail',
    from: CLIENTS[0].name,
    subject: '여름 신메뉴 팝업 하나만 급하게',
    body: '다음 주부터 2주간 메인 화면 뜨자마자 보이는 팝업 하나만 걸어 주세요. 기간 끝나면 꼭 내려 주셔야 합니다. 지난번처럼 남아 있으면 곤란해요.',
    at: '오전 9:16',
    dueWeeks: 1,
    popup: { clientId: CLIENTS[0].id, fromWeeks: 1, toWeeks: 2 },
  },
  {
    id: 'm-chorok',
    channel: 'mail',
    from: '초록약국',
    subject: '건강강좌 발표자료 제작 문의',
    body: '주민센터에서 건강강좌를 맡게 됐는데 발표자료가 없습니다. 20장 내외 PPT로 만들어 주시면 좋겠어요. 내용 원고는 준비돼 있습니다.',
    at: '어제',
    dueWeeks: 3,
  },
  {
    id: 'm-ad',
    channel: 'mail',
    from: '웹호스팅 알림',
    subject: '[광고] 서버 이전 이벤트 50% 할인',
    body: '지금 이전하시면 첫 해 요금 50% 할인! 이 메일은 광고입니다.',
    at: '어제',
    ad: true,
  },
  {
    id: 'b-dalbit-banner',
    channel: 'board',
    from: CLIENTS[0].name,
    subject: '메인 배너 이미지 교체 요청',
    body: '가을 신상 나와서 메인 배너를 바꾸고 싶습니다. 새 이미지는 FTP에 올려 뒀어요.',
    at: '어제',
    dueWeeks: 2,
  },
  {
    id: 'b-hanbit-hours',
    channel: 'board',
    from: CLIENTS[1].name,
    subject: '진료시간 변경 (토요일 오전만)',
    body: '이번 달부터 토요일은 오전 진료만 합니다. 사이트 하단과 진료안내 페이지 두 군데 다 수정 부탁드립니다.',
    at: '2일 전',
    dueWeeks: 1,
  },
  {
    id: 'b-corner-popup',
    channel: 'board',
    from: CLIENTS[2].name,
    subject: '이번 주부터 휴무 안내 팝업 부탁드려요',
    body: '이번 주부터 3주간 휴무 안내 팝업을 첫화면에 걸어 주세요. 3주 지나면 내려 주시면 됩니다.',
    at: '오늘',
    dueWeeks: 1,
    popup: { clientId: CLIENTS[2].id, fromWeeks: 0, toWeeks: 2 },
  },
  {
    id: 'b-corner-menu',
    channel: 'board',
    from: CLIENTS[2].name,
    subject: '메뉴 페이지에 사진 3장 추가',
    body: '신메뉴 사진 3장 추가하고 품절된 빵 2개는 내려 주세요. 급하진 않습니다.',
    at: '3일 전',
    dueWeeks: 3,
  },
]

/** 그 채널에 온 글 전부. `extra`는 **게임 중에 생겨난 글**(클레임 메일 등, 스토어의
 *  `claims`)이다 — 상수 목록과 같은 자리에 서야 메일 창이 하나의 받은편지함으로 보인다.
 *
 *  ⚠️ 새로 온 것이 **위**다. 클레임은 방금 일어난 일이라 아래로 밀리면 놓친다. */
export const inbox = (channel: Channel, extra: Message[] = []) =>
  [...extra, ...MESSAGES].filter((m) => m.channel === channel)

/** 안 읽은 수 — **뱃지 숫자의 단일 출처다**. 읽음의 정본은 스토어 `readIds` 하나이므로
 *  생겨난 글도 같은 규칙으로 세어진다(`extra`를 빼먹으면 뱃지만 조용히 어긋난다). */
export const unreadCount = (channel: Channel, readIds: string[], extra: Message[] = []) =>
  inbox(channel, extra).filter((m) => !readIds.includes(m.id)).length
