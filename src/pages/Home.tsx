import { Link } from 'react-router-dom'
import { chapters } from '../chapters'
import styles from './Home.module.css'

const differentiators = [
  {
    num: '01',
    title: '주인공 또르가 안내',
    body: '"내 챗봇도 또르륵 말 하게 하고 싶다." 또르의 좌충우돌 5에피소드를 따라가면서 SSE가 머리에 박힌다.',
  },
  {
    num: '02',
    title: '바이트 단위로 본질부터',
    body: 'EventSource API 쓰는 법이 아니라, 그 안에서 어떤 바이트가 어떻게 흘러가는지부터.',
  },
  {
    num: '03',
    title: '진짜로 만져본다',
    body: '에피소드마다 가짜 서버가 살아있다. 끊기 버튼 누르면 진짜 끊기고, 재연결도 진짜 일어난다.',
  },
  {
    num: '04',
    title: '실전 함정까지',
    body: 'nginx 버퍼링, 인증 헤더, HTTP/2 동시 연결 제한 — 또르가 실전에서 한 번씩 다 밟아본다.',
  },
]

const statusLabel: Record<'ready' | 'draft' | 'planned', string> = {
  ready: '준비됨',
  draft: '작성중',
  planned: '예정',
}

const totalMinutes = chapters.reduce((s, c) => s + c.estimatedMinutes, 0)

export function Home() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          전체 {chapters.length}에피소드 · 약 {totalMinutes}분
        </div>
        <h1 className={styles.title}>
          또르의 챗봇은 왜 <em>또르륵</em> 말을 못 했을까.
        </h1>
        <p className={styles.lead}>
          또르는 1인 챗봇 개발자다. 친구 <strong>지피티</strong>처럼 글자가
          또르륵 또르륵 흘러나오는 챗봇을 만들고 싶다. 그런데 또르의 챗봇은
          답을 한참 끓이다가 한 번에 떡 뱉는다. 도대체 뭐가 다른 거야?{' '}
          <strong>Server-Sent Events</strong>를 만나기 직전 또르의 이야기에서
          모험이 시작된다.
        </p>
        <div className={styles.heroActions}>
          <Link to={`/chapters/${chapters[0]!.slug}`} className={styles.btnPrimary}>
            1화부터 시작 →
          </Link>
          <a href="#chapters" className={styles.btnGhost}>
            에피소드 목록 보기
          </a>
        </div>
      </section>

      <section className={styles.diffs}>
        {differentiators.map((d) => (
          <div key={d.title} className={styles.diff}>
            <div className={styles.diffNum}>{d.num}</div>
            <h3 className={styles.diffTitle}>{d.title}</h3>
            <p className={styles.diffBody}>{d.body}</p>
          </div>
        ))}
      </section>

      <section id="chapters" className={styles.chaptersBlock}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>에피소드 가이드</h2>
          <p className={styles.sectionLead}>
            또르의 이야기는 순서대로 이어지지만, 익숙한 에피소드는 건너뛰어도
            됩니다.
          </p>
        </div>
        <div className={styles.cards}>
          {chapters.map((c) => (
            <Link
              key={c.slug}
              to={`/chapters/${c.slug}`}
              className={styles.card}
              data-status={c.status}
            >
              <div className={styles.cardHead}>
                <span className={styles.cardNumber}>Ep.{c.number}</span>
                <span className={styles.cardStatus} data-status={c.status}>
                  {statusLabel[c.status]}
                </span>
              </div>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.cardSubtitle}>{c.subtitle}</p>
              <div className={styles.cardMeta}>
                <span>약 {c.estimatedMinutes}분</span>
                {c.prerequisites.length > 0 && (
                  <span className={styles.cardPrereq}>
                    선행 · {c.prerequisites.join(', ')}
                  </span>
                )}
              </div>
              <div className={styles.cardArrow} aria-hidden="true">
                →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
