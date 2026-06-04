import { notFound } from "next/navigation";
import { asArray } from "@/lib/json";
import { prisma } from "@/lib/prisma";
import { normalizeImportantNotes, type DimensionScore, type SurveyResult } from "@/lib/satir";
import { ResultChart } from "./ResultChart";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

  return (
    <main className="result-shell">
      <section className="result-header">
        <p>{submission.survey.title}</p>
        <h1>{submission.respondent} 的测评结果</h1>
        <a className="report-download" href={`/api/reports/${submission.id}`}>
          下载测评报告
        </a>
        <div className="dominant-box">
          <span>主导应对姿态</span>
          <strong>{result.dominant}</strong>
        </div>
      </section>

      <section className="result-section">
        <h2>得分</h2>
        <div className="score-table">
          <div className="score-row score-head">
            <span>维度</span>
            <span>平均分</span>
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
