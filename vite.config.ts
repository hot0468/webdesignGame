import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // ⚠️ 폰트 서브셋이 200개라 에셋마다 gzip 크기를 재는 것이 빌드 출력 207줄과
    //    시간의 대부분이었다. 크기 감시가 필요하면 그때 한 번 켜서 보면 된다.
    reportCompressedSize: false,
  },
})
