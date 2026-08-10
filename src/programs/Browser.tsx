import { AppIcon } from '../icons/AppIcon'
import { PROGRAM_ICONS } from '../data/icons'

/** `브라우저` 창. 아직 사이트가 하나도 없으므로 **빈 상태만** 진다.
 *
 * ⚠️ 주소창도 즐겨찾기 버튼도 그리지 않는다 — 갈 데가 없는 입력과 링크는 동작하지 않는
 *    컨트롤이다. 사이트(업무 수주·채용·쇼핑)가 생기는 커밋에서 즐겨찾기와 함께 붙인다. */
export function Browser() {
  return (
    <div className="empty">
      <AppIcon name={PROGRAM_ICONS.noSite} size={32} />
      <p className="empty__title">아직 열 수 있는 사이트가 없다</p>
      <p className="empty__note">업무 수주 사이트와 채용 사이트가 생기면 여기에 뜬다.</p>
    </div>
  )
}
