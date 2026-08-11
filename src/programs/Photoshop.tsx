/** `포토샵` 창. 팝업·PPT 업무의 **제작 공정**이 여기서 돌아간다(팝업은 그다음이 업로드).
 *
 * ⚠️ 아직 공정 시스템이 없어 실행할 것이 없다 — 빈 상태로 무엇이 여기 뜰지만 적는다.
 *    (`Figma.tsx`와 같은 이유다. 도구 패널을 미리 그리지 않는다.) */
export function Photoshop() {
  return (
    <div className="empty">
      <p className="empty__title">작업 중인 파일이 없다</p>
      <p className="empty__note">
        팝업·PPT 업무를 수주하면 제작 공정을 여기서 돌린다. 퀄리티를 고르면 행동력을 쓴다.
      </p>
    </div>
  )
}
