// 폰트는 npm 패키지로 자체 호스팅한다(CDN 금지). 한글 폰트라 유니코드 범위별로 쪼갠
// @font-face가 수백 개 들어와 CSS 번들이 200KB를 넘는다 — 브라우저는 실제로 쓰는 범위만
// 내려받으므로 동작에는 문제가 없다.
// ponytail: CSS 200KB는 fontsource CJK의 대가다. 첫 페인트가 문제되면 pyftsubset으로
// 쓰는 글자만 남긴 단일 파일로 바꾼다.
import '@fontsource/jua'
import '@fontsource-variable/noto-sans-kr'
import { Desktop } from './components/Desktop'
import { GameOver } from './components/GameOver'
import { Window } from './components/Window'
import { findProgram, type ProgramId } from './data/programs'
import { Browser } from './programs/Browser'
import { Company } from './programs/Company'
import { Editor } from './programs/Editor'
import { Figma } from './programs/Figma'
import { Mail } from './programs/Mail'
import { Messenger } from './programs/Messenger'
import { Photoshop } from './programs/Photoshop'
import { Ppt } from './programs/Ppt'
import { Schedule } from './programs/Schedule'
import { useGame } from './store'

/** 프로그램 id → 창 내용. PROGRAMS(데이터)에 항목을 더하면 여기 컴포넌트도 짝지어야 한다.
 *  Record<ProgramId, ...>라서 짝을 빼먹으면 타입 검사가 잡는다. */
const VIEWS: Record<ProgramId, () => React.JSX.Element> = {
  figma: Figma,
  photoshop: Photoshop,
  ppt: Ppt,
  messenger: Messenger,
  editor: Editor,
  mail: Mail,
  schedule: Schedule,
  company: Company,
  browser: Browser,
}

export default function App() {
  const windows = useGame((s) => s.windows)

  return (
    <Desktop>
      {windows.map((w) => {
        const View = VIEWS[w.id]
        const program = findProgram(w.id)
        return (
          <Window key={w.id} id={w.id} title={program.title} size={'size' in program ? program.size : undefined}>
            <View />
          </Window>
        )
      })}
      {/* ⚠️ 포털이라 어디에 두든 화면 맨 앞에 선다. 창 목록 **밖**에 두는 이유는
          끝난 판에서도 늘 그려져야 하기 때문이다(창은 닫힐 수 있다). */}
      <GameOver />
    </Desktop>
  )
}
