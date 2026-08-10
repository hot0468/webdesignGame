/** 사내시스템의 텍스트 데이터. 수치가 아니라 문자열이라 game.ts와 분리한다.
 *
 * ⚠️ 전부 게임 안의 가짜 정보다. 실제 접속처를 넣지 않는다 —
 *    화면에 그대로 보이는 값이므로 실제 자격증명이 섞이면 그 순간 유출이다.
 *    도메인은 예시용(`example`)만 쓴다. */

/** 업체정보 화면이 보여줄 항목. 라벨-값 쌍의 묶음 두 개다. */
export const COMPANY_INFO = {
  ftp: {
    title: 'FTP 접속 정보',
    rows: [
      { label: '호스트', value: 'ftp.webdi.example' },
      { label: '포트', value: '21' },
      { label: '계정', value: 'webdi_admin' },
      { label: '비밀번호', value: 'webdi-1234' },
      { label: '기본 경로', value: '/public_html' },
    ],
  },
  admin: {
    title: '관리자 사이트 계정정보',
    rows: [
      { label: '주소', value: 'admin.webdi.example' },
      { label: '아이디', value: 'master' },
      { label: '비밀번호', value: 'master-1234' },
    ],
  },
} as const
