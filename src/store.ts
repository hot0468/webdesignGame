import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  CLAIM_REPUTATION_LOSS,
  companyLevel,
  findQuality,
  INITIAL_GAME,
  PUBLISH_AP,
  REPUTATION_MAX,
  WINDOW_DRAG,
  WINDOW_SPAWN,
  type Grade,
  type QualityId,
} from './data/game'
import { gradeOf, type Draft } from './systems/craft'
import { MEETING_AP, MEETING_OCCUPY_WEEKS, type KeywordId } from './data/keywords'
import { clientKeywords, hitCount, keywordShift, meetingMail, revealedKeywords } from './systems/keywords'
import { CLIENTS } from './data/company'
import { EMPLOYEE_LEVEL, FEEDBACK_AP, ORDER_AP, ORDER_FILE_EXT, ORDER_QUALITY, POST_AP, TRAIN_COST } from './data/employees'
import type { Applicant } from './systems/hire'
import {
  canOrder,
  canTrain,
  doneReply,
  finishedOrders,
  finishedTrainings,
  isBusy,
  meetingReply,
  orderDoneWeek,
  orderReply,
  quitMail,
  quitter,
  statOf,
  trainDoneWeek,
  trained,
  trainedReply,
  trainReply,
  type Chat,
  type Employee,
  type Order,
  type Training,
  payroll,
} from './systems/employee'
import { companyGrade, REPUTATION_CRISIS } from './data/game'
import { judgeOver, type GameOver } from './systems/gameover'
import type { Channel, Message, Request } from './data/inbox'
import {
  canReply,
  doneMail,
  isBreached,
  isFinalReply,
  isTurnOf,
  openStep,
  repliedStep,
  replyMail,
  satisfaction,
  stepsOf,
  type JobKind,
  type StepJob,
} from './systems/pipeline'
import { breach, breachMail, isSettleWeek, monthlyCost, reward, settleMail } from './systems/money'
import type { ProgramId } from './data/programs'
import {
  claimMail,
  isFileOf,
  judgePopups,
  popupFileId,
  type Popup,
  type PopupFile,
  type PopupJob,
} from './systems/popup'
import {
  acceptedText,
  expiredRequests,
  fedUp,
  feedbackWorks,
  grudged,
  grudgeQuitMail,
  ignoredText,
  leaveDoneWeek,
  makeRequest,
  raiseGrade,
  raisedBy,
  refusedText,
  requestText,
  trainRequestGain,
  trainRequestWorks,
  type EmployeeRequest,
  type Workable,
} from './systems/request'
import { normalizeUrl } from './systems/url'
import { makeSlot, parseSlot, slotKey } from './systems/save'

/** 수주한 업무 한 건. `id`는 그 의뢰 글의 id다 — 한 의뢰가 두 업무가 되지 않는다.
 *
 * `due`는 **통산 주차로 굳힌 마감**이다(의뢰의 `dueWeeks`는 상대값이라 그대로 두면
 * 주가 지나도 남은 기한이 안 줄어든다). 남은 주 = `due - week`.
 *
 * `popup`이 있으면 팝업 업무다. **요청 기간도 마감과 같은 이유로 수주 시점에 굳는다** —
 * 의뢰의 `fromWeeks`/`toWeeks`는 상대값이라 그대로 두면 주가 지나도 같은 주를 가리킨다.
 * 이 굳은 값이 클레임 판정의 정본이고, 플레이어가 관리자 페이지에 적는 기간은 사본이다.
 *
 * ⚠️ 공정의 줄·단가는 업무 시스템이 생길 때 붙는다 — 쓸 곳이 없는 칸을 미리 만들지 않는다. */
export type Job = {
  id: string
  from: string
  title: string
  /** 이 업무를 요청한 글이 온 곳. 회신·완료 메일이 **같은 채널로** 돌아가야
   *  고객게시판 업무의 답장이 메일함으로 새지 않는다. */
  channel: Channel
  /** 공정의 줄을 정하는 종류(`systems/pipeline.ts`). 의뢰 글이 정본이다. */
  kind: JobKind
  /** 실행을 마친 공정 수. */
  step: number
  /** 회신을 마친 공정 수. ⚠️ `step`과 **따로 센다** — 만든 것과 보낸 것은 다른 일이고,
   *  다음 공정은 회신해야 열린다(`pipeline.ts`의 `openStep`). */
  replied: number
  due: number
  done: boolean
  /** 마감을 넘겨 깨진 계약. ⚠️ `done`과 **함께** 선다 — 끝난 것은 맞고, 어떻게 끝났는지가
   *  이 칸이다(목록에서 지우면 무엇이 어떻게 끝났는지가 사라진다). */
  breached?: boolean
  popup?: { clientId: string; from: number; to: number }
}

/** 평판을 자르는 **유일한 자리**. 0~100 밖의 평판에는 뜻이 없고 위기 판정만 흐려진다. */
const clampReputation = (v: number) => Math.min(REPUTATION_MAX, Math.max(0, v))

/** 열려 있는 창 하나. 위치는 transform으로만 적용한다(레이아웃 속성 애니메이션 금지). */
export type OpenWindow = {
  id: ProgramId
  x: number
  y: number
  /** 스택 순서. ⚠️ 포커스는 별도 필드가 아니라 **z 최대값에서 파생**한다 —
   *  관계를 한 방향으로만 적어야 둘이 어긋나지 않는다. */
  z: number
}

type Store = {
  week: number
  ap: number
  apMax: number
  mental: number
  mentalMax: number
  money: number
  reputation: number
  /** 디자인 스탯(0~100). **작업물 등급을 정하는 축**이고, 올리는 길은 아직 없다
   *  (성장이 붙으면 여기에 더한다 — 축을 미리 여러 개 만들지 않는다). */
  design: number
  /** 기획력 스탯(0~100). **미팅에서 알아내는 키워드 수를 정하는 축**이고, 올리는 길은
   *  아직 없다(design과 같다 — 성장이 붙으면 두 값이 같은 자리에서 는다). */
  planning: number

  /** 클라이언트 미팅에서 **알아낸** 키워드. 업무 id → 알아낸 키워드 목록이다.
   *
   *  ⚠️ 클라이언트가 **정말 원하는 5개는 저장하지 않는다** — 업무 id에서 파생하므로
   *     (`systems/keywords.ts`의 `clientKeywords`) 저장하면 두 번째 출처가 생기고
   *     세이브를 뜯어 정답을 볼 수 있게 된다. 여기 사는 것은 **플레이어가 아는 것**뿐이다.
   *  ⚠️ 키가 있으면 미팅을 한 것이다 — 별도의 '미팅함' 플래그를 두지 않는다
   *     (관계를 한 방향으로만 적는다). */
  meetings: Record<string, KeywordId[]>

  /** 읽은 글의 id(메일·고객게시판 공용). 뱃지 숫자는 여기서만 나온다. */
  readIds: string[]
  /** 수주한 업무. 계기판 맨 아래 업무목록이 이것을 그대로 그린다. */
  jobs: Job[]
  /** 거절한 의뢰의 id. ⚠️ 목록에서 지우지 않는다 — 지우면 같은 글이 다시 새 글로 보인다. */
  rejectedIds: string[]
  /** 포토샵으로 만들어 둔 팝업 이미지 파일. **업체별로 나누지 않는다** —
   *  등록 화면에서 **전부 고를 수 있어야** "틀린 파일을 골랐다"가 성립한다.
   *  ⚠️ 목록을 업무별로 걸러 보여 주면 이 게임의 실수할 자유가 사라진다. */
  files: PopupFile[]
  /** 피그마로 만들어 둔 시안. 팝업 파일과 **다른 목록**이다 — 시안은 관리자 페이지의
   *  팝업 등록에 뜨면 안 된다(.fig를 팝업 이미지로 거는 선택지는 실수가 아니라 잡음이다). */
  drafts: Draft[]
  /** PPT 창에서 만든 문서(발표자료·화면정의서). 시안·팝업과 **또 다른 목록**이다 —
   *  같은 모양이라도 섞이면 등록·시안 화면에 엉뚱한 파일이 뜬다. */
  slides: Draft[]
  /** 관리자 페이지에 실제로 걸린 팝업. ⚠️ 개수가 아니라 **무엇을 언제부터 언제까지**다 —
   *  세 갈래 판정이 전부 이 세 칸에서 나온다. */
  popups: Popup[]
  /** **게임 중에 생겨난 글 전부** — 항의 메일(주차 넘김) · 회신에 대한 답장 · 완료 메일.
   *  상수 목록과 같은 자리에 선다(`inbox(channel, mails)`). 읽음은 `readIds` 하나가 계속 진다.
   *  ⚠️ 목록을 종류별로 쪼개지 말 것 — 받은편지함을 세는 곳이 늘어나면 뱃지가 조용히 어긋난다. */
  mails: Message[]
  /** 브라우저 즐겨찾기 — **친 그대로의 주소 문자열**이다. 이름은 `siteTitle`이 주소에서
   *  뽑는다(업체 이름을 여기 복사해 두면 `CLIENTS`와 갈린다). */
  bookmarks: string[]
  /** 에디터에서 FTP로 연결해 둔 업체의 id. **에디터가 그 업체 폴더를 여는 조건이다** —
   *  접속 정보를 옮겨 적는 왕복을 겪어야 퍼블리싱할 수 있다(관리자 페이지와 같은 규칙). */
  ftpClients: string[]

  /** 고용된 직원. **메신저 대화방의 정본이고 급여의 정본이기도 하다**(사람 수가 곧 지출).
   *  ⚠️ 정원은 `companyGrade(reputation).hireMax`가 정하고 저장하지 않는다. */
  employees: Employee[]
  /** 진행 중인 지시. **직원의 점유도 여기서 파생한다**(`systems/employee.ts`의 `isBusy`) —
   *  직원 쪽에 `busy` 플래그를 두면 지시를 지우고 플래그를 남기는 사고가 난다. */
  orders: Order[]
  /** 진행 중인 교육. **`orders`와 같은 모양의 점유다** — 둘 다 그 직원을 N주간 잡는다.
   *  ⚠️ 오른 레벨은 여기 없다 — 끝나는 순간 `employees`의 그 사람이 바뀐다. */
  trainings: Training[]
  /** 채용 공고를 **마지막으로 올린 주차**. 지원자는 이 값 하나에서 파생한다
   *  (`systems/hire.ts`의 `applicants` — 같은 주차는 늘 같은 사람들이다).
   *  ⚠️ 지원자 목록을 저장하지 않는 이유: 저장하면 두 번째 출처가 생기고 세이브가 불어난다.
   *  공고를 올린 적이 없으면 undefined다(0으로 두면 1주차에 올린 것과 구분되지 않는다). */
  hirePostWeek?: number
  /** 이미 고용했거나 놓친 지원자의 id. ⚠️ **목록에서 지우지 않는다** — 파생 목록이라
   *  지울 자리가 없고, 한 번 뽑은 사람이 같은 공고에 다시 서면 두 번 뽑힌다. */
  hiredApplicantIds: string[]
  /** 메신저에 쌓인 직원의 말. **방은 `employeeId`로 갈린다**(방 하나 = 직원 하나).
   *  ⚠️ 내가 한 말은 쌓지 않는다 — 지시는 `orders`에 이미 남아 있고, 같은 사실을 두 벌로
   *     적으면 둘이 어긋난다. */
  chats: Chat[]
  /** **답을 기다리는 직원 요청.** 주차를 넘길 때 시드에서 생기고(`systems/request.ts`),
   *  답하거나 기한이 지나면 사라진다.
   *  ⚠️ `chats`(대화)와 **다른 축이다** — 대화는 흘러가는 글이고 요청은 답을 골라야
   *     사라지는 것이라, 섞으면 무엇이 아직 안 끝났는지를 대화 전체를 훑어야 안다.
   *  ⚠️ 답한 요청은 여기서 **지운다**(대신 대화에 결과 한 줄이 남는다) — 상태를 두 곳에
   *     적으면 답한 요청이 목록에 계속 서 있는 사고가 난다. */
  requests: EmployeeRequest[]

  /** 평판이 위기선 아래로 머문 주 수. `CRISIS_WEEKS_TO_SHUTDOWN`에 닿으면 폐업이다.
   *  ⚠️ 위기선 위로 오르면 **0으로 리셋**한다(설계 결정표). */
  crisisWeeks: number

  /** **지금까지 벌어들인 대금의 합.** 회사레벨(→ 행동력 상한)이 여기서 파생한다.
   *  ⚠️ 소지금이 아니다 — 돈을 쓰면 줄어드는 값으로 레벨을 재면 지출할 때마다
   *  레벨이 내려가고 안 쓰고 모으는 것이 최적이 된다. 이 값은 **줄지 않는다**. */
  revenue: number

  /** 급여를 **연속으로 못 준 달 수**. `UNPAID_MONTHS_TO_BANKRUPT`에 닿으면 파산이다.
   *  ⚠️ 잔액이 음수인 것과 다르다 — 착수금·대출로 한 달 마이너스는 버틸 수 있다.
   *  ⚠️ 한 달이라도 급여를 다 주면 **0으로 리셋**한다(갚을 수 있는 빚이어야 한다). */
  unpaidMonths: number

  /** 끝난 판. **undefined면 진행 중이다.**
   *  ⚠️ 판정은 `systems/gameover.ts`가 낸다 — 스토어는 적용만 한다(클레임 판정과 같다).
   *  ⚠️ 세이브에 들어간다 — 끝난 판을 불러왔는데 멀쩡히 굴러가면 안 된다. */
  over?: GameOver

  windows: OpenWindow[]

  /** 슬롯 목록이 바뀔 때마다 오르는 수. ⚠️ **슬롯 내용은 스토어에 들이지 않는다** —
   *  들이면 세이브 안에 세이브가 들어가 자동저장이 판마다 배로 불어난다. 화면은 이 수가
   *  바뀔 때 저장소를 다시 읽는다(정본은 localStorage 쪽이다).
   *  ⚠️ `saveFields`에 넣지 않는다 — 판이 아니라 화면을 다시 그리는 신호다. */
  slotsRevision: number

  openWindow: (id: ProgramId) => void
  closeWindow: (id: ProgramId) => void
  focusWindow: (id: ProgramId) => void
  moveWindow: (id: ProgramId, x: number, y: number, viewport: Viewport) => void
  markRead: (id: string) => void
  acceptJob: (request: Request) => void
  rejectJob: (id: string) => void
  completeJob: (id: string) => void
  /** 팝업 이미지 제작(포토샵). **비용은 여기가 진다**(고른 퀄리티의 `ap`). */
  makePopup: (jobId: string, quality: QualityId) => void
  /** 클라이언트 미팅(피그마). 알아내는 키워드 수는 **가는 사람의 기획력**이 정한다.
   *
   *  `employeeId`를 주면 **그 직원이 대신 간다**: 내 행동력은 안 들고 대신 그 직원이
   *  `MEETING_OCCUPY_WEEKS`주 잡힌다(지시·교육과 같은 점유). 안 주면 내가 가고
   *  **행동력 `MEETING_AP`**를 문다.
   *
   *  ⚠️ 업무당 한 번뿐이다 — 여러 번 열면 대가를 내고 5개를 다 알 수 있어 미팅이
   *     '기다리는 값'이 아니라 '사는 값'이 된다. 사람을 바꿔 다시 보내는 것도 막는다. */
  holdMeeting: (jobId: string, employeeId?: string) => void
  /** 시안 제작(피그마). 팝업과 **같은 퀄리티 표·같은 등급 규칙**을 쓴다.
   *  ⚠️ `keywords`는 플레이어가 고른 분위기 키워드다 — 맞춘 수가 **등급을 민다**
   *     (`systems/keywords.ts`). 대금·평판을 따로 곱하지 않는다: 등급이 이미 그리로 흐른다. */
  makeDraft: (jobId: string, quality: QualityId, keywords?: readonly KeywordId[]) => void
  /** PPT 창의 제작 — **발표자료(`ppt`)와 화면정의서(`site`의 첫 공정)를 같은 손으로 만든다.**
   *  둘 다 "PPT 파일을 만든다"는 같은 일이라 액션을 나누지 않는다(무엇을 만든 것인지는
   *  그 업무의 종류가 이미 안다). */
  makeSlides: (jobId: string, quality: QualityId) => void
  /** 그 업무의 **끝난 공정을 요청 글에 회신한다**(행동력 0). 공정이 남았으면 상대의 답장이
   *  새 글로 오고 그것이 다음 공정을 연다. 마지막이면 완료 회신이라 업무가 끝나고
   *  만족도가 적힌 완료 메일이 온다. */
  replyJob: (id: string) => void
  /** 팝업 등록. ⚠️ **행동력을 먹지 않는다** — 등록 자체는 공정이 아니라 그 결과를
   *  올리는 손짓이다. 비용은 팝업을 **만드는** 공정(포토샵)이 진다. */
  uploadPopup: (clientId: string, fileId: string, from: number, to: number) => void
  /** 걸어 둔 팝업의 게시 기간 수정. 목록에서 고쳐 클레임을 막는 유일한 길이다. */
  updatePopupPeriod: (popupId: string, from: number, to: number) => void
  /** 즐겨찾기 켜기/끄기. ⚠️ 같은 곳을 가리키는 두 주소(`https://`·끝 슬래시)를 두 줄로
   *  쌓지 않으려고 **`normalizeUrl`한 값으로 넣고 비교한다**. */
  toggleBookmark: (url: string) => void
  /** FTP 연결 성공을 적용한다. **맞는지 판정하는 것은 `systems/ftp.ts`의 순수 함수다** —
   *  스토어는 결과만 적용한다(팝업 판정과 같은 역할 분담). 두 번 연결해도 한 줄이다. */
  connectFtp: (clientId: string) => void
  /** 사이트 퍼블리싱(에디터). **비용은 여기가 지고, 완료는 `completeJob`이 붙인다** —
   *  이 공정이 사이트 업무의 마지막 공정이라 여기가 그 첫 호출자다.
   *  ⚠️ 팝업 업무는 여기서 끝내지 않는다(등록 → 주차 넘김 판정이 그쪽의 끝이다). */
  publishJob: (id: string) => void
  /** 채용 공고를 올린다(브라우저 채용사이트). **행동력 `POST_AP`를 문다** —
   *  0이면 매주 몇 번이고 눌러 지원자를 새로 볼 수 있어 공고가 선택이 아니게 된다.
   *  ⚠️ 지원자는 저장하지 않는다 — 올린 주차만 남고 목록은 그 주차에서 파생한다. */
  postHiring: () => void
  /** 지원자를 고용한다. ⚠️ **정원(`companyGrade().hireMax`)을 넘으면 아무 일도 일어나지 않는다** —
   *  버튼 disabled만으로는 정원 초과 경로가 남는다(이 리포의 확립된 규칙). */
  hire: (applicant: Applicant) => void
  /** 직원에게 그 업무의 열린 공정을 맡긴다(메신저). **행동력 `ORDER_AP` 고정**이고
   *  결과는 `N주 뒤`에 나온다 — 등급은 **그 직원의 스탯**이 정한다(내가 고르지 않는다). */
  orderJob: (employeeId: string, jobId: string) => void
  /** 교육을 보낸다. **레벨을 올리는 유일한 길**이다(일을 시켜도 저절로 오르지 않는다).
   *  ⚠️ 돈(`TRAIN_COST`)이 모자라거나 이미 잡혀 있거나 최고 레벨이면 아무 일도 없다. */
  train: (employeeId: string) => void
  /** 직원의 요청을 **받아들인다**. 갈래마다 무는 것이 다르다(휴가=그 사람의 N주 /
   *  급여협상=월급 영구 인상 / 피드백=내 행동력 `FEEDBACK_AP` / 교육요청=`TRAIN_COST`와
   *  그 사람의 `TRAIN_WEEKS`). ⚠️ **낼 것이 없으면 아무 일도 일어나지 않는다** —
   *  버튼 disabled만으로는 음수 경로가 남는다(이 리포의 확립된 규칙).
   *  ⚠️ 받아들이면 불만은 **쌓이지 않는다**(그것이 받아들이는 값의 전부다). */
  acceptRequest: (id: string) => void
  /** 직원의 요청을 **거절한다**. 불만이 `GRUDGE_PER_REFUSAL`만큼 쌓이고, `GRUDGE_QUIT`에
   *  닿으면 **다음 주차 넘김에서** 나간다(퇴사가 도는 자리는 `advanceWeek` 하나다 —
   *  위기 퇴사와 같은 자리라 두 규칙이 서로를 안다). */
  refuseRequest: (id: string) => void

  /** 다음 주로. **팝업 판정이 도는 유일한 자리다** — 행동력을 채우고, 어긋난 팝업이
   *  있으면 항의 메일이 들어오며 평판이 깎인다. */
  advanceWeek: () => void

  /** 지금 판을 슬롯 n에 남긴다. **자동저장과 다른 자리다**(`systems/save.ts`) —
   *  자동저장은 늘 직전 한 순간만 들고 있어 지나간 판으로 돌아갈 수 없다.
   *  ⚠️ 이미 찬 슬롯은 **덮어쓴다** — 덮을지 묻는 것은 화면(`StartMenu`)의 몫이다. */
  saveSlot: (n: number) => void
  /** 슬롯 n의 판으로 되돌아간다. **지금 판은 사라진다** — 그래서 화면이 반드시 한 번 묻는다.
   *  ⚠️ 빈 슬롯·깨진 슬롯이면 **아무 일도 일어나지 않는다**(false를 돌려준다). */
  loadSlot: (n: number) => boolean
  /** 슬롯 n을 비운다. 되돌릴 수 없으므로 화면이 묻는다. */
  clearSlot: (n: number) => void
  /** 처음부터 다시. `INITIAL_GAME` + 빈 목록으로 되돌린다.
   *  ⚠️ **슬롯은 지우지 않는다** — 새 게임은 지금 판을 버리는 일이지 남겨 둔 판을
   *  버리는 일이 아니다(그것까지 날리면 되돌아올 자리가 없다). */
  newGame: () => void
}

/** 드래그 clamp에 필요한 화면 크기. 스토어는 DOM을 모르므로 호출자가 준다. */
export type Viewport = { w: number; h: number }

/** 공정 판정에 넘기는 최소 모양. **순수 함수가 스토어의 `Job` 전체를 알지 않게 한다.** */
export const asStep = (j: Job): StepJob => ({
  kind: j.kind,
  step: j.step,
  replied: j.replied,
  popupTo: j.popup?.to,
})

/** 직원이 만든 산출물에서 **어느 목록으로 갈지 가르는 칸**을 떼어 낸다.
 *  ⚠️ `program`은 나누는 데만 쓰고 파일에는 남기지 않는다 — 파일은 이미 자기 목록에
 *     들어가므로 그 칸이 두 번째 출처가 된다. */
const strip = ({ program: _program, ...file }: Draft & { program: ProgramId }): Draft => file

/** 그 공정을 실행할 차례인 업무만 통과시킨다 — 제작 액션 넷이 같은 문장을 쓴다. */
const turnOf = (jobs: Job[], id: string, program: ProgramId) => {
  const job = jobs.find((j) => j.id === id)
  return job && !job.done && isTurnOf(asStep(job), program) ? job : undefined
}

/** 실행을 마친 공정 하나를 올린다. ⚠️ 회신(`replyJob`)이 따로 세므로 여기서 `replied`는 건드리지 않는다. */
const bumpStep = (jobs: Job[], id: string) =>
  jobs.map((j) => (j.id === id ? { ...j, step: j.step + 1 } : j))

const topZ = (windows: OpenWindow[]) => windows.reduce((max, w) => Math.max(max, w.z), 0)

/** 포커스된 창 = z가 가장 큰 창. 열린 창이 없으면 null. */
export function focusedWindowId(windows: OpenWindow[]): ProgramId | null {
  return windows.reduce<OpenWindow | null>((top, w) => (!top || w.z > top.z ? w : top), null)?.id ?? null
}

/** 세이브. **키에 버전이 들어간다**(`webdi.save.v1`) — 판을 바꿀 때 키를 v2로 올리면
 *  옛 세이브는 그 순간 남의 키가 되어 자동으로 새 게임이 된다(마이그레이션 없음, 설계 결정).
 *
 * ⚠️ 저장하는 것은 **게임 상태뿐**이다. 열린 창·위치(`windows`)는 화면을 보는 방식이라
 *    빼 둔다 — 새로 켜면 바탕화면부터 시작하는 편이 창이 어디 있었는지 복원하는 것보다 낫다.
 * ⚠️ 테스트는 node 환경이라 `localStorage`가 없다. 없으면 **아무 데도 저장하지 않는 저장소**를
 *    쓴다(그래야 순수 로직 테스트가 브라우저 API에 묶이지 않는다). */
const SAVE_KEY = 'webdi.save.v1'

const noopStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

/** 저장소. ⚠️ `persist`와 **이름 있는 슬롯이 같은 것을 쓴다** — 한쪽만 localStorage를
 *  쓰면 테스트(node)에서 슬롯 액션이 터진다.
 *
 * ⚠️ 돌려주는 타입은 `Storage`(동기)다. zustand의 `StateStorage`는 `getItem`이
 *    Promise여도 되는 넓은 타입이라 슬롯 쪽에서 그대로 쓸 수 없다 — **여기서 좁힌다**
 *    (슬롯은 버튼을 누른 그 자리에서 읽고 써야 하므로 비동기 저장소를 애초에 안 받는다). */
const saveStorage = (): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> =>
  typeof localStorage === 'undefined' ? noopStorage : localStorage

/** **저장 대상을 고르는 유일한 자리.** 자동저장(`partialize`)과 이름 있는 슬롯이 둘 다
 *  이것을 쓴다 — 목록을 두 벌로 두면 슬롯에만 안 담기는 축이 조용히 생긴다.
 *  ⚠️ 새 상태 축을 더하면 **여기**에 더한다. 열린 창(`windows`)은 화면을 보는 방식이라 뺀다. */
const saveFields = (s: Store) => ({
  week: s.week,
  ap: s.ap,
  apMax: s.apMax,
  mental: s.mental,
  mentalMax: s.mentalMax,
  money: s.money,
  reputation: s.reputation,
  design: s.design,
  planning: s.planning,
  readIds: s.readIds,
  meetings: s.meetings,
  jobs: s.jobs,
  rejectedIds: s.rejectedIds,
  files: s.files,
  drafts: s.drafts,
  slides: s.slides,
  popups: s.popups,
  mails: s.mails,
  bookmarks: s.bookmarks,
  ftpClients: s.ftpClients,
  employees: s.employees,
  orders: s.orders,
  trainings: s.trainings,
  hirePostWeek: s.hirePostWeek,
  hiredApplicantIds: s.hiredApplicantIds,
  chats: s.chats,
  requests: s.requests,
  crisisWeeks: s.crisisWeeks,
  revenue: s.revenue,
  unpaidMonths: s.unpaidMonths,
  over: s.over,
})

/** 게임을 처음 상태로 되돌릴 때 붓는 값. **새 게임과 불러오기가 같은 바닥을 쓴다** —
 *  불러오기는 이 위에 슬롯의 값을 덮으므로, 옛 세이브에 없는 축도 반드시 초기값을 갖는다.
 *  ⚠️ `windows`와 `slotsRevision`은 여기 없다 — 판이 아니라 화면이다(호출자가 따로 준다). */
const emptyGame = () => ({
  ...INITIAL_GAME,
  readIds: [],
  meetings: {},
  jobs: [],
  rejectedIds: [],
  files: [],
  drafts: [],
  slides: [],
  popups: [],
  mails: [],
  bookmarks: [],
  ftpClients: [],
  employees: [],
  orders: [],
  trainings: [],
  hirePostWeek: undefined,
  hiredApplicantIds: [],
  chats: [],
  requests: [],
  crisisWeeks: 0,
  revenue: 0,
  unpaidMonths: 0,
  over: undefined,
})

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
  ...emptyGame(),
  windows: [],
  slotsRevision: 0,

  connectFtp: (clientId) =>
    set((s) => (s.ftpClients.includes(clientId) ? {} : { ftpClients: [...s.ftpClients, clientId] })),

  // ⚠️ 행동력이 모자라면 **아무 일도 일어나지 않는다**(`makePopup`과 같은 규칙 —
  //    음수로 넘어가면 다음 주까지 빚이 이어져 회복이 뜻을 잃는다).
  // ⚠️ **여기서 업무가 끝나지 않는다.** 퍼블리싱은 마지막 *공정*일 뿐이고, 완료는
  //    그 결과를 회신할 때 붙는다(`replyJob`). 팝업 업무는 애초에 차례가 오지 않는다.
  publishJob: (id) =>
    set((s) => {
      const job = turnOf(s.jobs, id, 'editor')
      if (!job || s.ap < PUBLISH_AP) return {}
      return { ap: s.ap - PUBLISH_AP, jobs: bumpStep(s.jobs, id) }
    }),

  toggleBookmark: (url) =>
    set((s) => {
      const key = normalizeUrl(url)
      if (!key) return {}
      return {
        bookmarks: s.bookmarks.includes(key)
          ? s.bookmarks.filter((b) => b !== key)
          : [...s.bookmarks, key],
      }
    }),

  openWindow: (id) =>
    set((s) => {
      // 이미 열려 있으면 새로 만들지 않고 앞으로 가져온다.
      if (s.windows.some((w) => w.id === id)) {
        return { windows: s.windows.map((w) => (w.id === id ? { ...w, z: topZ(s.windows) + 1 } : w)) }
      }
      const step = WINDOW_SPAWN.cascade * s.windows.length
      return {
        windows: [
          ...s.windows,
          { id, x: WINDOW_SPAWN.x + step, y: WINDOW_SPAWN.y + step, z: topZ(s.windows) + 1 },
        ],
      }
    }),

  closeWindow: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

  focusWindow: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, z: topZ(s.windows) + 1 } : w)),
    })),

  // 화면 밖으로 완전히 사라져 되찾을 수 없는 상태를 막는다. ⚠️ 아래쪽 상한이 없으면
  // 창을 작업 표시줄 밑으로 밀어 타이틀바를 잡을 수 없게 된다(작업 표시줄 버튼으로
  // 포커스는 돌아오지만 위치는 못 돌린다). 그래서 양쪽 끝을 다 막는다.
  moveWindow: (id, x, y, viewport) =>
    set((s) => {
      const keep = WINDOW_DRAG.keepVisible
      const clamp = (v: number, max: number) => Math.min(Math.max(0, v), Math.max(0, max))
      return {
        windows: s.windows.map((w) =>
          w.id === id
            ? { ...w, x: clamp(x, viewport.w - keep), y: clamp(y, viewport.h - keep) }
            : w,
        ),
      }
    }),

  // 읽음은 되돌리지 않는다 — 안 읽은 수는 늘 새 글에서만 온다.
  markRead: (id) => set((s) => (s.readIds.includes(id) ? {} : { readIds: [...s.readIds, id] })),

  // ⚠️ 같은 의뢰를 두 번 수주하지 않는다. 같은 id가 두 줄이 되면 완료 표시가 갈리고,
  //    나중에 공정·대금이 붙었을 때 한 건으로 두 번 받는 구멍이 된다.
  // 마감은 **받는 순간** 굳는다(이번 주 + 기한). 상대값으로 들고 있으면 주가 지나도
  // 남은 기한이 줄지 않아 데드라인이 뜻을 잃는다.
  // ⚠️ **사이트 업무는 수주한 그 주에 미팅이 잡힌다** — 알림이 그 업무가 온 채널로
  //    새 글이 되어 들어온다(참석은 피그마에서 한다). 미팅을 화면 어디에도 알리지 않으면
  //    이 기능이 있다는 것 자체를 알 길이 없다.
  acceptJob: (m) =>
    set((s) =>
      s.jobs.some((j) => j.id === m.id)
        ? {}
        : {
            ...(m.kind === 'site' && {
              mails: [meetingMail({ id: m.id, from: m.from, title: m.subject, channel: m.channel }, s.week), ...s.mails],
            }),
            jobs: [
              ...s.jobs,
              {
                id: m.id,
                from: m.from,
                title: m.subject,
                channel: m.channel,
                kind: m.kind,
                // 공정도 회신도 아직 0이다 — 첫 공정은 수주하는 순간 열린다.
                step: 0,
                replied: 0,
                due: s.week + m.dueWeeks,
                done: false,
                // 요청 기간도 **받는 주에 굳는다**(마감과 같은 이유). 상대값으로 들고
                // 있으면 주가 지나도 늘 같은 주를 가리켜 판정이 뜻을 잃는다.
                ...(m.popup && {
                  popup: {
                    clientId: m.popup.clientId,
                    from: s.week + m.popup.fromWeeks,
                    to: s.week + m.popup.toWeeks,
                  },
                }),
              },
            ],
          },
    ),

  rejectJob: (id) =>
    set((s) => (s.rejectedIds.includes(id) ? {} : { rejectedIds: [...s.rejectedIds, id] })),

  // ⚠️ 완료는 **한 방향**이다. 업무를 끝내면 목록에 취소선이 그어지고, 되돌아가지 않는다
  //    (토글로 만들면 사람이 켜고 끄는 체크박스가 되고, 그 순간 완료가 뜻을 잃는다).
  //    지금은 부르는 곳이 없다 — 공정의 줄이 생기면 **마지막 공정이** 이것을 부른다.
  completeJob: (id) =>
    set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, done: true } : j)) })),

  // 제작이 비용을 진다. ⚠️ 행동력이 모자라면 **아무 일도 일어나지 않는다** —
  //    음수 행동력으로 넘어가면 그다음 주까지 빚이 이어져 회복이 뜻을 잃는다.
  //    비용도 등급도 **고른 퀄리티**가 정한다(`data/game.ts`의 `QUALITY`).
  makePopup: (jobId, quality) =>
    set((s) => {
      const q = findQuality(quality)
      // ⚠️ 자기 차례가 아닌 업무는 여기서 만들 수 없다 — 공정의 줄을 건너뛰면
      //    회신 고리가 끊기고 마지막 공정만 눌러 업무를 끝낼 수 있게 된다.
      const job = turnOf(s.jobs, jobId, 'photoshop')
      if (!job || s.ap < q.ap) return {}
      // seq는 그 업무로 만든 파일 수다 — 같은 업무를 다시 만들어도 id가 겹치지 않는다.
      const seq = s.files.filter((f) => f.jobId === jobId).length + 1
      return {
        ap: s.ap - q.ap,
        jobs: bumpStep(s.jobs, jobId),
        files: [
          ...s.files,
          {
            id: popupFileId(jobId, seq),
            jobId,
            // 이름은 **업체와 제목**에서 온다 — 목록에서 파일만 보고 고를 때
            // 무엇의 팝업인지 알 수 있어야 "틀린 파일"이 실수이지 함정이 아니다.
            name: `${job?.from ?? jobId}_팝업${seq > 1 ? seq : ''}.png`,
            madeWeek: s.week,
            grade: gradeOf(quality, s.design),
          },
        ],
      }
    }),

  // 팝업과 **같은 규칙**이다(비용·등급 모두 퀄리티가 정하고, 모자라면 아무 일도 없다).
  // ⚠️ 갈라져 있는 것은 목록뿐이다 — 시안은 팝업 등록 화면에 뜨지 않아야 한다.
  makeDraft: (jobId, quality, keywords = []) =>
    set((s) => {
      const q = findQuality(quality)
      const job = turnOf(s.jobs, jobId, 'figma')
      if (!job || s.ap < q.ap) return {}
      const seq = s.drafts.filter((d) => d.jobId === jobId).length + 1
      // 맞춘 키워드가 등급을 민다. ⚠️ **정답은 여기서도 저장하지 않는다** — 업무 id에서
      //    그때그때 파생한다(`clientKeywords`). 그래서 세이브를 뜯어도 정답이 안 보이고,
      //    같은 업무는 몇 번을 다시 계산해도 같은 답이다.
      // ⚠️ 보정은 **등급 하나로만** 흐른다(대금·평판을 따로 곱하지 않는다 —
      //    `GRADE_REWARD`가 이미 등급을 대금·평판으로 옮긴다).
      const shift = keywordShift(hitCount(keywords, clientKeywords(jobId)))
      return {
        ap: s.ap - q.ap,
        jobs: bumpStep(s.jobs, jobId),
        drafts: [
          ...s.drafts,
          {
            id: `df:${jobId}:${seq}`,
            jobId,
            name: `${job.from}_시안${seq > 1 ? seq : ''}.fig`,
            madeWeek: s.week,
            grade: gradeOf(quality, s.design, shift),
            // 고른 키워드를 파일에 굳힌다 — 무엇을 골라서 이 등급이 나왔는지가
            // 나중에도 읽혀야 다음 시안에서 선택을 고칠 수 있다.
            keywords: [...keywords],
          },
        ],
      }
    }),

  // 미팅. ⚠️ **행동력이 모자라거나 이미 했으면 아무 일도 일어나지 않는다** — 버튼
  //    disabled만으로는 음수 경로가 남고(제작 액션들과 같은 규칙), 두 번 열면 행동력을
  //    내는 대가로 5개를 다 알 수 있어 기획력 스탯이 뜻을 잃는다.
  // ⚠️ 사이트 업무만 미팅이 있다 — 배너 한 장 바꾸는 일에 분위기 미팅은 없다.
  holdMeeting: (jobId, employeeId) =>
    set((s) => {
      const job = s.jobs.find((j) => j.id === jobId)
      if (!job || job.done || job.kind !== 'site') return {}
      if (s.meetings[jobId]) return {}

      // 알아내는 개수는 **가는 사람의 기획력**이 정한다(`data/keywords.ts`의 `MEETING_REVEAL`).
      // ⚠️ 표는 하나다 — 직원용 표를 따로 만들면 같은 기획력이 사람에 따라 다른 답을 낸다.
      if (employeeId === undefined) {
        if (s.ap < MEETING_AP) return {}
        return {
          ap: s.ap - MEETING_AP,
          meetings: { ...s.meetings, [jobId]: revealedKeywords(jobId, s.planning) },
        }
      }

      const emp = s.employees.find((e) => e.id === employeeId)
      // ⚠️ 점유는 `isBusy` 한 줄이 본다(지시·교육과 같은 규칙) — 여기서 다시 적지 않는다.
      if (!emp || isBusy(emp.id, s.orders, s.trainings)) return {}
      const doneWeek = s.week + MEETING_OCCUPY_WEEKS
      return {
        // ⚠️ 내 행동력은 들지 않는다 — 그것이 사람을 보내는 이유다. 대가는 그 직원의 한 주다.
        meetings: { ...s.meetings, [jobId]: revealedKeywords(jobId, emp.stats.planning) },
        // 미팅도 **교육과 같은 모양의 점유**다(`Training`) — 잡히는 이유가 달라도
        // "그 사람이 N주간 다른 일을 못 한다"는 사실은 하나라 목록을 나누지 않는다.
        trainings: [
          ...s.trainings,
          { employeeId, from: s.week, doneWeek, kind: 'meeting' as const },
        ],
        chats: [...s.chats, { employeeId, week: s.week, text: meetingReply(job.title, doneWeek) }],
      }
    }),

  // 시안·팝업과 같은 규칙이다. 이름만 그 업무가 무엇을 주문했는지에 따라 갈린다 —
  // 화면정의서와 발표자료는 만드는 손이 같아도 받는 쪽에는 다른 문서다.
  makeSlides: (jobId, quality) =>
    set((s) => {
      const q = findQuality(quality)
      const job = turnOf(s.jobs, jobId, 'ppt')
      if (!job || s.ap < q.ap) return {}
      const seq = s.slides.filter((d) => d.jobId === jobId).length + 1
      const what = job.kind === 'site' ? '화면정의서' : '발표자료'
      return {
        ap: s.ap - q.ap,
        jobs: bumpStep(s.jobs, jobId),
        slides: [
          ...s.slides,
          {
            id: `sl:${jobId}:${seq}`,
            jobId,
            name: `${job.from}_${what}${seq > 1 ? seq : ''}.pptx`,
            madeWeek: s.week,
            grade: gradeOf(quality, s.design),
          },
        ],
      }
    }),

  // ⚠️ 회신은 **행동력을 먹지 않는다**(팝업 등록과 같은 이유 — 결과를 올리는 손짓이지
  //    공정이 아니다). 여기가 `completeJob`을 부르는 **유일한 자리**다: 만드는 것으로는
  //    업무가 끝나지 않고, 보내야 끝난다.
  replyJob: (id) =>
    set((s) => {
      const job = s.jobs.find((j) => j.id === id)
      if (!job || !canReply(asStep(job), s.week)) return {}

      const done = repliedStep(asStep(job))!
      const final = isFinalReply(asStep(job))
      const jobs = s.jobs.map((j) =>
        j.id === id ? { ...j, replied: j.replied + 1, done: j.done || final } : j,
      )

      // 만족도는 **그 업무에서 나온 산출물 등급 중 가장 낮은 것**이다(약한 고리 규칙).
      const grades = [...s.files, ...s.drafts, ...s.slides]
        .filter((f) => f.jobId === id)
        .map((f) => f.grade)
      const next = stepsOf(job.kind)[job.replied + 1]
      if (!final) {
        return { jobs, mails: [replyMail(job, done, next!, s.week), ...s.mails] }
      }

      // 완료 회신에서만 **대금과 평판이 움직인다**(`systems/money.ts`가 값을 낸다).
      // ⚠️ 평판 clamp는 여기서 한 번만 한다 — 순수 함수 쪽에서 또 자르면 두 곳이 서로
      //    다른 값을 믿게 된다(`advanceWeek`의 클레임 처리와 같은 규칙).
      const grade = satisfaction(grades)
      const { fee, reputation } = reward(job.kind, grade)
      // ⚠️ 누적 매출은 **여기 한 곳**에서만 는다(대금이 들어오는 유일한 자리다).
      //    행동력 상한은 그 값에서 파생한다 — 두 곳에 적으면 어긋난다.
      const revenue = s.revenue + fee
      return {
        jobs,
        money: s.money + fee,
        revenue,
        // ⚠️ 상한만 올린다. **이번 주의 남은 행동력(`ap`)은 건드리지 않는다** —
        //    레벨업으로 그 자리에서 행동력이 차면 회신을 미뤘다가 몰아 쓰는 것이 최적이 된다.
        apMax: companyLevel(revenue).apMax,
        reputation: clampReputation(s.reputation + reputation),
        mails: [doneMail(job, grade, fee, s.week), ...s.mails],
      }
    }),

  // ⚠️ 행동력을 깎지 않는다. 비용은 팝업을 **만드는** 공정이 지고, 여기는 만든 것을
  //    올리는 자리다 — 등록에까지 값을 매기면 한 팝업에 두 번 값을 물린다.
  uploadPopup: (clientId, fileId, from, to) =>
    set((s) => {
      // 등록도 공정이다(팝업의 둘째 칸) — 값은 안 물지만 **단계는 오른다**.
      // ⚠️ 어느 업무의 등록인지는 **파일 id가 안다**(`isFileOf`) — 남의 파일을 걸면
      //    그 업무의 단계는 오르지 않는다. 틀린 파일을 걸고도 진행되면 클레임이 뜻을 잃는다.
      // ⚠️ **업체까지 맞아야** 공정이 끝난 것이다 — 남의 관리자 페이지에 올려 놓고
      //    "등록했다"로 넘어가면, 화면에는 진행됐다고 뜨는데 실제로는 그 업체 사이트에
      //    아무것도 안 걸린 상태가 된다(판정은 뒤늦게 `missing`으로만 잡는다).
      const owner = s.jobs.find((j) => isFileOf(fileId, j.id) && j.popup?.clientId === clientId)
      const mine = owner && turnOf(s.jobs, owner.id, 'browser')
      return {
        popups: [
          ...s.popups,
          { id: `pu:${clientId}:${s.popups.length + 1}`, clientId, fileId, from, to },
        ],
        ...(mine && { jobs: bumpStep(s.jobs, mine.id) }),
      }
    }),

  updatePopupPeriod: (popupId, from, to) =>
    set((s) => ({
      popups: s.popups.map((p) => (p.id === popupId ? { ...p, from, to } : p)),
    })),

  // ── 채용 ──────────────────────────────────────────────
  // ⚠️ 지원자는 **저장하지 않는다** — 올린 주차 하나만 남고 목록은 그 주차에서 파생한다
  //    (`systems/hire.ts`). 그래서 세이브를 불러와도 같은 사람들이 서 있다.
  // ⚠️ 행동력이 모자라면 아무 일도 일어나지 않는다(제작 액션들과 같은 규칙).
  postHiring: () =>
    set((s) => (s.ap < POST_AP ? {} : { ap: s.ap - POST_AP, hirePostWeek: s.week })),

  // ⚠️ **정원은 회사등급이 진다**(`companyGrade(reputation).hireMax`). 등급이 내려가
  //    정원을 넘겨도 **있는 직원은 자르지 않고 신규 채용만 막는다**(설계 결정) —
  //    평판이 흔들릴 때마다 사람이 잘려 나가면 회사를 굴리는 계획을 세울 수가 없다.
  // ⚠️ 스토어에도 가드를 둔다: 버튼 disabled만으로는 정원 초과 경로가 남는다.
  hire: (a) =>
    set((s) => {
      if (s.employees.length >= companyGrade(s.reputation).hireMax) return {}
      if (s.hiredApplicantIds.includes(a.id)) return {}
      return {
        hiredApplicantIds: [...s.hiredApplicantIds, a.id],
        employees: [
          ...s.employees,
          {
            id: a.id,
            name: a.name,
            role: a.role,
            level: a.level,
            stats: { ...a.stats },
            hiredWeek: s.week,
          },
        ],
      }
    }),

  // ── 지시 ──────────────────────────────────────────────
  // 직원 축의 전부가 여기 있다: **행동력 1 고정 · N주 뒤 · 그동안 점유 · 등급은 직원 스탯.**
  // ⚠️ 퀄리티를 고르지 않는다(설계 확정) — 싸고 낮은 직원은 낮은 등급만 낸다.
  //    그래서 "누구에게 맡기느냐"가 이 축의 유일한 선택이다.
  // ⚠️ 등급은 반드시 `gradeOf`를 탄다(등급의 단일 출처) — 새 사다리를 만들지 않는다.
  //    직원에게는 퀄리티가 없으므로 밴드는 **'열심히'(C~A) 고정**이다: 지시는 무난한
  //    결과를 시간으로 사는 길이지, 최고를 사는 길이 아니다(최고는 내 손으로만 나온다).
  orderJob: (employeeId, jobId) =>
    set((s) => {
      const emp = s.employees.find((e) => e.id === employeeId)
      const job = s.jobs.find((j) => j.id === jobId)
      if (!emp || !job || job.done) return {}
      const step = openStep(asStep(job))
      if (!step || !canOrder(emp, step.program, s.orders, s.trainings)) return {}
      if (s.ap < ORDER_AP) return {}
      const order: Order = {
        employeeId,
        jobId,
        program: step.program,
        label: step.label,
        from: s.week,
        doneWeek: orderDoneWeek(s.week, emp.level),
        grade: gradeOf(ORDER_QUALITY, statOf(emp, step.program)),
      }
      return {
        ap: s.ap - ORDER_AP,
        orders: [...s.orders, order],
        // 받았다는 대답이 그 방에 남는다 — 언제 끝나는지가 대화에 적혀야 메신저를
        // 다시 열었을 때 무엇을 기다리는 중인지 알 수 있다.
        chats: [...s.chats, { employeeId, week: s.week, text: orderReply(order) }],
      }
    }),

  // ⚠️ 행동력이 아니라 **돈**을 문다. 교육은 내가 손을 쓰는 일이 아니라 사람을 보내는
  //    일이고, 그 사람의 두 주(`TRAIN_WEEKS`)가 진짜 값이다.
  // ⚠️ 여기서도 막는다 — 화면이 버튼을 잠가도 스토어가 다시 막지 않으면 소지금이
  //    음수로 내려가는 길이 남는다(이 리포의 확립된 규칙).
  train: (employeeId) =>
    set((s) => {
      const emp = s.employees.find((e) => e.id === employeeId)
      if (!emp || !canTrain(emp, s.orders, s.trainings)) return {}
      if (s.money < TRAIN_COST) return {}
      const doneWeek = trainDoneWeek(s.week)
      return {
        money: s.money - TRAIN_COST,
        trainings: [
          ...s.trainings,
          { employeeId, from: s.week, doneWeek, kind: 'train' as const },
        ],
        chats: [...s.chats, { employeeId, week: s.week, text: trainReply(doneWeek) }],
      }
    }),

  // ── 요청 ──────────────────────────────────────────────
  // 직원이 **먼저 말을 거는** 축이다. 지시·교육은 내가 사람을 쓰는 방향이라, 이 축이
  // 없으면 직원이 자원으로만 읽힌다.
  //
  // ⚠️ 네 갈래가 **각자 다른 것을 문다** — 한 자리에서 갈리게 두는 이유는 무는 것이
  //    달라도 "요청 하나에 답한다"는 사실은 하나이기 때문이다(목록을 넷으로 쪼개면
  //    답하지 않은 것이 무엇인지 세는 곳이 넷이 된다).
  // ⚠️ **낼 것이 없으면 아무 일도 일어나지 않고 요청도 남는다** — 여기서 요청을 지우면
  //    행동력이 없다는 이유로 답할 기회가 사라진다(그건 무시가 아니라 사고다).
  acceptRequest: (id) =>
    set((s) => {
      const req = s.requests.find((q) => q.id === id)
      if (!req) return {}
      const emp = s.employees.find((e) => e.id === req.employeeId)
      if (!emp) return {}
      // 답한 요청은 목록에서 사라진다(상태를 두 곳에 적지 않는다).
      const rest = s.requests.filter((q) => q.id !== id)
      const say = (text: string) => [...s.chats, { employeeId: emp.id, week: s.week, text }]

      switch (req.kind) {
        // 휴가. ⚠️ 점유는 **`trainings`가 진다**(`kind: 'leave'`) — 목록을 새로 만들지
        //    않는다(사유는 달라도 "N주간 못 쓴다"는 사실은 하나다). ⚠️ `train`이 아니라
        //    `leave`라서 끝나도 레벨이 오르지 않는다(쉬다 온 사람이 강해지면 휴가가
        //    교육의 싼 대체재가 된다).
        case 'leave':
          return {
            requests: rest,
            trainings: [
              ...s.trainings,
              { employeeId: emp.id, from: s.week, doneWeek: leaveDoneWeek(s.week), kind: 'leave' as const },
            ],
            chats: say(acceptedText(req, s.week, true)),
          }

        // 급여협상. ⚠️ 월급 값을 통째로 저장하지 않고 **가산 칸만** 올린다 —
        //    `salaryOf(level, raise)`가 레벨분 위에 더하므로 교육으로 레벨이 올라도
        //    두 인상이 서로를 지우지 않는다.
        case 'raise':
          return {
            requests: rest,
            employees: s.employees.map((e) =>
              e.id === emp.id ? { ...e, raise: raisedBy(e.raise) } : e,
            ),
            chats: say(acceptedText(req, s.week, true)),
          }

        // 피드백. **내 행동력을 문다.** ⚠️ 성패는 요청 id가 씨앗이라 다시 눌러도 같다 —
        //    실패한 뒤 되돌아가 다시 굴릴 길이 있으면 확률이 도박으로 성립하지 않는다.
        // ⚠️ 등급은 **한 칸만** 오르고 사다리 밖으로 나가지 않는다(`raiseGrade`).
        case 'feedback': {
          if (!req.target || s.ap < FEEDBACK_AP) return {}
          const ok = feedbackWorks(req.id)
          const bump = <T extends { id: string; grade: Grade }>(list: T[]): T[] =>
            ok ? list.map((f) => (f.id === req.target!.fileId ? { ...f, grade: raiseGrade(f.grade) } : f)) : list
          return {
            requests: rest,
            ap: s.ap - FEEDBACK_AP,
            // 세 목록이 **같은 손짓을 받는다** — 대상이 어느 목록에 사는지는 스토어만
            // 알고, 규칙(`raiseGrade`)은 그것을 모른다.
            files: bump(s.files),
            drafts: bump(s.drafts),
            slides: bump(s.slides),
            chats: say(acceptedText(req, s.week, ok)),
          }
        }

        // 교육요청. **값도 기간도 내가 보내는 교육과 같다** — 다른 것은 결과뿐이다.
        // ⚠️ 스탯 상승은 `advanceWeek`이 준다(교육이 끝나는 자리는 거기 하나다).
        //    그래서 **얼마나 오를지를 지금 굳혀** 교육 줄에 실어 보낸다 — 나중에 다시
        //    굴리면 같은 판을 불러올 때마다 답이 달라질 수 있다.
        case 'training': {
          if (s.money < TRAIN_COST) return {}
          const doneWeek = trainDoneWeek(s.week)
          return {
            requests: rest,
            money: s.money - TRAIN_COST,
            trainings: [
              ...s.trainings,
              { employeeId: emp.id, from: s.week, doneWeek, kind: 'train' as const,
                gain: trainRequestGain(trainRequestWorks(req.id)) },
            ],
            chats: say(acceptedText(req, s.week, true)),
          }
        }
      }
    }),

  // 거절. ⚠️ **여기서 내보내지 않는다** — 퇴사가 도는 자리는 `advanceWeek` 하나다.
  //    위기 퇴사와 같은 자리에 두어야 두 규칙이 서로를 안다(한 주에 두 이유로 두 번
  //    나가거나, 나간 사람의 지시가 남는 사고가 생기지 않는다).
  refuseRequest: (id) =>
    set((s) => {
      const req = s.requests.find((q) => q.id === id)
      if (!req) return {}
      const grudge = grudged(s.employees.find((e) => e.id === req.employeeId)?.grudge)
      return {
        requests: s.requests.filter((q) => q.id !== id),
        employees: s.employees.map((e) => (e.id === req.employeeId ? { ...e, grudge } : e)),
        chats: [...s.chats, { employeeId: req.employeeId, week: s.week, text: refusedText(grudge) }],
      }
    }),

  // ⚠️ 판정은 여기서 하지 않는다 — `systems/popup.ts`의 순수 함수가 내고 스토어는
  //    **적용만** 한다(평판을 만드는 규칙이 테스트 밖으로 새지 않게).
  //
  // 행동력은 `apMax`로 완전 회복하고 **이월하지 않는다**(설계 결정). 남은 행동력을
  // 다음 주로 넘기면 아무것도 안 하고 모았다가 한 주에 쏟는 전략이 최적이 된다.
  advanceWeek: () =>
    set((s) => {
      // ⚠️ 끝난 판은 더 나아가지 않는다. 화면이 막아도 스토어가 다시 막지 않으면
      //    결과 화면 뒤에서 주차가 계속 흘러 기록이 어긋난다.
      if (s.over) return {}
      const next = s.week + 1
      const popupJobs: PopupJob[] = s.jobs
        .filter((j) => j.popup)
        .map((j) => ({ id: j.id, clientId: j.popup!.clientId, from: j.popup!.from, to: j.popup!.to, done: j.done }))

      const claims = judgePopups(next, popupJobs, s.popups)
      // 채널은 **그 클레임을 부른 업무**가 온 곳이다(한 업체의 여러 업무가 묶여도 채널은
      // 같은 업체의 같은 창구다). 이것을 넘기지 않으면 게시판 의뢰의 항의가 메일함으로 샌다.
      const claimMails = claims.map((c) =>
        claimMail(
          c,
          next,
          CLIENTS.find((x) => x.id === c.clientId)?.name ?? c.clientId,
          s.jobs.find((j) => j.id === c.jobIds[0])?.channel,
        ),
      )

      // 마감을 넘긴 업무는 그 자리에서 깨진다. ⚠️ **만들어 놓고 회신하지 않은 것도 깨진다** —
      //    납품은 보내는 것이라 창고에 쌓아 둔 결과물은 지킨 것이 아니다.
      const broken = s.jobs.filter((j) => isBreached(j, next))
      const breachMails = broken.map((j) => breachMail(j, next))

      // ── 직원이 맡은 일이 끝난다 ──────────────────────────────
      // ⚠️ **공정만 오른다**(`step`). 회신은 여전히 사람의 손이다 — 직원이 대신 만들어도
      //    납품은 보내는 일이고, 그 규칙이 흔들리면 지시 하나로 업무가 통째로 끝나 버린다.
      // ⚠️ 등급은 지시하는 순간 굳었다(`order.grade`) — 여기서 다시 계산하지 않는다.
      const finished = finishedOrders(s.orders, next)
      const byOrder = finished.reduce(
        (acc, ord) => {
          const job = acc.jobs.find((j) => j.id === ord.jobId)
          // 그 사이 깨지거나 끝난 업무면 산출물만 버린다(공정을 억지로 올리지 않는다).
          if (!job || job.done) return acc
          const emp = s.employees.find((e) => e.id === ord.employeeId)
          return {
            jobs: acc.jobs.map((j) => (j.id === ord.jobId ? { ...j, step: j.step + 1 } : j)),
            // 퍼블리싱은 산출 파일이 없다(에디터 공정과 같다 — 서버에 올리는 일이다).
            made:
              ord.program === 'editor'
                ? acc.made
                : [
                    ...acc.made,
                    {
                      // ⚠️ id에 **공정까지** 들어간다 — 한 업무의 두 공정을 같은 직원에게
                      //    맡겨도 파일 id가 겹치지 않는다.
                      id: `emp:${ord.employeeId}:${ord.jobId}:${ord.program}`,
                      jobId: ord.jobId,
                      // 누가 만들었는지가 이름에 남는다 — 목록에서 내 손으로 만든 것과
                      // 맡긴 것을 가르는 유일한 표식이다.
                      name: `${job.from}_${ord.label}(${emp?.name ?? '직원'})${ORDER_FILE_EXT[ord.program] ?? ''}`,
                      madeWeek: next,
                      grade: ord.grade,
                      program: ord.program,
                    },
                  ],
          }
        },
        { jobs: s.jobs, made: [] as (Draft & { program: ProgramId })[] },
      )

      // 만든 것은 **그 공정의 프로그램이 쓰는 목록**으로 간다 — 시안은 피그마 목록에,
      // 화면정의서·발표자료는 PPT 목록에, 팝업 이미지는 포토샵 목록에. 한 통에 몰아넣으면
      // 팝업 등록 화면에 .fig가 뜬다(목록을 가른 이유가 그것이다).
      const intoDrafts = byOrder.made.filter((m) => m.program === 'figma').map(strip)
      const intoSlides = byOrder.made.filter((m) => m.program === 'ppt').map(strip)
      const intoFiles = byOrder.made
        .filter((m) => m.program === 'photoshop')
        // 팝업 파일 id는 규약이 따로 있다(`popupFileId`) — 등록 판정이 출처를 그 id로 안다.
        .map((m, i) => ({
          ...strip(m),
          id: popupFileId(m.jobId, s.files.filter((f) => f.jobId === m.jobId).length + i + 1),
        }))

      // 직원의 완료 보고는 **메신저 대화**로 간다(메일이 아니다 — 지시와 보고는 메신저다).
      const reports = finished.map((ord) => ({
        employeeId: ord.employeeId,
        week: next,
        text: doneReply(ord, next),
      }))

      // ── 평판 위기 ────────────────────────────────────────────
      // ⚠️ 평판은 **이번 주 판정이 끝난 뒤의 값**으로 본다 — 클레임으로 위기선 아래로
      //    떨어진 그 주부터 세어야 카운터가 한 주 늦게 돌지 않는다.
      const rep = clampReputation(
        s.reputation - claims.length * CLAIM_REPUTATION_LOSS + broken.length * breach().reputation,
      )
      const inCrisis = rep < REPUTATION_CRISIS
      // 위기선 위로 오르면 **0으로 리셋**한다(설계 결정표) — 갚을 수 있는 빚이어야 한다.
      const crisisWeeks = inCrisis ? s.crisisWeeks + 1 : 0
      // 위기면 매주 **한 명**이 나간다(레벨 높은 순 — 갈 곳 있는 사람부터).
      const crisisLeaver = inCrisis ? quitter(s.employees) : undefined

      // ── 불만이 차서 나가는 사람 ──────────────────────────────
      // ⚠️ 위기 퇴사와 **같은 자리에서** 처리한다(설계 제약) — 나가는 자리가 둘이면
      //    한 주에 두 이유로 두 번 나가거나, 한쪽만 지시·교육을 걷는 사고가 난다.
      // ⚠️ 위기로 나가는 사람과 겹치면 **한 번만** 센다(같은 사람이 두 통의 퇴사 메일을
      //    보내지 않는다). 이유는 위기가 이긴다 — 회사가 가라앉는 것이 더 큰 사정이고,
      //    화면에는 그렇게 읽히는 편이 맞다.
      // ⚠️ 나가는 이유가 **메일 문안으로 구별된다**(`quitMail` vs `grudgeQuitMail`) —
      //    같은 글이면 무엇을 고쳐야 하는지 알 수 없다.
      const fedUpLeavers = s.employees.filter(
        (e) => fedUp(e.grudge) && e.id !== crisisLeaver?.id,
      )
      const leavers = [...(crisisLeaver ? [crisisLeaver] : []), ...fedUpLeavers]
      const gone = new Set(leavers.map((e) => e.id))
      const staying = s.employees.filter((e) => !gone.has(e.id))

      // ── 교육이 끝난다 ────────────────────────────────────────
      // ⚠️ **레벨과 스탯이 함께** 오른다(`trained` 한 곳에서) — 여기서 따로 더하면
      //    레벨만 오르고 스탯이 안 오르는 판이 생긴다.
      // ⚠️ 오른 레벨은 **다음 달 급여부터** 반영된다(`monthlyCost`가 아래에서 이 목록을
      //    본다) — 가르친 값이 곧바로 지출로 돌아온다.
      const doneTraining = finishedTrainings(s.trainings, next).filter(
        (t) => !gone.has(t.employeeId),
      )
      // ⚠️ **교육으로 잡혔던 사람만** 레벨이 오른다 — 미팅에 다녀온 사람은 그냥 풀린다.
      //    한 목록에 두 사유가 사는 값이 이 한 줄이다(`Training.kind`).
      // ⚠️ **오르는 폭까지 여기서 온다**(`Training.gain`) — 교육요청의 1.5배 판정은
      //    받아들이는 순간 굳어 그 줄에 실려 있다(다시 굴리면 불러올 때마다 답이 바뀐다).
      const grown = new Map(
        doneTraining.filter((t) => t.kind === 'train').map((t) => [t.employeeId, t.gain]),
      )
      const employees = staying.map((e) =>
        grown.has(e.id) ? trained(e, grown.get(e.id)) : e,
      )
      // 돌아왔다는 말도 그 방에 남는다 — 스탯은 늘 보이지만 무엇이 달라졌는지는
      // 이 한 줄이 아니면 알아채기 어렵다.
      const trainReports = employees
        .filter((e) => grown.has(e.id))
        .map((e) => ({ employeeId: e.id, week: next, text: trainedReply(e.level) }))
      // 끝난 교육과 나간 사람의 교육은 목록에서 사라진다(`keptOrders`와 같은 규칙).
      const keptTrainings = s.trainings
        .filter((t) => !doneTraining.includes(t))
        .filter((t) => !gone.has(t.employeeId))
      // 끝난 지시는 목록에서 사라진다 — 직원의 점유가 이 목록에서만 파생하므로
      // (`isBusy`) 지우는 것이 곧 "다시 일을 맡을 수 있다"이다.
      // ⚠️ 나간 사람이 들고 있던 지시도 함께 사라진다 — 맡을 사람이 없는 일은 끝나지 않는다.
      const keptOrders = s.orders
        .filter((ord) => !finished.includes(ord))
        .filter((ord) => !gone.has(ord.employeeId))

      // ── 직원 요청 ────────────────────────────────────────────
      // ⚠️ **무시도 거절과 같은 값을 문다**(`grudged`) — 다르게 매기면 답하지 않는 것이
      //    거절보다 싼 길이 되어 요청 판이 통째로 무시된다. 다만 벌은 **다음 주에** 온다:
      //    이번 주에 온 요청은 `expires`까지 답할 시간이 있다(`REQUEST_EXPIRE_WEEKS`).
      // ⚠️ 이 판정으로 임계에 닿은 사람은 **이번 주에 나가지 않는다** — 위에서 이미
      //    나갈 사람을 골랐고, 그 사람은 다음 주차 넘김에서 나간다(마지막으로 한 번
      //    더 답할 기회를 주는 편이 "무시하면 나간다"를 배우기 좋다).
      const ignored = expiredRequests(s.requests, next).filter((q) => !gone.has(q.employeeId))
      const ignoredGrudge = new Map(
        ignored.map((q) => [
          q.employeeId,
          grudged(employees.find((e) => e.id === q.employeeId)?.grudge),
        ]),
      )
      const withGrudge = employees.map((e) =>
        ignoredGrudge.has(e.id) ? { ...e, grudge: ignoredGrudge.get(e.id)! } : e,
      )
      const ignoredChats = ignored.map((q) => ({
        employeeId: q.employeeId,
        week: next,
        text: ignoredText(ignoredGrudge.get(q.employeeId)!),
      }))

      // 새 요청은 **시드에서** 온다(`systems/request.ts` — `Math.random` 없음).
      // ⚠️ 답을 기다리는 요청이 이미 있는 사람은 건너뛴다(한 사람이 두 건을 쌓아 두면
      //    어느 것에 답한 것인지가 흐려지고, 거절 한 번에 불만이 두 번 쌓인다).
      // ⚠️ **피드백이 가리킬 작업물은 세 목록을 합쳐서 넘긴다** — 대상이 하나도 없으면
      //    그 갈래는 후보에서 빠진다(고칠 것이 없는데 고쳐 달라는 요청은 뜻이 없다).
      const pending = s.requests.filter(
        (q) => !ignored.includes(q) && !gone.has(q.employeeId),
      )
      const works: Workable[] = [...s.files, ...s.drafts, ...s.slides]
      const born = withGrudge
        .filter((e) => !pending.some((q) => q.employeeId === e.id))
        .map((e) =>
          makeRequest(e, next, {
            // 점유는 지시·교육·미팅·휴가를 함께 본다(`isBusy` 한 줄이 정본이다).
            busy: isBusy(e.id, keptOrders, keptTrainings),
            maxLevel: e.level >= EMPLOYEE_LEVEL.max,
            works,
          }),
        )
        .filter((q): q is EmployeeRequest => q !== undefined)
      const requestChats = born.map((q) => ({
        employeeId: q.employeeId,
        week: next,
        text: requestText(q),
      }))

      // 월말 정산은 **마지막에** 편다 — 이번 주에 깨진 계약까지 반영한 잔액이 적혀야 한다.
      // ⚠️ 급여는 **이번 주에 나간 사람을 뺀 목록**으로 낸다 — 떠난 사람에게 월급을 주지 않는다.
      const settling = isSettleWeek(next)
      const money = s.money - (settling ? monthlyCost(withGrudge) : 0)

      // ── 급여를 줬는가 ────────────────────────────────────────
      // ⚠️ **잔액이 음수인 것과 다르다.** 월정액까지 낸 뒤 남은 돈이 급여를 덮지 못한
      //    달만 "밀린 달"이다 — 착수금이 들어오거나 대출을 받을 수도 있으므로 한 달
      //    마이너스로 회사가 문을 닫지는 않는다(설계 확정).
      // ⚠️ 한 번이라도 다 주면 **0으로 리셋**한다. 갚을 수 있는 빚이어야 빠져나올 길이 있다.
      const wages = payroll(withGrudge)
      const unpaidMonths = !settling
        ? s.unpaidMonths
        : money < 0 && wages > 0
          ? s.unpaidMonths + 1
          : 0

      // 판정 자체는 순수 함수가 진다(`systems/gameover.ts`).
      const over = judgeOver(next, unpaidMonths, crisisWeeks)

      return {
        week: next,
        ap: s.apMax,
        money,
        unpaidMonths,
        over,
        employees: withGrudge,
        orders: keptOrders,
        requests: [...pending, ...born],
        crisisWeeks,
        // 직원의 보고는 메신저 대화에 쌓인다. ⚠️ 나간 사람의 방은 통째로 사라지므로
        //    그 사람의 말도 함께 걷는다(없는 사람의 대화방을 열 자리가 없다).
        trainings: keptTrainings,
        chats: [...s.chats, ...reports, ...trainReports, ...ignoredChats, ...requestChats].filter(
          (c) => !gone.has(c.employeeId),
        ),
        drafts: [...s.drafts, ...intoDrafts],
        slides: [...s.slides, ...intoSlides],
        files: [...s.files, ...intoFiles],
        // ⚠️ 업체당 한 번만 깎는다(같은 주에 세 갈래가 어긋나도 `claims`는 한 건이다).
        //    ⚠️ clamp는 **여기 한 곳**에서만 한다(완료 회신도 같은 함수를 쓴다).
        reputation: rep,
        // 깨진 계약은 목록에서 지우지 않고 **끝난 것으로 표시**한다 — 지우면 무엇이
        // 어떻게 끝났는지가 사라지고, 같은 의뢰가 다시 새 글로 보인다.
        jobs: byOrder.jobs.map((j) => (isBreached(j, next) ? { ...j, done: true, breached: true } : j)),
        mails: [
          ...(settling ? [settleMail(next, money, withGrudge, unpaidMonths)] : []),
          // ⚠️ 나가는 이유가 **메일 문안으로 갈린다** — 위기(회사가 가라앉아서)와
          //    불만(내 말이 안 받아들여져서)은 고쳐야 할 것이 서로 다르다.
          ...(crisisLeaver ? [quitMail(crisisLeaver, next)] : []),
          ...fedUpLeavers.map((e) => grudgeQuitMail(e, next)),
          ...breachMails,
          ...claimMails,
          ...s.mails,
        ],
      }
    }),

  // ── 이름 있는 슬롯 ────────────────────────────────────────
  // ⚠️ 저장소를 만지는 것은 **여기뿐이다**. 판정(믿을 수 있는 세이브인가)과 요약 만들기는
  //    `systems/save.ts`의 순수 함수가 진다 — 팝업 판정과 같은 역할 분담이다.
  saveSlot: (n) => {
    const slot = makeSlot(saveFields(get()), Date.now())
    saveStorage().setItem(slotKey(n), JSON.stringify(slot))
    // 목록을 다시 그리게 하는 것은 이 값 하나다. ⚠️ 슬롯 내용을 스토어에 들이지 않는다 —
    //    들이면 세이브 안에 세이브가 들어가 자동저장이 판마다 배로 불어난다.
    set((s) => ({ slotsRevision: s.slotsRevision + 1 }))
  },

  // ⚠️ **되돌릴 수 없다** — 지금 판이 슬롯의 판으로 통째로 갈린다. 그래서 화면이 한 번 묻고,
  //    여기서는 묻지 않는다(같은 질문을 두 곳에서 하면 어느 쪽이 진짜 결정인지가 흐려진다).
  // ⚠️ 못 믿을 세이브(빈 칸·깨진 JSON·남의 판)는 `parseSlot`이 null로 떨어뜨린다 —
  //    부어 넣고 나서 죽으면 되돌릴 자리가 없으므로 **붓기 전에** 막는다.
  loadSlot: (n) => {
    const slot = parseSlot(saveStorage().getItem(slotKey(n)))
    if (!slot) return false
    // 빠진 축은 `INITIAL_GAME`과 빈 목록이 메운다 — 옛 세이브라도 게임이 서야 한다.
    // 열린 창은 슬롯에 없으므로 **바탕화면부터 시작한다**(자동저장과 같은 규칙).
    set({ ...emptyGame(), ...(slot.data as Partial<Store>), windows: [] })
    return true
  },

  clearSlot: (n) => {
    saveStorage().removeItem(slotKey(n))
    set((s) => ({ slotsRevision: s.slotsRevision + 1 }))
  },

  // ⚠️ 슬롯은 건드리지 않는다(남겨 둔 판까지 날리면 되돌아올 자리가 없다).
  newGame: () => set({ ...emptyGame(), windows: [] }),
  }),
  {
    name: SAVE_KEY,
    storage: createJSONStorage(saveStorage),
    // ⚠️ 함수(액션)는 저장하지 않는다. 목록의 정본은 `saveFields` 하나다 —
    //    이름 있는 슬롯도 같은 것을 담아야 "불러오면 그때로 돌아온다"가 성립한다.
    partialize: saveFields,
  },
))
