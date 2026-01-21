#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"
#import "@preview/cetz-plot:0.1.1"

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Data Sufficiency",
  level: "Lesson Material",
  intro: "Comprehensive guide covering Data Sufficiency question format, the AD/BCE method, value vs. yes/no questions, and common traps.",
  logo: "/Logo.png"
)

= Lesson Overview

*Topic:* Data Sufficiency (DS)\
*Section:* Data Insights\
*Lesson Sequence:* DI-01 (First of 5 DI topics)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Understand the unique DS question format and answer choices
2. Apply the AD/BCE method systematically
3. Distinguish between value questions and yes/no questions
4. Evaluate sufficiency without solving completely
5. Recognize common DS traps and patterns
6. Manage time effectively on DS questions

== GMAT Relevance

Data Sufficiency is unique to the GMAT and appears exclusively in the Data Insights section. Students often find DS challenging initially because it requires a different mindset from traditional problem-solving.

#pagebreak()

= Part 1: DS Format and Answer Choices

== Question Structure

#info-box[
  *Every DS Question Has:*
  1. A question stem (what you're trying to find)
  2. Statement (1)
  3. Statement (2)
  4. Five fixed answer choices (always the same)
]

== The Five Answer Choices

#warning-box[
  *MEMORIZE THESE - They Never Change:*

  *(A)* Statement (1) ALONE is sufficient, but statement (2) alone is NOT sufficient

  *(B)* Statement (2) ALONE is sufficient, but statement (1) alone is NOT sufficient

  *(C)* BOTH statements TOGETHER are sufficient, but NEITHER alone is sufficient

  *(D)* EACH statement ALONE is sufficient

  *(E)* Statements (1) and (2) TOGETHER are NOT sufficient
]

#tip-box[
  *Memory Aid:*
  - A = 1 Alone
  - B = 2 alone (B for Both #2)
  - C = Combined
  - D = each inDependently (or "Double" - both work alone)
  - E = Even together, not Enough
]

#pagebreak()

= Part 2: The AD/BCE Method

== Systematic Approach

#strategy-box[
  *The AD/BCE Method:*

  *Step 1:* Evaluate Statement (1) ALONE (forget Statement 2 exists)
  - If sufficient → Answer is A or D (narrow to "AD")
  - If insufficient → Answer is B, C, or E (narrow to "BCE")

  *Step 2:* Evaluate Statement (2) ALONE (forget Statement 1 exists)
  - If in "AD" group:
    - (2) sufficient → Answer is D
    - (2) insufficient → Answer is A
  - If in "BCE" group:
    - (2) sufficient → Answer is B
    - (2) insufficient → Test together for C or E

  *Step 3 (if needed):* Combine both statements
  - If together sufficient → Answer is C
  - If still insufficient → Answer is E
]

== Visual Flowchart

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Colors
    let suff_color = rgb("#27ae60")
    let not_suff_color = rgb("#c0392b")
    let question_bg = rgb("#ecf0f1")
    let ad_bg = rgb("#d5f5e3")
    let bce_bg = rgb("#fadbd8")
    let answer_bg = rgb("#3498db")

    // Layout - cleaner vertical spacing
    let col_left = -4
    let col_right = 4
    let row1 = 6      // Start question
    let row2 = 4      // AD/BCE groups
    let row3 = 2      // Statement 2 question
    let row4 = 0      // Final answers

    // ========== ROW 1: Start Question ==========
    rect((-2.6, row1 - 0.5), (2.6, row1 + 0.5), fill: question_bg, stroke: 1.5pt + black, radius: 8pt)
    content((0, row1), text(size: 11pt, weight: "bold")[Is Statement (1) sufficient?])

    // ========== Branches from Start ==========
    // Left branch - Sufficient
    line((-0.8, row1 - 0.5), (col_left, row2 + 0.5), stroke: suff_color + 2pt)
    content((-2.8, row2 + 1.3), text(size: 9pt, fill: suff_color, weight: "bold")[YES])

    // Right branch - Not Sufficient
    line((0.8, row1 - 0.5), (col_right, row2 + 0.5), stroke: not_suff_color + 2pt)
    content((2.8, row2 + 1.3), text(size: 9pt, fill: not_suff_color, weight: "bold")[NO])

    // ========== ROW 2: AD and BCE Groups ==========
    // AD Group
    rect((col_left - 1.5, row2 - 0.5), (col_left + 1.5, row2 + 0.5), fill: ad_bg, stroke: suff_color + 1.5pt, radius: 8pt)
    content((col_left, row2), text(size: 11pt, weight: "bold")[A or D])

    // BCE Group
    rect((col_right - 1.5, row2 - 0.5), (col_right + 1.5, row2 + 0.5), fill: bce_bg, stroke: not_suff_color + 1.5pt, radius: 8pt)
    content((col_right, row2), text(size: 11pt, weight: "bold")[B, C, or E])

    // ========== ROW 3: Statement 2 Questions ==========
    // Left side - Test (2) for AD
    rect((col_left - 2, row3 - 0.4), (col_left + 2, row3 + 0.4), fill: question_bg, stroke: 1pt + black, radius: 6pt)
    content((col_left, row3), text(size: 9pt)[Is Statement (2) sufficient?])

    // Right side - Test (2) for BCE
    rect((col_right - 2, row3 - 0.4), (col_right + 2, row3 + 0.4), fill: question_bg, stroke: 1pt + black, radius: 6pt)
    content((col_right, row3), text(size: 9pt)[Is Statement (2) sufficient?])

    // Connecting lines from groups to questions
    line((col_left, row2 - 0.5), (col_left, row3 + 0.4), stroke: gray + 1pt)
    line((col_right, row2 - 0.5), (col_right, row3 + 0.4), stroke: gray + 1pt)

    // ========== ROW 4: Final Answers ==========

    // --- Left side (AD) answers ---
    // D answer (Yes from AD)
    line((col_left - 0.8, row3 - 0.4), (col_left - 1.5, row4 + 0.45), stroke: suff_color + 2pt)
    content((col_left - 1.8, row3 - 0.9), text(size: 8pt, fill: suff_color, weight: "bold")[YES])
    circle((col_left - 1.5, row4), radius: 0.45, fill: answer_bg, stroke: none)
    content((col_left - 1.5, row4), text(size: 14pt, weight: "bold", fill: white)[D])

    // A answer (No from AD)
    line((col_left + 0.8, row3 - 0.4), (col_left + 1.5, row4 + 0.45), stroke: not_suff_color + 2pt)
    content((col_left + 1.8, row3 - 0.9), text(size: 8pt, fill: not_suff_color, weight: "bold")[NO])
    circle((col_left + 1.5, row4), radius: 0.45, fill: answer_bg, stroke: none)
    content((col_left + 1.5, row4), text(size: 14pt, weight: "bold", fill: white)[A])

    // --- Right side (BCE) answers ---
    // B answer (Yes from BCE)
    line((col_right - 0.8, row3 - 0.4), (col_right - 1.5, row4 + 0.45), stroke: suff_color + 2pt)
    content((col_right - 1.8, row3 - 0.9), text(size: 8pt, fill: suff_color, weight: "bold")[YES])
    circle((col_right - 1.5, row4), radius: 0.45, fill: answer_bg, stroke: none)
    content((col_right - 1.5, row4), text(size: 14pt, weight: "bold", fill: white)[B])

    // Combined test node (No from BCE)
    line((col_right + 0.8, row3 - 0.4), (col_right + 1.5, row4 + 1.1), stroke: not_suff_color + 2pt)
    content((col_right + 1.8, row3 - 0.9), text(size: 8pt, fill: not_suff_color, weight: "bold")[NO])

    // "Together?" box
    rect((col_right + 0.3, row4 + 0.6), (col_right + 2.7, row4 + 1.4), fill: question_bg, stroke: 1pt + black, radius: 5pt)
    content((col_right + 1.5, row4 + 1), text(size: 8pt)[Together?])

    // C answer (Yes from Together)
    line((col_right + 0.8, row4 + 0.6), (col_right + 0.5, row4 - 0.6 + 0.45), stroke: suff_color + 2pt)
    content((col_right + 0.2, row4 + 0.2), text(size: 7pt, fill: suff_color)[YES])
    circle((col_right + 0.5, row4 - 0.6), radius: 0.4, fill: answer_bg, stroke: none)
    content((col_right + 0.5, row4 - 0.6), text(size: 13pt, weight: "bold", fill: white)[C])

    // E answer (No from Together)
    line((col_right + 2.2, row4 + 0.6), (col_right + 2.5, row4 - 0.6 + 0.4), stroke: not_suff_color + 2pt)
    content((col_right + 2.8, row4 + 0.2), text(size: 7pt, fill: not_suff_color)[NO])
    circle((col_right + 2.5, row4 - 0.6), radius: 0.4, fill: answer_bg, stroke: none)
    content((col_right + 2.5, row4 - 0.6), text(size: 13pt, weight: "bold", fill: white)[E])

    // ========== Legend ==========
    content((0, -1.5), text(size: 9pt)[
      #box(fill: suff_color, width: 20pt, height: 3pt) Sufficient (YES)
      #h(1.5em)
      #box(fill: not_suff_color, width: 20pt, height: 3pt) Not Sufficient (NO)
      #h(1.5em)
      #box(fill: answer_bg, width: 10pt, height: 10pt, radius: 5pt) Answer
    ])
  })
]

#tip-box[
  *How to Use the Flowchart:*
  1. Start at the top: Test Statement (1) alone
  2. If (1) is sufficient → go left to "A or D" group
  3. If (1) is NOT sufficient → go right to "B, C, or E" group
  4. Then test Statement (2) alone to narrow down to your final answer
  5. Only test "Together" if you're in BCE and (2) alone is also insufficient
]

#pagebreak()

= Part 3: Value Questions vs. Yes/No Questions

== Value Questions

#info-box[
  *Value Questions ask for a specific value:*
  - "What is x?"
  - "What is the value of y?"
  - "How many students are in the class?"

  *Sufficiency Requirement:* You must be able to determine ONE SPECIFIC value.

  If a statement gives you two possible values, it is NOT sufficient.
]

#example-box[
  *Question: What is $x$?*

  *(1)* $x^2 = 16$

  $x$ could be 4 OR $-4$ → Statement (1) is NOT sufficient (two possible values)
]

== Yes/No Questions

#info-box[
  *Yes/No Questions have yes or no answers:*
  - "Is x positive?"
  - "Is n divisible by 3?"
  - "Is the triangle equilateral?"

  *Sufficiency Requirement:* You must get a DEFINITE yes OR a DEFINITE no.

  *Critical:* A definite "NO" IS sufficient!
]

#example-box[
  *Question: Is $x > 0$?*

  *(1)* $x^2 = 16$

  $x$ could be 4 (yes, positive) OR $-4$ (no, negative)\
  Sometimes yes, sometimes no → NOT sufficient

  *(1)* $x = -5$

  $x$ is definitely negative → Definite NO → SUFFICIENT!
]

#warning-box[
  *Common Mistake:* Thinking a "no" answer means insufficient.

  For yes/no questions, EITHER a consistent yes OR a consistent no is sufficient.
  Only inconsistent answers (sometimes yes, sometimes no) are insufficient.
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Value Question visualization (left)
    content((-4, 4), text(size: 10pt, weight: "bold")[Value Question])
    content((-4, 3.4), text(size: 8pt)["What is $x$?"])

    // Sufficient case
    rect((-6.5, 1.8), (-1.5, 2.8), fill: rgb("#d5f5e3"), stroke: rgb("#27ae60") + 1pt, radius: 3pt)
    content((-4, 2.5), text(size: 9pt, fill: rgb("#27ae60"), weight: "bold")[SUFFICIENT])
    content((-4, 2.1), text(size: 8pt)[One value: $x = 5$])

    // Insufficient case
    rect((-6.5, 0.3), (-1.5, 1.3), fill: rgb("#fadbd8"), stroke: rgb("#e74c3c") + 1pt, radius: 3pt)
    content((-4, 1), text(size: 9pt, fill: rgb("#e74c3c"), weight: "bold")[NOT SUFFICIENT])
    content((-4, 0.6), text(size: 8pt)[Two values: $x = 4$ or $x = -4$])

    // Yes/No Question visualization (right)
    content((4, 4), text(size: 10pt, weight: "bold")[Yes/No Question])
    content((4, 3.4), text(size: 8pt)["Is $x > 0$?"])

    // Sufficient YES
    rect((1.5, 2.3), (3.5, 3), fill: rgb("#d5f5e3"), stroke: rgb("#27ae60") + 1pt, radius: 3pt)
    content((2.5, 2.65), text(size: 8pt, fill: rgb("#27ae60"), weight: "bold")[Always YES])

    // Sufficient NO
    rect((4.5, 2.3), (6.5, 3), fill: rgb("#d5f5e3"), stroke: rgb("#27ae60") + 1pt, radius: 3pt)
    content((5.5, 2.65), text(size: 8pt, fill: rgb("#27ae60"), weight: "bold")[Always NO])

    // Bracket for sufficient
    line((2.5, 2.2), (2.5, 1.9), stroke: 0.8pt)
    line((5.5, 2.2), (5.5, 1.9), stroke: 0.8pt)
    line((2.5, 1.9), (5.5, 1.9), stroke: 0.8pt)
    line((4, 1.9), (4, 1.6), stroke: 0.8pt)
    content((4, 1.3), text(size: 8pt, fill: rgb("#27ae60"))[Both are SUFFICIENT])

    // Insufficient case
    rect((1.5, 0.1), (6.5, 1), fill: rgb("#fadbd8"), stroke: rgb("#e74c3c") + 1pt, radius: 3pt)
    content((4, 0.7), text(size: 9pt, fill: rgb("#e74c3c"), weight: "bold")[NOT SUFFICIENT])
    content((4, 0.35), text(size: 8pt)[Sometimes YES, sometimes NO])
  })
]

#pagebreak()

= Part 4: Sufficiency Without Solving

== The Key Insight

#strategy-box[
  *You Don't Need to Solve - Just Determine if You COULD Solve*

  DS questions ask: "Is the information enough to answer?"
  Not: "What is the answer?"

  Often you can determine sufficiency without calculating the final value.
]

#example-box[
  *What is the perimeter of rectangle R?*

  *(1)* The area of R is 24
  *(2)* The diagonal of R is 10

  Don't calculate! Think:
  - (1) Area alone: $l w = 24$. Multiple possibilities ($3 times 8$, $4 times 6$, $2 times 12$). NOT sufficient.
  - (2) Diagonal alone: $l^2 + w^2 = 100$. Multiple possibilities. NOT sufficient.
  - Together: $l w = 24$ AND $l^2 + w^2 = 100$. Two equations, two unknowns. SUFFICIENT!

  Answer: C (without calculating that $l=6$, $w=4$, perimeter$=20$)
]

== Testing Numbers

#tip-box[
  *Quick Testing Strategy:*

  For insufficiency: Find TWO different scenarios that satisfy the statement(s) but give different answers.

  For sufficiency: Verify that only ONE answer is possible (or consistent yes/no).
]

#pagebreak()

= Part 5: Common DS Traps

== Trap 1: Hidden Constraints in the Question Stem

#warning-box[
  *Watch for constraints like:*
  - "positive integer n"
  - "x and y are different prime numbers"
  - "consecutive integers"

  These limit possibilities and may affect sufficiency!
]

#example-box[
  *What is the value of positive integer $n$?*

  *(1)* $n < 3$

  Without "positive integer": $n$ could be 2, 1, 0, $-1$, etc. → NOT sufficient\
  With "positive integer": $n$ must be 1 or 2 → Still NOT sufficient (two values)

  But if the question said "positive integer $n$ greater than 1":\
  Then $n < 3$ means $n = 2$ exactly → SUFFICIENT
]

== Trap 2: Statement Interaction

#warning-box[
  *Evaluate each statement completely independently first.*

  When evaluating (2), pretend (1) doesn't exist.
  Don't accidentally use information from (1) when testing (2) alone.
]

== Trap 3: Assuming Variables Are Integers

#warning-box[
  *Unless stated, variables can be:*
  - Fractions
  - Decimals
  - Negative numbers
  - Zero

  Don't assume integers unless explicitly told!
]

== Trap 4: Not Recognizing Algebraic Equivalence

#example-box[
  *If the question asks for x + y, and a statement tells you 2x + 2y = 10:*

  $2x + 2y = 10$\
  $2(x + y) = 10$\
  $x + y = 5$ #sym.checkmark

  The statement IS sufficient for finding $x + y$, even though it doesn't give $x$ or $y$ individually.
]

#pagebreak()

= Part 6: DS Question Categories

== Number Properties DS

Common patterns:
- Divisibility questions
- Even/odd determination
- Prime factorization

#tip-box[
  For "Is n divisible by X?" questions, look for factors in the statements.
]

== Geometry DS

Common patterns:
- Finding area/perimeter with partial information
- Properties of triangles, circles, quadrilaterals

#tip-box[
  For geometry DS, often you need enough info to determine ALL dimensions, even if the question asks for just one.
]

== Algebra DS

Common patterns:
- Solving for a specific variable or expression
- Systems of equations
- Quadratics (watch for two solutions!)

#tip-box[
  For "What is $x$?" with quadratics: if you get $x^2 =$ value, usually two solutions → insufficient (unless constraints eliminate one).
]

#pagebreak()

= Part 7: Time Management for DS

== Pacing Guidelines

#info-box[
  *Target Time:* 1.5-2 minutes per DS question

  DS questions should be among your faster question types in DI. If you're spending 3+ minutes, you're probably overcomplicating it.
]

== Efficiency Tips

#strategy-box[
  1. *Read the question stem carefully first* - understand what you're solving for
  2. *Simplify if possible* - rephrase the question in simpler terms
  3. *Evaluate (1) completely before looking at (2)*
  4. *Don't calculate more than necessary* - stop when sufficiency is determined
  5. *Use number testing strategically* - quick tests can reveal insufficiency
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. Answer choice memorization (essential!)
2. AD/BCE method step-by-step
3. Value questions practice
4. Basic sufficiency testing

*Question Time:* 5-6 straightforward DS questions focusing on method

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Yes/No questions (the "definite no" concept)
2. Common traps (hidden constraints, algebraic equivalence)
3. Sufficiency without solving
4. DS categories (number properties, geometry, algebra)

*Review errors from Training #1, focusing on:*
- Answer choice confusion
- Testing (2) with information from (1)
- Thinking "no" means insufficient

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Quick sufficiency recognition
- Time management strategies

*Assessment:* 20 questions, 45 minutes

== Common Student Difficulties

1. Memorizing the five answer choices
2. Evaluating (2) without using (1)
3. Understanding that a definite "no" is sufficient
4. Oversolving when just checking sufficiency
5. Missing hidden constraints in question stem

#warning-box[
  *Tutor Tip:* Have students verbalize the AD/BCE method while working through problems until it becomes automatic.
]
