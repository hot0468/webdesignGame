import { AppIcon } from '../icons/AppIcon'
import { BROWSER_ICONS } from '../data/icons'
import { BID_AP, findTier } from '../data/bidding'
import { BASE_FEE, REPUTATION_CRISIS } from '../data/game'
import { formatWeek } from '../systems/calendar'
import { eligibility, listings, winChance } from '../systems/bidding'
import { stepsOf } from '../systems/pipeline'
import { bidStats, useGame } from '../store'

/** 수주센터. 브라우저 첫화면의 바로가기로 들어온다.
 *
 * 고리는 이렇다: **참가 조건 확인 → 응모(행동력 `BID_AP`) → 추첨 → 낙찰이면 평소 업무**.
 *
 * ⚠️ **메일 의뢰와 다른 고리다.** 메일은 오면 무조건 받을 수 있지만 공고는 조건을 맞춰야
 *    응모할 수 있고, 응모해도 확정이 아니라 추첨이다. 그래서 이 화면이 지는 일은 둘이다:
 *    **무엇이 모자란지 말하는 것**과 **응모 전에 당첨 확률을 적는 것**. 확률을 감추면
 *    이 화면은 판단이 아니라 도박이 된다.
 *
 * ⚠️ 공고는 **저장되지 않는다** — 주차 하나에서 파생한다(`systems/bidding.ts`의
 *    `listings`, 시드를 받는 순수 함수). 창을 닫았다 열어도 같은 목록이 서고, 마음에 드는
 *    공고가 나올 때까지 굴릴 수 없다. 다음 목록은 주를 넘겨야 온다.
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
  const bids = useGame((s) => s.bids)
  const bidListing = useGame((s) => s.bidListing)

  // ⚠️ 셀렉터 안에서 만들지 않는다 — 렌더마다 새 배열이 나와 zustand가 무한 렌더를
  //    돈다(`AdminSite`·`HireSite`가 겪은 것과 같은 함정).
  const list = listings(week, reputation)
  // 자격 판정의 재료. **이미 있는 것에서 읽는다** — 새 개념을 만들지 않는다.
  const have = {
    employees: employees.length,
    drafts: drafts.length,
    slideGrades: slides.map((d) => d.grade),
  }
  const stats = bidStats({ design, planning })

  return (
    <div className="nv-site">
      <header className="nv-site__bar">
        <h3 className="nv-site__brand">수주센터 — 웹 제작 공고</h3>
      </header>

      <div className="nv-site__body">
        <section className="nv-site__panel">
          <h4 className="nv-site__title">
            <AppIcon name={BROWSER_ICONS.post} size={18} />
            이번 주 공고
          </h4>
          <p className="nv-site__desc">
            <strong>{formatWeek(week)}</strong>에 올라온 공고입니다. 참가 조건을 모두 갖춘
            업체만 <b>추첨</b>에 들어가며, 당첨 확률은 <b>회사평판과 능력치</b>가 정합니다.
            응모 한 건에 <b>행동력 {BID_AP}</b>이 듭니다. (현재 평판 {reputation})
          </p>

          {/* ⚠️ 위기선 아래면 목록이 빈다(설계 결정표) — 빈 자리에 **이유를 적는다**.
              아무 말 없이 비어 있으면 고장으로 보인다. */}
          {list.length === 0 && (
            <p className="nv-site__fail">
              <AppIcon name={BROWSER_ICONS.warn} size={16} />
              회사평판이 {REPUTATION_CRISIS} 미만이라 참가할 수 있는 공고가 없습니다. 이미
              맡은 업무를 납품해 평판을 올리면 다시 공고가 보입니다.
            </p>
          )}
        </section>

        {list.map((l) => {
          const tier = findTier(l.tier)
          const fit = eligibility(tier.require, have)
          const chance = winChance(tier, reputation, stats)
          const done = bids.includes(l.id)
          const fee = Math.round(BASE_FEE[l.kind] * tier.feeMult)
          return (
            <section key={l.id} className="nv-site__panel">
              <h4 className="nv-site__title">
                <AppIcon name={BROWSER_ICONS.post} size={18} />
                {l.subject}
                <span className="nv-hire__role">{tier.label}</span>
              </h4>
              <p className="nv-site__desc">{l.body}</p>
              <p className="nv-hire__meta">
                발주처 {l.from} · 예정 단가 {fee.toLocaleString('ko-KR')}원 · 공정{' '}
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
                  ? '없음 (누구나 응모)'
                  : `직원 ${tier.require.employees}명 · 시안 ${tier.require.drafts}장${
                      tier.require.rank ? ` · 기획안 ${tier.require.rank}랭크` : ''
                    }`}
              </p>

              {/* ⚠️ 조건 미달이면 **무엇이 모자란지** 말한다. 흐린 버튼만 두면 왜 못
                  누르는지 알 길이 없다(이 리포의 확립된 규칙). */}
              {!fit.ok && (
                <p className="nv-site__fail">
                  <AppIcon name={BROWSER_ICONS.warn} size={16} />
                  참가 자격 미달 — {fit.missing.join(', ')}
                </p>
              )}

              {/* ⚠️ **응모 전에** 확률을 적는다. 모르고 거는 도박이 아니라 판단이어야 한다.
                  스토어가 굴릴 때 쓰는 것과 같은 함수·같은 인자다(`bidStats`). */}
              {fit.ok && !done && (
                <p className="nv-site__count">
                  당첨 확률 <strong>{Math.round(chance * 100)}%</strong> — 평판 {reputation} ·
                  능력치 {Math.round(stats)}
                </p>
              )}

              {done ? (
                <p className="nv-site__count">
                  <strong>응모 완료</strong> — 결과는 메일로 왔습니다.
                </p>
              ) : (
                <button
                  type="button"
                  className="nv-site__go"
                  disabled={!fit.ok || ap < BID_AP}
                  onClick={() => bidListing(l)}
                >
                  응모하기 (행동력 {BID_AP})
                </button>
              )}

              {fit.ok && !done && ap < BID_AP && (
                <p className="nv-site__fail">
                  <AppIcon name={BROWSER_ICONS.warn} size={16} />
                  행동력이 모자랍니다. 다음 주에 다시 시도하세요.
                </p>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
