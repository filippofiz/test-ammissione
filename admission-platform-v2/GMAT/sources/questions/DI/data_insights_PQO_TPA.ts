import {
  DataInsightsQuestion,
  TPAQuestionData,
  generateTPAAnswers,
} from "../types";

// GMAT Practice Questions Online (PQO) - Data Insights: Two-Part Analysis
// Generated on 2026-02-23 by generate_pqo_typescript.py
// DO NOT EDIT MANUALLY — re-run generate_pqo_typescript.py to regenerate

export const dataInsightsPQO_TPA: DataInsightsQuestion[] = [
  {
    id: "DI-GMAT-PQO_-00005",
    question_number: 5,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TPA",
      scenario: "Archaeologists excavating an ancient Chi-Xua site found a small statue along with white-and-red striped pottery fragments and small bits of cloth in a one-room building approximately $6$ meters by $5$ meters. The building had a single entrance, opening to a narrow exterior porch. The building's walls were made of local sandstone.\n\nSelect the proposition that, if true, would provide the strongest evidence For the hypothesis that the room had a residential function and select the proposition that, if true, would provide the strongest evidence Against the hypothesis. Make only two selections, one in each column.",
      column1_title: "For",
      column2_title: "Against",
      shared_options: [
        "Local sandstone was rarely used for building in ancient Chi-Xua sites.",
        "Nearly all Chi-Xua residential buildings had multiple rooms.",
        "Some Chi-Xua buildings included multiple storage rooms measuring approximately $30$ square meters.",
        "The cloth fragments did not contain the pigments commonly used in Chi-Xua ceremonial robes.",
        "Red-and-white striped pottery was used in Chi-Xua almost exclusively for personal food storage.",
      ],
      correct_answers: {
        col1: "Red-and-white striped pottery was used in Chi-Xua almost exclusively for personal food storage.",
        col2: "Nearly all Chi-Xua residential buildings had multiple rooms.",
      },
      statement_title: "Select one from each column.",
      explanation: "In the absence of more information about the use of sandstone in ancient Chi-Xua buildings, the fact that the building material was unusual does not, in itself, imply any particular function. This rules out A as the correct response for either selection. While the building in question did have an area of $30$ square meters, the fact that it was a one-room building makes C irrelevant. Finally, even if it could be known with certainty that the bits of cloth were not part of ceremonial robes, the absence of ceremonial robes provides no evidence to suggest that the room served a residential function. Thus D is also irrelevant.\n\nRO1: Evaluate\nIf red-and-white striped pottery was used almost exclusively for personal food storage, this strongly suggests that the room was a private space, such as a residence.\nThe correct answer is E, Red-and-white striped pottery was used in Chi-Xua almost exclusively for personal food storage.\n\nRO2: Evaluate\nIf nearly all of the Chi-Xua residential buildings had multiple rooms, then strong evidence of residential use would be required to accept that this building is one of the few exceptions.\nThe correct answer is B, Nearly all Chi-Xua residential buildings had multiple rooms.",
    } as TPAQuestionData,
    answers: generateTPAAnswers("Red-and-white striped pottery was used in Chi-Xua almost exclusively for personal food storage.", "Nearly all Chi-Xua residential buildings had multiple rooms."),
    categories: ["Two-Part Analysis"],
  },
  {
    id: "DI-GMAT-PQO_-00006",
    question_number: 6,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TPA",
      scenario: "Advertisement: Our new 15/12 discount loan is perfect for quick business projects. Customers can borrow an amount up to $80\\%$ of the value of their collateral assets at $15\\%$ discounted interest and have $12$ months to repay the loan amount.*\n\n*Terms of loan: Loan proceeds, paid by check in rupees, are equal to the loan amount less the total interest for the loan-$15\\%$ of the loan amount.\n\nA 15/12 loan with amount $n$ rupees is taken out by a business. Select the expressions for the repayment amount (the sum of the payments made to fully repay the loan) and the loan proceeds for this loan. Make only two selections, one in each column.",
      column1_title: "Repayment amount",
      column2_title: "Loan proceeds",
      shared_options: [
        "$0.15n$",
        "$0.80n$",
        "$0.85n$",
        "$1.00n$",
        "$1.15n$",
        "$1.20n$",
      ],
      correct_answers: {
        col1: "$1.00n$",
        col2: "$0.85n$",
      },
      statement_title: "Select one from each column.",
      explanation: "RO1, Repayment amount: Strategize\nThe terms of the loan indicate that the total interest ($15\\%$ of the loan amount) is deducted up front and that the loan proceeds are the remainder. This indicates that the amount that is to be repaid is precisely the loan amount. Since $n = 1.00n$ is the loan amount, in rupees, then $1.00n$ is the repayment amount as well.\nThe correct answer is D, $1.00n$.\n\nRO2, Loan proceeds: Strategize\nAccording to the terms of the loan, the proceeds are calculated by deducting $15\\%$ from the loan amount. Since the loan amount is $n$ rupees, the loan proceeds are $n - 0.15n = 0.85n$.\nThe correct answer is C, $0.85n$.",
    } as TPAQuestionData,
    answers: generateTPAAnswers("$1.00n$", "$0.85n$"),
    categories: ["Two-Part Analysis"],
  },
  {
    id: "DI-GMAT-PQO_-00007",
    question_number: 7,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TPA",
      scenario: "Researcher: Soils are adversely affected by road salts used to melt ice and snow, particularly along roadsides and salt storage areas. Soil samples were collected from highway medians and in salt storage yards. These samples showed chloride levels $\\$11$$-$$160$$ times the level sufficient to inhibit bacteria growth in soil. The samples also had sodium levels $\\$15$$-$200$ times the level sufficient to inhibit bacterial growth in soil. Inhibited bacterial growth in soil greatly inhibits plant growth in that soil.\n\nAn agriculture official would like to use the researcher's results to support the argument that sand, rather than road salts, should be used as a winter road treatment, thereby eliminating the need for salt yards. Select the additional information that, if true, would most strengthen the official's case and select the additional information that, if true, would most weaken the official's case. Make only two selections, one in each column.",
      column1_title: "Most Strengthen",
      column2_title: "Most Weaken",
      shared_options: [
        "A high number of road accidents are attributable to untreated roads in winter.",
        "The cost of removing salts from soil in abandoned salt yards is high.",
        "High chloride concentrations in drinking water supplies have a negative impact on health.",
        "Sand is much less effective than salt at making roads safe to drive in winter conditions.",
        "Runoff from roads is often absorbed by farmland.",
      ],
      correct_answers: {
        col1: "Runoff from roads is often absorbed by farmland.",
        col2: "Sand is much less effective than salt at making roads safe to drive in winter conditions.",
      },
      statement_title: "Select one from each column.",
      explanation: "RO1, Most strengthen: Evaluate\nThere is insufficient information to link drinking water to the agriculture official's argument, therefore C is eliminated.\nWhile the high cost of removing salts from soil in abandoned salt yards could strengthen the official's case, additional information would need to be presented. For instance, if additional salt yards had been proposed, then switching to sand as a road treatment method could prevent further environmental damage. In the absence of such additional information, the high cost of removing salts from soil in abandoned salt yards does not, in itself, strengthen the official's case significantly.\nThe statement that most strengthens the official's case is that runoff from roads is often absorbed by farmland. Unlike the statement about salt yards, this indicates that maintaining the use of salt as a road treatment presents an immediate consequence for food production-a consequence the agriculture official wants to avoid.\nThe correct answer is E, Runoff from roads is often absorbed by farmland.\n\nRO2, Most weaken: Evaluate\nThe high number of road accidents attributable to untreated roads in winter could weaken the case if the official had proposed not treating the roads at all, but as the agriculture official offered sand as an alternative, this option does not affect the official's proposal. If true, the statement comparing the effectiveness of sand as a road treatment to the effectiveness of salt provides an argument against the use of sand that the official's argument does not address.\nThe correct answer is D, Sand is much less effective than salt at making roads safe to drive in winter conditions.",
    } as TPAQuestionData,
    answers: generateTPAAnswers("Runoff from roads is often absorbed by farmland.", "Sand is much less effective than salt at making roads safe to drive in winter conditions."),
    categories: ["Two-Part Analysis"],
  },
];
