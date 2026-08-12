# 변경 이력 (아카이브)

`CLAUDE.md`의 이력 표에서 밀려난 줄을 **한 줄 그대로** 이 파일 맨 위로 옮긴다.
코드에 앉힐 자리가 없는 결정(전역 방향 전환, 기각된 대안 전체)만 여기서 정본이 된다.

<!-- 밀려난 줄은 이 아래에 -->
| 2026-08-11 | `일정`을 달력 격자로 + 주차를 스탯 판 왼쪽의 별도 판으로 분리 + HUD 막대 3색(행동력 눈금 칸·주황 / 정신력 초록 / 평판 남보라) — 팔레트에 `--color-success` 추가 | src/programs/Schedule.tsx, src/components/Hud.tsx, src/systems/calendar.ts(신규) |
| 2026-08-11 | 사내시스템에 업체 3곳 추가 — 사이드바는 화면만, 업체 목록은 본문 칩 + measure가 dev 서버 탭을 골라 붙는다 | src/data/company.ts, src/programs/Company.tsx, scripts/measure.mjs |
| 2026-08-11 | `사내시스템`을 백오피스형으로 완성 — 사이드바(회사현황·업체정보) + `.window--wide` 실제 동작 | src/programs/Company.tsx, src/index.css, project-context |
| 2026-08-11 | `사내시스템`·`브라우저` 창 추가 — 평판 게이지가 위기선까지의 거리를 보여준다 | src/programs/, src/data/, src/index.css |
| 2026-08-10 | 스택(Vite+React+TS+zustand) 설치 + OS 셸 첫 화면 — 바탕화면·작업 표시줄(창 목록)·오른쪽 위 스탯 패널·공용 창·`일정` 창 | src/, scripts/(아이콘 서브셋·CDP 실측 이식), project-context(shell.md 신규) |
| 2026-08-10 | 두 번째 게임 오버 — 평판이 바닥에 4주 붙어 있으면 수주가 끊기고 직원이 떠나 폐업한다 | docs/superpowers/specs/2026-08-10-webdi-core-design.md(§4·§7), project-context(설계 결정표) |

| 2026-08-10 | 코어 설계 확정 — 무한 샌드박스 · 행동력이 곧 시간 · 업무는 공정의 줄 · 직원은 주차로 일한다 | docs/superpowers/specs/2026-08-10-webdi-core-design.md, project-context(설계 결정표) |
| 2026-08-09 | 하네스 세팅 — windowsGame의 검증된 파이프라인을 이식하고 기획을 정본으로 박음 | .claude(agents 2·skills 3), CLAUDE.md, AGENTS.md, docs/SPEC.md, .gitignore |
