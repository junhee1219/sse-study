import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { chapterBySlug, chapters } from '../chapters'
import { NotFound } from './NotFound'
import styles from './ChapterPage.module.css'

function setMetaDescription(content: string) {
  const el = document.querySelector('meta[name="description"]')
  if (el) el.setAttribute('content', content)
}

function setMetaProperty(name: string, content: string) {
  const el = document.querySelector(`meta[property="${name}"]`)
  if (el) el.setAttribute('content', content)
}

function setMetaName(name: string, content: string) {
  const el = document.querySelector(`meta[name="${name}"]`)
  if (el) el.setAttribute('content', content)
}

type Props = {
  slug: string
}

export function ChapterPage({ slug }: Props) {
  const chapter = chapterBySlug(slug)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  useEffect(() => {
    if (!chapter) return
    const fullTitle = `Ep.${chapter.number} ${chapter.title} — 냥사원의 SSE 분투기`
    document.title = fullTitle
    setMetaDescription(`${chapter.subtitle}. Server-Sent Events 한국어 인터랙티브 가이드 ${chapter.number}화.`)
    setMetaProperty('og:title', fullTitle)
    setMetaProperty('og:description', chapter.subtitle)
    setMetaProperty('og:url', `https://junhee1219.github.io/sse-study/#/chapters/${chapter.slug}`)
    setMetaName('twitter:title', fullTitle)
    setMetaName('twitter:description', chapter.subtitle)
    return () => {
      document.title = '냥사원의 SSE 분투기 — Server-Sent Events 한국어 인터랙티브 가이드'
    }
  }, [chapter])

  if (!chapter) return <NotFound />

  const { Component } = chapter
  const index = chapters.findIndex((c) => c.slug === slug)
  const prev = index > 0 ? chapters[index - 1] : null
  const next = index < chapters.length - 1 ? chapters[index + 1] : null

  return (
    <article className={styles.chapter}>
      <header className={styles.head}>
        <div className={styles.crumbs}>
          <Link to="/" className={styles.crumb}>
            홈
          </Link>
          <span className={styles.crumbSep}>/</span>
          <span className={styles.crumbCurrent}>Ep.{chapter.number}</span>
        </div>
        <h1 className={styles.title}>{chapter.title}</h1>
        <p className={styles.subtitle}>{chapter.subtitle}</p>
        <div className={styles.meta}>
          <span className={styles.metaPill}>
            <span className={styles.metaLabel}>읽기 시간</span>
            <span className={styles.metaValue}>약 {chapter.estimatedMinutes}분</span>
          </span>
          {chapter.prerequisites.length > 0 && (
            <span className={styles.metaPill}>
              <span className={styles.metaLabel}>이전 에피소드</span>
              <span className={styles.metaValue}>
                {chapter.prerequisites.map((slug) => (
                  <Link
                    key={slug}
                    to={`/chapters/${slug}`}
                    className={styles.metaLink}
                  >
                    {slug}
                  </Link>
                ))}
              </span>
            </span>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <Component />
      </div>

      <nav className={styles.pager}>
        {prev ? (
          <Link to={`/chapters/${prev.slug}`} className={styles.pagerItem}>
            <span className={styles.pagerLabel}>← 이전</span>
            <span className={styles.pagerNum}>Ep.{prev.number}</span>
            <span className={styles.pagerTitle}>{prev.title}</span>
          </Link>
        ) : (
          <Link to="/" className={styles.pagerItem}>
            <span className={styles.pagerLabel}>← 홈으로</span>
            <span className={styles.pagerTitle}>에피소드 목록 보기</span>
          </Link>
        )}
        {next ? (
          <Link to={`/chapters/${next.slug}`} className={styles.pagerItem} data-dir="next">
            <span className={styles.pagerLabel}>다음 →</span>
            <span className={styles.pagerNum}>Ep.{next.number}</span>
            <span className={styles.pagerTitle}>{next.title}</span>
          </Link>
        ) : (
          <Link to="/" className={styles.pagerItem} data-dir="next">
            <span className={styles.pagerLabel}>완주! →</span>
            <span className={styles.pagerTitle}>홈으로 돌아가기</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
