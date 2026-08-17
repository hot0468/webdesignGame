import { AppIcon } from '../icons/AppIcon'
import { BROWSER_ICONS } from '../data/icons'
import {
  APPLICANTS_PER_POST,
  EMPLOYEE_LEVEL,
  findRole,
  POST_MINS,
  salaryOf,
} from '../data/employees'
import { companyGrade } from '../data/game'
import { formatSpan, formatWeek } from '../systems/calendar'
import { applicants } from '../systems/hire'
import { useClock, useGame } from '../store'

/** 채용사이트(`인간인`). 브라우저 첫화면의 바로가기로 들어온다.
 *
 * 고리는 이렇다: **공고 업로드(행동력 `POST_MINS`) → 지원자 발생 → 고용**.
 *
 * ⚠️ 지원자는 **저장되지 않는다** — 공고를 올린 주차 하나에서 파생한다
 *    (`systems/hire.ts`의 `applicants`, 시드를 받는 순수 함수). 그래서 창을 닫았다 열어도
 *    같은 사람들이 서 있고, 마음에 드는 사람이 나올 때까지 굴릴 수 없다.
 *
 * ⚠️ 시각 언어는 브라우저 창의 `--nv-*` 안에서 끝낸다(`browser.css`) — 관리자 페이지와
 *    같은 규칙이다. 이 팔레트에는 **빨강이 없으므로** 정원 초과·지시 불가는
 *    색이 아니라 **아이콘 + 글자**가 말한다. */
export function HireSite() {
  const week = useGame((s) => s.week)
  const clock = useClock()
  const reputation = useGame((s) => s.reputation)
  const employees = useGame((s) => s.employees)
  const postWeek = useGame((s) => s.hirePostWeek)
  const hiredIds = useGame((s) => s.hiredApplicantIds)
  const postHiring = useGame((s) => s.postHiring)
  const hire = useGame((s) => s.hire)

  const grade = companyGrade(reputation)
  const full = employees.length >= grade.hireMax
  // 지원자는 **올린 주차에서 그때그때 파생한다** — 셀렉터 안에서 만들면 렌더마다
  // 새 배열이 나와 zustand가 무한 렌더를 돈다(`AdminSite`가 겪은 것과 같은 함정).
  const list = postWeek === undefined ? [] : applicants(postWeek)

  return (
    <div className="nv-site">
      <header className="nv-site__bar">
        <h3 className="nv-site__brand">인간인</h3>
        {/* 구인 포털의 메뉴 줄. ⚠️ button이 아니라 **표시다**(피그마 사이드바와 같은 규칙) —
            갈 화면이 하나뿐이라 누르게 그리면 죽은 컨트롤이 된다. */}
        <nav className="nv-hire__menu">
          <span data-on>인재정보</span>
          <span>채용정보</span>
          <span>기업·연봉</span>
          <span>커뮤니티</span>
        </nav>
      </header>

      <div className="nv-site__body">
        <div className="nv-hire">
          <section className="nv-hire__post">
            <div className="nv-hire__post-main">
              <h4 className="nv-site__title">
                <AppIcon name={BROWSER_ICONS.post} size={18} />
                채용 공고
              </h4>
              <p className="nv-site__desc">
                공고를 올리면 다음 지원자들이 이력서를 보냅니다. 우리 회사는{' '}
                <b>{grade.label}</b>이라 <b>{grade.hireMax}명</b>까지 채용할 수 있습니다. (현재{' '}
                {employees.length}명)
              </p>
              <p className="nv-site__count">
                {postWeek === undefined ? (
                  <>아직 올린 공고가 없습니다.</>
                ) : (
                  <>
                    <strong>{formatWeek(postWeek)}</strong>에 올린 공고 · 지원자{' '}
                    <strong>{APPLICANTS_PER_POST}명</strong>
                  </>
                )}
              </p>
              {!clock.can(POST_MINS) && (
                <p className="nv-site__fail">
                  <AppIcon name={BROWSER_ICONS.warn} size={16} />
                  이번 주에 남은 시간으로는 올릴 수 없습니다.
                </p>
              )}
            </div>

            {/* ⚠️ 정원이 0일 때도 공고는 올릴 수 있다 — 고용만 막힌다. 지원자를 보고
                "평판을 올려야 뽑을 수 있구나"를 알게 되는 것이 이 화면의 몫이다. */}
            <button
              type="button"
              className="nv-site__go"
              disabled={!clock.can(POST_MINS)}
              onClick={postHiring}
            >
              공고 올리기 ({formatSpan(POST_MINS, clock.dayMins)})
            </button>
          </section>

          {list.length > 0 && (
            <section className="nv-hire__found">
              <h4 className="nv-hire__heading">이 인재, 놓치지 마세요!</h4>

              {full && (
                <p className="nv-site__fail">
                  <AppIcon name={BROWSER_ICONS.warn} size={16} />
                  {grade.hireMax === 0
                    ? `${grade.label}은 직원을 둘 수 없습니다. 평판을 올려 회사등급을 높이세요.`
                    : `정원이 찼습니다(${employees.length}/${grade.hireMax}). 평판을 올려 회사등급을 높이면 더 뽑을 수 있습니다.`}
                </p>
              )}

              <ul className="nv-hire__list">
                {list.map((a) => {
                  const taken = hiredIds.includes(a.id)
                  const role = findRole(a.role)
                  return (
                    <li key={a.id} className="nv-hire__row">
                      <span className="nv-hire__role">{role.label}</span>
                      <p className="nv-hire__name">{a.name}</p>
                      {/* 레벨은 **걸리는 주차와 월급을 함께 정한다** — 둘을 나란히 적어야
                          "싸고 느린 사람 vs 비싸고 빠른 사람"이 눈에 보이는 선택이 된다.
                          그래서 카드에서 큰 값은 월급 하나다(수주센터의 단가와 같은 자리). */}
                      <p className="nv-hire__pay">
                        <span className="nv-bid__label">
                          월급 · 레벨 {a.level}/{EMPLOYEE_LEVEL.max}
                        </span>
                        {salaryOf(a.level).toLocaleString('ko-KR')}원
                      </p>
                      <p className="nv-hire__meta">
                        디자인 {a.stats.design} · 퍼블리싱 {a.stats.publishing} · 기획{' '}
                        {a.stats.planning} · CS {a.stats.cs}
                      </p>
                      <p className="nv-hire__meta">
                        맡을 수 있는 일: {role.programs.map((p) => PROGRAM_WORK[p]).join(' · ')}
                      </p>

                      {taken ? (
                        <p className="nv-site__count">
                          <strong>{week}주차 현재 채용됨</strong>
                        </p>
                      ) : (
                        // ⚠️ 정원이 찼으면 **못 누른다.** 왜 못 누르는지는 위의 글자가 말한다
                        //    (흐린 색만으로 말하지 않는 것이 이 리포의 규칙이다).
                        <button
                          type="button"
                          className="nv-site__go"
                          disabled={full}
                          onClick={() => hire(a)}
                        >
                          채용하기
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

/** 프로그램 → 사람이 읽는 일 이름. ⚠️ 공정 제한의 정본은 `EMPLOYEE_ROLES[].programs`다 —
 *  여기 있는 것은 그 id를 한국어로 읽어 주는 표뿐이다(제한을 여기서 정하지 말 것). */
const PROGRAM_WORK: Partial<Record<string, string>> = {
  figma: '시안',
  photoshop: '팝업 이미지',
  ppt: '화면정의서·발표자료',
  editor: '퍼블리싱',
}
