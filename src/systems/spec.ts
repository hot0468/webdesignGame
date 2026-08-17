import {
  MINS_PER_SLIDE,
  POPUP_SIZES,
  SIZE_MISS_SHIFT,
  SLIDE_FILL,
  SLIDE_RANGE,
  type PopupSize,
} from '../data/spec'
import { roller } from './seed'

/** 제작 사양의 규칙 전부. **순수 함수다**(`src/systems/` 규칙 — React·mutation 없음).
 *
 * ⚠️ **`Math.random`이 없다.** 사양은 업무마다 달라야 하지만 같은 업무는 늘 같은 답이어야
 *    한다 — 창을 닫았다 열 때마다 요구가 바뀌면 의뢰서를 읽는 일이 뜻을 잃는다. 그래서
 *    씨앗은 **업무 id 하나**다(`clientKeywords`와 같은 규칙, 저장하지 않는다). */

/** 그 팝업 업무가 요구하는 캔버스 규격. 의뢰 글이 이 값을 적고, 포토샵이 이 값을 묻는다. */
export const popupSize = (jobId: string): PopupSize =>
  roller(`size:${jobId}`).pick(POPUP_SIZES)

/** 만든 규격이 요구와 같은가. ⚠️ **두 변을 다 본다** — 넓이만 재면 640×480과 480×640이
 *  같은 것이 되어 세로형 요구가 뜻을 잃는다. */
export const sizeFits = (jobId: string, size: PopupSize): boolean => {
  const want = popupSize(jobId)
  return size.w === want.w && size.h === want.h
}

/** 규격이 어긋난 만큼 등급이 밀리는 칸(맞으면 0). */
export const sizeShift = (jobId: string, size: PopupSize): number =>
  sizeFits(jobId, size) ? 0 : SIZE_MISS_SHIFT

/** 그 문서 업무가 요구하는 분량(장). ⚠️ 범위 **양끝을 포함**한다. */
export const targetSlides = (jobId: string): number =>
  roller(`slides:${jobId}`).int(SLIDE_RANGE.min, SLIDE_RANGE.max)

/** 그만큼 만드는 데 더 드는 분. **퀄리티 시간에 더해진다** — 공들이는 정도와 분량은
 *  다른 축이라 곱하지 않는다(곱하면 '간단하게 24장'이 '매우 신경써서 8장'보다 싸다). */
export const slideMins = (count: number): number => Math.max(0, count) * MINS_PER_SLIDE

/** 채운 분량 → 등급 보정. 표가 오름차순이라 "조건을 만족하는 마지막 칸"이 답이다.
 *
 * ⚠️ 목표가 0 이하일 수는 없다(`SLIDE_RANGE.min` ≥ 1) — 그래도 나눗셈 앞에서 막는다. */
export const slideShift = (made: number, target: number): number => {
  if (target <= 0) return 0
  const ratio = made / target
  return SLIDE_FILL.reduce<number>(
    (worst, f) => (ratio >= f.minRatio ? f.shift : worst),
    SLIDE_FILL[0].shift,
  )
}
