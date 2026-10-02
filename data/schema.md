# Data schema v0.1

## textbook

```ts
type Textbook = {
  id: string
  curriculum: string
  schoolLevel: "middle" | "high"
  grade: number
  semester: number
  subject: string
  publisher: string
  representativeAuthor: string
  title: string
  pages?: number
  units: Unit[]
  sources: Source[]
  reviewStatus: ReviewStatus
}
```

## unit

```ts
type Unit = {
  unitNo: number
  title: string
  domains?: string[]
  subunits?: {
    subunitNo: string
    title: string
  }[]
}
```

## work

```ts
type Work = {
  id: string
  title: string
  author?: string
  genre?: string
  sources: Source[]
  reviewStatus: ReviewStatus
}
```

## textbook_work

수록 작품과 교과서를 연결하는 관계 데이터입니다.

```ts
type TextbookWork = {
  textbookId: string
  workId: string
  unitNo?: number
  subunitNo?: string
  placement?: "main" | "supplementary" | "unknown"
  evidenceSource: string
  reviewStatus: ReviewStatus
}
```

## source

```ts
type Source = {
  label: string
  url: string
  sourceType:
    | "publisher"
    | "official_textbook"
    | "reference_book"
    | "education_service"
    | "bookstore"
    | "other"
  retrievedAt: string
}
```

## 장기 확장

교과서 수록 관계가 안정화된 뒤 별도 계층으로 추가합니다.

```
work_contexts
work_features
work_characters
inquiry_axes
curriculum_standards
inquiry_axis_standards
session_thought_nodes
```

중요: `inquiry_axes`는 정답 해설을 저장하는 테이블이 아니라, 작품을 탐구할 수 있는 열린 관점을 저장하는 계층으로 설계합니다.


## curriculum_standard

2022 개정 교육과정의 성취기준 원문을 저장합니다.

```ts
type CurriculumStandard = {
  id: string
  domain: string
  schoolBand: string
  statement: string
  tags?: string[]
  source: {
    title: string
    fileId?: string
    url?: string
    retrievedAt: string
  }
}
```

## unit_standard

교과서 단원과 성취기준의 관계입니다. 출판사가 명시한 대응과 데이터셋이 단원명/구성으로 추론한 대응을 반드시 구분합니다.

```ts
type UnitStandard = {
  textbookId: string
  unitNo: number
  subunitNo: string
  standardId: string
  mappingType: "publisher_explicit" | "inferred_unit_alignment"
  confidence: "high" | "medium" | "low"
  basis: string
}
```

중요: `inferred_unit_alignment`는 공식적인 출판사 교육과정 대응표가 아니라, 공개된 단원명과 교육과정 성취기준의 의미적 대응을 기록한 분석 계층입니다.


## work_standard_context (derived)

`textbook_works`와 `unit_standard`를 조인한 파생 관계입니다. 작품 자체에 성취기준을 고정 부여하는 것이 아니라, **특정 교과서·소단원 안에서 어떤 성취기준 맥락에 배치되었는지**를 표현합니다.

```ts
type WorkStandardContext = {
  workId: string
  textbookId: string
  unitNo: number
  subunitNo: string
  standardId: string
  mappingType: "publisher_explicit" | "inferred_unit_alignment"
  confidence: "high" | "medium" | "low"
}
```

중요: 같은 작품이라도 교과서가 달라지면 다른 성취기준 맥락에 놓일 수 있습니다.
