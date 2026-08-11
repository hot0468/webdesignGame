/** `피그마` 창. 사이트 업무의 **시안 공정**이 여기서 돌아간다(그다음이 VS코드 퍼블리싱).
 *
 * ⚠️ 아직 공정 시스템이 없어 실행할 것이 없다 — 빈 상태로 무엇이 여기 뜰지만 적는다.
 *    누르면 아무 일도 안 하는 버튼·도구 패널을 그리지 않는다(그때 이 창은 자기 팔레트를
 *    가진 화면이 된다 — `mail.css`가 예시다). */
export function Figma() {
  return (
    <div className="empty">
      <p className="empty__title">열어 둔 시안이 없다</p>
      <p className="empty__note">
        사이트 업무를 수주하면 시안 공정을 여기서 돌린다. 퀄리티를 고르면 행동력을 쓴다.
      </p>
    </div>
  )
}
