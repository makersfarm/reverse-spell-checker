# AGENTS.md

이 파일은 이 디렉터리 전체에 적용된다. 더 하위 디렉터리에 별도 `AGENTS.md`가 있으면 하위 파일에는 더 가까운 지침을 우선한다. 직접 받은 사용자 지시는 항상 이 파일보다 우선한다.

## 프로젝트 기준

- 이 프로젝트는 한국어 웹 앱 `맏춤법 검사기`다.
- 현재 앱 구조는 `client/`, `server/`, `shared/` 기준으로 유지한다.
- 패키지 매니저는 `pnpm`을 사용한다.
- 기존 코드를 먼저 읽고, Manus에서 넘어온 UI 구조를 함부로 갈아엎지 않는다.

## 공식 문서 우선

- 구현 전에 관련 프레임워크/라이브러리의 공식 문서를 먼저 확인한다.
- React, Vite, Tailwind, Radix UI, Sonner, html2canvas 등 외부 API 사용 방식이 애매하면 블로그나 추측보다 공식 문서를 우선한다.
- Codex 작업 규칙은 OpenAI Codex 안내와 AGENTS.md 설명을 따른다: https://openai.com/index/introducing-codex/
- 웹 UI 점검은 Vercel Web Interface Guidelines를 기준으로 한다: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

## UX Writing

- 설명형 농담, AI 티 나는 과장, “우리가 일부러 틀리게 만든다”는 뉘앙스를 피한다.
- 쓰지 말 것: `오염`, `교정 결과`, `재미난 검사기`, `일부러 틀려보기`, `문장을 살짝 어긋나게`, `맞춤법을 틀리게 만들어드립니다`, `역대급 오류 보장`, `오류 공장`, `맞춤법 파괴`, `틀린 문장 제조`, `의도적으로 오류`.
- 화면 문구는 짧게 쓴다. 기능 설명보다 결과와 조작을 바로 보여준다.
- 사이트명은 `리버스 맞춤법 검사기`, 화면 타이틀은 `맏춤법 검사기`를 유지한다.
- 결과 영역에서는 바뀐 표현을 문장 안에서 직접 밑줄/하이라이트로 보여준다.

## UI 구현 원칙

- 반응형은 hard breakpoint보다 `clamp()`, `auto-fit`, `minmax()`, flex/grid 흐름을 우선한다.
- 가로 리사이즈 중 1열/2열 전환이 갑자기 튀지 않게 콘텐츠 폭 기준으로 설계한다.
- `transition: all`을 쓰지 않는다. 바뀌는 속성만 명시한다.
- `prefers-reduced-motion`을 존중한다.
- `maximum-scale=1`처럼 사용자 줌을 막는 설정을 넣지 않는다.
- 아이콘 버튼에는 `aria-label` 또는 `title`을 제공한다.
- 입력 필드는 label, name, autocomplete, focus-visible 상태를 확인한다.
- 긴 한국어 입력이 레이아웃을 깨지 않도록 `min-width: 0`, `word-break`, overflow를 점검한다.

## 코드 변경 원칙

- 수동 편집은 `apply_patch`로 한다.
- 파일 검색은 `rg` 또는 `rg --files`를 우선한다.
- 기존 사용자 변경을 되돌리지 않는다.
- 새 기능보다 현재 사용자 경험을 유지하는 작은 수정이 우선이다.
- 불필요한 리팩터링, 문서 대량 생성, 디자인 전면 교체는 요청이 있을 때만 한다.

## 검증

변경 후 가능한 한 아래 명령을 실행한다.

```bash
pnpm test
pnpm check
pnpm build
```

UI 변경 후에는 브라우저에서 확인한다.

- 주요 폭: 375, 768, 980, 1024, 1280, 1440
- 확인 항목: 콘솔 에러 0, 가로 overflow 0, 결과 하이라이트 표시, 입력/검사/복사 기본 플로우

빌드의 chunk size warning은 현재 Manus 기반 의존성 때문에 발생할 수 있다. 실패가 아니라면 별도 최적화 요청 전에는 기능 변경과 분리해서 다룬다.
