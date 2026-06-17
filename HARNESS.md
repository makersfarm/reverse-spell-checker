# 검증 하네스

이 문서는 `맏춤법 검사기`의 기능, UI, 배포, 검색 노출 상태를 확인할 때 쓰는 기준이다.

## 기본 하네스

로컬과 CI의 기본 검증 명령은 하나로 맞춘다.

```bash
pnpm qa
```

`pnpm qa`는 아래 명령을 순서대로 실행한다.

```bash
pnpm check
pnpm test
pnpm build
```

## 룰 하네스

맞춤법 룰을 추가하거나 수정할 때는 다음 파일을 함께 확인한다.

- `client/src/lib/reverseSpellCheck.ts`
- `client/src/lib/reverseSpellCheck.fixtures.ts`
- `client/src/lib/reverseSpellCheck.test.ts`
- `docs/spelling-rules.md`
- `RULE_UPDATE.md`

확인 기준:

- fixture가 실제로 바뀐 표현을 검증하는가
- 오류 분류가 `맞춤법`, `띄어쓰기`, `표준어`, `외래어` 중 맞는 값인가
- 문맥 없이 위험한 룰이 기본 룰로 들어가지 않았는가
- 사용자를 불쾌하게 만들 수 있는 문장부호/띄어쓰기 장난이 들어가지 않았는가

## UI 하네스

UI를 바꾼 뒤에는 브라우저에서 주요 폭을 확인한다.

- 375
- 768
- 980
- 1024
- 1280
- 1440

확인 항목:

- 콘솔 에러 0
- 가로 overflow 0
- 긴 한국어 문장 입력 시 카드와 버튼이 깨지지 않음
- 결과 문장 안에서 밑줄/하이라이트가 보임
- 복사, 공유, 이미지 저장 버튼의 `aria-label`/`title` 유지
- `이것도 넣어줘` 팝업 열기/닫기/제출 플로우 정상
- 모바일에서 `검사하기` 버튼이 불필요하게 늘어나지 않음

## 배포 하네스

`main`에 push하면 Vercel Production 배포가 생성된다. 배포 뒤 확인할 URL:

- `https://reverse-spell-checker.site/`
- `https://reverse-spell-checker.site/robots.txt`
- `https://reverse-spell-checker.site/sitemap.xml`

기준:

- 홈: `200 OK`
- `robots.txt`: `sitemap.xml` 하나만 참조
- `sitemap.xml`: `application/xml`, 홈 URL 1개 포함
- `sitemap.txt`: 사용하지 않음

## 분석 하네스

GA4는 원문을 저장하지 않는다. 이벤트에는 길이, 분류, rule id처럼 비식별 신호만 보낸다.

핵심 이벤트:

- `page_view`
- `input_start`
- `check_submit`
- `result_generated`
- `rule_report_opened`
- `rule_report_submitted`

주요 파라미터:

- `error_count`
- `rule_count`
- `categories`
- `matched_rules`
- `matched_rule_1` ... `matched_rule_5`
- `char_count_bucket`

## 검색 노출 하네스

일반 웹페이지는 Google Indexing API 대상이 아니다. 검색 노출 관련 확인은 아래 순서로 한다.

1. Search Console URL 검사에서 홈 URL 확인
2. 실제 URL 테스트
3. 색인 생성 요청
4. sitemap은 `sitemap.xml`만 제출
5. 외부 링크는 GitHub README, GitHub Release, 소개글 등으로 만든다

기준:

- `index,follow` 유지
- canonical이 대표 URL과 일치
- `client/index.html`의 정적 fallback 본문에 제품명과 주요 케이스가 남아 있음
- sitemap/robots를 반복 수정하지 않음
