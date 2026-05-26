import styles from './SiteFooter.module.css'

const REPO_URL = 'https://github.com/junhee1219/sse-study'

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.muted}>
          냥사원의 SSE 분투기 · 냥테크 사내 강의 · 5에피소드
        </span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          GitHub →
        </a>
      </div>
    </footer>
  )
}
