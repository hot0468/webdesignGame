import { useState } from 'react'
import './folder.css'
import { AppIcon } from '../icons/AppIcon'
import { EDITOR_ICONS, FIGMA_ICONS, PROGRAM_ICONS, STAT_ICONS } from '../data/icons'
import { PORTFOLIO_BONUS_MAX, PORTFOLIO_BONUS_PER, PORTFOLIO_MIN_GRADE } from '../data/bidding'
import { formatWeek } from '../systems/calendar'
import { isShowpiece, portfolioBonus, showpieces } from '../systems/portfolio'
import type { Draft } from '../systems/craft'
import type { PopupFile } from '../systems/popup'
import { Thumb, type ThumbKind } from '../components/Thumb'
import { useGame } from '../store'

/** `작업물` 창. **읽기 전용이다** — 만든 것을 모아 보는 자리이고 여기서 고칠 수 있는 것은
 *  없다(그래서 버튼이 하나도 없다. 동작하지 않는 컨트롤을 그리지 않는다는 규칙의 반대편이다).
 *
 * ⚠️ **자기 팔레트를 만들지 않는다.** 피그마·포토샵·에디터가 자기 CSS를 가지는 것은 그것들이
 *    실재하는 브랜드 앱이기 때문이고, 이 창은 그냥 OS의 파일 창이라 셸 토큰을 그대로 쓴다.
 *    골격(사이드바 + 본문)도 `사내시스템`과 **같은 `.company*` 클래스**다 — 같은 셸 언어의
 *    창 둘이 각자 다른 골격을 가지면 "한 OS 위"라는 인상이 깨진다.
 *
 * ⚠️ **등급도 보정도 여기서 계산하지 않는다** — `systems/portfolio.ts`가 단일 출처이고
 *    스토어의 `bidStats`가 같은 함수를 먹는다. 화면이 따로 세면 "적힌 것과 다르게 굴렸다"가
 *    된다.
 *
 * ⚠️ 세 목록을 한 통에 섞지 않는다 — 갈려 있는 이유는 시안(.fig)이 팝업 등록 화면에 뜨면
 *    안 되기 때문이다(스토어 주석이 정본). 여기서 합치면 그 이유가 화면에서 흐려진다. */

type Item = PopupFile | Draft

const TABS = [
  {
    id: 'files',
    label: '팝업 이미지',
    icon: PROGRAM_ICONS.file,
    kind: 'popup',
    empty: '포토샵에서 팝업을 만들면 여기 쌓인다.',
  },
  {
    id: 'drafts',
    label: '시안',
    icon: FIGMA_ICONS.drafts,
    kind: 'site',
    empty: '피그마에서 시안을 만들면 여기 쌓인다.',
  },
  {
    id: 'slides',
    label: '문서',
    icon: STAT_ICONS.jobs,
    kind: 'doc',
    empty: 'PPT에서 화면정의서·발표자료를 만들면 여기 쌓인다.',
  },
  {
    id: 'publishes',
    label: '퍼블리싱',
    icon: EDITOR_ICONS.publish,
    kind: 'code',
    empty: '에디터에서 퍼블리싱하면 여기 쌓인다.',
  },
] as const satisfies readonly { id: string; label: string; icon: string; kind: ThumbKind; empty: string }[]

export function Folder() {
  // ⚠️ 고른 갈래는 `useState`다 — 창을 보는 방식이지 게임 상태가 아니다(스토어에 넣으면
  //    세이브에 들어가고 그것 때문에 세이브 버전을 올리게 된다).
  const [view, setView] = useState<(typeof TABS)[number]['id']>('files')
  // ⚠️ 셀렉터 안에서 합치거나 거르지 마라 — 새 배열이 나와 무한 렌더가 된다(겪은 사고다).
  const files = useGame((s) => s.files)
  const drafts = useGame((s) => s.drafts)
  const slides = useGame((s) => s.slides)
  const publishes = useGame((s) => s.publishes)
  const jobs = useGame((s) => s.jobs)

  const lists: Record<(typeof TABS)[number]['id'], readonly Item[]> = {
    files,
    drafts,
    slides,
    publishes,
  }
  // ⚠️ 스토어의 `bidStats`가 세는 목록과 **같아야 한다** — 화면이 적는 보정과 실제로
  //    굴리는 보정이 갈리면 "적힌 것과 다르게 굴렸다"가 된다.
  const grades = [...files, ...drafts, ...slides, ...publishes].map((w) => w.grade)
  const tab = TABS.find((t) => t.id === view)!
  const items = lists[view]

  return (
    <div className="company">
      <nav className="company__menu">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`company__item${view === t.id ? ' company__item--on' : ''}`}
            aria-current={view === t.id ? 'page' : undefined}
            onClick={() => setView(t.id)}
          >
            {t.label}
            {/* 개수는 currentColor를 물려받는다 — 고른 줄은 primary 면이라 muted 회색을
                얹으면 그 자리에서만 대비가 무너진다. */}
            <span className="folder__count">{lists[t.id].length}</span>
          </button>
        ))}
      </nav>

      <div className="company__body">
        <div className="company__panel">
          {/* 이 창이 목록 이상인 이유. 좋은 것을 쌓으면 큰 일을 딴다는 고리가 여기서만 보인다. */}
          <div className="company__head">
            <span className="company__label">포트폴리오</span>
            <span className="company__value">
              {showpieces(grades)}
              <span className="company__max"> / {grades.length}</span>
            </span>
          </div>
          <p className="company__note">
            등급 {PORTFOLIO_MIN_GRADE} 이상인 작업물만 걸린다 — 하나당 +{PORTFOLIO_BONUS_PER}, 최대 +
            {PORTFOLIO_BONUS_MAX}.
          </p>
          <p className="company__note">
            지금 수주센터 낙찰 심사에 +{portfolioBonus(grades)}.
          </p>

          {items.length === 0 ? (
            <div className="empty">
              <p className="empty__title">아직 만든 것이 없다</p>
              <p className="empty__note">{tab.empty}</p>
            </div>
          ) : (
            <ul className="folder__list">
              {items.map((it) => (
                <Row key={it.id} item={it} icon={tab.icon} kind={tab.kind} title={jobs.find((j) => j.id === it.jobId)?.title} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

/** 파일 한 줄. **직원이 만든 것에 따로 표식을 달지 않는다** — 이름에 `(직원이름)`이 이미
 *  박혀 있고, 같은 관계를 두 곳에 적으면 둘이 어긋난다.
 *
 * ⚠️ `title`이 없을 수 있다(깨진 계약·옛 세이브) — 그때는 그 조각만 빠지고 줄은 선다.
 *    줄을 감추면 만든 것이 사라진 것처럼 보인다. */
function Row({
  item,
  icon,
  kind,
  title,
}: {
  item: Item
  icon: string
  kind: ThumbKind
  title?: string
}) {
  const star = isShowpiece(item.grade)
  return (
    <li className={`folder__item${star ? ' folder__item--star' : ''}`}>
      {/* 만든 것의 초상 — 등급이 마감새를, 파일 id가 색을 정한다(`Thumb` 주석). */}
      <Thumb kind={kind} grade={item.grade} seed={item.id} />
      <span className="folder__name">
        <AppIcon name={star ? STAT_ICONS.reputation : icon} />
        {item.name}
      </span>
      <span className="folder__meta">
        등급 {item.grade} · {formatWeek(item.madeWeek)} 제작{title ? ` · ${title}` : ''}
      </span>
    </li>
  )
}
