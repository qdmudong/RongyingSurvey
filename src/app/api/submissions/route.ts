import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateResult, ResultBand, SurveyDimension, SurveyQuestion } from "@/lib/satir";

type SubmitPayload = {
  surveyId?: string;
  respondent?: string;
  answers?: Record<string, number>;
  questions?: SurveyQuestion[];
  dimensions?: SurveyDimension[];
  resultBands?: ResultBand[];
  notes?: string[];
};

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as SubmitPayload;
  const respondent = payload.respondent?.trim();

  if (!payload.surveyId || !respondent) {
    return NextResponse.json({ error: "请填写姓名后再提交。" }, { status: 400 });
  }

  if (!payload.questions?.length || !payload.dimensions?.length || !payload.resultBands?.length) {
    return NextResponse.json({ error: "测评配置不完整。" }, { status: 400 });
  }

  const answers = payload.answers ?? {};
  const missingAnswer = payload.questions.find((question) => {
    const answer = answers[String(question.number)];
    return !Number.isInteger(answer) || answer < 1 || answer > 5;
  });

  if (missingAnswer) {
    return NextResponse.json({ error: `第 ${missingAnswer.number} 题还未完成。` }, { status: 400 });
  }

  const result = calculateResult(
    payload.questions,
    payload.dimensions,
    answers,
    payload.resultBands,
    payload.notes ?? [],
  );

  const submission = await prisma.submission.create({
    data: {
      surveyId: payload.surveyId,
      respondent,
      answers,
      result,
    },
  });

  return NextResponse.json({ id: submission.id });
}
