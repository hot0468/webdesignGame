# 셸 (바탕화면·창·작업 표시줄) + 토큰 + 실측

> **언제 읽나:** 화면을 고치거나 새 프로그램 창을 붙일 때 읽는다.
> **토큰 값의 정본은 `src/index.css`다** — 여기에 값을 베껴 적지 않는다. 여기 적는 것은 파일만 봐서는 안 보이는 규칙뿐이다.

## 시각 언어 출처 (다시 고르지 말 것)
- 팔레트: `ui-ux-pro-max` colors.csv **"Educational App — playful indigo + energetic orange"**. accent는 그쪽에서 이미 WCAG 3:1로 조정된 값이다
- 여기에 **`--color-success`(초록) 한 색만 더했다** — 같은 DB의 "Remote Work/Collaboration Tool"이 같은 인디고에 붙여 쓰는 값이다. 막대 구분용이고 **면으로만** 쓴다. ⚠️ 넷째 색을 감으로 고르지 말고 그때 DB를 다시 열 것
- 스타일: styles.csv **"Vibrant & Block-based"** — 블록 · 높은 대비 · 둥근 모서리 · 200~300ms. ⚠️ 안티패턴이 **"평평한 2D"**라서 창·작업 표시줄은 실제 elevation을 가진다
- 타이포: 디스플레이 **Jua**(400 하나뿐 — bold 지정하지 말 것) / 본문 **Noto Sans KR Variable**. 둘 다 npm 자체 호스팅(**CDN 금지**). ⚠️ 형제 프로젝트의 Pretendard를 들이지 않는다

## 대비 규칙 (측정값 — 다시 재지 말 것)
- `--color-muted-foreground`는 **카드(`--color-card`) 안에서만** 쓴다. 4.76:1로 통과하지만 `--color-background` 위에서는 **4.26:1로 미달**이다. 바탕화면·작업 표시줄 글자는 `--color-foreground`
- **`--color-accent` 위에 소형 글자를 얹지 않는다**(흰 글자 3.56:1). accent는 테두리·강조 면으로만 쓴다

## 셸 구조
- `Desktop`이 배경 + 아이콘 그리드 + 창 레이어 + `Taskbar` + `Hud`를 담는다
- **작업 표시줄은 시작 버튼 + 열린 창 목록**을 진다. ⚠️ 시작 버튼이 여는 것은 **세이브뿐**(`StartMenu`) — 프로그램 목록을 여기 또 만들지 말 것(여는 자리는 바탕화면 아이콘 하나다) 오른쪽 위 `Hud`가 **주차 판 + (스탯 판·업무목록 판)** 을 진다. ⚠️ 스탯·업무목록을 바탕화면 아이콘/창으로 빼지 말 것 — 항상 보여야 하는 계기판이다
- 주차 판의 `다음 주`는 **묻는 창**(`.confirm`)을 띄운다. ⚠️ `window.confirm` 금지 — 가짜 OS의 시각 언어를 깨고 **JS를 멈춰 세워** 실측 하네스가 클릭도 스크린샷도 못 한다. ⚠️ 그 창은 `body`로 **포털**한다(계기판은 창이 덮는 층이라 안에 그리면 열린 창 뒤로 숨는다)
- `Hud`는 **창이 아니다**(공용 `Window` 미사용). 닫거나 옮길 수 있으면 상태를 못 보는 판이 생기고 다시 여는 경로도 없다
- ⚠️ 업무목록은 **스탯과 다른 판**이다(같은 칸에 세로로 선다) — 스탯은 늘 네 줄이고 업무는 늘어나는 목록이라, 한 판이면 스탯이 어디서 끝나는지가 흐려진다. 폭 상한은 `.hud__col`이 진다
- ⚠️ **작업 표시줄과 `Hud`는 창 레이어 밖에 둔다.** 안에 넣으면 `--z-taskbar`가 창 레이어의 스택 컨텍스트에 갇혀 뜻을 잃는다
- 층은 **taskbar(1000) < startmenu(1100) < confirm(1200)** 순서 하나다. 시작 메뉴는 작업 표시줄에서 솟으므로 그 위, 되돌릴 수 없는 일을 묻는 창은 **맨 앞**이다(메뉴도 못 누르게 덮어야 답이 하나로 정해진다). ⚠️ 새 층은 감으로 숫자를 올리지 말고 `--z-*`에 이름을 붙여 끼운다
- 시작 메뉴도 `body`로 **포털**한다(작업 표시줄 안에 그리면 56px 막대에 갇힌다). 바깥 클릭(scrim)·Escape로 닫히되 **묻는 중에는 닫히지 않는다** — 질문이 먼저 답을 받는다
- ⚠️ 묻는 창의 scrim 때문에 `--scan`이 **뒤에 깔린 글자를 전부 미달로 보고한다**(`rgb(173,173,173)` 위로 합성된다). 일부러 흐린 것이므로 허보다 — 창에 가린 계기판과 같은 건이다
- ⚠️ 둘의 **z는 다르다**: 작업 표시줄은 `--z-taskbar`(항상 위), `Hud`는 `--z-desktop`(**창이 덮는다**). 계기판을 창 위로 되돌리지 말 것 — 큰 창의 오른쪽 위 내용을 가린다. 가려진 계기판은 창을 닫거나 옮겨서 본다
- 창은 **위쪽 기준**으로 뜬다(`WINDOW_SPAWN.y` = 24, 바탕화면 아이콘과 같은 여백) — 큰 창일수록 아래로 쓸 높이가 필요하다
- ⚠️ `Hud`가 글자를 실을 수 있는 것은 **판이 `--color-card`이기 때문**이다. 판을 없애고 바탕화면에 직접 얹으면 AA 미달이 된다
- ⚠️ 창 레이어는 `inset:0` 오버레이다. `pointer-events:none`(자식만 `auto`)이 아니면 **바탕화면 아이콘 클릭을 삼킨다**
- 바탕화면 아이콘은 **단일 클릭**으로 연다(터치·게임 친화). ⚠️ windowsGame은 더블클릭이라 `measure.mjs --dblclick`이 여기서는 아무 일도 안 하면서 `ok`를 찍는다 — `--click`을 쓴다
- 바탕화면 바닥의 **물결은 `.desktop`의 `::before`/`::after`** 두 겹이다(커다란 원을 돌린다 — 이미지·JS·캔버스 없음). ⚠️ `isolation: isolate` + `z-index: -1`이 짝이다(빼면 배경 뒤로 숨거나 아이콘을 덮는다) · `pointer-events: none` · **`prefers-reduced-motion`에서 멈춘다** · 원이 화면 폭의 세 배를 넘으면 가장자리가 직선처럼 펴진다
- 아이콘은 창이 실제로 열리는 프로그램만 그린다(`PROGRAMS`가 단일 출처). `VIEWS`가 `Record<ProgramId, ...>`라서 짝을 빼먹으면 타입 검사가 잡는다
- 아이콘은 **두 줄**이다: 왼쪽 = 회사를 굴리는 창(메일·일정·사내시스템·브라우저), 오른쪽 = 손으로 만드는 프로그램(피그마·포토샵·PPT·메신저·에디터). ⚠️ 줄은 `PROGRAMS.col`이 정한다 — `Desktop`에서 id를 나열해 가르지 말 것. `satisfies`가 `col` 빠진 항목에서 빌드를 실패시킨다
- 내용이 아직 없는 창은 **`.empty` 빈 상태**를 쓴다 — 갈 데 없는 주소창·링크·버튼을 그리는 대신 무엇이 생기면 여기 뜨는지 적는다(`Browser.tsx`가 예시)
- 창 내용은 **계기판과 겹치는 숫자를 다시 늘어놓지 않는다.** 계기판의 평판 막대는 **양**만 보이고, **위기선까지의 거리는 `Company.tsx`만** 가진다
- 계기판 막대는 둘로 갈린다: 연속량(정신력·평판)은 `Bar`, **정수 자원(행동력)은 칸으로 세는 `Ticks`** — 행동력을 연속 막대로 바꾸지 말 것
- 막대 색은 **행동력 accent(주황) · 정신력 success(초록) · 평판 primary(남보라)** 로 고정이다. ⚠️ **밝기가 아니라 색상으로 가른다** — primary/secondary는 같은 인디고라 8px 막대에서 구분이 안 됐다(되돌리지 말 것)
- 상한이 없는 값(소지금)은 막대를 주지 않는다 — 채울 끝이 없다. 그래서 목록 맨 아래에 둔다
- ⚠️ 계기판의 폭은 `.hud__col`의 `max-width`(320px)가 진다. **`.stat__value`는 `white-space: nowrap`이라 거기에 글자를 이어 붙이면 판이 화면 오른쪽 밖으로 밀려난다** — 값 옆에 덧붙일 말(정신력이 깎는 행동력 등)은 막대와 같은 자리에 **자기 줄로** 세운다(`.stat__warn`)
- ⚠️ 업무목록 한 줄에서 **줄임표를 무는 것은 `.job__title` 하나다**(업체 이름·마감은 안 줄어든다 — 누가 준 일인지가 제목보다 먼저 사라지면 목록을 훑는 뜻이 없다). 그래서 **의뢰 제목을 길게 쓰지 않는다**: 제목이 길면 그 줄의 최소 폭이 판을 밀어낸다
- 업무목록 판은 **읽는 목록이다.** 줄마다 남은 마감 주가 서고, 임박하면 `destructive`로 굵어진다(색만으로 말하지 않게 숫자를 함께 준다). ⚠️ 취소선은 `completeJob`이 붙인다 — 사람이 켜는 체크박스를 달지 말 것. 완료는 취소선 + 색 죽이기 + 표식 셋이 함께 말한다(취소선만으로는 약하다)
- 새 글 뱃지(`.badge`)는 **`destructive` + 카드색 테두리**다. ⚠️ accent 위에는 숫자를 얹지 못하고(3.56:1), 테두리를 빼면 선택된 메뉴(primary)와 바탕화면 위에서 빨강이 배경에 묻는다
- 뱃지가 세는 것은 **스토어 `readIds` 하나**다. 읽음은 **글을 펼칠 때** 붙는다 — 창을 여는 것만으로 처리하면 뱃지가 열자마자 사라져 무엇이 새 글이었는지 알 수 없다

## 창
- 모든 창 UI는 공용 `Window`를 쓴다. 이동은 **transform으로만**
- **포커스는 별도 필드가 아니라 `z` 최대값에서 파생**한다(`focusedWindowId`). 관계를 한 방향으로만 적는다
- `moveWindow`는 화면 크기를 **인자로 받는다** — 스토어는 DOM을 모른다. 상한 clamp(`WINDOW_DRAG.keepVisible`)가 없으면 창이 작업 표시줄 밑으로 들어가 타이틀바를 못 잡는다
- 창 크기는 `PROGRAMS`의 `size`가 정한다 — 없으면 기본 440px(지금은 `일정`뿐), `app`은 자기 화면을 가진 큰 프로그램(나머지 전부). `app`은 `.window__body` 패딩을 걷으므로 **내용 쪽이 자기 패딩을 진다**
- ⚠️ `app`은 **높이도 고정**한다 — 내용은 `height:100%` + 안쪽 칸이 각자 `overflow-y:auto`로 구른다(창이 작업 표시줄을 뚫지 않게)
- 프로그램 창이 **자기 팔레트를 가지는 예외**의 실례가 `Mail`이다(`src/programs/mail.css` — Fluent/WinUI 값 + Segoe UI). ⚠️ 그 안에서 셸 토큰(`.badge`·`.empty` 등)을 섞어 쓰지 않는다 — 두 팔레트가 한 창에 서면 둘 다 무너진다
- `Photoshop`도 같은 예외다(`src/programs/photoshop.css` — Photoshop CC Dark). ⚠️ 강조색(Adobe 파랑)은 **행동력을 무는 제작 버튼 하나**에만 선다 — 어두운 창에서 색이 여러 곳에 서면 어디를 눌러야 하는지가 흐려진다
- 셋째 사례가 `Figma`다(`src/programs/figma.css` — 캔버스 뉴트럴 + 시스템 글꼴). ⚠️ **액센트 색을 들이지 않는다** — 제작 버튼은 팔레트의 가장 진한 값(썸네일 캔버스와 같은 값)으로 채운다. 사이드바 메뉴는 button이 아니라 표시다(갈 화면이 하나뿐). ⚠️ 고른 카드를 회색 면으로 칠하지 말 것 — 그 위에서 부제가 4.0:1로 미달한다(흰 면 + 진한 테두리로 말한다)
- `Ppt`도 같은 예외다(`src/programs/ppt.css` — Office/PowerPoint 밝은 테마 값 + 시스템 글꼴). 게임 기능이 파워포인트의 자리에 그대로 앉는다: **리본 = 제작 버튼 셋** · **왼쪽 레일 = 자기 차례인 업무** · **캔버스 = 그 업무의 문서 한 장** · **상태 표시줄 = 회신 안내와 문서 수**. ⚠️ 리본 **탭 줄과 상태 표시줄의 보기·확대**는 표시다(button 아님 · `aria-hidden`). ⚠️ 슬라이드 바깥 회색(#D2D0CE)에는 **글자를 얹지 않는다** — 흰 종이와 크롬만 글자를 진다
- 같은 예외의 둘째 사례가 `Browser`다(`src/programs/browser.css` — 뉴트럴 그레이 + 링크 블루 + 시스템 글꼴). ⚠️ **크롬(주소 표시줄)은 무채색으로 물러난다** — 브라우저 UI가 색을 가지면 그 안의 사이트가 색을 못 가진다. 파랑은 링크와 초점, 그리고 **사이트 안의 주된 버튼**(`.nv-site__go`)에만 선다
- ⚠️ 사이트라고 다 같은 폭이 아니다: **폼 화면**(관리자 로그인·팝업 등록)은 `.nv-site__panel`의 한 단(420px), **훑어 비교하는 목록**(수주센터 `.nv-bid*`, 채용사이트 `.nv-hire*`)은 880px이다 — 수주센터는 본문+결정 칸 두 단, 채용사이트는 카드 격자(`auto-fill minmax(240px,1fr)`). 목록에 폼 폭을 씌우면 공고마다 회색 줄이 세로로 쌓여 비교가 안 된다 — 반대로 `.nv-site__panel`을 넓히면 관리자 폼까지 같이 넓어진다
- ⚠️ `--sp-5`는 **없는 토큰이다**(정의는 1·2·3·4·6·8·12뿐). 쓰면 그 선언이 통째로 죽어 padding이 0이 된다 — 겪었다. 새 값이 필요하면 감으로 만들지 말고 있는 토큰을 고른다
- 브라우저 안의 **사이트**(업체 관리자 등)는 `.nv-site*`로 산다 — 자기 표면(흰 판)은 가지되 **색은 `--nv-*` 안에서 끝낸다**. ⚠️ 이 팔레트에 빨강이 없으므로 실패·경고는 색이 아니라 **아이콘 + 글자**가 말한다
- 주소 표시줄은 **입력칸 + 이동 버튼**이다. ⚠️ 엔터만으로 끝내지 말 것 — 이 게임은 마우스로 굴러가고, 실측 하네스에도 Enter가 없다(`--click .nv__go`로 이동을 재현한다)
- ⚠️ `--type`의 값은 **첫 `=`에서 갈린다** — `input[type=password]` 같은 셀렉터를 주면 조용히 엉뚱한 글자가 들어간다. 클래스로 집을 것(`.nv-site__field:last-of-type .nv-site__input`)
- ⚠️ 두 창 모두 **글꼴을 자기 CSS에서 끊는다.** 셸의 Jua(디스플레이)가 상속되면 그 순간 게임 UI로 보인다
- ⚠️ 사이드바는 **화면만** 진다. 개수가 늘어나는 목록(업체 등)은 본문 안에 둔다 — 사이드바에 쌓으면 메뉴가 창 높이를 민다
- ⚠️ 창 안에서 **고른 메뉴는 `useState`**다. 스토어에 넣으면 세이브에 들어가고, 창을 보는 방식 때문에 세이브 버전을 올리게 된다

## 실측 (`scripts/measure.mjs`, windowsGame에서 이식 — 의존성 0)
```
node scripts/measure.mjs --reduced --click .desktop-icon --scan --shot out.png
```
- `--scan`은 **AA 미달만** 보고한다. 함정은 전부 그 파일 주석에 있다 — **다시 알아내지 말 것**
- 폼은 `--type "<셀렉터>=<값>"`으로 채운다(클릭과 **같은 순서 큐**). ⚠️ React 제어 input이라 `el.value=x`는 무시된다 — 그 배선은 스크립트가 이미 진다
- ⚠️ `--scan`은 **가림을 모른다.** 창이 `Hud`를 덮으면 보이지도 않는 주차 글자를 창 타이틀바 색(primary)에 합성해 미달로 보고한다 — 그 건은 허보다. 스크린샷에서 그 글자가 보이는지부터 확인하라
- ⚠️ 측정용 크롬은 **시작 페이지(zum.com)를 같이 연다.** 그 탭에 붙으면 출력 없이 매달리므로 `connect()`가 dev 서버 탭을 골라 붙는다 — **첫 `page` 타깃을 집는 코드로 되돌리지 말 것**
- 그래도 크롬을 죽여야 하면 측정용만 골라 죽인다 — ⚠️ `Stop-Process -Name chrome`은 **사용자의 진짜 브라우저까지 죽이므로 금지**:
  ```powershell
  Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -match 'webdi-cdp' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
  ```

## 모바일 (720px 이하) — 한 번에 앱 하나

- 폰에는 겹치는 창이 없다. 그래서 데스크톱의 떠다니는 창을 **줄여 그리지 않고** 통째로 바꾼다:
  **창은 전체화면**(`.window`가 `inset: 0 0 taskbar 0`, 인라인 transform은 `!important`로 덮는다)이고
  **작업 표시줄이 앱 전환기**다. 좌표는 지우지 않으므로 화면이 넓어지면 있던 자리로 돌아간다
- ⚠️ **브레이크포인트는 `720px` 하나다.** 셸(`index.css`)과 프로그램 CSS가 **같은 값**을 쓴다 —
  갈리면 창마다 다른 폭에서 접혀 중간 크기에서 화면이 깨진다. 근거: 가장 넓은 창 크롬이
  사이드바 둘로 476px을 먹는다(메일 `176+300`, 피그마 `232+244`)
- ⚠️ **모바일 규칙은 파일마다 맨 끝 `@media` 블록 하나에 모은다.** 곳곳에 흩으면 "좁은 화면에서
  무엇이 달라지는가"를 파일 전체를 훑어야 안다
- **배치만 바꾼다** — 팔레트·타이포·간격 토큰은 그대로다. 새 색·간격·그림자가 필요해지면 그것은
  시각 언어 변경이라 다른 절차를 탄다(CLAUDE.md)
- 접는 관용구는 하나다: **세로 사이드바를 가로 스트립으로 눕힌다**(`grid-auto-flow: column` +
  `overflow-x: auto`, 오른쪽 테두리 → 아래 테두리). 정본은 `index.css`의 `.company__menu`다
- ⚠️ **가로 스트립의 `flex: none`은 진짜 flex 아이템에 건다** — 메신저는 `li`가 아이템이라
  `.msgr__room`(버튼)에 걸면 아무 일도 안 하고 이름이 세로로 접힌다(겪었다)
- ⚠️ 격자 칸의 기본 `min-width: auto`가 내용에 밀린다 — `minmax(0, 1fr)`이 이 리포의 관용구다
- ⚠️ `100vh`가 아니라 **`100dvh`**다(모바일 브라우저 크롬이 vh보다 실제 높이를 작게 만든다)
- 이미 `repeat(auto-fill, minmax(...))`인 격자(인간인·웹디몰·어워더즈)는 **손대지 않는다** — 이미 접힌다
- ⚠️ **창을 여는 자리는 화면 크기를 받는다**(`openWindow(id, viewport)`). `WINDOW_SPAWN.x`가 고정
  160이라 좁은 화면에서는 창이 화면 밖에서 태어나고, 그러면 잡아 끌 타이틀바까지 잘려 되찾을 수
  없다(`WINDOW_FIT`이 자른다 — `maxW`는 `index.css`의 `.window--app` 폭 상한과 **같은 값**이다)
- **계기판은 시간만 남는다**(설계자 확정 2026-08-14). 스탯·업무목록은 **작업 표시줄의 독**으로
  내려가 팝오버로 열린다(`components/Taskbar.tsx`). 주차 판만 화면에 남기는 이유: **`다음 주`가
  이 게임의 유일한 진행 손짓이라** 늘 손에 닿아야 한다(열어야 보이는 자리로 내리면 한 턴을
  넘기는 데 두 번 눌러야 한다)
- ⚠️ 팝오버는 **네이티브 `popover` 속성이다**(React 19). 바깥 클릭으로 닫히는 것도, **열린
  전체화면 창 위로 올라서는 최상위 레이어**도 브라우저가 준다 — 바깥 클릭 핸들러·`z-index`·포털을
  직접 만들지 마라(`Confirm`이 포털을 쓰는 이유가 여기서는 공짜다). 판의 생김새는 `.hud__panel`이
  이미 지므로 팝오버는 **자리만 잡는 껍데기**다(다시 칠하지 않는다)
- ⚠️ 독이 푸는 것이 **행동력을 보면서 공정을 고르는 일**이다 — 전체화면 창이 계기판을 가리는데
  그 판단이 이 게임의 핵심이라, 값이 창 위에서도 닿아야 한다. 그래서 버튼에 `3/3`을 **그대로
  적는다**(열어 보지 않고도 읽히면 손짓 하나가 준다)
- ⚠️ 스탯·업무 판은 **`Hud`의 `Stats`·`Jobs`를 그대로 가져다 쓴다** — 두 벌로 그리면 줄이 늘 때
  한쪽만 고친다. 어디에 서는지는 CSS가 정한다
- **남은 맞바꿈**: 창이 열려 있으면 바탕화면 아이콘이 가려서 **앱을 바꾸려면 지금 창을 닫아야
  한다**. "한 번에 앱 하나"의 필연이고, 고치려면 독에 프로그램 줄을 더하거나 시작 메뉴에 넣는
  것이 자리다

## 파일 맵
> 사유·함정의 정본은 **그 파일의 주석**이다 — 여기 다시 적지 않는다. 게임 규칙은 `systems.md`.

| 파일 | 역할 |
|---|---|
| `src/index.css` | 토큰 단일 출처 + 셸 스타일 전부 |
| `src/data/game.ts` | 시작 수치 · 달력 단위 · 창 상수 · `apCost`/`apMaxOf`/`QUALITY` |
| `src/data/programs.ts` | `PROGRAMS`(바탕화면 아이콘 단일 출처) · `ProgramId` · `badge` |
| `src/data/inbox.ts` | 받은 의뢰 글(메일·고객게시판 공용) + `inbox()`·`unreadCount()` |
| `src/data/sites.ts` | 가짜 포털 이름 + 첫화면 바로가기(`SHORTCUTS`) |
| `src/data/icons.ts` | 아이콘 이름 단일 출처 |
| `src/data/employees.ts` | 직원 수치·이름 풀 단일 출처(`EMPLOYEE_ROLES`·`salaryOf`·`ORDER_AP` 등) |
| `src/data/keywords.ts` | 키워드·미팅 수치(`SITE_KEYWORDS`·`MEETING_REVEAL` 등) |
| `src/data/bidding.ts` | 수주센터 수치(규모·조건·확률 계수) |
| `src/data/shop.ts` | 쇼핑몰 상품·값 |
| `src/data/reference.ts` | 어워더즈 수치·문안 |
| `src/data/followup.ts` | 후속 요청 수치·성격 4종·문안 |
| `src/data/intro.ts` | 소개 5장 문안 + 조준 `target` |
| `src/store.ts` | zustand — 게임 상태 + 창 목록. 세이브 대상은 `saveFields`/`partialize` |
| `src/systems/seed.ts` | 무작위 유일 출처(FNV-1a→mulberry32, `roller`) |
| `src/systems/calendar.ts` | 주차 → 날짜 표기(`formatDate`/`formatPeriod`/`formatWeek`) |
| `src/systems/pipeline.ts` | 공정·회신 규칙 정본(`PIPELINE`·`openStep`·`canReply`·`isTurnOf`) |
| `src/systems/craft.ts` | 제작 등급(`gradeOf`) — 퀄리티가 밴드, 스탯이 칸, 무작위 없음 |
| `src/systems/keywords.ts` | 키워드 규칙 정본(`clientKeywords`·`keywordShift`·`meetingScript`) |
| `src/systems/money.ts` | 대금·파기·월말 정산(`reward`·`breach`·`isSettleWeek`·`monthlyCost`) |
| `src/systems/popup.ts` | 팝업 판정(`judgePopups`) + 파일 id 규약 + 클레임 문안 |
| `src/systems/ftp.ts` | FTP 접속 대조(`checkFtp`) — 정본은 `CLIENTS[].ftp` |
| `src/systems/url.ts` | 주소 해석(`resolveUrl`) + 관리자 로그인 대조 — 정본은 `CLIENTS` |
| `src/systems/employee.ts` | 직원 규칙 정본(`canOrder`·`isBusy`·`payroll`·`quitter`) |
| `src/systems/hire.ts` | 지원자 생성(`applicants`, 씨앗=공고 주차) |
| `src/systems/request.ts` | 직원 요청 규칙 정본(발생·성패·불만·문안) |
| `src/systems/bidding.ts` | 공고 생성·자격·확률·추첨(순수, 씨앗=주차·공고 id) |
| `src/systems/portfolio.ts` | 작업물 → 낙찰 보정(`showpieces`·`portfolioBonus`, A 이상만) |
| `src/systems/followup.ts` | 수정 요청·버그 신고 판정(`needsRevision`·`bugReport`) |
| `src/systems/reference.ts` | 수상작 파생(`awardWorks`, 씨앗=주차) |
| `src/systems/shop.ts` | 구매 가능 판정(`buyBlock` — 화면·스토어 공용) |
| `src/systems/save.ts` | 슬롯 키·요약·`parseSlot`(못 믿을 세이브 판정) |
| `src/components/` | `Window` · `Desktop` · `Taskbar`(시작 버튼+창 목록+모바일 독) · `Hud`(주차·스탯·업무목록 판) |
| `src/components/StartMenu.tsx` | 시작 메뉴 + 세이브 슬롯 3칸(묻는 창은 `.confirm` 공용) |
| `src/components/MessageList.tsx` | 받은 글 목록(고객게시판용 — 셸 언어) |
| `src/components/JobActions.tsx` | 견적/거절/사업 시작 버튼 — 색은 감싸는 창이 `--jobact-*`로 준다 |
| `src/components/Intro.tsx` | 첫 판 핀라이트 소개(5장, 포털, `box-shadow` 구멍) |
| `src/components/Working.tsx` | 공정 진행 막대 + `useWorking()`(결과는 열기 전에 굳는다) |
| `src/components/Meeting.tsx` | 미팅 채팅 창(포털, `.confirm__panel` 공용) |
| `src/programs/` | 창 내용. `ProgramId` → 컴포넌트 짝은 `App.tsx`의 `VIEWS` |
| `src/programs/Figma.tsx` | 시안 제작 + 키워드 고르기(고른 키워드는 `useState`) — `drafts`는 `files`와 다른 목록 |
| `src/programs/Photoshop.tsx` | 팝업 제작(동작하는 것은 탭+제작 버튼뿐, 도구 막대는 표시) |
| `src/programs/Ppt.tsx` | 화면정의서·발표자료 제작(`makeSlides`) |
| `src/programs/Editor.tsx` | 퍼블리싱 공정(FTP 연결→업체 폴더→실행) |
| `src/programs/AdminSite.tsx` | 업체 관리자 페이지(로그인은 `useState`, 걸린 팝업은 스토어 `popups`) |
| `src/programs/HireSite.tsx` | 채용사이트(인간인) — 지원자 카드 격자 |
| `src/programs/WorkSite.tsx` | 수주센터(HireSite 클래스 재사용) |
| `src/programs/ShopSite.tsx` | 쇼핑몰 |
| `src/programs/RefSite.tsx` | 어워더즈 — 썸네일은 CSS 그라디언트(그 값만 `--nv-*` 밖) |
| `src/programs/Folder.tsx` | 작업물 창 — 읽기 전용, `.company*` 골격 재사용 |
| `src/programs/mail.css` | 메일 창 전용 Fluent 팔레트 — 밖으로 새지 않는다 |
| `src/programs/browser.css` | 브라우저 창 전용 팔레트 — 밖으로 새지 않는다 |
| `src/programs/messenger.css` | 메신저 창 전용 카카오톡 팔레트 — 밖으로 새지 않는다 |
| `src/programs/editor.css` | 에디터 창 전용 VS Code Dark+ — 어두운 창이라 대비 방향이 반대 |
| `src/programs/photoshop.css` | 포토샵 창 전용 CC Dark — 어두운 창 |
| `src/programs/figma.css` | 피그마 창 전용 캔버스 뉴트럴(액센트 없음) |
| `src/programs/ppt.css` | PPT 창 전용 Office 밝은 테마 |
| `src/programs/folder.css` | 작업물 창 목록 줄만 |
| `src/icons/AppIcon.tsx` | 유일한 아이콘 창구(`@iconify/react/offline`) |
| `scripts/build-icon-subset.mjs` | 아이콘 번들 생성(`npm run icons`) |
