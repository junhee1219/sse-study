import styles from './SiteFooter.module.css'

const REPO_URL = 'https://github.com/junhee1219/sse-study'
const CONTACT_EMAIL = 'leejunhee1219@snu.ac.kr'

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.muted}>
            냥사원의 SSE 분투기 · 냥테크 사내 강의 · 5에피소드
          </span>
          <span className={styles.contact}>
            문의 ·{' '}
            <a className={styles.link} href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </span>
        </div>
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
