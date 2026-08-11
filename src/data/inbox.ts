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

/** 진짜 의뢰. **모든 의뢰에는 기한이 있다** — `dueWeeks`는 수주한 주부터 세는 주 수이고,
 *  마감 주차는 수주 시점에 정해진다(`store.acceptJob`). 그래서 늦게 받을수록 늦게 끝내도 된다. */
export type Request = Common & { ad?: undefined; dueWeeks: number }

/** 의뢰가 아닌 글(광고 등). 고를 것도, 기한도 없다. */
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
  {
    id: 'm-ongi',
    channel: 'mail',
    from: '온기카페',
    subject: '여름 신메뉴 팝업 하나만 급하게',
    body: '다음 주 월요일에 신메뉴가 나갑니다. 메인 화면 뜨자마자 보이는 팝업 하나만 만들어서 올려 주실 수 있을까요? 이미지는 저희가 보내드립니다.',
    at: '오전 9:16',
    dueWeeks: 1,
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
    id: 'b-corner-menu',
    channel: 'board',
    from: CLIENTS[2].name,
    subject: '메뉴 페이지에 사진 3장 추가',
    body: '신메뉴 사진 3장 추가하고 품절된 빵 2개는 내려 주세요. 급하진 않습니다.',
    at: '3일 전',
    dueWeeks: 3,
  },
]

export const inbox = (channel: Channel) => MESSAGES.filter((m) => m.channel === channel)

export const unreadCount = (channel: Channel, readIds: string[]) =>
  inbox(channel).filter((m) => !readIds.includes(m.id)).length
