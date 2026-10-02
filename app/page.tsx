"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { firstQuestion, nextQuestion, ThoughtNode } from "@/lib/questionEngine";
import { findWork, works } from "@/lib/workCatalog";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type Session = {
  work: string;
  author: string;
  level: "middle" | "high";
  workId?: string;
  genre?: string;
  inquiryAxes?: string[];
};

const quickStarts = ["재밌었어", "답답했어", "슬펐어", "이상했어", "어려웠어", "잘 모르겠어"];

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [work, setWork] = useState("");
  const [author, setAuthor] = useState("");
  const [schoolLevel, setSchoolLevel] = useState<"middle" | "high">("middle");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [nodes, setNodes] = useState<ThoughtNode[]>([]);
  const [showFlow, setShowFlow] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("deep-reading-session");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.session && parsed.messages) {
        setSession(parsed.session);
        setMessages(parsed.messages);
        setNodes(parsed.nodes ?? []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!session) return;
    localStorage.setItem(
      "deep-reading-session",
      JSON.stringify({ session, messages, nodes })
    );
  }, [session, messages, nodes]);

  const matchedWork = useMemo(
    () => (work.trim() ? findWork(work, author) : null),
    [work, author]
  );

  const suggestions = useMemo(() => {
    const query = work.trim().toLowerCase();
    if (!query) return works.slice(0, 6);
    return works
      .filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.author ?? "").toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [work]);

  const progressLabel = useMemo(() => {
    if (nodes.length === 0) return "탐구 시작";
    if (nodes.length < 3) return "생각 꺼내기";
    if (nodes.length < 6) return "근거와 관점 넓히기";
    return "생각 정교화";
  }, [nodes.length]);

  function chooseWork(title: string, workAuthor?: string) {
    setWork(title);
    if (workAuthor) setAuthor(workAuthor);
  }

  function startSession(e: FormEvent) {
    e.preventDefault();
    if (!work.trim()) return;

    const known = findWork(work, author);
    const next: Session = {
      work: work.trim(),
      author: author.trim() || known?.author || "",
      level: schoolLevel,
      workId: known?.id,
      genre: known?.genre,
      inquiryAxes: known?.map?.inquiryAxes,
    };

    setSession(next);
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: firstQuestion({
          title: next.work,
          genre: next.genre,
          inquiryAxes: next.inquiryAxes,
        }),
      },
    ]);
    setNodes([]);
  }

  function submitAnswer(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text || !session) return;

    const result = nextQuestion(text, {
      title: session.work,
      genre: session.genre,
      inquiryAxes: session.inquiryAxes,
    });

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text },
      { id: crypto.randomUUID(), role: "assistant", text: result.question },
    ]);
    setNodes((prev) => [...prev, result.node]);
    setInput("");
  }

  function reset() {
    localStorage.removeItem("deep-reading-session");
    setSession(null);
    setMessages([]);
    setNodes([]);
    setWork("");
    setAuthor("");
    setInput("");
  }

  if (!session) {
    return (
      <main className="landing-shell">
        <section className="landing">
          <div className="eyebrow">DEEP READING · PROTOTYPE</div>
          <h1>읽기는 끝났지만<br />생각은 끝나지 않았습니다.</h1>
          <p className="lead">
            작품의 정답을 설명하지 않습니다. 질문을 따라가며
            내가 무엇을 보고, 왜 그렇게 생각했는지 천천히 톺아봅니다.
          </p>

          <form className="start-card" onSubmit={startSession}>
            <label>
              <span>어떤 작품을 톺아볼까요?</span>
              <input
                value={work}
                onChange={(e) => setWork(e.target.value)}
                placeholder="작품명을 입력해보세요"
                autoFocus
              />
            </label>

            {suggestions.length > 0 && (
              <div className="work-suggestions">
                {suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => chooseWork(item.title, item.author)}
                    className={matchedWork?.id === item.id ? "selected" : ""}
                  >
                    <strong>{item.title}</strong>
                    <span>{item.author ?? "작가 미상"} · {item.genre ?? "갈래 미분류"}</span>
                  </button>
                ))}
              </div>
            )}

            {matchedWork && (
              <div className="known-work">
                <div>
                  <span className="known-label">교과서 작품 데이터에서 찾았어요</span>
                  <strong>{matchedWork.title} · {matchedWork.author}</strong>
                </div>
                {matchedWork.map?.inquiryAxes?.length ? (
                  <div className="axis-preview">
                    {matchedWork.map.inquiryAxes.slice(0, 4).map((axis) => (
                      <span key={axis}>{axis}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            <label>
              <span>작가 <small>선택</small></span>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="작가를 알고 있다면 적어주세요"
              />
            </label>

            <div className="level-row">
              <span>질문 수준</span>
              <div className="segmented">
                <button type="button" className={schoolLevel === "middle" ? "active" : ""} onClick={() => setSchoolLevel("middle")}>
                  중학생
                </button>
                <button type="button" className={schoolLevel === "high" ? "active" : ""} onClick={() => setSchoolLevel("high")}>
                  고등학생
                </button>
              </div>
            </div>

            <button className="primary" type="submit">생각 시작하기</button>
          </form>

          <p className="prototype-note">
            작품 전문은 저장하지 않습니다. 현재는 교과서 수록 정보와 열린 탐구 축만 활용합니다.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">deep-reading</div>
          <div className="work-title">
            {session.author ? `${session.author} · ` : ""}{session.work}
          </div>
          {session.workId && <div className="known-session">교과서 작품 데이터 연결됨</div>}
        </div>
        <div className="top-actions">
          <span className="progress">{progressLabel}</span>
          <button className="ghost" onClick={() => setShowFlow((v) => !v)}>
            {showFlow ? "사고 흐름 숨기기" : "사고 흐름 보기"}
          </button>
          <button className="ghost danger" onClick={reset}>새 작품</button>
        </div>
      </header>

      <div className={`workspace ${showFlow ? "" : "flow-hidden"}`}>
        <section className="conversation">
          <div className="conversation-inner">
            <div className="guide">
              한 번에 하나만 생각해봅니다. 정답을 찾기보다, 지금 생각에서 다음 한 걸음으로 가보세요.
            </div>

            {messages.map((message, index) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="message-label">
                  {message.role === "assistant" ? "질문" : "내 생각"}
                </div>
                <div className="bubble">{message.text}</div>

                {index === 0 && message.role === "assistant" && (
                  <div className="quick-starts">
                    {quickStarts.map((item) => (
                      <button key={item} onClick={() => submitAnswer(item)}>{item}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="composer">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="짧게 적어도 괜찮아요. ‘몰라’도 시작이 됩니다."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitAnswer();
                  }
                }}
              />
              <div className="composer-footer">
                <span>Enter로 보내기 · Shift+Enter 줄바꿈</span>
                <button className="primary small" onClick={() => submitAnswer()}>보내기</button>
              </div>
            </div>
          </div>
        </section>

        {showFlow && (
          <aside className="flow-panel">
            <div className="flow-heading">
              <div>
                <span className="eyebrow">MY READING TRACE</span>
                <h2>내 사고 흐름</h2>
              </div>
              <span className="node-count">{nodes.length}</span>
            </div>

            {session.inquiryAxes?.length ? (
              <div className="session-axes">
                <span>이 작품에서 열어둘 탐구 축</span>
                <div>
                  {session.inquiryAxes.slice(0, 4).map((axis) => (
                    <b key={axis}>{axis}</b>
                  ))}
                </div>
                <p>정답이 아니라, 막혔을 때 꺼내볼 수 있는 방향입니다.</p>
              </div>
            ) : null}

            {nodes.length === 0 ? (
              <div className="empty-flow">
                답을 시작하면 여기에는 정답 대신
                <strong> 네 생각이 움직인 흔적</strong>이 쌓입니다.
              </div>
            ) : (
              <div className="flow-list">
                {nodes.map((node, index) => (
                  <article className="thought-node" key={index}>
                    <div className="node-index">{String(index + 1).padStart(2, "0")}</div>
                    <div>
                      <span className="tag">{node.thinkingType}</span>
                      <p>{node.summary}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {nodes.length >= 4 && (
              <div className="reflection-card">
                <span>지금까지</span>
                <strong>
                  {nodes.map((n) => n.thinkingType).filter((v, i, a) => a.indexOf(v) === i).join(" → ")}
                </strong>
                <p>같은 작품도 질문을 바꾸면 다른 층위가 보일 수 있습니다.</p>
              </div>
            )}
          </aside>
        )}
      </div>
    </main>
  );
}
