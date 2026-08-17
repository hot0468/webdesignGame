import { AppIcon } from '../icons/AppIcon'
import { BROWSER_ICONS } from '../data/icons'
import { BID_AP, BID_OPEN_WEEKS, findTier } from '../data/bidding'
import { BASE_FEE, companyGrade, REPUTATION_CRISIS } from '../data/game'
import { formatDate, formatWeek } from '../systems/calendar'
import {
  bidDeadline,
  bidMinGrade,
  canBid,
  eligibility,
  isOpen,
  openListings,
  resultWeek,
  winChance,
} from '../systems/bidding'
import { stepsOf } from '../systems/pipeline'
import { bidStats, useGame } from '../store'

/** 수주센터. 브라우저 첫화면의 바로가기로 들어온다.
 *
 * 고리는 이렇다: **참가 조건 확인 → 기한 안에 입찰(행동력 `BID_AP`) → 익주에 결과 메일
 * → 낙찰 메일의 `사업 시작`을 누르면 평소 업무**.
 *
 * ⚠️ **메일 의뢰와 다른 고리다.** 메일은 오면 무조건 받을 수 있지만 공고는 조건을 맞춰야
 *    입찰할 수 있고, 기한이 있고, 입찰해도 확정이 아니라 추첨이다. 그래서 이 화면이 지는
 *    일은 셋이다: **무엇이 모자란지 말하는 것** · **입찰 전에 낙찰 확률을 적는 것** ·
 *    **언제까지 걸 수 있는지 적는 것**. 확률을 감추면 이 화면은 판단이 아니라 도박이 된다.
 *
 * ⚠️ **결과는 여기서 나오지 않는다** — 익주 주차 넘김에서 메일로 온다(`advanceWeek`).
 *    그래서 입찰한 공고에는 "결과를 기다리는 중"이라고 적고 언제 오는지까지 말한다.
 *
 * ⚠️ 공고는 **저장되지 않는다** — 주차 하나에서 파생한다(`systems/bidding.ts`의
 *    `openListings`, 시드를 받는 순수 함수). 창을 닫았다 열어도 같은 목록이 서고, 마음에
 *    드는 공고가 나올 때까지 굴릴 수 없다. 기한이 지난 공고는 그 자리에서 마감됐다고
 *    말하되 **목록에서 지우지 않는다** — 말없이 사라지면 놓친 것인지 고장인지 알 수 없다.
 *
 * ⚠️ 시각 언어는 브라우저 창의 `--nv-*` 안에서 끝낸다(`browser.css`) — 채용사이트·관리자
 *    페이지와 같은 규칙이다. 이 팔레트에는 **빨강이 없으므로** 조건 미달은 색이 아니라
 *    **아이콘 + 글자**가 말한다. */
export function WorkSite() {
  const week = useGame((s) => s.week)
  const ap = useGame((s) => s.ap)
  const reputation = useGame((s) => s.reputation)
  const design = useGame((s) => s.design)
  const planning = useGame((s) => s.planning)
  const employees = useGame((s) => s.employees)
  const drafts = useGame((s) => s.drafts)
  const slides = useGame((s) => s.slides)
  // 포트폴리오 보정에만 쓴다(참가 조건은 시안·기획안만 본다 — 문턱과 점수는 다른 축이다).
  const files = useGame((s) => s.files)
  const publishes = useGame((s) => s.publishes)
  const bids = useGame((s) => s.bids)
  const bidListing = useGame((s) => s.bidListing)

  // ⚠️ 셀렉터 안에서 만들지 않는다 — 렌더마다 새 배열이 나와 zustand가 무한 렌더를
  //    돈다(`AdminSite`·`HireSite`가 겪은 것과 같은 함정).
  // ⚠️ 이번 주 것만이 아니다 — **기한이 살아 있는 지난 주 공고까지** 함께 선다
  //    (그렇지 않으면 `BID_OPEN_WEEKS`가 뜻을 잃는다).
  const list = openListings(week, reputation)
  // 자격 판정의 재료. **이미 있는 것에서 읽는다** — 새 개념을 만들지 않는다.
  const have = {
    employees: employees.length,
    drafts: drafts.length,
    slideGrades: slides.map((d) => d.grade),
  }
  // ⚠️ 스토어가 굴릴 때와 **같은 함수·같은 인자**여야 한다 — 쌓인 작업물이 확률에
  //    얹히므로(`portfolioBonus`) 만든 목록을 다 넘긴다.
  const stats = bidStats({ design, planning, files, drafts, slides, publishes })
  // 회사등급 문. ⚠️ 공고별 조건과 달리 **회사 하나에 한 번** 걸린다(`systems/bidding.ts`).
  const grade = companyGrade(reputation)
  const allowed = canBid(reputation)

  return (
    <div className="nv-site">
      <header className="nv-site__bar">
        <h3 className="nv-site__brand">수주센터 — 웹 제작 공고</h3>
      </header>

      <div className="nv-site__body nv-bid">
        {/* ⚠️ 안내를 **문단으로 쌓지 않는다** — 규칙(마감·조건·비용·결과 시점)은 매번 읽는
            글이 아니라 늘 그 자리에 있는 값이다. 칩 한 줄로 세우고 문장은 한 줄만 남긴다. */}
        <header className="nv-bid__head">
          <div className="nv-bid__facts">
            <span className="nv-bid__chip">{formatWeek(week)}</span>
            <span className="nv-bid__chip">
              {grade.label} · 평판 {reputation}
            </span>
            <span className="nv-bid__chip">입찰 행동력 {BID_AP}</span>
            <span className="nv-bid__chip">게시 후 {BID_OPEN_WEEKS}주간 접수</span>
          </div>
          <p className="nv-hire__meta">
            참가 조건을 모두 갖춘 업체만 추첨에 들어가고, <b>결과는 익주에 메일로</b> 옵니다.
          </p>

          {/* ⚠️ 등급 문은 공고마다 붙는 참가 조건과 **다른 축이다** — 그래서 목록 위에
              한 번만 서고, 무엇이 되어야 열리는지(평판 몇)까지 적는다. */}
          {!allowed && (
            <p className="nv-site__fail">
              <AppIcon name={BROWSER_ICONS.warn} size={16} />
              {bidMinGrade().label} 이상만 입찰할 수 있습니다 — 평판 {bidMinGrade().minReputation}{' '}
              이상이 되면 열립니다. 지금은 메일·고객게시판 의뢰로 평판을 올려야 합니다.
            </p>
          )}
        </header>

        {/* ⚠️ 위기선 아래면 목록이 빈다(설계 결정표) — 빈 자리에 **이유를 적는다**.
            아무 말 없이 비어 있으면 고장으로 보인다. */}
        {list.length === 0 && (
          <section className="nv-bid__card">
            <p className="nv-site__fail">
              <AppIcon name={BROWSER_ICONS.warn} size={16} />
              회사평판이 {REPUTATION_CRISIS} 미만이라 참가할 수 있는 공고가 없습니다. 이미 맡은
              업무를 납품해 평판을 올리면 다시 공고가 보입니다.
            </p>
          </section>
        )}

        {list.map((l) => {
          const tier = findTier(l.tier)
          const fit = eligibility(tier.require, have)
          const chance = winChance(tier, reputation, stats)
          const bid = bids.find((b) => b.listing.id === l.id)
          const open = isOpen(l, week)
          const fee = Math.round(BASE_FEE[l.kind] * tier.feeMult)
          return (
            // 한 공고 = **왼쪽 본문 + 오른쪽 결정 칸**. 훑을 때 비교되는 것은 단가와
            // 확률이므로 그 둘만 오른쪽에 크게 세우고, 나머지는 본문에서 읽는다.
            <section key={l.id} className={`nv-bid__card${open ? '' : ' nv-bid__card--closed'}`}>
              <div className="nv-bid__main">
                <h4 className="nv-site__title">
                  <AppIcon name={BROWSER_ICONS.post} size={18} />
                  {l.subject}
                  <span className="nv-hire__role">{tier.label}</span>
                </h4>
                <p className="nv-site__desc">{l.body}</p>
                <p className="nv-hire__meta">
                  발주처 {l.from} · 공정{' '}
                  {stepsOf(l.kind)
                    .map((s) => s.label)
                    .join(' → ')}
                </p>

                {/* 참가 조건은 **늘 보인다** — 맞췄든 아니든 무엇을 요구하는지가 이 화면의
                    본문이고, 못 맞췄을 때만 보여 주면 무엇을 갖춰야 하는지 알 수 없다. */}
                {/* ⚠️ 가장 작은 단은 조건이 **없다** — 그 사실도 적어야 한다(빈 줄로 두면
                    조건을 못 읽은 것인지 없는 것인지 알 수 없다). */}
                <p className="nv-hire__meta">
                  참가 조건:{' '}
                  {tier.require.employees === 0 &&
                  tier.require.drafts === 0 &&
                  tier.require.rank === undefined
                    ? '없음 (누구나 입찰)'
                    : `직원 ${tier.require.employees}명 · 시안 ${tier.require.drafts}장${
                        tier.require.rank ? ` · 기획안 ${tier.require.rank}랭크` : ''
                      }`}
                </p>

                {/* ⚠️ 조건 미달이면 **무엇이 모자란지** 말한다. 흐린 버튼만 두면 왜 못
                    누르는지 알 길이 없다(이 리포의 확립된 규칙). */}
                {/* 마감된 공고에는 자격 미달을 적지 않는다 — 못 거는 이유가 둘이면
                    무엇 때문에 못 거는지가 흐려진다(마감이 먼저 온 사정이다). */}
                {!fit.ok && open && !bid && (
                  <p className="nv-site__fail">
                    <AppIcon name={BROWSER_ICONS.warn} size={16} />
                    참가 자격 미달 — {fit.missing.join(', ')}
                  </p>
                )}
              </div>

              <div className="nv-bid__side">
                <p className="nv-bid__figure">
                  <span className="nv-bid__label">예정 단가</span>
                  {fee.toLocaleString('ko-KR')}원
                </p>

                {/* ⚠️ **입찰 전에** 확률을 적는다. 모르고 거는 도박이 아니라 판단이어야 한다.
                    스토어가 굴릴 때 쓰는 것과 같은 함수·같은 인자다(`bidStats`). */}
                <p className="nv-bid__figure nv-bid__figure--point">
                  <span className="nv-bid__label">낙찰 확률</span>
                  {Math.round((bid ? bid.chance : chance) * 100)}%
                </p>
                <p className="nv-hire__meta">
                  {bid ? '입찰 당시 값' : `평판 ${reputation} · 능력치 ${Math.round(stats)}`}
                </p>

                {/* ⚠️ **기한을 적는다** — 언제까지 걸 수 있는지를 모르면 마감 자체가 뜻이
                    없다. 주차 표기는 다른 화면과 같은 `formatDate`다(두 번째 셈법 금지). */}
                <p className="nv-hire__meta">
                  입찰 마감 {formatDate(bidDeadline(l))}
                  {open ? ` · 남은 기한 ${bidDeadline(l) - week + 1}주` : ' · 마감됨'}
                </p>

                {/* 세 상태를 갈라 적는다: 걸어 놓고 기다리는 중 / 기한이 지나 못 건다 /
                    아직 걸 수 있다. ⚠️ 마지막 갈래에만 버튼을 그린다(죽은 컨트롤 금지). */}
                {bid ? (
                  <p className="nv-site__count">
                    <strong>입찰 완료</strong> — 결과는 {formatWeek(resultWeek(bid.week))}에 메일로
                    옵니다.
                  </p>
                ) : !open ? (
                  <p className="nv-site__fail">
                    <AppIcon name={BROWSER_ICONS.warn} size={16} />
                    입찰 기한이 지났습니다.
                  </p>
                ) : !allowed ? (
                  // ⚠️ 등급이 모자라면 **버튼을 그리지 않는다**(이유는 목록 위에 한 번 적었다) —
                  //    누를 수 없는 버튼을 공고마다 반복해 세우면 화면이 거절로 가득 찬다.
                  <p className="nv-hire__meta">{bidMinGrade().label}부터 입찰할 수 있습니다.</p>
                ) : (
                  <>
                    <button
                      type="button"
                      className="nv-site__go"
                      disabled={!fit.ok || ap < BID_AP}
                      onClick={() => bidListing(l)}
                    >
                      입찰하기 (행동력 {BID_AP})
                    </button>
                    {fit.ok && ap < BID_AP && (
                      <p className="nv-site__fail">
                        <AppIcon name={BROWSER_ICONS.warn} size={16} />
                        행동력이 모자랍니다.
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
