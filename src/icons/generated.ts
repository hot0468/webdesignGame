// 이 파일은 `npm run icons`(scripts/build-icon-subset.mjs)가 생성한다. 직접 수정하지 말 것.
// src/에서 실제로 쓰는 아이콘 62개만 담은 축소 세트다 —
// 전체 세트(8천여 개)를 번들에 넣지 않기 위한 것이다.
import type { IconifyJSON } from '@iconify/react/offline'

/** devicon — 사용 중인 3개 */
export const devicon: IconifyJSON = {
  "prefix": "devicon",
  "icons": {
    "figma": {
      "body": "<path fill=\"#0acf83\" d=\"M45.5 129c11.9 0 21.5-9.6 21.5-21.5V86H45.5C33.6 86 24 95.6 24 107.5S33.6 129 45.5 129m0 0\"/><path fill=\"#a259ff\" d=\"M24 64.5C24 52.6 33.6 43 45.5 43H67v43H45.5C33.6 86 24 76.4 24 64.5m0 0\"/><path fill=\"#f24e1e\" d=\"M24 21.5C24 9.6 33.6 0 45.5 0H67v43H45.5C33.6 43 24 33.4 24 21.5m0 0\"/><path fill=\"#ff7262\" d=\"M67 0h21.5C100.4 0 110 9.6 110 21.5S100.4 43 88.5 43H67zm0 0\"/><path fill=\"#1abcfe\" d=\"M110 64.5c0 11.9-9.6 21.5-21.5 21.5S67 76.4 67 64.5S76.6 43 88.5 43S110 52.6 110 64.5m0 0\"/>"
    },
    "photoshop": {
      "body": "<path fill=\"#001e36\" d=\"M22.667 1.6h82.666C117.867 1.6 128 11.733 128 24.267v79.466c0 12.534-10.133 22.667-22.667 22.667H22.667C10.133 126.4 0 116.267 0 103.733V24.267C0 11.733 10.133 1.6 22.667 1.6\"/><path fill=\"#31a8ff\" d=\"M45.867 33.333c-1.6 0-3.2 0-4.853.054c-1.654.053-3.201.053-4.641.107c-1.44.053-2.773.053-4.053.106c-1.227.053-2.08.053-2.987.053c-.373 0-.533.213-.533.587v54.88c0 .48.213.694.64.694h10.347c.373-.054.64-.374.586-.747v-17.12c1.013 0 1.76 0 2.294.053c.533.053 1.386.053 2.666.053c4.374 0 8.374-.48 12-1.813c3.467-1.28 6.454-3.52 8.587-6.507q3.2-4.48 3.2-11.36c0-2.4-.426-4.693-1.226-6.933A17 17 0 0 0 64 39.36a19.05 19.05 0 0 0-7.147-4.374c-2.987-1.12-6.613-1.653-10.986-1.653m1.19 10.505c1.9.036 3.75.368 5.476 1.068c1.547.587 2.827 1.654 3.734 3.04a8.8 8.8 0 0 1 1.227 4.748c0 2.346-.534 4.16-1.654 5.493c-1.174 1.333-2.667 2.347-4.373 2.827c-1.974.64-4.054.959-6.134.959h-2.827c-.64 0-1.332-.053-2.079-.106v-17.92c.373-.054 1.12-.107 2.187-.053c1.013-.054 2.239-.054 3.626-.054q.41-.01.817-.002m44.73 2.723c-3.787 0-6.934.586-9.44 1.866c-2.293 1.067-4.267 2.773-5.6 4.906c-1.173 1.974-1.814 4.16-1.814 6.454a11.45 11.45 0 0 0 1.227 5.44a13.8 13.8 0 0 0 4.054 4.533a32.6 32.6 0 0 0 7.573 3.84c2.613 1.013 4.373 1.813 5.227 2.506c.853.694 1.28 1.387 1.28 2.134c0 .96-.587 1.867-1.44 2.24c-.96.48-2.4.747-4.427.747c-2.133 0-4.267-.267-6.294-.8a22.8 22.8 0 0 1-6.613-2.613c-.16-.107-.32-.16-.48-.053c-.16.106-.213.319-.213.479v9.28c-.053.427.213.8.587 1.013a21.5 21.5 0 0 0 5.44 1.707c2.4.48 4.799.693 7.252.693c3.84 0 7.041-.586 9.654-1.706c2.4-.96 4.48-2.613 5.973-4.747a12.4 12.4 0 0 0 2.08-7.093a11.5 11.5 0 0 0-1.226-5.493c-1.014-1.814-2.454-3.307-4.214-4.427a38.6 38.6 0 0 0-8.213-3.894a49 49 0 0 1-3.787-1.76c-.693-.373-1.333-.853-1.813-1.44c-.32-.427-.533-.906-.533-1.386s.16-1.013.426-1.44c.374-.533.96-.907 1.653-1.067c1.014-.266 2.134-.427 3.2-.374c2.027 0 4 .267 5.974.694c1.814.373 3.52.96 5.12 1.814c.213.106.48.106.96 0a.66.66 0 0 0 .267-.534v-8.693c0-.214-.054-.427-.107-.64c-.107-.213-.32-.427-.533-.48A18.8 18.8 0 0 0 98.4 47.04a46 46 0 0 0-6.613-.48z\"/>"
    },
    "vscode": {
      "body": "<mask id=\"SVGescYAbDI\" width=\"128\" height=\"128\" x=\"0\" y=\"0\" maskUnits=\"userSpaceOnUse\" style=\"mask-type:alpha\"><path fill=\"#fff\" fill-rule=\"evenodd\" d=\"M90.767 127.126a7.97 7.97 0 0 0 6.35-.244l26.353-12.681a8 8 0 0 0 4.53-7.209V21.009a8 8 0 0 0-4.53-7.21L97.117 1.12a7.97 7.97 0 0 0-9.093 1.548l-50.45 46.026L15.6 32.013a5.33 5.33 0 0 0-6.807.302l-7.048 6.411a5.335 5.335 0 0 0-.006 7.888L20.796 64L1.74 81.387a5.336 5.336 0 0 0 .006 7.887l7.048 6.411a5.33 5.33 0 0 0 6.807.303l21.974-16.68l50.45 46.025a8 8 0 0 0 2.743 1.793Zm5.252-92.183L57.74 64l38.28 29.058V34.943Z\" clip-rule=\"evenodd\"/></mask><g mask=\"url(#SVGescYAbDI)\"><path fill=\"#0065a9\" d=\"M123.471 13.82L97.097 1.12A7.97 7.97 0 0 0 88 2.668L1.662 81.387a5.333 5.333 0 0 0 .006 7.887l7.052 6.411a5.33 5.33 0 0 0 6.811.303l103.971-78.875c3.488-2.646 8.498-.158 8.498 4.22v-.306a8 8 0 0 0-4.529-7.208Z\"/><g filter=\"url(#SVGUBw6ic8w)\"><path fill=\"#007acc\" d=\"m123.471 114.181l-26.374 12.698A7.97 7.97 0 0 1 88 125.333L1.662 46.613a5.333 5.333 0 0 1 .006-7.887l7.052-6.411a5.33 5.33 0 0 1 6.811-.303l103.971 78.874c3.488 2.647 8.498.159 8.498-4.219v.306a8 8 0 0 1-4.529 7.208\"/></g><g filter=\"url(#SVGg9RgH3Uo)\"><path fill=\"#1f9cf0\" d=\"M97.098 126.882A7.98 7.98 0 0 1 88 125.333c2.952 2.952 8 .861 8-3.314V5.98c0-4.175-5.048-6.266-8-3.313a7.98 7.98 0 0 1 9.098-1.549L123.467 13.8A8 8 0 0 1 128 21.01v85.982a8 8 0 0 1-4.533 7.21z\"/></g><path fill=\"url(#SVGpqCa3cMW)\" fill-rule=\"evenodd\" d=\"M90.69 127.126a7.97 7.97 0 0 0 6.349-.244l26.353-12.681a8 8 0 0 0 4.53-7.21V21.009a8 8 0 0 0-4.53-7.21L97.039 1.12a7.97 7.97 0 0 0-9.093 1.548l-50.45 46.026l-21.974-16.68a5.33 5.33 0 0 0-6.807.302l-7.048 6.411a5.336 5.336 0 0 0-.006 7.888L20.718 64L1.662 81.386a5.335 5.335 0 0 0 .006 7.888l7.048 6.411a5.33 5.33 0 0 0 6.807.303l21.975-16.681l50.45 46.026a8 8 0 0 0 2.742 1.793m5.252-92.184L57.662 64l38.28 29.057z\" clip-rule=\"evenodd\" opacity=\".25\"/></g><defs><filter id=\"SVGUBw6ic8w\" width=\"144.744\" height=\"113.408\" x=\"-8.411\" y=\"22.594\" color-interpolation-filters=\"sRGB\" filterUnits=\"userSpaceOnUse\"><feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\"/><feColorMatrix in=\"SourceAlpha\" result=\"hardAlpha\" values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"/><feOffset/><feGaussianBlur stdDeviation=\"4.167\"/><feColorMatrix values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"/><feBlend in2=\"BackgroundImageFix\" mode=\"overlay\" result=\"effect1_dropShadow_1_36\"/><feBlend in=\"SourceGraphic\" in2=\"effect1_dropShadow_1_36\" result=\"shape\"/></filter><filter id=\"SVGg9RgH3Uo\" width=\"56.667\" height=\"144.007\" x=\"79.667\" y=\"-8.004\" color-interpolation-filters=\"sRGB\" filterUnits=\"userSpaceOnUse\"><feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\"/><feColorMatrix in=\"SourceAlpha\" result=\"hardAlpha\" values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"/><feOffset/><feGaussianBlur stdDeviation=\"4.167\"/><feColorMatrix values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"/><feBlend in2=\"BackgroundImageFix\" mode=\"overlay\" result=\"effect1_dropShadow_1_36\"/><feBlend in=\"SourceGraphic\" in2=\"effect1_dropShadow_1_36\" result=\"shape\"/></filter><linearGradient id=\"SVGpqCa3cMW\" x1=\"63.922\" x2=\"63.922\" y1=\".33\" y2=\"127.67\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0\"/></linearGradient></defs>"
    }
  },
  "width": 128,
  "height": 128
}

/** mdi — 사용 중인 50개 */
export const mdi: IconifyJSON = {
  "prefix": "mdi",
  "icons": {
    "account-group-outline": {
      "body": "<path fill=\"currentColor\" d=\"M12 5a3.5 3.5 0 0 0-3.5 3.5A3.5 3.5 0 0 0 12 12a3.5 3.5 0 0 0 3.5-3.5A3.5 3.5 0 0 0 12 5m0 2a1.5 1.5 0 0 1 1.5 1.5A1.5 1.5 0 0 1 12 10a1.5 1.5 0 0 1-1.5-1.5A1.5 1.5 0 0 1 12 7M5.5 8A2.5 2.5 0 0 0 3 10.5c0 .94.53 1.75 1.29 2.18c.36.2.77.32 1.21.32s.85-.12 1.21-.32c.37-.21.68-.51.91-.87A5.42 5.42 0 0 1 6.5 8.5v-.28c-.3-.14-.64-.22-1-.22m13 0c-.36 0-.7.08-1 .22v.28c0 1.2-.39 2.36-1.12 3.31c.12.19.25.34.4.49a2.48 2.48 0 0 0 1.72.7c.44 0 .85-.12 1.21-.32c.76-.43 1.29-1.24 1.29-2.18A2.5 2.5 0 0 0 18.5 8M12 14c-2.34 0-7 1.17-7 3.5V19h14v-1.5c0-2.33-4.66-3.5-7-3.5m-7.29.55C2.78 14.78 0 15.76 0 17.5V19h3v-1.93c0-1.01.69-1.85 1.71-2.52m14.58 0c1.02.67 1.71 1.51 1.71 2.52V19h3v-1.5c0-1.74-2.78-2.72-4.71-2.95M12 16c1.53 0 3.24.5 4.23 1H7.77c.99-.5 2.7-1 4.23-1\"/>"
    },
    "account-outline": {
      "body": "<path fill=\"currentColor\" d=\"M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1\"/>"
    },
    "alert-circle-outline": {
      "body": "<path fill=\"currentColor\" d=\"M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8\"/>"
    },
    "alert-outline": {
      "body": "<path fill=\"currentColor\" d=\"M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2\"/>"
    },
    "arrow-left": {
      "body": "<path fill=\"currentColor\" d=\"M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z\"/>"
    },
    "arrow-right": {
      "body": "<path fill=\"currentColor\" d=\"M4 11v2h12l-5.5 5.5l1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5L16 11z\"/>"
    },
    "brush": {
      "body": "<path fill=\"currentColor\" d=\"m20.71 4.63l-1.34-1.34c-.37-.39-1.02-.39-1.41 0L9 12.25L11.75 15l8.96-8.96c.39-.39.39-1.04 0-1.41M7 14a3 3 0 0 0-3 3c0 1.31-1.16 2-2 2c.92 1.22 2.5 2 4 2a4 4 0 0 0 4-4a3 3 0 0 0-3-3\"/>"
    },
    "calendar-week-outline": {
      "body": "<path fill=\"currentColor\" d=\"M5 3h1V1h2v2h8V1h2v2h1c1.11 0 2 .89 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 16h14V9H5zM5 7h14V5H5zm12 4v2H7v-2z\"/>"
    },
    "chat-outline": {
      "body": "<path fill=\"currentColor\" d=\"M12 3C6.5 3 2 6.58 2 11a7.22 7.22 0 0 0 2.75 5.5c0 .6-.42 2.17-2.75 4.5c2.37-.11 4.64-1 6.47-2.5c1.14.33 2.34.5 3.53.5c5.5 0 10-3.58 10-8s-4.5-8-10-8m0 14c-4.42 0-8-2.69-8-6s3.58-6 8-6s8 2.69 8 6s-3.58 6-8 6\"/>"
    },
    "chat-processing-outline": {
      "body": "<path fill=\"currentColor\" d=\"M12 3C6.5 3 2 6.58 2 11a7.22 7.22 0 0 0 2.75 5.5c0 .6-.42 2.17-2.75 4.5c2.37-.11 4.64-1 6.47-2.5c1.14.33 2.34.5 3.53.5c5.5 0 10-3.58 10-8s-4.5-8-10-8m0 14c-4.42 0-8-2.69-8-6s3.58-6 8-6s8 2.69 8 6s-3.58 6-8 6m5-5v-2h-2v2zm-4 0v-2h-2v2zm-4 0v-2H7v2z\"/>"
    },
    "check-circle-outline": {
      "body": "<path fill=\"currentColor\" d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4l8-8z\"/>"
    },
    "circle-outline": {
      "body": "<path fill=\"currentColor\" d=\"M12 20a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2\"/>"
    },
    "clipboard-text-outline": {
      "body": "<path fill=\"currentColor\" d=\"M19 3h-4.18C14.25 1.44 12.53.64 11 1.2c-.86.3-1.5.96-1.82 1.8H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-7 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h10V5h2v14H5V5h2zm10 4H7V9h10zm-2 4H7v-2h8z\"/>"
    },
    "clock-outline": {
      "body": "<path fill=\"currentColor\" d=\"M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z\"/>"
    },
    "close": {
      "body": "<path fill=\"currentColor\" d=\"M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z\"/>"
    },
    "cloud-upload-outline": {
      "body": "<path fill=\"currentColor\" d=\"M6.5 20q-2.28 0-3.89-1.57Q1 16.85 1 14.58q0-1.95 1.17-3.48q1.18-1.53 3.08-1.95q.63-2.3 2.5-3.72Q9.63 4 12 4q2.93 0 4.96 2.04Q19 8.07 19 11q1.73.2 2.86 1.5q1.14 1.28 1.14 3q0 1.88-1.31 3.19T18.5 20H13q-.82 0-1.41-.59Q11 18.83 11 18v-5.15L9.4 14.4L8 13l4-4l4 4l-1.4 1.4l-1.6-1.55V18h5.5q1.05 0 1.77-.73q.73-.72.73-1.77t-.73-1.77Q19.55 13 18.5 13H17v-2q0-2.07-1.46-3.54Q14.08 6 12 6Q9.93 6 8.46 7.46Q7 8.93 7 11h-.5q-1.45 0-2.47 1.03Q3 13.05 3 14.5T4.03 17q1.02 1 2.47 1H9v2m3-7\"/>"
    },
    "crop": {
      "body": "<path fill=\"currentColor\" d=\"M7 17V1H5v4H1v2h4v10a2 2 0 0 0 2 2h10v4h2v-4h4v-2m-6-2h2V7a2 2 0 0 0-2-2H9v2h8z\"/>"
    },
    "cursor-move": {
      "body": "<path fill=\"currentColor\" d=\"M13 6v5h5V7.75L22.25 12L18 16.25V13h-5v5h3.25L12 22.25L7.75 18H11v-5H6v3.25L1.75 12L6 7.75V11h5V6H7.75L12 1.75L16.25 6z\"/>"
    },
    "email-open-outline": {
      "body": "<path fill=\"currentColor\" d=\"M21.03 6.29L12 .64L2.97 6.29C2.39 6.64 2 7.27 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-.73-.39-1.36-.97-1.71M20 18H4v-8l8 5l8-5zm-8-5L4 8l8-5l8 5z\"/>"
    },
    "emoticon-happy-outline": {
      "body": "<path fill=\"currentColor\" d=\"M20 12a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8m2 0a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2a10 10 0 0 1 10 10M10 9.5c0 .8-.7 1.5-1.5 1.5S7 10.3 7 9.5S7.7 8 8.5 8s1.5.7 1.5 1.5m7 0c0 .8-.7 1.5-1.5 1.5S14 10.3 14 9.5S14.7 8 15.5 8s1.5.7 1.5 1.5m-5 7.73c-1.75 0-3.29-.73-4.19-1.81L9.23 14c.45.72 1.52 1.23 2.77 1.23s2.32-.51 2.77-1.23l1.42 1.42c-.9 1.08-2.44 1.81-4.19 1.81\"/>"
    },
    "eraser": {
      "body": "<path fill=\"currentColor\" d=\"m16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.01 4.01 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53l-4.95-4.95z\"/>"
    },
    "file-code-outline": {
      "body": "<path fill=\"currentColor\" d=\"M14 2H6a2 2 0 0 0-2 2v16c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V8zm4 18H6V4h7v5h5zm-8.46-4.35l2.09 2.09L10.35 19L7 15.65l3.35-3.35l1.28 1.26zm7.46 0L13.65 19l-1.27-1.26l2.09-2.09l-2.09-2.09l1.27-1.26z\"/>"
    },
    "file-image-outline": {
      "body": "<path fill=\"currentColor\" d=\"m14 2l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 18V9h-5V4H6v16zm-1-7v6H7l5-5l2 2m-4-5.5A1.5 1.5 0 0 1 8.5 12A1.5 1.5 0 0 1 7 10.5A1.5 1.5 0 0 1 8.5 9a1.5 1.5 0 0 1 1.5 1.5\"/>"
    },
    "file-multiple-outline": {
      "body": "<path fill=\"currentColor\" d=\"M16 0H8C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6zm4 18H8V2h7v5h5zM4 4v18h16v2H4c-1.1 0-2-.9-2-2V4z\"/>"
    },
    "file-outline": {
      "body": "<path fill=\"currentColor\" d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5z\"/>"
    },
    "folder-multiple-outline": {
      "body": "<path fill=\"currentColor\" d=\"M22 4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h6l2 2zM2 6v14h18v2H2a2 2 0 0 1-2-2V6zm4 0v10h16V6z\"/>"
    },
    "folder-outline": {
      "body": "<path fill=\"currentColor\" d=\"M20 18H4V8h16m0-2h-8l-2-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2\"/>"
    },
    "format-text": {
      "body": "<path fill=\"currentColor\" d=\"m18.5 4l1.16 4.35l-.96.26c-.45-.87-.91-1.74-1.44-2.18C16.73 6 16.11 6 15.5 6H13v10.5c0 .5 0 1 .33 1.25c.34.25 1 .25 1.67.25v1H9v-1c.67 0 1.33 0 1.67-.25c.33-.25.33-.75.33-1.25V6H8.5c-.61 0-1.23 0-1.76.43c-.53.44-.99 1.31-1.44 2.18l-.96-.26L5.5 4z\"/>"
    },
    "image-plus-outline": {
      "body": "<path fill=\"currentColor\" d=\"M13 19c0 .7.13 1.37.35 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v8.35c-.63-.22-1.3-.35-2-.35V5H5v14zm.96-6.71l-2.75 3.54l-1.96-2.36L6.5 17h6.85c.4-1.12 1.12-2.09 2.05-2.79zM20 18v-3h-2v3h-3v2h3v3h2v-3h3v-2z\"/>"
    },
    "inbox-arrow-down-outline": {
      "body": "<path fill=\"currentColor\" d=\"M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2M5 19v-2h3.13a4.13 4.13 0 0 0 1.27 2m9.6 0h-4.4a4.13 4.13 0 0 0 1.27-2H19m0-2h-5v1a2 2 0 0 1-4 0v-1H5V5h14m-3 5h-2V7h-4v3H8l4 4\"/>"
    },
    "key-outline": {
      "body": "<path fill=\"currentColor\" d=\"M21 18h-6v-3h-1.7c-1.1 2.4-3.6 4-6.3 4c-3.9 0-7-3.1-7-7s3.1-7 7-7c2.7 0 5.2 1.6 6.3 4H24v6h-3zm-4-2h2v-3h3v-2H11.9l-.2-.7C11 8.3 9.1 7 7 7c-2.8 0-5 2.2-5 5s2.2 5 5 5c2.1 0 4-1.3 4.7-3.3l.2-.7H17zM7 15c-1.7 0-3-1.3-3-3s1.3-3 3-3s3 1.3 3 3s-1.3 3-3 3m0-4c-.6 0-1 .4-1 1s.4 1 1 1s1-.4 1-1s-.4-1-1-1\"/>"
    },
    "lan-connect": {
      "body": "<path fill=\"currentColor\" d=\"M4 1c-1.11 0-2 .89-2 2v4c0 1.11.89 2 2 2H1v2h12V9h-3c1.11 0 2-.89 2-2V3c0-1.11-.89-2-2-2zm0 2h6v4H4zM3 13v7h7v-2H5v-5zm11 0c-1.11 0-2 .89-2 2v4c0 1.11.89 2 2 2h-3v2h12v-2h-3c1.11 0 2-.89 2-2v-4c0-1.11-.89-2-2-2zm0 2h6v4h-6z\"/>"
    },
    "lasso": {
      "body": "<path fill=\"currentColor\" d=\"M22 9c0-3.87-4.5-7-10-7S2 5.13 2 9v.025c.01 1.87 1.068 3.57 2.78 4.825l.003-.009q.61.445 1.321.81A3.5 3.5 0 0 0 6 15.5c0 1.26.67 2.37 1.67 3c-.21.61-.7 2.46.63 3.55c1.61 1.33 3.36.92 4.26.64c.252-.077.505-.182.78-.296c.716-.296 1.57-.649 2.88-.714c1.456-.08 2.712.13 3.345.237q.232.04.345.053s.95 0 1.06-.93c.11-.94-.94-1.07-.94-1.07s-1.6-.27-3.64-.26c-1.408.005-2.645.45-3.687.824c-1.26.453-2.233.803-2.873.146c-.65-.68-.44-1.32-.23-1.68a3.49 3.49 0 0 0 3.37-3.033a14 14 0 0 0 1.53-.187c4.175-.756 7.3-3.35 7.49-6.476Q22 9.154 22 9m-2 0c0 1.255-.743 2.405-1.968 3.284c-1.332.955-3.235 1.591-5.378 1.7A3.5 3.5 0 0 0 9.5 12c-.927 0-1.772.363-2.399.953a7.6 7.6 0 0 1-1.312-.802l.001-.001C4.688 11.303 4.021 10.224 4 9.056V9c0-2.76 3.58-5 8-5s8 2.24 8 5m-9.001 6.56q-.01.21-.07.4A1.5 1.5 0 0 1 9.5 17a1.5 1.5 0 0 1-1.498-1.584A1.5 1.5 0 0 1 11 15.56\"/>"
    },
    "layers-outline": {
      "body": "<path fill=\"currentColor\" d=\"m12 18.54l7.37-5.74L21 14.07l-9 7l-9-7l1.62-1.26zM12 16L3 9l9-7l9 7zm0-11.47L6.26 9L12 13.47L17.74 9z\"/>"
    },
    "lightning-bolt-outline": {
      "body": "<path fill=\"currentColor\" d=\"M11 9.47V11h3.76L13 14.53V13H9.24zM13 1L6 15h5v8l7-14h-5z\"/>"
    },
    "link-variant-off": {
      "body": "<path fill=\"currentColor\" d=\"M2 5.27L3.28 4L20 20.72L18.73 22l-4.83-4.83l-2.61 2.61a5.003 5.003 0 0 1-7.07 0a5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.98 2.98 0 0 0 0 4.24a2.98 2.98 0 0 0 4.24 0l2.62-2.6l-1.62-1.61c-.01.24-.11.49-.29.68c-.39.39-1.03.39-1.42 0A4.97 4.97 0 0 1 7.72 11zm10.71-1.05a5.003 5.003 0 0 1 7.07 0a5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.98 2.98 0 0 0 0-4.24a2.98 2.98 0 0 0-4.24 0l-3.33 3.33l-1.41-1.42zm.7 4.95c.39-.39 1.03-.39 1.42 0a5 5 0 0 1 1.23 5.06l-1.78-1.77c-.05-.68-.34-1.35-.87-1.87a.973.973 0 0 1 0-1.42\"/>"
    },
    "lock-outline": {
      "body": "<path fill=\"currentColor\" d=\"M12 17a2 2 0 0 1-2-2c0-1.11.89-2 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2m6 3V10H6v10zm0-12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10c0-1.11.89-2 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3\"/>"
    },
    "logout": {
      "body": "<path fill=\"currentColor\" d=\"m17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5M4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z\"/>"
    },
    "magnify": {
      "body": "<path fill=\"currentColor\" d=\"M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5\"/>"
    },
    "play-circle-outline": {
      "body": "<path fill=\"currentColor\" d=\"M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m-2 14.5l6-4.5l-6-4.5z\"/>"
    },
    "puzzle-outline": {
      "body": "<path fill=\"currentColor\" d=\"M22 13.5c0 1.76-1.3 3.22-3 3.46V20a2 2 0 0 1-2 2h-3.8v-.3a2.7 2.7 0 0 0-2.7-2.7c-1.5 0-2.7 1.21-2.7 2.7v.3H4a2 2 0 0 1-2-2v-3.8h.3C3.79 16.2 5 15 5 13.5s-1.21-2.7-2.7-2.7H2V7a2 2 0 0 1 2-2h3.04c.24-1.7 1.7-3 3.46-3s3.22 1.3 3.46 3H17a2 2 0 0 1 2 2v3.04c1.7.24 3 1.7 3 3.46M17 15h1.5a1.5 1.5 0 0 0 1.5-1.5a1.5 1.5 0 0 0-1.5-1.5H17V7h-5V5.5A1.5 1.5 0 0 0 10.5 4A1.5 1.5 0 0 0 9 5.5V7H4v2.12c1.76.68 3 2.38 3 4.38s-1.25 3.7-3 4.38V20h2.12a4.7 4.7 0 0 1 4.38-3c2 0 3.7 1.25 4.38 3H17z\"/>"
    },
    "refresh": {
      "body": "<path fill=\"currentColor\" d=\"M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 0 0-8 8a8 8 0 0 0 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18a6 6 0 0 1-6-6a6 6 0 0 1 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z\"/>"
    },
    "selection": {
      "body": "<path fill=\"currentColor\" d=\"M2 4a2 2 0 0 1 2-2h3v2H4v3H2zm20 0v3h-2V4h-3V2h3a2 2 0 0 1 2 2m-2 16v-3h2v3a2 2 0 0 1-2 2h-3v-2zM2 20v-3h2v3h3v2H4a2 2 0 0 1-2-2m8-18h4v2h-4zm0 18h4v2h-4zm10-10h2v4h-2zM2 10h2v4H2z\"/>"
    },
    "send-outline": {
      "body": "<path fill=\"currentColor\" d=\"m4 6.03l7.5 3.22l-7.5-1zm7.5 8.72L4 17.97v-2.22zM2 3v7l15 2l-15 2v7l21-9z\"/>"
    },
    "shape-outline": {
      "body": "<path fill=\"currentColor\" d=\"M11 13.5v8H3v-8zm-2 2H5v4h4zM12 2l5.5 9h-11zm0 3.86L10.08 9h3.84zM17.5 13c2.5 0 4.5 2 4.5 4.5S20 22 17.5 22S13 20 13 17.5s2-4.5 4.5-4.5m0 2a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5\"/>"
    },
    "source-branch": {
      "body": "<path fill=\"currentColor\" d=\"M13 14c-3.36 0-4.46 1.35-4.82 2.24C9.25 16.7 10 17.76 10 19a3 3 0 0 1-3 3a3 3 0 0 1-3-3c0-1.31.83-2.42 2-2.83V7.83A2.99 2.99 0 0 1 4 5a3 3 0 0 1 3-3a3 3 0 0 1 3 3c0 1.31-.83 2.42-2 2.83v5.29c.88-.65 2.16-1.12 4-1.12c2.67 0 3.56-1.34 3.85-2.23A3.01 3.01 0 0 1 14 7a3 3 0 0 1 3-3a3 3 0 0 1 3 3c0 1.34-.88 2.5-2.09 2.86C17.65 11.29 16.68 14 13 14m-6 4a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1M7 4a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1m10 2a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1\"/>"
    },
    "star": {
      "body": "<path fill=\"currentColor\" d=\"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2L9.19 8.62L2 9.24l5.45 4.73L5.82 21z\"/>"
    },
    "star-outline": {
      "body": "<path fill=\"currentColor\" d=\"m12 15.39l-3.76 2.27l.99-4.28l-3.32-2.88l4.38-.37L12 6.09l1.71 4.04l4.38.37l-3.32 2.88l.99 4.28M22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.45 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03z\"/>"
    },
    "trash-can-outline": {
      "body": "<path fill=\"currentColor\" d=\"M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z\"/>"
    },
    "wallet-outline": {
      "body": "<path fill=\"currentColor\" d=\"M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2.28A2 2 0 0 0 22 15V9a2 2 0 0 0-1-1.72V5a2 2 0 0 0-2-2zm0 2h14v2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6v2H5zm8 4h7v6h-7zm3 1.5a1.5 1.5 0 0 0-1.5 1.5a1.5 1.5 0 0 0 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5a1.5 1.5 0 0 0-1.5-1.5\"/>"
    }
  },
  "width": 24,
  "height": 24
}

/** fluent-color — 사용 중인 9개 */
export const fluentColor: IconifyJSON = {
  "prefix": "fluent-color",
  "icons": {
    "briefcase-24": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVGzrGP1bSw)\" fill-rule=\"evenodd\" d=\"M13.75 2A2.25 2.25 0 0 1 16 4.25V6l-4 2.31L8 6V4.25A2.25 2.25 0 0 1 10.25 2zm-3.5 1.5a.75.75 0 0 0-.75.75V6h5V4.25a.75.75 0 0 0-.75-.75z\" clip-rule=\"evenodd\"/><path fill=\"url(#SVG40XRKePu)\" d=\"M3 11h18v5.75A3.25 3.25 0 0 1 17.75 20H6.25A3.25 3.25 0 0 1 3 16.75z\"/><path fill=\"url(#SVGiHPn8bin)\" d=\"M3 11h18v5.75A3.25 3.25 0 0 1 17.75 20H6.25A3.25 3.25 0 0 1 3 16.75z\"/><path fill=\"url(#SVGnlbMbwZH)\" d=\"M3 9.25A3.25 3.25 0 0 1 6.25 6h11.5A3.25 3.25 0 0 1 21 9.25v3A1.75 1.75 0 0 1 19.25 14H4.75A1.75 1.75 0 0 1 3 12.25z\"/><path fill=\"url(#SVGX7Xlhe2t)\" d=\"M13 11h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1\"/><defs><linearGradient id=\"SVGzrGP1bSw\" x1=\"7.637\" x2=\"9.95\" y1=\"2.631\" y2=\"9.253\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0094f0\"/><stop offset=\"1\" stop-color=\"#163697\"/></linearGradient><linearGradient id=\"SVG40XRKePu\" x1=\"3.643\" x2=\"8.505\" y1=\"12.688\" y2=\"29.266\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0fafff\"/><stop offset=\"1\" stop-color=\"#cc23d1\"/></linearGradient><linearGradient id=\"SVGnlbMbwZH\" x1=\"4.8\" x2=\"13.623\" y1=\"6.332\" y2=\"16.375\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#80f1e6\"/><stop offset=\".552\" stop-color=\"#40c4f5\"/><stop offset=\"1\" stop-color=\"#00a2fa\"/></linearGradient><linearGradient id=\"SVGX7Xlhe2t\" x1=\"12\" x2=\"12\" y1=\"11\" y2=\"15\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#b8f5ff\"/><stop offset=\".844\" stop-color=\"#7cecff\"/></linearGradient><radialGradient id=\"SVGiHPn8bin\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(0 9 -20.0637 0 12 11)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".337\" stop-color=\"#194694\"/><stop offset=\".747\" stop-color=\"#367af2\" stop-opacity=\"0\"/></radialGradient></defs></g>",
      "width": 24,
      "height": 24
    },
    "building-32": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVG19CFuJOe)\" d=\"M27 30a1 1 0 0 0 1-1V16.25A3.25 3.25 0 0 0 24.75 13H22V5.25A3.25 3.25 0 0 0 18.75 2H7a3 3 0 0 0-3 3v24a1 1 0 0 0 1 1z\"/><path fill=\"url(#SVGjkPWSd2N)\" d=\"M21.5 24a1.5 1.5 0 0 1 1.5 1.5V30h-7l-1-2.5l1-3.5z\"/><path fill=\"url(#SVG8TcaAedb)\" d=\"M10.5 24A1.5 1.5 0 0 0 9 25.5V30h7v-6z\"/><path fill=\"url(#SVGsE2bCeXR)\" d=\"M10.5 10a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m0 5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m1.5 3.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m3.5-8.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m1.5 3.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0M15.5 20a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m6.5-1.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0\"/><defs><linearGradient id=\"SVG19CFuJOe\" x1=\"4\" x2=\"30.607\" y1=\"2.875\" y2=\"32.072\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#29c3ff\"/><stop offset=\"1\" stop-color=\"#2764e7\"/></linearGradient><linearGradient id=\"SVGjkPWSd2N\" x1=\"16\" x2=\"21.149\" y1=\"23\" y2=\"29.017\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0067bf\"/><stop offset=\"1\" stop-color=\"#003580\"/></linearGradient><linearGradient id=\"SVG8TcaAedb\" x1=\"9.25\" x2=\"14.081\" y1=\"25.313\" y2=\"30.332\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0067bf\"/><stop offset=\"1\" stop-color=\"#003580\"/></linearGradient><linearGradient id=\"SVGsE2bCeXR\" x1=\"12.9\" x2=\"17.649\" y1=\"5.556\" y2=\"22.653\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fdfdfd\"/><stop offset=\"1\" stop-color=\"#b3e0ff\"/></linearGradient></defs></g>",
      "width": 32,
      "height": 32
    },
    "building-store-24": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVGwUgtLdtI)\" d=\"M3 9.75A.75.75 0 0 1 3.75 9h16.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75z\"/><path fill=\"url(#SVGXufiEe2l)\" fill-opacity=\".8\" d=\"M6 13.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75V22H6z\"/><path fill=\"url(#SVGTsGPHdQz)\" fill-opacity=\".8\" d=\"M13 13.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1-.75-.75z\"/><path fill=\"url(#SVGD4tYAcor)\" d=\"m14 6l-1-4h4.909a1 1 0 0 1 .738.326l3.092 3.388a1 1 0 0 1 .261.674V8a4 4 0 0 1-8 0z\"/><path fill=\"url(#SVG3R7RHbCj)\" d=\"M2 6.388a1 1 0 0 1 .261-.674l3.092-3.388A1 1 0 0 1 6.09 2H11l-1 4v2a4 4 0 0 1-8 0z\"/><path fill=\"url(#SVGdYvFhdSh)\" d=\"M8 6.176a1 1 0 0 1 .062-.34L9.5 2h5l1.438 3.835a1 1 0 0 1 .062.341V8a4 4 0 0 1-8 0z\"/><defs><linearGradient id=\"SVGwUgtLdtI\" x1=\"7.5\" x2=\"9.684\" y1=\"10.182\" y2=\"22.659\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".312\" stop-color=\"#29c3ff\"/><stop offset=\"1\" stop-color=\"#0094f0\"/></linearGradient><linearGradient id=\"SVGXufiEe2l\" x1=\"6.214\" x2=\"12.033\" y1=\"14.688\" y2=\"18.718\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0067bf\"/><stop offset=\"1\" stop-color=\"#003580\"/></linearGradient><linearGradient id=\"SVGTsGPHdQz\" x1=\"14.5\" x2=\"16.327\" y1=\"12.444\" y2=\"19.02\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fdfdfd\"/><stop offset=\"1\" stop-color=\"#b3e0ff\"/></linearGradient><linearGradient id=\"SVGD4tYAcor\" x1=\"17.154\" x2=\"17.154\" y1=\"2\" y2=\"6.375\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fb6f7b\"/><stop offset=\"1\" stop-color=\"#d7257d\"/></linearGradient><linearGradient id=\"SVG3R7RHbCj\" x1=\"6.154\" x2=\"6.154\" y1=\"2\" y2=\"6.375\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fb6f7b\"/><stop offset=\"1\" stop-color=\"#d7257d\"/></linearGradient><linearGradient id=\"SVGdYvFhdSh\" x1=\"12\" x2=\"12\" y1=\"2\" y2=\"6.375\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".304\" stop-color=\"#ff9fb2\"/><stop offset=\"1\" stop-color=\"#f97dbd\"/></linearGradient></defs></g>",
      "width": 24,
      "height": 24
    },
    "calendar-32": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVGTUoB5dlK)\" d=\"M29 24.5a4.5 4.5 0 0 1-4.5 4.5h-17A4.5 4.5 0 0 1 3 24.5V10l13-1l13 1z\"/><path fill=\"url(#SVGOnw1ccHu)\" d=\"M29 24.5a4.5 4.5 0 0 1-4.5 4.5h-17A4.5 4.5 0 0 1 3 24.5V10l13-1l13 1z\"/><g filter=\"url(#SVGJudnleuH)\"><path fill=\"url(#SVGJXPo1beq)\" d=\"M10.5 18a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m1.5 3.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m4 1.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m1.5-6.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m4 1.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3\"/></g><path fill=\"url(#SVGyOHeQbJd)\" d=\"M3 7.5A4.5 4.5 0 0 1 7.5 3h17A4.5 4.5 0 0 1 29 7.5V10H3z\"/><defs><linearGradient id=\"SVGTUoB5dlK\" x1=\"20.694\" x2=\"13.492\" y1=\"31.456\" y2=\"9.925\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#b3e0ff\"/><stop offset=\"1\" stop-color=\"#b3e0ff\"/></linearGradient><linearGradient id=\"SVGOnw1ccHu\" x1=\"18.786\" x2=\"22.353\" y1=\"17.182\" y2=\"33.578\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#dcf8ff\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#ff6ce8\" stop-opacity=\".7\"/></linearGradient><linearGradient id=\"SVGJXPo1beq\" x1=\"14.727\" x2=\"17.137\" y1=\"14.077\" y2=\"30.097\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0078d4\"/><stop offset=\"1\" stop-color=\"#0067bf\"/></linearGradient><linearGradient id=\"SVGyOHeQbJd\" x1=\"3\" x2=\"25.069\" y1=\"3\" y2=\"-4.352\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0094f0\"/><stop offset=\"1\" stop-color=\"#2764e7\"/></linearGradient><filter id=\"SVGJudnleuH\" width=\"16.667\" height=\"10.667\" x=\"7.667\" y=\"14.333\" color-interpolation-filters=\"sRGB\" filterUnits=\"userSpaceOnUse\"><feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\"/><feColorMatrix in=\"SourceAlpha\" result=\"hardAlpha\" values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"/><feOffset dy=\".667\"/><feGaussianBlur stdDeviation=\".667\"/><feColorMatrix values=\"0 0 0 0 0.1242 0 0 0 0 0.323337 0 0 0 0 0.7958 0 0 0 0.32 0\"/><feBlend in2=\"BackgroundImageFix\" result=\"effect1_dropShadow_378174_9802\"/><feBlend in=\"SourceGraphic\" in2=\"effect1_dropShadow_378174_9802\" result=\"shape\"/></filter></defs></g>",
      "width": 32,
      "height": 32
    },
    "chat-32": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVG2F7VCYvE)\" d=\"M2 16C2 8.268 8.268 2 16 2s14 6.268 14 14s-6.268 14-14 14c-2.368 0-4.602-.589-6.56-1.629l-5.528 1.572A1.5 1.5 0 0 1 2.06 28.09l1.572-5.527A13.94 13.94 0 0 1 2 16m8-3a1 1 0 0 0 1 1h10a1 1 0 1 0 0-2H11a1 1 0 0 0-1 1m1 5a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z\"/><path fill=\"url(#SVGchzAGLVB)\" d=\"M10 13a1 1 0 0 0 1 1h10a1 1 0 1 0 0-2H11a1 1 0 0 0-1 1m1 5a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z\"/><defs><linearGradient id=\"SVG2F7VCYvE\" x1=\"3\" x2=\"27.447\" y1=\"7.25\" y2=\"48.928\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#0fafff\"/><stop offset=\"1\" stop-color=\"#cc23d1\"/></linearGradient><linearGradient id=\"SVGchzAGLVB\" x1=\"11.05\" x2=\"11.948\" y1=\"12.14\" y2=\"20.828\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fdfdfd\"/><stop offset=\"1\" stop-color=\"#cceaff\"/></linearGradient></defs></g>",
      "width": 32,
      "height": 32
    },
    "globe-24": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVGMmOBQdsL)\" d=\"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10\"/><path fill=\"url(#SVGkjxtvv0q)\" fill-rule=\"evenodd\" d=\"M9.115 2.422a9.6 9.6 0 0 0-.85 1.704c-.48 1.23-.838 2.723-1.049 4.374H2.63q-.271.725-.43 1.5h4.87a29 29 0 0 0 .088 5h-4.7q.246.78.61 1.5h4.297c.215 1.255.52 2.397.9 3.374c.246.63.53 1.205.85 1.704A10 10 0 0 0 12 22a10 10 0 0 0 2.885-.422a9.6 9.6 0 0 0 .85-1.704c.38-.977.685-2.119.9-3.374h4.298q.364-.72.61-1.5h-4.7a29 29 0 0 0 .088-5h4.87a10 10 0 0 0-.43-1.5h-4.587c-.21-1.651-.57-3.144-1.05-4.374a9.6 9.6 0 0 0-.849-1.704A10 10 0 0 0 12 2a10 10 0 0 0-2.885.422M8.73 8.5c.2-1.47.522-2.774.934-3.829c.36-.92.77-1.612 1.194-2.062C11.278 2.163 11.663 2 12 2s.723.163 1.143.609c.423.45.835 1.142 1.194 2.062c.412 1.055.734 2.36.934 3.829zM12 22c.338 0 .723-.163 1.143-.609c.423-.45.835-1.142 1.194-2.062c.316-.81.58-1.765.775-2.829H8.888c.196 1.064.46 2.02.775 2.829c.36.92.77 1.612 1.194 2.062c.42.446.805.609 1.143.609M8.5 12c0 1.048.058 2.055.166 3h6.668a27 27 0 0 0 .094-5H8.573a27 27 0 0 0-.073 2\" clip-rule=\"evenodd\"/><defs><radialGradient id=\"SVGkjxtvv0q\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"rotate(224.662 12.654 4.738)scale(16.0089 16.0078)\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#25a2f0\"/><stop offset=\".974\" stop-color=\"#3bd5ff\"/></radialGradient><linearGradient id=\"SVGMmOBQdsL\" x1=\"6.444\" x2=\"20.889\" y1=\"5.333\" y2=\"18.667\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#29c3ff\"/><stop offset=\"1\" stop-color=\"#2052cb\"/></linearGradient></defs></g>",
      "width": 24,
      "height": 24
    },
    "mail-32": {
      "body": "<g fill=\"none\"><path fill=\"#367af2\" d=\"M2 10v12.5A4.5 4.5 0 0 0 6.5 27h19a4.5 4.5 0 0 0 4.5-4.5V10l-13.526 7.292a1 1 0 0 1-.948 0z\"/><path fill=\"url(#SVGH8QKvcBK)\" d=\"M2 10v12.5A4.5 4.5 0 0 0 6.5 27h19a4.5 4.5 0 0 0 4.5-4.5V10l-13.526 7.292a1 1 0 0 1-.948 0z\"/><path fill=\"url(#SVGkOCYvtuq)\" d=\"M2 10v12.5A4.5 4.5 0 0 0 6.5 27h19a4.5 4.5 0 0 0 4.5-4.5V10l-13.526 7.292a1 1 0 0 1-.948 0z\"/><path fill=\"url(#SVGcCmlT1Jm)\" fill-opacity=\".75\" d=\"M2 10v12.5A4.5 4.5 0 0 0 6.5 27h19a4.5 4.5 0 0 0 4.5-4.5V10l-13.526 7.292a1 1 0 0 1-.948 0z\"/><path fill=\"url(#SVGsZMU2dcf)\" fill-opacity=\".7\" d=\"M2 10v12.5A4.5 4.5 0 0 0 6.5 27h19a4.5 4.5 0 0 0 4.5-4.5V10l-13.526 7.292a1 1 0 0 1-.948 0z\"/><path fill=\"url(#SVGSLELubFH)\" d=\"M6.5 5A4.5 4.5 0 0 0 2 9.5v1.09l13.526 7.292a1 1 0 0 0 .948 0L30 10.59V9.5A4.5 4.5 0 0 0 25.5 5z\"/><defs><linearGradient id=\"SVGH8QKvcBK\" x1=\"19.555\" x2=\"26.862\" y1=\"13.332\" y2=\"27.873\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".199\" stop-color=\"#0094f0\" stop-opacity=\"0\"/><stop offset=\".431\" stop-color=\"#0094f0\"/></linearGradient><linearGradient id=\"SVGkOCYvtuq\" x1=\"12\" x2=\"4.914\" y1=\"11.79\" y2=\"28.328\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".191\" stop-color=\"#0094f0\" stop-opacity=\"0\"/><stop offset=\".431\" stop-color=\"#0094f0\"/></linearGradient><linearGradient id=\"SVGcCmlT1Jm\" x1=\"23.383\" x2=\"24.532\" y1=\"20.142\" y2=\"28.575\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#2764e7\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#2764e7\"/></linearGradient><linearGradient id=\"SVGsZMU2dcf\" x1=\"20.333\" x2=\"22.43\" y1=\"12.088\" y2=\"29.25\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".533\" stop-color=\"#ff6ce8\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#ff6ce8\"/></linearGradient><linearGradient id=\"SVGSLELubFH\" x1=\"10.318\" x2=\"18.903\" y1=\".976\" y2=\"23.436\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#6ce0ff\"/><stop offset=\".462\" stop-color=\"#29c3ff\"/><stop offset=\"1\" stop-color=\"#4894fe\"/></linearGradient></defs></g>",
      "width": 32,
      "height": 32
    },
    "people-team-24": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVGhZdyleXp)\" d=\"M20.25 10c.967 0 1.75.784 1.75 1.75V15a4 4 0 1 1-8-.001V11.75a1.75 1.75 0 0 1 1.607-1.744z\"/><path fill=\"url(#SVGS3LRTdtw)\" fill-opacity=\".5\" d=\"M20.25 10c.967 0 1.75.784 1.75 1.75V15a4 4 0 1 1-8-.001V11.75a1.75 1.75 0 0 1 1.607-1.744z\"/><path fill=\"url(#SVGQAaiVcet)\" d=\"M8.25 10c.967 0 1.75.784 1.75 1.75V15a4 4 0 1 1-8-.001V11.75a1.75 1.75 0 0 1 1.606-1.744z\"/><path fill=\"url(#SVGiO87M56u)\" fill-opacity=\".5\" d=\"M8.25 10c.967 0 1.75.784 1.75 1.75V15a4 4 0 1 1-8-.001V11.75a1.75 1.75 0 0 1 1.606-1.744z\"/><path fill=\"url(#SVGzzYbYcTQ)\" d=\"M14.754 10c.966 0 1.75.784 1.75 1.75v4.749a4.501 4.501 0 0 1-9.002 0V11.75c0-.966.783-1.75 1.75-1.75z\"/><path fill=\"url(#SVGLO3kxdrU)\" d=\"M14.754 10c.966 0 1.75.784 1.75 1.75v4.749a4.501 4.501 0 0 1-9.002 0V11.75c0-.966.783-1.75 1.75-1.75z\"/><path fill=\"url(#SVGrughhcvJ)\" d=\"M18.5 4a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5\"/><path fill=\"url(#SVGNr4bseCi)\" d=\"M5.5 4a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5\"/><path fill=\"url(#SVGcolyeckW)\" d=\"M12 3a3 3 0 1 1 0 6a3 3 0 0 1 0-6\"/><defs><linearGradient id=\"SVGhZdyleXp\" x1=\"15.902\" x2=\"20.703\" y1=\"11.196\" y2=\"18.011\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".125\" stop-color=\"#7a41dc\"/><stop offset=\"1\" stop-color=\"#5b2ab5\"/></linearGradient><linearGradient id=\"SVGQAaiVcet\" x1=\"3.903\" x2=\"8.703\" y1=\"11.196\" y2=\"18.011\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".125\" stop-color=\"#9c6cfe\"/><stop offset=\"1\" stop-color=\"#7a41dc\"/></linearGradient><linearGradient id=\"SVGzzYbYcTQ\" x1=\"9.643\" x2=\"15.657\" y1=\"11.462\" y2=\"19.322\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".125\" stop-color=\"#bd96ff\"/><stop offset=\"1\" stop-color=\"#9c6cfe\"/></linearGradient><linearGradient id=\"SVGLO3kxdrU\" x1=\"12.003\" x2=\"21.131\" y1=\"8.69\" y2=\"22.648\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#885edb\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#e362f8\"/></linearGradient><linearGradient id=\"SVGrughhcvJ\" x1=\"17.189\" x2=\"19.737\" y1=\"4.665\" y2=\"8.734\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".125\" stop-color=\"#7a41dc\"/><stop offset=\"1\" stop-color=\"#5b2ab5\"/></linearGradient><linearGradient id=\"SVGNr4bseCi\" x1=\"4.189\" x2=\"6.737\" y1=\"4.665\" y2=\"8.734\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".125\" stop-color=\"#9c6cfe\"/><stop offset=\"1\" stop-color=\"#7a41dc\"/></linearGradient><linearGradient id=\"SVGcolyeckW\" x1=\"10.427\" x2=\"13.485\" y1=\"3.798\" y2=\"8.68\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".125\" stop-color=\"#bd96ff\"/><stop offset=\"1\" stop-color=\"#9c6cfe\"/></linearGradient><radialGradient id=\"SVGS3LRTdtw\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(6.43822 0 0 12.2867 12.743 14.29)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".433\" stop-color=\"#3b148a\"/><stop offset=\"1\" stop-color=\"#3b148a\" stop-opacity=\"0\"/></radialGradient><radialGradient id=\"SVGiO87M56u\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(-7.12497 0 0 -13.5973 12.592 14.29)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\".433\" stop-color=\"#3b148a\"/><stop offset=\"1\" stop-color=\"#3b148a\" stop-opacity=\"0\"/></radialGradient></defs></g>",
      "width": 24,
      "height": 24
    },
    "slide-text-sparkle-32": {
      "body": "<g fill=\"none\"><path fill=\"url(#SVGSpnS9dah)\" fill-rule=\"evenodd\" d=\"M28.64 5.276C28.2 5.71 27.407 6 26.5 6C25.12 6 24 5.328 24 4.5c0-.175.05-.344.142-.5H6.5A4.5 4.5 0 0 0 2 8.5v15A4.5 4.5 0 0 0 6.5 28h19a4.5 4.5 0 0 0 4.5-4.5v-15a4.5 4.5 0 0 0-1.36-3.224\" clip-rule=\"evenodd\"/><path fill=\"url(#SVGBe6csbtW)\" fill-opacity=\".3\" fill-rule=\"evenodd\" d=\"M28.64 5.276C28.2 5.71 27.407 6 26.5 6C25.12 6 24 5.328 24 4.5c0-.175.05-.344.142-.5H6.5A4.5 4.5 0 0 0 2 8.5v15A4.5 4.5 0 0 0 6.5 28h19a4.5 4.5 0 0 0 4.5-4.5v-15a4.5 4.5 0 0 0-1.36-3.224\" clip-rule=\"evenodd\"/><path fill=\"url(#SVGRVYN2czd)\" fill-opacity=\".3\" fill-rule=\"evenodd\" d=\"M28.64 5.276C28.2 5.71 27.407 6 26.5 6C25.12 6 24 5.328 24 4.5c0-.175.05-.344.142-.5H6.5A4.5 4.5 0 0 0 2 8.5v15A4.5 4.5 0 0 0 6.5 28h19a4.5 4.5 0 0 0 4.5-4.5v-15a4.5 4.5 0 0 0-1.36-3.224\" clip-rule=\"evenodd\"/><path fill=\"url(#SVGBniLKd1i)\" fill-opacity=\".3\" fill-rule=\"evenodd\" d=\"M28.64 5.276C28.2 5.71 27.407 6 26.5 6C25.12 6 24 5.328 24 4.5c0-.175.05-.344.142-.5H6.5A4.5 4.5 0 0 0 2 8.5v15A4.5 4.5 0 0 0 6.5 28h19a4.5 4.5 0 0 0 4.5-4.5v-15a4.5 4.5 0 0 0-1.36-3.224\" clip-rule=\"evenodd\"/><path fill=\"url(#SVGvJ61obpX)\" fill-opacity=\".6\" fill-rule=\"evenodd\" d=\"M28.64 5.276C28.2 5.71 27.407 6 26.5 6C25.12 6 24 5.328 24 4.5c0-.175.05-.344.142-.5H6.5A4.5 4.5 0 0 0 2 8.5v15A4.5 4.5 0 0 0 6.5 28h19a4.5 4.5 0 0 0 4.5-4.5v-15a4.5 4.5 0 0 0-1.36-3.224\" clip-rule=\"evenodd\"/><path fill=\"url(#SVG6L2tGeoy)\" fill-opacity=\".4\" fill-rule=\"evenodd\" d=\"M28.64 5.276C28.2 5.71 27.407 6 26.5 6C25.12 6 24 5.328 24 4.5c0-.175.05-.344.142-.5H6.5A4.5 4.5 0 0 0 2 8.5v15A4.5 4.5 0 0 0 6.5 28h19a4.5 4.5 0 0 0 4.5-4.5v-15a4.5 4.5 0 0 0-1.36-3.224\" clip-rule=\"evenodd\"/><path fill=\"#212121\" d=\"m30.821 12.358l.918.298l.019.004a.362.362 0 0 1 0 .684l-.919.299a1.9 1.9 0 0 0-1.198 1.197l-.299.918a.363.363 0 0 1-.684 0l-.299-.918a1.89 1.89 0 0 0-1.198-1.202l-.919-.298a.362.362 0 0 1 0-.684l.919-.299a1.9 1.9 0 0 0 1.18-1.197l.299-.918a.363.363 0 0 1 .684 0l.298.918a1.89 1.89 0 0 0 1.199 1.197\"/><path fill=\"url(#SVGKBZtDbjr)\" d=\"m30.821 12.358l.918.298l.019.004a.362.362 0 0 1 0 .684l-.919.299a1.9 1.9 0 0 0-1.198 1.197l-.299.918a.363.363 0 0 1-.684 0l-.299-.918a1.89 1.89 0 0 0-1.198-1.202l-.919-.298a.362.362 0 0 1 0-.684l.919-.299a1.9 1.9 0 0 0 1.18-1.197l.299-.918a.363.363 0 0 1 .684 0l.298.918a1.89 1.89 0 0 0 1.199 1.197\"/><path fill=\"url(#SVGUMjE2bUr)\" d=\"M21.488 7.511a3.5 3.5 0 0 1 .837 1.363l.548 1.682a.664.664 0 0 0 1.254 0l.548-1.682a3.47 3.47 0 0 1 2.197-2.196l1.684-.547a.665.665 0 0 0 0-1.254l-.034-.008l-1.683-.547a3.47 3.47 0 0 1-2.198-2.196L24.094.444a.665.665 0 0 0-1.255 0l-.547 1.682l-.014.042a3.47 3.47 0 0 1-2.15 2.154l-1.684.547a.665.665 0 0 0 0 1.254l1.684.546c.513.171.979.46 1.36.842\"/><rect width=\"8\" height=\"2\" x=\"8\" y=\"9\" fill=\"url(#SVGd86lGdDc)\" rx=\"1\"/><rect width=\"15\" height=\"2\" x=\"8\" y=\"14\" fill=\"url(#SVGWsJaCcSB)\" rx=\"1\"/><rect width=\"10\" height=\"2\" x=\"8\" y=\"19\" fill=\"url(#SVGj7V3gcte)\" rx=\"1\"/><defs><linearGradient id=\"SVGSpnS9dah\" x1=\"2.569\" x2=\"24.281\" y1=\"27.819\" y2=\"2.258\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fc92cb\"/><stop offset=\".51\" stop-color=\"#dd3ce2\"/><stop offset=\"1\" stop-color=\"#b91cbf\"/></linearGradient><linearGradient id=\"SVGKBZtDbjr\" x1=\"29.123\" x2=\"20.116\" y1=\"12.59\" y2=\"5.343\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fee5ff\"/><stop offset=\".964\" stop-color=\"#f0b6f2\"/></linearGradient><linearGradient id=\"SVGUMjE2bUr\" x1=\"28.796\" x2=\"20.046\" y1=\"12.223\" y2=\"5.191\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fee5ff\"/><stop offset=\".964\" stop-color=\"#f0b6f2\"/></linearGradient><linearGradient id=\"SVGd86lGdDc\" x1=\"15.667\" x2=\"7\" y1=\"10\" y2=\"10\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fee5ff\"/><stop offset=\".964\" stop-color=\"#f0b6f2\"/></linearGradient><linearGradient id=\"SVGWsJaCcSB\" x1=\"22.375\" x2=\"6.125\" y1=\"15\" y2=\"15\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fee5ff\"/><stop offset=\".964\" stop-color=\"#f0b6f2\"/></linearGradient><linearGradient id=\"SVGj7V3gcte\" x1=\"17.583\" x2=\"6.75\" y1=\"20\" y2=\"20\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fee5ff\"/><stop offset=\".964\" stop-color=\"#f0b6f2\"/></linearGradient><radialGradient id=\"SVGBe6csbtW\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(0 1.5 -5.39063 0 12 10.5)\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#55107a\"/><stop offset=\"1\" stop-color=\"#55107a\" stop-opacity=\"0\"/></radialGradient><radialGradient id=\"SVGRVYN2czd\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(0 2 -10.4301 0 16 15.5)\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#55107a\"/><stop offset=\"1\" stop-color=\"#55107a\" stop-opacity=\"0\"/></radialGradient><radialGradient id=\"SVGBniLKd1i\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(0 2 -7.18751 0 13 20.5)\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#55107a\"/><stop offset=\"1\" stop-color=\"#55107a\" stop-opacity=\"0\"/></radialGradient><radialGradient id=\"SVGvJ61obpX\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(0 6 -7.58507 0 23.5 6)\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#55107a\"/><stop offset=\"1\" stop-color=\"#55107a\" stop-opacity=\"0\"/></radialGradient><radialGradient id=\"SVG6L2tGeoy\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(0 4 -4.15095 0 29 14)\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#55107a\"/><stop offset=\"1\" stop-color=\"#55107a\" stop-opacity=\"0\"/></radialGradient></defs></g>",
      "width": 32,
      "height": 32
    }
  },
  "width": 20,
  "height": 20
}

/** 앱 시작 시 등록할 축소 세트 전체. */
export const ICON_COLLECTIONS: IconifyJSON[] = [devicon, mdi, fluentColor]
