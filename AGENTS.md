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
- `제보`, `피드백`, `오류 신고`처럼 부담이 큰 말보다 사용자가 가볍게 누를 수 있는 말을 우선한다. 예: `이것도 넣어줘`, `기록해두기`.
- 팝업 문구는 사용자가 무엇을 적으면 되는지 바로 알 수 있게 쓰고, 데이터 저장 범위는 숨기지 않는다.

## SEO와 검색 노출

- 대표 URL은 `https://reverse-spell-checker.site/`다.
- `robots.txt`는 `sitemap.xml` 하나만 가리킨다. `sitemap.txt` 같은 대체 파일을 다시 추가하지 않는다.
- Google 일반 웹페이지는 Indexing API 대상이 아니다. 검색 노출 관련 작업은 Search Console URL 검사, sitemap 제출, 외부 링크, 정적 HTML 본문 보강으로 처리한다.
- SEO용 정적 본문은 `client/index.html`의 `#root` fallback 안에 둔다. React 렌더링 전에도 `맏춤법 검사기`, `리버스 맞춤법 검사기`, 주요 케이스가 읽혀야 한다.
- 메타/구조화 데이터/README/레포 description이 서로 다른 이름을 말하지 않게 유지한다.

## 맞춤법 룰 운영

- 새 룰은 `RULE_UPDATE.md`와 `docs/spelling-rules.md` 기준을 따른다.
- 룰 추가 시 `client/src/lib/reverseSpellCheck.ts`와 `client/src/lib/reverseSpellCheck.fixtures.ts`를 함께 수정한다.
- 문맥 없이 정상 문장을 과하게 바꾸는 룰은 기본 룰로 넣지 않는다.
- 사용자 입력 원문 저장은 별도 동의와 정책 없이는 하지 않는다. GA4에는 분류, 길이, rule id 같은 비식별 신호만 보낸다.

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
- 커밋/푸시는 사용자가 명시했을 때만 한다. 단, 사용자가 릴리즈/배포/푸시까지 요청한 경우에는 작업별 커밋 후 push한다.

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

<!-- BEGIN GSTACK-CODEX MANAGED BLOCK -->
## gstack — AI Engineering Workflow

This block is managed by `gstack-codex`. Do not edit inside this block.

Skills live in `.agents/skills`. Invoke them by name, e.g. `/office-hours`.
Refresh with `npx gstack-codex init --project`.
This repo currently has the `full` pack installed.

## Available skills

| Skill | What it does |
|-------|-------------|
| `/office-hours` | YC Office Hours — two modes. Startup mode: six forcing questions that expose demand reality, status quo, desperate specificity, narrowest wedge, observation, and future-fit. |
| `/plan-ceo-review` | CEO/founder-mode plan review. Rethink the problem, find the 10-star product, challenge premises, expand scope when it creates a better product. |
| `/plan-eng-review` | Eng manager-mode plan review. Lock in the execution plan — architecture, data flow, diagrams, edge cases, test coverage, performance. |
| `/plan-design-review` | Designer's eye plan review — interactive, like CEO and Eng review. |
| `/design-consultation` | Design consultation: understands your product, researches the landscape, proposes a complete design system (aesthetic, typography, color, layout, spacing, motion), and generates font+color preview pages. |
| `/review` | Pre-landing PR review. Analyzes diff against the base branch for SQL safety, LLM trust boundary violations, conditional side effects, and other structural issues. |
| `/investigate` | Systematic debugging with root cause investigation. Four phases: investigate, analyze, hypothesize, implement. |
| `/design-review` | Designer's eye QA: finds visual inconsistency, spacing issues, hierarchy problems, AI slop patterns, and slow interactions — then fixes them. |
| `/qa` | Systematically QA test a web application and fix bugs found. |
| `/qa-only` | Report-only QA testing. Systematically tests a web application and produces a structured report with health score, screenshots, and repro steps — but never fixes anything. |
| `/ship` | Ship workflow: detect + merge base branch, run tests, review diff, bump VERSION, update CHANGELOG, commit, push, create PR. |
| `/document-release` | Post-ship documentation update. Reads all project docs, cross-references the diff, updates README/ARCHITECTURE/CONTRIBUTING/CLAUDE.md to match what shipped, polishes CHANGELOG voice, cleans up TODOS, and optionally bumps VERSION. |
| `/retro` | Weekly engineering retrospective. Analyzes commit history, work patterns, and code quality metrics with persistent history and trend tracking. |
| `/browse` | Fast headless browser for QA testing and site dogfooding. Navigate any URL, interact with elements, verify page state, diff before/after actions, take annotated screenshots, check responsive layouts, test forms and uploads, handle dialogs, and assert element states. |
| `/setup-browser-cookies` | Import cookies from your real Chromium browser into the headless browse session. |
| `/careful` | Safety guardrails for destructive commands. Warns before rm -rf, DROP TABLE, force-push, git reset --hard, kubectl delete, and similar destructive operations. |
| `/freeze` | Restrict file edits to a specific directory for the session. |
| `/guard` | Full safety mode: destructive command warnings + directory-scoped edits. |
| `/unfreeze` | Clear the freeze boundary set by /freeze, allowing edits to all directories again. |
| `/gstack-upgrade` | Upgrade gstack to the latest version. Detects global vs vendored install, runs the upgrade, and shows what's new. |
| `/autoplan` | Auto-review pipeline — reads the full CEO, design, eng, and DX review skills from disk and runs them sequentially with auto-decisions using 6 decision principles. |
| `/benchmark` | Performance regression detection using the browse daemon. Establishes baselines for page load times, Core Web Vitals, and resource sizes. |
| `/benchmark-models` | Cross-model benchmark for gstack skills. Runs the same prompt through Claude, GPT (via Codex CLI), and Gemini side-by-side — compares latency, tokens, cost, and optionally quality via LLM judge. |
| `/canary` | Post-deploy canary monitoring. Watches the live app for console errors, performance regressions, and page failures using the browse daemon. |
| `/claude` | Claude Code CLI wrapper for non-Claude hosts - three modes. Review: independent diff review via claude -p. |
| `/context-restore` | Restore working context saved earlier by /context-save. Loads the most recent saved state (across all branches by default) so you can pick up where you left off — even across Conductor workspace handoffs. |
| `/context-save` | Save working context. Captures git state, decisions made, and remaining work so any future session can pick up without losing a beat. |
| `/cso` | Chief Security Officer mode. Infrastructure-first security audit: secrets archaeology, dependency supply chain, CI/CD pipeline security, LLM/AI security, skill supply chain scanning, plus OWASP Top 10, STRIDE threat modeling, and active verification. |
| `/design-html` | Design finalization: generates production-quality Pretext-native HTML/CSS. |
| `/design-shotgun` | Design shotgun: generate multiple AI design variants, open a comparison board, collect structured feedback, and iterate. |
| `/devex-review` | Live developer experience audit. Uses the browse tool to actually TEST the developer experience: navigates docs, tries the getting started flow, times TTHW, screenshots error messages, evaluates CLI help text. |
| `/health` | Code quality dashboard. Wraps existing project tools (type checker, linter, test runner, dead code detector, shell linter), computes a weighted composite 0-10 score, and tracks trends over time. |
| `/land-and-deploy` | Land and deploy workflow. Merges the PR, waits for CI and deploy, verifies production health via canary checks. |
| `/landing-report` | Read-only queue dashboard for workspace-aware ship. Shows which VERSION slots are currently claimed by open PRs, which sibling Conductor workspaces have WIP work likely to ship soon, and what slot /ship would pick next. |
| `/learn` | Manage project learnings. Review, search, prune, and export what gstack has learned across sessions. |
| `/make-pdf` | Turn any markdown file into a publication-quality PDF. Proper 1in margins, intelligent page breaks, page numbers, cover pages, running headers, curly quotes and em dashes, clickable TOC, diagonal DRAFT watermark. |
| `/open-gstack-browser` | Launch GStack Browser — AI-controlled Chromium with the sidebar extension baked in. |
| `/pair-agent` | Pair a remote AI agent with your browser. One command generates a setup key and prints instructions the other agent can follow to connect. |
| `/plan-devex-review` | Interactive developer experience plan review. Explores developer personas, benchmarks against competitors, designs magical moments, and traces friction points before scoring. |
| `/plan-tune` | Self-tuning question sensitivity + developer psychographic for gstack (v1: observational). |
| `/scrape` | Pull data from a web page. First call on a new intent prototypes the flow via $B primitives and returns JSON. |
| `/setup-deploy` | Configure deployment settings for /land-and-deploy. Detects your deploy platform (Fly.io, Render, Vercel, Netlify, Heroku, GitHub Actions, custom), production URL, health check endpoints, and deploy status commands. |
| `/setup-gbrain` | Set up gbrain for this coding agent: install the CLI, initialize a local PGLite or Supabase brain, register MCP, capture per-remote trust policy. |
| `/skillify` | Codify the most recent successful /scrape flow into a permanent browser-skill on disk. |
| `/sync-gbrain` | Keep gbrain current with this repo's code and refresh agent search guidance in CLAUDE.md. |

Repo installs include the full generated skill pack. Heavy browser/runtime binaries stay machine-local in v1.
Installed release: `0.2.3`
<!-- END GSTACK-CODEX MANAGED BLOCK -->
