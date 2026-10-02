export type Level =
  | "S0"
  | "S1"
  | "S2"
  | "S3"
  | "S4"
  | "S5"
  | "S6"
  | "S7"
  | "S8"
  | "S9";

export type ThoughtNode = {
  summary: string;
  thinkingType: string;
  status:
    | "observation"
    | "interpretation"
    | "evidence"
    | "hypothesis"
    | "context"
    | "judgment"
    | "open_question";
};

export type EngineResult = {
  level: Level;
  question: string;
  node: ThoughtNode;
};

const emotionWords = ["슬프", "답답", "짜증", "재밌", "이상", "무섭", "불쌍", "화났", "어렵"];
const evidenceWords = ["때문", "장면", "표현", "말", "행동", "반복", "보여", "나와", "드러"];
const contextWords = ["시대", "사회", "문화", "당시", "검열", "제도", "계급", "가난", "역사", "정치"];
const absoluteWords = ["무조건", "분명히", "당연히", "확실히"];
const presentistWords = ["옛날 사람", "미개", "그냥 이혼", "왜 저래", "별것도 아닌"];

function compact(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function classifyAnswer(raw: string): Level {
  const text = compact(raw);

  if (!text || /^(몰라|모르겠|기억 안|잘 모르)/.test(text)) return "S0";
  if (presentistWords.some((word) => text.includes(word))) return "S6";
  if (absoluteWords.some((word) => text.includes(word))) return "S8";

  const hasContext = contextWords.some((word) => text.includes(word));
  const hasEvidence = evidenceWords.some((word) => text.includes(word));
  const hasContrast = /(하지만|반면|동시에|한편|그렇지만|오히려|다른)/.test(text);

  if (text.length > 110 && hasContext && hasContrast) return "S5";
  if (text.length > 80 && hasEvidence && hasContrast) return "S5";
  if (hasEvidence && text.length > 45) return "S4";
  if (/(것 같|라고 봐|라고 생각|의미|상징|의도|느낌)/.test(text) && text.length > 28) return "S3";
  if (emotionWords.some((word) => text.includes(word)) && text.length < 55) return "S1";
  if (text.length < 40) return "S2";
  return "S3";
}

function summaryOf(text: string) {
  const cleaned = compact(text);
  if (cleaned.length <= 74) return cleaned;
  return `${cleaned.slice(0, 72)}…`;
}

export function nextQuestion(raw: string): EngineResult {
  const text = compact(raw);
  const level = classifyAnswer(text);

  switch (level) {
    case "S0":
      return {
        level,
        question: "그럼 아주 쉽게 시작해볼까? 이 작품은 슬펐어, 답답했어, 이상했어, 재밌었어, 아니면 어려웠어?",
        node: { summary: "아직 작품에 대한 첫 반응을 찾는 중", thinkingType: "반응 찾기", status: "observation" },
      };
    case "S1":
      return {
        level,
        question: "그 느낌이 가장 강했던 인물이나 장면은 뭐였어?",
        node: { summary: summaryOf(text), thinkingType: "장면 주목", status: "observation" },
      };
    case "S2":
      return {
        level,
        question: "그 부분에서 정확히 뭐가 마음에 걸렸어?",
        node: { summary: summaryOf(text), thinkingType: "이유 탐색", status: "observation" },
      };
    case "S3":
      return {
        level,
        question: "그렇게 생각하게 만든 장면이나 표현을 하나 떠올려볼 수 있을까?",
        node: { summary: summaryOf(text), thinkingType: "근거 찾기", status: "interpretation" },
      };
    case "S4":
      return {
        level,
        question: "같은 장면을 지금과는 다르게 읽을 가능성도 있을까?",
        node: { summary: summaryOf(text), thinkingType: "다른 관점", status: "evidence" },
      };
    case "S5":
      return {
        level,
        question: "지금 해석에 아직 넣어보지 않은 축이 있다면, 표현 방식·시대적 맥락·다른 인물의 관점 중 어디를 더 보고 싶어?",
        node: { summary: summaryOf(text), thinkingType: "탐구 확장", status: "hypothesis" },
      };
    case "S6":
      return {
        level,
        question: "그 판단을 잠깐 보류하고 본다면, 그 시대 사람에게는 지금과 다른 가치나 선택지가 있었을까?",
        node: { summary: summaryOf(text), thinkingType: "맥락 전환", status: "judgment" },
      };
    case "S7":
      return {
        level,
        question: "그 생각을 이 작품에서 가장 잘 보여주는 장면은 어디였어?",
        node: { summary: summaryOf(text), thinkingType: "작품으로 돌아오기", status: "interpretation" },
      };
    case "S8":
      return {
        level,
        question: "그렇게 단정할 수 있게 하는 근거와, 그 판단을 흔들 수 있는 근거를 하나씩 찾아볼 수 있을까?",
        node: { summary: summaryOf(text), thinkingType: "반례 검토", status: "judgment" },
      };
    default:
      return {
        level: "S9",
        question: "처음 생각과 지금 생각이 어떻게 달라졌는지 한 문장으로 정리해볼까?",
        node: { summary: summaryOf(text), thinkingType: "자기 성찰", status: "open_question" },
      };
  }
}

export function firstQuestion() {
  return "이 작품을 떠올렸을 때, 제일 먼저 남는 건 뭐야? 인물·장면·느낌 중 아무거나 괜찮아.";
}
