import { useState } from 'react'
import type { Message } from '../data/inbox'
import { CS_REPLY_MINS, csRecover } from '../data/game'
import { MEETING_MINS } from '../data/keywords'
import { PROGRAMS, type ProgramId } from '../data/programs'
import { formatDate, formatPeriod } from '../systems/calendar'
import { isBusy } from '../systems/employee'
import { canReply, isFinalReply, openStep, repliedStep, stepsOf } from '../systems/pipeline'
import { personalityOf } from '../systems/followup'
import { formatSpan } from '../systems/calendar'
import { asStep, useClock, useGame, type Job } from '../store'
import { Meeting } from './Meeting'

/** 의뢰 하나에 대한 결정. 어느 쪽이든 수주하면 **같은 업무목록**에 쌓인다.
 *
 * ⚠️ 채널이 고를 수 있는 것을 정한다:
 *    - **메일(신규 의뢰)** = 견적보내기 / 거절하기. 안 받아도 되는 남의 일이다.
 *    - **고객게시판(유지보수)** = 확인 하나뿐. **이미 계약된 업체의 요청이라 거절이 없다** —
 *      거절 버튼을 달면 "관리 중인 사이트를 안 고치겠다"는, 게임에 없는 선택지가 생긴다.
 *    - **수주센터 낙찰 통보(`bid`)** = 사업 시작 / 나중에. 이미 심사를 통과해 딴 일이라
 *      견적을 다시 낼 자리가 아니고, 그래서 **거절이 아니라 미루기다**: 낙찰인데 착수하지
 *      않는 것도 선택이므로(설계 제약) 안 눌러도 메일이 남아 나중에 시작할 수 있다.
 *      ⚠️ 그래서 이 갈래에는 **거절 버튼을 그리지 않는다** — 안 누르는 것이 곧 거절이라
 *      두 벌로 만들면 "거절했다"와 "아직 안 했다"라는 같은 상태가 둘로 갈린다.
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
  // 수주센터 낙찰 통보인가. ⚠️ **채널로는 못 가른다** — 낙찰 메일도 신규 건이라 `mail`이다.
  const won = message.ad === undefined && message.bid === true

  // 클레임에는 **사과**가 붙는다 — 수주할 일은 아니지만 고를 것이 있는 유일한 `ad` 글이다.
  if (message.claim) return <Apology mailId={message.id} />

  // 광고에는 고를 것이 없다. ⚠️ 업무에 매인 글(답장·완료 메일)은 `ad`여도 회신을 진다 —
  //    스레드가 이어지려면 마지막 글에서도 다음 회신을 보낼 수 있어야 한다.
  if (message.ad && !message.jobId) return null

  // ⚠️ 미팅 요청 글에서는 **미팅이 먼저 서고 진행 안내가 그 아래에 붙는다** — 이 글이 받은
  //    편지함 맨 위라, 여기서 회신까지 못 하면 아래로 내려가 원래 의뢰 글을 찾아야 한다.
  if (job && message.meeting)
    return (
      <>
        <MeetingAction job={job} />
        <Progress job={job} week={week} care={care} />
      </>
    )
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
        {won ? '사업 시작' : care ? '확인' : '견적보내기'}
      </button>
      {/* 기한을 받기 전에 보여 준다 — 받고 나서야 알면 고를 수가 없다. 여기서는 아직
          경고가 아니므로 빨갛게 하지 않는다(임박 표시는 업무목록의 몫).
          ⚠️ 수주하면 굳을 날짜(`store`의 `due`)와 **같은 식으로 계산해 같은 날을 적는다** —
          여기만 "3주"로 적으면 수주 전후로 다른 것을 말하는 것처럼 보인다. */}
      <span className="jobact__due">
        {/* 낙찰 건의 기한은 **시작을 누르는 주부터** 센다 — 기다린 주는 기한을 먹지 않는다.
            지금 누르면 언제까지인지를 적는 것이라 계산식은 다른 의뢰와 같다. */}
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
      {/* ⚠️ 낙찰 건에는 거절이 없다 — **안 누르는 것이 곧 안 하는 것**이고, 메일은 남아
          있으므로 나중에 시작해도 된다(그때의 주차로 마감이 굳는다). */}
      {!care && !won && (
        <button type="button" className="jobact__btn" onClick={() => rejectJob(message.id)}>
          거절하기
        </button>
      )}
    </div>
  )
}

/** 클레임 글의 자리. **CS 스탯이 사는 유일한 곳이다** — 사과하면 평판이 조금 돌아온다.
 *
 * ⚠️ 되돌아오는 양은 클레임이 깎은 것보다 **작다**(`CS_RECOVER`) — 같거나 크면 팝업을
 *    어긋나게 걸고 사과만 하는 것이 최적이 된다. 실수의 대가는 남아야 한다.
 * ⚠️ 한 글에 한 번뿐이다(스토어도 막는다). 여러 번 되면 시간으로 평판을 사게 된다. */
function Apology({ mailId }: { mailId: string }) {
  const clock = useClock()
  const cs = useGame((s) => s.cs)
  const done = useGame((s) => s.apologized.includes(mailId))
  const apologize = useGame((s) => s.apologize)

  if (done) return <p className="jobact__decided">사과 메일을 보냈다 — 평판이 조금 돌아왔다.</p>

  return (
    <div className="jobact">
      <button
        type="button"
        className="jobact__btn jobact__btn--go"
        disabled={!clock.can(CS_REPLY_MINS)}
        onClick={() => apologize(mailId)}
      >
        사과하기
      </button>
      {/* ⚠️ **얼마나 돌아오는지 먼저 적는다** — 모르고 누르는 버튼은 선택이 아니다. */}
      <span className="jobact__due">
        {formatSpan(CS_REPLY_MINS, clock.dayMins)} · 평판 +{csRecover(cs)} (CS {cs})
      </span>
    </div>
  )
}

/** 미팅 요청 글의 자리. **미팅은 여기서 시작한다**(피그마가 아니다 — 설계자 확정 2026-08-13).
 *
 * 누르면 그 자리에서 시간을 물고(`holdMeeting`) **대화 창**이 뜬다. 창은 결과를 보여 줄
 * 뿐이므로(`components/Meeting.tsx`) 도중에 닫아도 알아낸 것은 남는다.
 *
 * ⚠️ 이미 미팅을 한 업무면 버튼을 그리지 않는다 — 두 번 열면 시간으로 정답을 살 수 있다.
 * ⚠️ 직원 파견도 여기 있다: 내 시간 대신 그 사람이 잡히고, 그때는 **대화 창이 뜨지 않는다**
 *    (내가 간 자리가 아니라서다. 결과는 피그마의 `확인됨` 표식으로 확인한다). */
function MeetingAction({ job }: { job: Job }) {
  const clock = useClock()
  const known = useGame((s) => s.meetings[job.id])
  const holdMeeting = useGame((s) => s.holdMeeting)
  const employees = useGame((s) => s.employees)
  const orders = useGame((s) => s.orders)
  const trainings = useGame((s) => s.trainings)
  const [open, setOpen] = useState(false)
  /** 이 글에서 어디까지 정했는가. **저장하지 않는다** — 진짜로 굳는 것은 시안을 만드는
   *  순간이고(그때 이 판이 통째로 닫힌다), 그전에는 마음을 바꿀 수 있어야 한다.
   *  ⚠️ 스토어에 '미팅 안 함' 칸을 만들지 마라 — "안 하기로 했다"와 "아직 안 정했다"가
   *     같은 상태로 갈려, 낙찰 메일에 거절 버튼을 두지 않은 것과 같은 사고가 난다. */
  const [stage, setStage] = useState<'ask' | 'who' | 'skip'>('ask')
  const free = employees.filter((e) => !isBusy(e.id, orders, trainings))

  // ⚠️ **기획서(화면정의서)를 제출한 뒤에야 미팅을 간다**(설계자 확정 2026-08-13) —
  //    그전에는 무엇을 만들지 정해지지도 않았고, 미팅에서 들은 말을 쓸 자리(시안)도 아직
  //    열리지 않았다. 조건은 "지금 시안 차례인가" 하나다(`openStep`) — 제출이 끝나야 그 칸이
  //    열리므로 새 플래그를 만들지 않는다. 시안을 이미 만든 뒤에도 닫힌다(들을 이유가 없다).
  const ready = openStep(asStep(job))?.id === 'draft'

  if (known) {
    return (
      <>
        <p className="jobact__decided">
          미팅은 끝났다 — 알아낸 것은 피그마의 시안 만들기에 표시된다.
        </p>
        {open && (
          <Meeting from={job.from} revealed={known} onClose={() => setOpen(false)} />
        )}
      </>
    )
  }

  // 아직 갈 때가 아니면 **버튼을 그리지 않는다**(눌러도 안 되는 버튼 대신 언제 열리는지 적는다).
  if (!ready) {
    return <p className="jobact__decided">기획서를 제출하면 미팅을 잡을 수 있다.</p>
  }

  // ── ① 할지 말지 ────────────────────────────────────────
  // ⚠️ **미팅 없이도 시안을 만들 수 있다**(설계자 확정 2026-08-14) — 그런데 화면이 그것을
  //    말하지 않으면 미팅이 거쳐야 하는 관문처럼 읽힌다. 그래서 안 하는 쪽도 **버튼으로**
  //    세운다: 무엇을 얻고 무엇을 포기하는지 한 줄씩 적어 두 갈래가 값으로 비교되게 한다.
  if (stage === 'ask') {
    return (
      <div className="jobact">
        <button
          type="button"
          className="jobact__btn jobact__btn--go"
          onClick={() => setStage('who')}
        >
          미팅 잡기
        </button>
        <button type="button" className="jobact__btn" onClick={() => setStage('skip')}>
          미팅 없이 진행
        </button>
        <span className="jobact__due">
          미팅에서 원하는 분위기를 알아내면 시안 등급이 오른다. 안 가면 키워드를 찍어야 한다.
        </span>
      </div>
    )
  }

  // ⚠️ 되돌릴 수 있어야 한다 — 아직 아무것도 물지 않았고, 굳는 것은 시안을 만들 때다.
  if (stage === 'skip') {
    return (
      <div className="jobact">
        <span className="jobact__due">
          미팅 없이 진행하기로 했다 — 피그마에서 키워드를 직접 골라 시안을 만든다.
        </span>
        <button type="button" className="jobact__btn" onClick={() => setStage('ask')}>
          다시 생각하기
        </button>
      </div>
    )
  }

  // ── ② 누가 가는가 ──────────────────────────────────────
  // 내가 가면 **내 시간**을, 직원을 보내면 **그 사람의 한 주**를 문다(`store.holdMeeting`).
  // ⚠️ 알아내는 개수는 **가는 사람의 기획력**이 정한다 — 그래서 이름 옆에 그 값을 적는다
  //    (누구를 보낼지가 이 갈래의 유일한 선택인데, 값이 안 보이면 고를 근거가 없다).
  return (
    <div className="jobact">
      <button
        type="button"
        className="jobact__btn jobact__btn--go"
        disabled={!clock.can(MEETING_MINS)}
        onClick={() => {
          holdMeeting(job.id)
          setOpen(true)
        }}
      >
        내가 간다
      </button>
      <span className="jobact__due">{formatSpan(MEETING_MINS, clock.dayMins)}</span>
      {free.map((e) => (
        <button
          key={e.id}
          type="button"
          className="jobact__btn"
          onClick={() => holdMeeting(job.id, e.id)}
        >
          {e.name} 보내기 (기획 {e.stats.planning})
        </button>
      ))}
      {/* 보낼 사람이 없는 것과 직원이 다 바쁜 것을 구분해 적는다 — 고칠 방법이 다르다. */}
      {free.length === 0 && (
        <span className="jobact__due">
          {employees.length === 0 ? '보낼 직원이 없다.' : '직원이 모두 다른 일에 잡혀 있다.'}
        </span>
      )}
      <button type="button" className="jobact__btn" onClick={() => setStage('ask')}>
        뒤로
      </button>
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

  // 담당자 성격. ⚠️ **수주한 뒤에만 보인다** — 미리 보이면 픽셀간섭형 의뢰는 늘 거절이
  //    정답이라 받을지 말지의 선택이 죽는다. 받고 나서 알게 되는 것이 이 축의 전부다.
  const who = personalityOf(job.from)
  const sendable = canReply(step, week)
  const doneStep = repliedStep(step)
  const next = openStep(step)

  return (
    <div className="jobact">
      <span className="jobact__due">
        이 담당자는 {who.label}이다 — {who.desc}
      </span>
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
          {next ? (
            <>
              {`${job.step === 0 && job.replied === 0 ? `${care ? '확인했다' : '견적을 보냈다'} — ` : ''}다음은 ${next.label}(${PROGRAM_LABEL[next.program]})이다.`}
              {/* ⚠️ 퍼블리싱은 **창을 열어도 바로 못 한다** — FTP로 그 업체 서버에 붙어야
                  업무가 목록에 서는데, 접속 정보는 사내시스템에서 찾아 옮겨 적는 왕복이
                  의도된 동선이다(관리자 페이지와 같은 규칙). 그 왕복을 모르면 에디터를
                  열어 놓고 왜 아무것도 없는지 알 수 없으므로 여기서 미리 말한다. */}
              {next.program === 'editor' && (
                <>
                  {' '}
                  사내시스템 &gt; 업체정보에서 {job.from}의 FTP 접속 정보를 확인해 에디터에서
                  연결해야 한다.
                </>
              )}
            </>
          ) : (
            /* 팝업의 완료 회신만 여기 걸린다 — 게시 기간이 끝나야 보낼 수 있다. */
            '게시 기간이 끝나면 완료 회신을 보낼 수 있다.'
          )}
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
