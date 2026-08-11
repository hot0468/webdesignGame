import type { Message } from '../data/inbox'
import { useGame } from '../store'

/** 의뢰 하나에 대한 결정. 어느 쪽이든 수주하면 **같은 업무목록**에 쌓인다.
 *
 * ⚠️ 채널이 고를 수 있는 것을 정한다:
 *    - **메일(신규 의뢰)** = 견적보내기 / 거절하기. 안 받아도 되는 남의 일이다.
 *    - **고객게시판(유지보수)** = 확인 하나뿐. **이미 계약된 업체의 요청이라 거절이 없다** —
 *      거절 버튼을 달면 "관리 중인 사이트를 안 고치겠다"는, 게임에 없는 선택지가 생긴다.
 *
 * ⚠️ **색을 여기서 정하지 않는다.** 감싸는 창이 `--jobact-*`를 준다(메일 창은 Fluent 파랑,
 *    사내시스템은 셸 인디고). 컴포넌트가 색을 쥐면 한 창 안에서 두 팔레트가 섞인다. */
export function JobActions({ message }: { message: Message }) {
  const accepted = useGame((s) => s.jobs.some((j) => j.id === message.id))
  const rejected = useGame((s) => s.rejectedIds.includes(message.id))
  const { acceptJob, rejectJob } = useGame.getState()
  const care = message.channel === 'board'

  // 광고에는 고를 것이 없다.
  if (message.ad) return null

  if (accepted) {
    return (
      <p className="jobact__decided">
        {care ? '확인했다' : '견적을 보냈다'} — 업무목록에 올랐다.
      </p>
    )
  }
  if (rejected) return <p className="jobact__decided">거절한 의뢰다.</p>

  return (
    <div className="jobact">
      <button
        type="button"
        className="jobact__btn jobact__btn--go"
        onClick={() => acceptJob(message)}
      >
        {care ? '확인' : '견적보내기'}
      </button>
      {/* 기한을 받기 전에 보여 준다 — 받고 나서야 알면 고를 수가 없다. 여기서는 아직
          경고가 아니므로 빨갛게 하지 않는다(임박 표시는 업무목록의 몫). */}
      <span className="jobact__due">처리 기한 {message.dueWeeks}주</span>
      {!care && (
        <button type="button" className="jobact__btn" onClick={() => rejectJob(message.id)}>
          거절하기
        </button>
      )}
    </div>
  )
}
