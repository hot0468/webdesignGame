import { AppIcon } from '../icons/AppIcon'
import { PROGRAM_ICONS } from '../data/icons'
import { POPUP_MAKE_AP } from '../data/game'
import { formatWeek } from '../systems/calendar'
import { useGame } from '../store'

/** `포토샵` 창. 팝업 업무의 **제작 공정**이 여기서 돈다(그다음이 브라우저에서의 등록).
 *
 * ⚠️ **비용을 지는 쪽은 여기다**(`POPUP_MAKE_AP`). 등록(관리자 페이지)은 값을 물리지
 *    않는다 — 한 팝업에 두 번 값을 물리지 않으려는 구분이라 되돌리지 말 것.
 *
 * ⚠️ 만든 파일은 **어느 업무 것이든 전부 등록 화면에 뜬다**. 여기서 업체별로 갈라
 *    "맞는 것만" 보이게 하면 이 고리의 실수(틀린 파일)가 성립하지 않는다.
 *
 * ⚠️ 셸 언어로 산다(`.empty`·`.job*` 등). 자기 팔레트를 가지는 것은 메일·브라우저처럼
 *    **화면 전체가 다른 프로그램인** 창의 예외이고, 여기는 아직 목록 하나뿐이다. */
export function Photoshop() {
  const jobs = useGame((s) => s.jobs)
  const files = useGame((s) => s.files)
  const ap = useGame((s) => s.ap)
  const makePopup = useGame((s) => s.makePopup)

  // 완료된 업무는 만들 것이 없다 — 끝난 일의 버튼을 살려 두면 행동력만 새어 나간다.
  const popupJobs = jobs.filter((j) => j.popup && !j.done)

  if (popupJobs.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">작업 중인 파일이 없다</p>
        <p className="empty__note">
          팝업 업무를 수주하면 여기서 이미지를 만든다. 만든 파일은 업체 관리자 페이지에서
          등록한다.
        </p>
      </div>
    )
  }

  return (
    <div className="ps">
      <p className="ps__note">
        만든 파일은 업체 관리자 페이지의 팝업 등록에서 고른다. 제작에 행동력 {POPUP_MAKE_AP}
        을 쓴다.
      </p>

      <ul className="ps__jobs">
        {popupJobs.map((j) => {
          const mine = files.filter((f) => f.jobId === j.id)
          return (
            <li key={j.id} className="ps__job">
              <p className="ps__from">{j.from}</p>
              <p className="ps__title">{j.title}</p>
              {/* 요청 기간은 마감과 **같은 표기**다 — 두 날짜를 나란히 비교할 수 있어야 한다. */}
              <p className="ps__period">
                게시 {formatWeek(j.popup!.from)} ~ {formatWeek(j.popup!.to)}
              </p>

              {mine.length > 0 && (
                <ul className="ps__files">
                  {mine.map((f) => (
                    <li key={f.id} className="ps__file">
                      <AppIcon name={PROGRAM_ICONS.file} />
                      {f.name}
                    </li>
                  ))}
                </ul>
              )}

              {/* ⚠️ 못 누르는 이유를 **글자로** 말한다 — 흐린 버튼만 두면 왜 안 되는지 모른다. */}
              <button
                type="button"
                className="ps__make"
                disabled={ap < POPUP_MAKE_AP}
                onClick={() => makePopup(j.id)}
              >
                팝업 이미지 만들기
              </button>
              {ap < POPUP_MAKE_AP && <p className="ps__short">행동력이 모자란다.</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
