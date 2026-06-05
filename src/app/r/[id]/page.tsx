import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatDuration } from "@/lib/duration";
import { asArray, asRecord } from "@/lib/json";
import { prisma } from "@/lib/prisma";
import {
  normalizeImportantNotes,
  resultEvaluationNotes,
  type DimensionScore,
  type SurveyResult,
} from "@/lib/satir";
import { ResultChart } from "./ResultChart";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { survey: true },
  });

  return {
    title: submission ? `${submission.survey.title} - 测评结果` : "测评结果",
    description: "移动端测评结果",
  };
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { survey: true },
  });

  if (!submission) {
    notFound();
  }

  const result = submission.result as unknown as SurveyResult;
  const scores = asArray<DimensionScore>(result.scores);
  const notes = normalizeImportantNotes(asArray<string>(result.notes));
  const isEqSurvey = submission.survey.slug === "eq-four-dimensions";
  const dominantLabel = isEqSurvey ? "情商综合评分" : (result.dominantLabel ?? "主导应对姿态");
  const answers = asRecord<number>(submission.answers);
  const answerValues = Object.values(answers).filter((value) => typeof value === "number" && Number.isFinite(value));
  const fallbackOverallAverage =
    answerValues.length > 0 ? Number((answerValues.reduce((sum, value) => sum + value, 0) / answerValues.length).toFixed(2)) : 0;
  const overallAverage = result.overallAverage ?? fallbackOverallAverage;
  const dominantValue = isEqSurvey ? overallAverage.toFixed(2) : result.dominant;
  const evaluationNotes = result.evaluationNotes?.length ? result.evaluationNotes : resultEvaluationNotes;

  return (
    <main className="result-shell">
      <section className="result-header">
        <p>{submission.survey.title}</p>
        <h1>{submission.respondent} 的测评结果</h1>
        <div className="result-meta">
          <span>完成时间：{submission.createdAt.toLocaleString("zh-CN")}</span>
          <span>测评用时：{formatDuration(submission.durationSeconds)}</span>
        </div>
        <a className="report-download" href={`/api/reports/${submission.id}`}>
          下载测评报告
        </a>
        <div className={`dominant-box${isEqSurvey ? " dominant-box-centered" : ""}`}>
          <span>{dominantLabel}</span>
          <strong>{dominantValue}</strong>
        </div>
      </section>

      <section className="result-section">
        <h2>得分</h2>
        <div className="score-table">
          <div className="score-row score-head">
            <span>维度</span>
            <span>得分</span>
            <span>结果评定</span>
          </div>
          {scores.map((score) => (
            <div className="score-row" key={score.name}>
              <span>{score.name}</span>
              <strong>{score.average.toFixed(2)}</strong>
              <span>{score.band}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="result-section">
        <h2>柱状图示例</h2>
        <ResultChart scores={scores} />
      </section>

      <section className="result-section evaluation-section">
        <h2>结果评定</h2>
        <ul>
          {evaluationNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="result-section note-section">
        <h2>重要说明</h2>
        <ol>
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
