# 배포 운영

이 프로젝트는 Vercel Git 연동을 기본 배포 방식으로 쓴다.

## 자동배포 구조

- GitHub `main` 브랜치에 push되면 Vercel Production 배포가 생성된다.
- PR 또는 `main`이 아닌 브랜치 push는 Vercel Preview 배포로 확인한다.
- GitHub Actions는 배포를 직접 하지 않고 `pnpm check`, `pnpm test`, `pnpm build`만 확인한다.

Vercel 공식 문서 기준으로 Git 저장소를 연결하면 브랜치 push마다 자동 배포가 생성되고, production branch의 최신 변경은 Production 배포가 된다.

## Vercel 프로젝트 설정

Vercel에서 GitHub 저장소를 import한다.

- Repository: `makersfarm/reverse-spell-checker`
- Framework Preset: `Vite`
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build`
- Output Directory: `dist/public`
- Production Branch: `main`

위 값은 `vercel.json`에도 저장되어 있다.

## 환경 변수

기본 배포 URL을 그대로 쓸 때는 환경 변수가 없어도 된다.

커스텀 도메인을 대표 URL로 고정해야 할 때만 Vercel Project Settings에서 설정한다.

```txt
VITE_SITE_URL=https://example.com
```

## 로컬 확인

배포 전 로컬에서 다음 명령을 통과시킨다.

```bash
pnpm check
pnpm test
pnpm build
```

## 주의

- Vercel CLI가 로그인되어 있지 않은 로컬 환경에서는 프로젝트 연결을 자동으로 끝낼 수 없다.
- GitHub Actions에 Vercel 토큰을 넣어 직접 배포하는 방식은 당장 쓰지 않는다. Vercel Git 연동이 더 단순하고 Preview/Production 도메인 관리가 자연스럽다.
- 커스텀 도메인은 Vercel에서 도메인을 추가한 뒤 DNS를 연결한다. 이후 `main` 배포가 자동으로 해당 도메인에 반영된다.
