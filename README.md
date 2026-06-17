# 맏춤법 검사기

올바른 한국어 문장을 사람들이 자주 헷갈리는 표기로 바꿔 보여주는 리버스 맞춤법 검사기입니다.

- 서비스: https://reverse-spell-checker.site/
- GitHub: https://github.com/makersfarm/reverse-spell-checker

## 무엇을 하나요

- 되/돼, 안/않, 왜/외, 며칠/몇일처럼 자주 헷갈리는 표현을 문장 안에서 표시합니다.
- 맞춤법, 띄어쓰기, 표준어, 외래어 분류별로 바뀐 표현을 보여줍니다.
- 결과를 복사하거나 공유하고, 이미지로 저장할 수 있습니다.
- 빠진 표현은 앱 안에서 가볍게 남길 수 있고, GA4에는 원문 대신 분류와 길이만 보냅니다.

## 프로젝트 구조

```txt
client/   React + Vite 프론트엔드
server/   프로덕션 정적 파일 서빙용 Express 서버
shared/   클라이언트/서버 공유 코드
docs/     맞춤법 규칙과 운영 문서
```

핵심 파일:

- `client/src/pages/Home.tsx`: 메인 화면, 입력/결과/공유/표현 추가 UI
- `client/src/lib/reverseSpellCheck.ts`: 리버스 맞춤법 변환 로직
- `client/src/lib/reverseSpellCheck.fixtures.ts`: 룰 테스트 fixture
- `client/src/lib/analytics.ts`: GA4 이벤트 전송
- `docs/spelling-rules.md`: 현재 적용된 규칙 정리
- `RULE_UPDATE.md`: 새 맞춤법 룰을 추가할 때의 기준

## 로컬 개발

필요한 환경:

- Node.js 20 이상
- pnpm

```bash
pnpm install
pnpm dev
```

검증:

```bash
pnpm check
pnpm test
pnpm build
```

한 번에 확인:

```bash
pnpm qa
```

## 배포

Vercel Git 연동을 사용합니다. `main` 브랜치에 push하면 Production 배포가 생성됩니다.

Vercel 설정:

- Repository: `makersfarm/reverse-spell-checker`
- Framework Preset: `Vite`
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build`
- Output Directory: `dist/public`
- Production Branch: `main`

자세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 봅니다.

## 문서

- [맞춤법 룰 업데이트 기준](./RULE_UPDATE.md)
- [현재 적용 규칙](./docs/spelling-rules.md)
- [검증 하네스](./HARNESS.md)
- [룰 후보 정리](./RULE_CANDIDATES.md)
- [기능 명세](./SPEC.md)
- [배포 운영](./DEPLOYMENT.md)

## 운영 메모

- 사이트명은 `리버스 맞춤법 검사기`, 화면 타이틀은 `맏춤법 검사기`입니다.
- 대표 URL은 `https://reverse-spell-checker.site/`입니다.
- sitemap은 `sitemap.xml` 하나만 사용합니다.
- 일반 웹페이지는 Google Indexing API 대상이 아닙니다. 검색 노출 개선은 Search Console URL 검사, sitemap 제출, 외부 링크, 정적 본문 보강으로 처리합니다.
