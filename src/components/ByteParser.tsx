import { useEffect, useRef, useState } from 'react'
import styles from './ByteParser.module.css'

type ParsedEvent = {
  id: number
  type: string
  data: string
  lineCount: number
}

type Sample = {
  name: string
  description: string
  payload: string
}

const SAMPLES: Sample[] = [
  {
    name: '정상 메시지 1개',
    description: 'data: 한 줄 + 빈 줄로 메시지 1개를 만든다',
    payload: 'data: 안녕하세요!\n\n',
  },
  {
    name: '연달아 3개',
    description: '같은 스트림에 메시지 3개를 연달아 흘려보냄',
    payload: 'data: 하나\n\ndata: 둘\n\ndata: 셋\n\n',
  },
  {
    name: 'data 여러 줄',
    description: 'data: 라인을 여러 번 쓰면 \\n으로 합쳐서 하나의 message',
    payload: 'data: 첫 번째 줄\ndata: 두 번째 줄\ndata: 세 번째 줄\n\n',
  },
  {
    name: '⚠️ 빈 줄 없음 (오류)',
    description: '메시지 경계가 없어서 EventSource는 가만히 기다린다',
    payload: 'data: 끝낼 줄 모르는 메시지\n',
  },
  {
    name: '⚠️ 콜론 뒤 공백 빠짐',
    description: '"data:안녕" 처럼 공백 없이도 동작은 하지만 관습은 공백 1칸',
    payload: 'data:공백없이도된다\n\n',
  },
]

type Mode = 'idle' | 'streaming' | 'done'

export function ByteParser() {
  const [payload, setPayload] = useState(SAMPLES[0].payload)
  const [mode, setMode] = useState<Mode>('idle')
  const [sentBytes, setSentBytes] = useState('')
  const [bufferLines, setBufferLines] = useState<string[]>([])
  const [pendingLine, setPendingLine] = useState('')
  const [events, setEvents] = useState<ParsedEvent[]>([])
  const [cursor, setCursor] = useState(0)
  const intervalRef = useRef<number | null>(null)

  const clearInterval2 = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => () => clearInterval2(), [])

  const reset = () => {
    clearInterval2()
    setSentBytes('')
    setBufferLines([])
    setPendingLine('')
    setEvents([])
    setCursor(0)
    setMode('idle')
  }

  const emitChar = (ch: string) => {
    setSentBytes((s) => s + ch)
    if (ch === '\n') {
      // line ended; commit pendingLine to bufferLines
      setPendingLine((cur) => {
        setBufferLines((lines) => {
          const newLines = [...lines, cur]
          // check if this is a blank line that ends a message
          if (cur === '' && newLines.length > 1) {
            // Build event from previous non-empty lines back to last blank line
            // Find the boundary
            let start = newLines.length - 2
            while (start >= 0 && newLines[start] !== '') start -= 1
            const messageLines = newLines.slice(start + 1, newLines.length - 1)
            if (messageLines.length > 0) {
              const dataLines: string[] = []
              let eventType = 'message'
              for (const line of messageLines) {
                if (line.startsWith('data:')) {
                  dataLines.push(line.slice(5).replace(/^ /, ''))
                } else if (line.startsWith('event:')) {
                  eventType = line.slice(6).replace(/^ /, '')
                }
              }
              if (dataLines.length > 0) {
                setEvents((evs) => [
                  ...evs,
                  {
                    id: evs.length + 1,
                    type: eventType,
                    data: dataLines.join('\n'),
                    lineCount: messageLines.length,
                  },
                ])
              }
            }
          }
          return newLines
        })
        return ''
      })
    } else {
      setPendingLine((cur) => cur + ch)
    }
  }

  const startStream = (speed: number) => {
    reset()
    setMode('streaming')
    let i = 0
    intervalRef.current = window.setInterval(() => {
      if (i >= payload.length) {
        clearInterval2()
        setMode('done')
        return
      }
      emitChar(payload[i])
      i += 1
      setCursor(i)
    }, speed)
  }

  const stepOne = () => {
    if (cursor >= payload.length) {
      setMode('done')
      return
    }
    if (mode !== 'streaming') setMode('streaming')
    emitChar(payload[cursor])
    setCursor((c) => c + 1)
    if (cursor + 1 >= payload.length) setMode('done')
  }

  const selectSample = (s: Sample) => {
    reset()
    setPayload(s.payload)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.samples}>
        <span className={styles.samplesLabel}>샘플 페이로드</span>
        <div className={styles.sampleBtns}>
          {SAMPLES.map((s) => (
            <button
              type="button"
              key={s.name}
              onClick={() => selectSample(s)}
              className={styles.sampleBtn}
              data-active={payload === s.payload}
            >
              {s.name}
            </button>
          ))}
        </div>
        <p className={styles.sampleHint}>
          {SAMPLES.find((s) => s.payload === payload)?.description ?? '직접 편집한 페이로드'}
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.serverPanel}>
          <header className={styles.panelHead}>
            <span className={styles.panelLabel}>서버가 보낼 페이로드</span>
            <span className={styles.muted}>(편집 가능 · `\n`은 줄바꿈)</span>
          </header>
          <textarea
            className={styles.payloadInput}
            value={payload}
            onChange={(e) => {
              reset()
              setPayload(e.target.value)
            }}
            rows={6}
            spellCheck={false}
          />
          <div className={styles.btnRow}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => startStream(80)}
              disabled={mode === 'streaming'}
            >
              전체 스트림 시작 →
            </button>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={stepOne}
              disabled={cursor >= payload.length}
            >
              한 글자만 ▷
            </button>
            <button type="button" className={styles.btnGhost} onClick={reset}>
              리셋
            </button>
          </div>
          <div className={styles.progress}>
            진행률 {cursor} / {payload.length} byte
          </div>
        </div>

        <div className={styles.parserPanel}>
          <header className={styles.panelHead}>
            <span className={styles.panelLabel}>EventSource가 받은 바이트</span>
            <span className={styles.muted}>(누적, 빈 줄 만나면 ↘ 메시지 발사)</span>
          </header>
          <pre className={styles.bytesView}>
            {sentBytes.length === 0 ? (
              <span className={styles.empty}>(아직 한 바이트도 안 받음)</span>
            ) : (
              renderBytes(sentBytes)
            )}
            {mode === 'streaming' && <span className={styles.byteCursor} />}
          </pre>
          <div className={styles.bufferStat}>
            현재 버퍼: 줄 {bufferLines.length}개 + 미완성 라인 {pendingLine.length}자
          </div>
        </div>

        <div className={styles.eventsPanel}>
          <header className={styles.panelHead}>
            <span className={styles.panelLabel}>발사된 message 이벤트</span>
            <span className={styles.muted}>(EventSource가 콜백 호출)</span>
          </header>
          <ul className={styles.eventList}>
            {events.length === 0 && (
              <li className={styles.emptyEvent}>
                아직 발사된 이벤트가 없어요. 빈 줄(`\n\n`)이 와야 메시지로 인정됨.
              </li>
            )}
            {events.map((ev) => (
              <li key={ev.id} className={styles.event}>
                <div className={styles.eventHead}>
                  <span className={styles.eventNum}>#{ev.id}</span>
                  <span className={styles.eventType}>{ev.type}</span>
                </div>
                <pre className={styles.eventData}>{ev.data}</pre>
                <span className={styles.eventMeta}>
                  {ev.lineCount}줄의 data:가 합쳐짐
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function renderBytes(s: string) {
  // Render with visible newline markers
  const out: React.ReactNode[] = []
  let part = ''
  let key = 0
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i]
    if (ch === '\n') {
      out.push(
        <span key={`p${key}`} className={styles.byteChar}>
          {part}
        </span>,
      )
      out.push(
        <span key={`nl${key}`} className={styles.newline}>
          ↵
        </span>,
      )
      out.push(<br key={`br${key}`} />)
      key += 1
      part = ''
    } else {
      part += ch
    }
  }
  if (part)
    out.push(
      <span key={`tail`} className={styles.byteChar}>
        {part}
      </span>,
    )
  return out
}
