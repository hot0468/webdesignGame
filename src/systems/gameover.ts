import { CRISIS_WEEKS_TO_SHUTDOWN } from '../data/game'
import { formatWeek } from './calendar'

/** 게임이 끝나는 판정. **순수 함수다**(`src/systems/` 규칙).
 *
 * 끝나는 길은 **둘뿐이다**(설계 결정표, 엔딩·도감 없음):
 *  - **파산**: 월말 정산을 치르고 소지금이 음수다
 *  - **폐업**: 평판이 위기선 아래에 `CRISIS_WEEKS_TO_SHUTDOWN`주 붙어 있었다
 *
 * ⚠️ **폐업을 파산에서 파생시키지 마라**(설계 결정표의 명시적 규칙). 직원이 다 나가면
 *    급여도 사라져 지출이 줄기 때문에, 평판 0짜리 회사가 잔고만 두둑하면 아무것도 안 하며
 *    수십 주를 버틴다 — 할 일도 죽을 길도 없는 구간이 생긴다. 그래서 **명시적 카운터**를 둔다.
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
 * ⚠️ **파산을 먼저 본다.** 소지금이 음수면 그 주에 회사가 문을 닫는 것이고, 평판 카운터는
 *    거기서 멈춘다 — 둘이 같은 주에 걸리면 돈이 없어 못 버티는 쪽이 먼저 온다.
 *
 * ⚠️ `money`는 **정산을 치른 뒤의 잔액**을 넣어라(월말이 아닌 주에는 그대로다).
 *    정산 전 값을 넣으면 급여를 못 준 주가 파산으로 안 잡힌다. */
export function judgeOver(
  week: number,
  money: number,
  crisisWeeks: number,
): GameOver | undefined {
  if (money < 0) return { kind: 'bankrupt', week }
  if (crisisWeeks >= CRISIS_WEEKS_TO_SHUTDOWN) return { kind: 'shutdown', week }
  return undefined
}

/** 결과 화면이 적는 말. ⚠️ **무엇 때문에 끝났는지를 그대로 적는다** — "게임 오버" 한 줄로
 *  뭉치면 다음 판에서 무엇을 다르게 해야 하는지 알 수 없다. */
export const OVER_TEXT: Record<OverKind, { title: string; why: string }> = {
  bankrupt: {
    title: '파산했다',
    why: '월말 정산에서 소지금이 음수가 됐다. 고정 지출(월정액·급여)보다 버는 것이 적었다.',
  },
  shutdown: {
    title: '폐업했다',
    why: `회사평판이 바닥에 ${CRISIS_WEEKS_TO_SHUTDOWN}주 붙어 있었다. 신규 수주가 끊기고 직원이 모두 떠났다.`,
  },
}

/** 얼마나 버텼는지. 결과 화면의 유일한 기록이다(도감·점수는 만들지 않는다 — 설계 결정표). */
export const survivedText = (week: number): string => `${formatWeek(week)}까지 ${week}주`
