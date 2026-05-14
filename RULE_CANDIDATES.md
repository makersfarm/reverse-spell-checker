# 맞춤법 규칙 후보 운영

이 문서는 `client/src/lib/reverseRuleCandidates.ts`에 쌓는 후보 데이터를 실제 검사 로직에 붙이는 기준을 정리한다.

## 참고한 방식

- LanguageTool: 규칙마다 패턴, 제안 문구, 예문을 두고 테스트로 회귀를 막는다.
- Hunspell: 단어 사전과 형태 규칙을 분리해서 운영한다.
- Vale: 규칙 파일을 작게 나누고, 규칙 종류와 심각도를 데이터로 둔다.
- spellcheck-ko: 한국어는 국립국어원 사전 데이터를 기반으로 사전형 검사 품질을 높인다.

이 프로젝트는 정교한 문법 검사기가 아니라 `리버스 맞춤법 검사기`이므로, 처음에는 사전형 엔진을 붙이기보다 "정답 표현 -> 바뀐 표현" 규칙을 검증 가능한 데이터로 누적한다.

## 후보 상태

- `ready`: 근거가 명확하고 문맥 영향이 낮아 바로 연결 가능한 후보
- `contextual`: 문맥에 따라 맞고 틀림이 갈리는 후보
- `needs-review`: 근거가 부족하거나 오탐 가능성이 커서 아직 연결하지 않는 후보

현재 엔진은 `ready`와 `contextual` 후보만 읽는다. `contextual` 후보는 기존 `includeContextual` 옵션이 켜진 경우에만 적용된다.

## 화면 분류

사용자에게 보이는 분류는 레퍼런스 검사기에서 많이 쓰는 표현을 따른다.

- `맞춤법`: 한글 맞춤법 기준의 표기 차이
- `띄어쓰기`: 띄어 쓰는 위치 차이
- `표준어`: 표준어 규정 기준의 표현 차이
- `외래어`: 외래어 표기법 기준의 표기 차이

네이버 맞춤법 검사기는 `맞춤법`, `띄어쓰기`, `표준어 의심`, `통계적 교정`을 쓰고, 일반 한글 검사기들도 `맞춤법 오류`, `띄어쓰기 오류`, `표준어 오류`, `통계적 교정` 식으로 나눈다. 이 프로젝트에서는 사용자가 요청한 대로 `표준어 의심`이 아니라 `표준어`를 쓴다. `통계적 교정`은 현재 엔진 성격과 맞지 않아 쓰지 않는다.

분류는 `client/src/lib/reverseRuleCandidates.ts`의 `type` 필드에 저장된다. 이 값은 `reverseSpellCheck.ts`에서 `ErrorItem.type`으로 내려가고, `client/src/pages/Home.tsx`에서 결과 배지와 하이라이트 색상에 사용된다.

## 추가 기준

1. 국립국어원 어문 규범, 표준국어대사전, 온라인가나다, 상담 사례 중 하나 이상을 근거로 둔다.
2. 단순 표기 후보는 `ready`로 둘 수 있다.
3. 뜻이 갈리는 후보는 `contextual`로 둔다.
4. 후보마다 `correct`, `wrong`, `reason`, `example`, `sourceUrl`을 채운다.
5. 실제 동작 변경 전에는 `client/src/lib/reverseSpellCheck.fixtures.ts`에 예시를 추가한다.

## 붙이는 흐름

1. `client/src/lib/reverseRuleCandidates.ts`에 후보를 추가한다.
2. `getAttachableReverseRuleCandidates()`가 `needs-review`를 제외한다.
3. `client/src/lib/reverseSpellCheck.ts`에서 후보를 `ReverseRule`로 변환한다.
4. 기존 수동 규칙과 중복되는 패턴은 한 번만 적용한다.
5. `pnpm check`, `pnpm test`, `pnpm build`로 확인한다.

## 다음에 확장할 부분

- 후보별 fixture 자동 생성
- 국립국어원/표준국어대사전 링크 정합성 점검 스크립트
- 사용자 피드백에서 후보를 만들되, 기본 상태는 `needs-review`로 저장
- 장기적으로 `spellcheck-ko/hunspell-dict-ko` 같은 사전형 데이터와 별도 레이어로 결합
