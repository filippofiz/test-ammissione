import {
  DataInsightsQuestion,
  DSQuestionData,
  TPAQuestionData,
  MSRQuestionData,
  TAQuestionData,
  generateDSAnswers,
  generateTPAAnswers,
  generateMSRAnswers,
  generateTAAnswers,
} from "../types";

// ============================================
// MULTI-SOURCE REASONING SHARED SOURCES
// ============================================

// Island Museum Kaxna collection sources (used by multiple MSR questions)
const MSR_ISLAND_MUSEUM_SOURCES: MSRQuestionData["sources"] = [
  {
    tab_name: "Techniques",
    content_type: "text",
    content:
      "Island Museum analyzes historical artifacts using one or more techniques described below—all but one of which is performed by an outside laboratory—to obtain specific information about an object's creation. For each type of material listed, the museum uses only the technique described:\nAnimal teeth or bones: The museum performs isotope ratio mass spectrometry (IRMS) in-house to determine the ratios of chemical elements present, yielding clues as to the animal's diet and the minerals in its water supply.\nMetallic ores or alloys: Inductively coupled plasma mass spectrometry (ICP-MS) is used to determine the ratios of traces of metallic isotopes present, which differ according to where the sample was obtained.\nPlant matter: While they are living, plants absorb carbon-14, which decays at a predictable rate after death; thus radiocarbon dating is used to estimate a plant's date of death.\nFired-clay objects: Thermoluminescence (TL) dating is used to provide an estimate of the time since clay was fired to create the object.",
  },
  {
    tab_name: "Artifacts",
    content_type: "text",
    content:
      "Island Museum has acquired a collection of metal, fired clay, stone, bone, and wooden artifacts found on the Kaxna Islands, and presumed to be from the Kaxna Kingdom of 1250-850 BC. Researchers have mapped all the mines, quarries, and sources of clay on Kaxna and know that wooden artifacts of that time were generally created within 2 years after tree harvest. There is, however, considerable uncertainty as to whether these artifacts were actually created on Kaxna.\nIn analyzing these artifacts, the museum assumes that radiocarbon dating is accurate to approximately ±200 years and TL dating is accurate to approximately ±100 years.",
  },
  {
    tab_name: "Budget",
    content_type: "text",
    content:
      "For outside laboratory tests, the museum's first-year budget for the Kaxna collection allows unlimited IRMS testing, and a total of $7,000—equal to the cost of 4 TL tests plus 15 radiocarbon tests, or the cost of 40 ICP-MS tests—for all other tests. For each technique applied by an outside lab, the museum is charged a fixed price per artifact.",
  },
];

// ============================================
// DATA INSIGHTS QUESTIONS
// ============================================

export const dataInsightsQuestions: DataInsightsQuestion[] = [
  // ============================================
  // DATA SUFFICIENCY QUESTIONS (DS)
  // ============================================
  {
    id: "DI-GMAT-SK__-00001",
    question_number: 1,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "DS",
      problem:
        "A bookstore that sells used books sells each of its paperback books for a certain price and each of its hardcover books for a certain price. If Joe, Maria, and Paul bought books in this store, how much did Maria pay for 1 paperback book and 1 hardcover book?",
      statement1:
        "Joe bought 2 paperback books and 3 hardcover books for $12.50.",
      statement2:
        "Paul bought 4 paperback books and 6 hardcover books for $25.00.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "E",
      explanation:
        "Let $p$ be the price for each paperback book, and let $h$ be the price for each hardcover book. (1) From this, Joe's purchase can be expressed as $2p + 3h = $12.50$. Without more information, this equation alone cannot determine the cost of 1 paperback and 1 hardcover book; NOT sufficient. (2) This statement is equivalent to $4p + 6h = $25.00$. If both sides of this equation are divided by 2, it gives exactly the same equation as in (1); NOT sufficient. Since (1) and (2) are the same equation that cannot be solved, taken together they cannot determine the cost of 1 of each type of book.",
    } as DSQuestionData,
    answers: generateDSAnswers("E"),
    categories: ["Algebra", "Applied problems", "Data Sufficiency"],
  },
  {
    id: "DI-GMAT-SK__-00002",
    question_number: 2,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "DS",
      problem:
        "A stretch of highway, Segment X, has no traffic signals and comprises three speed zones: One with a speed limit of 55 miles per hour (mph) followed by a 75-mph zone and a second 55-mph zone. Leslie is at a certain point on Segment X, driving at a speed she will exactly maintain until after she has reached the end of Segment X and has entered the next highway segment. Is she driving faster than 55 mph?",
      statement1:
        "Leslie's speed is at least 5 mph below the speed limit that currently applies to her.",
      statement2:
        "Leslie will reach the end of Segment X without ever exceeding any speed limits.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "B",
      explanation:
        'Leslie is driving on a stretch of highway, Segment X, that comprises three zones, two of which are 55-mph zones that are separated by a 75-mph zone. We are not informed of which of the three zones Leslie is currently driving in, but we know that Leslie will continue driving at her current speed until she reaches the end of Segment X. Is Leslie currently driving faster than 55 mph? (1) Given this statement, we can only infer that Leslie is driving 50 mph or less if she is in one of the two 55-mph zones or 70 mph or less if she is in the 75-mph zone. Because we do not know which of the three segments she is in currently, we cannot infer from this statement whether she is currently driving faster than 55 mph. Therefore, this statement is NOT SUFFICIENT to answer the question. (2) We are informed that Leslie will maintain her current speed until she reaches the end of Segment X, and she will not exceed the speed limit of any of the zones she will pass through between the current moment and the moment when she reaches the end of Segment X. However (since she is currently in either the first 55-mph zone or in the 75-mph zone), we know that she will have to pass through a 55-mph zone to reach the end of Segment X. Given that she maintains her current speed until she reaches that end and she does not exceed any of the speed limits of the zones she will pass through before reaching that end, at least one of which is 55 mph, we can infer that the answer to the question whether Leslie is currently driving faster than 55 mph is "No." Thus this statement is SUFFICIENT to answer the question. The correct answer is B; statement 2 alone is sufficient.',
    } as DSQuestionData,
    answers: generateDSAnswers("B"),
    categories: ["Data Sufficiency"],
  },
  {
    id: "DI-GMAT-SK__-00003",
    question_number: 3,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "DS",
      problem:
        "Simon and Tara, who live in Neighborhood Z, wish to watch a movie together in a theater tonight. Simon only watches a movie in a theater if it is close to home and is of one of three genres: P, Q, and R. Tara does not watch movies of genres R or T in theaters. All movies playing in town tonight are of genre P, Q, or T. Will Simon and Tara watch a movie together in a theater tonight?",
      statement1:
        "All movies of genre P or Q playing in town tonight are in theaters far from Neighborhood Z.",
      statement2: "All movies in theaters close to Neighborhood Z are of genre T.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "D",
      explanation:
        "The question is whether Simon and Tara will watch a movie together in a theater tonight. If they do, we know that it must be a movie of the P or Q genre, because the only genres Simon watches are P, Q, and R, but Tara does not watch movies of genre R or T. We also know, if they do watch a movie together in a theater, it must be close to Neighborhood Z, where they live, because Simon watches movies in a theater only if the theater is close to home. (1) We can infer from this statement that no movie of genre P or Q is playing in a theater close to Neighborhood Z. Because any movie Simon and Tara watch together in a theater must be of genre P or Q in a close-by theater, we can infer that they will NOT watch a movie together in a theater tonight. Therefore, statement 1 is SUFFICIENT. (2) We know that neither Simon nor Tara watch in a theater movies of genre T and Simon will not watch a movie in a theater unless the theater is close to his home in Neighborhood Z. Therefore, we can infer from this statement that they will NOT watch a movie together in a theater tonight and thus statement 2 is also SUFFICIENT. The correct answer is D; EACH statement ALONE is sufficient.",
    } as DSQuestionData,
    answers: generateDSAnswers("D"),
    categories: ["Data Sufficiency"],
  },
  {
    id: "DI-GMAT-SK__-00004",
    question_number: 4,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 2,
    questionData: {
      di_type: "DS",
      problem: "A certain company currently has how many employees?",
      statement1:
        "If 3 additional employees are hired by the company and all of the present employees remain, there will be at least 20 employees in the company.",
      statement2:
        "If no additional employees are hired by the company and 3 of the present employees resign, there will be fewer than 15 employees in the company.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "C",
      explanation:
        "Let $n$ be the current number of employees in the company. (1) This can be expressed as $n + 3 >= 20$, and thus $n >= 17$, which gives a range of possible values of $n$; NOT sufficient. (2) This can be expressed as $n - 3 < 15$, and thus $n < 18$, which also gives a range of possible values of $n$; NOT sufficient. From (1) and (2) together, the ranges are limited to $n >= 17$ and $n < 18$, and the value of $n$ can be determined to be 17. The correct answer is C; both statements together are sufficient.",
    } as DSQuestionData,
    answers: generateDSAnswers("C"),
    categories: ["Algebra", "Inequalities", "Data Sufficiency"],
  },
  {
    id: "DI-GMAT-SK__-00005",
    question_number: 5,
    section: "Data Insights",
    difficulty: "hard",
    difficultyLevel: 4,
    questionData: {
      di_type: "DS",
      problem:
        "There are 210 households in a certain residential complex. All households in the complex that have more than one dog also have at least one cat. All households that have at least one cat have a pet rodent. How many households in the complex have a pet rodent?",
      statement1: "18 households in the complex have two or more dogs.",
      statement2:
        "90% of households in the complex that have a pet rodent have at least one cat.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "E",
      explanation:
        "How many households in the apartment complex have a pet rodent? (1) The fact that 18 households in the complex have two or more dogs implies that at least 18 households have a cat, and therefore at least 18 households have a pet rodent. However, nothing in this statement rules out that there are more than 18 households with a pet rodent—nothing rules out, for instance, that there are households with only a pet rodent but no pet cat or dog—so this statement is NOT SUFFICIENT to determine the number of households that have a pet rodent. (2) This statement indicates that whatever the number of households with a pet rodent, the number of households with a pet cat is 10% less than that number. But this is NOT SUFFICIENT to determine the number of households that have a pet rodent. The two statements together are sufficient only to tell us that there are at least 20 households with pet rodents (the number of households with cats is at least 18, which is 10% less than 20). They are NOT SUFFICIENT to tell us exactly how many households in the complex have pet rodents, however. The correct answer is E; Statement (1) and (2) TOGETHER are NOT sufficient.",
    } as DSQuestionData,
    answers: generateDSAnswers("E"),
    categories: ["Data Sufficiency"],
  },
  {
    id: "DI-GMAT-SK__-00006",
    question_number: 6,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      di_type: "DS",
      problem:
        "A certain 4-liter solution of vinegar and water consists of $x$ liters of vinegar and $y$ liters of water. How many liters of vinegar does the solution contain?",
      statement1: "$\\frac{x}{4} = \\frac{3}{8}$",
      statement2: "$\\frac{y}{4} = \\frac{5}{8}$",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "D",
      explanation:
        "(1) This proportion can be solved for $x$ to determine the liters of vinegar in the solution; SUFFICIENT. (2) This proportion can be solved for $y$ to determine the liters of water in the solution. Then, substituting this value of $y$ in the equation $x + y = 4$, which can be formulated from the given information, will give the value of $x$; SUFFICIENT. The correct answer is D; each statement alone is sufficient.",
    } as DSQuestionData,
    answers: generateDSAnswers("D"),
    categories: ["Arithmetic", "Percents", "Data Sufficiency"],
  },
  {
    id: "DI-GMAT-SK__-00007",
    question_number: 7,
    section: "Data Insights",
    difficulty: "hard",
    difficultyLevel: 5,
    questionData: {
      di_type: "DS",
      problem:
        "The Smiths take their children to a certain amusement park on exactly one Saturday every calendar month. Today is the 1st of July. Did the Smiths and their children make a trip to the amusement park on one of the past three days?",
      statement1:
        "The Smiths made their June trip to the amusement park on one of the past seven days.",
      statement2: "The 23rd of last month was a Sunday.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "C",
      explanation:
        'On exactly one Saturday in each calendar month, the Smiths take their children to a certain amusement park. We are informed that "today" is the 1st of July, but we are not told what day of the week it is. The question to be answered is whether the Smiths and their children made a trip to the amusement park in one the past three days—namely either the 28th, 29th, or 30th of June. (1) This statement allows us to conclude that the Smiths made their June trip sometime after the 23rd of June. We know that the trip was made on a Saturday, but because we do not know what day of the week "today" is, we do not know which of the days from the 24th through the 30th is a Saturday. If the Saturday of that week fell at any time from the 24th through the 27th of June, then the answer to the question is no. If it fell at any time during the 28th through the 30th the answer is yes. Therefore statement 1 is NOT SUFFICIENT. (2) This statement implies that in the calendar year in question, the 1st, 8th, 15th, 22nd, and 29th of June were all Saturdays. If the Saturday in June on which the Smiths made their trip was one of the Saturdays other than the 29th, then the answer to the question is no. If, however, they made the trip on the 29th, then the answer is yes. Therefore statement 2 is NOT SUFFICIENT. Given statement (1), we can infer that the Smiths made their June trip to the amusement park later than the 23rd of June, and given statement (2) we can infer that the only Saturday in June later than the 23rd was the 29th, and therefore they made a trip to the amusement park on the 29th of June. Given that "today" is the 1st of July, it must be the case, then, that the Smiths and their children made a trip to the amusement park on one of the last three days. Therefore, statements 1 and 2, taken together, are SUFFICIENT. The correct answer is C; BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.',
    } as DSQuestionData,
    answers: generateDSAnswers("C"),
    categories: ["Data Sufficiency"],
  },
  {
    id: "DI-GMAT-SK__-00008",
    question_number: 8,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "DS",
      problem:
        "The table lists five countries and their total 2021 spending, in billions of USD, on imports of finished electronic goods—a category that includes cell phones.\n\n| Country | Spending in 2021 (billions of USD) |\n|---------|------------------------------------|\n| P       | 90                                 |\n| Q       | 120                                |\n| R       | 50                                 |\n| S       | 40                                 |\n| T       | 100                                |\n\nWhich of the five countries spent the most in 2021 on imports of cell phones?",
      statement1:
        "For each of the two countries with the highest spending on imports of finished electronic goods, spending on cell phone imports was more than 10% of that country's total spending on imports of finished electronic goods.",
      statement2:
        "For each of the three countries with the lowest spending on imports of finished electronic goods, spending on cell phone imports was less than 5% of that country's total spending on imports of finished electronic goods.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "E",
      explanation:
        "The given table lists five countries and their total 2021 spending, in billions of US dollars, on imports of finished electronic goods—a category that includes cell phones. Which of the five countries spent the most in 2021 on imports of cell phones? (1) Given this statement, we can infer that countries Q and T—which are the two countries with the highest spending on imports of finished electronic goods—each spent more than 10% of that amount on imports of cell phones. That means that Q spent more than $12 billion and T spent more than $10 billion on imports of cell phones. This does not allow us to determine which of the five countries spent the most on such imports. First, we do not know what percentage of the other three countries' spending on imports of finished electronic goods was spending on imports of cell phones, so it is possible—though certainly not necessary—that one of those three countries spent more than either Q or T on imports of cell phones. Second, we cannot infer which of Q or T spent more on imports of cell phones. We only know that it was more than $12 billion for Q and more than $10 billion for T. But in each case we do not know how much more. Therefore, statement 1 is NOT SUFFICIENT. (2) Given this statement, we can infer that countries P, R, and S—which are the three countries with the lowest spending on imports of finished electronic goods—each spent less than 5% of that amount on imports of cell phones. That means that P spent less than $4.5 billion, R spent less than $2.5 billion, and S spent less than $2 billion, on imports of cell phones. But this statement alone presents us with insufficient information to determine what country spent the most on imports of cell phone. Note that this statement tells us nothing about what percentage of their total spending on finished electronic Q or T spent on imports of cell phones. Therefore, statement 2 is NOT SUFFICIENT. Note that statements (1) and (2) taken together imply only that the country that spent the most on imports of cell phones was either Q or T. These two statements do not allow us to infer which of those two countries had the most. The correct answer is E; statements 1 and 2 TOGETHER are NOT sufficient.",
    } as DSQuestionData,
    answers: generateDSAnswers("E"),
    categories: ["Data Sufficiency"],
  },
  {
    id: "DI-GMAT-SK__-00009",
    question_number: 9,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      di_type: "DS",
      problem:
        "A certain group of car dealerships agreed to donate $x$ dollars to a Red Cross chapter for each car sold during a 30-day period. What was the total amount that was expected to be donated?",
      statement1: "A total of 500 cars were expected to be sold.",
      statement2:
        "60 more cars were sold than expected, so that the total amount actually donated was $28,000.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "C",
      explanation:
        "(1) It is known that 500 cars were expected to be sold, so $500x$ represents the total amount of the expected donation. However, $x$ is unknown so $500x$ cannot be determined; NOT sufficient. (2) Since $60x$ represents the extra amount donated beyond the expectation, the total amount that it was expected would be donated would be $28,000 minus $60x$. Again, $x$ is unknown, so the total amount expected to be donated cannot be found; NOT sufficient. If the information in (1) and (2) is used together, then $500x = $28,000 - 60x$, from which the value of $x$ can be determined. Thus, the total amount expected to be donated can also be determined $(500x)$. The correct answer is C; both statements together are sufficient.",
    } as DSQuestionData,
    answers: generateDSAnswers("C"),
    categories: ["Algebra", "Applied problem", "Data Sufficiency"],
  },
  {
    id: "DI-GMAT-SK__-00010",
    question_number: 10,
    section: "Data Insights",
    difficulty: "hard",
    difficultyLevel: 5,
    questionData: {
      di_type: "DS",
      problem:
        "Each time Meg has visited a certain ice cream parlor with friends, she has bought chocolate ice cream, unless half or a majority of her accompanying friends all bought the same flavor of ice cream and that flavor was not chocolate—in which case Meg bought that flavor. Yesterday, Meg visited the parlor with four friends: Ann, Bart, Cathy, and Derek. Ann bought chocolate ice cream. Did Meg buy chocolate ice cream?",
      statement1:
        "Bart bought either vanilla or chocolate ice cream, and Cathy bought neither vanilla nor chocolate ice cream.",
      statement2: "Derek did not buy the same flavor as Bart.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "E",
      explanation:
        "In the past Meg has bought chocolate ice cream when she has visited a certain ice cream parlor, except in those cases when at least half of the friends accompanying her have bought the same non-chocolate flavor, in which case she bought that flavor. When Meg visited the parlor with her four friends—Ann, who bought chocolate, Bart, Cathy, and Derek—did Meg buy chocolate ice cream? Note that it follows from the given information that Meg bought some non-chocolate flavor if, but only if, two or more of Bart, Cathy, and Derek bought the same non-chocolate flavor. (1) It follows from this statement that Bart and Cathy did not buy the same flavor of ice cream, and Cathy—if she bought any ice cream at all—bought a non-chocolate flavor. This scenario is compatible with multiple different possibilities: For instance, Bart and Derek could have both bought vanilla, in which case Meg would have bought that instead of chocolate. Or Cathy bought some non-chocolate flavor and Derek bought the same one as Cathy, in which case Meg also bought that, and not chocolate. On the other hand, the scenario is also compatible with Bart buying vanilla, Cathy buying some non-chocolate variety, such as strawberry, and Derek buying some other non-chocolate variety, such as cherry. In this case, no two of Meg's accompanying friends bought the same variety, in which case Meg would have bought chocolate. Thus, statement 1 is NOT SUFFICIENT. (2) Even though we are told that Derek did not buy the same flavor of ice cream as Bart, it is still possible—but not necessary—for two of Meg's accompanying friends to have bought the same non-chocolate ice cream. For instance, Derek and Cathy could have both bought strawberry ice cream, in which case Meg would have bought strawberry and not chocolate. But this statement is also compatible with all four of Meg's accompanying friends buying different ice creams from one another, in which Meg would have bought chocolate. Thus, statement 2 is NOT SUFFICIENT. Statement (1) and (2) taken together are also compatible with both the scenario that Cathy and Derek bought the same non-chocolate ice cream—in which case Meg does not buy chocolate—and the scenario that none of Meg's accompanying friends buys the same ice cream flavor as one another—in which case Meg does buy chocolate. Therefore, statements 1 and 2 taken together are also NOT SUFFICIENT. The correct answer is E; Statement (1) and (2) TOGETHER are NOT sufficient.",
    } as DSQuestionData,
    answers: generateDSAnswers("E"),
    categories: ["Data Sufficiency"],
  },

  // ============================================
  // TWO-PART ANALYSIS QUESTIONS (TPA)
  // ============================================
  {
    id: "DI-GMAT-SK__-00011",
    question_number: 11,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TPA",
      scenario:
        "The Quasi JX is a new car model. Under ideal driving conditions, the Quasi JX's fuel economy is $E$ kilometers per liter $(E \\frac{km}{L})$ when its driving speed is constant at $S$ kilometers per hour $(S \\frac{km}{hr})$.\n\nIn terms of the variables $S$ and $E$, select the expression that represents the number of liters of fuel used in 1 hour of driving under ideal driving conditions at a constant speed $S$, and select the expression that represents the number of liters of fuel used in a 60 km drive under ideal driving conditions at a constant speed $S$. Make only two selections, one in each column.",
      column1_title: "Liters of fuel in 1 hour",
      column2_title: "Liters of fuel in 60 km",
      shared_options: [
        "$\\frac{S}{E}$",
        "$\\frac{60}{E}$",
        "$\\frac{60}{E}$",
        "$\\frac{60}{S}$",
        "$\\frac{S}{60}$",
        "$\\frac{E}{60}$",
      ],
      correct_answers: {
        col1: "$\\frac{S}{E}$",
        col2: "$\\frac{60}{E}$",
      },
      statement_title: "Expression",
    } as TPAQuestionData,
    answers: generateTPAAnswers("$\\frac{S}{E}$", "$\\frac{60}{E}$"),
    categories: ["Algebra", "Applied problems"],
  },
  {
    id: "DI-GMAT-SK__-00012",
    question_number: 12,
    section: "Data Insights",
    difficulty: "hard",
    difficultyLevel: 4,
    questionData: {
      di_type: "TPA",
      scenario:
        "Over a period of 5 academic years from Fall 1999 through Spring 2004, the number of faculty at a certain college increased despite a decrease in student enrollment from 5,500 students in Fall 1999. In the given expressions, $F$ and $S$ represent the percent change in the number of faculty and students, respectively, over the 5 academic years, and $R$ represents the number of students per faculty member in Fall 1999. The percent change in a quantity $X$ is calculated using the formula $\\left(\\frac{X_{new} - X_{old}}{X_{old}}\\right)(100)$.\n\nSelect the expression that represents the number of faculty in Fall 1999, and select the expression that represents the number of students per faculty member in Spring 2004. Make only two selections, one in each column.",
      column1_title: "Number of faculty in Fall 1999",
      column2_title: "Students per faculty in Spring 2004",
      shared_options: [
        "$5,500R$",
        "$\\frac{5,500}{R}$",
        "$\\frac{1}{R}$",
        "$\\left(\\frac{100+S}{100+F}\\right)R$",
        "$\\left(\\frac{100-S}{100+F}\\right)R$",
        "$\\left(\\frac{100+S}{100-F}\\right)R$",
      ],
      correct_answers: {
        col1: "$\\frac{5,500}{R}$",
        col2: "$\\left(\\frac{100+S}{100+F}\\right)R$",
      },
      statement_title: "Expression",
    } as TPAQuestionData,
    answers: generateTPAAnswers(
      "$\\frac{5,500}{R}$",
      "$\\left(\\frac{100+S}{100+F}\\right)R$"
    ),
    categories: ["Algebra", "Applied problems"],
  },
  {
    id: "DI-GMAT-SK__-00020",
    question_number: 20,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TPA",
      scenario:
        'The following excerpt from a fictitious science news report discusses a fictitious type of location called a morefa.\n\nFor zoologists studying the behavior of certain species of birds, the critical importance of observing the birds in those species\' morefa during the annual breeding season is obvious. Such observation allows researchers to study not only the courtship displays of many different individuals within a species, but also the species\' social hierarchy. Moreover, since some species repeatedly return to the same morefa, researchers can study changes in group dynamics from year to year. The value of observing a morefa when the birds are not present, however—such as prior to their arrival or after they have abandoned the area to establish their nests—is only now becoming apparent.\n\nBased on the definition of the imaginary word morefa that can be inferred from the paragraph above, which of the following activities of a bird species must happen in a location for that location to be the species\' morefa, and which must NOT happen in a location for that location to be the species\' morefa? Make only two selections, one in each column.',
      column1_title: "Must happen in the location",
      column2_title: "Must not happen in the location",
      shared_options: [
        "Sleeping",
        "Occupying the location multiple times",
        "Establishing nests",
        "Gathering together with members of their own species",
        "Territorial competition with members of different species",
      ],
      correct_answers: {
        col1: "Gathering together with members of their own species",
        col2: "Establishing nests",
      },
      statement_title: "Activity",
    } as TPAQuestionData,
    answers: generateTPAAnswers(
      "Gathering together with members of their own species",
      "Establishing nests"
    ),
    categories: ["Two-Part Analysis", "Verbal Reasoning"],
  },
  {
    id: "DI-GMAT-SK__-00021",
    question_number: 21,
    section: "Data Insights",
    difficulty: "hard",
    difficultyLevel: 5,
    questionData: {
      di_type: "TPA",
      scenario:
        "A literature department at a small university in an English-speaking country is organizing a two-day festival in which it will highlight the works of ten writers who have been the subjects of recent scholarly work by the faculty. Five writers will be featured each day. To reflect the department's strengths, the majority of writers scheduled on one of the days will be writers whose primary writing language is not English. On the other day of the festival, at least four of the writers will be women. Neither day should have more than two writers from the same country. Departmental members have already agreed on a schedule for eight of the writers. That schedule showing names, along with each writer's primary writing language and country of origin, is shown.\n\n• Day 1:\nAchebe (male, English, Nigeria)\nWeil (female, French, France)\nGavalda (female, French, France)\nBarrett Browning (female, English, UK)\n\n• Day 2:\nRowling (female, English, UK)\nAusten (female, English, UK)\nOcantos (male, Spanish, Argentina)\nLu Xun (male, Chinese, China)\n\nSelect a writer who could be added to the schedule for either day. Then select a writer who could be added to the schedule for neither day. Make only two selections, one in each column.",
      column1_title: "Either day",
      column2_title: "Neither day",
      shared_options: [
        "LeGuin (female, English, USA)",
        "Longfellow (male, English, USA)",
        "Murasaki (female, Japanese, Japan)",
        "Colette (female, French, France)",
        "Vargas Llosa (male, Spanish, Peru)",
        "Zola (male, French, France)",
      ],
      correct_answers: {
        col1: "Murasaki (female, Japanese, Japan)",
        col2: "Longfellow (male, English, USA)",
      },
      statement_title: "Writer",
    } as TPAQuestionData,
    answers: generateTPAAnswers(
      "Murasaki (female, Japanese, Japan)",
      "Longfellow (male, English, USA)"
    ),
    categories: ["Two-Part Analysis", "Logical Reasoning"],
  },

  // ============================================
  // MULTI-SOURCE REASONING QUESTIONS (MSR)
  // ============================================
  {
    id: "DI-GMAT-SK__-00013",
    question_number: 13,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      di_type: "MSR",
      sources: MSR_ISLAND_MUSEUM_SOURCES,
      questions: [
        {
          text: "Bronze statue of a deer: Can a range of dates for the object's creation be obtained using one of the techniques in the manner described?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "b",
        },
        {
          text: "Fired-clay pot: Can a range of dates for the object's creation be obtained using one of the techniques in the manner described?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
        {
          text: "Wooden statue of a warrior: Can a range of dates for the object's creation be obtained using one of the techniques in the manner described?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
      ],
    } as MSRQuestionData,
    answers: generateMSRAnswers(["b", "a", "a"]),
    categories: ["Multi-Source Reasoning"],
  },
  {
    id: "DI-GMAT-SK__-00014",
    question_number: 14,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "MSR",
      sources: MSR_ISLAND_MUSEUM_SOURCES,
      questions: [
        {
          text: "Bone necklace shown by IRMS to have element ratios characteristic of artifacts known to be from the Kaxna Kingdom: Does this confirm the artifact was created during the time of the Kaxna Kingdom?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "b",
        },
        {
          text: "Fired-clay jug dated to 1050 BC by TL dating: Does this confirm the artifact was created during the time of the Kaxna Kingdom?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
        {
          text: "Copper box shown by ICP-MS to have the same ratio of trace metals found in the copper mines of Kaxna: Does this confirm the artifact was created during the time of the Kaxna Kingdom?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "b",
        },
      ],
    } as MSRQuestionData,
    answers: generateMSRAnswers(["b", "a", "b"]),
    categories: ["Multi-Source Reasoning"],
  },
  {
    id: "DI-GMAT-SK__-00015",
    question_number: 15,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "MSR",
      sources: MSR_ISLAND_MUSEUM_SOURCES,
      questions: [
        {
          text: "2 fired-clay statues and 10 bronze statues: Can the cost of all pertinent techniques be shown to be within the museum's first-year Kaxna budget?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
        {
          text: "3 fired-clay statues and 5 tin implements: Can the cost of all pertinent techniques be shown to be within the museum's first-year Kaxna budget?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
        {
          text: "4 fired-clay pots and 20 wooden statues: Can the cost of all pertinent techniques be shown to be within the museum's first-year Kaxna budget?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "b",
        },
      ],
    } as MSRQuestionData,
    answers: generateMSRAnswers(["a", "a", "b"]),
    categories: ["Multi-Source Reasoning"],
  },
  {
    id: "DI-GMAT-SK__-00016",
    question_number: 16,
    section: "Data Insights",
    difficulty: "hard",
    difficultyLevel: 4,
    questionData: {
      di_type: "MSR",
      sources: MSR_ISLAND_MUSEUM_SOURCES,
      questions: [
        {
          text: "2 bone implements and 5 fired-clay cups decorated with gold: Can the cost of all pertinent techniques be shown to be within the museum's first-year Kaxna budget?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "b",
        },
        {
          text: "7 wooden statues and 20 metal implements: Can the cost of all pertinent techniques be shown to be within the museum's first-year Kaxna budget?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
        {
          text: "15 wooden statues decorated with bone: Can the cost of all pertinent techniques be shown to be within the museum's first-year Kaxna budget?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
      ],
    } as MSRQuestionData,
    answers: generateMSRAnswers(["b", "a", "a"]),
    categories: ["Multi-Source Reasoning"],
  },
  {
    id: "DI-GMAT-SK__-00017",
    question_number: 17,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "MSR",
      sources: MSR_ISLAND_MUSEUM_SOURCES,
      questions: [
        {
          text: "Among the Kaxna artifacts is a wooden box containing both a small fired-clay bead and some river sediment containing clay and plant matter. Based on the museum's assumptions, which one of the following details about the bead can be determined by applying one of the tests in the manner described?",
          options: {
            a: "A range of dates for its manufacture",
            b: "The Kaxna island on which it was made",
            c: "Vegetation patterns near the workshop where it was made",
            d: "A range of dates for its placement in the box",
            e: "The source of clay used to make the bead",
          },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
      ],
    } as MSRQuestionData,
    answers: generateMSRAnswers(["a"]),
    categories: ["Multi-Source Reasoning"],
  },
  {
    id: "DI-GMAT-SK__-00018",
    question_number: 18,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "MSR",
      sources: MSR_ISLAND_MUSEUM_SOURCES,
      questions: [
        {
          text: "Which one of the following pieces of information would, on its own, provide the strongest evidence that the given artifact was actually produced on Kaxna?",
          options: {
            a: "A radiocarbon date of 1050 BC for a wooden bowl",
            b: "IRMS analysis of a necklace made from animal bones and teeth",
            c: "A TL date for a fired-clay brick that places it definitively in the period of the Kaxna Kingdom",
            d: "ICP-MS analysis of a metal tool that reveals element ratios unique to a mine on Kaxna",
            e: "Determination that a stone statue was found near a quarry known to produce stone statues during the Kaxna Kingdom",
          },
          question_type: "multiple_choice",
          correct_answer: "d",
        },
      ],
    } as MSRQuestionData,
    answers: generateMSRAnswers(["d"]),
    categories: ["Multi-Source Reasoning"],
  },

  // ============================================
  // TABLE ANALYSIS QUESTIONS (TA)
  // ============================================
  {
    id: "DI-GMAT-SK__-00019",
    question_number: 19,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TA",
      table_title: "Brazilian Agricultural Products in 2009",
      column_headers: [
        "Commodity",
        "Production, world share (%)",
        "Production, world rank",
        "Exports, world share (%)",
        "Exports, world rank",
      ],
      table_data: [
        ["Beef", "16", "2", "22", "1"],
        ["Chickens", "15", "3", "38", "1"],
        ["Coffee", "40", "1", "32", "1"],
        ["Corn", "8", "4", "10", "2"],
        ["Cotton", "5", "5", "10", "4"],
        ["Orange juice", "56", "1", "82", "1"],
        ["Pork", "4", "4", "12", "4"],
        ["Soybeans", "27", "2", "40", "2"],
        ["Sugar", "21", "1", "44", "1"],
      ],
      statements: [
        {
          text: "No individual country produces more than one-fourth of the world's sugar.",
          is_true: true,
        },
        {
          text: "There are countries that export a greater percent of their coffee crops than does Brazil.",
          is_true: false,
        },
        {
          text: "Of the commodities in the table for which Brazil ranks first in world exports, Brazil produces more than 20% of the world's supply.",
          is_true: false,
        },
        {
          text: "If Brazil produces more than 20% of the world's supply of a commodity, it must be the world's top exporter of that commodity.",
          is_true: false,
        },
      ],
      correct_answer: {
        stmt0: "col2",
        stmt1: "col2",
        stmt2: "col2",
        stmt3: "col2",
      },
      answer_col1_title: "Yes",
      answer_col2_title: "No",
      statement_column_title: "Statement",
    } as TAQuestionData,
    answers: generateTAAnswers({
      stmt0: "col2",
      stmt1: "col2",
      stmt2: "col2",
      stmt3: "col2",
    }),
    categories: ["Table Analysis"],
  },
  {
    id: "DI-GMAT-SK__-00022",
    question_number: 22,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TA",
      table_title:
        "Percentage of Population Visiting Selected Cultural Institutions, Single Year",
      column_headers: [
        "Country/political union",
        "Public library",
        "Zoo/aquarium",
        "Natural history museum",
        "Science/technology museum",
      ],
      table_data: [
        ["Russia", "15", "8", "5", "2"],
        ["Brazil", "25", "28", "7", "4"],
        ["European Union", "35", "27", "20", "18"],
        ["South Korea", "35", "37", "30", "10"],
        ["China", "41", "51", "13", "19"],
        ["Japan", "48", "45", "20", "12"],
        ["US", "65", "48", "27", "26"],
      ],
      statements: [
        {
          text: "The proportion of the population of Brazil that lives within close proximity to at least one museum is larger than that of Russia.",
          is_true: true,
        },
        {
          text: "Of the countries/political unions in the table, Russia has the fewest natural history museums per capita.",
          is_true: true,
        },
        {
          text: "Of the countries/political unions in the table, the three that spend the most money to promote their natural history museums are also those in which science is most highly valued.",
          is_true: false,
        },
        {
          text: "Science and technology museums are less popular than other cultural institutions in the majority of the countries/political unions in the table.",
          is_true: true,
        },
      ],
      correct_answer: {
        stmt0: "col1",
        stmt1: "col1",
        stmt2: "col2",
        stmt3: "col1",
      },
      answer_col1_title: "Would help explain",
      answer_col2_title: "Would not help explain",
      statement_column_title: "Statement",
    } as TAQuestionData,
    answers: generateTAAnswers({
      stmt0: "col1",
      stmt1: "col1",
      stmt2: "col2",
      stmt3: "col1",
    }),
    categories: ["Table Analysis"],
  },
];
