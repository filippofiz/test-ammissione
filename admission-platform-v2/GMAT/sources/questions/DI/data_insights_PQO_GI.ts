import {
  DataInsightsQuestion,
  GIQuestionData,
  generateGIAnswers,
} from "../types";

// GMAT Practice Questions Online (PQO) - Data Insights: Graphics Interpretation
// Generated on 2026-02-23 by generate_pqo_typescript.py
// DO NOT EDIT MANUALLY — re-run generate_pqo_typescript.py to regenerate
// NOTE: image_url is initially null; run upload-di-images.mjs to populate.

export const dataInsightsPQO_GI: DataInsightsQuestion[] = [
  {
    id: "DI-GMAT-PQO_-00008",
    question_number: 8,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "GI",
      // image_url populated after upload-di-images step
      image_url: null,
      context_text: "Randomly selected members form each of four key stakeholder groups in the biofuels industry in Nation X were surveyed to determine which of several concerns had the greatest relative importance for each group. The diagram shows the concerns that were rated as highly important for each group.",
      statement_text: "Of the concerns that were rated as highly important by at least one of the four groups, exactly [BLANK1] were so designated by more than one group. Each of these concerns was rated as highly important by the [BLANK2].",
      blank1_options: ["1", "2", "3"],
      blank1_correct: "2",
      blank2_options: ["Biofuel producer group", "Fuel distributor group", "Vehicle converter group", "end user group"],
      blank2_correct: "end user group",
      explanation: "RO1: Recognize - Of the concerns in the diagram, $2$ were rated as highly important by more than one stakeholder group: Availability of biofuels was rated as highly important by the Fuel distributor group and the End user group and \"green\" image was rated as highly important by the Vehicle converter group and the End user group. All other concerns were mentioned by only a single stakeholder group. The correct answer is 2. RO2: Recognize - As explained in the analysis of RO1, both availability of biofuels and \"green\" image were rated as highly important by the End user group. The correct answer is end user group.",
    } as unknown as GIQuestionData,
    answers: generateGIAnswers("2", "end user group"),
    categories: ["Graphics Interpretation"],
  },
];
