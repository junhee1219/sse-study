import { useEffect, useRef, useState } from 'react'
import styles from './StreamingChatbot.module.css'

type Turn = {
  id: number
  role: 'user' | 'bot'
  text: string
  streaming?: boolean
}

type SamplePair = {
  q: string
  a: string
}

const SAMPLES: SamplePair[] = [
  {
    q: '안녕! 너 뭐 할 줄 알아?',
    a: '안녕하세요! 저는 또르륵 잘 흘러나오는 챗봇입니다. SSE 덕분에 글자가 만들어지는 족족 흘려보내고 있어요. 한 번에 답을 끓이지 않고 토큰 단위로 스트리밍하는 게 비결입니다.',
  },
  {
    q: 'SSE랑 WebSocket 중에 뭐가 좋아?',
    a: '서버에서 클라이언트로만 흘려보내면 되는 상황이면 SSE가 훨씬 단순합니다. 그냥 HTTP라서 프록시 통과도 쉽고, 자동 재연결도 공짜고, 메시지 포맷도 정해져 있죠. 양방향이 필요하면 WebSocket이 답이고요.',
  },
  {
    q: '운영에서 뭐가 제일 골치 아팠어?',
    a: 'nginx 같은 프록시가 응답을 버퍼링하는 거요. 글자가 또르륵 안 나오고 한 번에 펑 하고 나오는 일이 자꾸 생겨서, `X-Accel-Buffering: no` 헤더랑 `Cache-Control: no-cache` 매번 박아야 했어요. 그리고 HTTP/1.1로 운영하면 동시 연결 6개 제한도 골치였고요.',
  },
]

const TOKEN_DELAY_MS = 35

export function StreamingChatbot() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const tokenTimer = useRef<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const turnIdRef = useRef(0)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [turns])

  useEffect(
    () => () => {
      if (tokenTimer.current !== null) window.clearInterval(tokenTimer.current)
    },
    [],
  )

  const findSampleAnswer = (q: string): string => {
    const found = SAMPLES.find((s) => s.q === q)
    if (found) return found.a
    return '챗봇 데모입니다. 위쪽 추천 질문 중 하나를 골라서 다시 보내보세요. 그러면 SSE 토큰 스트리밍 흉내내는 응답이 또르륵 나옵니다.'
  }

  const send = (qText?: string) => {
    const userText = (qText ?? input).trim()
    if (!userText || streaming) return

    const userTurn: Turn = { id: ++turnIdRef.current, role: 'user', text: userText }
    const botTurn: Turn = { id: ++turnIdRef.current, role: 'bot', text: '', streaming: true }
    setTurns((t) => [...t, userTurn, botTurn])
    setInput('')
    setStreaming(true)

    const answer = findSampleAnswer(userText)
    const tokens = tokenize(answer)
    let i = 0

    tokenTimer.current = window.setInterval(() => {
      if (i >= tokens.length) {
        if (tokenTimer.current !== null) window.clearInterval(tokenTimer.current)
        tokenTimer.current = null
        setTurns((t) =>
          t.map((tn) => (tn.id === botTurn.id ? { ...tn, streaming: false } : tn)),
        )
        setStreaming(false)
        return
      }
      const next = tokens[i]
      setTurns((t) =>
        t.map((tn) =>
          tn.id === botTurn.id ? { ...tn, text: tn.text + next } : tn,
        ),
      )
      i += 1
    }, TOKEN_DELAY_MS)
  }

  const stop = () => {
    if (tokenTimer.current !== null) {
      window.clearInterval(tokenTimer.current)
      tokenTimer.current = null
    }
    setTurns((t) =>
      t.map((tn) =>
        tn.streaming ? { ...tn, streaming: false, text: tn.text + ' [중단됨]' } : tn,
      ),
    )
    setStreaming(false)
  }

  const reset = () => {
    if (tokenTimer.current !== null) window.clearInterval(tokenTimer.current)
    tokenTimer.current = null
    setTurns([])
    setStreaming(false)
    setInput('')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.brand}>
            <span className={styles.dot} />
            냥사원이 만든 또르륵 챗봇 v1.0
          </span>
          <button type="button" className={styles.miniBtn} onClick={reset}>
            대화 리셋
          </button>
        </div>
        <div className={styles.samples}>
          <span className={styles.samplesLabel}>추천 질문</span>
          {SAMPLES.map((s) => (
            <button
              type="button"
              key={s.q}
              className={styles.sampleBtn}
              onClick={() => send(s.q)}
              disabled={streaming}
            >
              {s.q}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chat} ref={listRef}>
        {turns.length === 0 && (
          <div className={styles.empty}>
            위 추천 질문을 누르거나, 아래에 직접 질문을 입력해보세요.
          </div>
        )}
        {turns.map((t) => (
          <div key={t.id} className={styles.bubbleRow} data-role={t.role}>
            <div className={styles.bubble} data-role={t.role}>
              {t.text}
              {t.streaming && <span className={styles.cursor} />}
            </div>
          </div>
        ))}
      </div>

      <form
        className={styles.composer}
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={streaming ? '응답 받는 중…' : '메시지를 입력하세요'}
          className={styles.input}
          disabled={streaming}
        />
        {streaming ? (
          <button type="button" className={styles.stopBtn} onClick={stop}>
            중단 ■
          </button>
        ) : (
          <button type="submit" className={styles.sendBtn} disabled={!input.trim()}>
            보내기 →
          </button>
        )}
      </form>
    </div>
  )
}

function tokenize(text: string): string[] {
  // Mimic LLM tokens: split into 1-3 character chunks
  const out: string[] = []
  let i = 0
  while (i < text.length) {
    const len = Math.floor(Math.random() * 3) + 1
    out.push(text.slice(i, i + len))
    i += len
  }
  return out
}
