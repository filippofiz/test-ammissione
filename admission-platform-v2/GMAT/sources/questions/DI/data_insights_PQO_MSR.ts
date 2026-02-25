import {
  DataInsightsQuestion,
  MSRQuestionData,
  generateMSRAnswers,
} from "../types";

// GMAT Practice Questions Online (PQO) - Data Insights: Multi-Source Reasoning
// Generated on 2026-02-23 by generate_pqo_typescript.py
// DO NOT EDIT MANUALLY — re-run generate_pqo_typescript.py to regenerate

export const dataInsightsPQO_MSR: DataInsightsQuestion[] = [
  {
    id: "DI-GMAT-PQO_-00010",
    question_number: 10,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "MSR",
      sources: [
    { tab_name: "Designs", content_type: "text", content: "A certain electric utility is considering exactly two designs (Designs $1$ and $\\$2$$) for a new power generation plant. Each design would result in a plant that would generate the same amount of power annually; but Design $$1$$ would use a single Type A power generator, whereas Design $2$ would use three Type B power generators.\n\nType A generators cost less than Type B generators to fuel per unit of power generated and vent through taller chimneys, which better prevent pollutants from concentrating near the plant. However, Type A generators produce solid waste that is difficult and expensive to dispose of safely.\n\nType B generators produce no solid waste and, as compared to Type A generators, vent approximately half as much Pollutant X, and even less Pollutant Y, per unit of power generated annually. However, Type B generators vent through much shorter chimneys." },
    { tab_name: "Pollutants by Phase", content_type: "text", content: "Both Type A and Type B generators emit (vent) significantly more of Pollutant Y during the startup phase-when a generator is brought to its normal power-generating phase from nonoperation. During startup, unhealthy levels of Pollutant Y can become concentrated at ground level near the power plant. The following table shows, for a single Type A or Type B generator, Pollutant Y emissions, in kilograms per hour (kg/hr), and the resultant contributions from those generators to the ground-level concentration of Pollutant Y, in micrograms per cubic meter of air (mcg/m³), near the plant during the startup and normal generating phases.\n\nTable:\nPower generator type | Operation phase | Pollutant Y Emissions (kg/hr) | Pollutant Y Increases ground-level concentration by (mcg/m³)\nA | startup | $744$ | $61$\nA | normal | $218$ | $13$\nB | startup | $203$ | $47$\nB | normal | $6$ | $3$" }
  ],
      questions: [
    {
      text: "Suppose that the utility chooses Design $1$ over Design 2. For each of the following motivations, select Yes if the information in the tabs suggest that it would help explain this choice. Otherwise, select No.",
      options: {

        },
      question_type: "multiple_choice",
      correct_answer: "a"
    }
  ],
      explanation: "",
    } as MSRQuestionData,
    answers: generateMSRAnswers(["a"]),
    categories: ["Multi-Source Reasoning"],
  },
];
