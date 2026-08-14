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
| 2026-08-14 | **사이트 해금** — 브라우저 바로가기가 회사레벨로 잠긴다(쇼핑1·어워더즈2·인간인3·수주센터4). 잠긴 칸도 조건과 함께 보여 주고, 주소 직접 입력도 막는다 | src/systems/unlock.ts(+test 신규), src/data/sites.ts, src/programs/Browser.tsx·browser.css, src/store.ts(+test) |
| 2026-08-14 | 하네스 정비 — `--seed`를 실제로 살림(이중 인코딩·Page.enable 누락·산 페이지 덮어쓰기), 디버그 포트 9223 분리, 서버를 타이틀로 식별, 빌드 출력 207줄→12줄 | scripts/measure.mjs, vite.config.ts, package.json, shell.md |
| 2026-08-14 | 사내시스템 접속 정보에 **복사 버튼** — 옮겨 적는 수고만 던다(자동 입력은 안 한다). 클립보드가 없거나 거절하면 버튼을 안 그린다 | src/programs/Company.tsx, src/data/game.ts·icons.ts, src/index.css |
| 2026-08-14 | 3차 사냥 — 정산 메일의 사람별 급여가 **협상 인상분을 빼먹어** 줄의 합과 합계가 갈렸다(문안만 거짓). 죽은 `openableShortcut` 정리 | src/systems/money.ts(+test 신규), src/data/sites.ts, src/programs/Browser.tsx, src/systems/portfolio.ts |
| 2026-08-14 | 버그 넷 — 주말·입찰 **단가 배율이 대금에 안 붙던 것**(주말 근무가 순손해였다)·피드백이 `publishes`를 모름·죽은 새로고침·게임오버의 닿을 수 없는 안내 | src/systems/money.ts·weekend.ts·bidding.ts, src/store.ts(+test), src/components/GameOver.tsx, src/programs/Browser.tsx·Editor.tsx |
| 2026-08-14 | 퍼블리싱 스탯 — 그전엔 등급을 안 내 대충 해도 만족도가 같았다. 밴드 고정·칸만 스탯이 정하고 약한 고리에 들어간다 | src/data/game.ts, src/store.ts(+test), src/programs/Editor.tsx·Company.tsx |
| 2026-08-14 | **톡톡** — 클라이언트가 말을 거는 창(직원용 메신저와 다른 창·팔레트). 마감이 짧은 급한 의뢰가 오고 기존 수주 고리를 탄다 | src/programs/Talk.tsx·talk.css(신규), src/data/inbox.ts·programs.ts, src/App.tsx |
| 2026-08-14 | **모바일 반응형(720px)** — 창은 전체화면, 작업 표시줄이 앱 전환기. 계기판은 시간만 남기고 스탯·업무목록은 **독의 네이티브 팝오버**로(전체화면 창 위에서도 행동력이 읽힌다). 좁은 화면에서 창이 화면 밖에 태어나던 버그도 함께 고쳤다 | src/index.css, src/programs/mail·messenger·editor·figma·photoshop·browser.css, src/components/Taskbar.tsx·Hud.tsx·Desktop.tsx, src/data/game.ts(WINDOW_FIT), src/store.ts(+test), project-context(shell.md) |
| 2026-08-14 | **어워더즈** — 일 미루고 남의 수상작을 구경하는 자리. 행동력 1을 태우면 그 주 시안이 한 등급 좋아진다(남는 상태는 주차 한 칸이고 주가 넘으면 식는다) | src/programs/RefSite.tsx·systems/reference.ts(+test)(신규), src/data/reference.ts(신규), src/store.ts, src/data/sites.ts·icons.ts, src/programs/Browser.tsx·browser.css |
| 2026-08-14 | **작업물 창** — 만든 것(팝업·시안·문서)을 등급과 함께 모아 본다. A 이상이 몇 개인지가 곧 낙찰 확률 보정이고 화면·스토어가 같은 함수를 쓴다 | src/programs/Folder.tsx·folder.css·systems/portfolio.ts(신규), src/portfolio.store.test.ts(신규), src/data/bidding.ts·programs.ts, src/store.ts, src/programs/WorkSite.tsx, src/App.tsx |


