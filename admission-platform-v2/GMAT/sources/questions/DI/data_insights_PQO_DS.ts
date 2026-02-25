import {
  DataInsightsQuestion,
  DSQuestionData,
  generateDSAnswers,
} from "../types";

// GMAT Practice Questions Online (PQO) - Data Insights: Data Sufficiency
// Generated on 2026-02-23 by generate_pqo_typescript.py
// DO NOT EDIT MANUALLY — re-run generate_pqo_typescript.py to regenerate

export const dataInsightsPQO_DS: DataInsightsQuestion[] = [
  {
    id: "DI-GMAT-PQO_-00001",
    question_number: 1,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "DS",
      problem: "An actor read aloud and recorded a certain $\\$420$$-page book on several audiotapes. Was the average recording time per page less than $90$ seconds?",
      statement1: "Each tape was at most $40$ minutes long.",
      statement2: "The book was recorded on $15$ tapes.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "C",
      explanation: "Determine if the average recording time for the $420$ pages is less than $1.5$ minutes per page, or equivalently, if the total recording time is less than ($\\$420$$)($$1.5$$ min) = $630$ min.\n\n($\\$1$$) Given that each tape was at most $$40$$ minutes, the total recording time could be less than $$630$$ min or greater than $$630$$ min. For example, if there were only $$2$$ tapes, then the total recording time would be at most $$80$$ min. On the other hand, if there were $$20$$ tapes each with $$40$$ min recorded, then the total recording time would be $800$ min; NOT sufficient.\n\n($\\$2$$) Given that there were $$15$$ tapes, the total recording time could be less than $$630$$ min or greater than $$630$$ min. For example, if only $$10$$ min were recorded on each tape, then the total recording time would be $$150$$ min. On the other hand, if $$100$$ min were recorded on each tape, then the total recording time would be $$1${,}500$ min; NOT sufficient.\n\nGiven ($\\$1$$) and ($\\$2$$) together, the total recording time is at most $\\$15$$($$40$$ min) = $$600$$ min, which is less than $630$ min.\n\nThe correct answer is C; both statements together are sufficient.",
    } as DSQuestionData,
    answers: generateDSAnswers("C"),
    categories: ["Data Sufficiency"],
  },
  {
    id: "DI-GMAT-PQO_-00002",
    question_number: 2,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "DS",
      problem: "Of the $N$ candies in a bag, some are peppermint and the rest are spearmint. What is the value of $N$?",
      statement1: "If $1$ peppermint candy were removed from the $N$ candies, $\\frac{1}{5}$ of the remaining candies would be peppermint.",
      statement2: "If $2$ spearmint candies were removed from $N$ candies, $\\frac{1}{4}$ of the remaining candies would be peppermint.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "C",
      explanation: "Determine the number, $N$, of candies in a bag, some of which are peppermint and the rest of which are spearmint. If $P$ and $S$ represent the numbers of peppermint candies and spearmint candies, respectively, in the bag, then $N = P + S$.\n\n($\\$1$$) If $$1$$ peppermint candy were removed from the bag, there would be $N - $1$$ candies left in the bag and $P - $1$$ of them would be peppermint candies. It is given that $\\frac{$1$}{$5$}$ of the remaining candies would be peppermint, so $\\frac{$1$}{$5$}(N - $1$) = P - $1$$. Since the value of $P$ can vary, it is not possible to determine the value of $N$. For example, if $P = $11$$, it follows that $N = $51$$. However, if $P = $21$$, it follows that $N = 101$; NOT sufficient.\n\n($\\$2$$) If $$2$$ spearmint candies were removed from the bag, there would be $N - $2$$ candies left in the bag, $S - $2$$ of them would be spearmint and $P$ of them would be peppermint. It is given that $\\frac{$1$}{$4$}$ of the remaining candies would be peppermint, so $\\frac{$1$}{$4$}(N - $2$) = P$. Since the value of $P$ can vary, it is not possible to determine the value of $N$. For example, if $P = $8$$, it follows that $N = $34$$. However, if $P = $10$$, it follows that $N = 42$; NOT sufficient.\n\nTaking ($\\$1$$) and ($\\$2$$) together and combining $\\frac{$1$}{$5$}(N - $1$) = P - $1$$ from ($\\$1$$) and $\\frac{$1$}{$4$}(N - $2$) = P$ from ($\\$2$$), it follows that $\\frac{$1$}{$5$}(N - $1$) = \\frac{$1$}{$4$}(N - $2$) - $1$$. This is a linear equation in $N$ and can be solved for a unique value of $N$; SUFFICIENT.\n\nThe correct answer is C; both statements together are sufficient.",
    } as DSQuestionData,
    answers: generateDSAnswers("C"),
    categories: ["Data Sufficiency"],
  },
  {
    id: "DI-GMAT-PQO_-00003",
    question_number: 3,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "DS",
      problem: "Sally gave some of her candy to her friends. How many pieces of candy did she have before giving any to her friends?",
      statement1: "Sally gave each friend $8$ pieces of candy.",
      statement2: "Sally had $7$ pieces of candy left after giving candy to her friends.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "E",
      explanation: "Let $n$ be the number of pieces of candy Sally had before giving some away, let $n_1$ be the number of pieces of candy Sally gave away, and let $n_2$ be the number of pieces of candy Sally had left after giving some away. Then $n = n_1 + n_2$. Determine the value of $n$.\n\n($\\$1$$) Given that $n_$1$ = 8k$, where $k$ is the number of friends Sally gave candy to, the value of $n = 8k + n_2$ cannot be determined; NOT sufficient.\n\n($\\$2$$) Given that $n_$2$ = $7$$, the value of $n = n_$1$ + 7$ cannot be determined; NOT sufficient.\n\nGiven ($\\$1$$) and ($\\$2$$) together, the value of $n = 8k + $7$$ cannot be determined. For example, if Sally gave candy to $$2$$ friends, then $n = $8$($2$) + $7$ = $23$$. On the other hand, if Sally gave candy to $$3$$ friends, then $n = $8$($3$) + $7$ = 31$; NOT sufficient.\n\nThe correct answer is E; both statements together are still not sufficient.",
    } as DSQuestionData,
    answers: generateDSAnswers("E"),
    categories: ["Data Sufficiency"],
  },
  {
    id: "DI-GMAT-PQO_-00004",
    question_number: 4,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "DS",
      problem: "Color X ink is created by blending red, blue, green, and yellow inks in the ratio $6:5:2:2$. What is the number of liters of green ink that was used to create a certain batch of color X ink?",
      statement1: "The amount of red ink used to create the batch is $2$ liters more than the amount of blue ink used to create the batch.",
      statement2: "The batch consists of $30$ liters of color X ink.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "D",
      explanation: "For a batch of a certain color ink, red, blue, green, and yellow inks are blended in the ratio $6:5:2:2$. Determine how many liters of green ink were used.\n\nIf $R$, $B$, $G$, and $Y$ represent the amounts of red, blue, green, and yellow ink, respectively, then $T = R + B + G + Y = 6x + 5x + 2x + 2x = 15x$, where $T$ is the total amount of ink in the batch and $x$ is the constant of proportionality. If the value of $x$ can be determined, then the amount of green ink used, $G = 2x$, can be determined.\n\n($\\$1$$) The amount of red ink is $2$ liters more than the amount of blue ink, so\n$R = B + 2$\n$6x = 5x + 2$\n$x = 2$\n\nTherefore, $2(2) = 4$ liters of green ink were used; SUFFICIENT.\n\n($\\$2$$) The batch contains $30$ liters of ink, so\n$T = 30$\n$15x = 30$\n$x = 2$\n\nTherefore, $2(2) = 4$ liters of green ink were used; SUFFICIENT.\n\nThe correct answer is D; each statement alone is sufficient.",
    } as DSQuestionData,
    answers: generateDSAnswers("D"),
    categories: ["Data Sufficiency"],
  },
];
