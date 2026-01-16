#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Quantitative Reasoning - Overview_],
        [
          #figure(
            image("../../Logo.png", width: 2cm)
          )
        ]
      )
      line(length: 100%, stroke: 0.5pt + rgb("#4caf50"))
    }
  },
  numbering: "1",
  footer: context {
    let page-num = counter(page).get().first()
    if page-num > 1 {
      align(center)[
        #line(length: 100%, stroke: 0.5pt + rgb("#4caf50"))
        #v(0.3em)
        #text(size: 9pt, fill: rgb("#021d49"))[
          Page #page-num | UpToTen - Learn Stem More
        ]
      ]
    }
  }
)

#set text(
  font: "Arial",
  size: 11pt,
  lang: "en",
)

#set par(
  justify: true,
  leading: 0.65em,
)

#set heading(numbering: "1.")

// UpToTen Brand Colors
#let uptoten-blue = rgb("#021d49")
#let uptoten-green = rgb("#4caf50")
#let uptoten-orange = rgb("#ffb606")

// Custom styled boxes
#let info-box(content) = box(
  fill: uptoten-blue.lighten(95%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  content
)

#let tip-box(content) = box(
  fill: uptoten-green.lighten(90%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  content
)

#let warning-box(content) = box(
  fill: uptoten-orange.lighten(90%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  content
)

// Title page
#align(center)[
  #v(2cm)
  #figure(
    image("../../Logo.png", width: 7cm)
  )
  #v(1em)
  #text(size: 28pt, weight: "bold", fill: uptoten-blue)[GMAT]
  #v(0.1em)
  #text(size: 24pt, weight: "bold", fill: uptoten-blue)[Quantitative Reasoning]
  #v(0.5em)
  #text(size: 16pt, fill: uptoten-green)[Section Overview]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    A comprehensive introduction to the GMAT Quantitative Reasoning section, including format, scoring, question types, and essential strategies for success.\
    \
    This guide will help you understand what to expect and how to approach this critical section of the GMAT exam.
  ]
  #v(2.5cm)
  #text(size: 10pt, fill: gray)[
    Via G. Frua 21/6, Milano | www.uptoten.it
  ]
  #v(1.5cm)
  #block(
    width: 100%,
    inset: 10pt,
    stroke: 0.5pt + gray,
    radius: 3pt,
    [
      #set text(size: 7pt, fill: gray)
      #set par(justify: true, leading: 0.5em)
      *Trademark Notice:* GMAT™ is a trademark of the Graduate Management Admission Council (GMAC). This material is not endorsed by, affiliated with, or associated with GMAC. All GMAT-related trademarks are the property of their respective owners.

      *Copyright & Distribution Notice:* This document is proprietary educational material of UpToTen. All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means without prior written permission. Unauthorized copying, sharing, or redistribution is strictly prohibited.

      *Educational Purpose:* This material is intended solely for educational purposes to help students prepare for standardized tests.
    ]
  )
]

#pagebreak()

= Introduction to Quantitative Reasoning

The Quantitative Reasoning (QR) section of the GMAT measures your ability to reason mathematically and solve quantitative problems. This is not simply a "math test" - it assesses your analytical reasoning abilities using mathematical concepts.

#tip-box[
  *Key Mindset Shift*

  A GMAT psychometrician clarified: "There is no math section on the GMAT. There's only quantitative reasoning." Students perform better when they stop thinking of it as "math" and start thinking of it as "quantitative reasoning."
]

== What the Section Measures

The Quantitative Reasoning section evaluates:

- Your algebraic and arithmetic foundational knowledge
- How you apply this knowledge to solve problems
- Your ability to reason under pressure
- Pattern recognition and logical thinking
- Decision-making skills when choosing solution strategies

#v(0.5em)

#warning-box[
  *Important*: The GMAT doesn't test advanced mathematics like calculus or trigonometry. It tests how well you can think analytically using fundamental mathematical concepts.
]

== Section Format at a Glance

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Aspect*], [*Details*],
  [Number of Questions], [21 multiple-choice questions],
  [Time Allowed], [45 minutes],
  [Question Type], [Problem Solving only],
  [Calculator], [*NOT available* in this section],
  [Adaptive Format], [Item-level computer adaptive],
  [Average Time per Question], [Approximately 2 minutes, 9 seconds],
)

#pagebreak()

= Understanding the Computer Adaptive Format

The GMAT Quantitative Reasoning section uses item-level adaptive testing, which has important implications for your test-taking strategy.

== How Adaptive Testing Works

1. *First Question*: You receive a question of medium difficulty

2. *Subsequent Questions*: The computer scores each answer and uses it - along with all your previous responses - to select the next question

3. *Correct Answers*: Generally lead to slightly harder questions

4. *Incorrect Answers*: Generally lead to slightly easier questions

5. *Final Assessment*: By section end, the computer has an accurate assessment of your ability level

#info-box[
  *Important Understanding*

  If you get a question that seems easier, it doesn't necessarily mean you answered the last question incorrectly. The test must cover a range of content types and subject matter. Your score is determined by the difficulty and statistical characteristics of the questions you answer, as well as the number of questions you answer correctly.
]

== Key Implications for Test-Takers

#tip-box[
  *What This Means for You*

  1. You cannot skip questions - you must answer each before moving on
  2. You can bookmark questions for later review
  3. You can review and change up to *3 answers* per section at the end
  4. Time spent reviewing counts against your section time
  5. Random guessing can significantly lower your score
]

== Recovery from Mistakes

Whether you answer a question incorrectly by mistake or correctly by lucky guess, your answers to later questions will lead you back to questions at the appropriate difficulty level for you. One bad question doesn't ruin your score - letting it disrupt your rhythm does.

#pagebreak()

= Question Type: Problem Solving

The GMAT Quantitative Reasoning section contains only one question type: *Problem Solving*.

== Format

Each Problem Solving question consists of:
- A quantitative problem (may include text, equations, or data)
- Five answer choices (preceded by radio buttons)
- You select the single best answer

== Content Areas Tested

Problem Solving questions cover these main mathematical areas:

#table(
  columns: (1fr, 2fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Category*], [*Topics Included*],
  [Arithmetic], [Number properties, fractions, decimals, percents, ratios, exponents, roots, basic statistics],
  [Algebra], [Algebraic expressions, equations, inequalities, functions, graphing],
  [Word Problems], [Rate/work problems, mixture problems, sets, probability, basic combinatorics],
  [Number Properties], [Integer properties, factors, multiples, divisibility, remainders, primes],
)

#warning-box[
  *Note*: Questions related to Geometry are *no longer included* in the GMAT Quantitative Reasoning section as of the GMAT Focus Edition.
]

== Topic Distribution

Understanding the frequency of topics helps you prioritize your study time:

#tip-box[
  *Priority Topics*

  Algebra, arithmetic, and number properties appear in *more than two-thirds* of GMAT quant questions. Give these topics priority in your preparation.

  Although many students obsess over more exotic topics (such as combinatorics, probability, and rates), these topics collectively represent *less than 10%* of Problem Solving questions.
]

#pagebreak()

= Scoring and Its Implications

== Score Range

- *Section Score*: 60 to 90 (in 1-point increments)
- *Total GMAT Score*: 205 to 805 (in 10-point increments)

The Total GMAT score is based on all three section scores (Quantitative Reasoning, Verbal Reasoning, and Data Insights). It is *not* a simple sum of the three section scores.

== What the Score Means

Your GMAT scores are one tool schools use to predict how well you might perform in their programs. Admissions officers consider your scores along with:
- Undergraduate record
- Application essays
- Interviews
- Letters of recommendation

== Percentile Rankings

Your score report includes percentile rankings that show how you performed relative to other test-takers. A score in the 80th percentile means you scored higher than 80% of test-takers.

#info-box[
  *Realistic Expectations*

  Because the GMAT is an adaptive test, most test-takers will answer *30-50% of all quant questions incorrectly* - even if they ultimately get an excellent quant score. Be prepared to guess and move on when you're overmatched.
]

= Time Management Strategy

With 21 questions in 45 minutes, you have approximately *2 minutes and 9 seconds* per question. Effective time management is crucial.

== Pacing Guidelines

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-green.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Checkpoint*], [*Target*],
  [After 7 questions], [~15 minutes elapsed],
  [After 14 questions], [~30 minutes elapsed],
  [After 21 questions], [45 minutes (section complete)],
)

== Critical Time Management Principles

#tip-box[
  *The Best Strategy*

  The best time management strategy for GMAT Problem Solving is to *avoid wasting time on questions that you can't solve efficiently*. You're better off guessing and moving on than sinking into a black hole.

  Pro scorers don't fear skipping a question - they fear wasting energy. One bad question doesn't ruin your score. Letting it hijack your rhythm does.
]

#pagebreak()

= Essential Problem-Solving Strategies

Success on the Quantitative Reasoning section requires more than mathematical knowledge. You need strategic flexibility.

== The Understand, Plan, Solve Process

Follow this structured approach for every question:

=== Step 1: Understand

- *Glance* at the answers and question stem
- Look for anything that jumps out (ugly equation, diagram, estimation opportunity)
- *Read* the question stem carefully
- Focus on understanding what it's telling you and what it's asking
- *Jot down* what it's asking, along with any other useful info

=== Step 2: Plan

- *Reflect* on what you know so far
- Lost? Guess and move on
- If you understand everything, consider your best plan:
  - Can you estimate? How heavily?
  - Can you use a real number and just do arithmetic?
  - Is there a way to draw or logic it out?
  - Would backsolving work?

=== Step 3: Solve

- Execute your chosen strategy
- Keep work organized on scratch paper
- Verify your answer makes sense

== Multiple Solution Techniques

#info-box[
  *Flexibility is Key*

  The most important component to success in GMAT Problem Solving is learning how to *choose the best strategy* for getting a solution quickly and efficiently - and be *flexible* in that choice.

  Business schools want creative, flexible problem solvers, not rote math machines!
]

The techniques you should master include:

1. *Traditional Algebra*: Direct mathematical calculation
2. *Backsolving*: Testing answer choices in the problem
3. *Number Picking*: Substituting easy numbers for variables
4. *Estimation*: Approximating to eliminate wrong answers
5. *Conceptual Thinking*: Using logic without calculation

#pagebreak()

== Strategy Selection Guide

#table(
  columns: (1fr, 2fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Situation*], [*Best Strategy*],
  [Variables in answer choices], [Number Picking],
  [Numeric answer choices], [Backsolving (start with middle value)],
  [Answers are spread apart], [Estimation],
  [Ratios or percents without specific numbers], [Number Picking (choose easy values)],
  [Simple calculations required], [Traditional Algebra],
  [Complex-looking but can be simplified], [Conceptual Thinking],
)

== Read Questions Carefully

#warning-box[
  *Avoid Careless Mistakes*

  Many students miss GMAT Problem Solving questions not because they fail to understand the math, but because they *miss a key detail* in the question.

  The best approach is to read the question *twice*, and then plot your path forward towards a solution.
]

== Use Answer Choices Strategically

The GMAT doesn't care whether you can calculate the answer exactly. It cares only that you pick the right answer letter - and that's not the same thing as saying you have to calculate exactly.

- *Eliminate* clearly wrong answers first
- *Use the answers* to guide your approach
- *Estimate* when precision isn't needed

#pagebreak()

= Calculator Policy

#warning-box[
  *Critical Information*

  You do *NOT* have access to a calculator in the Quantitative Reasoning section. The calculator is only available in the Data Insights section.
]

== Implications for Your Preparation

Since you cannot use a calculator:

1. *Build mental math fluency*: Practice calculations without a calculator
2. *Master estimation*: Learn to approximate quickly
3. *Simplify before calculating*: Look for ways to reduce complexity
4. *Use number properties*: Leverage divisibility rules, patterns, etc.

#tip-box[
  *Practice Tip*

  Get used to using scratch paper for calculations and double-checking your work. Spend time practicing multiplying and dividing fractions and decimals without a calculator, as you'll have to do both on the GMAT.
]

= Common Mistakes to Avoid

== Strategic Errors

1. *Using only one approach*: Always doing algebra when backsolving would be faster
2. *Spending too long on one question*: Missing easier questions later
3. *Not reading carefully*: Missing key words or conditions
4. *Random guessing too early*: Not eliminating answers first
5. *Checking work excessively*: Wasting time on questions you've already solved

== Content Errors

1. *Sign errors*: Forgetting negative signs or mishandling them
2. *Order of operations*: Not following PEMDAS correctly
3. *Unit confusion*: Mixing up units in word problems
4. *Assumption errors*: Assuming information not given in the problem

#pagebreak()

= Preparation Recommendations

== Study Plan Components

#info-box[
  *Effective Preparation Strategy*

  1. *Create a schedule*: Divide your time and ensure you follow your plan
  2. *Master core topics*: Get a strong understanding of Algebra and Arithmetic
  3. *Practice calculations*: Use formulas to resolve questions quickly
  4. *Avoid calculators*: Focus on mental math tips and tricks
  5. *Practice multiple strategies*: Work on different question approaches
  6. *Focus on time management*: It's crucial for the GMAT exam
]

== Recommended Resources

- *Official GMAT Practice Exams*: Experience the real testing environment
- *GMAT Official Guide*: Contains real questions from past exams
- *Flashcards*: For concepts that need repetition to solidify

== Error Analysis

#tip-box[
  *Personalized Error Log*

  Your most powerful (and underrated) tool. Record the "why" behind every mistake.

  Understanding why you made mistakes is more valuable than just knowing what the right answer was. Look for patterns in your errors to target your study.
]

== Build Mental Resilience

GMAT quant is mentally demanding. You'll face unexpected twists, tight clocks, and self-doubt. Top scorers prepare their mindset like athletes:

- *Rehearse pressure*: Practice under timed conditions
- *Study emotional patterns*: Know how you react to difficulty
- *Develop reset rituals*: Have strategies to recover quickly when things go wrong

*Confidence isn't a feeling - it's a trained response to stress.*

#pagebreak()

= Test Day Strategies

== Before the Section

- Choose your section order strategically (you can select the order)
- Use your optional break wisely (one break allowed during the exam)
- Clear your mind before starting

== During the Section

1. *Monitor the clock*: Check periodically but don't obsess
2. *Use the bookmark feature*: Flag questions you want to review
3. *Keep pace*: Don't fall behind - guess if necessary
4. *Stay calm*: One hard question doesn't define your score

== Final Minutes

- Review bookmarked questions if time allows
- Change answers only if you're confident (max 3 changes)
- Don't leave any question unanswered

#warning-box[
  *Critical Warning*

  If you don't finish the section, your score will be severely penalized. Each unanswered question reduces your score. *Always complete the section*, even if you must guess on the final questions.
]

= Next Steps

This overview has introduced you to the Quantitative Reasoning section's format, strategies, and expectations. To build the skills you need:

1. *Study Fundamentals*: Master the core mathematical concepts
2. *Practice Core Techniques*: Develop proficiency with all solution
3. *Achieve Excellence*: Learn advanced optimization techniques

#align(center)[
  #v(1em)
  #text(size: 12pt, weight: "bold", fill: uptoten-green)[
    Remember: It's not about being a math genius. It's about mastering how to think like the GMAT.
  ]
]
