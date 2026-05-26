# 냥사원의 SSE 분투기

옆 회사 챗봇처럼 글자가 또르륵 흘러나오는 챗봇을 만들고 싶은 신입 냥사원의 좌충우돌 5에피소드. 냥테크 사내 강의 컨셉으로 Server-Sent Events를 본질부터 손으로 만져보며 익히는 한국어 가이드.

라이브: https://junhee1219.github.io/sse-study/

## 등장인물

- **냥사원** — 신입. 챗봇 사이드 프로젝트 중. 자꾸 헤맨다.
- **냥차장** — 중간 시니어. 실무 함정을 작년에 한 번씩 다 밟아봤다.
- **냥부장** — 짬밥 최강. 한 마디로 본질을 짚어준다.

## 에피소드 구성

- **Ep.1 — 냥사원, 부장님 앞에서 챗봇 시연을 망치다.** HTTP 응답을 안 닫고 흘려보내는 발상부터.
- **Ep.2 — 냥사원의 클라이언트.** `new EventSource(url)` 한 줄의 정체. *(작성중)*
- **Ep.3 — 냥차장이 슬쩍 알려준 메시지 포맷.** data · event · id · retry. *(작성중)*
- **Ep.4 — 연결이 끊겼습니다… 어, 알아서 되돌아오는데?** 자동 재연결과 Last-Event-ID. *(작성중)*
- **Ep.5 — 냥차장의 함정 5종 + 완성된 챗봇 데모.** proxy 버퍼링, 인증 헤더, HTTP/2 등. *(작성중)*

## 로컬에서 돌리기

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 에 정적 산출물
npm run preview  # 빌드 결과 미리보기
```

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 자동으로 GitHub Pages에 배포한다. base path는 워크플로우에서 `/${{ github.event.repository.name }}/`로 주입돼서 vite.config.ts의 기본값을 덮어쓴다.

## 스택

- React 18 + React Router 6
- Vite 5 + @mdx-js/rollup (각 에피소드 = MDX)
- Shiki (예정, 코드 하이라이트)
- 디자인 토큰 + CSS modules
