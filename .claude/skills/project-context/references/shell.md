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
- **상태가 필요한 화면은 `--seed`로 만든다** — 클릭 10여 번으로 상태를 다시 쌓지 말 것(그 길이 실측 한 번당 10초 + 스크린샷 낭비의 주범이었다). 이제 실제로 동작한다: 문서가 뜨기 전에 심고(`Page.enable` 필수), 값이 문자열이면 그대로·객체면 stringify 한 번만. 시드 모양은 `{ "webdi.save.v1": { state: {...}, version: 0 } }`
- ⚠️ 디버그 포트는 **9223**이다(형제 windowsGame이 9222를 쓴다 — 겹치면 남의 탭에 붙어 남의 게임을 찍는다). dev 서버도 `<title>웹디`를 확인하고 붙는다 — 5173에 형제 서버가 떠 있어도 안전하다
- `npm run build`는 이제 **조용하다**(`--logLevel warn` + gzip 크기 계산 끔 — 폰트 서브셋 200개가 매번 207줄을 찍었다). 성공 판정은 "✓ built" grep이 아니라 **종료 코드 0**이다
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
| 파일 | 역할 |
|---|---|
| `src/index.css` | 토큰 단일 출처 + 셸 스타일 전부 |
| `src/data/game.ts` | 시작 수치 · 달력 단위 · 창 생성/드래그 상수 |
| `src/data/programs.ts` | `PROGRAMS`(바탕화면 아이콘의 단일 출처) · `ProgramId` · `badge`(그 아이콘이 지는 받은 글 채널) |
| `src/data/inbox.ts` | 받은 의뢰 글(메일·고객게시판·톡톡 공용) + `inbox()`·`unreadCount()`. 뱃지 숫자의 단일 출처. ⚠️ 공정 창이 "어디서 회신하라"고 적는 말은 **`CHANNEL_LABEL` 한 곳**에서 온다 — 창마다 삼항으로 가르지 말 것(채널이 늘 때 한 곳만 고치면 카톡 업무를 만들어 놓고 메일함을 뒤지는 판이 된다) |
| `src/components/MessageList.tsx` | 받은 글 목록(고객게시판이 쓴다 — 셸 언어). 메일은 자기 세 칸 화면을 따로 가진다 |
| `src/programs/mail.css` | `메일` 창 전용 Fluent 팔레트. **이 파일 밖으로 새지 않는다** |
| `src/programs/browser.css` | `브라우저` 창 전용 검색 포털 팔레트. **이 파일 밖으로 새지 않는다** |
| `src/programs/Talk.tsx` · `talk.css` | `톡톡` 창 — **클라이언트가 직접 거는 카톡**(`channel:'chat'`). 두 칸(대화방 목록 + 대화)이고 ⚠️ **메신저의 56px 인디고 레일을 베끼지 않는다**(그 기둥이 저 창의 얼굴이라 같아진다). 팔레트 출처는 `ui-ux-pro-max` colors.csv **"Pet Tech App"**(주황 #F97316 + 크림 #FFF7ED) — ⚠️ 통신 계열 항목(Chat & Messaging·Email Client·CRM)은 **전부 파랑이라** 메신저 인디고와 충돌해서 못 쓴다. ⚠️ 주황 위 글자는 **어두운 잉크**다(흰 글자 2.8:1 미달), 결정 버튼만 진한 테라코타(#9A3412 + 흰 글자 7.31:1). 보조 글자는 DB의 #64748B가 아니라 **#5A5A5A**(크림 위에서 #64748B는 4.48:1 미달). ⚠️ 첫 말풍선은 `:nth-of-type`이 아니라 **`.talk__subject + .talk__bubble`**로 집는다(같은 `p`인 제목 알약이 첫째로 세어진다 — 겪었다). **이 파일 밖으로 새지 않는다** |
| `src/programs/messenger.css` | `메신저` 창 전용 카카오톡 팔레트. **요청 판(`.msgr__ask`)은 지시·교육 판보다 위에 서고 회색 대화 칸 위에 뜬다**(흰 판 둘과 갈리려면 인디고 테두리가 필요했다). 목록의 `답변 대기`는 색이 아니라 **글자**다. **이 파일 밖으로 새지 않는다**. ⚠️ 지시 칸(`.msgr__order`)의 높이 상한은 **px(`--msgr-order-max`)이다** — `grid-template-rows`의 `auto` 칸에서 `max-height: %`는 부모 높이가 정해지기 전에 재어져 버튼이 반쯤 잘린다(겪었다) |
| `src/data/employees.ts` | 직원 수치·이름 풀의 단일 출처 — 종류→공정(`EMPLOYEE_ROLES[].programs`·`canHandle`) · 레벨→주차(`LEVEL_SPEEDUP`·`orderWeeks`, 하한 1) · 급여(`salaryOf`) · `ORDER_AP`/`ORDER_QUALITY`/`POST_AP` · 지원자 이름 재료 |
| `src/systems/seed.ts` | **이 게임 무작위의 유일한 출처**(FNV-1a → mulberry32). `roller(씨앗문자열)`이 `unit`/`int`/`pick`/`chance`를 준다 — ⚠️ 모듈 밖에 롤러를 하나 만들어 돌려 쓰지 말 것(부르는 순서가 답을 바꾼다). `hire.ts`·`request.ts`가 함께 쓴다 |
| `src/systems/request.ts` | 직원 요청 규칙의 정본 — 발생(`makeRequest`) · 확률 판정(`feedbackWorks`/`trainRequestWorks`) · 등급 한 칸(`raiseGrade`) · 불만(`grudged`/`fedUp`) · 기한(`expiredRequests`) + 요청·수락·거절·무시 문안과 `grudgeQuitMail`. ⚠️ `Math.random` 없음 |
| `src/systems/hire.ts` | 지원자 생성(`applicants`) — **씨앗은 공고를 올린 주차**다(FNV-1a → mulberry32, `keywords.ts`와 같은 방식). ⚠️ `Math.random` 없음 |
| `src/systems/employee.ts` | 직원 규칙의 정본 — 지시 가능(`canOrder`) · 점유(`isBusy`/`busyUntil`, **정본은 `orders`**) · 완료(`finishedOrders`) · 급여 합계(`payroll`) · 위기 퇴사 순서(`quitter`) + 메신저·퇴사 문안 |
| `src/programs/HireSite.tsx` | 채용사이트(`인간인`). 구인 포털 얼개다: 메뉴 줄(⚠️ **표시다** — button 아님) + 눕는 공고 판 + **지원자 카드 격자**(880px). 카드에서 큰 값은 **월급 하나**다. ⚠️ `--nv-*` 안에서 끝낸다(빨강이 없어 정원 초과는 아이콘 + 글자가 말한다). ⚠️ 지원자를 셀렉터 안에서 만들지 말 것 — 새 배열이 나와 무한 렌더가 된다 |
| `src/programs/editor.css` | `에디터` 창 전용 VS Code Dark+ 팔레트. ⚠️ **어두운 창**이라 대비 방향이 반대다 — 값을 다른 창과 주고받지 말 것 |
| `src/programs/photoshop.css` | `포토샵` 창 전용 Photoshop CC Dark 팔레트. ⚠️ 어두운 창(에디터와 둘뿐). 보조 글자는 실제 포토샵의 #9A9A9A가 아니라 **#A0A0A0**이다 — 그 값이라야 패널 위에서 AA를 넘는다 |
| `src/programs/figma.css` | `피그마` 창 전용 캔버스 뉴트럴 팔레트(액센트 없음 — 선택은 면으로 말한다). **이 파일 밖으로 새지 않는다** |
| `src/data/bidding.ts` | 수주센터 공고의 수치(규모 3단·조건·확률 계수·응모 비용) |
| `src/systems/bidding.ts` | 공고 생성·자격·확률·추첨. **순수 함수**(시드는 주차와 공고 id) |
| `src/programs/WorkSite.tsx` | 수주센터 화면. `--nv-*`를 쓰고 `HireSite`의 클래스를 재사용한다 |
| `src/data/sites.ts` | 가짜 포털 이름 + 첫화면 바로가기 목록. 사이트가 생기면 여는 대상이 여기 붙는다 |
| `src/systems/url.ts` | 주소창 글자 → 갈 곳(`resolveUrl`) + 관리자 로그인 대조(`checkLogin`). **주소·계정의 정본은 `CLIENTS`다** — 여기 다시 적지 않는다 |
| `src/programs/AdminSite.tsx` | 업체별 관리자 페이지. ⚠️ **주소창에 처음 한 번은 직접 쳐야 닿는다**(첫화면 바로가기 칸에 넣지 않는다) — `사내시스템 > 업체정보`에서 주소·계정을 찾아 옮겨 적는 왕복이 의도된 동선이다. 로그인은 `CLIENTS`의 계정과 대조한다. 안에는 **팝업 목록 + 등록 폼**이 있다(목록에서 게시 기간을 고칠 수 있다 — 오타를 되돌릴 길이 없으면 한 번의 실수가 영구 클레임이 된다). 로그인은 `useState`(창 닫으면 풀림), 걸린 팝업은 스토어 `popups`. ⚠️ 셀렉터 안에서 `filter`를 돌리지 말 것 — 새 배열이 나와 zustand가 무한 렌더로 화면을 하얗게 만든다(겪었다) |
| `src/programs/Photoshop.tsx` | 팝업 이미지 제작(도구 막대 · 문서 탭 · 캔버스 · 레이어 패널). 팝업 제작이 행동력을 문다(고른 퀄리티 — 퍼블리싱은 에디터가 진다). 실제로 동작하는 것은 **탭과 제작 버튼 셋뿐**이고 도구 막대는 표시다 |
| `src/data/keywords.ts` | 분위기 키워드 목록 · `SITE_KEYWORDS`(5) · `MEETING_AP` · `MEETING_REVEAL`(기획력→개수) · `KEYWORD_SHIFT`(적중→등급 칸) |
| `src/systems/keywords.ts` | 키워드 규칙의 정본 — 씨앗(업무 id)에서 정답을 뽑는 `clientKeywords` · `revealedKeywords` · `hitCount`/`keywordShift` · `shiftGrade`/`GRADE_LADDER`(⚠️ `pipeline.ts`의 `GRADE_ORDER`와 같은 줄이어야 한다) · 미팅 알림 문안 |
| `src/systems/craft.ts` | 제작 결과의 등급(`gradeOf` — 셋째 인자가 키워드 보정이고 **밴드 밖으로 나간다**) + 시안 파일 타입. **퀄리티가 밴드, 스탯이 칸**이고 무작위는 없다 |
| `src/programs/Editor.tsx` | 퍼블리싱 공정(FTP 연결 → 업체 폴더 → 남은 업무 → 줄 클릭 = 실행). **행동력을 무는 둘째 자리다**(`PUBLISH_AP`) |
| `src/components/Intro.tsx` | 첫 판의 소개(5장, 포털). **핀라이트**로 말하는 자리만 뚫는다 — 어둠은 오버레이가 아니라 **구멍 하나의 `box-shadow: 0 0 0 9999px`**다(마스크·SVG 금지, 둥근 모서리는 `border-radius`가 준다). 조준은 `data/intro.ts`의 `target`이고 **`data-*`로 집는다**(`nth-child`는 아이콘이 늘면 엉뚱한 곳을 비춘다). 못 찾으면 그 장은 가운데 카드로 떨어진다. 봤는지는 `seenIntro`(세이브에 들어간다 — 새로고침마다 뜨면 고장으로 읽힌다), 새 게임이면 다시 켜지고 **건너뛰기는 늘 있다** |
| `src/components/Working.tsx` | 공정 실행 때 뜨는 진행 막대 창 + `useWorking()` 훅(공정을 돌리는 창 넷이 같은 연출을 쓴다). ⚠️ 결과는 열기 전에 이미 굳어 있다 — 창은 보여 줄 뿐이고 `prefers-reduced-motion`에서는 바로 끝난다. 막대 시간의 정본은 `WORK_ANIM_MS`(인라인 전환 시간으로 내려간다) |
| `src/components/Meeting.tsx` | 클라이언트 미팅 채팅 창(포털 — 묻는 창과 같은 층·같은 판 `.confirm__panel`). 대사는 `data/keywords.ts`, 조립은 `systems/keywords.ts`의 `meetingScript`. ⚠️ `prefers-reduced-motion`에서는 한 번에 다 뜬다 |
| `src/data/followup.ts` · `src/systems/followup.ts` | 납품 뒤 클라이언트가 **다시 말을 거는 축** — 성격 4종(`personalityOf`, 씨앗은 **업체 이름**) · 수정 요청 판정(`needsRevision`, 씨앗에 **주차가 안 들어간다**) · 버그 신고(`bugReport`, **`CLIENTS` 업체에만** — 신규 고객은 에디터에 못 떠서 못 고친다). ⚠️ 수정 요청은 새 축이 아니라 스토어가 **`step`을 1 내리는 것**이다 |
| `src/systems/portfolio.ts` | 쌓인 작업물 → 낙찰 확률 보정(`showpieces`/`portfolioBonus`). **A 이상만 센다**(찍어 내는 것이 최적이 되지 않게). 화면(`Folder`)과 스토어(`bidStats`)가 같은 함수를 쓴다 |
| `src/programs/Folder.tsx` · `folder.css` | `작업물` 창 — **읽기 전용**(버튼이 없다). 골격은 `사내시스템`의 `.company*`를 그대로 쓴다(둘 다 셸 언어의 `app` 창이고 그 클래스는 `index.css`에 산다) — `folder.css`에는 목록 줄만 있다 |
| `src/data/reference.ts` · `src/systems/reference.ts` | 레퍼런스 사이트의 수치·문안 + 수상작 파생(`awardWorks`, **씨앗은 주차 하나**). ⚠️ 정신력을 회복시키지 않는다(쇼핑몰 소모품이 이미 그 축이다) |
| `src/programs/RefSite.tsx` | 어워더즈(`awwwdi.kr`) — 수상작 카드 격자(880px). **썸네일은 CSS로 그린다**(외부 이미지 금지) 그리고 그 그라디언트 값만 `--nv-*` 밖이다(그림이라서 — 글자·테두리·버튼에는 안 쓴다). 구경 버튼은 **아직 안 본 주에만** 선다 |
| `src/programs/ShopSite.tsx` | 쇼핑몰(`webdimall.kr`) — 상품 격자. 상품·값은 `data/shop.ts`, 살 수 있는지는 `systems/shop.ts`의 `buyBlock`(화면·스토어 공용) |
| `src/systems/money.ts` | 대금·평판 변화(`reward`) · 파기(`breach`) · 월말 정산(`isSettleWeek`·`monthlyCost`) + 파기·정산 메일 문안. ⚠️ 수치는 전부 `data/game.ts`에서 온다 |
| `src/systems/pipeline.ts` | **공정의 줄과 회신 규칙의 정본**(`PIPELINE`·`openStep`·`canReply`·`satisfaction` + 답장/완료 메일 문안). 창들은 `isTurnOf(job, 자기 프로그램)` 한 줄로 목록을 가른다 — 종류별 조건을 컴포넌트에 다시 적지 말 것 |
| `src/programs/Ppt.tsx` | 화면정의서(사이트 첫 공정)와 발표자료(PPT 업무)를 **같은 손으로** 만든다(`makeSlides`). 셸 언어 그대로인 작은 창이다 |
| `src/systems/ftp.ts` | FTP 접속 정보 대조(`checkFtp`). **정본은 `CLIENTS[].ftp`** — 여기 값을 다시 적지 않는다. `ftp://`만 여기서 벗긴다(`normalizeUrl`은 http(s)만 안다) |
| `src/programs/Figma.tsx` | 피그마 파일 브라우저(사이드바 + 파일 그리드 + 속성 패널). 속성 패널이 **미팅 참석 + 분위기 키워드 고르기**를 진다(고른 키워드는 `useState` — 세이브에 넣지 않는다). ⚠️ 미팅 전에는 **"아직 무엇을 원하는지 모른다"고 말한다** — 정답을 흐리게라도 보여 주면 미팅이 값을 잃는다. 키워드 `SITE_KEYWORDS`개를 다 골라야 제작 버튼이 열리고, 버튼에 적히는 등급은 **보정 전**이다(맞췄는지는 만들기 전에 알 수 없다). 카드를 고르면 오른쪽에서 **시안을 만든다**(행동력을 무는 셋째 자리). 만든 시안은 스토어 `drafts` — 팝업 `files`와 **다른 목록**이다(등록 화면에 .fig가 뜨면 안 된다) |
| `src/systems/popup.ts` | 팝업 판정의 순수 함수(`judgePopups`) + 파일 id 규약(`popupFileId`/`isFileOf`) + 클레임 메일 문안 |
| `src/components/JobActions.tsx` | 견적보내기/거절하기. ⚠️ **색이 없다** — 감싸는 창이 `--jobact-*`를 준다(그래서 메일과 사내시스템에서 각자 팔레트로 선다) |
| `src/data/icons.ts` | 아이콘 이름 단일 출처 |
| `src/icons/AppIcon.tsx` | 유일한 아이콘 창구(`@iconify/react/offline`). 다른 곳에서 `@iconify/react`를 import하지 않는다 |
| `src/systems/` | 순수 함수(React·Math.random 금지). 지금은 `calendar.ts` — 주차 → 몇 년 몇 월 몇째 주 |
| `src/store.ts` | zustand — 게임 5축 + 창 목록(x·y·z) |
| `src/components/` | `Window` · `Desktop` · `Taskbar`(시작 버튼 + 창 목록) · `Hud`(오른쪽 위 주차·스탯·업무목록 판) |
| `src/components/StartMenu.tsx` | 시작 버튼 + 이름 있는 슬롯 3칸(저장·불러오기·삭제·새 게임). 되돌릴 수 없는 것은 전부 `.confirm`으로 묻는다(`Hud.tsx`와 **같은 클래스** — 같은 성격의 질문이 창마다 다르게 생기지 않는다) |
| `src/systems/save.ts` | 슬롯 키(`webdi.slot.<n>`) · 요약 만들기 · **못 믿을 세이브 판정**(`parseSlot`). 순수 함수이고 저장소는 `store.ts`만 만진다 |
| `src/programs/` | 창 내용. `ProgramId` → 컴포넌트 짝은 `App.tsx`의 `VIEWS` |
| `scripts/build-icon-subset.mjs` | `src/`를 훑어 `src/icons/generated.ts` 생성(`npm run icons`) |
