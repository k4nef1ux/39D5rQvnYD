"use client";

// components/GiftQuiz.tsx - three chip questions -> one lane. Pure client
// state, no data, no network: the "result" is a link into the tag hub that
// fits, so the quiz is a guided entrance to the taxonomy, not a funnel.
import { useState } from "react";
import Link from "next/link";

type Step = { key: string; question: string; options: { label: string; value: string }[] };

const STEPS: Step[] = [
  {
    key: "who",
    question: "who is it for?",
    options: [
      { label: "her", value: "her" },
      { label: "him", value: "him" },
      { label: "mom", value: "mom" },
      { label: "dad", value: "dad" },
      { label: "a coworker", value: "coworker" },
      { label: "honestly, no idea", value: "unknown" },
    ],
  },
  {
    key: "budget",
    question: "the budget?",
    options: [
      { label: "under $50", value: "under50" },
      { label: "whatever it takes", value: "open" },
    ],
  },
  {
    key: "vibe",
    question: "what should it say?",
    options: [
      { label: "get cozy", value: "cozy" },
      { label: "i know you", value: "personal" },
      { label: "use it daily", value: "useful" },
      { label: "have some fun", value: "fun" },
    ],
  },
];

type Result = { href: string; label: string; line: string };

function resolve(a: Record<string, string>): Result {
  // recipient lane wins; budget decides for the recipient-less cases;
  // vibe breaks the "no idea" tie. Every path ends on a real hub.
  if (a.who === "her") return { href: "/tags/for-her", label: "gifts for her", line: "considered, not guessed - the for-her shelf." };
  if (a.who === "him") return { href: "/tags/for-him", label: "gifts for him", line: "the upgrades he keeps not buying himself." };
  if (a.who === "mom") return { href: "/tags/for-mom", label: "gifts for mom", line: "repay a few of the favors." };
  if (a.who === "dad") return { href: "/tags/for-dad", label: "gifts for dad", line: "beyond the necktie default." };
  if (a.who === "coworker" || a.budget === "under50")
    return { href: "/tags/under-50", label: "gifts under $50", line: "looks expensive. isn't. safe for the office." };
  const byVibe: Record<string, Result> = {
    cozy: { href: "/tags/cozy", label: "cozy gifts", line: "comfort that still looks expensive." },
    personal: { href: "/tags/personalized", label: "personalized gifts", line: "made about them, not just for them." },
    useful: { href: "/tags/everyday", label: "everyday gifts", line: "used daily beats displayed forever." },
    fun: { href: "/tags/fun", label: "fun gifts", line: "joy, without the junk drawer." },
  };
  return byVibe[a.vibe] ?? { href: "/gear", label: "all the finds", line: "the whole case, newest first." };
}

export default function GiftQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);

  const done = step >= STEPS.length;
  const result = done ? resolve(answers) : null;

  return (
    <div className="quiz" aria-live="polite">
      {!done ? (
        <div className="quiz-step">
          <div className="quiz-count">
            {step + 1} / {STEPS.length}
          </div>
          <div className="quiz-question">{STEPS[step].question}</div>
          <div className="quiz-options">
            {STEPS[step].options.map((o) => (
              <button
                key={o.value}
                type="button"
                className="quiz-chip"
                onClick={() => {
                  setAnswers((a) => ({ ...a, [STEPS[step].key]: o.value }));
                  setStep((s) => s + 1);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="quiz-result">
          <div className="quiz-count">your lane</div>
          <div className="quiz-question">{result!.label}</div>
          <p className="quiz-line">{result!.line}</p>
          <div className="quiz-actions">
            <Link className="btn-gold" href={result!.href}>
              see the picks<span aria-hidden="true"> {"→"}</span>
            </Link>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setAnswers({});
                setStep(0);
              }}
            >
              retake
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
