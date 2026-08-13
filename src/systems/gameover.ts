import { CRISIS_WEEKS_TO_SHUTDOWN, UNPAID_MONTHS_TO_BANKRUPT } from '../data/game'
import { formatWeek } from './calendar'

/** 게임이 끝나는 판정. **순수 함수다**(`src/systems/` 규칙).
 *
 * 끝나는 길은 **둘뿐이다**(설계 결정표, 엔딩·도감 없음):
 *  - **파산**: **직원 급여를 `UNPAID_MONTHS_TO_BANKRUPT`달 연속 못 줬다**
 *  - **폐업**: 평판이 위기선 아래에 `CRISIS_WEEKS_TO_SHUTDOWN`주 붙어 있었다
 *
 * ⚠️ **폐업을 파산에서 파생시키지 마라**(설계 결정표의 명시적 규칙). 직원이 다 나가면
 *    급여도 사라져 지출이 줄기 때문에, 평판 0짜리 회사가 잔고만 두둑하면 아무것도 안 하며
 *    수십 주를 버틴다 — 할 일도 죽을 길도 없는 구간이 생긴다. 그래서 **명시적 카운터**를 둔다.
 *
 * ⚠️ **잔액이 음수인 것 자체는 파산이 아니다**(설계 확정) — 착수금이 들어오거나 대출을
 *    받을 수도 있어 한 달 마이너스로 회사가 문을 닫지는 않는다. 회사를 무너뜨리는 것은
 *    **사람에게 줄 돈을 못 주는 것**이고, 그것이 여러 달 이어질 때다. 그래서 보는 것은
 *    잔액이 아니라 **밀린 달 수**이고, 갚으면 0으로 리셋된다.
 *
 * ⚠️ 판정이 스토어로 새면 게임이 끝나는 규칙이 테스트 밖으로 나간다 —
 *    `popup.ts`의 클레임 판정과 같은 역할 분담이다. */

export type OverKind = 'bankrupt' | 'shutdown'

/** 끝난 판. `week`는 **끝난 주차**다(결과 화면이 "몇 주 버텼는가"를 적는다). */
export type GameOver = {
  kind: OverKind
  week: number
}

/** 이 주에 게임이 끝나는가. 안 끝나면 undefined.
 *
 * ⚠️ **파산을 먼저 본다.** 급여가 여러 달 밀렸으면 그 주에 회사가 문을 닫는 것이고,
 *    평판 카운터는 거기서 멈춘다.
 *
 * ⚠️ `unpaidMonths`는 **급여를 못 준 달이 연속 몇 번인가**다 — 잔액이 아니다.
 *    한 번이라도 다 주면 호출 쪽에서 0으로 리셋한다. */
export function judgeOver(
  week: number,
  unpaidMonths: number,
  crisisWeeks: number,
): GameOver | undefined {
  if (unpaidMonths >= UNPAID_MONTHS_TO_BANKRUPT) return { kind: 'bankrupt', week }
  if (crisisWeeks >= CRISIS_WEEKS_TO_SHUTDOWN) return { kind: 'shutdown', week }
  return undefined
}

/** 결과 화면이 적는 말. ⚠️ **무엇 때문에 끝났는지를 그대로 적는다** — "게임 오버" 한 줄로
 *  뭉치면 다음 판에서 무엇을 다르게 해야 하는지 알 수 없다. */
export const OVER_TEXT: Record<OverKind, { title: string; why: string }> = {
  bankrupt: {
    title: '파산했다',
    why: `직원 급여를 ${UNPAID_MONTHS_TO_BANKRUPT}달 연속 주지 못했다. 사람에게 줄 돈이 없는 회사는 굴러가지 않는다.`,
  },
  shutdown: {
    title: '폐업했다',
    why: `회사평판이 바닥에 ${CRISIS_WEEKS_TO_SHUTDOWN}주 붙어 있었다. 신규 수주가 끊기고 직원이 모두 떠났다.`,
  },
}

/** 얼마나 버텼는지. 결과 화면의 유일한 기록이다(도감·점수는 만들지 않는다 — 설계 결정표). */
export const survivedText = (week: number): string => `${formatWeek(week)}까지 ${week}주`
