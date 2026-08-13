/** 이 게임의 **무작위 하나뿐인 출처**. `src/systems/`는 순수 함수라 `Math.random`을
 *  쓰지 않는다 — 흔들려야 하는 것은 전부 **씨앗 문자열**을 받아 여기서 굴린다.
 *
 * ⚠️ 씨앗은 **이미 있는 값에서 파생한다**(주차·업무 id·직원 id 등). 새 상태 축으로
 *    난수 상태를 저장하지 마라 — 저장하면 세이브가 불어나고, 같은 판을 불러왔을 때
 *    다른 답이 나오는 길이 생긴다.
 * ⚠️ 암호용이 아니다. 필요한 것은 "씨앗이 다르면 답도 다르다"와 "같으면 늘 같다"뿐이다.
 *
 * 원래 `systems/hire.ts` 안에 있던 것을 꺼냈다 — 두 곳이 각자 난수를 들고 있으면
 * "시드를 받는 순수 함수"라는 규칙이 두 벌이 되고, 한쪽만 고쳐지는 사고가 난다. */

/** 문자열 → 32비트 씨앗(FNV-1a). */
function seedOf(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** 씨앗을 한 걸음 굴린다(mulberry32). 0~1 미만을 낸다. */
function next(seed: number): [number, number] {
  const t = (seed + 0x6d2b79f5) >>> 0
  let x = Math.imul(t ^ (t >>> 15), 1 | t)
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
  return [((x ^ (x >>> 14)) >>> 0) / 4294967296, t]
}

/** 굴릴 때마다 씨앗을 들고 다니는 작은 롤러. **순수 함수 안에서만 산다** —
 *  모듈 바깥에 롤러를 하나 만들어 돌려 쓰면 부르는 순서가 답을 바꾼다(전역 상태). */
export function roller(seedText: string) {
  let seed = seedOf(seedText)
  const self = {
    /** 0 이상 1 미만 하나. */
    unit(): number {
      const [r, s] = next(seed)
      seed = s
      return r
    },
    /** `min`~`max`(양끝 포함) 정수 하나. */
    int(min: number, max: number): number {
      return min + Math.floor(self.unit() * (max - min + 1))
    },
    pick<T>(list: readonly T[]): T {
      return list[self.int(0, list.length - 1)]!
    },
    /** 확률 `p`(0~1)로 참. `p <= 0`이면 늘 거짓, `p >= 1`이면 늘 참이다. */
    chance(p: number): boolean {
      return self.unit() < p
    },
  }
  return self
}
