/** 사내시스템의 텍스트 데이터. 수치가 아니라 문자열이라 game.ts와 분리한다.
 *
 * ⚠️ 전부 게임 안의 가짜 정보다. 실제 접속처를 넣지 않는다 —
 *    화면에 그대로 보이는 값이므로 실제 자격증명이 섞이면 그 순간 유출이다.
 *    도메인은 예시용(`example`)만 쓴다.
 *
 * ⚠️ 업체는 **여러 개**다. 업로드 공정이 생기면 플레이어가 업무의 업체를 여기서 찾아
 *    접속 정보를 본다 — 그래서 업무가 붙을 자리인 `id`를 지금부터 지고 있다.
 *    수주 시스템이 생기면 이 상수는 스토어에서 오는 목록으로 바뀐다(모양은 그대로). */

import { roller } from '../systems/seed'

/** 접속 정보 한 줄. 화면이 라벨·값 그대로 세운다. */
export type Field = { label: string; value: string }

/** 업체 하나. ⚠️ **`typeof CLIENTS[number]`가 아니다** — 수주로 생겨나는 업체는 상수 목록에
 *  없으므로 리터럴 타입으로 좁히면 그것들이 이 타입에 못 들어온다.
 *
 *  `admin`은 **비어 있을 수 있다**: 관리자 페이지는 팝업 업무에만 쓰이고 팝업 의뢰는
 *  상수 업체에서만 온다(`inbox.ts` — 수주센터·주말 돌발은 팝업을 내지 않는다). */
export type Client = { id: string; name: string; ftp: readonly Field[]; admin: readonly Field[] }

/** 처음부터 계약되어 있는 업체. **판을 시작할 때 업체정보에 서 있는 유일한 곳이다** —
 *  나머지는 일을 받아야 열린다. */
/** 사내시스템 **업체정보에 서는 업체**. `CLIENTS`는 게임이 아는 업체 전부의 목록이고,
 *  화면에 서는 것은 **관계가 생긴 곳뿐이다**.
 *
 * ⚠️ **관계는 두 갈래로 생긴다**: 소개로 트인 거래처(`clientIds` — 스토어 `clients`)와
 *    **일을 준 곳**(`jobs`). 거래처만 보면 수주센터로 딴 업체가 빠져 낙찰받고도 퍼블리싱을
 *    못 하고, 일을 준 곳만 보면 소개받은 업체가 첫 의뢰 전까지 안 보여 소개 메일이 가리키는
 *    자리가 빈다. 둘 다 세는 것이 이 함수가 하는 일 전부다.
 *
 * ⚠️ **목록에서 지우지 않고 걸러 낸다.** `CLIENTS`는 `inbox.ts`의 초반 의뢰·`weekend.ts`의
 *    돌발 의뢰·`ftp.ts`·`url.ts`가 전부 정본으로 삼는 자리라, 항목을 지우면 아직 만나지도
 *    않은 업체의 의뢰가 통째로 사라진다. 만나기 전에 접속 정보가 보이는 것이 문제였지
 *    업체가 있는 것이 문제가 아니다.
 *
 * ⚠️ **종류를 가리지 않는다**(사이트만 세지 않는다) — 팝업 업무는 그 업체의 관리자 계정을
 *    업체정보에서 찾아 옮겨 적어야 진행되므로, 사이트만 열어 주면 팝업을 수주하고도 걸 수
 *    없는 판이 된다.
 *
 * ⚠️ 수주한 것만 센다(`jobs`) — 의뢰가 도착한 것만으로는 아직 아무 사이도 아니다. */
export function knownClients(
  jobs: readonly { from: string }[],
  clientIds: readonly string[],
): readonly Client[] {
  return CLIENTS.filter(
    (c) => clientIds.includes(c.id) || jobs.some((j) => j.from === c.name),
  )
}

/** 생겨나는 업체의 접속 정보 재료. ⚠️ 전부 가짜다(`example` 도메인만) — 상수 업체와 같은 규칙. */
const HOST_WORDS = [
  'namu', 'baram', 'ondal', 'saebom', 'garam', 'nuri', 'haneul', 'miso',
  'dodam', 'areum', 'sol', 'byeol',
] as const
const PORTS = ['21', '2121'] as const
const ROOTS = ['/public_html', '/html', '/www', '/home/www'] as const

/** 상수 목록에 없는 업체의 접속 정보를 **이름 하나에서 파생한다**(`personalityOf`·
 *  `clientKeywords`와 같은 규칙 — `systems/seed.ts`의 `roller`만 쓴다).
 *
 * ⚠️ **저장하지 않는다.** 저장하면 세이브가 업체마다 불어나고 두 번째 출처가 생긴다.
 *    같은 이름은 늘 같은 정보라 창을 닫았다 열어도, 불러와도 값이 그대로다.
 * ⚠️ `id`에 이름이 그대로 들어간다 — `ftpClients`·`contracts`가 이 id를 **저장**하므로
 *    같은 업체가 늘 같은 id여야 한다(순번을 쓰면 목록이 바뀔 때 남의 업체를 가리킨다).
 * ⚠️ `admin`은 **비운다** — 수주센터·메일로 새로 만난 곳은 팝업 의뢰를 내지 않으므로
 *    관리자 계정이 쓰일 자리가 없다(없는 자물쇠의 열쇠를 만들지 않는다). */
export function derivedClient(name: string): Client {
  const r = roller(`client:${name}`)
  const word = r.pick(HOST_WORDS)
  const n = r.int(1000, 9999)
  return {
    id: `gen:${name}`,
    name,
    ftp: [
      { label: '호스트', value: `ftp.${word}${n}.example` },
      { label: '포트', value: r.pick(PORTS) },
      { label: '계정', value: `${word}_web` },
      { label: '비밀번호', value: `${word}-${r.int(1000, 9999)}` },
      { label: '기본 경로', value: r.pick(ROOTS) },
    ],
    admin: [],
  }
}

/** **지금 판이 아는 업체 전부.** 상수 업체 중 관계가 생긴 곳(`knownClients`) + 일을 받은
 *  곳 중 상수 목록에 없는 곳(수주센터 낙찰처·주말 돌발 의뢰처).
 *
 * ⚠️ **이 함수가 업체 목록의 정본이다** — 사내시스템·에디터·FTP 판정이 전부 이것을 본다.
 *    한 곳이라도 `CLIENTS`를 직접 보면 "업체정보에는 있는데 에디터에는 안 뜨는" 업체가
 *    생기고, 그 업무는 끝낼 길이 없어진다(그것이 이 함수가 생긴 이유다).
 * ⚠️ 순서는 **상수 업체가 먼저**다 — 새로 만난 곳이 끼어들면 탭 자리가 판마다 달라진다. */
export function clientsOf(
  jobs: readonly { from: string }[],
  clientIds: readonly string[],
): readonly Client[] {
  const known = knownClients(jobs, clientIds)
  // ⚠️ `Set<string>`으로 넓힌다 — `CLIENTS`가 `as const`라 그냥 두면 상수 이름만 담는
  //    좁은 집합이 되어 새 업체 이름을 넣어 볼 수조차 없다.
  const names = new Set<string>(CLIENTS.map((c) => c.name))
  const fresh = [...new Set(jobs.map((j) => j.from))]
    .filter((name) => !names.has(name))
    .map(derivedClient)
  return [...known, ...fresh]
}

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
