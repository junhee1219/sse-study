import type { LazyExoticComponent, ComponentType } from 'react'
import { lazy } from 'react'

export type ChapterMeta = {
  slug: string
  number: number
  title: string
  subtitle: string
  estimatedMinutes: number
  prerequisites: string[]
  status: 'ready' | 'draft' | 'planned'
  Component: LazyExoticComponent<ComponentType>
}

export const chapters: ChapterMeta[] = [
  {
    slug: 'intro',
    number: 1,
    title: '또르의 고민 — 왜 내 챗봇은 한 번에 답하지?',
    subtitle: 'HTTP 응답을 안 닫고 계속 쓰면 어떻게 될까',
    estimatedMinutes: 9,
    prerequisites: [],
    status: 'ready',
    Component: lazy(() => import('./content/01-intro.mdx')),
  },
  {
    slug: 'eventsource',
    number: 2,
    title: 'EventSource 한 줄의 정체',
    subtitle: '브라우저가 바이트를 메시지로 바꿔주는 마법, 들여다보기',
    estimatedMinutes: 10,
    prerequisites: ['intro'],
    status: 'draft',
    Component: lazy(() => import('./content/02-eventsource.mdx')),
  },
  {
    slug: 'frames',
    number: 3,
    title: '`data:` 말고 또 뭐가 있는데?',
    subtitle: 'data · event · id · retry — 4가지 라인의 정체',
    estimatedMinutes: 9,
    prerequisites: ['eventsource'],
    status: 'draft',
    Component: lazy(() => import('./content/03-frames.mdx')),
  },
  {
    slug: 'reconnect',
    number: 4,
    title: '끊겼다! ...아 알아서 되돌아오네?',
    subtitle: '자동 재연결과 Last-Event-ID로 잃어버린 메시지 되찾기',
    estimatedMinutes: 10,
    prerequisites: ['frames'],
    status: 'draft',
    Component: lazy(() => import('./content/04-reconnect.mdx')),
  },
  {
    slug: 'production',
    number: 5,
    title: '또르가 실전에서 만난 5개의 함정',
    subtitle: 'proxy 버퍼링, 인증 헤더, HTTP/2, CORS — 그리고 진짜 챗봇',
    estimatedMinutes: 12,
    prerequisites: ['reconnect'],
    status: 'draft',
    Component: lazy(() => import('./content/05-production.mdx')),
  },
]

export const chapterBySlug = (slug: string) =>
  chapters.find((c) => c.slug === slug)
