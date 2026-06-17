# CLAUDE.md

이 파일은 Claude Code와 다른 코드 에이전트가 이 저장소에서 작업할 때 참고하는 운영 메모다. 실제 우선순위는 사용자 지시, 더 가까운 `AGENTS.md`, 이 파일 순서다.

## Project Snapshot

- 제품: `맏춤법 검사기`
- 성격: 올바른 한국어 문장을 자주 헷갈리는 표기로 바꿔 보여주는 리버스 맞춤법 검사기
- 대표 URL: https://reverse-spell-checker.site/
- 저장소: https://github.com/makersfarm/reverse-spell-checker
- 배포: Vercel Git 연동, `main` push 시 Production 배포

## Stack

- React 19
- Vite
- TypeScript
- Express 정적 서버
- Vitest
- GA4
- pnpm

## Commands

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
pnpm qa
```

## Important Paths

- `client/src/pages/Home.tsx`: 메인 UI
- `client/src/index.css`: 화면 스타일
- `client/index.html`: SEO 메타, 정적 fallback 본문
- `client/src/lib/reverseSpellCheck.ts`: 변환 룰
- `client/src/lib/reverseSpellCheck.fixtures.ts`: 테스트 fixture
- `client/src/lib/analytics.ts`: GA4 이벤트
- `docs/spelling-rules.md`: 현재 적용된 맞춤법 규칙
- `RULE_UPDATE.md`: 룰 추가 기준
- `HARNESS.md`: 로컬, CI, UI, 배포, 분석, 검색 노출 검증 기준
- `DEPLOYMENT.md`: 배포 운영

## Product Rules

- 사이트명은 `맏춤법 검사기 - 리버스 맞춤법 검사기`, 화면 타이틀은 `맏춤법 검사기`를 유지한다.
- 사용자에게 “우리가 일부러 틀리게 만든다”는 식으로 설명하지 않는다. 화면 분위기와 예시로 이해시키는 쪽을 우선한다.
- 결과는 문장 안에서 직접 밑줄/하이라이트로 보여준다.
- 문장부호, 과한 띄어쓰기 장난, 사용자를 불쾌하게 만들 수 있는 변환은 넣지 않는다.
- 새 맞춤법 룰은 테스트 fixture와 함께 추가한다.
- 사용자 원문은 별도 동의 없이 저장하지 않는다.

## UX Copy

피해야 할 말:

- `오염`
- `교정 결과`
- `재미난 검사기`
- `일부러 틀려보기`
- `문장을 살짝 어긋나게`
- `맞춤법을 틀리게 만들어드립니다`
- `역대급 오류 보장`
- `오류 공장`
- `맞춤법 파괴`
- `틀린 문장 제조`
- `의도적으로 오류`

좋은 방향:

- 짧게 쓴다.
- 설명보다 조작과 결과를 먼저 보여준다.
- 버튼은 사용자가 바로 행동할 수 있는 말로 쓴다.
- 데이터 저장 범위는 짧고 정확하게 밝힌다.

## SEO Notes

- 대표 URL은 `https://reverse-spell-checker.site/`다.
- `robots.txt`는 `sitemap.xml` 하나만 가리킨다.
- 일반 웹페이지는 Google Indexing API 대상이 아니다.
- 검색 노출 개선은 Search Console URL 검사, sitemap 제출, 외부 링크, 정적 HTML 본문 보강으로 처리한다.
- `client/index.html`의 정적 fallback 본문은 검색봇이 JS 렌더링 전에 읽는 최소 설명이므로 지우지 않는다.

## Skill Routing

When a request matches an available skill, use it.

- UI/UX review or visual QA: `/design-review`, `/qa`, `ui-ux-pro-max`
- Release/documentation cleanup: `/document-release`
- Deployment: Vercel workflow or `/setup-deploy`
- Bug investigation: `/investigate`
- Product/positioning questions: `/office-hours`, `/plan-ceo-review`
- Architecture planning: `/plan-eng-review`

## Release Checklist

Before a release:

```bash
pnpm qa
```

Then:

1. Update docs if behavior changed.
2. Commit by work unit.
3. Push `main`.
4. Create a GitHub release tag.
5. Confirm Vercel production URL responds.
6. Check `HARNESS.md` for any extra UI, GA4, SEO, or deployment verification relevant to the change.
