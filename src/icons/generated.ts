// 이 파일은 `npm run icons`(scripts/build-icon-subset.mjs)가 생성한다. 직접 수정하지 말 것.
// src/에서 실제로 쓰는 아이콘 11개만 담은 축소 세트다 —
// 전체 세트(8천여 개)를 번들에 넣지 않기 위한 것이다.
import type { IconifyJSON } from '@iconify/react/offline'

/** mdi — 사용 중인 8개 */
export const mdi: IconifyJSON = {
  "prefix": "mdi",
  "icons": {
    "alert-outline": {
      "body": "<path fill=\"currentColor\" d=\"M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2\"/>"
    },
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
    "link-variant-off": {
      "body": "<path fill=\"currentColor\" d=\"M2 5.27L3.28 4L20 20.72L18.73 22l-4.83-4.83l-2.61 2.61a5.003 5.003 0 0 1-7.07 0a5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.98 2.98 0 0 0 0 4.24a2.98 2.98 0 0 0 4.24 0l2.62-2.6l-1.62-1.61c-.01.24-.11.49-.29.68c-.39.39-1.03.39-1.42 0A4.97 4.97 0 0 1 7.72 11zm10.71-1.05a5.003 5.003 0 0 1 7.07 0a5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.98 2.98 0 0 0 0-4.24a2.98 2.98 0 0 0-4.24 0l-3.33 3.33l-1.41-1.42zm.7 4.95c.39-.39 1.03-.39 1.42 0a5 5 0 0 1 1.23 5.06l-1.78-1.77c-.05-.68-.34-1.35-.87-1.87a.973.973 0 0 1 0-1.42\"/>"
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

/** fluent-color — 사용 중인 3개 */
export const fluentColor: IconifyJSON = {
  "prefix": "fluent-color",
  "icons": {
    "building-32": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVG19CFuJOe)\" d=\"M27 30a1 1 0 0 0 1-1V16.25A3.25 3.25 0 0 0 24.75 13H22V5.25A3.25 3.25 0 0 0 18.75 2H7a3 3 0 0 0-3 3v24a1 1 0 0 0 1 1z\"/><path fill=\"url(#SVGjkPWSd2N)\" d=\"M21.5 24a1.5 1.5 0 0 1 1.5 1.5V30h-7l-1-2.5l1-3.5z\"/><path fill=\"url(#SVG8TcaAedb)\" d=\"M10.5 24A1.5 1.5 0 0 0 9 25.5V30h7v-6z\"/><path fill=\"url(#SVGsE2bCeXR)\" d=\"M10.5 10a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m0 5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m1.5 3.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m3.5-8.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m1.5 3.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0M15.5 20a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m6.5-1.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0\"/><defs><linearGradient id=\"SVG19CFuJOe\" x1=\"4\" x2=\"30.607\" y1=\"2.875\" y2=\"32.072\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#29c3ff\"/><stop offset=\"1\" stop-color=\"#2764e7\"/></linearGradient><linearGradient id=\"SVGjkPWSd2N\" x1=\"16\" x2=\"21.149\" y1=\"23\" y2=\"29.017\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0067bf\"/><stop offset=\"1\" stop-color=\"#003580\"/></linearGradient><linearGradient id=\"SVG8TcaAedb\" x1=\"9.25\" x2=\"14.081\" y1=\"25.313\" y2=\"30.332\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0067bf\"/><stop offset=\"1\" stop-color=\"#003580\"/></linearGradient><linearGradient id=\"SVGsE2bCeXR\" x1=\"12.9\" x2=\"17.649\" y1=\"5.556\" y2=\"22.653\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fdfdfd\"/><stop offset=\"1\" stop-color=\"#b3e0ff\"/></linearGradient></defs></g>",
      "width": 32,
      "height": 32
    },
    "calendar-32": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVGTUoB5dlK)\" d=\"M29 24.5a4.5 4.5 0 0 1-4.5 4.5h-17A4.5 4.5 0 0 1 3 24.5V10l13-1l13 1z\"/><path fill=\"url(#SVGOnw1ccHu)\" d=\"M29 24.5a4.5 4.5 0 0 1-4.5 4.5h-17A4.5 4.5 0 0 1 3 24.5V10l13-1l13 1z\"/><g filter=\"url(#SVGJudnleuH)\"><path fill=\"url(#SVGJXPo1beq)\" d=\"M10.5 18a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m1.5 3.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m4 1.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m1.5-6.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m4 1.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3\"/></g><path fill=\"url(#SVGyOHeQbJd)\" d=\"M3 7.5A4.5 4.5 0 0 1 7.5 3h17A4.5 4.5 0 0 1 29 7.5V10H3z\"/><defs><linearGradient id=\"SVGTUoB5dlK\" x1=\"20.694\" x2=\"13.492\" y1=\"31.456\" y2=\"9.925\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#b3e0ff\"/><stop offset=\"1\" stop-color=\"#b3e0ff\"/></linearGradient><linearGradient id=\"SVGOnw1ccHu\" x1=\"18.786\" x2=\"22.353\" y1=\"17.182\" y2=\"33.578\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#dcf8ff\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#ff6ce8\" stop-opacity=\".7\"/></linearGradient><linearGradient id=\"SVGJXPo1beq\" x1=\"14.727\" x2=\"17.137\" y1=\"14.077\" y2=\"30.097\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0078d4\"/><stop offset=\"1\" stop-color=\"#0067bf\"/></linearGradient><linearGradient id=\"SVGyOHeQbJd\" x1=\"3\" x2=\"25.069\" y1=\"3\" y2=\"-4.352\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0094f0\"/><stop offset=\"1\" stop-color=\"#2764e7\"/></linearGradient><filter id=\"SVGJudnleuH\" width=\"16.667\" height=\"10.667\" x=\"7.667\" y=\"14.333\" color-interpolation-filters=\"sRGB\" filterUnits=\"userSpaceOnUse\"><feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\"/><feColorMatrix in=\"SourceAlpha\" result=\"hardAlpha\" values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"/><feOffset dy=\".667\"/><feGaussianBlur stdDeviation=\".667\"/><feColorMatrix values=\"0 0 0 0 0.1242 0 0 0 0 0.323337 0 0 0 0 0.7958 0 0 0 0.32 0\"/><feBlend in2=\"BackgroundImageFix\" result=\"effect1_dropShadow_378174_9802\"/><feBlend in=\"SourceGraphic\" in2=\"effect1_dropShadow_378174_9802\" result=\"shape\"/></filter></defs></g>",
      "width": 32,
      "height": 32
    },
    "globe-24": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVGMmOBQdsL)\" d=\"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10\"/><path fill=\"url(#SVGkjxtvv0q)\" fill-rule=\"evenodd\" d=\"M9.115 2.422a9.6 9.6 0 0 0-.85 1.704c-.48 1.23-.838 2.723-1.049 4.374H2.63q-.271.725-.43 1.5h4.87a29 29 0 0 0 .088 5h-4.7q.246.78.61 1.5h4.297c.215 1.255.52 2.397.9 3.374c.246.63.53 1.205.85 1.704A10 10 0 0 0 12 22a10 10 0 0 0 2.885-.422a9.6 9.6 0 0 0 .85-1.704c.38-.977.685-2.119.9-3.374h4.298q.364-.72.61-1.5h-4.7a29 29 0 0 0 .088-5h4.87a10 10 0 0 0-.43-1.5h-4.587c-.21-1.651-.57-3.144-1.05-4.374a9.6 9.6 0 0 0-.849-1.704A10 10 0 0 0 12 2a10 10 0 0 0-2.885.422M8.73 8.5c.2-1.47.522-2.774.934-3.829c.36-.92.77-1.612 1.194-2.062C11.278 2.163 11.663 2 12 2s.723.163 1.143.609c.423.45.835 1.142 1.194 2.062c.412 1.055.734 2.36.934 3.829zM12 22c.338 0 .723-.163 1.143-.609c.423-.45.835-1.142 1.194-2.062c.316-.81.58-1.765.775-2.829H8.888c.196 1.064.46 2.02.775 2.829c.36.92.77 1.612 1.194 2.062c.42.446.805.609 1.143.609M8.5 12c0 1.048.058 2.055.166 3h6.668a27 27 0 0 0 .094-5H8.573a27 27 0 0 0-.073 2\" clip-rule=\"evenodd\"/><defs><radialGradient id=\"SVGkjxtvv0q\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"rotate(224.662 12.654 4.738)scale(16.0089 16.0078)\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#25a2f0\"/><stop offset=\".974\" stop-color=\"#3bd5ff\"/></radialGradient><linearGradient id=\"SVGMmOBQdsL\" x1=\"6.444\" x2=\"20.889\" y1=\"5.333\" y2=\"18.667\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#29c3ff\"/><stop offset=\"1\" stop-color=\"#2052cb\"/></linearGradient></defs></g>",
      "width": 24,
      "height": 24
    }
  },
  "width": 20,
  "height": 20
}

/** 앱 시작 시 등록할 축소 세트 전체. */
export const ICON_COLLECTIONS: IconifyJSON[] = [mdi, fluentColor]
