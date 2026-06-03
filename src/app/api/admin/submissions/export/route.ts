import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { asArray, asRecord } from "@/lib/json";
import { prisma } from "@/lib/prisma";
import type { DimensionScore, SurveyResult } from "@/lib/satir";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const surveyId = request.nextUrl.searchParams.get("surveyId") ?? undefined;
  const submissions = await prisma.submission.findMany({
    where: surveyId ? { surveyId } : undefined,
    include: { survey: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = submissions.map((submission) => {
    const result = submission.result as unknown as SurveyResult;
    const scores = asArray<DimensionScore>(result.scores);
    const answers = asRecord<number>(submission.answers);

    return [
      submission.createdAt.toISOString(),
      submission.survey.title,
      submission.respondent,
      result.dominant,
      ...scores.map((score) => score.average.toFixed(2)),
      ...Object.keys(answers)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => String(answers[key])),
    ];
  });

  const dimensionHeaders = ["讨好型", "指责型", "超理智型", "打岔型", "一致型"].map((name) => `${name}平均分`);
  const questionHeaders = Array.from({ length: 40 }, (_, index) => `Q${index + 1}`);
  const csv = [
    ["提交时间", "测评", "姓名", "主导姿态", ...dimensionHeaders, ...questionHeaders],
    ...rows,
  ]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="submissions.csv"',
    },
  });
}

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}
