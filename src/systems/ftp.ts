import { CLIENTS } from '../data/company'
import { normalizeUrl } from './url'

/** FTP 접속 정보 대조. **에디터가 업체 폴더를 여는 유일한 관문이다.**
 *
 * ⚠️ 순수 함수다(`src/systems/` 규칙) — React·mutation·Math.random 없음.
 *
 * 접속 정보의 정본은 `CLIENTS[].ftp`다(사내시스템 > 업체정보가 보여 주는 그 값). 여기에
 * 값을 다시 적지 마라 — 사내시스템이 보여 주는 것과 에디터가 받아 주는 것이 갈리는 순간
 * "정보를 찾아 옮겨 적는다"는 이 게임의 동선이 끊긴다(`url.ts`의 `checkLogin`과 같은 이유).
 *
 * ⚠️ **기본 경로는 대조하지 않는다.** 호스트·포트·계정·비밀번호 넷이면 그 업체가 하나로
 *    정해지고, 다섯째 칸까지 요구하면 오타 한 번에 다시 처음부터 옮겨 적게 된다. */
export type FtpInput = {
  host: string
  port: string
  user: string
  pw: string
}

/** 이 정보로 열리는 업체의 id. 하나도 맞지 않으면 undefined.
 *
 * 관대함의 기준은 `url.ts`와 같다: **주소·계정은 접어서 보고 비밀번호는 그대로 본다** —
 * 비밀번호까지 접으면 "맞는 값"이 실제보다 늘어나 옮겨 적을 이유가 사라진다. */
export function checkFtp(input: FtpInput): string | undefined {
  // ⚠️ `ftp://`는 여기서 벗긴다 — `normalizeUrl`(브라우저의 주소 규칙)은 http(s)만 안다.
  //    FTP 호스트를 스킴째 적는 것은 흔한 표기라 이것까지 틀렸다고 하면 함정이 된다.
  const host = normalizeUrl(input.host.trim().replace(/^ftp:\/\//i, ''))
  const port = input.port.trim()
  const user = input.user.trim().toLowerCase()

  return CLIENTS.find((c) => {
    const field = (label: string) => c.ftp.find((f) => f.label === label)?.value
    return (
      normalizeUrl(field('호스트') ?? '') === host &&
      field('포트') === port &&
      field('계정')?.toLowerCase() === user &&
      field('비밀번호') === input.pw
    )
  })?.id
}
