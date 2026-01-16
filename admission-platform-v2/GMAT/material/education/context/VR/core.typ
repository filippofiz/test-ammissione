#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Verbal Reasoning - Core_],
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

#let example-box(content) = box(
  fill: gray.lighten(95%),
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
  #text(size: 16pt, fill: uptoten-green)[Core]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    Detailed strategies for each GMAT Verbal question type: Reading Comprehension and Critical Reasoning.\
    \
    This guide provides specific techniques, approach methods, and practice strategies for mastering each question type.
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

= Reading Comprehension Question Types

This section provides detailed strategies for each type of Reading Comprehension question you'll encounter on the GMAT.

== Main Idea Questions

=== What They Ask

Main idea questions ask you to identify the primary purpose or central argument of the passage.

#info-box[
  *Common Question Stems*

  - "The primary purpose of the passage is to..."
  - "The main point of the passage is..."
  - "Which of the following best describes the passage?"
  - "The author's main argument is that..."
]

=== Strategy

#tip-box[
  *Approach for Main Idea Questions*

  1. *Read for the "big picture"*: Don't get lost in details
  2. *Identify the author's purpose*: Is the author explaining, arguing, comparing, or critiquing?
  3. *Check the first and last paragraphs*: These often contain the main idea
  4. *Eliminate extremes*: Correct answers are usually moderate, not extreme
  5. *Avoid answers too narrow or too broad*: The answer should capture the whole passage but not go beyond it
]

=== Common Traps

- *Too narrow*: Only covers one paragraph or detail
- *Too broad*: Goes beyond what the passage discusses
- *Distorted*: Uses passage words but twists the meaning
- *Opposite*: Contradicts the passage's main point

#pagebreak()

== Supporting Ideas Questions

=== What They Ask

These questions ask about specific details, facts, or information stated in the passage.

#info-box[
  *Common Question Stems*

  - "According to the passage..."
  - "The passage states that..."
  - "Which of the following is mentioned in the passage?"
  - "The author indicates that..."
]

=== Strategy

#tip-box[
  *Approach for Supporting Ideas Questions*

  1. *Locate the relevant section*: Use keywords from the question to find it
  2. *Read carefully*: The answer is stated directly in the passage
  3. *Match precisely*: Look for paraphrasing of the passage's words
  4. *Avoid inference*: These questions ask what is stated, not implied
]

=== Common Traps

- *Not mentioned*: Information that sounds reasonable but isn't in the passage
- *Wrong location*: Information from a different part of the passage
- *Distorted facts*: Correct information with incorrect details

#pagebreak()

== Inference Questions

=== What They Ask

Inference questions ask you to draw logical conclusions from the information given.

#info-box[
  *Common Question Stems*

  - "It can be inferred from the passage that..."
  - "The passage suggests that..."
  - "The author would most likely agree that..."
  - "Which of the following can be concluded from the passage?"
]

=== Strategy

#tip-box[
  *Approach for Inference Questions*

  1. *Stay close to the text*: Valid inferences are small logical steps
  2. *Look for "must be true"*: The correct answer must follow from the passage
  3. *Avoid assumptions*: Don't bring in outside knowledge
  4. *Check each answer*: Find specific support in the passage
]

#warning-box[
  *Key Principle*

  A valid inference is something that MUST be true based on the passage, not something that MIGHT be true or that seems reasonable.
]

=== Common Traps

- *Too far*: Goes beyond what the passage supports
- *Outside knowledge*: Requires information not in the passage
- *Possible but not certain*: Could be true but isn't necessarily true

#pagebreak()

== Application Questions

=== What They Ask

These questions ask you to apply the passage's reasoning or principles to a new situation.

#info-box[
  *Common Question Stems*

  - "Based on the passage, the author would most likely..."
  - "Which of the following situations is most analogous to..."
  - "The author's reasoning would best support which of the following?"
]

=== Strategy

#tip-box[
  *Approach for Application Questions*

  1. *Identify the principle*: What general rule or pattern does the passage establish?
  2. *Abstract the logic*: Remove specific details to see the underlying reasoning
  3. *Match the structure*: Find the answer that follows the same logical pattern
  4. *Stay consistent*: The application must align with the author's approach
]

== Logical Structure Questions

=== What They Ask

These questions ask about how the passage is organized or how specific parts function.

#info-box[
  *Common Question Stems*

  - "The author develops the argument by..."
  - "The second paragraph serves primarily to..."
  - "The relationship between the first and second paragraphs is..."
  - "Which of the following best describes the organization of the passage?"
]

=== Strategy

#tip-box[
  *Approach for Logical Structure Questions*

  1. *Map the passage*: Note what each paragraph does
  2. *Identify relationships*: Contrast, support, example, cause-effect
  3. *Focus on function*: What role does the element play, not what it says
  4. *Use transition words*: These reveal the structure
]

#pagebreak()

== Style and Tone Questions

=== What They Ask

These questions ask about the author's attitude, voice, or approach to the subject.

#info-box[
  *Common Question Stems*

  - "The author's tone can best be described as..."
  - "The author's attitude toward X is one of..."
  - "Which of the following best characterizes the author's approach?"
]

=== Strategy

#tip-box[
  *Approach for Tone Questions*

  1. *Look for opinion words*: "Unfortunately," "importantly," "surprisingly"
  2. *Note word choices*: Positive, negative, or neutral vocabulary
  3. *Consider the purpose*: Is the author praising, criticizing, questioning?
  4. *Avoid extremes*: GMAT authors are rarely extremely emotional
]

=== Common Tone Descriptors

#table(
  columns: (1fr, 1fr, 1fr),
  align: (left, left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Positive*], [*Neutral*], [*Negative*],
  [appreciative], [analytical], [critical],
  [enthusiastic], [objective], [skeptical],
  [supportive], [informative], [dismissive],
  [optimistic], [dispassionate], [concerned],
)

#pagebreak()

= Critical Reasoning Question Types

This section provides detailed strategies for each type of Critical Reasoning question.

== Strengthen Questions

=== What They Ask

Strengthen questions ask you to find information that supports the argument's conclusion.

#info-box[
  *Common Question Stems*

  - "Which of the following, if true, most strengthens the argument?"
  - "Which of the following provides the best support for the conclusion?"
  - "The argument would be most strengthened if which of the following were true?"
]

=== Strategy

#tip-box[
  *Approach for Strengthen Questions*

  1. *Identify the conclusion*: What does the author want you to believe?
  2. *Find the gap*: What assumption connects premises to conclusion?
  3. *Look for support*: The correct answer fills the gap or provides additional evidence
  4. *Consider the opposite*: What would weaken this argument? Avoid those choices
]

=== Types of Strengtheners

- *Eliminates alternative explanations*: Shows other causes are unlikely
- *Provides additional evidence*: Gives more support for the conclusion
- *Confirms an assumption*: Shows a necessary assumption is true
- *Shows the mechanism*: Explains how the cause produces the effect

#pagebreak()

== Weaken Questions

=== What They Ask

Weaken questions ask you to find information that undermines the argument's conclusion.

#info-box[
  *Common Question Stems*

  - "Which of the following, if true, most seriously weakens the argument?"
  - "Which of the following casts the most doubt on the conclusion?"
  - "Which of the following, if true, is the strongest criticism of the argument?"
]

=== Strategy

#tip-box[
  *Approach for Weaken Questions*

  1. *Identify the conclusion and premises*
  2. *Find the assumption*: What must be true for the argument to work?
  3. *Attack the assumption*: The correct answer shows the assumption may be false
  4. *Look for alternatives*: Other explanations for the evidence
]

=== Types of Weakeners

- *Alternative explanation*: Shows another cause could explain the effect
- *Breaks the causal link*: Shows the proposed cause doesn't lead to the effect
- *Shows an exception*: Provides a counterexample
- *Questions the evidence*: Shows the premises may not support the conclusion

#warning-box[
  *Important*

  Weakening doesn't mean disproving. The correct answer doesn't have to destroy the argument - it just needs to make it less convincing.
]

#pagebreak()

== Assumption Questions

=== What They Ask

Assumption questions ask you to identify an unstated idea that the argument relies on.

#info-box[
  *Common Question Stems*

  - "The argument assumes that..."
  - "Which of the following is an assumption on which the argument depends?"
  - "The argument relies on which of the following assumptions?"
]

=== Types of Assumptions

==== Necessary Assumptions

Must be true for the argument to work. Use the *Negation Test*: if negating an answer choice destroys the argument, it's a necessary assumption.

==== Sufficient Assumptions

Would make the conclusion definitely follow from the premises. These are usually broader than necessary assumptions.

=== Strategy

#tip-box[
  *Approach for Assumption Questions*

  1. *Find the gap*: What's missing between premises and conclusion?
  2. *Identify new terms*: Look for ideas in the conclusion not in the premises
  3. *Apply the Negation Test*: For necessary assumptions, negate each choice
  4. *Stay relevant*: The assumption must connect to both premises and conclusion
]

#example-box[
  *Negation Test Example*

  Argument: "This plant food is made entirely from natural ingredients, so it's safe for plants."

  Test choice: "All natural ingredients are safe for plants."

  Negate it: "Some natural ingredients are NOT safe for plants."

  Does this destroy the argument? Yes! So this is a necessary assumption.
]

#pagebreak()

== Inference Questions

=== What They Ask

Inference questions ask what must be true based on the information given.

#info-box[
  *Common Question Stems*

  - "If the statements above are true, which of the following must also be true?"
  - "Which of the following conclusions is best supported by the information above?"
  - "Which of the following can be properly inferred from the statements above?"
]

=== Strategy

#tip-box[
  *Approach for CR Inference Questions*

  1. *Treat as a puzzle*: The information must logically lead to the answer
  2. *Stay close*: Valid inferences don't go far beyond the given information
  3. *Check for absolutes*: Be cautious of "all," "never," "always"
  4. *Combine information*: Often requires putting two facts together
]

#warning-box[
  *Key Distinction*

  Unlike other CR questions, inference questions have NO argument. They just give you facts. You must find what must be true based on those facts alone.
]

#pagebreak()

== Evaluate Questions

=== What They Ask

Evaluate questions ask what information would help you assess the argument.

#info-box[
  *Common Question Stems*

  - "Which of the following would it be most useful to know in evaluating the argument?"
  - "The answer to which of the following questions would be most useful in evaluating the plan?"
]

=== Strategy

#tip-box[
  *Approach for Evaluate Questions*

  1. *Find the assumption*: What does the argument take for granted?
  2. *Test both answers*: A "yes" should strengthen, a "no" should weaken (or vice versa)
  3. *Check relevance*: The information must affect the argument's validity
  4. *Be specific*: The best answer targets the core of the argument
]

#example-box[
  *Two-Way Test*

  Argument: "Moving the office downtown will reduce employee commute times."

  Test question: "Do most employees live closer to downtown than to the current office?"

  - If yes: Strengthens (commutes would indeed be shorter)
  - If no: Weakens (commutes might actually get longer)

  This is a good evaluate answer because either response affects the argument.
]

#pagebreak()

== Explain Questions

=== What They Ask

Explain questions present a paradox or discrepancy and ask you to resolve it.

#info-box[
  *Common Question Stems*

  - "Which of the following, if true, most helps to explain the discrepancy?"
  - "Which of the following, if true, most helps to resolve the apparent paradox?"
]

=== Strategy

#tip-box[
  *Approach for Explain Questions*

  1. *Identify the paradox*: What two facts seem to contradict each other?
  2. *Both must be true*: Don't eliminate one fact to explain the other
  3. *Look for a third factor*: Something that makes both facts make sense together
  4. *Be specific*: The explanation should directly address the discrepancy
]

#example-box[
  *Example Paradox*

  "Sales of Company X's products increased by 50% last year, but the company's profits declined."

  This seems contradictory: more sales should mean more profit.

  Resolution: "Company X lowered its prices significantly to increase sales volume."

  This explains how both facts can be true - higher sales at lower margins can reduce profit.
]

#pagebreak()

== Flaw Questions

=== What They Ask

Flaw questions ask you to identify a logical error in the argument.

#info-box[
  *Common Question Stems*

  - "The argument is flawed because it..."
  - "Which of the following indicates a flaw in the reasoning above?"
  - "The argument is most vulnerable to which of the following criticisms?"
]

=== Common Logical Flaws

#table(
  columns: (1fr, 2fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Flaw Type*], [*Description*],
  [Correlation/Causation], [Assumes that because two things correlate, one causes the other],
  [Sampling Error], [Generalizes from a biased or too-small sample],
  [Equivocation], [Uses the same word with different meanings],
  [False Dichotomy], [Assumes only two options exist when there are more],
  [Ad Hominem], [Attacks the person rather than the argument],
  [Circular Reasoning], [Uses the conclusion as a premise],
  [Straw Man], [Misrepresents an opposing argument],
)

=== Strategy

#tip-box[
  *Approach for Flaw Questions*

  1. *Identify the argument structure*: Premises #sym.arrow Conclusion
  2. *Find the gap*: Where does the logic break down?
  3. *Match to flaw types*: Which category of error fits best?
  4. *Be precise*: The correct answer describes the specific flaw in this argument
]

#pagebreak()

== Bold-Faced Questions

=== What They Ask

Bold-faced questions highlight two portions of text and ask about their roles in the argument.

#info-box[
  *Common Question Stems*

  - "In the argument given, the two portions in boldface play which of the following roles?"
]

=== Possible Roles

- *Conclusion*: Main point the argument supports
- *Intermediate conclusion*: Supports the main conclusion, is itself supported
- *Premise*: Evidence or reason given
- *Background*: Context information
- *Counter-argument*: View the author opposes
- *Counter-premise*: Evidence for a view the author opposes

=== Strategy

#tip-box[
  *Approach for Bold-Faced Questions*

  1. *Find the main conclusion* first
  2. *Determine each bold portion's role*: Is it a premise, conclusion, or opposition?
  3. *Check the relationship*: Does one support the other?
  4. *Match to answer choices*: Find the option that correctly describes both roles
]

#pagebreak()

= Integration and Practice

== Reading Comprehension Integrated Approach

#info-box[
  *The Complete RC Process*

  *Reading Phase (2-3 minutes)*:
  1. Read for main idea and structure
  2. Note paragraph purposes
  3. Mark the author's tone

  *Question Phase (1-1.5 minutes each)*:
  1. Read the question carefully
  2. Identify question type
  3. Go back to passage for evidence
  4. Predict answer before looking at choices
  5. Eliminate wrong answers
  6. Confirm correct answer
]

== Critical Reasoning Integrated Approach

#info-box[
  *The Complete CR Process*

  1. *Read the question first* (5 seconds)
  2. *Read the stimulus* (30 seconds)
     - Identify conclusion
     - Note premises
     - Find assumption
  3. *Predict the answer* (10 seconds)
  4. *Evaluate choices* (45-60 seconds)
     - Compare to prediction
     - Eliminate clearly wrong
     - Choose best match
]

#pagebreak()

= Common Wrong Answer Patterns

== Out of Scope

The answer introduces information not mentioned or implied in the passage/argument.

== Extreme Language

The answer uses absolute terms (always, never, all, none) when the passage is more moderate.

== Opposite

The answer contradicts the passage or does the opposite of what's asked.

== Distortion

The answer uses words from the passage but changes their meaning or relationship.

== Irrelevant Comparison

The answer makes a comparison not relevant to what the question asks.

== Too Narrow/Too Broad

For main idea questions: too narrow covers only part; too broad goes beyond the passage.

#pagebreak()

= Summary

This Core guide has covered:

*Reading Comprehension Question Types*:
- Main idea
- Supporting ideas
- Inference
- Application
- Logical structure
- Style and tone

*Critical Reasoning Question Types*:
- Strengthen
- Weaken
- Assumption
- Inference
- Evaluate
- Explain
- Flaw
- Bold-faced

*Key Techniques*:
- Question type identification
- Prediction before answer review
- Strategic elimination
- Common trap recognition

Master these Core strategies before moving on to the Excellence guide, which covers advanced optimization techniques and time-saving strategies.