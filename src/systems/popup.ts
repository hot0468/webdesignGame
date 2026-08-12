import { formatWeek } from './calendar'
import type { Grade } from '../data/game'
import type { Channel, Message } from '../data/inbox'

/** 팝업 고리의 판정. **순수 함수다**(`src/systems/` 규칙 — React·mutation·Math.random 없음).
 *
 * 이 파일이 도는 자리는 하나뿐이다: **주차가 넘어갈 때**(`store.advanceWeek`).
 * 스토어는 여기가 낸 결과를 **적용만** 한다 — 판정 로직이 스토어로 새면 평판을 만드는
 * 규칙이 테스트 밖으로 나간다. */

/** 포토샵이 만들어 낸 팝업 이미지 파일 하나.
 *
 * ⚠️ `jobId`가 이 파일이 **어느 의뢰의 것인지**를 진다. "틀린 파일을 골랐다"가 성립하려면
 *    파일이 자기 출처를 알아야 한다 — 이름만으로 대조하면 같은 이름이 겹치는 순간 무너진다. */
export type PopupFile = {
  id: string
  /** 그 파일을 주문한 업무(`Job.id` = 의뢰 글의 id). */
  jobId: string
  name: string
  /** 만든 주차. 목록에서 언제 만든 것인지 보여 준다. */
  madeWeek: number
  /** 만들 때 고른 퀄리티와 디자인 스탯이 낸 등급(`systems/craft.ts`).
   *  ⚠️ 판정(`judgePopups`)은 등급을 보지 않는다 — 어긋남은 **어느 파일을 언제 걸었나**의
   *  문제이고 잘 만들었는지와 무관하다. 등급이 값을 하는 곳은 완료 보상이다. */
  grade: Grade
}

/** 관리자 페이지에 실제로 걸린 팝업 하나. **플레이어가 적어 넣은 기간**을 진다 —
 *  요청 기간(의뢰)의 사본이 아니라 **주장**이다. 둘이 어긋나면 그게 클레임이다.
 *
 * ⚠️ `from`/`to`는 **통산 주차이고 양끝을 포함한다**(`from <= week <= to`면 걸려 있다).
 *    반열림 구간으로 바꾸면 "3주간"이라고 쓴 의뢰문과 화면의 날짜가 한 주씩 어긋난다. */
export type Popup = {
  id: string
  clientId: string
  fileId: string
  from: number
  to: number
}

/** 어긋남의 세 갈래. ⚠️ 색이 아니라 **글자**가 이것을 말한다(`--nv-*`에 빨강이 없다). */
export type ClaimKind =
  /** 그 의뢰가 요구한 팝업이 아닌 파일을 걸었다. */
  | 'wrong-file'
  /** 요청 기간이 지났는데 아직 걸려 있다. */
  | 'overstay'
  /** 요청 기간인데 안 걸려 있다(등록을 안 했거나 기간을 잘못 넣었다). */
  | 'missing'

/** 한 업체가 그 주에 낸 항의. ⚠️ **업체당 한 건이다** — 세 갈래가 동시에 어긋나도
 *  `kinds`에 모여 한 건으로 나온다(메일 한 통, 평판 한 번). */
export type Claim = {
  clientId: string
  /** 그 업체 쪽에서 어긋난 업무들(`Job.id`). */
  jobIds: string[]
  kinds: ClaimKind[]
}

/** 판정이 보는 업무의 최소 모양. ⚠️ 스토어의 `Job` 전체를 받지 않는다 —
 *  순수 함수가 스토어 타입에 묶이면 스토어를 고칠 때마다 여기가 흔들린다. */
export type PopupJob = {
  id: string
  clientId: string
  /** 요청 기간(통산 주차, 양끝 포함). **정본은 의뢰다** — 수주할 때 굳는다. */
  from: number
  to: number
  done: boolean
}

/** 그 주에 팝업이 걸려 있어야 하는가. 양끝을 포함한다. */
const inRange = (week: number, from: number, to: number) => week >= from && week <= to

/** `week` 시점의 팝업 상태를 검사해 업체별 항의를 낸다.
 *
 * 세 갈래를 이렇게 가른다:
 *  - **wrong-file**: 그 업체에 걸린 팝업이 있는데, 그 파일이 이 업무(`jobId`)의 것이 아니다
 *  - **overstay**: 요청 기간이 아닌데 그 업무의 팝업이 아직 걸려 있다
 *  - **missing**: 요청 기간인데 걸린 것이 없다
 *
 * ⚠️ **완료(`done`) 업무는 보지 않는다.** 끝난 일로 계속 항의가 오면 빠져나갈 길이 없다.
 * ⚠️ 결과는 `clientId` 순서가 아니라 **`jobs` 순서**를 따른다 — 목록이 흔들리지 않아야
 *    같은 상태에서 늘 같은 메일이 나온다(테스트가 순서에 기댈 수 있다). */
export function judgePopups(week: number, jobs: PopupJob[], popups: Popup[]): Claim[] {
  const byClient = new Map<string, Claim>()

  const add = (clientId: string, jobId: string, kind: ClaimKind) => {
    const found = byClient.get(clientId)
    if (!found) {
      byClient.set(clientId, { clientId, jobIds: [jobId], kinds: [kind] })
      return
    }
    // 같은 업체·같은 주는 **한 통**이다. 같은 갈래가 두 번 들어가지 않게 막는다 —
    // 메일 본문에 같은 문장이 두 번 서면 세 갈래를 구분해 읽을 수가 없다.
    if (!found.jobIds.includes(jobId)) found.jobIds.push(jobId)
    if (!found.kinds.includes(kind)) found.kinds.push(kind)
  }

  for (const job of jobs) {
    if (job.done) continue

    const mine = popups.filter((p) => p.clientId === job.clientId)
    const live = mine.filter((p) => inRange(week, p.from, p.to))
    const should = inRange(week, job.from, job.to)

    // 이 업무의 파일로 걸린 것만이 "이 의뢰를 이행한" 팝업이다.
    const own = live.filter((p) => isFileOf(p.fileId, job.id))

    if (should && own.length === 0) {
      // 걸린 것이 아예 없으면 없는 것이고, 남의 파일이 걸려 있으면 틀린 파일이다.
      // ⚠️ 둘을 동시에 내지 않는다 — 한 업무의 한 어긋남에 두 문장이 서면 무엇을
      //    고쳐야 하는지가 흐려진다.
      add(job.clientId, job.id, live.length > 0 ? 'wrong-file' : 'missing')
    }
    if (!should && own.length > 0) add(job.clientId, job.id, 'overstay')
  }

  return [...byClient.values()]
}

/** 파일 id가 그 업무의 것인가. **파일 id에 업무 id를 심는다** —
 *  판정 함수가 파일 목록 전체를 받지 않아도 출처를 알 수 있어서다. */
export const popupFileId = (jobId: string, seq: number) => `pf:${jobId}:${seq}`
export const isFileOf = (fileId: string, jobId: string) => fileId.startsWith(`pf:${jobId}:`)

/** 항의 메일 한 통. ⚠️ **`ad: true` 갈래다** — 클레임에 견적보내기가 붙으면 항의를
 *  수주하게 된다. 기한이 없는 글이라는 뜻이기도 하다.
 *
 * ⚠️ `id`에 주차가 들어간다 — 같은 업체가 다음 주에 또 항의하면 **다른 글**이어야
 *    안 읽은 뱃지가 다시 선다(같은 id면 이미 읽은 글로 묻힌다). */
export function claimMail(
  claim: Claim,
  week: number,
  clientName: string,
  /** ⚠️ **그 업무가 온 채널로 돌아간다.** 고객게시판 의뢰의 항의가 메일함에 서면
   *  한 스레드가 두 창으로 갈린다(답장·완료 메일은 이미 `job.channel`을 따른다). */
  channel: Channel = 'mail',
): Message {
  return {
    id: `claim:${claim.clientId}:${week}`,
    channel,
    from: clientName,
    subject: '팝업 관련해서 확인 부탁드립니다',
    body: `${clientName}입니다. 홈페이지 팝업이 요청드린 것과 다릅니다.\n${claim.kinds
      .map((k) => `- ${CLAIM_TEXT[k]}`)
      .join('\n')}\n빠르게 확인 부탁드립니다.`,
    // 도착 시각도 **다른 메일과 같은 표기**다(`formatWeek`) — 목록에서 "5주차" 하나만
    // 다른 형식이면 그 글이 게임 밖에서 온 것처럼 읽힌다.
    at: formatWeek(week),
    ad: true,
  }
}

/** 세 갈래를 사람 말로. ⚠️ 색이 없는 팔레트라 **글자가 유일한 전달 수단**이다 —
 *  "잘못됐습니다" 한 문장으로 뭉치지 말고 무엇이 어긋났는지 그대로 적는다. */
export const CLAIM_TEXT: Record<ClaimKind, string> = {
  'wrong-file': '요청드린 것과 다른 이미지가 올라가 있습니다.',
  overstay: '기간이 끝났는데 팝업이 아직 내려가지 않았습니다.',
  missing: '기간인데 팝업이 보이지 않습니다.',
}
