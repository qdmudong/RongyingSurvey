import { prisma } from "@/lib/prisma";
import { eqSurvey } from "@/lib/eq";
import { satirSurvey, SurveyConfig } from "@/lib/satir";

export async function ensureBuiltinSurveys() {
  await Promise.all([upsertSurvey(satirSurvey), upsertSurvey(eqSurvey)]);
}

export async function getSurveyBySlug(slug: string) {
  await ensureBuiltinSurveys();

  return prisma.survey.findUnique({
    where: { slug },
  });
}

async function upsertSurvey(survey: SurveyConfig) {
  await prisma.survey.upsert({
    where: { slug: survey.slug },
    update: {
      title: survey.title,
      description: survey.description,
      instructions: survey.instructions,
      options: survey.options,
      dimensions: survey.dimensions,
      questions: survey.questions,
      resultBands: survey.resultBands,
      notes: survey.notes,
      evaluationNotes: survey.evaluationNotes,
      dominantLabel: survey.dominantLabel,
      isActive: true,
    },
    create: {
      slug: survey.slug,
      title: survey.title,
      description: survey.description,
      instructions: survey.instructions,
      options: survey.options,
      dimensions: survey.dimensions,
      questions: survey.questions,
      resultBands: survey.resultBands,
      notes: survey.notes,
      evaluationNotes: survey.evaluationNotes,
      dominantLabel: survey.dominantLabel,
      isActive: true,
    },
  });
}
