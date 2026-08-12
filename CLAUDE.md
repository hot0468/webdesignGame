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
| 2026-08-13 | 돈이 도는 고리 — 완료 회신이 대금·평판을 주고, 마감 초과는 계약 파기, 월말엔 유지보수보고서로 고정 지출. 세이브(`webdi.save.v1`)까지 | src/systems/money.ts(신규)·pipeline.ts, src/data/game.ts, src/store.ts(+test, persist), src/components/Hud.tsx·JobActions.tsx |
| 2026-08-13 | `다음 주` 버튼을 되살리고 **묻는 창**을 붙였다(포털 · `window.confirm` 금지) — 행동력을 다 써도 그 주에 머물 수 있으므로 넘기는 것은 늘 선택이다 | src/components/Hud.tsx, src/index.css, project-context |
| 2026-08-13 | 공정의 줄 + 회신 고리 — 업무에 `kind`·`step`·`replied`, 창은 자기 차례만, 회신해야 다음 공정이 열리고 마지막 회신에 만족도 메일이 온다 | src/systems/pipeline.ts(+test, 신규), src/store.ts(+test), src/data/inbox.ts·company.ts, src/programs/Ppt.tsx·Figma·Photoshop·Editor, src/components/JobActions.tsx·MessageList.tsx |
| 2026-08-12 | 바탕화면 바닥에 물결 두 겹 — CSS 의사요소만으로(큰 원을 돌린다), reduced-motion에서는 멈춘다 | src/index.css, project-context(shell.md) |
| 2026-08-12 | 회사등급 5단(극소~대) — 평판에서 파생하는 표 하나가 채용 상한을 지고, 회사현황 맨 위에 선다 | src/data/game.ts(+test), src/programs/Company.tsx, project-context |
| 2026-08-12 | 계기판의 `다음 주` 버튼 제거 — 주차를 미는 자리가 없어졌다(`advanceWeek`는 남아 있다) | src/components/Hud.tsx, src/index.css |
| 2026-08-12 | 바탕화면에 `PPT` 아이콘 — 창은 아직 빈 상태다(업무에 종류 칸이 생기면 포토샵처럼 목록+퀄리티를 갖는다) | src/programs/Ppt.tsx(신규), src/data/programs.ts, src/App.tsx |
| 2026-08-12 | 제작 퀄리티 세 갈래 — 간단하게/열심히/매우 신경써서로 행동력과 등급대(F~SSS)가 갈리고, 밴드 안 칸은 디자인 스탯이 정한다. 피그마 속성 패널에 시안 만들기 추가 | src/systems/craft.ts(신규), src/data/game.ts, src/store.ts, src/programs/Figma.tsx·Photoshop.tsx(+css) |
| 2026-08-12 | 퍼블리싱 고리 — 에디터에서 FTP 연결(업체 정보 대조) → 업체 폴더 → 남은 업무 클릭 = 실행(행동력 2, 업무 완료) | src/systems/ftp.ts(신규), src/store.ts, src/programs/Editor.tsx·editor.css, src/data/game.ts·icons.ts, project-context |
| 2026-08-12 | `포토샵`을 실제 포토샵처럼 — 도구 막대·문서 탭·아트보드·레이어 패널(CC Dark). 셸 언어 `.ps*`는 index.css에서 걷어냈다 | src/programs/Photoshop.tsx·photoshop.css(신규), src/index.css, src/data/icons.ts·programs.ts |
