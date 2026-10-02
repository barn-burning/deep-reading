# Dataset scope and collection plan

## v0.1 target

2022 개정 교육과정 중학교 1학년 국어 검정교과서의 수록 작품 관계를 구조화한다.

현재 확인된 교과서 판본은 10종(대표저자 기준)이며, 각 판본은 1-1 / 1-2로 구성된다.

- 동아출판 — 남궁민
- 미래엔 — 신유식
- 미래엔 — 민병곤
- 비상교육 — 박현숙
- 비상교육 — 박영민
- 지학사 — 서혁
- 창비교육 — 이도영
- 천재교과서 — 노미숙
- 천재교과서 — 정호웅
- 해냄에듀 — 강양희

## collection order

우선순위는 공개 목차·자습서 목차 접근성이 좋은 판본부터 시작한다.

1. 비상교육 박현숙 — 기존 샘플 보강
2. 지학사 서혁
3. 창비교육 이도영
4. 해냄에듀 강양희
5. 동아출판 남궁민
6. 미래엔 민병곤
7. 미래엔 신유식
8. 천재교과서 노미숙
9. 천재교과서 정호웅
10. 비상교육 박영민

## minimum fields

각 수록 관계는 최소한 다음 필드를 가져야 한다.

- curriculum
- school_level
- grade
- semester
- publisher
- representative_author
- textbook_title
- unit_no
- subunit_no
- work_title
- work_author
- genre
- placement
- source_url
- source_type
- retrieved_at
- review_status

## review rule

- official_confirmed: 교육부/교과서협회/출판사 공식 자료로 판본 확인
- verified_official: 해당 수록 관계를 출판사 공식 목차에서 확인
- verified_secondary: 자습서·평가문제집·서점 목차 등 2차 자료를 두 곳 이상 교차 확인
- candidate: 한 곳의 2차 자료에서만 확인
- partial: 일부 필드만 확인

## next milestone

v0.1의 완료 조건은 다음과 같다.

- 10종 × 2학기 = 20권의 교과서 판본 등록
- 각 권의 대단원 구조 확보
- 문학/서사/영상 작품 수록 관계 확보
- 작품별 표준 ID 부여
- 출처 및 검수 상태 기록
