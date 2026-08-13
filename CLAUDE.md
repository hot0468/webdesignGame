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
| 2026-08-13 | 수주센터 — 조건(직원수·시안 장수·기획안 랭크)을 갖춰야 응모하고, 확률은 평판·능력치가 정한다. 추첨 씨앗은 공고 id | src/data/bidding.ts·systems/bidding.ts·programs/WorkSite.tsx(신규), src/store.ts(+test), src/data/sites.ts |
| 2026-08-13 | 숙련도 상승 — 내 손으로 공정을 돌릴 때마다 +3(상한 100). ⚠️ 직원 지시로는 안 오른다 | src/data/game.ts, src/store.ts(+test), src/employee.store.test.ts |
| 2026-08-13 | 숙련도 3종 — `apCost(base, skill)` 한 함수가 공정 비용을 깎는다(40+ −1, 80+ −2, 하한 1). 등급 축과 갈라 표시 | src/data/game.ts, src/store.ts(+test), src/programs/Figma·Photoshop·Ppt·Editor·Company.tsx |
| 2026-08-13 | 주말 돌발 의뢰 — 확률로 급한 의뢰가 오고 일할지 선택. 대가는 정신력이고 낮으면 다음 주 행동력 상한이 깎인다 | src/systems/weekend.ts(신규), src/data/game.ts(apMaxOf), src/store.ts(+test), src/programs/Schedule.tsx, src/components/Hud.tsx |
| 2026-08-13 | 파산 규칙 교체 — 잔액 음수가 아니라 **급여 3달 연속 밀림**(착수금·대출로 한 달은 버틴다). 정산 메일이 몇 달째인지 경고 | src/data/game.ts, src/systems/gameover.ts·money.ts, src/store.ts(+test) |
| 2026-08-13 | 회사레벨 — 누적 매출에서 파생해 **행동력 상한**을 민다(평판이 지는 회사등급과 다른 축, 줄지 않는다) | src/data/game.ts, src/store.ts(+test), src/programs/Company.tsx |
| 2026-08-13 | 게임 오버 둘 — 파산(정산 뒤 소지금 음수)·폐업(위기 4주). 판정은 순수 함수, 끝난 판은 주차가 안 흐른다 | src/systems/gameover.ts·components/GameOver.tsx(신규), src/store.ts(+test), src/App.tsx, src/index.css |
| 2026-08-13 | 직원 요청 — 휴가·급여협상·피드백·교육요청이 주차 넘김에 확률로 오고, 거절이 쌓이면 불만으로 퇴사 | src/systems/request.ts·seed.ts(신규), src/data/employees.ts, src/systems/employee.ts, src/store.ts(+test), src/programs/Messenger.tsx·messenger.css |
| 2026-08-13 | 직원 스탯에 **기획** 추가(4종) → 막혀 있던 미팅 파견 개방. 가는 사람의 기획력이 알아내는 키워드 수를 정한다 | src/data/employees.ts·keywords.ts, src/systems/employee.ts·hire.ts, src/store.ts(+test), src/programs/Figma.tsx·figma.css·Messenger.tsx·HireSite.tsx |
| 2026-08-13 | 직원 시스템 — 채용(인간인 공고→지원자)·지시(종류 제한, 등급은 직원 스탯)·급여(월말, 사람 수가 정본)·위기 퇴사 | src/data/employees.ts·systems/hire.ts·employee.ts·programs/HireSite.tsx(신규), Messenger.tsx, store.ts, money.ts |
