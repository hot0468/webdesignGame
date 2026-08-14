import { CLIENTS, REFERRAL_CLIENTS } from '../data/company'
import {
  AWARD_CHANCE,
  AWARD_MIN_GRADE,
  AWARD_PRIZE,
  AWARD_REPUTATION,
  COPYRIGHT_CHANCE,
  COPYRIGHT_FEE,
  COPYRIGHT_FROM_WEEK,
  COPYRIGHT_REPUTATION,
  REFERRAL_CHANCE,
  REFERRAL_MIN_REPUTATION,
} from '../data/events'
import type { Grade } from '../data/game'
import type { Message } from '../data/inbox'
import { formatWeek } from './calendar'
import { GRADE_ORDER } from './pipeline'
import { roller } from './seed'

/** 특수 이벤트 셋 — **소개·수상**(좋은 일)과 **저작권 위반**(나쁜 일).
 *
 * ⚠️ 순수 함수다(`src/systems/` 규칙). 무작위는 전부 `seed.ts`의 `roller`가 **주차에서
 *    파생한 씨앗**으로 굴린다 — 새 난수 상태를 저장하지 않고, 같은 판을 불러오면 같은
 *    일이 일어난다(창을 닫았다 열어 다시 굴릴 수 없다).
 *
 * ⚠️ 씨앗 접두사는 **다른 이벤트와 겹치면 안 된다**(`ref:`는 어워더즈가 이미 쓴다 —
 *    여기서는 `rfr:`·`awd:`·`cpr:`). 겹치면 두 무작위가 같은 답을 내며 붙어 다닌다. */

/** ── 소개·추천 ─────────────────────────────────────── */

/** 이번 주에 소개받는 업체 id. 없으면 undefined.
 *
 * ⚠️ **평판이 문턱을 넘어야** 온다 — 이것이 "평판을 올린 보상"이라는 뜻이다.
 * ⚠️ 이미 거래 중인 곳은 후보에서 빠진다(같은 곳을 두 번 소개받지 않는다). */
export function referralOf(
  week: number,
  reputation: number,
  known: readonly string[],
): string | undefined {
  if (reputation < REFERRAL_MIN_REPUTATION) return undefined
  const pool = REFERRAL_CLIENTS.filter((id) => !known.includes(id))
  if (pool.length === 0) return undefined

  const roll = roller(`rfr:${week}`)
  if (!roll.chance(REFERRAL_CHANCE)) return undefined
  return roll.pick(pool)
}

/** 소개 통보. ⚠️ `ad: true` 갈래다 — 알리는 글이지 의뢰가 아니다(의뢰는 그 업체가
 *  거래처가 된 **뒤에** 평소 경로로 온다). */
export function referralMail(clientId: string, week: number): Message {
  const client = CLIENTS.find((c) => c.id === clientId)!
  return {
    id: `referral:${week}:${clientId}`,
    channel: 'mail',
    from: '웹디검색',
    subject: `${client.name}에서 문의가 들어왔습니다`,
    body:
      `거래하시던 업체에서 소개를 받았다며 ${client.name}에서 연락이 왔습니다.\n` +
      `사내시스템의 업체정보에 접속 정보가 추가되었습니다. 앞으로 이곳의 의뢰도 받게 됩니다.`,
    at: formatWeek(week),
    ad: true,
  }
}

/** ── 수상 ──────────────────────────────────────────── */

const isAwardable = (grade: Grade) =>
  GRADE_ORDER.indexOf(grade) >= GRADE_ORDER.indexOf(AWARD_MIN_GRADE as Grade)

/** 이번 주에 상을 받는가. **후보(그 등급 이상인 작업물)가 있어야** 굴린다 —
 *  없는데 굴리면 "만든 것도 없는데 상을 받는" 판이 된다. */
export const awardWon = (week: number, grades: readonly Grade[]): boolean =>
  grades.some(isAwardable) && roller(`awd:${week}`).chance(AWARD_CHANCE)

/** 수상 통보. */
export function awardMail(week: number): Message {
  return {
    id: `award:${week}`,
    channel: 'mail',
    from: '어워더즈',
    subject: '이달의 작업물로 선정되었습니다',
    body:
      `보내 주신 작업물이 이달의 좋은 작업으로 뽑혔습니다.\n` +
      `상금 ${AWARD_PRIZE.toLocaleString('ko-KR')}원과 함께 사이트에 소개해 드립니다.\n` +
      `축하드립니다.`,
    at: formatWeek(week),
    ad: true,
  }
}

/** ── 저작권 위반 ───────────────────────────────────── */

/** 어떤 것을 잘못 썼는가. **문안만 가르는 값이다**(벌은 같다) — 매번 같은 글이 오면
 *  사건이 아니라 세금처럼 읽힌다. */
const COPYRIGHT_KINDS = [
  { what: '웹폰트', detail: '상업용 라이선스가 없는 웹폰트가 사용되었습니다' },
  { what: '이미지', detail: '유료 스톡 이미지가 출처 표기 없이 사용되었습니다' },
] as const

/** 이번 주에 법무사무실에서 연락이 오는가.
 *
 * ⚠️ **납품한 것이 있어야** 온다 — 아직 만든 것도 없는데 합의금부터 무는 판을 막는다.
 * ⚠️ `COPYRIGHT_FROM_WEEK` 전에는 오지 않는다(초반에 현금이 마르면 회복이 불가능하다). */
export const copyrightHit = (week: number, delivered: number): boolean =>
  week >= COPYRIGHT_FROM_WEEK && delivered > 0 && roller(`cpr:${week}`).chance(COPYRIGHT_CHANCE)

/** 법무사무실 통보. ⚠️ `ad: true` — 고를 것이 없다(이미 나간 돈이다). */
export function copyrightMail(week: number): Message {
  const kind = roller(`cprkind:${week}`).pick(COPYRIGHT_KINDS)
  return {
    id: `copyright:${week}`,
    channel: 'mail',
    from: '법무법인 정도',
    subject: `[통지] ${kind.what} 저작권 사용에 관한 건`,
    body:
      `귀사가 납품한 웹사이트에서 ${kind.detail}.\n` +
      `권리사와 협의하여 합의금 ${COPYRIGHT_FEE.toLocaleString('ko-KR')}원으로 갈음하였음을 알려 드립니다.\n` +
      `향후 작업 시 소재의 라이선스를 확인해 주시기 바랍니다.`,
    at: formatWeek(week),
    ad: true,
  }
}

export { AWARD_PRIZE, AWARD_REPUTATION, COPYRIGHT_FEE, COPYRIGHT_REPUTATION }
