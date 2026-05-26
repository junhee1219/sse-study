import { useEffect, useRef, useState } from 'react'
import styles from './ReconnectSim.module.css'

type ConnState = 'idle' | 'open' | 'dropped' | 'reconnecting'

type ServerMsg = {
  id: number
  text: string
}

type ClientEvent = {
  kind: 'connect' | 'message' | 'drop' | 'reconnect'
  text: string
  msgId?: number
  ts: number
}

const MESSAGES: ServerMsg[] = [
  { id: 1, text: '안녕하세요!' },
  { id: 2, text: '오늘 어떤 거 도와드릴까요?' },
  { id: 3, text: '챗봇 만드는 게 처음이세요?' },
  { id: 4, text: '재밌게 해볼게요.' },
  { id: 5, text: '먼저 SSE부터 익혀보면 좋아요.' },
  { id: 6, text: '한 줄 한 줄 천천히.' },
  { id: 7, text: '연결이 끊겨도 걱정 마세요.' },
  { id: 8, text: '브라우저가 알아서 다시 붙어요.' },
  { id: 9, text: 'Last-Event-ID 헤더 덕분에요.' },
  { id: 10, text: '자, 끊기 버튼 한 번 눌러보세요.' },
]

const MSG_INTERVAL_MS = 1100
const RETRY_MS = 2500

export function ReconnectSim() {
  const [conn, setConn] = useState<ConnState>('idle')
  const [emitted, setEmitted] = useState<number>(0)
  const [lastReceivedId, setLastReceivedId] = useState<number>(0)
  const [eventLog, setEventLog] = useState<ClientEvent[]>([])
  const [serverReplays, setServerReplays] = useState(true)
  const [lastEventIdHeader, setLastEventIdHeader] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)

  const clearTimers = () => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    if (reconnectTimeoutRef.current !== null) window.clearTimeout(reconnectTimeoutRef.current)
    intervalRef.current = null
    reconnectTimeoutRef.current = null
  }

  useEffect(() => () => clearTimers(), [])

  const pushLog = (e: Omit<ClientEvent, 'ts'>) => {
    setEventLog((log) => [...log, { ...e, ts: Date.now() }])
  }

  const startEmitting = (startFromId: number) => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    let nextIndex = MESSAGES.findIndex((m) => m.id > startFromId)
    if (nextIndex < 0) nextIndex = MESSAGES.length
    intervalRef.current = window.setInterval(() => {
      if (nextIndex >= MESSAGES.length) {
        clearTimers()
        return
      }
      const msg = MESSAGES[nextIndex]
      pushLog({ kind: 'message', text: msg.text, msgId: msg.id })
      setLastReceivedId(msg.id)
      setEmitted(msg.id)
      nextIndex += 1
    }, MSG_INTERVAL_MS)
  }

  const start = () => {
    clearTimers()
    setEmitted(0)
    setLastReceivedId(0)
    setEventLog([])
    setLastEventIdHeader(null)
    pushLog({ kind: 'connect', text: 'GET /api/chat (Last-Event-ID 없음)' })
    setConn('open')
    startEmitting(0)
  }

  const drop = () => {
    if (conn !== 'open') return
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    intervalRef.current = null
    setConn('dropped')
    pushLog({
      kind: 'drop',
      text: `연결 끊김! 마지막 받은 id: ${lastReceivedId}`,
    })

    // Auto reconnect after retry
    reconnectTimeoutRef.current = window.setTimeout(() => {
      setConn('reconnecting')
      const headerValue = lastReceivedId > 0 ? String(lastReceivedId) : null
      setLastEventIdHeader(headerValue)
      pushLog({
        kind: 'reconnect',
        text: headerValue
          ? `GET /api/chat  ← Last-Event-ID: ${headerValue}`
          : 'GET /api/chat (Last-Event-ID 없음)',
      })
      window.setTimeout(() => {
        setConn('open')
        const resumeFrom = serverReplays ? lastReceivedId : MESSAGES[MESSAGES.length - 1].id
        startEmitting(resumeFrom)
      }, 400)
    }, RETRY_MS) as unknown as number
  }

  const reset = () => {
    clearTimers()
    setConn('idle')
    setEmitted(0)
    setLastReceivedId(0)
    setEventLog([])
    setLastEventIdHeader(null)
  }

  const connLabel: Record<ConnState, string> = {
    idle: '대기',
    open: '연결됨 — 메시지 흐르는 중',
    dropped: `끊김 — ${RETRY_MS / 1000}초 후 재연결`,
    reconnecting: '재연결 중…',
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={start}
            disabled={conn === 'open' || conn === 'reconnecting'}
          >
            {conn === 'idle' ? '스트림 시작 →' : '다시 시작'}
          </button>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={drop}
            disabled={conn !== 'open'}
          >
            와이파이 끊기 ⚡
          </button>
          <button type="button" className={styles.btnGhost} onClick={reset}>
            리셋
          </button>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={serverReplays}
            onChange={(e) => setServerReplays(e.target.checked)}
          />
          <span>서버가 Last-Event-ID 받고 미보낸 메시지부터 다시 보냄</span>
        </label>
      </div>

      <div className={styles.statusBar} data-conn={conn}>
        <span className={styles.statusDot} />
        <span className={styles.statusText}>{connLabel[conn]}</span>
        <span className={styles.statusMeta}>
          마지막 받은 id: <code>{lastReceivedId || '—'}</code>
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.col}>
          <header className={styles.colHead}>
            <span className={styles.colLabel}>네트워크 위 (GET 요청)</span>
          </header>
          <div className={styles.requestBox}>
            <div className={styles.line}>
              <span className={styles.lineKey}>GET</span> /api/chat HTTP/1.1
            </div>
            <div className={styles.line}>
              <span className={styles.lineKey}>Accept:</span> text/event-stream
            </div>
            <div className={styles.line} data-highlight={lastEventIdHeader !== null}>
              <span className={styles.lineKey}>Last-Event-ID:</span>{' '}
              {lastEventIdHeader ?? <span className={styles.muted}>(없음)</span>}
            </div>
          </div>
          <p className={styles.note}>
            {lastEventIdHeader
              ? '재연결 GET에는 Last-Event-ID 헤더가 자동으로 붙는다. 브라우저가 알아서.'
              : '첫 연결에는 Last-Event-ID 헤더가 없다. 끊겼다 재연결할 때만 붙음.'}
          </p>
        </div>

        <div className={styles.col}>
          <header className={styles.colHead}>
            <span className={styles.colLabel}>클라이언트 이벤트 로그</span>
            <span className={styles.muted}>({eventLog.length}건)</span>
          </header>
          <ul className={styles.log}>
            {eventLog.length === 0 && (
              <li className={styles.emptyLog}>
                "스트림 시작" 누르고 메시지가 흐르기 시작하면 "와이파이 끊기"도 해보세요.
              </li>
            )}
            {eventLog.map((e, i) => (
              <li key={i} className={styles.logItem} data-kind={e.kind}>
                <span className={styles.logKind}>{kindLabel(e.kind)}</span>
                <span className={styles.logText}>
                  {e.msgId !== undefined && (
                    <code className={styles.idTag}>id:{e.msgId}</code>
                  )}
                  {e.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.summary}>
        <span className={styles.summaryLabel}>전체 메시지</span>
        <div className={styles.dots}>
          {MESSAGES.map((m) => (
            <span
              key={m.id}
              className={styles.dotMsg}
              data-state={m.id <= emitted ? 'sent' : 'pending'}
              title={`#${m.id} ${m.text}`}
            >
              {m.id}
            </span>
          ))}
        </div>
        <span className={styles.summaryMeta}>
          {emitted}/{MESSAGES.length}
        </span>
      </div>
    </div>
  )
}

function kindLabel(k: ClientEvent['kind']) {
  switch (k) {
    case 'connect':
      return '연결'
    case 'message':
      return '수신'
    case 'drop':
      return '끊김'
    case 'reconnect':
      return '재연결'
  }
}
