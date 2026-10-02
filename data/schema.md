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
