# 맏춤법 검사기

올바른 한국어 문장을 흔히 보이는 맞춤법/띄어쓰기 실수 형태로 바꿔 보여주는 React/Vite 앱입니다.

## 구성

- `client/`: React 프론트엔드
- `server/`: 프로덕션 정적 파일 서빙용 Express 서버
- `shared/`: 클라이언트/서버 공유 상수

## 로컬 개발

필요한 환경:

- Node.js 20 이상
- pnpm

의존성 설치:

```bash
pnpm install
```

개발 서버 실행:

```bash
pnpm dev
```

타입 체크:

```bash
pnpm check
```

테스트 실행:

```bash
pnpm test
```

프로덕션 빌드:

```bash
pnpm build
```

빌드 결과 미리보기:

```bash
pnpm preview
```

## Vercel

이 저장소를 Vercel에 가져올 때 `reverse-spell-checker` 디렉터리를 프로젝트 루트로 지정합니다. Vercel의 Vite 프리셋 기준 설정은 다음과 같습니다.

- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build`
- Output Directory: `dist/public`

현재 MVP에는 런타임 환경 변수가 필요하지 않습니다.
