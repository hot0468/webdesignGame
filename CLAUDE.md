# webdesignGame (웹디)

## 하네스: 웹디자이너 회사 운영 게임 개발

**목표:** 가짜 윈도우 OS 위에서 도는 회사 운영 게임을 최소 토큰으로 구현·유지보수한다.
**기획 정본:** [docs/SPEC.md](docs/SPEC.md) — 설계자 브리프. 요구사항의 단일 출처다.

**트리거:** 이 게임의 개발 작업(구현/수정/QA/이어하기) 요청 시 `game-pipeline` 스킬을 사용하라. 코드를 만지는 모든 작업 전에 `project-context` 스킬을 먼저 로드하라(코드베이스 탐색 대체). 단순 질문은 직접 응답 가능.

**디자인 규칙:** `ui-ux-pro-max`(685줄 + DB 조회)는 **새 시각 언어를 만들 때만** 로드한다 — 새 화면·새 사이트·새 프로그램 창·팔레트나 타이포 변경. 이미 있는 화면을 고치는 작업은 로드하지 말고 `src/index.css`의 확정된 토큰만 쓴다. **토큰에 없는 색·간격·그림자를 새로 만들어야 하면 그 순간 새 시각 언어이므로 스킬을 로드한다** — 이 예외가 규칙의 핵심이다. 감으로 정한 값 금지.

**톤 규칙:** 이 게임은 **귀엽고 트렌디**하다. ⚠️ 형제 프로젝트 `../windowsGame`에서 구조·컴포넌트·스크립트는 베껴 와도 **팔레트와 타이포는 베끼지 않는다** — 그쪽은 뉴트럴 OS 크롬이 정체성이라 여기 그대로 오면 톤이 죽는다.

**토큰 규칙:** 파일 3개 이하 수정은 에이전트 스폰 없이 직접 처리. 에이전트 병렬 스폰 최대 2. 에이전트에게 코드 전문 반환 금지(요약만). **에이전트 `model`은 기본 생략(세션 모델 상속)** — 아키텍처·시각 언어 설계·전체 리뷰만 `opus` 명시.

**검증 규칙:** 기본은 **`npm test` + `npm run build`**. 이걸로 끝낸다. 다만 **화면에 보이는 결과가 바뀌는데 테스트로 증명할 수 없는 것**(레이아웃 겹침·대비·z-order)은 규모와 무관하게 실제 브라우저로 확인한다.

**검증 분량:** 테스트는 **그 변경이 깨뜨릴 수 있는 것**만 덮는다. 한 기능에 40개씩 붙이지 않는다. 규칙을 뒤집어 실패를 확인하는 증명은 **돈·주차 진행·정산을 만드는 불변식에만** 쓴다. ⚠️ 이 게임의 무작위(업무 발생·주말 돌발·지원자)는 전부 **시드를 받는 순수 함수**여야 테스트가 가능하다 — `Math.random`을 `systems/`에 넣지 마라.

**속도 규칙:** UI 작업은 규모로 경로를 가른다. 파일 3개 이하 + 기존 토큰 안에서 끝나면 **경량 경로**(직접 수정 → 빌드 → 스팟체크). 새 화면·시각 언어 변경·파일 4개 이상만 **풀 경로**. 상세는 `game-pipeline` 스킬.

**병렬 작업 규칙:** 한 워킹 트리에서 세션을 **둘 이상 동시에 돌리지 않는다.** 동시에 돌려야 하면 각자 자기 브랜치에서 `git worktree add`로 트리를 나눈다. ⚠️ 트리를 공유하면 `npm run build`·`npm test`가 **남의 미완성 코드에서 멈추고**, 원인이 내 변경이 아님을 가려내는 데 실제 작업보다 많은 토큰이 든다. 커밋은 `git add <내 파일>`로 **경로를 명시**한다(`git add -A`·`git commit -a` 금지).

**사유는 한 번만 쓴다 — 정본은 그 결정이 사는 소스 파일의 주석이다.** 다음 사람이 그 코드를 편집하는 바로 그 순간 읽히는 유일한 자리라서다. ⚠️ **같은 판단을 커밋 메시지·`docs/HISTORY.md`·아래 표에 다시 풀어 쓰지 않는다** — 세 벌로 쓰면 셋이 서로 어긋나고, 출력 분량이 한 작업의 체감 시간을 가장 크게 좌우한다. 커밋 메시지는 제목 + 무엇을/왜 3줄 이내로 끝내고 자세한 것은 코드를 가리킨다. **예외:** 코드에 앉힐 자리가 없는 결정(전역 방향 전환, 기각된 대안 전체)만 HISTORY.md가 정본이 된다.

**변경 이력:** 아래 표는 **색인이다 — 한 줄 요약만 적는다.** 최근 10행 유지, 넘치면 가장 오래된 행을 **한 줄 그대로** [docs/HISTORY.md](docs/HISTORY.md) 맨 위로 옮긴다.

| 날짜 | 변경 | 대상 |
|------|------|------|
| 2026-08-17 | **프로그램마다 다른 머리** — 빈 버튼뿐이던 두 창을 채웠다. 포토샵은 의뢰서의 **규격을 읽어 맞추고**(틀리면 등급이 밀린다), PPT는 **분량↔시간↔등급을 저울질**한다(적게 만들면 빨리 끝나되 깎인다) | src/data/spec.ts·systems/spec.ts(+test)(신규), src/store.ts(+test), src/components/JobActions.tsx, src/programs/Photoshop.tsx·photoshop.css·Ppt.tsx·ppt.css |
| 2026-08-17 | **작업물에 얼굴이 생겼다** — 만든 것을 CSS로 그린다(종류=구도·등급=마감새·파일 id=색). F·D는 잿빛에 비뚤고 A부터 윤이 난다. 완성 창과 작업물 창 두 자리 | src/components/Thumb.tsx·thumb.css(신규)·Working.tsx, src/programs/Folder.tsx·folder.css·Figma·Photoshop·Ppt·Editor.tsx, src/index.css |
| 2026-08-17 | **잘하면 빨라진다** — 직원 지시 기간을 레벨만이 아니라 **그 공정의 스탯**도 당긴다(`orderWeeks(level, stat)`). 기본 주차 3→4는 그 짝이다: 3이면 레벨만으로 하한에 닿아 스탯이 죽는다. 내 숙련도 감면은 이미 있던 것 | src/data/employees.ts, src/systems/employee.ts(+test)·hire.ts, src/store.ts(+test), src/programs/Messenger.tsx, project-context(systems) |
| 2026-08-17 | **시간을 분으로** — 행동력이 사라지고 주차 아래에 요일·시계가 생겼다. 퀄리티가 오를수록 작업이 하루를 넘어 며칠짜리가 되고(120/360/720분) 일정표에 블록으로 깔린다. ⚠️ 작업은 주를 못 넘는다(주차 넘김은 사람 손에 남는다) | src/systems/clock.ts(+test)(신규), src/data/game.ts, src/store.ts(+test), src/components/Hud.tsx·Taskbar.tsx·JobActions.tsx, src/programs/*(제작 창 전부), src/systems/calendar.ts, src/index.css, project-context(systems·shell) |
| 2026-08-17 | **하네스 토큰 정비** — 시스템 규칙 전문을 `references/systems.md`로 내리고 project-context 코어를 색인(44KB→9KB)으로 줄였다. 상한도 줄 수가 아니라 바이트다 | .claude/skills/project-context/SKILL.md·references/systems.md(신규)·shell.md, .claude/skills/game-pipeline/SKILL.md, .claude/agents/game-qa.md |
| 2026-08-14 | **PPT 창을 파워포인트로** — 리본이 제작 버튼 셋(무는 행동력·나올 등급을 달고), 축소판 레일이 업무 목록, 흰 종이가 그 문서다. 팔레트는 `ppt.css`에 가두고 셸에서 `.ppt`를 걷었다 | src/programs/Ppt.tsx·ppt.css(신규), src/index.css, src/data/programs.ts(size app)·icons.ts, project-context(shell.md) |
| 2026-08-14 | **수주가 업체를 만든다** — 업체정보에는 **거래처거나 일을 받은 곳**만 서고, 상수 목록에 없는 낙찰처는 접속 정보를 **이름에서 파생**해 생겨난다(저장 없음). 목록의 정본은 `clientsOf(jobs, clients)` 하나 — 수주센터로 딴 사이트를 퍼블리싱 못 하던 구멍이 막혔다 | src/data/company.ts(+test), src/programs/Company.tsx·Editor.tsx, src/systems/ftp.ts(+test)·followup.ts(+test), src/store.ts, src/components/JobActions.tsx |
| 2026-08-14 | **미팅을 두 단계로** — 메일에서 할지 말지 먼저 고르고, 하기로 하면 내가 갈지 직원이 갈지 정한다(직원 버튼에 기획력 표기). 안 하는 쪽도 버튼이라 "미팅 없이도 된다"가 화면에 보인다 | src/components/JobActions.tsx |
| 2026-08-14 | **월 투자**(광고·복지) — 후반에 돈만 쌓이던 것을 매달 나가는 지출로 풀었다. 효과는 이미 있는 축(소개 확률·정신력·불만)에 붙는다 | src/data/invest.ts·systems/invest.ts(+test)(신규), src/store.ts, src/programs/Company.tsx, src/index.css |
| 2026-08-14 | **특수 이벤트 셋** — 소개(평판 50+, 거래처가 4→7곳으로 늘어난다)·수상(A급 작업물)·저작권 위반(법무사무실 합의금) | src/data/events.ts·systems/referral.ts(+test)(신규), src/data/company.ts, src/store.ts, src/programs/Company.tsx |


