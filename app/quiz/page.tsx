// app/quiz/page.tsx - the 30-second gift quiz. Three questions, no backend:
// answers map to the lane/tag hub that fits, so the quiz is really a guided
// entrance to the taxonomy. Shareable by design (gift shoppers want the
// decision made for them) - this page is the pinterest/social front door.
import type { Metadata } from "next";
import GiftQuiz from "@/components/GiftQuiz";

export const metadata: Metadata = {
  title: "the 30-second gift quiz",
  description:
    "three questions, one lane: tell us who it's for, the budget, and the vibe - the quiz routes you straight to the vetted picks that fit. no email required.",
  alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
  return (
    <div className="page quiz-page">
      <div className="page-tag">findshq &nbsp;//&nbsp; the quiz</div>
      <h1 className="page-title">the 30-second gift quiz</h1>
      <p className="lede page-lede">
        three questions. we do the digging, you take the credit.
      </p>
      <GiftQuiz />
    </div>
  );
}
