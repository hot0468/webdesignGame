/** `메신저` 창. 클라이언트 응대(CS)가 여기서 일어난다 — CS 스탯이 오르는 자리다.
 *
 * ⚠️ 아직 대화 시스템이 없어 주고받을 것이 없다 — 빈 상태로 무엇이 여기 뜰지만 적는다.
 *    (`Figma.tsx`와 같은 이유다. 가짜 대화창을 미리 그리지 않는다.) */
export function Messenger() {
  return (
    <div className="empty">
      <p className="empty__title">온 대화가 없다</p>
      <p className="empty__note">
        업체 응대가 여기로 온다. CS 스탯이 수주 단가와 평판 회복을 정한다.
      </p>
    </div>
  )
}
