import { findQuality, type Grade, type QualityId } from '../data/game'
import { shiftGrade } from './keywords'

/** 제작 결과의 등급을 내는 순수 함수(`src/systems/` 규칙 — React·mutation·Math.random 없음).
 *
 * **고른 퀄리티가 밴드를, 스탯이 그 안의 칸을 정한다.** 이 둘을 뒤바꾸지 말 것:
 * 스탯이 밴드를 정하면 "공들이기"라는 선택이 사라지고, 퀄리티가 칸을 정하면 스탯을
 * 올릴 이유가 사라진다.
 *
 * ⚠️ **무작위가 없다.** 같은 스탯 + 같은 퀄리티는 늘 같은 등급이다 — 결과가 흔들리면
 *    플레이어가 자기 선택을 평가할 수 없고, 이 리포의 시스템 규칙(시드 없는 난수 금지)에도
 *    걸린다. 흔들림이 필요해지면 그때 **시드를 받는 인자**를 더한다. */
/** 피그마로 만든 시안 하나. 팝업 파일(`systems/popup.ts`의 `PopupFile`)과 같은 모양이지만
 *  **다른 목록에 산다** — 시안이 팝업 등록 화면에 뜨면 안 되기 때문이다. */
export type Draft = {
  id: string
  /** 그 시안을 주문한 업무(`Job.id` = 의뢰 글의 id). */
  jobId: string
  name: string
  madeWeek: number
  grade: Grade
  /** 그 시안에서 **고른 분위기 키워드**(`data/keywords.ts`). 시안에만 있다 —
   *  팝업·PPT는 키워드를 고르지 않는다(그래서 optional이고 없으면 없는 것이 맞다).
   *  ⚠️ 등급은 이미 이 선택을 반영해 굳었다 — 화면에서 다시 계산하지 말 것. */
  keywords?: string[]
}

/** `shift`는 **밴드 밖으로 나가는 보정**이다(시안의 키워드 적중 — `systems/keywords.ts`).
 *  ⚠️ 밴드 안에서 클램프하지 않는다: 다 맞혔는데 '간단하게'의 상한(B)에 막히면 미팅이
 *     헛일이 되고, 다 틀렸는데 '매우 신경써서'의 하한(S)에 걸리면 벌이 사라진다.
 *     대신 **전체 사다리(F~SSS)** 밖으로는 못 나간다(`shiftGrade`).
 *  ⚠️ 등급을 내는 곳은 **여기 하나다** — 컴포넌트나 스토어에서 등급을 다시 계산하지 말 것. */
export function gradeOf(quality: QualityId, stat: number, shift = 0): Grade {
  const { grades } = findQuality(quality)
  // 스탯 0~100을 밴드 칸 수로 나눈다. ⚠️ 100은 나눗셈이 밴드 밖으로 나가므로 clamp가
  //    필요하다(마지막 칸에 붙는다). 음수 스탯도 첫 칸으로 막는다.
  const i = Math.floor((stat / 100) * grades.length)
  const base = grades[Math.min(grades.length - 1, Math.max(0, i))]!
  return shift === 0 ? base : shiftGrade(base, shift)
}
