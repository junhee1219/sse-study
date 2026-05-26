import { useEffect, useRef, useState } from 'react'
import styles from './BufferingDemo.module.css'

type Mode = 'idle' | 'streaming' | 'done'

const ANSWER = '안녕하세요! 저는 또르륵 잘 흘러나오는 챗봇입니다. 토큰 단위로 스트리밍하는 게 비결입니다.'
const ANSWER_CHARS = [...ANSWER]
const CHAR_INTERVAL_MS = 50
const BUFFER_SIZE = 18

export function BufferingDemo() {
  const [buffered, setBuffered] = useState(true)
  const [mode, setMode] = useState<Mode>('idle')
  const [text, setText] = useState('')
  const [bufferContent, setBufferContent] = useState('')
  const timersRef = useRef<number[]>([])

  const clearAll = () => {
    for (const id of timersRef.current) {
      window.clearInterval(id)
      window.clearTimeout(id)
    }
    timersRef.current = []
  }

  useEffect(() => () => clearAll(), [])

  const start = () => {
    clearAll()
    setText('')
    setBufferContent('')
    setMode('streaming')

    let i = 0
    let buffer = ''
    const interval = window.setInterval(() => {
      if (i >= ANSWER_CHARS.length) {
        // flush remaining buffer
        if (buffered && buffer) {
          setText((t) => t + buffer)
          setBufferContent('')
        }
        window.clearInterval(interval)
        setMode('done')
        return
      }
      const ch = ANSWER_CHARS[i]
      i += 1
      if (buffered) {
        buffer += ch
        setBufferContent(buffer)
        if (buffer.length >= BUFFER_SIZE) {
          setText((t) => t + buffer)
          buffer = ''
          setBufferContent('')
        }
      } else {
        setText((t) => t + ch)
      }
    }, CHAR_INTERVAL_MS)
    timersRef.current.push(interval)
  }

  const reset = () => {
    clearAll()
    setText('')
    setBufferContent('')
    setMode('idle')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.controlRow}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={buffered}
            onChange={(e) => {
              setBuffered(e.target.checked)
              reset()
            }}
          />
          <span>
            프록시 버퍼링 <strong>{buffered ? '켜짐 (기본값)' : '꺼짐 (정상)'}</strong>
          </span>
        </label>
        <div className={styles.btns}>
          <button
            type="button"
            className={styles.btn}
            onClick={start}
            disabled={mode === 'streaming'}
          >
            {mode === 'done' ? '다시' : '응답 받기'} →
          </button>
          <button type="button" className={styles.btnGhost} onClick={reset}>
            리셋
          </button>
        </div>
      </div>

      <div className={styles.flow}>
        <div className={styles.node}>
          <span className={styles.nodeLabel}>서버</span>
          <span className={styles.nodeHint}>토큰을 한 글자씩 흘려보냄</span>
        </div>
        <span className={styles.arrow}>→</span>
        <div className={styles.proxy} data-buffered={buffered}>
          <span className={styles.nodeLabel}>프록시 (nginx)</span>
          <div className={styles.bufferBox}>
            {buffered ? bufferContent || '(비어있음)' : '— 통과 —'}
          </div>
          <span className={styles.nodeHint}>
            {buffered
              ? `버퍼가 ${BUFFER_SIZE}자 차면 한 번에 내려보냄`
              : '바이트를 그대로 통과시킴'}
          </span>
        </div>
        <span className={styles.arrow}>→</span>
        <div className={styles.node}>
          <span className={styles.nodeLabel}>브라우저</span>
          <div className={styles.output}>
            {text || <span className={styles.muted}>대기 중...</span>}
            {mode === 'streaming' && <span className={styles.cursor} />}
          </div>
        </div>
      </div>

      <p className={styles.caption}>
        {buffered
          ? '⚠️ 버퍼링이 켜져 있으면 글자가 한 덩어리씩 뚝뚝 끊겨 나온다. 또르륵이 또~륵.'
          : '✅ 버퍼링이 꺼져 있으면 서버가 보낸 그대로 한 글자씩 흘러나온다.'}
      </p>
    </div>
  )
}
