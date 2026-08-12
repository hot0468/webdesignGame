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
- **작업 표시줄은 열린 창 목록만** 진다. 오른쪽 위 `Hud`가 **주차 판 + (스탯 판·업무목록 판)** 을 진다. ⚠️ 스탯·업무목록을 바탕화면 아이콘/창으로 빼지 말 것 — 항상 보여야 하는 계기판이다
- `Hud`는 **창이 아니다**(공용 `Window` 미사용). 닫거나 옮길 수 있으면 상태를 못 보는 판이 생기고 다시 여는 경로도 없다
- ⚠️ 업무목록은 **스탯과 다른 판**이다(같은 칸에 세로로 선다) — 스탯은 늘 네 줄이고 업무는 늘어나는 목록이라, 한 판이면 스탯이 어디서 끝나는지가 흐려진다. 폭 상한은 `.hud__col`이 진다
- ⚠️ **작업 표시줄과 `Hud`는 창 레이어 밖에 둔다.** 안에 넣으면 `--z-taskbar`가 창 레이어의 스택 컨텍스트에 갇혀 뜻을 잃는다
- ⚠️ 둘의 **z는 다르다**: 작업 표시줄은 `--z-taskbar`(항상 위), `Hud`는 `--z-desktop`(**창이 덮는다**). 계기판을 창 위로 되돌리지 말 것 — 큰 창의 오른쪽 위 내용을 가린다. 가려진 계기판은 창을 닫거나 옮겨서 본다
- 창은 **위쪽 기준**으로 뜬다(`WINDOW_SPAWN.y` = 24, 바탕화면 아이콘과 같은 여백) — 큰 창일수록 아래로 쓸 높이가 필요하다
- ⚠️ `Hud`가 글자를 실을 수 있는 것은 **판이 `--color-card`이기 때문**이다. 판을 없애고 바탕화면에 직접 얹으면 AA 미달이 된다
- ⚠️ 창 레이어는 `inset:0` 오버레이다. `pointer-events:none`(자식만 `auto`)이 아니면 **바탕화면 아이콘 클릭을 삼킨다**
- 바탕화면 아이콘은 **단일 클릭**으로 연다(터치·게임 친화). ⚠️ windowsGame은 더블클릭이라 `measure.mjs --dblclick`이 여기서는 아무 일도 안 하면서 `ok`를 찍는다 — `--click`을 쓴다
- 아이콘은 창이 실제로 열리는 프로그램만 그린다(`PROGRAMS`가 단일 출처). `VIEWS`가 `Record<ProgramId, ...>`라서 짝을 빼먹으면 타입 검사가 잡는다
- 아이콘은 **두 줄**이다: 왼쪽 = 회사를 굴리는 창(메일·일정·사내시스템·브라우저), 오른쪽 = 손으로 만드는 프로그램(피그마·포토샵·메신저·에디터). ⚠️ 줄은 `PROGRAMS.col`이 정한다 — `Desktop`에서 id를 나열해 가르지 말 것. `satisfies`가 `col` 빠진 항목에서 빌드를 실패시킨다
- 내용이 아직 없는 창은 **`.empty` 빈 상태**를 쓴다 — 갈 데 없는 주소창·링크·버튼을 그리는 대신 무엇이 생기면 여기 뜨는지 적는다(`Browser.tsx`가 예시)
- 창 내용은 **계기판과 겹치는 숫자를 다시 늘어놓지 않는다.** 계기판의 평판 막대는 **양**만 보이고, **위기선까지의 거리는 `Company.tsx`만** 가진다
- 계기판 막대는 둘로 갈린다: 연속량(정신력·평판)은 `Bar`, **정수 자원(행동력)은 칸으로 세는 `Ticks`** — 행동력을 연속 막대로 바꾸지 말 것
- 막대 색은 **행동력 accent(주황) · 정신력 success(초록) · 평판 primary(남보라)** 로 고정이다. ⚠️ **밝기가 아니라 색상으로 가른다** — primary/secondary는 같은 인디고라 8px 막대에서 구분이 안 됐다(되돌리지 말 것)
- 상한이 없는 값(소지금)은 막대를 주지 않는다 — 채울 끝이 없다. 그래서 목록 맨 아래에 둔다
- 업무목록 판은 **읽는 목록이다.** 줄마다 남은 마감 주가 서고, 임박하면 `destructive`로 굵어진다(색만으로 말하지 않게 숫자를 함께 준다). ⚠️ 취소선은 `completeJob`이 붙인다 — 사람이 켜는 체크박스를 달지 말 것. 완료는 취소선 + 색 죽이기 + 표식 셋이 함께 말한다(취소선만으로는 약하다)
- 새 글 뱃지(`.badge`)는 **`destructive` + 카드색 테두리**다. ⚠️ accent 위에는 숫자를 얹지 못하고(3.56:1), 테두리를 빼면 선택된 메뉴(primary)와 바탕화면 위에서 빨강이 배경에 묻는다
- 뱃지가 세는 것은 **스토어 `readIds` 하나**다. 읽음은 **글을 펼칠 때** 붙는다 — 창을 여는 것만으로 처리하면 뱃지가 열자마자 사라져 무엇이 새 글이었는지 알 수 없다

## 창
- 모든 창 UI는 공용 `Window`를 쓴다. 이동은 **transform으로만**
- **포커스는 별도 필드가 아니라 `z` 최대값에서 파생**한다(`focusedWindowId`). 관계를 한 방향으로만 적는다
- `moveWindow`는 화면 크기를 **인자로 받는다** — 스토어는 DOM을 모른다. 상한 clamp(`WINDOW_DRAG.keepVisible`)가 없으면 창이 작업 표시줄 밑으로 들어가 타이틀바를 못 잡는다
- 창 크기는 `PROGRAMS`의 `size`가 정한다 — 없으면 기본 440px(`일정`·`피그마`·`포토샵` 등), `app`은 큰 프로그램(`메일`·`사내시스템`). `app`은 `.window__body` 패딩을 걷으므로 **내용 쪽이 자기 패딩을 진다**
- ⚠️ `app`은 **높이도 고정**한다 — 내용은 `height:100%` + 안쪽 칸이 각자 `overflow-y:auto`로 구른다(창이 작업 표시줄을 뚫지 않게)
- 프로그램 창이 **자기 팔레트를 가지는 예외**의 실례가 `Mail`이다(`src/programs/mail.css` — Fluent/WinUI 값 + Segoe UI). ⚠️ 그 안에서 셸 토큰(`.badge`·`.empty` 등)을 섞어 쓰지 않는다 — 두 팔레트가 한 창에 서면 둘 다 무너진다
- 같은 예외의 둘째 사례가 `Browser`다(`src/programs/browser.css` — 뉴트럴 그레이 + 링크 블루 + 시스템 글꼴). ⚠️ **크롬(주소 표시줄)은 무채색으로 물러난다** — 브라우저 UI가 색을 가지면 그 안의 사이트가 색을 못 가진다. 파랑은 링크와 초점, 그리고 **사이트 안의 주된 버튼**(`.nv-site__go`)에만 선다
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

## 파일 맵
| 파일 | 역할 |
|---|---|
| `src/index.css` | 토큰 단일 출처 + 셸 스타일 전부 |
| `src/data/game.ts` | 시작 수치 · 달력 단위 · 창 생성/드래그 상수 |
| `src/data/programs.ts` | `PROGRAMS`(바탕화면 아이콘의 단일 출처) · `ProgramId` · `badge`(그 아이콘이 지는 받은 글 채널) |
| `src/data/inbox.ts` | 받은 의뢰 글(메일·고객게시판 공용) + `inbox()`·`unreadCount()`. 뱃지 숫자의 단일 출처 |
| `src/components/MessageList.tsx` | 받은 글 목록(고객게시판이 쓴다 — 셸 언어). 메일은 자기 세 칸 화면을 따로 가진다 |
| `src/programs/mail.css` | `메일` 창 전용 Fluent 팔레트. **이 파일 밖으로 새지 않는다** |
| `src/programs/browser.css` | `브라우저` 창 전용 검색 포털 팔레트. **이 파일 밖으로 새지 않는다** |
| `src/data/sites.ts` | 가짜 포털 이름 + 첫화면 바로가기 목록. 사이트가 생기면 여는 대상이 여기 붙는다 |
| `src/systems/url.ts` | 주소창 글자 → 갈 곳(`resolveUrl`) + 관리자 로그인 대조(`checkLogin`). **주소·계정의 정본은 `CLIENTS`다** — 여기 다시 적지 않는다 |
| `src/programs/AdminSite.tsx` | 업체별 관리자 페이지(로그인 + 팝업등록 **하나뿐**). 로그인은 `useState`(창 닫으면 풀림), 올린 팝업 수는 스토어 `popups` |
| `src/components/JobActions.tsx` | 견적보내기/거절하기. ⚠️ **색이 없다** — 감싸는 창이 `--jobact-*`를 준다(그래서 메일과 사내시스템에서 각자 팔레트로 선다) |
| `src/data/icons.ts` | 아이콘 이름 단일 출처 |
| `src/icons/AppIcon.tsx` | 유일한 아이콘 창구(`@iconify/react/offline`). 다른 곳에서 `@iconify/react`를 import하지 않는다 |
| `src/systems/` | 순수 함수(React·Math.random 금지). 지금은 `calendar.ts` — 주차 → 몇 년 몇 월 몇째 주 |
| `src/store.ts` | zustand — 게임 5축 + 창 목록(x·y·z) |
| `src/components/` | `Window` · `Desktop` · `Taskbar`(창 목록) · `Hud`(오른쪽 위 주차·스탯·업무목록 판) |
| `src/programs/` | 창 내용(`Figma`·`Photoshop`은 공정 시스템이 생길 자리라 아직 `.empty`다). `ProgramId` → 컴포넌트 짝은 `App.tsx`의 `VIEWS` |
| `scripts/build-icon-subset.mjs` | `src/`를 훑어 `src/icons/generated.ts` 생성(`npm run icons`) |
