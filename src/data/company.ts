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
  {
    // ⚠️ 신규 사이트 의뢰(`m-byeolbit`)의 업체다. **퍼블리싱 공정이 FTP를 요구하므로**
    //    접속 정보가 없으면 그 사이트 업무는 끝낼 길이 없다 — 그래서 여기 있다.
    //    (수주가 업체를 만드는 고리가 생기면 이 항목은 그쪽으로 옮겨 간다.)
    // ⚠️ **맨 뒤에 둔다** — `inbox.ts`가 `CLIENTS[0]`·`[2]`로 팝업 의뢰의 업체를 집는다.
    id: 'byeolbit',
    name: '별빛문구',
    ftp: [
      { label: '호스트', value: 'ftp.byeolbit.example' },
      { label: '포트', value: '21' },
      { label: '계정', value: 'byeolbit' },
      { label: '비밀번호', value: 'star-7788' },
      { label: '기본 경로', value: '/home/www' },
    ],
    admin: [
      { label: '주소', value: 'byeolbit.example/admin' },
      { label: '아이디', value: 'byeolbit_admin' },
      { label: '비밀번호', value: 'pencil-2024' },
    ],
  },
  // ── 소개로 열리는 업체 ────────────────────────────────────
  // ⚠️ **처음부터 거래하는 곳이 아니다**(`INITIAL_CLIENTS`에 없다) — 평판이 오르면
  //    기존 업체가 소개해 준다(`systems/referral.ts`). 목록 자체는 여기 상수로 두고
  //    "지금 거래 중인가"만 스토어가 든다: 주소·계정을 스토어로 옮기면 세이브가
  //    불어나고, `url.ts`·`ftp.ts`가 보는 정본이 둘로 갈린다.
  {
    id: 'onnuri',
    name: '온누리떡집',
    ftp: [
      { label: '호스트', value: 'ftp.onnuri.example' },
      { label: '포트', value: '21' },
      { label: '계정', value: 'onnuri_web' },
      { label: '비밀번호', value: 'rice-3355' },
      { label: '기본 경로', value: '/public_html' },
    ],
    admin: [
      { label: '주소', value: 'admin.onnuri.example' },
      { label: '아이디', value: 'onnuri' },
      { label: '비밀번호', value: 'tteok-1103' },
    ],
  },
  {
    id: 'saebom',
    name: '새봄어린이집',
    ftp: [
      { label: '호스트', value: 'ftp.saebom.example' },
      { label: '포트', value: '2121' },
      { label: '계정', value: 'saebom_ftp' },
      { label: '비밀번호', value: 'spring-0404' },
      { label: '기본 경로', value: '/html' },
    ],
    admin: [
      { label: '주소', value: 'saebom.example/manage' },
      { label: '아이디', value: 'saebom_master' },
      { label: '비밀번호', value: 'child-2580' },
    ],
  },
  {
    id: 'hanmadang',
    name: '한마당체육관',
    ftp: [
      { label: '호스트', value: 'ftp.hanmadang.example' },
      { label: '포트', value: '21' },
      { label: '계정', value: 'hanmadang' },
      { label: '비밀번호', value: 'gym-9911' },
      { label: '기본 경로', value: '/www' },
    ],
    admin: [
      { label: '주소', value: 'admin.hanmadang.example' },
      { label: '아이디', value: 'hm_admin' },
      { label: '비밀번호', value: 'muscle-7070' },
    ],
  },
] as const

/** **처음부터 거래하는 업체.** 나머지는 소개로 열린다(`systems/referral.ts`).
 *
 * ⚠️ 목록 자체(`CLIENTS`)는 줄이지 않는다 — 주소·계정은 `url.ts`·`ftp.ts`가 보는
 *    정본이라 스토어로 옮기면 두 벌이 된다. **"지금 거래 중인가"만** 스토어가 든다.
 * ⚠️ 초기 의뢰(`data/inbox.ts`)가 이 넷에서 오므로 여기서 빼면 첫 판에 할 일이 사라진다. */
export const INITIAL_CLIENTS = ['dalbit', 'hanbit', 'corner', 'byeolbit'] as const

/** 소개로 열릴 수 있는 업체(처음엔 거래하지 않는 곳). */
export const REFERRAL_CLIENTS = CLIENTS.filter(
  (c) => !INITIAL_CLIENTS.includes(c.id as (typeof INITIAL_CLIENTS)[number]),
).map((c) => c.id)
