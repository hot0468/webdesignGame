import { useState } from 'react'
import { AppIcon } from '../icons/AppIcon'
import { FIGMA_ICONS } from '../data/icons'
import { apCost, QUALITY, skillFor } from '../data/game'
import {
  KEYWORDS,
  MEETING_AP,
  MEETING_OCCUPY_WEEKS,
  SITE_KEYWORDS,
  type KeywordId,
} from '../data/keywords'
import { formatDate } from '../systems/calendar'
import { gradeOf } from '../systems/craft'
import { isTurnOf, showsIn } from '../systems/pipeline'
import { isBusy } from '../systems/employee'
import { asStep, useGame } from '../store'
import './figma.css'

/** `피그마` 창. 사이트 업무의 **시안 공정**이 여기서 돌 자리다(그다음이 VS코드 퍼블리싱).
 *
 * 실제 피그마의 **파일 브라우저**와 같은 두 칸(사이드바 · 파일 그리드)이다. 시각 언어는
 * 셸이 아니라 `figma.css`가 진다 — 프로그램 창은 자기 팔레트를 가둔다(`mail.css`와 같은 규칙).
 *
 * ⚠️ 도구 패널·새 파일 버튼·검색창은 그리지 않는다. 눌러도 아무 일 없는 컨트롤은 이
 *    프로젝트가 금지한다(`data/programs.ts` 주석). 사이드바 메뉴도 **버튼이 아니라 표시**다 —
 *    보여 줄 화면이 `초안` 하나뿐이라 다른 줄은 갈 곳이 없다. 화면이 늘면 그때 button이 된다.
 *
 * ⚠️ 시안 제작은 **오른쪽 속성 패널**이 진다(포토샵의 팝업 제작과 같은 자리·같은 규칙).
 *    고른 파일이 그 대상이므로 카드는 누르는 것이고, 고르지 않으면 만들 수 없다 —
 *    "무엇의 시안인지 모르는 시안"이 생기지 않게 한다. */
export function Figma() {
  const jobs = useGame((s) => s.jobs)
  const drafts = useGame((s) => s.drafts)
  const ap = useGame((s) => s.ap)
  // ⚠️ 화면이 적는 값과 스토어가 깎는 값은 **같은 함수**에서 나와야 한다.
  const skill = useGame((s) => s[skillFor('figma')])
  const design = useGame((s) => s.design)
  const meetings = useGame((s) => s.meetings)
  const makeDraft = useGame((s) => s.makeDraft)
  const holdMeeting = useGame((s) => s.holdMeeting)
  // ⚠️ 셀렉터 안에서 filter를 돌리지 마라(새 배열 = 무한 렌더). 목록을 통째로 받아 거른다.
  const employees = useGame((s) => s.employees)
  const orders = useGame((s) => s.orders)
  const trainings = useGame((s) => s.trainings)
  const free = employees.filter((e) => !isBusy(e.id, orders, trainings))
  const [pickedId, setPicked] = useState<string | null>(null)
  // 고른 키워드는 **창을 보는 방식**이라 스토어에 넣지 않는다(세이브에 들어가고 버전이
  // 올라간다 — `shell.md`의 규칙). 굳는 것은 만든 순간 시안 파일에 적히는 쪽이다.
  const [picks, setPicks] = useState<KeywordId[]>([])

  // **시안 차례인 업무만** 선다(`systems/pipeline.ts`). 화면정의서가 아직 안 끝난 사이트
  // 업무나 팝업·PPT 업무는 여기 오지 않는다 — 공정의 줄을 건너뛰지 못하게 하는 자리다.
  const files = jobs.filter((j) => showsIn(asStep(j), 'figma'))
  // 고르지 않았으면 첫 파일이 열려 있다(포토샵의 문서 탭과 같은 규칙 — 빈 패널을 보이지 않는다).
  const picked = files.find((j) => j.id === pickedId) ?? files[0]
  const mine = picked ? drafts.filter((d) => d.jobId === picked.id) : []
  // 미팅에서 알아낸 키워드. **키가 있으면 미팅을 한 것이다**(관계는 한 방향).
  const known = picked ? meetings[picked.id] : undefined
  const full = picks.length === SITE_KEYWORDS

  // 파일을 바꾸면 고르던 키워드는 버린다 — 남의 업무에 이 업무의 선택이 따라가면
  // 무엇을 골랐는지 모르는 채로 시안이 나간다.
  const pickFile = (id: string) => {
    setPicked(id)
    setPicks([])
  }

  // 켜고 끄기. ⚠️ `SITE_KEYWORDS`개를 넘겨 고를 수 없다(넘치면 이 업무에 몇 개가 걸려
  //    있는지가 화면마다 달라진다). 이미 고른 것을 다시 누르면 꺼진다.
  const toggle = (id: KeywordId) =>
    setPicks((p) => (p.includes(id) ? p.filter((k) => k !== id) : full ? p : [...p, id]))

  return (
    <div className="fig">
      <nav className="fig__side" aria-label="파일 위치">
        <p className="fig__nav">
          <AppIcon name={FIGMA_ICONS.recent} />
          최근 항목
        </p>
        <p className="fig__nav">
          <AppIcon name={FIGMA_ICONS.community} />
          커뮤니티
        </p>

        <p className="fig__group">내 팀</p>
        {/* 지금 보고 있는 곳. ⚠️ 색이 아니라 면과 굵기가 함께 말한다(색만으로 말하지 않기). */}
        <p className="fig__nav fig__nav--on" aria-current="page">
          <AppIcon name={FIGMA_ICONS.drafts} />
          초안
        </p>
        <p className="fig__nav">
          <AppIcon name={FIGMA_ICONS.projects} />
          모든 프로젝트
        </p>
        <p className="fig__nav">
          <AppIcon name={FIGMA_ICONS.resources} />
          리소스
        </p>
        <p className="fig__nav">
          <AppIcon name={FIGMA_ICONS.trash} />
          휴지통
        </p>
      </nav>

      <div className="fig__main">
        <header className="fig__head">
          <h3 className="fig__crumb">초안</h3>
          <span className="fig__count">파일 {files.length}개</span>
        </header>

        {files.length === 0 ? (
          <p className="fig__blank">
            지금 시안을 그릴 업무가 없다. 사이트 업무의 화면정의서를 회신하면 여기 파일로 선다.
          </p>
        ) : (
          <ul className="fig__grid">
            {files.map((j) => (
              <li key={j.id}>
                <button
                  type="button"
                  className={`fig__file${j.id === picked?.id ? ' fig__file--on' : ''}`}
                  aria-pressed={j.id === picked?.id}
                  onClick={() => pickFile(j.id)}
                >
                  {/* 썸네일 안의 줄은 시안의 뼈대다. 장식이 아니므로 읽는 이름은 주지 않는다. */}
                  <span className="fig__thumb" aria-hidden="true">
                    <span className="fig__bar" />
                    <span className="fig__bar" />
                    <span className="fig__bar" />
                  </span>
                  <span className="fig__name" title={`${j.from} · ${j.title}`}>
                    <AppIcon name="devicon:figma" />
                    <span className="fig__label">{j.title}</span>
                  </span>
                  {/* 실제 피그마의 "N일 전 편집됨" 자리다. 이 게임에서 파일에 붙는 시간은
                      편집 이력이 아니라 **마감**이고, 표기는 업무목록과 같은 함수를 쓴다. */}
                  <span className="fig__meta">
                    {j.from} · {j.done ? '납품 완료' : `마감 ${formatDate(j.due)}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="fig__right" aria-label="속성">
        {!picked ? (
          <p className="fig__short">고른 파일이 없다.</p>
        ) : (
          <>
            <p className="fig__prop">{picked.title}</p>
            {mine.length === 0 ? (
              <p className="fig__short">아직 만든 시안이 없다.</p>
            ) : (
              <ul className="fig__drafts">
                {mine.map((d) => (
                  <li key={d.id} className="fig__draft" title={d.name}>
                    <AppIcon name={FIGMA_ICONS.drafts} size={14} />
                    <span className="fig__label">{d.name}</span>
                    <span className="fig__grade">{d.grade}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* 만들고 나면 **회신하기 전까지는 다시 만들 수 없다** — 그래서 버튼 대신
                다음에 할 일을 적는다(공정 하나에 한 번, `systems/pipeline.ts`). */}
            {!isTurnOf(asStep(picked), 'figma') ? (
              <p className="fig__short">
                시안을 보냈다. {picked.channel === 'board' ? '고객게시판' : '메일'}의 그 글에서
                회신해야 다음으로 넘어간다.
              </p>
            ) : (
              <>
                {/* ── 클라이언트 미팅 ─────────────────────────────────
                    ⚠️ 미팅 전에는 **무엇을 원하는지 모른다고 말한다.** 5개를 흐리게라도
                       보여 주면 미팅이 값을 잃는다 — 여기 없는 것이 곧 이 기능이다. */}
                <p className="fig__prop">클라이언트가 원하는 분위기</p>
                {!known ? (
                  <>
                    <p className="fig__short">
                      아직 무엇을 원하는지 모른다. 미팅에서 몇 가지를 알아낼 수 있다.
                    </p>
                    <button
                      type="button"
                      className="fig__make"
                      disabled={ap < MEETING_AP}
                      onClick={() => holdMeeting(picked.id)}
                    >
                      미팅 참석
                      <span className="fig__cost">행동력 {MEETING_AP}</span>
                    </button>
                    {/* ── 직원 파견 ───────────────────────────────────
                        내 행동력 대신 **그 직원의 한 주**를 낸다. 알아내는 개수는
                        ⚠️ **가는 사람의 기획력**이 정하므로, 누구를 보내느냐가 곧
                        몇 개를 알아내느냐다(그래서 기획 스탯을 버튼에 적는다). */}
                    {free.length > 0 && (
                      <>
                        <p className="fig__short">직원을 대신 보낼 수도 있다.</p>
                        <ul className="fig__send">
                          {free.map((e) => (
                            <li key={e.id}>
                              <button
                                type="button"
                                className="fig__delegate"
                                onClick={() => holdMeeting(picked.id, e.id)}
                              >
                                <span>{e.name} 보내기</span>
                                <span className="fig__cost">
                                  기획 {e.stats.planning} · {MEETING_OCCUPY_WEEKS}주 점유
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                ) : (
                  <p className="fig__short">
                    {SITE_KEYWORDS}개 중 {known.length}개를 알아냈다. 나머지는 감으로 골라야 한다.
                  </p>
                )}

                {/* ── 키워드 고르기 ───────────────────────────────────
                    ⚠️ 미팅과 무관하게 **늘 고를 수 있다** — 모르는 채로 찍는 것도 선택이고,
                       미팅은 그 확률을 올려 줄 뿐이다. */}
                <p className="fig__prop">
                  분위기 키워드 {picks.length}/{SITE_KEYWORDS}
                </p>
                <ul className="fig__keys">
                  {KEYWORDS.map((k) => {
                    const on = picks.includes(k.id)
                    return (
                      <li key={k.id}>
                        <button
                          type="button"
                          className={`fig__key${on ? ' fig__key--on' : ''}`}
                          aria-pressed={on}
                          // 다 골랐으면 켜진 것만 누를 수 있다(끄기는 늘 열려 있다).
                          disabled={!on && full}
                          onClick={() => toggle(k.id)}
                        >
                          {/* 미팅에서 알아낸 키워드에는 표식이 선다. ⚠️ 색이 아니라
                              글자가 말한다 — 이 창에는 액센트 색이 없다(figma.css). */}
                          {k.label}
                          {known?.includes(k.id) && <span className="fig__got">확인됨</span>}
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <div className="fig__makes">
                  {/* ⚠️ 얼마나 공들일지를 **누르기 전에** 알 수 있어야 고를 수 있다 —
                      버튼마다 무는 행동력과 지금 스탯이면 나올 등급을 함께 적는다.
                      ⚠️ 여기 적는 등급은 **키워드 보정 전**이다 — 맞췄는지는 만들기 전에
                         알 수 없고, 알 수 있으면 미팅이 뜻을 잃는다. */}
                  <p className="fig__prop">시안 만들기</p>
                  {QUALITY.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      className="fig__make"
                      disabled={ap < apCost(q.ap, skill) || !full}
                      onClick={() => makeDraft(picked.id, q.id, picks)}
                    >
                      {q.label}
                      <span className="fig__cost">
                        행동력 {apCost(q.ap, skill)} · {gradeOf(q.id, design)}
                      </span>
                    </button>
                  ))}
                  {!full && (
                    <p className="fig__short">키워드 {SITE_KEYWORDS}개를 골라야 만들 수 있다.</p>
                  )}
                  {ap < QUALITY[0].ap && <p className="fig__short">행동력이 모자란다.</p>}
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </div>
  )
}
