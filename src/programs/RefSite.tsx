import { AppIcon } from '../icons/AppIcon'
import { BROWSER_ICONS } from '../data/icons'
import { REFERENCE_AP } from '../data/reference'
import { formatWeek } from '../systems/calendar'
import { awardWorks } from '../systems/reference'
import { useGame } from '../store'

/** 레퍼런스 사이트(어워더즈). 브라우저 첫화면의 바로가기로 들어온다.
 *
 * **웹디가 일을 미루고 남의 잘된 사이트를 구경하는 자리다.** 그 시간이 행동력으로 나가고
 * (`REFERENCE_AP`), 대신 그 주에 만드는 시안이 한 등급 좋아진다(`INSPIRE_SHIFT`).
 *
 * ⚠️ **효과를 화면이 말한다** — 플레이어가 "레퍼런스를 보면 시안이 좋아진다"를 알 길이
 *    여기밖에 없다. 구경 전에는 무엇을 얻는지, 구경 뒤에는 지금 무엇이 걸려 있는지를 적는다.
 *
 * ⚠️ **구경 뒤에는 버튼을 그리지 않는다** — 한 주에 한 번이라 눌러도 아무 일이 없다
 *    (죽은 컨트롤 금지, 스토어의 `surfReference`에도 같은 가드가 있다).
 *
 * ⚠️ 수상작은 **저장되지 않는다** — 주차 하나에서 파생한다(`systems/reference.ts`).
 *    셀렉터 밖에서 만든다: 셀렉터 안에서 배열을 만들면 렌더마다 새 배열이 나와 zustand가
 *    무한 렌더를 돈다(`WorkSite`·`HireSite`가 겪은 것과 같은 함정).
 *
 * ⚠️ 썸네일은 **CSS로 그린다**(`browser.css`의 `.nv-ref__shot`) — 외부 이미지·CDN·이모지
 *    금지다. 시각 언어도 브라우저 창의 `--nv-*` 안에서 끝낸다. */
export function RefSite() {
  const week = useGame((s) => s.week)
  const ap = useGame((s) => s.ap)
  const inspiredWeek = useGame((s) => s.inspiredWeek)
  const surfReference = useGame((s) => s.surfReference)

  const works = awardWorks(week)
  const inspired = inspiredWeek === week
  const broke = ap < REFERENCE_AP

  return (
    <div className="nv-site">
      <header className="nv-site__bar">
        <h3 className="nv-site__brand">어워더즈 — 이 주의 수상작</h3>
      </header>

      <div className="nv-site__body nv-bid">
        <header className="nv-bid__head">
          <div className="nv-bid__facts">
            <span className="nv-bid__chip">{formatWeek(week)}</span>
            <span className="nv-bid__chip">구경 행동력 {REFERENCE_AP}</span>
            <span className="nv-bid__chip">주 1회</span>
          </div>

          {/* 세 상태를 갈라 적는다: 이미 봤다 / 행동력이 모자라다 / 아직 볼 수 있다.
              ⚠️ 마지막 갈래에만 **누를 수 있는** 버튼이 선다. */}
          {inspired ? (
            <p className="nv-site__count">
              <strong>영감을 받았다</strong> — 이번 주에 이미 구경했습니다. 이번 주에 만드는{' '}
              <b>시안이 한 등급 좋아집니다</b>. 다음 주가 되면 다시 볼 수 있습니다.
            </p>
          ) : (
            <>
              <p className="nv-hire__meta">
                한참 구경하면 손이 근질거립니다 — 구경한 주에 만드는 <b>시안이 한 등급</b>{' '}
                좋아집니다. 대신 그 시간만큼 <b>행동력 {REFERENCE_AP}</b>이 나갑니다.
              </p>
              <button
                type="button"
                className="nv-site__go nv-ref__surf"
                disabled={broke}
                onClick={surfReference}
              >
                구경하기 (행동력 {REFERENCE_AP})
              </button>
              {/* ⚠️ 못 누르는 이유는 흐린 버튼이 아니라 **글자가** 말한다. */}
              {broke && (
                <p className="nv-site__fail">
                  <AppIcon name={BROWSER_ICONS.warn} size={16} />
                  행동력이 모자랍니다. 주를 넘기면 다시 채워집니다.
                </p>
              )}
            </>
          )}
        </header>

        <div className="nv-ref">
          {works.map((w) => (
            <article key={w.id} className="nv-ref__card">
              {/* 썸네일은 그림이다 — 글자를 얹지 않는다(합성 대비를 만들 자리를 아예
                  만들지 않는다). 읽는 것은 전부 아래 본문에 선다. */}
              <div className={`nv-ref__shot nv-ref__shot--${w.shot}`} aria-hidden="true" />
              <div className="nv-ref__body">
                <p className="nv-ref__award">{w.award}</p>
                <h4 className="nv-ref__name">{w.name}</h4>
                <p className="nv-hire__meta">{w.studio}</p>
                <span className="nv-hire__role">{w.category}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
