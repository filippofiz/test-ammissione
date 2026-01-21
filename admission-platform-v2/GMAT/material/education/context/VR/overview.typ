#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Verbal Reasoning - Overview_],
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
  #text(size: 24pt, weight: "bold", fill: uptoten-blue)[Verbal Reasoning]
  #v(0.5em)
  #text(size: 16pt, fill: uptoten-green)[Section Overview]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    A comprehensive introduction to the GMAT Verbal Reasoning section, including format, scoring, question types, and essential strategies for success.\
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

= Introduction to Verbal Reasoning

The Verbal Reasoning (VR) section of the GMAT measures your ability to read and comprehend written material, analyze and evaluate complex scenarios, and draw logical inferences from arguments. This section tests critical thinking skills that are essential for success in business school.

#tip-box[
  *Key Mindset Shift*

  The GMAT Verbal section isn't about testing your vocabulary or grammar knowledge. It's about evaluating your ability to *reason critically* with written information - a skill crucial for analyzing business cases, evaluating proposals, and making strategic decisions.
]

== What the Section Measures

The Verbal Reasoning section evaluates:

- Your ability to read and comprehend written material
- How you analyze and evaluate complex arguments
- Your skill in drawing logical inferences and conclusions
- Critical thinking under time pressure
- Understanding of logical relationships and reasoning patterns

#v(0.5em)

#warning-box[
  *Important*: You don't need specialized knowledge of the topics covered in reading passages or critical reasoning questions. All answers can be found or deduced from the information provided.
]

== Section Format at a Glance

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Aspect*], [*Details*],
  [Number of Questions], [23 multiple-choice questions],
  [Time Allowed], [45 minutes],
  [Question Types], [Reading Comprehension and Critical Reasoning],
  [Adaptive Format], [Item-level computer adaptive],
  [Average Time per Question], [Approximately 1 minute, 57 seconds],
)

#pagebreak()

= Understanding the Computer Adaptive Format

The GMAT Verbal Reasoning section uses item-level adaptive testing, which has important implications for your test-taking strategy.

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

= Question Types Overview

The GMAT Verbal Reasoning section contains two question types: *Reading Comprehension* and *Critical Reasoning*.

== Reading Comprehension

=== Format

- Passages up to approximately 350 words
- Each passage comes with several questions (typically 3-4)
- Questions may ask you to interpret, draw inferences, or apply information

=== Passage Topics

#table(
  columns: (1fr, 2fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Category*], [*Topics Included*],
  [Social Sciences/Humanities], [History, psychology, sociology, philosophy, arts],
  [Physical/Biological Sciences], [Biology, chemistry, physics, environmental science],
  [Business-Related Fields], [Marketing, economics, human resource management, finance],
)

#warning-box[
  *Note*: You do NOT need specialized knowledge of these subject areas. All information needed to answer questions is contained within the passage.
]

=== Reading Comprehension Question Types

- *Main Idea*: What is the primary purpose or main point?
- *Supporting Ideas*: What specific details support the main argument?
- *Inference*: What can be logically concluded from the passage?
- *Application*: How would the author's reasoning apply to a new situation?
- *Logical Structure*: How is the argument organized?
- *Style and Tone*: What is the author's attitude or approach?

#pagebreak()

== Critical Reasoning

=== Format

- Short passages (usually under 100 words)
- Each passage presents a situation, argument, or scenario
- One question based on each passage
- Five answer choices

=== Critical Reasoning Question Types

#table(
  columns: (1fr, 2fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Question Type*], [*What It Asks*],
  [Strengthen], [Which choice best supports the argument?],
  [Weaken], [Which choice most undermines the argument?],
  [Assumption], [What must be true for the argument to work?],
  [Inference], [What conclusion can be drawn from the information?],
  [Evaluate], [What information would help assess the argument?],
  [Explain], [What resolves an apparent paradox or discrepancy?],
  [Flaw], [What logical error does the argument make?],
  [Bold-faced], [What role do the highlighted portions play?],
)

#info-box[
  *Key Insight*

  Critical Reasoning questions test your ability to analyze the structure of arguments - identifying premises, conclusions, and assumptions. Understanding these components is essential for success.
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

  The Verbal section can be challenging even for native English speakers because it tests logical reasoning rather than language proficiency. Focus on understanding argument structure rather than trying to sound "impressive."
]

= Time Management Strategy

With 23 questions in 45 minutes, you have approximately *1 minute and 57 seconds* per question. However, time should be allocated differently between question types.

== Pacing Guidelines

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-green.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Checkpoint*], [*Target*],
  [After 8 questions], [~15 minutes elapsed],
  [After 15 questions], [~30 minutes elapsed],
  [After 23 questions], [45 minutes (section complete)],
)

#pagebreak()

== Time Allocation by Question Type

#tip-box[
  *Strategic Time Distribution*

  - *Reading Comprehension*: Budget 6-8 minutes per passage (including all questions)
  - *Critical Reasoning*: Budget 2-2.5 minutes per question

  For Reading Comprehension, spend about 2-3 minutes reading the passage carefully, then 1-1.5 minutes per question.
]

== Critical Time Management Principles

#warning-box[
  *The Trap of Over-Reading*

  Don't read passages multiple times hoping to understand everything perfectly. Read actively once, then refer back for specific details as needed. Over-reading is the #1 time killer in Verbal.
]

#tip-box[
  *When to Move On*

  - If you've spent more than 3 minutes on a single CR question, guess and move on
  - If you've spent more than 8 minutes on an RC passage set, finish current question and move on
  - Don't let one difficult question derail your entire section
]

#pagebreak()

= Essential Verbal Reasoning Strategies

== Reading Comprehension Strategies

=== Active Reading Approach

Rather than passively reading, engage with the text:

1. *Identify the main point* in the first paragraph
2. *Note the structure*: How is the passage organized?
3. *Mark transitions*: Look for "however," "therefore," "in contrast"
4. *Identify the author's tone*: Positive, negative, neutral, critical?
5. *Summarize each paragraph mentally* in a few words

=== Passage Mapping

#info-box[
  *Create a Mental Map*

  As you read, note:
  - Paragraph 1: Main topic and author's position
  - Paragraph 2: Supporting point or counterargument
  - Paragraph 3: Examples, evidence, or conclusion

  This map helps you quickly locate information when answering questions.
]

=== Answering RC Questions

#tip-box[
  *The Evidence-Based Approach*

  1. Read the question carefully
  2. Try to answer in your own words before looking at choices
  3. Find evidence in the passage to support your answer
  4. Eliminate choices that lack textual support
  5. Choose the answer that best matches the evidence
]

#pagebreak()

== Critical Reasoning Strategies

=== Understanding Argument Structure

Every argument has:
- *Premises*: Facts or evidence presented
- *Conclusion*: What the author wants you to accept
- *Assumptions*: Unstated ideas the argument relies on

=== Identifying Argument Components

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Component*], [*Signal Words*],
  [Premises], [because, since, given that, for, as, whereas],
  [Conclusions], [therefore, thus, hence, so, clearly, must, should],
  [Contrast], [however, but, although, yet, nevertheless],
)

=== The Core Approach to CR Questions

#info-box[
  *Four-Step Process*

  1. *Read and identify*: What type of argument is this? What's the conclusion?
  2. *Understand the task*: What does the question ask you to do?
  3. *Predict*: Before looking at choices, what would strengthen/weaken/etc.?
  4. *Evaluate choices*: Compare each choice to your prediction
]

#pagebreak()

== Answer Choice Strategies

=== Elimination Techniques

#info-box[
  *Red Flags in Wrong Answers*

  - *Too extreme*: "always," "never," "all," "none"
  - *Out of scope*: Introduces new information not in passage
  - *Opposite*: Does the reverse of what's asked
  - *True but irrelevant*: Correct information but doesn't answer the question
  - *Partially correct*: Contains both right and wrong elements
]

=== Reading Answer Choices Carefully

#warning-box[
  *Common Traps*

  - Choices that sound good but don't address the actual question
  - Choices that are technically true but not the best answer
  - Choices that use words from the passage but twist the meaning
  - Extreme language that goes beyond what the passage states
]

#pagebreak()

= Common Mistakes to Avoid

== Reading Comprehension Errors

1. *Reading too quickly*: Missing key details and relationships
2. *Over-relying on memory*: Not going back to verify answers
3. *Falling for trap answers*: Choosing answers that sound right but lack support
4. *Bringing outside knowledge*: Using information not in the passage
5. *Missing the author's tone*: Confusing description with opinion

== Critical Reasoning Errors

1. *Misidentifying the conclusion*: Confusing premises with conclusions
2. *Ignoring scope*: Choosing answers that go beyond the argument
3. *Assuming too much*: Adding information not implied by the passage
4. *Confusing necessary and sufficient conditions*: Mixing up what must be true vs. what would be enough
5. *Not prephasing*: Jumping to answer choices without thinking first

#tip-box[
  *The "Out of Scope" Rule*

  If an answer choice introduces an idea not mentioned or implied in the passage, it's almost certainly wrong. The correct answer must be directly supported by the given information.
]

#pagebreak()

= Preparation Recommendations

== Study Plan Components

#info-box[
  *Effective Preparation Strategy*

  1. *Master argument structure*: Learn to identify premises, conclusions, assumptions
  2. *Practice active reading*: Develop passage mapping skills
  3. *Learn question types*: Know what each question type asks for
  4. *Build vocabulary in context*: Focus on understanding, not memorization
  5. *Practice timing*: Work under realistic time constraints
  6. *Review strategically*: Analyze why you missed questions, not just what the right answer was
]

== Recommended Resources

- *Official GMAT Practice Exams*: Experience the real testing environment
- *GMAT Official Guide*: Contains real questions from past exams
- *Quality reading material*: The Economist, Harvard Business Review, Scientific American

== Error Analysis

#tip-box[
  *Personalized Error Log*

  For every question you miss, record:
  - Question type
  - Why you chose the wrong answer
  - Why the right answer is correct
  - What you'll do differently next time

  Look for patterns in your errors to target your study.
]

== Build Reading Stamina

The Verbal section requires sustained concentration. Practice reading dense material regularly:

- Read challenging articles daily (business, science, social science)
- Summarize arguments in your own words
- Practice identifying assumptions in everyday arguments

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

This overview has introduced you to the Verbal Reasoning section's format, strategies, and expectations. To build the skills you need:

1. *Study Fundamentals*: Master argument analysis and reading techniques (see fundamentals.typ)
2. *Practice Core Techniques*: Develop proficiency with all question types (see core.typ)
3. *Achieve Excellence*: Learn advanced optimization techniques (see excellence.typ)

#align(center)[
  #v(1em)
  #text(size: 12pt, weight: "bold", fill: uptoten-green)[
    Remember: Verbal Reasoning tests how you think critically, not what you know. Master the logical structure of arguments, and the answers will follow.
  ]
]