import {
  QuantitativeReasoningQuestion,
  QRQuestionData,
  generateMCAnswers,
} from "../types";

export const quantitativeReasoningQuestionsPQ: QuantitativeReasoningQuestion[] = [
  {
    id: "QR-GMAT-PQ__-00001",
    question_number: 1,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text: "6.2 is what percent of 1,000?",
      options: {
        a: "62%",
        b: "6.2%",
        c: "0.62%",
        d: "0.062%",
        e: "0.0062%",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "Let 6.2 be $x$% of 1,000. Then, $6.2 = \\frac{x}{100}(1,000)$, which simplifies to $6.2 = 10x$, so $x = 0.62$. Therefore, 6.2 is 0.62% of 1,000. The correct answer is C.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-PQ__-00002",
    question_number: 2,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "An association of mathematics teachers has 1,260 members. Only 525 of these members cast votes in the election for president of the association. What percent of the total membership voted for the winning candidate if the winning candidate received 60 percent of the votes cast?",
      options: {
        a: "75%",
        b: "58%",
        c: "42%",
        d: "34%",
        e: "25%",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "The number of votes cast for the winning candidate was 60% of 525, or $\\frac{3}{5}(525) = 3(105) = 315$, which represents $\\left(\\frac{315}{1,260} \\times 100\\right)\\% = \\left(\\frac{1}{4} \\times 100\\right)\\% = 25\\%$ of the total membership. The correct answer is E.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-PQ__-00003",
    question_number: 3,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "If a company allocates 15 percent of its budget to advertising, 10 percent to capital improvements, and 55 percent to salaries, what fraction of its budget remains for other allocations?",
      options: {
        a: "$\\frac{4}{5}$",
        b: "$\\frac{3}{5}$",
        c: "$\\frac{3}{10}$",
        d: "$\\frac{1}{5}$",
        e: "$\\frac{1}{10}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "If $B$ represents the budget of the company, then the company allocates 15% of $B$ to advertising, 10% to capital improvements, and 55% to salaries. The amount left for other allocations is $[100 - (15 - 10 - 55)]\\%$ of $B$ or 20% of $B$. As a fraction, 20% of $B$ is $\\frac{20}{100}$ of $B$, or $\\frac{1}{5}$ of $B$. Thus, the fraction of the budget left for other allocations is $\\frac{1}{5}$. The correct answer is D.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-PQ__-00004",
    question_number: 4,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "The integers $q$, $r$, $s$, $t$, and $u$ are positive. If $t > q$, $u > r$, $s > t$, and $r > s$, what is the median of the five integers?",
      options: {
        a: "$q$",
        b: "$r$",
        c: "$s$",
        d: "$t$",
        e: "$u$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "For positive integers $q$, $r$, $s$, $t$, and $u$, if $t > q$, $u > r$, $s > t$, and $r > s$, then by rearranging the inequalities it follows that $u > r$, $r > s$, $s > t$, and $t > q$, and so $u > r > s > t > q$. Therefore, the 5 integers $q$, $r$, $s$, $t$, and $u$, in order from greatest to least are $u$, $r$, $s$, $t$, and $q$, and the median of these 5 integers—the middle integer—is $s$. The correct answer is C.",
    categories: ["Arithmetic", "Statistics"],
  },
  {
    id: "QR-GMAT-PQ__-00005",
    question_number: 5,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "At a certain committee meeting, only associate professors and assistant professors are present. Each associate professor has brought 2 pencils and 1 chart to the meeting, while each assistant professor has brought 1 pencil and 2 charts. If a total of 10 pencils and 11 charts have been brought to the meeting, how many people are present?",
      options: {
        a: "6",
        b: "7",
        c: "8",
        d: "9",
        e: "10",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "Let $x$ be the number of associate professors and $y$ be the number of assistant professors. Then $2x + y = 10$, because a total of 10 pencils were brought to the meeting; and $x + 2y = 11$, because a total of 11 charts were brought to the meeting. Adding these two equations gives $3x + 3y = 21$, or $3(x + y) = 21$, or $x + y = 7$. Therefore, a total of 7 people were present. The correct answer is B.",
    categories: ["Algebra", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00006",
    question_number: 6,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "If $x = 2u$, then the average (arithmetic mean) of $x$ and $u$, in terms of $u$, is",
      options: {
        a: "$\\frac{u}{3}$",
        b: "$\\frac{u}{2}$",
        c: "$\\frac{2u}{3}$",
        d: "$\\frac{3u}{4}$",
        e: "$\\frac{3u}{2}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "In terms of $u$, the average of $x$ and $u$ is $\\frac{x+u}{2} = \\frac{2u+u}{2} = \\frac{3u}{2}$. The correct answer is E.",
    categories: ["Algebra", "Statistics"],
  },
  {
    id: "QR-GMAT-PQ__-00007",
    question_number: 7,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text: "Which of the following is equal to $10^{-(-3)^2}$?",
      options: {
        a: "$\\frac{1}{10^9}$",
        b: "$\\frac{1}{10^6}$",
        c: "$\\frac{1}{10^3}$",
        d: "$10^6$",
        e: "$10^9$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "$10^{-(-3)^2} = 10^{-9} = \\frac{1}{10^9}$. The correct answer is A.",
    categories: ["Arithmetic", "Properties of numbers"],
  },
  {
    id: "QR-GMAT-PQ__-00008",
    question_number: 8,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "A salesperson for an automobile dealer earns an annual salary of $25,000 plus a commission of 10 percent of the salesperson's sales over $100,000. If $x$ is the dollar amount of sales in a certain year and $x$ is greater than 100,000, which of the following expresses the salesperson's total earnings, in dollars, for the year?",
      options: {
        a: "$25,000 + 0.1x$",
        b: "$35,000 + 0.1x$",
        c: "$125,000 + 0.1x$",
        d: "$25,000 + 0.1(100,000 - x)$",
        e: "$25,000 + 0.1(x - 100,000)$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "In dollars, the salesperson's commission for selling $x$ during the year, where $x > 100,000$, is 10% of $x - 100,000$, or $(0.1)(x - 100,000)$. Therefore, the salesperson's total earnings for that year, in dollars, is $25,000 + (0.1)(x - 100,000)$. The correct answer is E.",
    categories: ["Algebra", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00009",
    question_number: 9,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "If $x \\neq -1$, then $\\frac{1-x^{16}}{(1+x)(1+x^2)(1+x^4)(1+x^8)}$ is equal to",
      options: {
        a: "$-1$",
        b: "$1$",
        c: "$x$",
        d: "$1 - x$",
        e: "$x - 1$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "For each positive integer $n$, $(1 - x^{2n})$ is the difference of two squares and can be factored as $(1 + x^n)(1 - x^n)$. Using this property four times, $1 - x^{16}$ can be factored as follows: $(1 - x^{16}) = (1 + x^8)(1 - x^8) = (1 + x^8)(1 + x^4)(1 - x^4) = (1 + x^8)(1 + x^4)(1 + x^2)(1 - x^2) = (1 + x^8)(1 + x^4)(1 + x^2)(1 + x)(1 - x)$. Therefore, by canceling the common factors $(1 + x^8)$, $(1 + x^4)$, $(1 + x^2)$, and $(1 + x)$, the expression becomes $\\frac{1-x}{1} = 1 - x$. The correct answer is D.",
    categories: ["Algebra", "Simplifying algebraic expressions"],
  },
  {
    id: "QR-GMAT-PQ__-00010",
    question_number: 10,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "A certain bakery made 3 shipments of 100 doughnuts each. If 17 percent of the first shipment and 40 percent of the second shipment consisted of jelly doughnuts and 30 percent of all three shipments combined consisted of jelly doughnuts, then what percent of the third shipment consisted of jelly doughnuts?",
      options: {
        a: "21%",
        b: "27%",
        c: "30%",
        d: "33%",
        e: "41%",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "It is given that 17% of the first shipment of 100 doughnuts consisted of jelly doughnuts and so the first shipment contained 17 jelly doughnuts. Since 40% of the second shipment consisted of jelly doughnuts, the second shipment contained 40 jelly doughnuts. Also, 30% of all three shipments combined consisted of jelly doughnuts so all three shipments combined contained $(0.3)(100 + 100 + 100) = 90$ jelly doughnuts. It follows that the third shipment contained $90 - (17 + 40) = 33$ jelly doughnuts, which is 33% of the 100 doughnuts in the third shipment. The correct answer is D.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-PQ__-00011",
    question_number: 11,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "If $3^{m+n} = 27$ and $3^{m-n} = \\frac{1}{3}$, then $\\frac{m}{n} =$",
      options: {
        a: "$\\frac{1}{5}$",
        b: "$\\frac{1}{4}$",
        c: "$\\frac{1}{2}$",
        d: "$1$",
        e: "$2$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "From $3^{m+n} = 27 = 3^3$, it follows that $m + n = 3$, and from $3^{m-n} = \\frac{1}{3} = 3^{-1}$, it follows that $m - n = -1$. Adding equation $m - n = -1$ to equation $m + n = 3$ gives $2m = 2$, or $m = 1$. Using $m = 1$ and $m + n = 3$ gives $1 + n = 3$, or $n = 2$. Therefore, $\\frac{m}{n} = \\frac{1}{2}$. The correct answer is C.",
    categories: ["Algebra", "Equations"],
  },
  {
    id: "QR-GMAT-PQ__-00012",
    question_number: 12,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "Virginia, Adrienne, and Dennis have taught history for a combined total of 96 years. If Virginia has taught for 9 more years than Adrienne and for 9 fewer years than Dennis, for how many years has Dennis taught?",
      options: {
        a: "23",
        b: "32",
        c: "35",
        d: "41",
        e: "44",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "Let $V$, $A$, and $D$ be the numbers of years, respectively, that Virginia, Adrienne, and Dennis have taught history. Then we are given the following: $V + A + D = 96$, $V = A + 9$, $V = D - 9$. From the last two equations we can solve for $A$ and $D$ in terms of $V$ to get $A = V - 9$ and $D = V + 9$. Substituting these two expressions for $A$ and $D$ into the first equation gives $V + (V - 9) + (V + 9) = 96$, or $3V = 96$, so $V = 32$. Therefore, Dennis taught for $D = V + 9 = 32 + 9 = 41$ years. The correct answer is D.",
    categories: ["Algebra", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00013",
    question_number: 13,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "A camera lens filter kit containing 5 filters sells for $57.50. If the filters are purchased individually, 2 of them are priced at $10.45 each, 2 at $12.05 each, and 1 at $17.50. The amount saved by purchasing the kit is what percent of the total price of the 5 filters purchased individually?",
      options: {
        a: "7%",
        b: "8%",
        c: "$8\\frac{1}{2}$%",
        d: "10%",
        e: "11%",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "The total price of the 5 filters when purchased individually is $2(\\$10.45) + 2(\\$12.05) + \\$17.50 = \\$62.50$. When the 5 filters are purchased in a kit, the price is $57.50. The amount saved by purchasing the kit is the difference in these two prices or $\\$62.50 - \\$57.50 = \\$5.00$. As a percent of the total price of purchasing the 5 filters individually, the amount saved is $\\left(\\frac{\\$5.00}{\\$62.50} \\times 100\\right)\\% = 8\\%$. The correct answer is B.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-PQ__-00014",
    question_number: 14,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "If $3x + 2y = 7$ and $2x - y = 7$, what is the value of $x$?",
      options: {
        a: "0",
        b: "1",
        c: "$\\frac{7}{5}$",
        d: "$\\frac{21}{11}$",
        e: "3",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Given $3x + 2y = 7$ and $2x - y = 7$, adding twice the second equation to the first equation gives $7x = 21$, and then $x = 3$. The correct answer is E.",
    categories: ["Algebra", "Equations"],
  },
  {
    id: "QR-GMAT-PQ__-00015",
    question_number: 15,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "At the beginning of each year, the price of item X is 10 percent higher than its price at the beginning of the previous year. During three consecutive years, if the price of item X is $8 at the beginning of the first year, what is its price at the beginning of the third year?",
      options: {
        a: "$8.80",
        b: "$9.60",
        c: "$9.68",
        d: "$10.00",
        e: "$16.00",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "If the price of Item X at the beginning of the first year was $8.00 and the price increased by 10%. Then the price of Item X at the beginning of the second year was $(1.1)(\\$8.00)$. Likewise, if $(1.1)(\\$8.00)$ was the price of Item X at the beginning of the second year and the price increased by 10%, then the price at the beginning of the third year was $(1.1)(1.1)(\\$8.00) = \\$9.68$. The correct answer is C.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-PQ__-00016",
    question_number: 16,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "If a town of 25,000 people is growing at a rate of approximately 1 percent per year, the population of the town in 5 years will be closest to",
      options: {
        a: "26,000",
        b: "27,000",
        c: "28,000",
        d: "29,000",
        e: "30,000",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "After 5 years of approximately 1% yearly growth, compounded yearly, the population will be approximately $25,000\\left(1 + \\frac{1}{100}\\right)^5$. To estimate this value, note that $(1.01)^2 = 1.0201$ is very nearly 1.02, so $(1.01)^4 = [(1.01)^2]^2$ is very nearly $(1.02)^2 = 1.0404$, or very nearly 1.04, and hence $(1.01)^5$ is very nearly $(1.04)(1.01) = 1.0504$, which is very nearly 1.05. Therefore, $25,000\\left(1 + \\frac{1}{100}\\right)^5$ is very nearly $25,000(1.05) = 25,000\\left(1 + \\frac{5}{100}\\right) = 25,000 + 1,250 = 26,250 \\approx 26,000$. The correct answer is A.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-PQ__-00017",
    question_number: 17,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "If Henry were to add 5 gallons of water to a tank that is already $\\frac{3}{4}$ full of water, the tank would be $\\frac{7}{8}$ full. How many gallons of water would the tank hold if it were full?",
      options: {
        a: "25",
        b: "40",
        c: "64",
        d: "80",
        e: "96",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "If $g$ is the number of gallons the tank would hold if it were full, then $5 + \\frac{3}{4}g = \\frac{7}{8}g$, which simplifies to $5 = \\frac{1}{8}g$, so $40 = g$. The correct answer is B.",
    categories: ["Algebra", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00018",
    question_number: 18,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "Three friends rented a car for a week and divided the cost equally. If a fourth friend had joined them and the cost had been divided equally among the 4 friends, then the cost to each of the original 3 friends would have been reduced by $15. What was the total cost of renting the car?",
      options: {
        a: "$60",
        b: "$100",
        c: "$140",
        d: "$160",
        e: "$180",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Let $C$ be the total cost, in dollars, of renting the car for a week. If the total cost were equally shared among 3 people, then the cost for each person would be $\\frac{C}{3}$. Also, if the total cost were equally shared among 4 people, then the cost for each person would be $\\frac{C}{4}$. It is given that $\\frac{C}{4} = \\frac{C}{3} - 15$. Multiplying both sides of this equation by 12 gives $3C = 4C - 180$, or $C = 180$. The correct answer is E.",
    categories: ["Algebra", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00019",
    question_number: 19,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "If the sum of four consecutive integers is 66, what is the greatest of these integers?",
      options: {
        a: "14",
        b: "15",
        c: "16",
        d: "17",
        e: "18",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Let $n$ be the least of the four consecutive integers. The four consecutive integers are $n$, $n + 1$, $n + 2$ and $n + 3$. The sum of the four consecutive integers is $4n + 6$. Thus, $4n + 6 = 66$, from which it follows that $4n = 60$ and $n = 15$. Therefore, the greatest of the integers is $n + 3 = 18$. The correct answer is E.",
    categories: ["Algebra", "Equations"],
  },
  {
    id: "QR-GMAT-PQ__-00020",
    question_number: 20,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text: "If $6x + 5 = 4x + 3$, then $x = ?$",
      options: {
        a: "5",
        b: "4",
        c: "$-1$",
        d: "$-2$",
        e: "$-3$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "$6x + 5 = 4x + 3$ (given). $2x + 5 = 3$ (subtract $4x$ from both sides). $2x = -2$ (subtract 5 from both sides). $x = -1$ (divide both sides by 2). The correct answer is C.",
    categories: ["Algebra", "Equations"],
  },
  {
    id: "QR-GMAT-PQ__-00021",
    question_number: 21,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text: "Which of the following is 30 percent of $\\frac{1}{5}$?",
      options: {
        a: "0.06",
        b: "0.15",
        c: "0.16",
        d: "0.35",
        e: "0.60",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "30% of $\\frac{1}{5} = (0.3)(0.2) = 0.06$. The correct answer is A.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-PQ__-00022",
    question_number: 22,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "If the population of a certain country is 120,256,000 and its land area is 2,998,000 square kilometers, then the population per square kilometer is closest to which of the following?",
      options: {
        a: "4",
        b: "6",
        c: "20",
        d: "40",
        e: "60",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "To determine the approximate population per square kilometer, divide the population by the land area and estimate the value of the resulting quotient: $\\frac{120,256,000}{2,998,000} \\approx \\frac{120,000,000}{3,000,000} = 40$. The correct answer is D.",
    categories: ["Arithmetic", "Estimation"],
  },
  {
    id: "QR-GMAT-PQ__-00023",
    question_number: 23,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "A T-shirt supplier charges $12 per T-shirt for the first 50 T-shirts in an order and $10 per T-shirt for each additional T-shirt in the order. If the charge for an order of T-shirts was $1,500, how many T-shirts were in the order?",
      options: {
        a: "90",
        b: "125",
        c: "140",
        d: "150",
        e: "200",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "The first 50 T-shirts cost $(50)(\\$12) = \\$600$. Therefore, $\\$1,500 - \\$600 = \\$900$ was the cost of 90 T-shirts at $10 per T-shirt. Therefore, the total number of T-shirts was $50 + 90 = 140$. The correct answer is C.",
    categories: ["Algebra", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00024",
    question_number: 24,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "$\\frac{1}{2^{10}} + \\frac{1}{2^{11}} + \\frac{1}{2^{12}} + \\frac{1}{2^{13}} =$",
      options: {
        a: "$\\frac{1}{2^7}$",
        b: "$\\frac{1}{2^8}$",
        c: "$\\frac{1}{2^9}$",
        d: "$\\frac{1}{2^{11}}$",
        e: "$\\frac{1}{2^{46}}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "$\\frac{1}{2^{10}} + \\frac{1}{2^{11}} + \\frac{1}{2^{12}} + \\frac{1}{2^{13}} = \\frac{4}{2^{12}} + \\frac{2}{2^{12}} + \\frac{1}{2^{12}} + \\frac{1}{2^{13}} = \\frac{4+2+1+1}{2^{12}} = \\frac{8}{2^{12}} = \\frac{2^3}{2^{12}} = \\frac{1}{2^9}$. The correct answer is C.",
    categories: ["Arithmetic", "Operations on rational numbers", "Exponents"],
  },
  {
    id: "QR-GMAT-PQ__-00025",
    question_number: 25,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "Pat's watch gains an extra 10 seconds every 2 hours. Kim's watch loses 5 seconds every 3 hours. If both watches are set to the correct time at 8 o'clock in the morning and run without interruption, after 72 hours, what will be the difference in time between Pat's watch and Kim's watch?",
      options: {
        a: "4 min",
        b: "6 min",
        c: "6 min 40 sec",
        d: "7 min 30 sec",
        e: "8 min",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Pat's watch gains 10 seconds every 2 hours, so in 72 hours it will gain $(10)\\left(\\frac{72}{2}\\right) = 360$ seconds $= 6$ minutes. Kim's watch loses 5 seconds every 3 hours, so in 72 hours it will lose $(5)\\left(\\frac{72}{3}\\right) = 120$ seconds $= 2$ minutes. Thus, if $T$ is the correct time after 72 hours, the time on Pat's watch will be $T + 6$ minutes and the time on Kim's watch will be $T - 2$ minutes. The difference in times on the 2 watches is $(T + 6) - (T - 2) = 6 + 2 = 8$ minutes. The correct answer is E.",
    categories: ["Arithmetic", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00026",
    question_number: 26,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "If $x > 0$ and $x^2 = 248$, what is the closest integer approximation of $x$?",
      options: {
        a: "496",
        b: "124",
        c: "50",
        d: "16",
        e: "14",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "Given that $x > 0$ and $x^2 = 248$, it follows that $x = \\sqrt{248}$. $\\sqrt{248} = \\sqrt{4 \\times 62} = \\sqrt{4} \\times \\sqrt{62} = 2\\sqrt{62}$. $\\sqrt{62} \\approx \\sqrt{64} = 8$. $\\sqrt{248} \\approx 2\\sqrt{64} = 2(8) = 16$. Alternatively, consider the squares of the answer choices, and observe that $16^2 = 256$ which is the closest to 248. A. $496^2 > 100^2 = 10,000$. B. $124^2 > 100^2 = 10,000$. C. $50^2 = 2,500$. D. $16^2 = 256$. E. $14^2 = 196$. The correct answer is D.",
    categories: ["Arithmetic", "Estimation"],
  },
  {
    id: "QR-GMAT-PQ__-00027",
    question_number: 27,
    section: "Quantitative Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "When the even integer $n$ is divided by 9, the remainder is 8. Which of the following, when added to $n$, gives a sum that is divisible by 18?",
      options: {
        a: "1",
        b: "4",
        c: "9",
        d: "10",
        e: "17",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "Since the remainder is 8 when $n$ is divided by 9, it follows that $n = 9q + 8$ for some integer value of $q$. Note that $q$ must be even because $n = 9q + 8$ is even. Test each answer choice. $n + 1 = 9q + 9 = 9(q + 1)$, which is odd and therefore not divisible by 18; $n + 2 = 9q + 12$, which is not divisible by 18 because $9q + 12 = 9(q + 1) + 3$ is 3 more than a multiple of 9; $n + 9 = 9q + 17$, which is not divisible by 18 because $9q + 17 = 9(q + 1) + 8$ is 8 more than a multiple of 9; $n + 10 = 9q + 18 = 9(q + 2)$, which is divisible by 18 since $q$ is even; $n + 17 = 9q + 25$, which is not divisible by 18 because $9q + 25 = 9(q + 2) + 7$ is 7 more than a multiple of 9. Thus, 10 is the only number among the answer choices that, when added to $n$, gives a number that is divisible by 18. The correct answer is D.",
    categories: ["Arithmetic", "Properties of numbers"],
  },
  {
    id: "QR-GMAT-PQ__-00028",
    question_number: 28,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If $x(a + b) = y$, where $y \\neq 0$ and $2a = 3b = 1$, then $\\frac{y}{x} =$",
      options: {
        a: "$\\frac{1}{6}$",
        b: "$\\frac{1}{3}$",
        c: "$\\frac{2}{3}$",
        d: "$\\frac{5}{6}$",
        e: "$\\frac{6}{5}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "From $2a = 3b = 1$ we have $a = \\frac{1}{2}$ and $b = \\frac{1}{3}$. Therefore, $x(a + b) = x\\left(\\frac{1}{2} + \\frac{1}{3}\\right) = \\frac{5}{6}x$, and so, $y = \\frac{5}{6}x$. Dividing both sides of the last equation by $x$ (which is not equal to 0 because $y$ is not equal to 0), gives $\\frac{y}{x} = \\frac{5}{6}$. The correct answer is D.",
    categories: ["Algebra", "Simplifying algebraic expressions"],
  },
  {
    id: "QR-GMAT-PQ__-00029",
    question_number: 29,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If $x$ is the sum of the first 50 positive even integers and $y$ is the sum of the first 50 positive odd integers, what is the value of $x - y$?",
      options: {
        a: "0",
        b: "25",
        c: "50",
        d: "75",
        e: "100",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "$x - y = (2 + 4 + 6 + ... + 100) - (1 + 3 + 5 + ... + 99) = (2 - 1) + (4 - 3) + (6 - 5) + ... + (100 - 99) = 1 + 1 + 1 + ... + 1 = 50(1) = 50$. Alternatively, $x = \\sum_{i=1}^{50} 2i$; $y = \\sum_{i=1}^{50} (2i - 1) = \\left(\\sum_{i=1}^{50} 2i\\right) - \\left(\\sum_{i=1}^{50} 1\\right)$; $x - y = \\left(\\sum_{i=1}^{50} 2i\\right) - \\left[\\left(\\sum_{i=1}^{50} 2i\\right) - \\sum_{i=1}^{50} 1\\right] = \\sum_{i=1}^{50} 1 = 50(1) = 50$. The correct answer is C.",
    categories: ["Arithmetic", "Properties of numbers"],
  },
  {
    id: "QR-GMAT-PQ__-00030",
    question_number: 30,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Each signal that a certain ship can make is comprised of 3 different flags hanging vertically in a particular order. How many unique signals can be made by using 4 different flags?",
      options: {
        a: "10",
        b: "12",
        c: "20",
        d: "24",
        e: "36",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "Assuming that the top flag is chosen first, followed by the middle flag, and then the bottom flag, there are 4 choices for the flag at the top, 3 choices for the flag in the middle, and 2 choices for the flag on the bottom, for a total of $4 \\times 3 \\times 2 = 24$. The correct answer is D.",
    categories: ["Arithmetic", "Counting methods"],
  },
  {
    id: "QR-GMAT-PQ__-00031",
    question_number: 31,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "The age of certain granite rocks found in northwestern Canada is approximately $1.2 \\times 10^{17}$ seconds. Which of the following is closest to the age of these rocks, in years? (1 year is approximately $3.2 \\times 10^7$ seconds.)",
      options: {
        a: "$3.8 \\times 10^9$",
        b: "$5.9 \\times 10^9$",
        c: "$2.0 \\times 10^{10}$",
        d: "$2.0 \\times 10^{11}$",
        e: "$3.8 \\times 10^{11}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "$1.2 \\times 10^{17}$ seconds $= 1.2 \\times 10^{17}$ seconds $\\times \\frac{1 \\text{ year}}{3.2 \\times 10^7 \\text{ seconds}} = \\frac{1.2 \\times 10^{17}}{3.2 \\times 10^7}$ years $= \\frac{12 \\times 10^{16}}{32 \\times 10^6}$ years $= \\frac{3}{8} \\times 10^{16-6}$ years $= 0.375 \\times 10^{10}$ years $\\approx 3.8 \\times 10^9$ years. The correct answer is A.",
    categories: ["Arithmetic", "Operations on rational numbers"],
  },
  {
    id: "QR-GMAT-PQ__-00032",
    question_number: 32,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Due to construction, the speed limit along an 8-mile section of highway is reduced from 55 miles per hour to 35 miles per hour. Approximately how many minutes more will it take to travel along this section of highway at the new speed limit than it would have taken at the old speed limit?",
      options: {
        a: "5",
        b: "8",
        c: "10",
        d: "15",
        e: "24",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "At 35 miles per hour instead of 55 miles per hour, 8 miles takes $(8)\\left(\\frac{60}{35} - \\frac{60}{55}\\right)$ minutes longer or $(8)\\left(\\frac{12}{7} - \\frac{12}{11}\\right)$ minutes longer. Then, $(8)\\left(\\frac{12}{7} - \\frac{12}{11}\\right) = (8)\\left(\\frac{12(11-7)}{77}\\right) = (8)\\left(\\frac{48}{77}\\right) \\approx 5$. The correct answer is A.",
    categories: ["Arithmetic", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00033",
    question_number: 33,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If $\\frac{m}{7}$ is an integer, then each of the following must be an integer EXCEPT",
      options: {
        a: "$\\frac{m - 28}{7}$",
        b: "$\\frac{m + 21}{7}$",
        c: "$\\frac{14m}{98}$",
        d: "$\\frac{m^2 - 49}{49}$",
        e: "$\\frac{m + 14}{14}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Given that $\\frac{m}{7}$ is an integer, A. $\\frac{m-28}{7} = \\frac{m}{7} - 4$ is an integer. B. $\\frac{m+21}{7} = \\frac{m}{7} + 3$ is an integer. C. $\\frac{14m}{98} = \\frac{m}{7}$ is an integer. D. $\\frac{m^2-49}{49} = \\left(\\frac{m}{7}\\right)^2 - 1$ is an integer. E. $\\frac{m+14}{14}$ can be an integer (for example, let $m = 0$), but does not have to be an integer (for example, let $m = 7$). The correct answer is E.",
    categories: ["Algebra", "Simplifying algebraic expressions"],
  },
  {
    id: "QR-GMAT-PQ__-00034",
    question_number: 34,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If 175 billion French francs is equivalent to 35 billion United States dollars, which of the following expressions represents the number of United States dollars equivalent to $f$ French francs?",
      options: {
        a: "$f - 140$",
        b: "$5f$",
        c: "$7f$",
        d: "$\\frac{f}{5}$",
        e: "$\\frac{f}{7}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "In this solution it is assumed that 1 billion $= 10^9$. However, only minor modifications in the first three steps are needed (replace each appearance of $10^9$ with $10^{12}$) if \"British billion\", equal to $10^{12}$, is used. $175 \\times 10^9$ francs $= 35 \\times 10^9$ dollars (given). 1 franc $= \\frac{35 \\times 10^9}{175 \\times 10^9}$ dollars (divide both sides by $175 \\times 10^9$). 1 franc $= \\frac{35}{175}$ dollars (cancel factors of $10^9$). 1 franc $= \\frac{1}{5}$ dollars (reduce fraction). $f$ francs $= \\frac{f}{5}$ dollars (multiply both sides by $f$). The correct answer is D.",
    categories: ["Algebra", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00035",
    question_number: 35,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Three straight metal rods have an average (arithmetic mean) length of 77 inches and the shortest rod has a length of 65 inches. What is the maximum possible value of the median length, in inches, of the three rods?",
      options: {
        a: "71",
        b: "77",
        c: "80",
        d: "83",
        e: "89",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "The average length of the three rods is 77 inches so the sum of the lengths of the rods is $(77)(3) = 231$ inches. Since the shortest rod has length 65 inches, it follows that the sum of the lengths of the other two rods is $231 - 65 = 166$. If $x$ and $y$ denote the lengths of the other two rods, where $x$ is the median and $x \\leq y$, then $x + y = 166$. Since $x \\leq y$, then $2x \\leq x + y = 166$. It follows that $x \\leq 83$ and so the maximum value of the median length of the three rods is 83. The correct answer is D.",
    categories: ["Arithmetic", "Statistics"],
  },
  {
    id: "QR-GMAT-PQ__-00036",
    question_number: 36,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If it would take one machine 10 minutes to fill a large production order and another machine 12 minutes to fill the same order, how many minutes would it take both machines working together, at their respective rates, to fill the order?",
      options: {
        a: "$4\\frac{1}{60}$",
        b: "5",
        c: "$5\\frac{5}{11}$",
        d: "$5\\frac{1}{2}$",
        e: "11",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "One machine can fill the production order in 10 minutes so it can fill $\\frac{1}{10}$ of the order in 1 minute. The other machine can fill the production order in 12 minutes so it can fill $\\frac{1}{12}$ of the order in 1 minute. Working together, the two machines can fill $\\left(\\frac{1}{10} + \\frac{1}{12}\\right) = \\frac{11}{60}$ of the order in 1 minute. Therefore, working together, the two machines can fill the order in $\\frac{60}{11} = 5\\frac{5}{11}$ minutes. The correct answer is C.",
    categories: ["Arithmetic", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00037",
    question_number: 37,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "A book dealer buys used books for prices ranging from $0.75 to $1.50 and then sells them for prices ranging from $3.00 to $5.50. If the dealer were to sell 20 of these books, the minimum gross profit from this sale would be",
      options: {
        a: "$15",
        b: "$30",
        c: "$45",
        d: "$50",
        e: "$80",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "The profit will be at a minimum when the book dealer buys a book at the highest possible price and sells it for the lowest possible price. Therefore, the minimum gross profit on 20 books is $20(\\$3.00 - \\$1.50) = \\$30.00$. The correct answer is B.",
    categories: ["Arithmetic", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00038",
    question_number: 38,
    section: "Quantitative Reasoning",
    difficulty: "hard",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "The cost of chartering a plane was shared equally among 30 passengers. If there had been 35 passengers sharing that cost, the cost per passenger would have been $30 less. What was the cost of chartering the plane?",
      options: {
        a: "$5,400",
        b: "$6,125",
        c: "$6,300",
        d: "$6,800",
        e: "$7,350",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "If $x$ represents the cost, in dollars, of chartering the plane, then $\\frac{x}{30}$ represents the cost per passenger with 30 passengers sharing the cost, $\\frac{x}{35}$ represents the per passenger cost with 35 passengers sharing the cost, and the difference is $30. Then, $\\frac{x}{30} - \\frac{x}{35} = 30$. Solving: $35x - 30x = 30(30)(35)$, $5x = (900)(35)$, $x = (900)(7)$, $x = 6,300$. The correct answer is C.",
    categories: ["Algebra", "First-degree equations"],
  },
  {
    id: "QR-GMAT-PQ__-00039",
    question_number: 39,
    section: "Quantitative Reasoning",
    difficulty: "hard",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "For a certain set of numbers, if $x$ is in the set, then $x - 3$ is also in the set. If the number 1 is in the set, which of the following must also be in the set?\n\nI. 4\nII. $-1$\nIII. $-5$",
      options: {
        a: "I only",
        b: "II only",
        c: "III only",
        d: "I and II",
        e: "II and III",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "The rule for set membership is: If $x$ is in the set, then $x - 3$ is also in the set. It is given that 1 is in the set. Therefore, $1 - 3 = -2$ is in the set. Also, since $-2$ is now known to be in the set, $-2 - 3 = -5$ is also known to be in the set. Similarly, since $-5$ is now known to be in the set, $-8$ is also known to be in the set. Note that the set could be $\\{1, -2, -5, -8, ...\\}$ and this set does not contain either 4 or $-1$. Therefore, it is not true that either 4 or $-1$ must be in the set. Only $-5$ must be in the set. The correct answer is C.",
    categories: ["Arithmetic", "Properties of numbers"],
  },
  {
    id: "QR-GMAT-PQ__-00040",
    question_number: 40,
    section: "Quantitative Reasoning",
    difficulty: "hard",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "If an integer $n$ is to be chosen at random from the integers 1 to 96, inclusive, what is the probability that $n(n + 1)(n + 2)$ will be divisible by 8?",
      options: {
        a: "$\\frac{1}{4}$",
        b: "$\\frac{3}{8}$",
        c: "$\\frac{1}{2}$",
        d: "$\\frac{5}{8}$",
        e: "$\\frac{3}{4}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "In order for $n(n + 1)(n + 2)$ to be divisible by 8, the prime factorizations of the integers $n$, $n + 1$, and $n + 2$ must collectively contain at least 3 factors of 2. Case 1: Consider the triples of the form $(n, n + 1, n + 2)$ in which one of $n$, $n + 1$, or $n + 2$ is an even multiple of 4 and $1 \\leq n \\leq 96$. Note that every even multiple of 4 is also a multiple of 8. There are 12 triples in which $n$ is a multiple of 8, 12 triples in which $n + 1$ is a multiple of 8, and 12 triples in which $n + 2$ is a multiple of 8. Thus, there are 36 triples in which one of $n$, $n + 1$, or $n + 2$ is an even multiple of 4 (and therefore a multiple of 8), and for each of these 36 triples, $n(n + 1)(n + 2)$ is divisible by 8. Case 2: Consider the triples of the form $(n, n + 1, n + 2)$ in which one of $n$, $n + 1$, or $n + 2$ is an odd multiple of 4 and $1 \\leq n \\leq 96$. Note that in order for the product $n(n + 1)(n + 2)$ to be divisible by 8, one of the other two members of the triple must be even. There are 12 triples in which $n$ is an odd multiple of 4 and $n + 2$ is even and 12 triples in which $n + 2$ is an odd multiple of 4 and $n$ is even. Note that if $n + 1$ is an odd multiple of 4, then each of $n$ and $n + 2$ is odd and so for these triples $n(n + 1)(n + 2)$ is not divisible by 8. Thus, there are 24 triples in which one of $n$, $n + 1$, or $n + 2$ is an odd multiple of 4, one of $n$, $n + 1$, or $n + 2$ is even, and for each of these 24 triples, $n(n + 1)(n + 2)$ is divisible by 8. It follows that there are $36 + 24 = 60$ integers $n$ from 1 through 96 for which $n(n + 1)(n + 2)$ is divisible by 8. Since there are 96 integers from 1 through 96, the probability is $\\frac{60}{96} = \\frac{5}{8}$ that, when an integer $n$ is chosen at random from the integers from 1 through 96, $n(n + 1)(n + 2)$ will be divisible by 8. The correct answer is D.",
    categories: ["Arithmetic", "Probability"],
  },
  {
    id: "QR-GMAT-PQ__-00041",
    question_number: 41,
    section: "Quantitative Reasoning",
    difficulty: "hard",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Ms. Kessler bought 100 bonds for $91.25 each. At the end of 2 years, the bonds matured and she collected the par value of $100 each. In addition, she collected interest for the 2 years at an annual rate of 2.75 percent of par value. What was Ms. Kessler's effective simple annual interest rate of return on her investment, to the nearest tenth of a percent?",
      options: {
        a: "4.4%",
        b: "6.8%",
        c: "7.8%",
        d: "12.6%",
        e: "15.6%",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "At the end of 2 years, Ms. Kessler received $100(\\$100) + (100)(\\$100)(2)(0.0275) = \\$10,550$ from an investment of $100(\\$91.25) = \\$9,125$ for a gain of $\\$10,550 - \\$9,125 = \\$1,425$ and a return of $\\frac{1,425}{9,125} \\approx 0.156$ or 15.6% over the 2-year period. Therefore, the annualized rate of return is $\\frac{15.6}{2}\\% = 7.8\\%$. The correct answer is C.",
    categories: ["Arithmetic", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00042",
    question_number: 42,
    section: "Quantitative Reasoning",
    difficulty: "hard",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "$\\frac{(0.045)(1.9)}{(0.03)(0.005)(0.1)} =$",
      options: {
        a: "5,700",
        b: "570",
        c: "57",
        d: "5.7",
        e: "0.57",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "$\\frac{(0.045)(1.9)}{(0.03)(0.005)(0.1)} = \\frac{(0.045)(1.9)}{(0.03)(0.005)(0.1)} \\times \\frac{10^6}{10^6} = \\frac{(45)(19)(100)}{(3)(5)(1)} = (3)(19)(100) = 5,700$. The correct answer is A.",
    categories: ["Arithmetic", "Operations with decimals"],
  },
  {
    id: "QR-GMAT-PQ__-00043",
    question_number: 43,
    section: "Quantitative Reasoning",
    difficulty: "hard",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "June 25, 1982, fell on a Friday. On which day of the week did June 25, 1987, fall? (Note: 1984 was a leap year.)",
      options: {
        a: "Sunday",
        b: "Monday",
        c: "Tuesday",
        d: "Wednesday",
        e: "Thursday",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "From June 25, 1982, to June 25, 1987, was a span of 5 years, one of which was a leap year. It follows that the number of days from June 25, 1982, to June 25, 1987, was $5(365) + 1 = 1,826$ days, which is equivalent to 260 weeks plus 6 days since $1,826 = 260(7) + 6$. Because June 25, 1982, fell on a Friday and 260 weeks and 6 days after Friday is Thursday, June 25, 1987, fell on a Thursday. The correct answer is E.",
    categories: ["Arithmetic", "Applied problems"],
  },
  {
    id: "QR-GMAT-PQ__-00044",
    question_number: 44,
    section: "Quantitative Reasoning",
    difficulty: "hard",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "A certain quantity is measured on two different scales, the $R$-scale and the $S$-scale, that are related linearly. Measurements on the $R$-scale of 6 and 24 correspond to measurements on the $S$-scale of 30 and 60, respectively. What measurement on the $R$-scale corresponds to a measurement of 100 on the $S$-scale?",
      options: {
        a: "20",
        b: "36",
        c: "48",
        d: "60",
        e: "84",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "It is given that a linear relationship holds between the $R$-scale and the $S$-scale. Therefore, there are constants $b$ and $m$ such that values on the $R$-scale can be obtained by multiplying $m$ by the corresponding values on the $S$-scale and then adding $b$. Thus, the fact that the values 6 and 24 on the $R$-scale correspond to the values 30 and 60 on the $S$-scale, respectively, lead to the equations $6 = m(30) + b$ and $24 = m(60) + b$. Subtracting the first equation from the second equation gives $24 - 6 = 30m$, or $m = \\frac{18}{30} = \\frac{3}{5}$. Substituting this value of $m$ into the first equation gives $6 = (\\frac{3}{5})(30) + b$, or $6 = 18 + b$, or $b = -12$. Therefore, to obtain a value on the $R$-scale, multiply $\\frac{3}{5}$ by the corresponding value on the $S$-scale and then subtract 12. Carrying this out for the value 100 on the $S$-scale gives $(\\frac{3}{5})(100) - 12 = 60 - 12 = 48$ for the corresponding value on the $R$-scale. The correct answer is C.",
    categories: ["Algebra", "First-degree equations"],
  },
  {
    id: "QR-GMAT-PQ__-00045",
    question_number: 45,
    section: "Quantitative Reasoning",
    difficulty: "hard",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "If $a$, $b$, and $c$ are consecutive positive integers where $a < b < c$, and $c - a = \\frac{16}{b}$, then $a + b + c =$",
      options: {
        a: "30",
        b: "24",
        c: "18",
        d: "12",
        e: "6",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "If $a$, $b$, and $c$ are consecutive integers, where $a < b < c$, then $b = a + 1$ and $c = a + 2$. It follows that $c - a = (a + 2) - a = 2$. Then, $2 = \\frac{16}{b}$ and $b = 8$. It follows that $a = 7$, $c = 9$, and $a + b + c = 7 + 8 + 9 = 24$. The correct answer is B.",
    categories: ["Algebra", "Simultaneous equations"],
  },
  {
    id: "QR-GMAT-PQ__-00046",
    question_number: 46,
    section: "Quantitative Reasoning",
    difficulty: "hard",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Kay began a certain game with $x$ chips. On each of the next two plays, she lost one more than half the number of chips she had at the beginning of that play. If she had 5 chips remaining after her two plays, then $x$ is in the interval",
      options: {
        a: "$7 \\leq x \\leq 12$",
        b: "$13 \\leq x \\leq 18$",
        c: "$19 \\leq x \\leq 24$",
        d: "$25 \\leq x \\leq 30$",
        e: "$31 \\leq x \\leq 35$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "After the first play, Kay had $x - (\\frac{1}{2}x + 1) = \\frac{1}{2}x - 1$ chips left. After the second play, Kay had $(\\frac{1}{2}x - 1) - [\\frac{1}{2}(\\frac{1}{2}x - 1) + 1] = \\frac{1}{4}x - \\frac{3}{2}$ chips left. Therefore, $\\frac{1}{4}x - \\frac{3}{2} = 5$, which can be solved to obtain $x = 26$. Alternatively, if $y$ is the number of chips after the first play, then $y = x - (\\frac{1}{2}x + 1) = \\frac{1}{2}x - 1$ and the number of chips after the second play is $\\frac{1}{2}y - 1$. It is given that $\\frac{1}{2}y - 1 = 5$, so $y = 12$. Now use $y = \\frac{1}{2}x - 1$ to get $\\frac{1}{2}x - 1 = 12$, or $x = 26$. The correct answer is D.",
    categories: ["Algebra", "Applied problems"],
  },
];
