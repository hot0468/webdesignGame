import { CLIENTS } from '../data/company'
import { SEARCH_HOME } from '../data/sites'

/** 주소창에 친 글자 → 갈 곳. **브라우저의 라우터다.**
 *
 * ⚠️ 순수 함수다(`src/systems/` 규칙) — React·mutation·Math.random 없음.
 *
 * 갈 곳의 정본은 **데이터에 이미 있는 주소**다: 업체 관리자 주소는 `CLIENTS[].admin`의
 * `주소` 항목이고, 포털은 `SEARCH_HOME.url`이다. ⚠️ 여기에 주소를 다시 적지 마라 —
 * 사내시스템 화면이 보여 주는 주소와 브라우저가 받아 주는 주소가 갈리는 순간
 * "계정을 찾아 브라우저에 친다"는 이 게임의 동선이 끊긴다. */
export type Destination =
  | { kind: 'home' }
  | { kind: 'admin'; clientId: string }
  | { kind: 'unknown' }

/** 비교 전에 벗기는 껍데기: 앞뒤 공백 · `https?://` · `www.` · 끝 슬래시 · 대소문자.
 *  ⚠️ 관대함은 여기까지다. 경로(`/manage`)는 **주소의 일부**라 벗기지 않는다 —
 *     한빛치과 관리자는 도메인이 아니라 경로로 갈린다. */
function normalize(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')
}

/** 업체의 관리자 주소(데이터의 단일 출처). 없으면 undefined. */
export function adminUrl(client: (typeof CLIENTS)[number]): string | undefined {
  return client.admin.find((f) => f.label === '주소')?.value
}

export function resolveUrl(input: string): Destination {
  const url = normalize(input)
  if (!url) return { kind: 'unknown' }

  if (url === normalize(SEARCH_HOME.url)) return { kind: 'home' }

  const hit = CLIENTS.find((c) => {
    const admin = adminUrl(c)
    return admin !== undefined && normalize(admin) === url
  })
  return hit ? { kind: 'admin', clientId: hit.id } : { kind: 'unknown' }
}

/** 아이디·비밀번호가 그 업체의 것과 맞는지. **계정의 정본도 `CLIENTS`다.**
 *
 * ⚠️ 아이디는 대소문자를 봐주고(주소창과 같은 관대함) **비밀번호는 그대로 본다** —
 *    비밀번호를 접어 비교하면 "맞는 값"이 실제보다 늘어나 사내시스템에서 정확히
 *    옮겨 적을 이유가 사라진다. */
export function checkLogin(clientId: string, id: string, pw: string): boolean {
  const client = CLIENTS.find((c) => c.id === clientId)
  if (!client) return false
  const field = (label: string) => client.admin.find((f) => f.label === label)?.value
  return id.trim().toLowerCase() === field('아이디')?.toLowerCase() && pw === field('비밀번호')
}
