import { describe, expect, it } from 'vitest'
import {
  MINS_PER_SLIDE,
  POPUP_SIZES,
  SIZE_MISS_SHIFT,
  SLIDE_RANGE,
  type PopupSize,
} from '../data/spec'
import { popupSize, sizeFits, sizeShift, slideMins, slideShift, targetSlides } from './spec'

const IDS = Array.from({ length: 40 }, (_, i) => `m-job-${i}`)

describe('팝업 규격 — 읽고 맞추는 축', () => {
  it('같은 업무는 늘 같은 규격이다 — 창을 닫았다 열어도 요구가 안 바뀐다', () => {
    for (const id of IDS) expect(popupSize(id)).toEqual(popupSize(id))
  })

  it('업무마다 갈린다 — 하나로 굳으면 의뢰서를 읽을 이유가 없다', () => {
    const seen = new Set(IDS.map((id) => `${popupSize(id).w}x${popupSize(id).h}`))
    expect(seen.size).toBeGreaterThan(1)
  })

  it('후보 목록 안에서만 나온다 — 고를 수 없는 규격을 요구하지 않는다', () => {
    for (const id of IDS) expect(POPUP_SIZES).toContainEqual(popupSize(id))
  })

  // ⚠️ 뒤집기: 넓이만 재면 640×480과 480×640이 같아져 세로형 요구가 뜻을 잃는다.
  it('가로세로가 뒤바뀐 규격은 틀린 것이다', () => {
    // 세로형 요구가 있는 업무를 찾는다(정사각은 뒤집어도 같으므로 증명이 안 된다).
    const id = IDS.find((i) => popupSize(i).w !== popupSize(i).h)!
    const want = popupSize(id)
    expect(sizeFits(id, want)).toBe(true)
    // ⚠️ `as PopupSize` — 목록에 없는 조합을 일부러 넣어 본다(넓이만 재는 구현을 잡는다).
    expect(sizeFits(id, { w: want.h, h: want.w } as unknown as PopupSize)).toBe(false)
  })

  it('맞으면 등급이 안 밀리고 틀리면 밀린다', () => {
    const id = IDS[0]!
    const want = popupSize(id)
    const other = POPUP_SIZES.find((s) => s.w !== want.w || s.h !== want.h)!
    expect(sizeShift(id, want)).toBe(0)
    expect(sizeShift(id, other)).toBe(SIZE_MISS_SHIFT)
    // 벌은 밀리는 쪽이다 — 상으로 뒤집히면 틀리는 것이 이득이 된다.
    expect(SIZE_MISS_SHIFT).toBeLessThan(0)
  })
})

describe('문서 분량 — 시간과 저울질하는 축', () => {
  it('같은 업무는 늘 같은 목표이고 범위 안이다', () => {
    for (const id of IDS) {
      expect(targetSlides(id)).toBe(targetSlides(id))
      expect(targetSlides(id)).toBeGreaterThanOrEqual(SLIDE_RANGE.min)
      expect(targetSlides(id)).toBeLessThanOrEqual(SLIDE_RANGE.max)
    }
  })

  // ⚠️ 이 값이 0이면 늘 목표를 채우는 것이 정답이라 **저울질 자체가 사라진다**.
  it('장수가 시간을 늘린다 — 많이 만들수록 오래 걸린다', () => {
    expect(MINS_PER_SLIDE).toBeGreaterThan(0)
    expect(slideMins(10)).toBe(10 * MINS_PER_SLIDE)
    expect(slideMins(20)).toBeGreaterThan(slideMins(10))
    expect(slideMins(0)).toBe(0)
  })

  it('목표를 채우면 안 밀리고, 모자랄수록 더 밀린다', () => {
    expect(slideShift(20, 20)).toBe(0)
    expect(slideShift(15, 20)).toBeLessThan(0)
    expect(slideShift(4, 20)).toBeLessThan(slideShift(15, 20))
  })

  // ⚠️ 뒤집기: 넘치는 쪽에 상이 있으면 시간이 남는 한 무한히 늘리는 것이 정답이 된다.
  it('넘치게 만들어도 상은 없다', () => {
    expect(slideShift(40, 20)).toBe(0)
    expect(slideShift(20, 20)).toBe(0)
  })

  it('아끼면 빨라지고 등급이 깎인다 — 저울의 양쪽이 실제로 반대다', () => {
    const target = 20
    const few = 10
    expect(slideMins(few)).toBeLessThan(slideMins(target))
    expect(slideShift(few, target)).toBeLessThan(slideShift(target, target))
  })
})
