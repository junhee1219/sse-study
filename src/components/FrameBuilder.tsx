import { useMemo, useState } from 'react'
import styles from './FrameBuilder.module.css'

type FieldsState = {
  eventOn: boolean
  eventValue: string
  data: string
  idOn: boolean
  idValue: string
  retryOn: boolean
  retryValue: number
}

const INITIAL: FieldsState = {
  eventOn: false,
  eventValue: 'token',
  data: '안녕!',
  idOn: false,
  idValue: '42',
  retryOn: false,
  retryValue: 3000,
}

export function FrameBuilder() {
  const [state, setState] = useState<FieldsState>(INITIAL)

  const rawSse = useMemo(() => {
    const lines: string[] = []
    if (state.eventOn && state.eventValue) lines.push(`event: ${state.eventValue}`)
    for (const dataLine of state.data.split('\n')) {
      lines.push(`data: ${dataLine}`)
    }
    if (state.idOn && state.idValue) lines.push(`id: ${state.idValue}`)
    if (state.retryOn && state.retryValue > 0) lines.push(`retry: ${state.retryValue}`)
    return lines.join('\n') + '\n\n'
  }, [state])

  const clientCode = useMemo(() => {
    const lines: string[] = []
    lines.push('const es = new EventSource("/api/chat");')
    lines.push('')
    if (state.eventOn && state.eventValue) {
      lines.push(`// 커스텀 이벤트 이름이라 addEventListener 필요`)
      lines.push(`es.addEventListener("${state.eventValue}", (e) => {`)
      lines.push(`  console.log("받음:", e.data);`)
      if (state.idOn) lines.push(`  console.log("lastEventId:", e.lastEventId);`)
      lines.push(`});`)
    } else {
      lines.push(`// 기본 message 이벤트`)
      lines.push(`es.onmessage = (e) => {`)
      lines.push(`  console.log("받음:", e.data);`)
      if (state.idOn) lines.push(`  console.log("lastEventId:", e.lastEventId);`)
      lines.push(`};`)
    }
    return lines.join('\n')
  }, [state])

  const consoleLog = useMemo(() => {
    const logs: string[] = []
    logs.push(`받음: ${state.data}`)
    if (state.idOn) logs.push(`lastEventId: ${state.idValue}`)
    return logs.join('\n')
  }, [state])

  const reset = () => setState(INITIAL)

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <div className={styles.controls}>
          <header className={styles.colHead}>
            <span className={styles.colLabel}>서버 메시지 조립</span>
            <button type="button" className={styles.resetBtn} onClick={reset}>
              초기값
            </button>
          </header>

          <Field
            label="event:"
            description="이벤트 이름 (기본 'message')"
            on={state.eventOn}
            onToggle={(v) => setState({ ...state, eventOn: v })}
          >
            <input
              className={styles.textInput}
              value={state.eventValue}
              onChange={(e) => setState({ ...state, eventValue: e.target.value })}
              disabled={!state.eventOn}
              placeholder="token, done, error..."
            />
          </Field>

          <Field
            label="data:"
            description="본문 (필수). 줄바꿈 누르면 data: 라인이 늘어남"
            on={true}
            alwaysOn
          >
            <textarea
              className={styles.textArea}
              value={state.data}
              onChange={(e) => setState({ ...state, data: e.target.value })}
              rows={3}
              spellCheck={false}
            />
          </Field>

          <Field
            label="id:"
            description="이벤트 ID. 재연결할 때 서버가 어디서부터 보낼지 (Ep.4)"
            on={state.idOn}
            onToggle={(v) => setState({ ...state, idOn: v })}
          >
            <input
              className={styles.textInput}
              value={state.idValue}
              onChange={(e) => setState({ ...state, idValue: e.target.value })}
              disabled={!state.idOn}
              placeholder="42"
            />
          </Field>

          <Field
            label="retry:"
            description="재연결 간격 (ms). 브라우저 기본은 3000"
            on={state.retryOn}
            onToggle={(v) => setState({ ...state, retryOn: v })}
          >
            <input
              type="number"
              className={styles.textInput}
              value={state.retryValue}
              onChange={(e) =>
                setState({ ...state, retryValue: Number(e.target.value) })
              }
              disabled={!state.retryOn}
              min={0}
            />
          </Field>
        </div>

        <div className={styles.results}>
          <div className={styles.resultPanel} data-variant="raw">
            <header className={styles.colHead}>
              <span className={styles.colLabel}>네트워크로 흐르는 raw SSE</span>
              <span className={styles.muted}>(서버 → 클라)</span>
            </header>
            <pre className={styles.codeBlock}>
              {rawSse.split('\n').map((line, i, arr) => {
                if (i === arr.length - 1 && line === '') return null
                return (
                  <div key={i} className={styles.codeLine}>
                    {colorizeLine(line)}
                  </div>
                )
              })}
            </pre>
            <span className={styles.foot}>
              마지막 빈 줄(`\n\n`)이 메시지 경계
            </span>
          </div>

          <div className={styles.resultPanel} data-variant="client">
            <header className={styles.colHead}>
              <span className={styles.colLabel}>클라이언트 코드</span>
              <span className={styles.muted}>(자동 갱신)</span>
            </header>
            <pre className={styles.codeBlock}>
              {clientCode.split('\n').map((line, i) => (
                <div key={i} className={styles.codeLine}>
                  <span style={{ color: line.startsWith('//') ? 'var(--muted)' : undefined }}>
                    {line || ' '}
                  </span>
                </div>
              ))}
            </pre>
            <header className={styles.consoleHead}>console</header>
            <pre className={styles.console}>
              {consoleLog.split('\n').map((line, i) => (
                <div key={i} className={styles.consoleLine}>
                  &gt; {line}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  description,
  on,
  onToggle,
  alwaysOn,
  children,
}: {
  label: string
  description: string
  on: boolean
  onToggle?: (v: boolean) => void
  alwaysOn?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={styles.field} data-on={on}>
      <div className={styles.fieldHead}>
        <label className={styles.fieldLabelRow}>
          {!alwaysOn && (
            <input
              type="checkbox"
              checked={on}
              onChange={(e) => onToggle?.(e.target.checked)}
              className={styles.fieldCheck}
            />
          )}
          <span className={styles.fieldLabel}>{label}</span>
          {alwaysOn && <span className={styles.required}>필수</span>}
        </label>
        <span className={styles.fieldDesc}>{description}</span>
      </div>
      {children}
    </div>
  )
}

function colorizeLine(line: string) {
  if (line === '') return <span>&nbsp;</span>
  const colonIdx = line.indexOf(':')
  if (colonIdx < 0) return line
  const key = line.slice(0, colonIdx + 1)
  const rest = line.slice(colonIdx + 1)
  let color = 'var(--accent)'
  if (key.startsWith('data')) color = 'var(--accent-2)'
  else if (key.startsWith('event')) color = 'var(--warn)'
  else if (key.startsWith('id')) color = 'var(--branch-exp)'
  else if (key.startsWith('retry')) color = 'var(--info)'
  return (
    <>
      <span style={{ color, fontWeight: 600 }}>{key}</span>
      <span>{rest}</span>
    </>
  )
}
