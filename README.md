# SSE 인터랙티브 가이드

또르륵 또르륵 흘러나오는 챗봇을 만들고 싶은 주인공의 좌충우돌 5에피소드. Server-Sent Events를 본질부터 손으로 만져보며 익히는 한국어 가이드.

라이브: https://junhee1219.github.io/sse-study/

## 에피소드 구성

- **Ep.1 — 왜 내 챗봇은 한 번에 답하지?** HTTP 응답을 안 닫고 흘려보내는 발상부터.
- **Ep.2 — EventSource 한 줄의 정체** 브라우저가 바이트를 메시지로 바꿔주는 방식. *(작성중)*
- **Ep.3 — `data:` 말고 또 뭐가 있는데?** data · event · id · retry 4가지 라인. *(작성중)*
- **Ep.4 — 끊겼다! ...아 알아서 되돌아오네?** 자동 재연결과 Last-Event-ID. *(작성중)*
- **Ep.5 — 실전에서 만난 5개의 함정** proxy 버퍼링, 인증 헤더, HTTP/2 등. *(작성중)*

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
