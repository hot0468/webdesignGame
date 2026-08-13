# 변경 이력 (아카이브)

`CLAUDE.md`의 이력 표에서 밀려난 줄을 **한 줄 그대로** 이 파일 맨 위로 옮긴다.
코드에 앉힐 자리가 없는 결정(전역 방향 전환, 기각된 대안 전체)만 여기서 정본이 된다.

<!-- 밀려난 줄은 이 아래에 -->
| 2026-08-12 | 회사등급 5단(극소~대) — 평판에서 파생하는 표 하나가 채용 상한을 지고, 회사현황 맨 위에 선다 | src/data/game.ts(+test), src/programs/Company.tsx, project-context |
| 2026-08-12 | 계기판의 `다음 주` 버튼 제거 — 주차를 미는 자리가 없어졌다(`advanceWeek`는 남아 있다) | src/components/Hud.tsx, src/index.css |
| 2026-08-12 | 바탕화면에 `PPT` 아이콘 — 창은 아직 빈 상태다(업무에 종류 칸이 생기면 포토샵처럼 목록+퀄리티를 갖는다) | src/programs/Ppt.tsx(신규), src/data/programs.ts, src/App.tsx |
| 2026-08-12 | 제작 퀄리티 세 갈래 — 간단하게/열심히/매우 신경써서로 행동력과 등급대(F~SSS)가 갈리고, 밴드 안 칸은 디자인 스탯이 정한다. 피그마 속성 패널에 시안 만들기 추가 | src/systems/craft.ts(신규), src/data/game.ts, src/store.ts, src/programs/Figma.tsx·Photoshop.tsx(+css) |
| 2026-08-12 | 퍼블리싱 고리 — 에디터에서 FTP 연결(업체 정보 대조) → 업체 폴더 → 남은 업무 클릭 = 실행(행동력 2, 업무 완료) | src/systems/ftp.ts(신규), src/store.ts, src/programs/Editor.tsx·editor.css, src/data/game.ts·icons.ts, project-context |
| 2026-08-12 | `포토샵`을 실제 포토샵처럼 — 도구 막대·문서 탭·아트보드·레이어 패널(CC Dark). 셸 언어 `.ps*`는 index.css에서 걷어냈다 | src/programs/Photoshop.tsx·photoshop.css(신규), src/index.css, src/data/icons.ts·programs.ts |
| 2026-08-12 | `에디터`를 실제 VS코드처럼 — 활동 표시줄·탐색기·시작 화면·상태 표시줄, 어두운 창(Dark+ 값). 사이트 업무가 작업 폴더로 선다 | src/programs/Editor.tsx·editor.css(신규), src/data/icons.ts·programs.ts, project-context(shell.md) |
| 2026-08-12 | 브라우저 즐겨찾기 — 도착한 주소에 별을 켜면 주소창 아래 줄에 선다(업체 관리자 반복 방문용) · 첫화면 바로가기는 수주센터·인간인·쇼핑 | src/store.ts, src/systems/url.ts, src/programs/Browser.tsx·browser.css, src/data/sites.ts·icons.ts |
| 2026-08-12 | `피그마`를 실제 파일 브라우저처럼 — 사이드바 + 파일 그리드, 팝업 아닌 업무가 시안 파일로 선다 | src/programs/Figma.tsx·figma.css(신규), src/data/icons.ts·programs.ts |
| 2026-08-12 | 마감·팝업 게시 기간을 "몇째 주"가 아니라 **날짜**로 — `formatDate`/`formatPeriod`, 의뢰문 옆에 게시 기간을 못 박는다 | src/systems/calendar.ts, src/components/JobActions.tsx·Hud.tsx, src/programs/AdminSite.tsx·Photoshop.tsx |
| 2026-08-12 | `메신저`를 카카오톡 PC처럼 — 레일·채팅 목록·대화 칸 세 칸, 자기 팔레트. 대화 상대는 **직원**(채용 전이라 목록은 빈 상태) | src/programs/Messenger.tsx·messenger.css(신규), src/data/icons.ts·programs.ts, project-context |
| 2026-08-12 | 팝업 고리 완성 — 포토샵 제작 → 관리자 페이지 등록·기간수정 → 주차 넘김에 판정, 어긋나면 클레임 메일 + 평판 하락 | src/systems/popup.ts(신규), src/programs/Photoshop.tsx·AdminSite.tsx, src/store.ts(advanceWeek), src/components/Hud.tsx |
| 2026-08-12 | 업체 관리자 페이지 — 주소창에 관리자 URL을 쳐서 들어가고, 로그인 뒤 팝업등록이 행동력을 먹는다 | src/systems/url.ts(신규), src/programs/AdminSite.tsx(신규)·Browser.tsx, src/store.ts, src/data/game.ts |
| 2026-08-12 | `브라우저` 첫화면 — 가짜 포털(검색창 + 바로가기 칸), 자기 팔레트(뉴트럴+링크블루) · measure에 `--type` | src/programs/Browser.tsx·browser.css(신규), src/data/sites.ts(신규), scripts/measure.mjs |
| 2026-08-12 | 마감을 남은 주가 아니라 **날짜**로 — `formatWeek`이 업무목록·수주 버튼 양쪽을 적는다 | src/systems/calendar.ts, src/components/Hud.tsx·JobActions.tsx |
| 2026-08-12 | 모든 의뢰에 마감 — 수주 시점에 `job.due`로 굳고, 업무목록에서 임박하면 빨갛게 선다 | src/data/inbox.ts(Request/Ad 갈래), src/store.ts, src/components/Hud.tsx·JobActions.tsx |
| 2026-08-12 | 업무목록을 스탯 판 아래 별도 판으로 · 완료 취소선은 `completeJob`이 붙인다 · 사내시스템도 `app` 크기 · 아이콘 두 줄(피그마·포토샵·메신저·에디터 추가) · 고객게시판은 확인 버튼 하나 | src/components/Hud.tsx·Desktop.tsx·JobActions.tsx, src/programs/Figma.tsx·Photoshop.tsx·Messenger.tsx·Editor.tsx(신규), src/data/programs.ts |
| 2026-08-11 | 의뢰 수주 — 메일·고객게시판의 견적보내기/거절하기 + 계기판 맨 아래 업무목록(완료 취소선) | src/store.ts, src/components/JobActions.tsx(신규), src/components/Hud.tsx, src/index.css |
| 2026-08-11 | 창은 위쪽 기준(y 24)으로 뜨고, 주차·스탯 판은 창 **아래** 층으로 내렸다 | src/data/game.ts, src/index.css, project-context(shell.md) |
| 2026-08-11 | `메일`을 실제 아웃룩처럼 — 세 칸(폴더·목록·읽는 칸) + 자기 Fluent 팔레트 + 창 크기 등급 `size: app` | src/programs/Mail.tsx, src/programs/mail.css(신규), src/components/Window.tsx, src/index.css |
| 2026-08-11 | 의뢰 받는 곳 — `메일` 창(신규 의뢰) + 사내시스템 `고객게시판`(유지보수), 안 읽은 수는 아이콘 뱃지 | src/data/inbox.ts(신규), src/programs/Mail.tsx(신규), src/components/MessageList.tsx(신규), src/programs/Company.tsx |
| 2026-08-11 | `일정`을 달력 격자로 + 주차를 스탯 판 왼쪽의 별도 판으로 분리 + HUD 막대 3색(행동력 눈금 칸·주황 / 정신력 초록 / 평판 남보라) — 팔레트에 `--color-success` 추가 | src/programs/Schedule.tsx, src/components/Hud.tsx, src/systems/calendar.ts(신규) |
| 2026-08-11 | 사내시스템에 업체 3곳 추가 — 사이드바는 화면만, 업체 목록은 본문 칩 + measure가 dev 서버 탭을 골라 붙는다 | src/data/company.ts, src/programs/Company.tsx, scripts/measure.mjs |
| 2026-08-11 | `사내시스템`을 백오피스형으로 완성 — 사이드바(회사현황·업체정보) + `.window--wide` 실제 동작 | src/programs/Company.tsx, src/index.css, project-context |
| 2026-08-11 | `사내시스템`·`브라우저` 창 추가 — 평판 게이지가 위기선까지의 거리를 보여준다 | src/programs/, src/data/, src/index.css |
| 2026-08-10 | 스택(Vite+React+TS+zustand) 설치 + OS 셸 첫 화면 — 바탕화면·작업 표시줄(창 목록)·오른쪽 위 스탯 패널·공용 창·`일정` 창 | src/, scripts/(아이콘 서브셋·CDP 실측 이식), project-context(shell.md 신규) |
| 2026-08-10 | 두 번째 게임 오버 — 평판이 바닥에 4주 붙어 있으면 수주가 끊기고 직원이 떠나 폐업한다 | docs/superpowers/specs/2026-08-10-webdi-core-design.md(§4·§7), project-context(설계 결정표) |

| 2026-08-10 | 코어 설계 확정 — 무한 샌드박스 · 행동력이 곧 시간 · 업무는 공정의 줄 · 직원은 주차로 일한다 | docs/superpowers/specs/2026-08-10-webdi-core-design.md, project-context(설계 결정표) |
| 2026-08-09 | 하네스 세팅 — windowsGame의 검증된 파이프라인을 이식하고 기획을 정본으로 박음 | .claude(agents 2·skills 3), CLAUDE.md, AGENTS.md, docs/SPEC.md, .gitignore |
