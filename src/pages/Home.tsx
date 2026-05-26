import { Link } from 'react-router-dom'
import { chapters } from '../chapters'
import styles from './Home.module.css'

const differentiators = [
  {
    num: '01',
    title: '냥테크 사내 캐릭터',
    body: '냥사원이 헤매고 냥차장이 함정을 짚어주고 냥부장이 한 마디로 정리한다. 회의실에 앉아있는 기분으로 5에피소드.',
  },
  {
    num: '02',
    title: '바이트 단위 본질부터',
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
    body: 'nginx 버퍼링, 인증 헤더, HTTP/2 동시 연결 제한 — 냥차장이 작년에 한 번씩 다 밟아본 함정.',
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
          전체 {chapters.length}에피소드 · 약 {totalMinutes}분 · 냥테크 사내 강의
        </div>
        <h1 className={styles.title}>
          냥사원의 챗봇은 왜 <em>또르륵</em> 말을 못 했을까.
        </h1>
        <p className={styles.lead}>
          냥테크에 입사한 지 한 달째인 <strong>냥사원</strong>. 챗봇 사이드
          프로젝트를 자랑스럽게 시연했는데, <strong>냥부장</strong>이 한 마디
          던진다. "근데 옆 회사 챗봇은 글자가 또르륵 나오던데, 너 거는 왜 한 번에
          뱉냐?" 그날부터 시작된 냥사원의 <strong>Server-Sent Events</strong>{' '}
          분투기.
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
            냥사원의 일주일치 이야기가 순서대로 이어집니다. 익숙한 에피소드는
            건너뛰어도 OK.
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
