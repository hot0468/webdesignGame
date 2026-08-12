import { AppIcon } from '../icons/AppIcon'
import { MESSENGER_ICONS } from '../data/icons'
import './messenger.css'

/** `메신저` 창. **직원과의 소통**이 여기서 일어난다 — 업무 지시와 보고가 오가는 자리다.
 * (클라이언트 응대는 `메일`·고객게시판이 진다. 여기 섞지 말 것.)
 *
 * 카카오톡 PC와 같은 세 칸(레일 · 대화 목록 · 대화 칸)이다. 시각 언어는 셸이 아니라
 * `messenger.css`가 진다 — 프로그램 창은 자기 팔레트를 가둔다(`Mail.tsx`와 같은 규칙).
 *
 * ⚠️ 대화방의 정본은 **고용된 직원 목록**이다. 채용 시스템이 없어 지금은 0명이므로
 *    가짜 방을 미리 그리지 않는다(`Figma.tsx`와 같은 이유). 직원이 스토어에 생기면
 *    아래 빈 자리에 목록이 들어오고, 방 하나가 직원 하나다. */
export function Messenger() {
  return (
    <div className="msgr">
      {/* 화면이 하나뿐이라 레일은 표식이다 — 상세는 messenger.css 주석. */}
      <div className="msgr__rail" aria-hidden="true">
        <span className="msgr__me">나</span>
        <AppIcon name={MESSENGER_ICONS.chat} size={22} className="msgr__rail-on" />
      </div>

      <div className="msgr__list">
        <h3 className="msgr__list-head">채팅</h3>
        <p className="msgr__blank msgr__blank--list">직원이 없다</p>
      </div>

      <section className="msgr__chat">
        <div className="msgr__blank">
          <AppIcon name={MESSENGER_ICONS.blank} size={40} />
          <p className="msgr__blank-title">아직 온 대화가 없다</p>
          <p className="msgr__blank-note">
            직원을 뽑으면 여기로 업무 지시와 보고가 오간다. 채용은 브라우저의 채용 사이트에서
            공고를 올려야 시작된다.
          </p>
        </div>
      </section>
    </div>
  )
}
