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
    title: '냥사원, 부장님 앞에서 챗봇 시연을 망치다',
    subtitle: 'HTTP 응답을 안 닫고 흘려보낸다는 발상부터',
    estimatedMinutes: 9,
    prerequisites: [],
    status: 'ready',
    Component: lazy(() => import('./content/01-intro.mdx')),
  },
  {
    slug: 'eventsource',
    number: 2,
    title: '냥사원의 클라이언트 — EventSource 한 줄의 정체',
    subtitle: '브라우저가 바이트를 메시지로 바꿔주는 방식, 들여다보기',
    estimatedMinutes: 10,
    prerequisites: ['intro'],
    status: 'ready',
    Component: lazy(() => import('./content/02-eventsource.mdx')),
  },
  {
    slug: 'frames',
    number: 3,
    title: '냥차장이 슬쩍 알려준 메시지 포맷',
    subtitle: 'data · event · id · retry — 4가지 라인의 정체',
    estimatedMinutes: 9,
    prerequisites: ['eventsource'],
    status: 'ready',
    Component: lazy(() => import('./content/03-frames.mdx')),
  },
  {
    slug: 'reconnect',
    number: 4,
    title: '연결이 끊겼습니다… 어, 알아서 되돌아오는데?',
    subtitle: '자동 재연결과 Last-Event-ID로 잃어버린 메시지 되찾기',
    estimatedMinutes: 10,
    prerequisites: ['frames'],
    status: 'ready',
    Component: lazy(() => import('./content/04-reconnect.mdx')),
  },
  {
    slug: 'production',
    number: 5,
    title: '냥차장이 실전에서 한 번씩 다 밟아본 5개의 함정',
    subtitle: 'proxy 버퍼링, 인증 헤더, HTTP/2, CORS — 그리고 진짜 챗봇 데모',
    estimatedMinutes: 12,
    prerequisites: ['reconnect'],
    status: 'ready',
    Component: lazy(() => import('./content/05-production.mdx')),
  },
]

export const chapterBySlug = (slug: string) =>
  chapters.find((c) => c.slug === slug)
