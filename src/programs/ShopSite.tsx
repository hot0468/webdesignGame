import { AppIcon } from '../icons/AppIcon'
import { BROWSER_ICONS } from '../data/icons'
import { SHOP_ITEMS, type ShopItem, type ShopItemId } from '../data/shop'
import { BUY_BLOCK_TEXT, buyBlock } from '../systems/shop'
import { useGame } from '../store'

/** 쇼핑몰. **소지금이 사람 손으로 나가는 유일한 자리다** — 급여·월정액은 정산이 알아서
 * 가져가고, 여기만 무엇을 살지 고른다.
 *
 * ⚠️ 파는 것은 **이미 있는 축**만 민다(숙련도·정신력) — 새 축을 만들면 상점 하나 때문에
 *    게임이 두 겹으로 늘어난다(`data/shop.ts`).
 *
 * ⚠️ 못 사는 이유는 **글자가 말한다**(흐린 버튼만 두면 왜 못 누르는지 알 길이 없다).
 *    판정은 `systems/shop.ts`의 `buyBlock` 하나이고 스토어도 같은 함수를 쓴다.
 *
 * ⚠️ 시각 언어는 브라우저 창의 `--nv-*` 안에서 끝낸다 — 목록이라 폭은 `.nv-bid`와 같은
 *    880px 격자를 쓴다(폼 폭 420px은 로그인·등록 화면의 것이다). */
export function ShopSite() {
  const money = useGame((s) => s.money)
  const mental = useGame((s) => s.mental)
  const mentalMax = useGame((s) => s.mentalMax)
  const boughtIds = useGame((s) => s.boughtIds)
  const figmaSkill = useGame((s) => s.figmaSkill)
  const photoshopSkill = useGame((s) => s.photoshopSkill)
  const codingSkill = useGame((s) => s.codingSkill)
  const buyItem = useGame((s) => s.buyItem)

  const have = {
    money,
    boughtIds,
    mental,
    mentalMax,
    skills: { figmaSkill, photoshopSkill, codingSkill },
  }

  return (
    <div className="nv-site">
      <header className="nv-site__bar">
        <h3 className="nv-site__brand">웹디몰 — 장비와 소모품</h3>
      </header>

      <div className="nv-site__body nv-bid">
        <header className="nv-bid__head">
          <div className="nv-bid__facts">
            <span className="nv-bid__chip">소지금 {money.toLocaleString('ko-KR')}원</span>
            <span className="nv-bid__chip">
              정신력 {mental}/{mentalMax}
            </span>
            <span className="nv-bid__chip">피그마 {figmaSkill}</span>
            <span className="nv-bid__chip">포토샵 {photoshopSkill}</span>
            <span className="nv-bid__chip">코딩 {codingSkill}</span>
          </div>
          <p className="nv-hire__meta">
            장비는 <b>한 번만</b> 살 수 있고 숙련도를 영구히 올립니다. 소모품은 정신력을
            회복시키며 여러 번 살 수 있습니다.
          </p>
        </header>

        {/* ⚠️ 넓은 `ShopItem`으로 훑는다 — 리터럴 유니온 그대로면 `once`가 없는 갈래가
            생겨 카드마다 갈래를 갈라야 한다(`findItem`이 같은 이유로 넓혀 돌려준다). */}
        <div className="nv-shop">
          {(SHOP_ITEMS as readonly ShopItem[]).map((item) => {
            const blocked = buyBlock(item, have)
            return (
              <section key={item.id} className="nv-shop__card">
                <h4 className="nv-site__title">
                  <AppIcon name={BROWSER_ICONS.shop} size={18} />
                  {item.name}
                  <span className="nv-hire__role">{item.once ? '장비' : '소모품'}</span>
                </h4>
                <p className="nv-site__desc">{item.desc}</p>
                <p className="nv-bid__figure">
                  <span className="nv-bid__label">가격</span>
                  {item.price.toLocaleString('ko-KR')}원
                </p>
                <p className="nv-hire__meta">
                  {'skill' in item ? `숙련도 +${item.gain}` : `정신력 +${item.mental}`}
                </p>

                <button
                  type="button"
                  className="nv-site__go"
                  disabled={blocked !== undefined}
                  onClick={() => buyItem(item.id as ShopItemId)}
                >
                  구입
                </button>
                {blocked && (
                  <p className="nv-site__fail">
                    <AppIcon name={BROWSER_ICONS.warn} size={16} />
                    {BUY_BLOCK_TEXT[blocked]}
                  </p>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
