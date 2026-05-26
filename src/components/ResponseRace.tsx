import { useEffect, useRef, useState } from 'react'
import styles from './ResponseRace.module.css'

type Mode = 'idle' | 'connecting' | 'waiting' | 'streaming' | 'done'

const ANSWER = '안녕! 오늘 어떤 거 도와줄까? 또르륵 또르륵 흘러나오는 챗봇이라니, 사람으로 치면 입에서 말이 줄줄 나오는 거랑 똑같지.'
const ANSWER_CHARS = [...ANSWER]
const STREAM_INTERVAL_MS = 55
const TOTAL_DURATION_MS = ANSWER_CHARS.length * STREAM_INTERVAL_MS

export function ResponseRace() {
  const [leftMode, setLeftMode] = useState<Mode>('idle')
  const [rightMode, setRightMode] = useState<Mode>('idle')
  const [leftBubble, setLeftBubble] = useState('')
  const [rightShown, setRightShown] = useState(0)
  const [leftWire, setLeftWire] = useState<string[]>([])
  const [rightWire, setRightWire] = useState<string[]>([])
  const [elapsed, setElapsed] = useState(0)
  const timersRef = useRef<number[]>([])

  const clearTimers = () => {
    for (const id of timersRef.current) {
      clearTimeout(id)
      clearInterval(id)
    }
    timersRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  const start = () => {
    clearTimers()
    setLeftMode('connecting')
    setRightMode('connecting')
    setLeftBubble('')
    setRightShown(0)
    setLeftWire(['→ GET /api/chat HTTP/1.1', '→ Accept: text/plain', '', '(요청 보냄, 응답 대기 중…)'])
    setRightWire([
      '→ GET /api/chat HTTP/1.1',
      '→ Accept: text/event-stream',
      '',
      '← HTTP/1.1 200 OK',
      '← Content-Type: text/event-stream',
      '← Cache-Control: no-cache',
      '',
    ])
    setElapsed(0)

    const startTime = performance.now()
    const tickId = window.setInterval(() => {
      const e = performance.now() - startTime
      setElapsed(e)
      if (e >= TOTAL_DURATION_MS + 200) {
        clearInterval(tickId)
      }
    }, 50)
    timersRef.current.push(tickId)

    // left: just wait, then dump everything
    const switchToWait = window.setTimeout(() => setLeftMode('waiting'), 150)
    timersRef.current.push(switchToWait as unknown as number)
    const dumpId = window.setTimeout(() => {
      const bytes = new TextEncoder().encode(ANSWER).length
      setLeftWire([
        '→ GET /api/chat HTTP/1.1',
        '→ Accept: text/plain',
        '',
        '← HTTP/1.1 200 OK',
        `← Content-Length: ${bytes}`,
        '← Content-Type: text/plain; charset=utf-8',
        '',
        `← ${ANSWER}`,
        '',
        '(연결 종료)',
      ])
      setLeftBubble(ANSWER)
      setLeftMode('done')
    }, TOTAL_DURATION_MS) as unknown as number
    timersRef.current.push(dumpId)

    // right: stream chars
    setRightMode('streaming')
    let i = 0
    const streamId = window.setInterval(() => {
      i += 1
      setRightShown(i)
      setRightWire((w) => [...w, `← data: ${ANSWER_CHARS[i - 1]}`, '← '])
      if (i >= ANSWER_CHARS.length) {
        clearInterval(streamId)
        setRightWire((w) => [...w, '(연결 유지됨…)'])
        setRightMode('done')
      }
    }, STREAM_INTERVAL_MS)
    timersRef.current.push(streamId)
  }

  const reset = () => {
    clearTimers()
    setLeftMode('idle')
    setRightMode('idle')
    setLeftBubble('')
    setRightShown(0)
    setLeftWire([])
    setRightWire([])
    setElapsed(0)
  }

  const inFlight = leftMode !== 'idle' && leftMode !== 'done'
  const allDone = leftMode === 'done' && rightMode === 'done'
  const progress = Math.min(elapsed / TOTAL_DURATION_MS, 1)

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <div className={styles.prompt}>
          <span className={styles.promptLabel}>또르가 물어봄</span>
          <span className={styles.promptText}>"안녕!"</span>
        </div>
        <div className={styles.btnRow}>
          <button
            type="button"
            onClick={start}
            disabled={inFlight}
            className={styles.btnPrimary}
          >
            {allDone ? '다시 보내기' : '두 챗봇에게 동시에 보내기 →'}
          </button>
          <button type="button" onClick={reset} className={styles.btnGhost}>
            리셋
          </button>
        </div>
        <div className={styles.timeline}>
          <div className={styles.timelineBar} style={{ width: `${progress * 100}%` }} />
          <span className={styles.timelineLabel}>
            {(elapsed / 1000).toFixed(2)}s
          </span>
        </div>
      </div>

      <div className={styles.race}>
        <Panel
          variant="batch"
          title="또르가 짠 챗봇"
          subtitle="일반 HTTP 응답 — 다 만들고 한 번에 보냄"
          mode={leftMode}
          bubble={leftBubble}
          wire={leftWire}
        />
        <Panel
          variant="stream"
          title="지피티"
          subtitle="SSE 응답 — 생긴 만큼 즉시 흘려보냄"
          mode={rightMode}
          bubble={ANSWER.slice(0, rightShown)}
          wire={rightWire}
          cursor={rightMode === 'streaming'}
        />
      </div>
    </div>
  )
}

type PanelProps = {
  variant: 'batch' | 'stream'
  title: string
  subtitle: string
  mode: Mode
  bubble: string
  wire: string[]
  cursor?: boolean
}

function Panel({ variant, title, subtitle, mode, bubble, wire, cursor }: PanelProps) {
  const statusText: Record<Mode, string> = {
    idle: '대기 중',
    connecting: '연결 중…',
    waiting: '응답 만드는 중…',
    streaming: '응답 받는 중…',
    done: '완료',
  }
  return (
    <div className={styles.panel} data-variant={variant}>
      <header className={styles.panelHead}>
        <div className={styles.panelTitleRow}>
          <span className={styles.panelTitle}>{title}</span>
          <span className={styles.panelStatus} data-mode={mode}>
            <span className={styles.statusDot} />
            {statusText[mode]}
          </span>
        </div>
        <span className={styles.panelSubtitle}>{subtitle}</span>
      </header>

      <div className={styles.bubbleArea}>
        {mode === 'idle' && (
          <div className={styles.bubblePlaceholder}>버튼을 눌러서 응답을 받아봐</div>
        )}
        {mode !== 'idle' && (
          <div className={styles.bubble} data-empty={!bubble}>
            {bubble || (
              <span className={styles.spinner} aria-label="응답 대기 중">
                <span />
                <span />
                <span />
              </span>
            )}
            {cursor && <span className={styles.cursor} />}
          </div>
        )}
      </div>

      <div className={styles.wireHead}>
        <span className={styles.wireLabel}>네트워크 위에서 흐른 바이트</span>
      </div>
      <pre className={styles.wire}>
        {wire.length === 0 ? (
          <span className={styles.wireEmpty}>(아직 아무 바이트도 안 흘렀음)</span>
        ) : (
          wire.map((line, i) => (
            <div key={i} className={styles.wireLine} data-empty={line === ''}>
              {line || ' '}
            </div>
          ))
        )}
      </pre>
    </div>
  )
}
