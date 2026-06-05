export type SurveyOption = {
  label: string;
  score: number;
};

export type SurveyQuestion = {
  number: number;
  text: string;
  dimension: string;
};

export type ResultBand = {
  min: number;
  max: number;
  label: string;
};

export type SurveyDimension = {
  name: string;
  description: string;
};

export type SurveyConfig = {
  title: string;
  slug: string;
  description: string;
  instructions: string[];
  notes: string[];
  evaluationNotes: string[];
  dominantLabel: string;
  options: SurveyOption[];
  dimensions: SurveyDimension[];
  questions: SurveyQuestion[];
  resultBands: ResultBand[];
};

export type DimensionScore = {
  name: string;
  total: number;
  average: number;
  band: string;
  description: string;
};

export type SurveyResult = {
  dominant: string;
  dominantLabel?: string;
  overallAverage?: number;
  scores: DimensionScore[];
  notes: string[];
  evaluationNotes?: string[];
};

const dimensionNames = ["讨好型", "指责型", "超理智型", "打岔型", "一致型"];

export const finalFeedbackNote = "本问卷为自评工具，若想获得更客观的结果，建议结合360度反馈（让周围的人为你评分）。";

export const resultEvaluationNotes = [
  "你的主导应对姿态：得分最高的那一种",
  "得分≥4分：非常典型的该种姿态",
  "3分≤得分 < 4分：比较明显的该种姿态",
  "2分≤得分 < 3分：偶尔会使用该种姿态",
  "得分 < 2分：很少使用该种姿态",
];

const questionTexts = [
  [
    "当别人对我不满意时，我会立刻感到不安并想办法弥补",
    "我很难拒绝别人的请求，即使这个请求让我很为难",
    "我总是在想“别人会怎么看我”，担心自己做得不够好",
    "冲突发生时，我倾向于先让步来维持表面的和谐",
    "我很少表达自己的负面情绪，怕给别人带来麻烦",
    "别人夸奖我时，我会觉得不好意思，甚至会贬低自己",
    "我习惯主动承担不属于我的责任，来获得他人的认可",
    "当我和别人意见不同时，我通常会选择沉默而不是表达自己",
  ],
  [
    "当事情出错时，我倾向于先指出是谁的责任",
    "我很容易发现别人的缺点和不足，并忍不住指出来",
    "当别人不同意我的观点时，我会变得很生气",
    "我觉得如果别人都按照我说的做，事情就不会出错",
    "当我感到压力大时，我会对身边的人发脾气",
    "我认为软弱是不可接受的，人必须坚强",
    "我喜欢掌控局面，不喜欢事情超出我的预期",
    "当别人表现不好时，我会觉得他们不够努力或不负责任",
  ],
  [
    "我习惯用数据、事实和逻辑来分析问题，而不是谈论感受",
    "当别人向我倾诉情绪时，我会立刻给出解决方案",
    "我觉得情绪化是不成熟的表现，人应该时刻保持冷静",
    "我很难表达自己的感受，也不太会安慰别人",
    "我更关注事情的对错和合理性，而不是人际关系",
    "当别人谈论感受时，我会觉得很尴尬，想转移话题",
    "我认为只要有足够的信息和分析，任何问题都能解决",
    "我很少会因为感性的原因做出决定",
  ],
  [
    "我很难长时间专注于一个话题，容易走神",
    "当讨论严肃或不愉快的话题时，我会用开玩笑的方式转移注意力",
    "我不喜欢面对冲突，总是想办法逃避",
    "我习惯用忙碌来逃避思考让我感到痛苦的事情",
    "当别人问我问题时，我经常答非所问",
    "我很难深入地谈论自己的感受和想法",
    "我喜欢新鲜有趣的事情，讨厌一成不变的生活",
    "当我感到压力大时，我会做一些无关紧要的事情来分散注意力",
  ],
  [
    "我能够清晰地表达自己的感受、想法和需求",
    "我会认真倾听别人的观点，即使我不同意",
    "当我犯错误时，我会坦然承认并承担责任",
    "我不会因为别人的批评而否定自己，也不会因为别人的夸奖而骄傲自满",
    "我能够坦然地表达自己的负面情绪，也能够接住别人的负面情绪",
    "当发生冲突时，我会寻求双赢的解决方案，而不是讲道理争对错",
    "我对自己有清晰的认知，知道自己的优点和不足",
    "我言行一致，说的和做的是一样的",
  ],
];

export const satirSurvey: SurveyConfig = {
  title: "萨提亚应对姿态自我测评",
  slug: "satir-coping",
  description: "问卷共40题，约需10分钟。适用场景：团队沟通、亲密关系亲子关系、个人成长等。答题时可以选择工作或生活中的特定领域。",
  instructions: [
    "请基于过去6个月的实际行为作答，不要根据“我应该怎么做”来回答。",
    "不要在某一道题上纠结太久，第一反应往往最准确。",
    "本问卷为自评工具，若想获得更客观的结果，建议结合360度反馈。",
  ],
  notes: [
    "没有“好”或“坏”的应对姿态，所有姿态都是我们在成长过程中学会的生存策略。",
    "大多数人会同时使用多种应对姿态，只是在不同情境下会有不同的主导姿态。",
    "我们的目标不是消除某种姿态，而是增加选择的灵活性，在合适的情境下使用合适的姿态。",
    finalFeedbackNote,
  ],
  evaluationNotes: resultEvaluationNotes,
  dominantLabel: "主导应对姿态",
  options: [
    { label: "几乎从不", score: 1 },
    { label: "偶尔", score: 2 },
    { label: "有时", score: 3 },
    { label: "经常", score: 4 },
    { label: "几乎总是", score: 5 },
  ],
  dimensions: dimensionNames.map((name) => ({
    name,
    description: `${name}应对姿态`,
  })),
  questions: questionTexts.flatMap((group, groupIndex) =>
    group.map((text, questionIndex) => ({
      number: groupIndex * 8 + questionIndex + 1,
      text,
      dimension: dimensionNames[groupIndex],
    })),
  ),
  resultBands: [
    { min: 4, max: 5, label: "非常典型的该种姿态" },
    { min: 3, max: 3.99, label: "比较明显的该种姿态" },
    { min: 2, max: 2.99, label: "偶尔会使用该种姿态" },
    { min: 0, max: 1.99, label: "很少使用该种姿态" },
  ],
};

export function calculateResult(
  questions: SurveyQuestion[],
  dimensions: SurveyDimension[],
  answers: Record<string, number>,
  resultBands: ResultBand[],
  notes: string[],
  dominantLabel = "主导应对姿态",
  evaluationNotes: string[] = resultEvaluationNotes,
): SurveyResult {
  const overallTotal = questions.reduce((sum, question) => sum + (answers[String(question.number)] ?? 0), 0);
  const overallAverage = questions.length > 0 ? Number((overallTotal / questions.length).toFixed(2)) : 0;
  const scores = dimensions.map((dimension) => {
    const dimensionQuestions = questions.filter((question) => question.dimension === dimension.name);
    const total = dimensionQuestions.reduce((sum, question) => sum + (answers[String(question.number)] ?? 0), 0);
    const average = total / dimensionQuestions.length;
    const band = resultBands.find((item) => average >= item.min && average <= item.max)?.label ?? "";

    return {
      name: dimension.name,
      total,
      average: Number(average.toFixed(2)),
      band,
      description: dimension.description,
    };
  });

  const dominant = [...scores].sort((a, b) => b.average - a.average)[0]?.name ?? "";

  return {
    dominant,
    dominantLabel,
    overallAverage,
    scores,
    notes,
    evaluationNotes,
  };
}

export function normalizeImportantNotes(notes: string[]) {
  const normalizedNotes = notes.map((note) => note.trim()).filter(Boolean);
  if (normalizedNotes.length >= 4) return normalizedNotes;

  const hasFinalNote = normalizedNotes.some((note) => note.includes("360度反馈") || note.includes("360 度反馈"));

  return hasFinalNote ? normalizedNotes : [...normalizedNotes, finalFeedbackNote];
}
