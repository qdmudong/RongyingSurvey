import { prisma } from "@/lib/prisma";
import { satirSurvey, SurveyConfig } from "@/lib/satir";

export async function ensureBuiltinSurveys() {
  await upsertSurvey(satirSurvey);
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
      isActive: true,
    },
  });
}
