"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ResultBand, SurveyDimension, SurveyOption, SurveyQuestion } from "@/lib/satir";

type SurveyFormProps = {
  surveyId: string;
  slug: string;
  title: string;
  description: string;
  instructions: string[];
  options: SurveyOption[];
  dimensions: SurveyDimension[];
  questions: SurveyQuestion[];
  resultBands: ResultBand[];
  notes: string[];
};

export function SurveyForm({
  surveyId,
  slug,
  title,
  description,
  instructions,
  options,
  dimensions,
  questions,
  resultBands,
  notes,
}: SurveyFormProps) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [respondent, setRespondent] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentPart, setCurrentPart] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);
  const hasRespondent = respondent.trim().length > 0;
  const isComplete = hasRespondent && answeredCount === questions.length;

  const groupedQuestions = useMemo(
    () =>
      dimensions.map((dimension) => ({
        ...dimension,
        questions: questions.filter((question) => question.dimension === dimension.name),
      })),
    [dimensions, questions],
  );
  const currentGroup = groupedQuestions[currentPart];
  const currentPartAnsweredCount =
    currentGroup?.questions.filter((question) => answers[String(question.number)] !== undefined).length ?? 0;
  const isCurrentPartComplete =
    Boolean(currentGroup) && currentPartAnsweredCount === currentGroup.questions.length;
  const isLastPart = currentPart === groupedQuestions.length - 1;
  const isCurrentStepComplete = isCurrentPartComplete && (currentPart !== 0 || hasRespondent);
  const shouldShowNamePanel = currentPart === 0 || (isLastPart && !hasRespondent);

  function goToNextPart() {
    if (!isCurrentPartComplete) {
      setError("请完成本部分所有题目后继续。");
      return;
    }

    if (currentPart === 0 && !hasRespondent) {
      setError("请填写姓名后继续。");
      return;
    }

    setError("");
    setCurrentPart((part) => Math.min(part + 1, groupedQuestions.length - 1));
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
  }

  function goToPreviousPart() {
    setError("");
    setCurrentPart((part) => Math.max(part - 1, 0));
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
  }

  async function submitSurvey() {
    if (!isCurrentPartComplete) {
      setError("请完成本部分所有题目后提交。");
      return;
    }

    if (!hasRespondent) {
      setError("请填写姓名后提交。");
      return;
    }

    if (!isComplete || submitting) return;

    setSubmitting(true);
    setError("");
    const durationSeconds = startedAt ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : null;

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        surveyId,
        slug,
        respondent: respondent.trim(),
        answers,
        questions,
        dimensions,
        resultBands,
        notes,
        durationSeconds,
      }),
    });

    const payload = (await response.json()) as { id?: string; error?: string };

    if (!response.ok || !payload.id) {
      setError(payload.error ?? "提交失败，请稍后再试。");
      setSubmitting(false);
      return;
    }

    router.push(`/r/${payload.id}`);
  }

  if (!started) {
    return (
      <main className="mobile-shell intro-screen">
        <div className="hero-pattern" />
        <section className="intro-content">
          <p className="eyebrow">自我测评</p>
          <h1>{title}</h1>
          <p className="lead">{description}</p>

          <div className="instruction-panel">
            <h2>测评注意事项</h2>
            <ol>
              {instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ol>
          </div>

          <div className="scale-panel">
            <h2>评分标准</h2>
            <div className="scale-grid">
              {options.map((option) => (
                <div key={option.score}>
                  <strong>{option.score}</strong>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="bottom-action">
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setStartedAt(Date.now());
              setStarted(true);
            }}
          >
            开始填写
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="survey-shell">
      <header className="sticky-header">
        <div>
          <p>{title}</p>
          <strong>
            第 {currentPart + 1}/{groupedQuestions.length} 部分
          </strong>
        </div>
        <div className="progress-track" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="part-progress">
          已完成 {answeredCount}/{questions.length} 题
        </div>
      </header>

      {shouldShowNamePanel && (
        <section className="name-panel">
          <label htmlFor="respondent">
            <span className="required-mark">*</span>
            姓名
          </label>
          <input
            id="respondent"
            type="text"
            value={respondent}
            placeholder="请输入姓名"
            onChange={(event) => setRespondent(event.target.value)}
          />
          {!hasRespondent && <p>请填写姓名后继续测评。</p>}
        </section>
      )}

      {currentGroup && (
        <section className="question-group" key={currentGroup.name}>
          {currentGroup.questions.map((question) => (
            <article className="question-card" key={question.number}>
              <h2>
                <span>* {String(question.number).padStart(2, "0")}</span>
                {question.text}
              </h2>
              <div className="options-list">
                {options.map((option) => (
                  <label
                    className={answers[String(question.number)] === option.score ? "option-row selected" : "option-row"}
                    key={`${question.number}-${option.score}`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.number}`}
                      value={option.score}
                      checked={answers[String(question.number)] === option.score}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [String(question.number)]: option.score,
                        }))
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="submit-bar">
        {error && <p className="form-error">{error}</p>}
        <div className="step-actions">
          <button className="secondary-button" type="button" disabled={currentPart === 0 || submitting} onClick={goToPreviousPart}>
            上一部分
          </button>
          {isLastPart ? (
            <button className="primary-button" type="button" disabled={!isComplete || submitting} onClick={submitSurvey}>
              {submitting ? "提交中..." : "提交测评"}
            </button>
          ) : (
            <button className="primary-button" type="button" disabled={!isCurrentStepComplete || submitting} onClick={goToNextPart}>
              下一部分
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
