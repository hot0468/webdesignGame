# 변경 이력 (아카이브)

`CLAUDE.md`의 이력 표에서 밀려난 줄을 **한 줄 그대로** 이 파일 맨 위로 옮긴다.
코드에 앉힐 자리가 없는 결정(전역 방향 전환, 기각된 대안 전체)만 여기서 정본이 된다.

<!-- 밀려난 줄은 이 아래에 -->
| 2026-08-14 | **사이트 해금** — 브라우저 바로가기가 회사레벨로 잠긴다(쇼핑1·인간인2·어워더즈3·수주센터4). 잠긴 칸도 조건과 함께 보여 주고, 주소 직접 입력도 막는다 | src/systems/unlock.ts(+test 신규), src/data/sites.ts, src/programs/Browser.tsx·browser.css, src/store.ts(+test) |
| 2026-08-14 | 하네스 정비 — `--seed`를 실제로 살림(이중 인코딩·Page.enable 누락·산 페이지 덮어쓰기), 디버그 포트 9223 분리, 서버를 타이틀로 식별, 빌드 출력 207줄→12줄 | scripts/measure.mjs, vite.config.ts, package.json, shell.md |
| 2026-08-14 | 사내시스템 접속 정보에 **복사 버튼** — 옮겨 적는 수고만 던다(자동 입력은 안 한다). 클립보드가 없거나 거절하면 버튼을 안 그린다 | src/programs/Company.tsx, src/data/game.ts·icons.ts, src/index.css |
| 2026-08-14 | 3차 사냥 — 정산 메일의 사람별 급여가 **협상 인상분을 빼먹어** 줄의 합과 합계가 갈렸다(문안만 거짓). 죽은 `openableShortcut` 정리 | src/systems/money.ts(+test 신규), src/data/sites.ts, src/programs/Browser.tsx, src/systems/portfolio.ts |
| 2026-08-14 | 버그 넷 — 주말·입찰 **단가 배율이 대금에 안 붙던 것**(주말 근무가 순손해였다)·피드백이 `publishes`를 모름·죽은 새로고침·게임오버의 닿을 수 없는 안내 | src/systems/money.ts·weekend.ts·bidding.ts, src/store.ts(+test), src/components/GameOver.tsx, src/programs/Browser.tsx·Editor.tsx |
| 2026-08-14 | 퍼블리싱 스탯 — 그전엔 등급을 안 내 대충 해도 만족도가 같았다. 밴드 고정·칸만 스탯이 정하고 약한 고리에 들어간다 | src/data/game.ts, src/store.ts(+test), src/programs/Editor.tsx·Company.tsx |
| 2026-08-14 | **톡톡** — 클라이언트가 말을 거는 창(직원용 메신저와 다른 창·팔레트). 마감이 짧은 급한 의뢰가 오고 기존 수주 고리를 탄다 | src/programs/Talk.tsx·talk.css(신규), src/data/inbox.ts·programs.ts, src/App.tsx |
| 2026-08-14 | **모바일 반응형(720px)** — 창은 전체화면, 작업 표시줄이 앱 전환기. 계기판은 시간만 남기고 스탯·업무목록은 **독의 네이티브 팝오버**로(전체화면 창 위에서도 행동력이 읽힌다). 좁은 화면에서 창이 화면 밖에 태어나던 버그도 함께 고쳤다 | src/index.css, src/programs/mail·messenger·editor·figma·photoshop·browser.css, src/components/Taskbar.tsx·Hud.tsx·Desktop.tsx, src/data/game.ts(WINDOW_FIT), src/store.ts(+test), project-context(shell.md) |
| 2026-08-14 | **어워더즈** — 일 미루고 남의 수상작을 구경하는 자리. 행동력 1을 태우면 그 주 시안이 한 등급 좋아진다(남는 상태는 주차 한 칸이고 주가 넘으면 식는다) | src/programs/RefSite.tsx·systems/reference.ts(+test)(신규), src/data/reference.ts(신규), src/store.ts, src/data/sites.ts·icons.ts, src/programs/Browser.tsx·browser.css |
| 2026-08-14 | **작업물 창** — 만든 것(팝업·시안·문서)을 등급과 함께 모아 본다. A 이상이 몇 개인지가 곧 낙찰 확률 보정이고 화면·스토어가 같은 함수를 쓴다 | src/programs/Folder.tsx·folder.css·systems/portfolio.ts(신규), src/portfolio.store.test.ts(신규), src/data/bidding.ts·programs.ts, src/store.ts, src/programs/WorkSite.tsx, src/App.tsx |
| 2026-08-14 | **후속 요청 축** — 회신했는데 "다시 해 오세요"(`step`을 도로 내린다·대금 안 나감) · 업체 성격 4종(이름에서 파생) · 납품 2주 뒤 크로스브라우징 버그 신고(미래 주차를 단 메일) | src/data/followup.ts·systems/followup.ts(+test)(신규), src/store.ts(+test), src/components/JobActions.tsx |
| 2026-08-13 | CS 스탯을 살렸다 — 클레임 글의 `사과하기`가 행동력 1로 평판을 되돌린다(깎인 것보다 적게, 글마다 한 번) | src/data/game.ts·inbox.ts, src/systems/popup.ts, src/store.ts(+test), src/components/JobActions.tsx |
| 2026-08-13 | 유지보수 계약 — 그 업체 일을 2건 끝내면 맺을 수 있고 매달 정산에 수입이 선다(급여의 반대편) | src/data/game.ts, src/systems/money.ts, src/store.ts(+test), src/programs/Company.tsx, src/index.css |
| 2026-08-13 | **웹디몰** — 소지금이 사람 손으로 나가는 유일한 자리. 장비는 숙련도(한 번만), 소모품은 정신력. 상한이면 못 산다 | src/data/shop.ts·systems/shop.ts·programs/ShopSite.tsx(신규), src/store.ts, src/data/sites.ts·icons.ts, src/programs/Browser.tsx·browser.css |
| 2026-08-13 | 의뢰에 **도착 주차**(`week`) — 1주차는 메일·고객게시판 한 통씩으로 시작하고 주가 갈수록 늘어난다. `inbox`·`unreadCount`가 주차를 받는다 | src/data/inbox.ts(+test), src/programs/Mail.tsx·Company.tsx, src/components/Desktop.tsx·MessageList.tsx |
| 2026-08-13 | 첫 판에 **핀라이트 소개** 5장 — 화면을 어둡게 덮고 말하는 자리(메일·프로그램 줄·업무목록·주차 판)만 뚫는다. `seenIntro`가 세이브에 남아 한 번만 | src/components/Intro.tsx·data/intro.ts(신규), src/components/Desktop.tsx(data-*), src/store.ts, src/App.tsx, src/index.css |
| 2026-08-13 | 입찰은 **소기업 이상**만 — 공고별 조건과 다른 축의 문(평판이 떨어지면 다시 닫힌다). 초반 수주 경로를 메일 하나로 묶는다 | src/data/bidding.ts, src/systems/bidding.ts(+test), src/store.ts(+test), src/programs/WorkSite.tsx |
| 2026-08-13 | 인간인을 **구인 포털 얼개**로 — 메뉴 줄(표시) + 눕는 공고 판 + 지원자 카드 격자(880px, 큰 값은 월급 하나). 없는 토큰 `--sp-5`로 죽어 있던 판 셋의 padding도 살렸다 | src/programs/HireSite.tsx, src/programs/browser.css, project-context(shell.md) |
| 2026-08-13 | 브라우저 **뒤로·앞으로** — 방문 기록 한 줄에서 화면·주소·별이 전부 파생한다(새로고침은 안 쌓고, 뒤로 뒤 새 주소는 앞쪽을 버린다) | src/programs/Browser.tsx |
| 2026-08-13 | 일정 달력이 **그 주에 걸린 일**을 적는다 — 업무 마감(임박하면 빨강)과 직원 휴무가 주차 줄 아래에 눕는다 | src/programs/Schedule.tsx, src/index.css |
| 2026-08-13 | 수주센터를 **훑는 목록**으로 — 880px 카드에 본문 + 결정 칸(단가·확률만 크게), 규칙은 문단 대신 칩 한 줄. 포인트 색은 왼쪽 막대와 낙찰 확률에만 | src/programs/WorkSite.tsx, src/programs/browser.css, project-context(shell.md) |
| 2026-08-13 | 공정 실행에 **진행 막대 창** — 다 차면 `완성되었다!`와 등급이 뜬다(창 넷이 `useWorking()` 하나를 쓴다) | src/components/Working.tsx(신규), src/data/game.ts, src/index.css, src/programs/Ppt·Figma·Photoshop·Editor.tsx |
| 2026-08-13 | 미팅을 피그마에서 떼어 **채팅 창**으로 — 기획서를 제출해야 열리고, 대화가 한 줄씩 흐른 뒤 알아낸 키워드가 선다. 피그마는 `확인됨`만 표시 | src/components/Meeting.tsx(신규)·JobActions.tsx, src/data/keywords.ts·inbox.ts, src/systems/keywords.ts(+test), src/programs/Figma.tsx, src/index.css |
| 2026-08-13 | 입찰에 **기한**과 **익주 판정**을 붙였다 — 낙찰 메일의 `사업 시작`을 눌러야 업무가 되고, 메일 의뢰와 같은 고리를 탄다 | src/data/bidding.ts·systems/bidding.ts, src/store.ts(+test), src/components/JobActions.tsx, src/data/inbox.ts, src/programs/WorkSite.tsx |
| 2026-08-13 | 수주센터 — 조건(직원수·시안 장수·기획안 랭크)을 갖춰야 **입찰**하고, 낙찰 확률은 평판·능력치가 정한다. 추첨 씨앗은 공고 id | src/data/bidding.ts·systems/bidding.ts·programs/WorkSite.tsx(신규), src/store.ts(+test), src/data/sites.ts |
| 2026-08-13 | 숙련도 상승 — 내 손으로 공정을 돌릴 때마다 +3(상한 100). ⚠️ 직원 지시로는 안 오른다 | src/data/game.ts, src/store.ts(+test), src/employee.store.test.ts |
| 2026-08-13 | 숙련도 3종 — `apCost(base, skill)` 한 함수가 공정 비용을 깎는다(40+ −1, 80+ −2, 하한 1). 등급 축과 갈라 표시 | src/data/game.ts, src/store.ts(+test), src/programs/Figma·Photoshop·Ppt·Editor·Company.tsx |
| 2026-08-13 | 주말 돌발 의뢰 — 확률로 급한 의뢰가 오고 일할지 선택. 대가는 정신력이고 낮으면 다음 주 행동력 상한이 깎인다 | src/systems/weekend.ts(신규), src/data/game.ts(apMaxOf), src/store.ts(+test), src/programs/Schedule.tsx, src/components/Hud.tsx |
| 2026-08-13 | 파산 규칙 교체 — 잔액 음수가 아니라 **급여 3달 연속 밀림**(착수금·대출로 한 달은 버틴다). 정산 메일이 몇 달째인지 경고 | src/data/game.ts, src/systems/gameover.ts·money.ts, src/store.ts(+test) |
| 2026-08-13 | 회사레벨 — 누적 매출에서 파생해 **행동력 상한**을 민다(평판이 지는 회사등급과 다른 축, 줄지 않는다) | src/data/game.ts, src/store.ts(+test), src/programs/Company.tsx |
| 2026-08-13 | 게임 오버 둘 — 파산(정산 뒤 소지금 음수)·폐업(위기 4주). 판정은 순수 함수, 끝난 판은 주차가 안 흐른다 | src/systems/gameover.ts·components/GameOver.tsx(신규), src/store.ts(+test), src/App.tsx, src/index.css |
| 2026-08-13 | 직원 요청 — 휴가·급여협상·피드백·교육요청이 주차 넘김에 확률로 오고, 거절이 쌓이면 불만으로 퇴사 | src/systems/request.ts·seed.ts(신규), src/data/employees.ts, src/systems/employee.ts, src/store.ts(+test), src/programs/Messenger.tsx·messenger.css |
| 2026-08-13 | 직원 스탯에 **기획** 추가(4종) → 막혀 있던 미팅 파견 개방. 가는 사람의 기획력이 알아내는 키워드 수를 정한다 | src/data/employees.ts·keywords.ts, src/systems/employee.ts·hire.ts, src/store.ts(+test), src/programs/Figma.tsx·figma.css·Messenger.tsx·HireSite.tsx |
| 2026-08-13 | 직원 시스템 — 채용(인간인 공고→지원자)·지시(종류 제한, 등급은 직원 스탯)·급여(월말, 사람 수가 정본)·위기 퇴사 | src/data/employees.ts·systems/hire.ts·employee.ts·programs/HireSite.tsx(신규), Messenger.tsx, store.ts, money.ts |
| 2026-08-13 | 직원 교육 — 레벨을 올리는 유일한 길(돈 + 그 사람의 1주 점유), 레벨 +1과 세 스탯 +5가 한 자리에서 오른다 | src/data/employees.ts, src/systems/employee.ts(+test), src/store.ts(+test), src/programs/Messenger.tsx·messenger.css |
| 2026-08-13 | 시안 키워드 — 미팅(행동력 1)에서 기획력만큼 알아내고, 적중 수가 시안 등급을 민다. 정답은 업무 id 시드로 파생(저장 안 함) | src/data/keywords.ts·systems/keywords.ts(신규), systems/craft.ts, programs/Figma.tsx, store.ts |
| 2026-08-13 | 작업 표시줄 시작 버튼 — 이름 있는 세이브 슬롯 3칸(자동저장 위에 얹는다), 되돌릴 수 없는 일은 포털 확인창이 묻는다 | src/systems/save.ts·components/StartMenu.tsx(신규), Taskbar.tsx, store.ts, index.css |
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
