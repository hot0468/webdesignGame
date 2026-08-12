import type { Message } from '../data/inbox'
import { PROGRAMS, type ProgramId } from '../data/programs'
import { formatDate, formatPeriod } from '../systems/calendar'
import { canReply, isFinalReply, openStep, repliedStep, stepsOf } from '../systems/pipeline'
import { asStep, useGame, type Job } from '../store'

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
  // 이 글이 매인 업무 — 의뢰 글이면 그 글의 id가, 회신 뒤에 온 답장이면 `jobId`가 가리킨다.
  const jobId = message.jobId ?? message.id
  const job = useGame((s) => s.jobs.find((j) => j.id === jobId))
  const rejected = useGame((s) => s.rejectedIds.includes(message.id))
  const week = useGame((s) => s.week)
  const { acceptJob, rejectJob } = useGame.getState()
  const care = message.channel === 'board'

  // 광고에는 고를 것이 없다. ⚠️ 업무에 매인 글(답장·완료 메일)은 `ad`여도 회신을 진다 —
  //    스레드가 이어지려면 마지막 글에서도 다음 회신을 보낼 수 있어야 한다.
  if (message.ad && !message.jobId) return null

  if (job) return <Progress job={job} week={week} care={care} />
  if (message.ad) return null
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
          경고가 아니므로 빨갛게 하지 않는다(임박 표시는 업무목록의 몫).
          ⚠️ 수주하면 굳을 날짜(`store`의 `due`)와 **같은 식으로 계산해 같은 날을 적는다** —
          여기만 "3주"로 적으면 수주 전후로 다른 것을 말하는 것처럼 보인다. */}
      <span className="jobact__due">
        기한 {formatDate(week + message.dueWeeks)}까지
        {/* 의뢰문은 "다음 주부터 2주간"처럼 상대로 말한다 — 그 말이 이번 주 기준으로
            **며칠부터 며칠까지인지** 여기서 못 박는다. 관리자 페이지에 적어 넣을 값이
            바로 이 날짜라서, 옮겨 적는 왕복이 성립하려면 수주 전에 보여야 한다. */}
        {message.popup && (
          <>
            {' · 게시 '}
            {formatPeriod(week + message.popup.fromWeeks, week + message.popup.toWeeks)}
          </>
        )}
      </span>
      {!care && (
        <button type="button" className="jobact__btn" onClick={() => rejectJob(message.id)}>
          거절하기
        </button>
      )}
    </div>
  )
}

/** 수주한 뒤의 자리. **여기가 회신하는 곳이다** — 공정은 프로그램에서 돌고, 그 결과는
 *  이 글에서 보내야 상대에게 간다(`systems/pipeline.ts`).
 *
 * ⚠️ 세 상태를 구분해 적는다: 보낼 것이 있다 / 지금 할 공정이 있다 / 끝났다.
 *    "진행 중" 한마디로 뭉치면 플레이어가 **다음에 어디를 열어야 하는지** 알 수 없다. */
function Progress({ job, week, care }: { job: Job; week: number; care: boolean }) {
  const replyJob = useGame((s) => s.replyJob)
  const step = asStep(job)
  const steps = stepsOf(job.kind)

  // ⚠️ 끝난 방식을 구분해 적는다 — 둘 다 "끝났다"로 뭉치면 무엇이 잘못됐는지 알 수 없다.
  if (job.breached) return <p className="jobact__decided">기한이 지나 계약이 깨졌다.</p>
  if (job.done) return <p className="jobact__decided">납품까지 끝난 업무다.</p>

  const sendable = canReply(step, week)
  const doneStep = repliedStep(step)
  const next = openStep(step)

  return (
    <div className="jobact">
      {sendable ? (
        <>
          <button type="button" className="jobact__btn jobact__btn--go" onClick={() => replyJob(job.id)}>
            {isFinalReply(step) ? '완료 회신' : `${doneStep?.label} 회신`}
          </button>
          <span className="jobact__due">
            {isFinalReply(step)
              ? '보내면 이 업무가 끝난다.'
              : `보내면 ${steps[job.replied + 1]?.label} 요청이 돌아온다.`}
          </span>
        </>
      ) : (
        <span className="jobact__due">
          {/* 회신할 것이 없다 = 아직 만들지 않았다. 어느 창을 열어야 하는지까지 적는다. */}
          {/* 수주 직후에만 "받았다"를 붙인다 — 답장 글에서까지 그 말을 반복하면
              방금 회신한 것이 아니라 지금 막 수주한 것처럼 읽힌다. */}
          {next
            ? `${job.step === 0 && job.replied === 0 ? `${care ? '확인했다' : '견적을 보냈다'} — ` : ''}다음은 ${next.label}(${PROGRAM_LABEL[next.program]})이다.`
            : /* 팝업의 완료 회신만 여기 걸린다 — 게시 기간이 끝나야 보낼 수 있다. */
              '게시 기간이 끝나면 완료 회신을 보낼 수 있다.'}
        </span>
      )}
    </div>
  )
}

/** 공정 → 그 공정을 도는 창의 이름. ⚠️ `PROGRAMS`의 제목을 그대로 쓴다(두 번째 출처 금지). */
const PROGRAM_LABEL = Object.fromEntries(PROGRAMS.map((p) => [p.id, p.title])) as Record<
  ProgramId,
  string
>
