import { WORKDAY_COUNT } from '../data/game'

/** 지금 서 있는 자리. `week`는 여기 없다 — **작업은 주를 넘지 못하므로**(아래) 한 주
 *  안에서의 위치만 있으면 된다. 주차는 스토어가 따로 든다(`advanceWeek`가 정본). */
export type Clock = {
  /** 0 = 월요일. `WORKDAY_COUNT`(5)일 뿐이라 주말은 이 축에 없다. */
  day: number
  /** 오늘 이미 쓴 분. 남은 시간은 `dayMins - spent`다. */
  spent: number
}

/** 일정표에 깔리는 블록 한 칸. 하루를 넘는 작업은 **날마다 한 칸씩** 쪼개져 나온다 —
 *  달력이 요일 격자라 한 칸이 두 날에 걸칠 수 없다. */
export type Block = { day: number; start: number; mins: number }

export const START_CLOCK: Clock = { day: 0, spent: 0 }

/** 이번 주에 아직 일할 수 있는 분. 오늘 남은 것 + 남은 날들.
 *
 * ⚠️ 모든 날의 근무 시간이 같다고 본다(`dayMins` 하나를 받는다) — 그 값은 회사레벨과
 *    정신력에서 오는데 **둘 다 주차 넘김에서만 변하므로** 한 주 안에서는 실제로 상수다. */
export const weekLeft = (c: Clock, dayMins: number): number =>
  dayMins - c.spent + (WORKDAY_COUNT - 1 - c.day) * dayMins

/** 그만큼 일할 수 있는가. **화면과 스토어가 같이 부르는 판정이다** — 버튼이 "할 수 있다"고
 *  적었는데 스토어가 거절하면 눌러도 아무 일 없는 컨트롤이 된다.
 *
 * ⚠️ **주를 넘기는 작업은 시작하지 못한다**(설계 확정). 넘기게 두면 작업 도중에
 *    `advanceWeek`가 돌아 마감 파기·정산·클레임이 내가 안 보는 사이에 터지고, 되돌릴 수
 *    없는 일을 한 번 묻는다는 규칙도 깨진다. 대신 **"이번 주에 이걸 시작할 시간이
 *    남았는가"가 이 게임의 새 판단이 된다** — 목요일에 사흘짜리를 집으면 다음 주로 미룬다. */
export const canSpend = (c: Clock, mins: number, dayMins: number): boolean =>
  mins <= weekLeft(c, dayMins)

/** 그 작업이 끝나는 자리와, 달력에 깔릴 블록들.
 *
 * ⚠️ **`canSpend`가 참일 때만 부른다** — 거짓인데 부르면 주 밖(마지막 날 너머)으로 나간다.
 * ⚠️ 하루를 꽉 채우면 **다음 날 아침으로 넘어간 자리**를 낸다(그날 0분 남은 채로 서 있지
 *    않는다). 그래야 "오늘은 끝났다"가 남은 시간 0이 아니라 날짜로 읽힌다. */
export function spendTime(
  c: Clock,
  mins: number,
  dayMins: number,
): { end: Clock; blocks: Block[] } {
  const blocks: Block[] = []
  let { day, spent } = c
  let left = mins

  while (left > 0) {
    const room = dayMins - spent
    const use = Math.min(room, left)
    if (use > 0) blocks.push({ day, start: spent, mins: use })
    spent += use
    left -= use
    // 하루가 찼으면 다음 날 아침으로. ⚠️ 남은 일이 없어도 넘긴다 — 0분 남은 오늘에
    //    서 있으면 무엇도 시작할 수 없는데 화면은 아직 오늘이라고 말한다.
    if (spent >= dayMins) {
      day += 1
      spent = 0
    }
  }

  return { end: { day, spent }, blocks }
}

/** 하루를 접는다(남은 시간은 버린다). 금요일이면 `null` — **주차를 넘기는 것은
 *  스토어의 `advanceWeek`이고, 이 순수 함수는 그것을 대신하지 않는다**. */
export const nextDay = (c: Clock): Clock | null =>
  c.day + 1 >= WORKDAY_COUNT ? null : { day: c.day + 1, spent: 0 }
