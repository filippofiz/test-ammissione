#import "@preview/slydst:0.1.5": *

// UpToTen Brand Colors
#let uptoten-blue = rgb("#021d49")
#let uptoten-green = rgb("#4caf50")
#let uptoten-orange = rgb("#ffb606")

#show: slides.with(
  title: "GMAT Data Insights",
  subtitle: "Data Sufficiency Questions",
  date: none,
  authors: ("UpToTen - Learn STEM More",),
  layout: "medium",
  ratio: 16/9,
  title-color: uptoten-blue,
)

// Custom styling
#set text(font: "Arial", size: 12pt)
#set par(justify: true, leading: 0.8em)
#set list(spacing: 0.8em)
#set enum(spacing: 0.8em)

// Custom box styles
#let info-box(content) = box(
  fill: uptoten-blue.lighten(90%),
  inset: 14pt,
  radius: 6pt,
  width: 100%,
  [#set text(size: 14pt)
   #content]
)

#let tip-box(content) = box(
  fill: uptoten-green.lighten(85%),
  inset: 14pt,
  radius: 6pt,
  width: 100%,
  [#set text(size: 14pt)
   #content]
)

#let warning-box(content) = box(
  fill: uptoten-orange.lighten(85%),
  inset: 14pt,
  radius: 6pt,
  width: 100%,
  [#set text(size: 14pt)
   #content]
)

#let question-box(content, difficulty: "medium") = {
  let fill-color = if difficulty == "easy" { rgb("#e8f5e9") } else if difficulty == "hard" { rgb("#ffebee") } else { rgb("#fff3e0") }
  box(
    fill: fill-color,
    inset: 14pt,
    radius: 6pt,
    width: 100%,
    stroke: 1pt + gray,
    [#set text(size: 15pt)
     #content]
  )
}

= Data Insights Overview

== What is Data Insights?

#v(0.5fr)

The *Data Insights (DI)* section measures your ability to:

- Analyze and interpret data from multiple sources
- Reason quantitatively with real-world data
- Make strategic decisions based on information
- Determine what information is sufficient to answer a question

#v(0.5fr)

#info-box[
  *Key Mindset Shift*: Data Insights isn't just about calculation - it's about *extracting meaning from data*.
]

#v(1fr)

== Section Format

#v(0.5fr)

#set text(size: 15pt)
#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(85%) } else { white },
  stroke: 0.5pt + gray,
  inset: 12pt,
  [*Aspect*], [*Details*],
  [Number of Questions], [20 questions],
  [Time Allowed], [45 minutes],
  [Question Types], [5 different types],
  [Calculator], [On-screen calculator available],
  [Format], [Computer adaptive],
  [Average Time/Question], [~2 minutes 15 seconds],
)
#set text(size: 16pt)

#v(1fr)

== Five Question Types

#v(0.3fr)

#set text(size: 15pt)
#grid(
  columns: (1fr, 1fr),
  gutter: 30pt,
  [
    *1. Data Sufficiency*
    - Determine if data is sufficient
    - Do NOT calculate the answer

    #v(0.5em)
    *2. Multi-Source Reasoning*
    - 2-3 tabbed pages of data
    - Synthesize information

    #v(0.5em)
    *3. Table Analysis*
    - Sortable tables
    - True/False statements
  ],
  [
    *4. Graphics Interpretation*
    - Charts and graphs
    - Dropdown completions

    #v(0.5em)
    *5. Two-Part Analysis*
    - Interrelated components
    - Select two answers
  ]
)
#set text(size: 16pt)

#v(0.3fr)

#tip-box[
  Today's focus: *Data Sufficiency* - the most unique GMAT question type
]

#v(1fr)

== Scoring

#v(0.5fr)

- *Section Score*: 60 to 90 (1-point increments)
- *Total GMAT Score*: 205 to 805 (10-point increments)

#v(0.5fr)

Data Insights tests skills highly valued in business:
- Data analysis and interpretation
- Information synthesis
- Strategic decision-making

#v(0.5fr)

#warning-box[
  *Important*: DI combines skills from both Quantitative and Verbal Reasoning. You'll need mathematical ability AND logical analysis.
]

#v(1fr)

= Data Sufficiency Deep Dive

== The Core Concept

#v(0.3fr)

#align(center)[
  #text(size: 22pt, weight: "bold", fill: uptoten-blue)[
    You are NOT asked to solve the problem.
  ]

  #v(0.5em)

  #text(size: 22pt, weight: "bold", fill: uptoten-green)[
    You are asked to determine whether you COULD solve it.
  ]
]

#v(0.4fr)

This fundamental difference changes everything:
- Don't waste time calculating final answers
- Focus on whether the information is *sufficient*
- Think about *what you need*, not *what you get*

#v(1fr)

== Question Structure

#v(0.5fr)

Every Data Sufficiency question has:

1. *A Question Stem*: The problem to be answered
2. *Statement (1)*: First piece of data
3. *Statement (2)*: Second piece of data
4. *Five Answer Choices*: Always the same!

#v(0.5fr)

#info-box[
  The five answer choices are *identical* for every Data Sufficiency question. Memorize them!
]

#v(1fr)

== The Five Answer Choices

#v(0.2fr)

#set text(size: 14pt)
#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(85%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  inset: 10pt,
  [*Choice*], [*Meaning*],
  [(A)], [Statement (1) ALONE is sufficient, but statement (2) alone is not],
  [(B)], [Statement (2) ALONE is sufficient, but statement (1) alone is not],
  [(C)], [BOTH statements TOGETHER are sufficient, but NEITHER alone is sufficient],
  [(D)], [EACH statement ALONE is sufficient],
  [(E)], [Statements (1) and (2) TOGETHER are NOT sufficient],
)
#set text(size: 16pt)

#v(1fr)

== What "Sufficient" Means

#v(0.5fr)

A statement is *sufficient* if it provides enough information to:

- For *value questions*: Determine a single, definite value
- For *yes/no questions*: Give a definite yes OR a definite no

#v(0.5fr)

#grid(
  columns: (1fr, 1fr),
  gutter: 20pt,
  [
    #tip-box[
      *Sufficient*: "The answer is definitely 5"

      *Sufficient*: "The answer is definitely NO"
    ]
  ],
  [
    #warning-box[
      *NOT Sufficient*: "The answer could be 4 or -4"

      *NOT Sufficient*: "Sometimes yes, sometimes no"
    ]
  ]
)

#v(1fr)

== The AD/BCE Method

#v(0.3fr)

#info-box[
  *Systematic Approach to Data Sufficiency*

  *Step 1: Evaluate Statement (1) Alone*
  - If sufficient → Answer is (A) or (D)
  - If not sufficient → Answer is (B), (C), or (E)

  *Step 2: Evaluate Statement (2) Alone*
  - Based on Step 1, narrow to remaining choices

  *Step 3: If needed, combine statements*
  - If together sufficient → Answer is (C)
  - If still not sufficient → Answer is (E)
]

#v(1fr)

== Visual Decision Tree

#v(0.3fr)

#align(center)[
  #text(size: 13pt)[
    ```
    Start with Statement (1)
           |
    Is (1) sufficient?
         /     \
       YES      NO
        |        |
    Evaluate   Evaluate
      (2)        (2)
      /  \      /  \
    YES  NO   YES   NO
     |    |    |     |
    (D)  (A)  (B)  Combine
                      |
                Sufficient?
                  /    \
                YES    NO
                 |      |
                (C)    (E)
    ```
  ]
]

#v(1fr)

== Common Question Types

#v(0.5fr)

=== Value Questions
Ask for a specific numerical answer:
- "What is the value of $x$?"
- "How many students are in the class?"
- "What is the area of the triangle?"

#v(0.3fr)

=== Yes/No Questions
Ask whether a condition is true:
- "Is $x > 5$?"
- "Is the integer even?"
- "Did the company make a profit?"

#v(0.3fr)

#tip-box[
  For yes/no questions, a statement is sufficient if it gives a *definite* answer - even if that answer is "no"!
]

#v(1fr)

== Testing Values Strategy

#v(0.5fr)

When evaluating statements, test specific values to check sufficiency:

*Example*: Is $x$ positive?

*Statement (1)*: $x^2 > 0$

#v(0.3fr)

Test $x = 2$: $4 > 0$ ✓, and $x$ is positive

Test $x = -2$: $4 > 0$ ✓, but $x$ is negative

#v(0.3fr)

#warning-box[
  Since we get both YES and NO, Statement (1) is *NOT sufficient*
]

#v(1fr)

== Common DS Traps

#v(0.5fr)

*1. Calculating the Answer*
- You only need to determine sufficiency, not the actual value

*2. Ignoring Constraints in Question Stem*
- "If $x$ is a positive integer..." - don't forget this!

*3. Two Equations = Two Solutions?*
- Not if the equations are dependent (same line)!

*4. Assuming Statement Order Matters*
- (B) can be correct even though (1) appears first

#v(1fr)

== Key Sufficiency Patterns

#v(0.3fr)

#set text(size: 14pt)
#table(
  columns: (1fr, auto),
  align: (left, center),
  fill: (col, row) => if row == 0 { uptoten-green.lighten(85%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  inset: 10pt,
  [*Pattern*], [*Usually Sufficient?*],
  [One linear equation, one unknown], [Yes],
  [$x^2 = k$ (positive k)], [No - two solutions],
  [$|x| = k$], [No - two solutions],
  [Ratio given, actual values asked], [No],
  [Two independent linear equations, two unknowns], [Yes],
  [Percentage alone for actual value], [No],
)
#set text(size: 16pt)

#v(1fr)

= Practice Questions

== Easy Question 1

#v(0.3fr)

#question-box(difficulty: "easy")[
  *What is the number of pages of a certain journal article?*

  (1) The size of each page is $5 1/2$ inches by 8 inches.

  (2) The average (arithmetic mean) number of words per page is 250.
]

#v(0.3fr)

*Think about it...*
- What would you need to determine the number of pages?
- Does knowing page dimensions help?
- Does knowing words per page help?

#v(1fr)

== Easy Question 1 - Solution

#v(0.2fr)

#set text(size: 14pt)
*Statement (1)*: Page dimensions of $5 1/2$ × 8 inches
- Any positive integer could be the number of pages
- Could be 10 pages, could be 20 pages → *NOT sufficient*

*Statement (2)*: Average 250 words per page
- Could be 10 pages with 2,500 words total
- Could be 20 pages with 5,000 words total → *NOT sufficient*

*Together*: Still no way to determine page count!
#set text(size: 16pt)

#v(0.2fr)

#info-box[
  *Answer: (E)* - Statements (1) and (2) TOGETHER are NOT sufficient
]

#v(1fr)

== Easy Question 2

#v(0.3fr)

#question-box(difficulty: "easy")[
  *If a certain vase contains only roses and tulips, how many tulips are there in the vase?*

  (1) The number of roses in the vase is 4 times the number of tulips.

  (2) There is a total of 20 flowers in the vase.
]

#v(0.3fr)

*Apply the AD/BCE method:*
- Evaluate (1) alone first
- Then (2) alone
- Combine if needed

#v(1fr)

== Easy Question 2 - Solution

#v(0.2fr)

#set text(size: 14pt)
*Statement (1)*: Roses = 4 × Tulips
- Ratio is 4:1, but could be 4 roses & 1 tulip, or 20 roses & 5 tulips
- → *NOT sufficient* (B, C, or E remain)

*Statement (2)*: Total = 20 flowers
- Could be 10 roses & 10 tulips, or 15 roses & 5 tulips
- → *NOT sufficient*

*Together*: If ratio is 4:1 and total is 20:
- Tulips = $1/5$ of 20 = 4 tulips ✓
#set text(size: 16pt)

#info-box[
  *Answer: (C)* - BOTH statements TOGETHER are sufficient
]

#v(1fr)

== Easy Question 3

#v(0.3fr)

#question-box(difficulty: "easy")[
  *How many basic units of Currency X are equivalent to 250 basic units of Currency Y?*

  (1) 100 basic units of Currency X are equivalent to 625 basic units of Currency Y.

  (2) 2,000 basic units of Currency X are equivalent to 12,500 basic units of Currency Y.
]

#v(1fr)

== Easy Question 3 - Solution

#v(0.2fr)

#set text(size: 14pt)
*Statement (1)*: 100 X = 625 Y
- 1 Y = $100/625$ X
- 250 Y = $250 × 100/625$ X → *SUFFICIENT*

*Statement (2)*: 2,000 X = 12,500 Y
- 1 Y = $2000/12500$ X
- 250 Y = $250 × 2000/12500$ X → *SUFFICIENT*
#set text(size: 16pt)

#v(0.2fr)

#tip-box[
  No need to calculate the final value! Just confirm you *could* calculate it.
]

#info-box[
  *Answer: (D)* - EACH statement ALONE is sufficient
]

#v(1fr)

== Easy Question 4

#v(0.3fr)

#question-box(difficulty: "easy")[
  *Was the amount of John's heating bill for February greater than it was for January?*

  (1) The ratio of the amount of John's heating bill for February to that for January was $26/25$.

  (2) The sum of the amounts of John's heating bills for January and February was \$183.60.
]

#v(1fr)

== Easy Question 4 - Solution

#v(0.2fr)

#set text(size: 14pt)
*Statement (1)*: Feb/Jan = 26/25
- Since 26/25 > 1, February bill > January bill
- The answer is definitely YES → *SUFFICIENT*

*Statement (2)*: Jan + Feb = \$183.60
- Could be Jan = \$100, Feb = \$83.60 (Feb < Jan)
- Could be Jan = \$83.60, Feb = \$100 (Feb > Jan)
- → *NOT sufficient*
#set text(size: 16pt)

#info-box[
  *Answer: (A)* - Statement (1) ALONE is sufficient
]

#v(1fr)

== Easy Question 5

#v(0.3fr)

#question-box(difficulty: "easy")[
  *What is the standard deviation of the weights of the 30 samples in a certain experiment?*

  (1) The total weight of the 30 samples is 360 grams.

  (2) Each of the 30 samples weighs 12 grams.
]

#v(1fr)

== Easy Question 5 - Solution

#v(0.2fr)

#set text(size: 14pt)
*Statement (1)*: Total weight = 360 grams
- Average = 360/30 = 12 grams
- But samples could all be 12g (SD = 0) or vary (SD > 0)
- → *NOT sufficient*

*Statement (2)*: Each sample = 12 grams
- All values are identical!
- Standard deviation = 0 → *SUFFICIENT*
#set text(size: 16pt)

#info-box[
  *Answer: (B)* - Statement (2) ALONE is sufficient
]

#v(0.2fr)

#tip-box[
  When all values are equal, the standard deviation is always 0.
]

#v(1fr)

== Medium Question 1

#v(0.3fr)

#question-box(difficulty: "medium")[
  *What is the total number of executives at Company P?*

  (1) The number of male executives is $3/5$ the number of female executives.

  (2) There are 4 more female executives than male executives.
]

#v(1fr)

== Medium Question 1 - Solution

#v(0.2fr)

#set text(size: 14pt)
Let M = male executives, F = female executives

*Statement (1)*: M = (3/5)F
- If F = 5, M = 3, Total = 8
- If F = 10, M = 6, Total = 16 → *NOT sufficient*

*Statement (2)*: F = M + 4
- If M = 3, F = 7, Total = 10
- If M = 4, F = 8, Total = 12 → *NOT sufficient*

*Together*: M = (3/5)F and F = M + 4
- (3/5)F + 4 = F → 4 = (2/5)F → F = 10, M = 6
- Total = 16 ✓
#set text(size: 16pt)

#info-box[
  *Answer: (C)* - BOTH statements TOGETHER are sufficient
]

#v(1fr)

== Medium Question 2

#v(0.3fr)

#question-box(difficulty: "medium")[
  *The total price of 5 pounds of regular coffee and 3 pounds of decaffeinated coffee was \$21.50. What was the price of the 5 pounds of regular coffee?*

  (1) If the price of the 5 pounds of regular coffee had been reduced 10% and the price of the 3 pounds of decaffeinated coffee had been reduced 20%, the total price would have been \$18.45.

  (2) The price of the 5 pounds of regular coffee was \$3.50 more than the price of the 3 pounds of decaffeinated coffee.
]

#v(1fr)

== Medium Question 2 - Solution

#v(0.2fr)

#set text(size: 14pt)
Let x = price of 5 lbs regular, y = price of 3 lbs decaf

Given: x + y = 21.50

*Statement (1)*: 0.9x + 0.8y = 18.45
- Two equations, two unknowns → can solve for x → *SUFFICIENT*

*Statement (2)*: x = y + 3.50
- Two equations, two unknowns → can solve for x → *SUFFICIENT*
#set text(size: 16pt)

#info-box[
  *Answer: (D)* - EACH statement ALONE is sufficient
]

#tip-box[
  Two independent linear equations with two unknowns always yield a unique solution!
]

#v(1fr)

== Medium Question 3

#v(0.3fr)

#question-box(difficulty: "medium")[
  *A certain painting job requires a mixture of yellow, green, and white paint. If 12 quarts of paint are needed for the job, how many quarts of green paint are needed?*

  (1) The ratio of the amount of green paint to the amount of yellow and white paint combined needs to be 1 to 3.

  (2) The ratio of the amount of yellow paint to the amount of green paint needs to be 3 to 2.
]

#v(1fr)

== Medium Question 3 - Solution

#v(0.2fr)

#set text(size: 14pt)
Y + G + W = 12. Find G.

*Statement (1)*: G : (Y + W) = 1 : 3
- So G = (1/4) of total = (1/4)(12) = 3 quarts → *SUFFICIENT*

*Statement (2)*: Y : G = 3 : 2, so Y = (3/2)G
- (3/2)G + G + W = 12
- W is still unknown → *NOT sufficient*
#set text(size: 16pt)

#info-box[
  *Answer: (A)* - Statement (1) ALONE is sufficient
]

#v(1fr)

== Medium Question 4

#v(0.3fr)

#question-box(difficulty: "medium")[
  *What is the ratio of the number of cups of flour to cups of sugar required in a certain recipe?*

  (1) The number of cups of flour required is 250 percent of the number of cups of sugar required.

  (2) $1 1/2$ more cups of flour than cups of sugar are required.
]

#v(1fr)

== Medium Question 4 - Solution

#v(0.2fr)

#set text(size: 14pt)
*Statement (1)*: Flour = 250% of Sugar = 2.5 × Sugar
- Ratio = 2.5 : 1 = 5 : 2 → *SUFFICIENT*

*Statement (2)*: Flour = Sugar + 1.5
- If F = 2.5, S = 1, ratio = 2.5:1 = 5:2
- If F = 10, S = 8.5, ratio = 10:8.5 = 20:17
- Different ratios possible! → *NOT sufficient*
#set text(size: 16pt)

#info-box[
  *Answer: (A)* - Statement (1) ALONE is sufficient
]

#v(0.2fr)

#warning-box[
  Percentages give ratios directly. Absolute differences don't!
]

#v(1fr)

== Medium Question 5

#v(0.3fr)

#question-box(difficulty: "medium")[
  *A collection of 36 cards consists of 4 sets of 9 cards each. The 9 cards in each set are numbered 1 through 9. If one card has been removed, what is the number on that card?*

  (1) The units digit of the sum of the numbers on the remaining 35 cards is 6.

  (2) The sum of the numbers on the remaining 35 cards is 176.
]

#v(1fr)

== Medium Question 5 - Solution

#v(0.2fr)

#set text(size: 14pt)
Sum of all 36 cards = 4 × (1+2+...+9) = 4 × 45 = 180

If removed card = n, then sum of 35 cards = 180 - n

*Statement (1)*: Units digit of sum is 6
- 180 - n ends in 6 → n = 4 (since 176 ends in 6) → *SUFFICIENT*

*Statement (2)*: Sum = 176
- 180 - n = 176 → n = 4 → *SUFFICIENT*
#set text(size: 16pt)

#info-box[
  *Answer: (D)* - EACH statement ALONE is sufficient
]

#v(1fr)

== Hard Question 1

#v(0.3fr)

#question-box(difficulty: "hard")[
  *Did the population of Town C increase by at least 100 percent from 2000 to 2010?*

  (1) The population of Town C in 2000 was $2/3$ of the population in 2005.

  (2) The population increased by a greater number of people from 2005 to 2010 than from 2000 to 2005.
]

#v(1fr)

== Hard Question 1 - Solution

#v(0.3fr)

*Statement (1)*: Pop₂₀₀₀ = (2/3) Pop₂₀₀₅
- No info about 2010 → *NOT sufficient*

*Statement (2)*: Increase 2005→2010 > Increase 2000→2005
- No info about 2000 baseline → *NOT sufficient*

*Together*: Let P = Pop₂₀₀₅
- Pop₂₀₀₀ = (2/3)P; Increase 2000→2005 = P - (2/3)P = (1/3)P
- Increase 2005→2010 > (1/3)P
- Total increase > (2/3)P; Original = (2/3)P
- Percent increase > 100% ✓

#info-box[
  *Answer: (C)* - BOTH statements TOGETHER are sufficient
]

#v(1fr)

== Hard Question 2

#v(0.3fr)

#question-box(difficulty: "hard")[
  *In a survey of 200 college graduates, 30% said they had received student loans and 40% said they had received scholarships. What percent said they received neither loans nor scholarships?*

  (1) 25% said they had received scholarships but no loans.

  (2) 50% of those who said they had received loans also said they had received scholarships.
]

#v(1fr)

== Hard Question 2 - Solution

#v(0.3fr)

Loans = 60 people (30%), Scholarships = 80 people (40%)
Let B = both loans and scholarships

*Statement (1)*: Scholarships only = 25% = 50 people
- B = 80 - 50 = 30; Loans only = 60 - 30 = 30
- Neither = 200 - 30 - 30 - 50 = 90 → *SUFFICIENT*

*Statement (2)*: 50% of loan recipients also got scholarships
- B = 0.5 × 60 = 30; Same calculation → *SUFFICIENT*

#info-box[
  *Answer: (D)* - EACH statement ALONE is sufficient
]

#v(1fr)

== Hard Question 3

#v(0.3fr)

#question-box(difficulty: "hard")[
  *A box contains only red, white, and blue chips. If a chip is randomly selected, what is the probability that it will be either white or blue?*

  (1) The probability that the chip will be blue is $1/5$.

  (2) The probability that the chip will be red is $1/3$.
]

#v(1fr)

== Hard Question 3 - Solution

#v(0.3fr)

P(red) + P(white) + P(blue) = 1

P(white or blue) = 1 - P(red)

*Statement (1)*: P(blue) = 1/5
- Still don't know P(white) or P(red)
- P(white or blue) varies → *NOT sufficient*

*Statement (2)*: P(red) = 1/3
- P(white or blue) = 1 - 1/3 = 2/3 → *SUFFICIENT*

#info-box[
  *Answer: (B)* - Statement (2) ALONE is sufficient
]

#tip-box[
  Think about what you actually need! The question asks for P(not red).
]

#v(1fr)

== Hard Question 4

#v(0.3fr)

#question-box(difficulty: "hard")[
  *What is the total number of coins that Bert and Claire have?*

  (1) Bert has 50 percent more coins than Claire.

  (2) The total number of coins that Bert and Claire have is between 21 and 28.
]

#v(1fr)

== Hard Question 4 - Solution

#v(0.3fr)

*Statement (1)*: B = 1.5C → B + C = 2.5C
- C could be any value → *NOT sufficient*

*Statement (2)*: 21 < B + C < 28
- Could be 22, 23, 24, 25, 26, or 27 → *NOT sufficient*

*Together*: 21 < 2.5C < 28 → 8.4 < C < 11.2
- C = 9 → B = 13.5 (not integer!)
- C = 10 → B = 15 ✓
- C = 11 → B = 16.5 (not integer!)
- Only C = 10, B = 15 works → Total = 25

#info-box[
  *Answer: (C)* - BOTH statements TOGETHER are sufficient
]

#v(1fr)

== Hard Question 5

#v(0.3fr)

#question-box(difficulty: "hard")[
  *On a certain nonstop trip, Marta averaged $x$ miles per hour for 2 hours and $y$ miles per hour for the remaining 3 hours. What was her average speed for the entire trip?*

  (1) $2x + 3y = 280$

  (2) $y = x + 10$
]

#v(1fr)

== Hard Question 5 - Solution

#v(0.3fr)

Total distance = 2x + 3y miles in 5 hours

Average speed = $(2x + 3y)/5$

*Statement (1)*: 2x + 3y = 280
- Average speed = 280/5 = 56 mph → *SUFFICIENT*

*Statement (2)*: y = x + 10
- Average = (2x + 3(x+10))/5 = (5x + 30)/5 = x + 6
- Still depends on x → *NOT sufficient*

#info-box[
  *Answer: (A)* - Statement (1) ALONE is sufficient
]

#v(1fr)

= Key Takeaways

== Summary

#v(0.5fr)

#grid(
  columns: (1fr, 1fr),
  gutter: 20pt,
  [
    *Remember:*
    - You're testing *sufficiency*, not solving
    - Memorize the 5 answer choices
    - Use the AD/BCE method systematically
    - Test values when in doubt
  ],
  [
    *Watch out for:*
    - Hidden constraints in the stem
    - Dependent equations (same line)
    - $x^2$ and $|x|$ giving two solutions
    - Calculating when you don't need to
  ]
)

#v(0.5fr)

#tip-box[
  *Golden Rule*: If you can determine a unique value (or definite yes/no), it's sufficient. If multiple values are possible, it's not.
]

#v(1fr)

== Practice Tips

#v(0.5fr)

1. *Time yourself*: Aim for 1.5-2 minutes per DS question

2. *Write down the decision tree*: AD or BCE after testing (1)

3. *Don't calculate final answers*: Just confirm you *could*

4. *Check constraints*: Re-read the question stem for limits

5. *Combine carefully*: Don't assume (C) - verify both pieces help

#v(0.5fr)

#warning-box[
  *Next Steps*: Practice with Official Guide questions and track your accuracy by answer choice (A), (B), (C), (D), (E)
]

#v(1fr)
