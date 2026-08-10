// 이 파일은 `npm run icons`(scripts/build-icon-subset.mjs)가 생성한다. 직접 수정하지 말 것.
// src/에서 실제로 쓰는 아이콘 7개만 담은 축소 세트다 —
// 전체 세트(8천여 개)를 번들에 넣지 않기 위한 것이다.
import type { IconifyJSON } from '@iconify/react/offline'

/** mdi — 사용 중인 6개 */
export const mdi: IconifyJSON = {
  "prefix": "mdi",
  "icons": {
    "calendar-week-outline": {
      "body": "<path fill=\"currentColor\" d=\"M5 3h1V1h2v2h8V1h2v2h1c1.11 0 2 .89 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 16h14V9H5zM5 7h14V5H5zm12 4v2H7v-2z\"/>"
    },
    "close": {
      "body": "<path fill=\"currentColor\" d=\"M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z\"/>"
    },
    "emoticon-happy-outline": {
      "body": "<path fill=\"currentColor\" d=\"M20 12a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8m2 0a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2a10 10 0 0 1 10 10M10 9.5c0 .8-.7 1.5-1.5 1.5S7 10.3 7 9.5S7.7 8 8.5 8s1.5.7 1.5 1.5m7 0c0 .8-.7 1.5-1.5 1.5S14 10.3 14 9.5S14.7 8 15.5 8s1.5.7 1.5 1.5m-5 7.73c-1.75 0-3.29-.73-4.19-1.81L9.23 14c.45.72 1.52 1.23 2.77 1.23s2.32-.51 2.77-1.23l1.42 1.42c-.9 1.08-2.44 1.81-4.19 1.81\"/>"
    },
    "lightning-bolt-outline": {
      "body": "<path fill=\"currentColor\" d=\"M11 9.47V11h3.76L13 14.53V13H9.24zM13 1L6 15h5v8l7-14h-5z\"/>"
    },
    "star-outline": {
      "body": "<path fill=\"currentColor\" d=\"m12 15.39l-3.76 2.27l.99-4.28l-3.32-2.88l4.38-.37L12 6.09l1.71 4.04l4.38.37l-3.32 2.88l.99 4.28M22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.45 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03z\"/>"
    },
    "wallet-outline": {
      "body": "<path fill=\"currentColor\" d=\"M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2.28A2 2 0 0 0 22 15V9a2 2 0 0 0-1-1.72V5a2 2 0 0 0-2-2zm0 2h14v2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6v2H5zm8 4h7v6h-7zm3 1.5a1.5 1.5 0 0 0-1.5 1.5a1.5 1.5 0 0 0 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5a1.5 1.5 0 0 0-1.5-1.5\"/>"
    }
  },
  "width": 24,
  "height": 24
}

/** fluent-color — 사용 중인 1개 */
export const fluentColor: IconifyJSON = {
  "prefix": "fluent-color",
  "icons": {
    "calendar-32": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVGTUoB5dlK)\" d=\"M29 24.5a4.5 4.5 0 0 1-4.5 4.5h-17A4.5 4.5 0 0 1 3 24.5V10l13-1l13 1z\"/><path fill=\"url(#SVGOnw1ccHu)\" d=\"M29 24.5a4.5 4.5 0 0 1-4.5 4.5h-17A4.5 4.5 0 0 1 3 24.5V10l13-1l13 1z\"/><g filter=\"url(#SVGJudnleuH)\"><path fill=\"url(#SVGJXPo1beq)\" d=\"M10.5 18a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m1.5 3.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m4 1.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m1.5-6.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m4 1.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3\"/></g><path fill=\"url(#SVGyOHeQbJd)\" d=\"M3 7.5A4.5 4.5 0 0 1 7.5 3h17A4.5 4.5 0 0 1 29 7.5V10H3z\"/><defs><linearGradient id=\"SVGTUoB5dlK\" x1=\"20.694\" x2=\"13.492\" y1=\"31.456\" y2=\"9.925\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#b3e0ff\"/><stop offset=\"1\" stop-color=\"#b3e0ff\"/></linearGradient><linearGradient id=\"SVGOnw1ccHu\" x1=\"18.786\" x2=\"22.353\" y1=\"17.182\" y2=\"33.578\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#dcf8ff\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#ff6ce8\" stop-opacity=\".7\"/></linearGradient><linearGradient id=\"SVGJXPo1beq\" x1=\"14.727\" x2=\"17.137\" y1=\"14.077\" y2=\"30.097\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0078d4\"/><stop offset=\"1\" stop-color=\"#0067bf\"/></linearGradient><linearGradient id=\"SVGyOHeQbJd\" x1=\"3\" x2=\"25.069\" y1=\"3\" y2=\"-4.352\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0094f0\"/><stop offset=\"1\" stop-color=\"#2764e7\"/></linearGradient><filter id=\"SVGJudnleuH\" width=\"16.667\" height=\"10.667\" x=\"7.667\" y=\"14.333\" color-interpolation-filters=\"sRGB\" filterUnits=\"userSpaceOnUse\"><feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\"/><feColorMatrix in=\"SourceAlpha\" result=\"hardAlpha\" values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"/><feOffset dy=\".667\"/><feGaussianBlur stdDeviation=\".667\"/><feColorMatrix values=\"0 0 0 0 0.1242 0 0 0 0 0.323337 0 0 0 0 0.7958 0 0 0 0.32 0\"/><feBlend in2=\"BackgroundImageFix\" result=\"effect1_dropShadow_378174_9802\"/><feBlend in=\"SourceGraphic\" in2=\"effect1_dropShadow_378174_9802\" result=\"shape\"/></filter></defs></g>",
      "width": 32,
      "height": 32
    }
  },
  "width": 20,
  "height": 20
}

/** 앱 시작 시 등록할 축소 세트 전체. */
export const ICON_COLLECTIONS: IconifyJSON[] = [mdi, fluentColor]
