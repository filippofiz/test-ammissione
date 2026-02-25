import {
  DataInsightsQuestion,
  TAQuestionData,
  generateTAAnswers,
} from "../types";

// GMAT Practice Questions Online (PQO) - Data Insights: Table Analysis
// Generated on 2026-02-23 by generate_pqo_typescript.py
// DO NOT EDIT MANUALLY — re-run generate_pqo_typescript.py to regenerate

export const dataInsightsPQO_TA: DataInsightsQuestion[] = [
  {
    id: "DI-GMAT-PQO_-00009",
    question_number: 9,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TA",
      table_title: "",
      stimulus_text: "The table shows graduation data, by academic discipline, for undergraduate students who entered University A in 2003. Percentages are given to the nearest $0.1$ percent.",
      column_headers: ["Academic discipline", "Total number of students", "Number who graduated within $6$ years", "Number who did not graduate within $6$ years", "Proportion of total who graduated within $6$ years (%)"],
      table_data: [
        ["Arts", "$1{,}087$", "$504$", "$583$", "$46.4$"],
        ["Business", "$2{,}813$", "$1{,}410$", "$1{,}403$", "$50.1$"],
        ["Communications", "$888$", "$503$", "$385$", "$56.6$"],
        ["Engineering", "$1{,}036$", "$367$", "$669$", "$35.4$"],
        ["Health Sciences", "$810$", "$452$", "$358$", "$55.8$"],
        ["Humanities", "$3{,}366$", "$1{,}619$", "$1{,}747$", "$48.1$"],
        ["Natural Sciences", "$933$", "$402$", "$531$", "$43.1$"],
        ["Social Sciences", "$2{,}479$", "$1{,}332$", "$1{,}147$", "$53.7$"],
        ["Total", "$13{,}412$", "$6{,}589$", "$6{,}823$", "$49.1$"],
      ],
      statements: [
        { text: "Engineering had both the smallest number and the smallest proportion of students who graduated within $6$ years.", is_true: true },
        { text: "Business is the discipline for which the ratio of the number of students who graduated within $6$ years to the number of students who did not is closest to 1.", is_true: true },
        { text: "The discipline having the largest number of students who graduated within $6$ years also has the largest number of students who did not graduate within $6$ years.", is_true: true },
      ],
      correct_answer: {
        stmt0: "col1",
        stmt1: "col1",
        stmt2: "col1"
      },
      answer_col1_title: "Yes",
      answer_col2_title: "No",
      statement_column_title: "Statement",
      explanation: "",
    } as TAQuestionData,
    answers: generateTAAnswers({
      stmt0: "col1",
      stmt1: "col1",
      stmt2: "col1"
    }),
    categories: ["Table Analysis"],
  },
];
