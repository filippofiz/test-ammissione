import {
  DataInsightsQuestion,
  DSQuestionData,
  TPAQuestionData,
  MSRQuestionData,
  TAQuestionData,
  GIQuestionData,
  generateDSAnswers,
  generateTPAAnswers,
  generateMSRAnswers,
  generateTAAnswers,
  generateGIAnswers,
} from "../types";

// ============================================
// MULTI-SOURCE REASONING SHARED SOURCES
// ============================================

// Traffic Intersection sources (used by multiple MSR questions)
const MSR_TRAFFIC_INTERSECTION_SOURCES: MSRQuestionData["sources"] = [
  {
    tab_name: "Discussion",
    content_type: "text",
    content:
      "In recent years traffic congestion has become increasingly severe at the intersection of two busy roads, Province Highway and Central Highway. This intersection lies between Weston and Eastburg on Province Highway and between South City and Northville on Central Highway. A stoplight at the intersection controls traffic flow. The stoplight's signals operate on a repeated cycle with fixed timing, always directing traffic to flow according to the following order (there are brief gaps in time between each of the following to ensure that traffic has cleared the intersection):\n\n1. First, all and only the traffic traveling straight along Province Highway, from both directions\n2. Second, all and only the traffic turning left off of Province Highway, from both directions\n3. Third, all and only the traffic traveling straight along Central Highway, from both directions\n4. Fourth, all and only the traffic turning left off of Central Highway, from both directions\n5. Fifth, all and only the traffic turning right off of either highway, in all directions\n\nHighway planners intend to change the timing of the signals for weekdays so that the length of each signal during the cycle is proportional to the number of vehicles passing through the intersection on a typical weekday morning in the directions controlled by that signal.",
  },
  {
    tab_name: "Signal Times",
    content_type: "table",
    table_headers: ["Direction", "Province Highway", "Central Highway"],
    table_data: [
      ["Left turn", "20 seconds", "30 seconds"],
      ["Right turn", "40 seconds", "40 seconds"],
      ["Straight", "60 seconds", "80 seconds"],
    ],
  },
  {
    tab_name: "Traffic Flow",
    content_type: "text",
    content:
      "The diagram below shows the numbers of vehicles traveling in various directions through the intersection on a typical weekday morning. White arrows indicate the directions of traffic flow through the intersection on a typical weekday morning. Black arrows next to the names of towns indicate the direction from the intersection to the towns named. The number of vehicles traveling from a given direction to the intersection is represented by a gray bar, which splits to show how many vehicles turn left, turn right, or continue straight at the intersection.\n\n[See diagram: images/DI-GMAT-PT1_-00007_traffic_flow.png]\n\nFrom Weston: 1,000 left turn, 5,000 straight, 690 right turn\nFrom South City: 2,000 left turn, 3,000 straight, 3,000 right turn\nFrom Northville: 2,200 left turn, 5,000 straight, 1,240 right turn\nFrom Eastburg: 2,400 straight, 5,000 straight, 2,000 right turn",
  },
];

// ============================================
// DATA INSIGHTS QUESTIONS
// ============================================

export const dataInsightsQuestionsPT1: DataInsightsQuestion[] = [
  // ============================================
  // DATA SUFFICIENCY QUESTIONS (DS)
  // ============================================
  {
    id: "DI-GMAT-PT1_-00001",
    question_number: 1,
    section: "Data Insights",
    difficulty: "hard",
    difficultyLevel: 4,
    questionData: {
      di_type: "DS",
      problem:
        "When all the boxes in a warehouse were arranged in stacks of 8, there were 4 boxes left over. If there were more than 80 but fewer than 120 boxes in the warehouse, how many boxes were there?",
      statement1:
        "If all the boxes in the warehouse had been arranged in stacks of 9, there would have been no boxes left over.",
      statement2:
        "If all the boxes in the warehouse had been arranged in stacks of 12, there would have been no boxes left over.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "A",
    } as DSQuestionData,
    answers: generateDSAnswers("A"),
    categories: ["Math Related", "Data Sufficiency"],
  },
  {
    id: "DI-GMAT-PT1_-00002",
    question_number: 2,
    section: "Data Insights",
    difficulty: "hard",
    difficultyLevel: 4,
    questionData: {
      di_type: "DS",
      problem:
        "The 50 participants of a management training seminar ate dinner at a certain restaurant. They had 3 choices for their meal: vegetarian lasagna for $12, blackened catfish for $15, or stuffed pork chops for $18. Each participant ordered exactly 1 meal and the total cost of the meals ordered by the participants was $810. How many participants of the management training seminar ordered blackened catfish?",
      statement1: "Six more people ordered catfish than lasagna.",
      statement2: "Twice as many pork chop meals were ordered as catfish meals.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "D",
    } as DSQuestionData,
    answers: generateDSAnswers("D"),
    categories: ["Math Related", "Data Sufficiency"],
  },
  {
    id: "DI-GMAT-PT1_-00004",
    question_number: 4,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 2,
    questionData: {
      di_type: "DS",
      problem:
        'Two (or more) lines of a poem are said to rhyme when the final word of each line rhymes with the final word of the other line (or lines). Letter sequences, starting with the letter A, are used to describe rhyme schemes in a poem. For example, the rhyme scheme ABAB indicates that the first and third lines rhyme, and that the second and fourth lines rhyme; the rhyme scheme ABAABB indicates that the first, third, and fourth lines rhyme, and that the third, fifth, and sixth lines rhyme. Joe was asked to write a five-line poem with the rhyme scheme *****, where each * is either A or B. If the five-line poem that Joe wrote is such that the first, second, and fifth lines rhyme, and the third and fourth lines rhyme, then did Joe\'s poem have rhyme scheme *****?',
      statement1:
        "The sequence ***** includes two consecutive A's and two consecutive B's.",
      statement2: "In the sequence *****, only the third and fourth letters are B.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "B",
    } as DSQuestionData,
    answers: generateDSAnswers("B"),
    categories: ["Non-Math Related", "Data Sufficiency"],
  },
  {
    id: "DI-GMAT-PT1_-00005",
    question_number: 5,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 2,
    questionData: {
      di_type: "DS",
      problem:
        "The cost of a certain school trip was $16 for each child and $24 for each adult. What was the ratio of the number of children to the number of adults on the trip?",
      statement1:
        "The ratio of the total cost of the trip for all children to the total cost of the trip for all adults was 8 to 3.",
      statement2:
        "The total cost of the trip for all children and adults together was $2,200.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "A",
    } as DSQuestionData,
    answers: generateDSAnswers("A"),
    categories: ["Math Related", "Data Sufficiency"],
  },
  {
    id: "DI-GMAT-PT1_-00006",
    question_number: 6,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 2,
    questionData: {
      di_type: "DS",
      problem:
        "A gourmet cheese shop sold several orders of English Stilton and Spanish Manchego yesterday. Customer A purchased 15 pounds of English Stilton and 3.75 pounds of Spanish Manchego for a total of $438.00. If the price for each of these cheeses is proportional to its weight, what is the price of 1 pound of Spanish Manchego?",
      statement1:
        "Customer B purchased 5 pounds of English Stilton and 4 pounds of Spanish Manchego for a total of $214.75.",
      statement2:
        "Customer C purchased 6 pounds of English Stilton and 1.5 pounds of Spanish Manchego for a total of $175.20.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "A",
    } as DSQuestionData,
    answers: generateDSAnswers("A"),
    categories: ["Math Related", "Data Sufficiency"],
  },
  {
    id: "DI-GMAT-PT1_-00011",
    question_number: 11,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      di_type: "DS",
      problem:
        "The velocity, V feet per second, of a model rocket t seconds after launch is given by V = -32t + C, where C is a positive constant. What is the velocity of the rocket 2 seconds after it was launched?",
      statement1:
        "The rocket reaches its maximum height and begins descending 1.5 seconds after it was launched.",
      statement2: "The rocket's initial velocity was 48 feet per second.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "D",
    } as DSQuestionData,
    answers: generateDSAnswers("D"),
    categories: ["Math Related", "Data Sufficiency"],
  },
  {
    id: "DI-GMAT-PT1_-00012",
    question_number: 12,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "DS",
      problem:
        "Jan and 5 of his friends sold candy bars to raise money for their school trip. Jan sold 20 bars and each of his 5 friends sold at least one bar. Did Jan sell more candy bars than each of at least 3 of his friends?",
      statement1: "The median of the number of bars sold by Jan's 5 friends is 18.",
      statement2:
        "The average (arithmetic mean) of the number of bars sold by Jan's 5 friends is 12.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "D",
    } as DSQuestionData,
    answers: generateDSAnswers("D"),
    categories: ["Math Related", "Data Sufficiency"],
  },
  {
    id: "DI-GMAT-PT1_-00016",
    question_number: 16,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      di_type: "DS",
      problem:
        "Of the apartments in a certain building, 75 have a balcony, 80 have a fireplace, and 30 have neither a balcony nor a fireplace. How many of the apartments in the building that have a balcony do not have a fireplace?",
      statement1: "There is a total of 150 apartments in the building.",
      statement2:
        "35 of the apartments in the building that have a balcony also have a fireplace.",
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },
      correct_answer: "D",
    } as DSQuestionData,
    answers: generateDSAnswers("D"),
    categories: ["Math Related", "Data Sufficiency"],
  },

  // ============================================
  // TABLE ANALYSIS QUESTIONS (TA)
  // ============================================
  {
    id: "DI-GMAT-PT1_-00003",
    question_number: 3,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TA",
      table_title: "Top 10 Songs Ranked During Week W",
      column_headers: [
        "Week W rank",
        "Song",
        "Previous week's rank",
        "Weeks in top 20",
        "Peak rank",
      ],
      table_data: [
        ["1", "A", "1", "4", "1"],
        ["2", "B", "2", "10", "1"],
        ["3", "C", "6", "3", "3"],
        ["4", "D", "4", "6", "4"],
        ["5", "E", "3", "11", "1"],
        ["6", "F", "n/a", "1", "6"],
        ["7", "G", "5", "9", "3"],
        ["8", "H", "10", "3", "8"],
        ["9", "I", "12", "5", "9"],
        ["10", "J", "13", "2", "10"],
      ],
      stimulus_text: "For a certain radio station in India, the table shows the songs ranked among the top 10 during Week W. The rankings are determined by the number of listener requests for each song, with rank 1 being the most requested, rank 2 the second- most requested, and so on. Lesser numbers constitute higher rankings. The table also gives, as of Week W, each song's rank for the previous week, the number of weeks it has been among the top 20, and its peak rank (the highest ranking it has achieved). In the column for Previous week's rank, \"n/a\" indicates that the song was not ranked in the week immediately prior to Week W.",
      statements: [
        {
          text: "How many of the top 5 songs for Week W had a higher rank for Week W than they did for the previous week?",
          is_true: true,
        },
        {
          text: "How many of the top 10 songs for Week W were not among the top 10 in the previous week?",
          is_true: true,
        },
        {
          text: "How many of the top 10 songs for the week immediately prior to Week W have ever been at ranking 1?",
          is_true: false,
        },
      ],
      correct_answer: {
        stmt0: "col1",
        stmt1: "col1",
        stmt2: "col2",
      },
      answer_col1_title: "Can be answered",
      answer_col2_title: "Cannot be answered",
      statement_column_title: "Question",
    } as TAQuestionData,
    answers: generateTAAnswers({
      stmt0: "col2",
      stmt1: "col1",
      stmt2: "col2",
    }),
    categories: ["Non-Math Related", "Graphs and Tables"],
  },
  {
    id: "DI-GMAT-PT1_-00010",
    question_number: 10,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TA",
      table_title: "Airline Flight Delays by Time Range (Percent of Flights)",
      column_headers: [
        "Airline",
        "1 to 15",
        "16 to 30",
        "31 to 45",
        "46 to 60",
        "More than 60",
        "Total delays",
      ],
      table_data: [
        ["1", "8.5%", "6.5%", "5.8%", "2.1%", "1.6%", "24.5%"],
        ["2", "9.2%", "6.9%", "4.9%", "2.4%", "2.8%", "26.2%"],
        ["3", "7.5%", "7.1%", "4.5%", "2.2%", "1.7%", "23.0%"],
        ["4", "6.3%", "4.8%", "5.0%", "1.7%", "2.5%", "20.3%"],
        ["5", "8.8%", "5.9%", "7.1%", "1.9%", "1.2%", "24.9%"],
      ],
      stimulus_text: "For each of 5 airlines (Airlines 1 through 5), the table shows the percent of flights offered by that airline last year that were delayed by certain ranges of time to the nearest minute and the total percent of flights offered by that airline last year that were delayed. The airlines are numbered from greatest total number of flights offered last year (Airline 1) to least total number of flights offered last year (Airline 5).",
      statements: [
        {
          text: "Airline 2 had the greatest number of flights last year that were delayed by 1 to 15 minutes, to the nearest minute.",
          is_true: false,
        },
        {
          text: "Airline 5 had the least number of flights last year that were delayed by more than 60 minutes, to the nearest minute.",
          is_true: true,
        },
        {
          text: "Airline 3 did NOT have the least number of total delayed flights last year.",
          is_true: false,
        },
      ],
      correct_answer: {
        stmt0: "col2",
        stmt1: "col1",
        stmt2: "col2",
      },
      answer_col1_title: "Must be true",
      answer_col2_title: "Need not be true",
      statement_column_title: "Statement",
    } as TAQuestionData,
    answers: generateTAAnswers({
      stmt0: "col2",
      stmt1: "col1",
      stmt2: "col2",
    }),
    categories: ["Math Related", "Graphs and Tables"],
  },

  // ============================================
  // MULTI-SOURCE REASONING QUESTIONS (MSR)
  // ============================================
  {
    id: "DI-GMAT-PT1_-00007",
    question_number: 7,
    section: "Data Insights",
    difficulty: "hard",
    difficultyLevel: 4,
    questionData: {
      di_type: "MSR",
      sources: MSR_TRAFFIC_INTERSECTION_SOURCES,
      questions: [
        {
          text: "Based on the information provided, what fraction of the number of vehicles on typical weekday mornings, passing through the intersection from Weston, passes through the intersection during the current 20-second-long stoplight signals?",
          options: {
            a: "23/233",
            b: "5/23",
            c: "11/46",
            d: "55/211",
            e: "25/72",
          },
          question_type: "multiple_choice",
          correct_answer: "c",
        },
      ],
    } as MSRQuestionData,
    answers: generateMSRAnswers(["c"]),
    categories: ["Math Related", "Multi-Source Reasoning"],
  },
  {
    id: "DI-GMAT-PT1_-00008",
    question_number: 8,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      di_type: "MSR",
      sources: MSR_TRAFFIC_INTERSECTION_SOURCES,
      questions: [
        {
          text: "1,000: Is this the number of vehicles passing through the intersection from one specific direction during the current 40-second signals on a typical weekday morning?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
        {
          text: "2,000: Is this the number of vehicles passing through the intersection from one specific direction during the current 40-second signals on a typical weekday morning?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
        {
          text: "3,000: Is this the number of vehicles passing through the intersection from one specific direction during the current 40-second signals on a typical weekday morning?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "b",
        },
      ],
    } as MSRQuestionData,
    answers: generateMSRAnswers(["a", "a", "b"]),
    categories: ["Non-Math Related", "Multi-Source Reasoning"],
  },
  {
    id: "DI-GMAT-PT1_-00009",
    question_number: 9,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      di_type: "MSR",
      sources: MSR_TRAFFIC_INTERSECTION_SOURCES,
      questions: [
        {
          text: "The number of vehicles passing straight through the intersection on Central Highway on a typical weekday morning: Can this be deduced from the information provided?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
        {
          text: "The current duration in seconds, including gaps, of one full cycle on the stoplight's signals: Can this be deduced from the information provided?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "b",
        },
        {
          text: "The percent of the vehicles passing through the intersection on a typical weekday morning that turn left off of Province Highway, from both directions: Can this be deduced from the information provided?",
          options: { a: "Yes", b: "No" },
          question_type: "multiple_choice",
          correct_answer: "a",
        },
      ],
    } as MSRQuestionData,
    answers: generateMSRAnswers(["a", "b", "a"]),
    categories: ["Math Related", "Multi-Source Reasoning"],
  },

  // ============================================
  // GRAPHICS INTERPRETATION QUESTIONS (GI)
  // ============================================
  {
    id: "DI-GMAT-PT1_-00013",
    question_number: 13,
    section: "Data Insights",
    difficulty: "hard",
    difficultyLevel: 4,
    questionData: {
      di_type: "GI",
      chart_config: {
        type: "line",
        title: "Total World Credit Market Debt",
        labels: [
          "1972",
          "1977",
          "1982",
          "1987",
          "1992",
          "1997",
          "2002",
          "2007",
        ],
        datasets: [
          {
            label: "TWCMD",
            data: [3, 5, 8, 12, 18, 25, 35, 45],
            color: "#3b82f6",
          },
        ],
        x_axis_label: "Year",
        y_axis_label: "US$ (trillions)",
      },
      context_text:
        "A line graph showing Total World Credit Market Debt from 1972 to 2007. The y-axis shows US$ (trillions) from 5 to 45, and the x-axis shows years from 1972 to 2007 in 5-year intervals. The curve shows exponential growth, starting around 3 trillion in 1972 and reaching approximately 45 trillion by 2007.\n\nFor the years 1972–2007, Total World Credit Market Debt (TWCMD), as measured in trillions of US dollars, is accurately modeled by the equation y = N · 2^(k(t - 1972)), whose graph is given. Here, N and k are positive constants and t denotes the year.",
      statement_text:
        "The constant N is approximately equal to [BLANK1]. If the model continues to be accurate beyond 2007, the TWCMD will equal approximately double the 2007 value in the year [BLANK2].",
      blank1_options: ["1", "2", "3", "4", "5"],
      blank1_correct: "3",
      blank2_options: ["2012", "2014", "2016", "2018", "2020"],
      blank2_correct: "2016",
    } as GIQuestionData,
    answers: generateGIAnswers("3", "2016"),
    categories: ["Math Related", "Graphs and Tables"],
  },
  {
    id: "DI-GMAT-PT1_-00014",
    question_number: 14,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      di_type: "GI",
      chart_config: {
        type: "bar",
        title: "Number of Vehicles Entering and Exiting an Intersection by Direction",
        labels: [
          "north→east",
          "north→south",
          "north→west",
          "east→north",
          "east→south",
          "east→west",
          "south→north",
          "south→east",
          "south→west",
          "west→north",
          "west→east",
          "west→south",
        ],
        datasets: [
          {
            label: "Vehicles",
            data: [65, 80, 70, 45, 40, 55, 95, 85, 65, 25, 85, 20],
            color: "#3b82f6",
          },
        ],
        x_axis_label: "Trajectory",
        y_axis_label: "Number of vehicles",
      },
      context_text:
        "A horizontal bar chart showing 'Number of Vehicles Entering and Exiting an Intersection by Direction'. The chart has 12 bars representing different trajectory combinations (from direction → to direction). In order to better control traffic at a certain busy intersection, a study was conducted to determine how many vehicles passed through the intersection during various times of day and what trajectories they took.",
      statement_text:
        "During the hour, the greatest number of vehicles entered the intersection from the [BLANK1], and among those vehicles entering the intersection from that direction, the greatest number of vehicles exited the intersection to the [BLANK2].",
      blank1_options: ["north", "east", "south", "west"],
      blank1_correct: "south",
      blank2_options: ["north", "east", "south", "west"],
      blank2_correct: "north",
    } as GIQuestionData,
    answers: generateGIAnswers("south", "north"),
    categories: ["Non-Math Related", "Graphs and Tables"],
  },
  {
    id: "DI-GMAT-PT1_-00015",
    question_number: 15,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 2,
    questionData: {
      di_type: "GI",
      chart_config: {
        type: "bar",
        title: "Temperature Deviations from the Daily Expected High Temperature",
        labels: ["-12", "-8", "-4", "0", "4", "8", "12"],
        datasets: [
          {
            label: "Number of deviations",
            data: [2, 12, 18, 34, 16, 15, 3],
            color: "#3b82f6",
          },
        ],
        x_axis_label: "Center of deviation class (degrees F)",
        y_axis_label: "Number of deviations",
      },
      context_text:
        "A histogram showing 'Temperature Deviations from the Daily Expected High Temperature'. The x-axis shows 'center of deviation class (degrees F)' from -16 to 16, and the y-axis shows 'number of deviations' from 0 to 40. For a given city, the graph represents the daily deviation, in degrees Fahrenheit (°F), of the high temperature from the expected high temperature for each day in a 100-day period. Data is grouped into disjoint classes of deviations: for each value of T marked on the horizontal axis, the class centered at T includes all observed deviations greater than or equal to (T - 2)°F but less than (T + 2)°F. A given day's high temperature is x°F less than seasonal if it is x°F less than the left endpoint of the class centered at 0, and the high temperature is x°F greater than seasonal if it is x°F greater than the right endpoint of the class centered at 0.",
      statement_text:
        "For a randomly selected day in this 100-day period, the probability that the high temperature was more than 4°F less than seasonal is [BLANK1] and the probability that the high temperature was more than 8°F less than seasonal is [BLANK2].",
      blank1_options: ["0.02", "0.12", "0.14", "0.32", "0.34"],
      blank1_correct: "0.14",
      blank2_options: ["0.02", "0.12", "0.14", "0.32", "0.34"],
      blank2_correct: "0.02",
    } as GIQuestionData,
    answers: generateGIAnswers("0.14", "0.02"),
    categories: ["Math Related", "Graphs and Tables"],
  },

  // ============================================
  // TWO-PART ANALYSIS QUESTIONS (TPA)
  // ============================================
  {
    id: "DI-GMAT-PT1_-00017",
    question_number: 17,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TPA",
      scenario:
        "Agro Enterprises currently uses an antiquated database system. Upgrading to a standard contemporary system would cost a moderate amount, whereas upgrading to an innovative, cutting-edge system would cost much more. A standard contemporary system is sufficiently energy-efficient that it would pay for itself in 10 years, but no sooner, as compared to the cost of keeping the current system. The annual savings in operational costs offered by the innovative system would cause such a system to pay for its purchase and installation in 5 years, but it would be no more energy-efficient than the current system. Or the company could just keep the current system. Any of the three systems would be able to function for the next 20 years.\n\nSelect Standard contemporary system for the option that the passage most strongly suggests is true of the standard contemporary system, and select Innovative, cutting-edge system for the option that the passage most strongly suggests is true of the innovative cutting-edge system. Make only two selections, one in each column.",
      column1_title: "Standard contemporary system",
      column2_title: "Innovative, cutting-edge system",
      shared_options: [
        "Costs Agro the greatest total amount of money during 11 years of operation",
        "Less energy-efficient than either of the other two database systems",
        "The most energy-efficient of the three database systems",
        "Costs Agro, on average, less per year to operate than either of the other systems",
        "Costs Agro, on average, more per year to operate than either of the other systems",
      ],
      correct_answers: {
        col1: "The most energy-efficient of the three database systems",
        col2: "Costs Agro, on average, less per year to operate than either of the other systems",
      },
      statement_title: "Statement",
    } as TPAQuestionData,
    answers: generateTPAAnswers(
      "The most energy-efficient of the three database systems",
      "Costs Agro, on average, less per year to operate than either of the other systems"
    ),
    categories: ["Math Related", "Two-Part Analysis"],
  },
  {
    id: "DI-GMAT-PT1_-00018",
    question_number: 18,
    section: "Data Insights",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      di_type: "TPA",
      scenario:
        "Administrator P: Government-funded research should always be accessible to the public. A certain government fund is designed to support research in the humanities and natural sciences. Therefore, the fund should have a requirement that all published work that it supports be open access (i.e., provided free of charge, with no restrictions, to people with Internet access).\n\nAdministrator Q: There are many high-quality, open-access venues for published works in the natural sciences, but very few in the humanities. The requirement would most likely have bad results. That is, most of the fund would be directed toward research in natural science and it would prevent a significant amount of fund-supported, humanities research from being published in high-quality venues.\n\nFrom among the options below, select for Response to Administrator Q and for Reply to that response two statements such that the first, if true, most strongly undermines Administrator Q's argument and the second, if true, is Administrator Q's strongest reply to that response. Make only two selections, one in each column.",
      column1_title: "Response to Administrator Q",
      column2_title: "Reply to that response",
      shared_options: [
        "Although it may result in decreased support for research in certain disciplines, government-funded research should not be accessible to the public.",
        "The humanities are unlikely to develop high-quality open-access journals, even if resources are dedicated to supporting them.",
        "If research were open access, more individuals would read the research than would read it otherwise.",
        "In general, requiring that research be published in open-access journals will likely result in new open-access journals in the field.",
        "For some disciplines, open-access journals tend to be of lower quality than other journals.",
      ],
      correct_answers: {
        col1: "In general, requiring that research be published in open-access journals will likely result in new open-access journals in the field.",
        col2: "For some disciplines, open-access journals tend to be of lower quality than other journals.",
      },
      statement_title: "Statement",
    } as TPAQuestionData,
    answers: generateTPAAnswers(
      "In general, requiring that research be published in open-access journals will likely result in new open-access journals in the field.",
      "For some disciplines, open-access journals tend to be of lower quality than other journals."
    ),
    categories: ["Non-Math Related", "Two-Part Analysis"],
  },
  {
    id: "DI-GMAT-PT1_-00019",
    question_number: 19,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      di_type: "TPA",
      scenario:
        "Art historian: Unlike many artistic traditions that sought to depict plants native to the local area in a seasonally appropriate way (for example, depicting scenes of spring with the plants in the appropriate stages of development for that season), seventeenth-century Dutch artists specializing in flower paintings almost exclusively chose to depict exotic species of flowers from outside the local area. Painting such species was worthwhile primarily because the art-buying public had developed a strong preference for images of the exotic. The great botanical centers of the time gave the artists direct access to such flowers, which the artists would freely combine in a single painting, regardless of whether the combined species occurred together in the wild, and depicted each in full bloom, regardless of whether those species bloomed at the same time in nature.\n\nStatement: The art historian makes the point that the species of flowers these Dutch artists chose to paint were ___1___ largely because the species were ___2___.\n\nSelect for 1 and for 2 the options that complete the statement so that it is most strongly supported by the information provided. Make only two selections, one in each column.",
      column1_title: "1",
      column2_title: "2",
      shared_options: [
        "native to the local area",
        "seasonally appropriate",
        "exotic",
        "accessible",
        "worth painting",
      ],
      correct_answers: {
        col1: "worth painting",
        col2: "exotic",
      },
      statement_title: "Option",
    } as TPAQuestionData,
    answers: generateTPAAnswers("worth painting", "exotic"),
    categories: ["Non-Math Related", "Two-Part Analysis"],
  },
  {
    id: "DI-GMAT-PT1_-00020",
    question_number: 20,
    section: "Data Insights",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      di_type: "TPA",
      scenario:
        "A certain assistant professor in the Art History department at University X is being evaluated for promotion. One of the requirements is a performance score of at least 4.0. The performance score is the weighted average of 3 component scores: one for research, one for teaching, and one for service, with the scores for research and teaching each weighted 40% and the score for service weighted 20%. Each component score is between 0.0 and 5.0, inclusive.\n\nConsistent with the given information, select for Minimum service score the least possible score the professor can receive for service and still achieve a performance score of at least 4.0, and select for Minimum research score the least possible score the professor can receive for research and still achieve a performance score of at least 4.0. Make only two selections, one in each column.",
      column1_title: "Minimum service score",
      column2_title: "Minimum research score",
      shared_options: ["0.0", "0.5", "1.0", "1.5", "2.0", "2.5"],
      correct_answers: {
        col1: "0.5",
        col2: "2.0",
      },
      statement_title: "Score",
    } as TPAQuestionData,
    answers: generateTPAAnswers("0.5", "2.0"),
    categories: ["Math Related", "Two-Part Analysis"],
  },
];
