/** 아이콘 렌더의 유일한 창구.
 *
 * ⚠️ 다른 컴포넌트는 `@iconify/react`를 직접 import하지 않는다. offline 엔트리 + 여기서
 *    한 번만 addCollection 하는 구조라서, 등록되지 않은 이름을 써도 네트워크로 나가지
 *    않고 그냥 비어 보인다(= CDN 의존이 생기지 않는다). 대신 `npm run icons`가
 *    존재하지 않는 이름에서 빌드를 실패시켜 오타를 잡는다. */
import { Icon, addCollection } from '@iconify/react/offline'
import { ICON_COLLECTIONS } from './generated'

for (const c of ICON_COLLECTIONS) addCollection(c)

type Props = {
  /** "세트:이름" 형식. 이름의 출처는 src/data/*.ts. */
  name: string
  /** px. 기본은 본문 글자 크기에 맞춘 1em. */
  size?: number | string
  className?: string
}

export function AppIcon({ name, size = '1em', className }: Props) {
  return <Icon icon={name} width={size} height={size} className={className} aria-hidden />
}
