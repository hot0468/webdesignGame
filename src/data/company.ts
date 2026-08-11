/** 사내시스템의 텍스트 데이터. 수치가 아니라 문자열이라 game.ts와 분리한다.
 *
 * ⚠️ 전부 게임 안의 가짜 정보다. 실제 접속처를 넣지 않는다 —
 *    화면에 그대로 보이는 값이므로 실제 자격증명이 섞이면 그 순간 유출이다.
 *    도메인은 예시용(`example`)만 쓴다.
 *
 * ⚠️ 업체는 **여러 개**다. 업로드 공정이 생기면 플레이어가 업무의 업체를 여기서 찾아
 *    접속 정보를 본다 — 그래서 업무가 붙을 자리인 `id`를 지금부터 지고 있다.
 *    수주 시스템이 생기면 이 상수는 스토어에서 오는 목록으로 바뀐다(모양은 그대로). */

export type Client = (typeof CLIENTS)[number]

export const CLIENTS = [
  {
    id: 'dalbit',
    name: '달빛공방',
    ftp: [
      { label: '호스트', value: 'ftp.dalbit.example' },
      { label: '포트', value: '21' },
      { label: '계정', value: 'dalbit_web' },
      { label: '비밀번호', value: 'dalbit-1234' },
      { label: '기본 경로', value: '/public_html' },
    ],
    admin: [
      { label: '주소', value: 'admin.dalbit.example' },
      { label: '아이디', value: 'master' },
      { label: '비밀번호', value: 'moon-0407' },
    ],
  },
  {
    id: 'hanbit',
    name: '한빛치과',
    ftp: [
      { label: '호스트', value: 'ftp.hanbit-dent.example' },
      { label: '포트', value: '2121' },
      { label: '계정', value: 'hanbit_admin' },
      { label: '비밀번호', value: 'tooth-8282' },
      { label: '기본 경로', value: '/html' },
    ],
    admin: [
      { label: '주소', value: 'hanbit-dent.example/manage' },
      { label: '아이디', value: 'hanbit' },
      { label: '비밀번호', value: 'hanbit-9900' },
    ],
  },
  {
    id: 'corner',
    name: '코너베이커리',
    ftp: [
      { label: '호스트', value: 'ftp.cornerbakery.example' },
      { label: '포트', value: '21' },
      { label: '계정', value: 'corner_ftp' },
      { label: '비밀번호', value: 'bread-5959' },
      { label: '기본 경로', value: '/www' },
    ],
    admin: [
      { label: '주소', value: 'admin.cornerbakery.example' },
      { label: '아이디', value: 'cornermaster' },
      { label: '비밀번호', value: 'oven-1102' },
    ],
  },
] as const
