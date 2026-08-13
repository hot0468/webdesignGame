import { CLIENTS } from '../data/company'
import { SEARCH_HOME, SHORTCUTS, type ShortcutId } from '../data/sites'

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
  /** 첫화면 바로가기가 가리키는 사이트(지금은 채용사이트 하나). 주소의 정본은 `SHORTCUTS`다. */
  | { kind: 'site'; siteId: ShortcutId }
  | { kind: 'unknown' }

/** 비교 전에 벗기는 껍데기: 앞뒤 공백 · `https?://` · `www.` · 끝 슬래시 · 대소문자.
 *  ⚠️ 관대함은 여기까지다. 경로(`/manage`)는 **주소의 일부**라 벗기지 않는다 —
 *     한빛치과 관리자는 도메인이 아니라 경로로 갈린다. */
export function normalizeUrl(raw: string): string {
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
  const url = normalizeUrl(input)
  if (!url) return { kind: 'unknown' }

  if (url === normalizeUrl(SEARCH_HOME.url)) return { kind: 'home' }

  // 바로가기 사이트. ⚠️ 주소는 `SHORTCUTS`가 정본이다 — 여기 다시 적지 않는다.
  const site = SHORTCUTS.find((s) => 'url' in s && normalizeUrl(s.url) === url)
  if (site) return { kind: 'site', siteId: site.id }

  const hit = CLIENTS.find((c) => {
    const admin = adminUrl(c)
    return admin !== undefined && normalizeUrl(admin) === url
  })
  return hit ? { kind: 'admin', clientId: hit.id } : { kind: 'unknown' }
}

/** 즐겨찾기 줄에 적을 이름. **주소에서 뽑는다** — 즐겨찾기가 이름을 따로 지고 있으면
 *  업체 이름을 고쳤을 때 옛 이름이 브라우저에 남는다(관계는 한 방향으로만 적는다).
 *  갈 곳이 없는 주소는 즐겨찾기가 되지 않으므로 그 경우는 주소를 그대로 돌려준다. */
export function siteTitle(input: string): string {
  const dest = resolveUrl(input)
  if (dest.kind === 'home') return SEARCH_HOME.name
  if (dest.kind === 'site') {
    const site = SHORTCUTS.find((s) => s.id === dest.siteId)
    if (site) return site.name
  }
  if (dest.kind === 'admin') {
    const client = CLIENTS.find((c) => c.id === dest.clientId)
    if (client) return `${client.name} 관리자`
  }
  return normalizeUrl(input)
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
