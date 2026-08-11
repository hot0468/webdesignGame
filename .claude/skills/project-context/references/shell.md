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
- **작업 표시줄은 열린 창 목록만** 진다. 주차와 스탯은 오른쪽 위 `Hud`가 진다 — **주차 판 + 스탯 판 두 장**이 나란히 선다. ⚠️ 주차를 스탯 목록 안으로 도로 넣지 말 것
- `Hud`는 **창이 아니다**(공용 `Window` 미사용). 닫거나 옮길 수 있으면 상태를 못 보는 판이 생기고 다시 여는 경로도 없다. 항상 보이는 계기판이다
- ⚠️ **작업 표시줄과 `Hud`는 창 레이어 밖에 둔다.** 안에 넣으면 `--z-taskbar`가 창 레이어의 스택 컨텍스트에 갇혀 뜻을 잃는다
- ⚠️ `Hud`의 라벨이 `--color-muted-foreground`를 쓸 수 있는 것은 **판이 `--color-card`이기 때문**이다. 판을 없애고 바탕화면에 직접 얹으면 AA 미달이 된다
- ⚠️ 창 레이어는 `inset:0` 오버레이다. `pointer-events:none`(자식만 `auto`)이 아니면 **바탕화면 아이콘 클릭을 삼킨다**
- 바탕화면 아이콘은 **단일 클릭**으로 연다(터치·게임 친화). ⚠️ windowsGame은 더블클릭이라 `measure.mjs --dblclick`이 여기서는 아무 일도 안 하면서 `ok`를 찍는다 — `--click`을 쓴다
- 아이콘은 창이 실제로 열리는 프로그램만 그린다(`PROGRAMS`가 단일 출처). `VIEWS`가 `Record<ProgramId, ...>`라서 짝을 빼먹으면 타입 검사가 잡는다
- 내용이 아직 없는 창은 **`.empty` 빈 상태**를 쓴다 — 갈 데 없는 주소창·링크·버튼을 그리는 대신 무엇이 생기면 여기 뜨는지 적는다(`Browser.tsx`가 예시)
- 창 내용은 **HUD와 겹치는 숫자를 다시 늘어놓지 않는다.** HUD가 못 지는 것만 진다 — HUD의 평판 막대는 **양**만 보이고 **위기선 눈금은 `Company.tsx`만** 가진다
- HUD 막대는 둘로 갈린다: 연속량(정신력·평판)은 `Bar`, **정수 자원(행동력)은 칸으로 세는 `Ticks`** — 행동력을 연속 막대로 바꾸지 말 것
- 막대 색은 **행동력 accent(주황) · 정신력 success(초록) · 평판 primary(남보라)** 로 고정이다. ⚠️ **밝기가 아니라 색상으로 가른다** — primary/secondary는 같은 인디고라 8px 막대에서 구분이 안 됐다(되돌리지 말 것)
- 상한이 없는 값(소지금)은 막대를 주지 않는다 — 채울 끝이 없다. 그래서 목록 맨 아래에 둔다

## 창
- 모든 창 UI는 공용 `Window`를 쓴다. 이동은 **transform으로만**
- **포커스는 별도 필드가 아니라 `z` 최대값에서 파생**한다(`focusedWindowId`). 관계를 한 방향으로만 적는다
- `moveWindow`는 화면 크기를 **인자로 받는다** — 스토어는 DOM을 모른다. 상한 clamp(`WINDOW_DRAG.keepVisible`)가 없으면 창이 작업 표시줄 밑으로 들어가 타이틀바를 못 잡는다
- 사이드바 메뉴로 화면을 가르는 **백오피스형 창**은 `PROGRAMS`에 `wide`를 준다. `.window--wide`가 폭을 넓히고 `.window__body` 패딩을 걷으므로 **내용 쪽이 자기 패딩을 진다**(`Company.tsx`가 예시)
- ⚠️ 사이드바는 **화면만** 진다. 개수가 늘어나는 목록(업체 등)은 본문 안에 둔다 — 사이드바에 쌓으면 메뉴가 창 높이를 민다
- ⚠️ 창 안에서 **고른 메뉴는 `useState`**다. 스토어에 넣으면 세이브에 들어가고, 창을 보는 방식 때문에 세이브 버전을 올리게 된다

## 실측 (`scripts/measure.mjs`, windowsGame에서 이식 — 의존성 0)
```
node scripts/measure.mjs --reduced --click .desktop-icon --scan --shot out.png
```
- `--scan`은 **AA 미달만** 보고한다. 함정은 전부 그 파일 주석에 있다 — **다시 알아내지 말 것**
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
| `src/data/programs.ts` | `PROGRAMS`(바탕화면 아이콘의 단일 출처) · `ProgramId` |
| `src/data/icons.ts` | 아이콘 이름 단일 출처 |
| `src/icons/AppIcon.tsx` | 유일한 아이콘 창구(`@iconify/react/offline`). 다른 곳에서 `@iconify/react`를 import하지 않는다 |
| `src/systems/` | 순수 함수(React·Math.random 금지). 지금은 `calendar.ts` — 주차 → 몇 년 몇 월 몇째 주 |
| `src/store.ts` | zustand — 게임 5축 + 창 목록(x·y·z) |
| `src/components/` | `Window` · `Desktop` · `Taskbar`(창 목록) · `Hud`(오른쪽 위 스탯 패널) |
| `src/programs/` | 창 내용. `ProgramId` → 컴포넌트 짝은 `App.tsx`의 `VIEWS` |
| `scripts/build-icon-subset.mjs` | `src/`를 훑어 `src/icons/generated.ts` 생성(`npm run icons`) |
