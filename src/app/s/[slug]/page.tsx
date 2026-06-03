import { notFound } from "next/navigation";
import { asArray } from "@/lib/json";
import type { ResultBand, SurveyDimension, SurveyOption, SurveyQuestion } from "@/lib/satir";
import { getSurveyBySlug } from "@/lib/surveys";
import { SurveyForm } from "./SurveyForm";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SurveyPage({ params }: PageProps) {
  const { slug } = await params;
  const survey = await getSurveyBySlug(slug);

  if (!survey || !survey.isActive) {
    notFound();
  }

  return (
    <SurveyForm
      surveyId={survey.id}
      slug={survey.slug}
      title={survey.title}
      description={survey.description}
      instructions={asArray<string>(survey.instructions)}
      options={asArray<SurveyOption>(survey.options)}
      dimensions={asArray<SurveyDimension>(survey.dimensions)}
      questions={asArray<SurveyQuestion>(survey.questions)}
      resultBands={asArray<ResultBand>(survey.resultBands)}
      notes={asArray(survey.notes)}
    />
  );
}
