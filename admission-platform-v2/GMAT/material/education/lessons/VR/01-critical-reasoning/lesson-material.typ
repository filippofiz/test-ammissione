#import "/templates/uptoten-template.typ": *
#import "@preview/fletcher:0.5.8" as fletcher: diagram, node, edge

#show: uptoten-doc.with(
  title: "GMAT Verbal Reasoning",
  subtitle: "Critical Reasoning",
  level: "Lesson Material",
  intro: "Comprehensive tutor guide covering argument structure, question types (strengthen, weaken, assumption, inference), and logical reasoning strategies.",
  logo: "/Logo.png"
)

= Lesson Overview

*Topic:* Critical Reasoning (CR)
*Section:* Verbal Reasoning
*Lesson Sequence:* VR-01 (First of 2 VR topics)
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Identify conclusions, premises, and assumptions in arguments
2. Recognize different CR question types and their requirements
3. Apply specific strategies for each question type
4. Eliminate wrong answer choices systematically
5. Distinguish between relevant and irrelevant information
6. Manage time effectively on CR questions

== GMAT Relevance

Critical Reasoning comprises approximately half of the Verbal Reasoning section (~11-12 questions out of 23). It tests the logical reasoning skills essential for business analysis and decision-making.

#pagebreak()

= Part 1: Argument Structure

== The Three Components

#info-box[
  *Every argument has:*

  *Premise(s):* Facts, evidence, or reasons supporting the conclusion

  *Conclusion:* The main point or claim being argued

  *Assumption:* Unstated belief(s) necessary for the conclusion to follow from the premises
]

== Identifying Conclusions

#tip-box[
  *Conclusion Indicators:*
  - Therefore, thus, hence, consequently
  - It follows that, this shows that
  - We can conclude that, it can be inferred
  - Must, should, ought to
  - For this reason, as a result

  Sometimes the conclusion has NO indicator and must be identified by meaning.
]

== Identifying Premises

#tip-box[
  *Premise Indicators:*
  - Because, since, for, as
  - Given that, due to the fact that
  - Evidence shows, studies indicate
  - Assuming that, considering that

  The premise is what SUPPORTS the conclusion.
]

== Understanding Assumptions

#info-box[
  *Assumptions are the bridge between premises and conclusion.*

  The assumption is:
  - NOT stated in the argument
  - NECESSARY for the conclusion to hold
  - Often the "gap" in the logic

  Finding assumptions is key to most CR questions.
]

#example-box[
  *Argument:*
  "Sales increased after the new ad campaign launched. Therefore, the ad campaign was effective."

  *Premise:* Sales increased after the campaign.
  *Conclusion:* The ad campaign was effective.
  *Assumption:* Nothing else caused the sales increase.
]

#v(0.5em)

#{
  let blob(pos, label, tint: white, ..args) = node(
    pos, align(center, label),
    width: 28mm,
    fill: tint.lighten(60%),
    stroke: 1pt + tint.darken(20%),
    corner-radius: 5pt,
    ..args,
  )

  align(center)[
    #fletcher.diagram(
      spacing: 8pt,
      cell-size: (14mm, 10mm),
      edge-stroke: 1pt,
      edge-corner-radius: 5pt,
      mark-scale: 70%,

      blob((0, 0), [*Premise*\ #text(size: 8pt)[(Evidence)]], tint: blue),
      blob((2, 0), [*Assumption*\ #text(size: 8pt)[(Unstated)]], tint: red, shape: fletcher.shapes.diamond, width: 32mm),
      blob((4, 0), [*Conclusion*\ #text(size: 8pt)[(Main Claim)]], tint: green),

      // Main flow: Premise -> Assumption -> Conclusion
      edge((0, 0), (2, 0), "-|>"),
      edge((2, 0), (4, 0), "-|>"),

      // Gap indicator (dashed arc above the nodes)
      edge((0, 0), (4, 0), "--|>", bend: 40deg,
        label: text(size: 7pt, fill: gray.darken(20%), style: "italic")[gap in logic], label-side: right),
    )
  ]
}

#v(0.3em)
#align(center)[
  #text(size: 8pt, style: "italic")[Argument Structure: The assumption bridges the gap between premise and conclusion]
]

#pagebreak()

= Part 2: CR Question Types

== Type 1: Strengthen

#info-box[
  *Question stems:*
  - "Which of the following, if true, most strengthens the argument?"
  - "Which provides the most support for the conclusion?"

  *Strategy:* Find the answer that supports the assumption or provides additional evidence for the conclusion.
]

== Type 2: Weaken

#info-box[
  *Question stems:*
  - "Which of the following, if true, most seriously weakens the argument?"
  - "Which casts the most doubt on the conclusion?"

  *Strategy:* Find the answer that attacks the assumption or provides counter-evidence.
]

== Type 3: Assumption

#info-box[
  *Question stems:*
  - "The argument assumes which of the following?"
  - "Which is an assumption on which the argument depends?"

  *Strategy:* Find what MUST be true for the conclusion to follow.

  *Negation Test:* If negating an answer choice destroys the argument, it's a necessary assumption.
]

== Type 4: Inference

#info-box[
  *Question stems:*
  - "Which must be true based on the statements above?"
  - "Which can be properly concluded from the information?"

  *Strategy:* Find what logically follows from the given information.

  *Key:* Don't add information; only use what's stated.
]

== Type 5: Evaluate

#info-box[
  *Question stems:*
  - "Which would be most useful to know in evaluating the argument?"
  - "The answer to which question would help assess the conclusion?"

  *Strategy:* Find what information would help determine if the argument is strong or weak.
]

== Type 6: Explain/Paradox

#info-box[
  *Question stems:*
  - "Which best explains the discrepancy?"
  - "Which resolves the apparent contradiction?"

  *Strategy:* Find the answer that makes both parts of the paradox true.
]

== Type 7: Flaw

#info-box[
  *Question stems:*
  - "The argument is flawed because it..."
  - "Which describes a weakness in the reasoning?"

  *Strategy:* Identify what's wrong with the logic (not whether premises are true).
]

== Type 8: Bold-Faced

#info-box[
  *Question format:* Two portions of the argument are in bold, and you identify their roles.

  *Strategy:* Determine if each bold portion is:
  - The main conclusion
  - An intermediate conclusion
  - A premise
  - Background information
  - A counter-argument
]

#v(0.5em)

#align(center)[
  #text(size: 10pt, weight: "bold")[CR Question Type Decision Flow]
]

#v(0.3em)

#{
  let blob(pos, label, tint: white, ..args) = node(
    pos, align(center, label),
    width: 32mm,
    fill: tint.lighten(60%),
    stroke: 1pt + tint.darken(20%),
    corner-radius: 5pt,
    ..args,
  )

  let decision(pos, label, ..args) = node(
    pos, align(center, label),
    width: 26mm,
    fill: yellow.lighten(70%),
    stroke: 1pt + yellow.darken(30%),
    corner-radius: 3pt,
    shape: fletcher.shapes.diamond,
    ..args,
  )

  align(center)[
    #fletcher.diagram(
      spacing: 8pt,
      cell-size: (12mm, 12mm),
      edge-stroke: 1pt,
      edge-corner-radius: 5pt,
      mark-scale: 70%,

      // Column 0: Start + Decisions (vertical flow)
      blob((0, 0), [*Read Question*], tint: gray),
      decision((0, 2), [Strengthen/\ Weaken?]),
      decision((0, 4), [Assumption?], width: 30mm),
      decision((0, 6), [Must be\ true?]),

      // Column 2: Strategy outputs (to the right)
      blob((3, 2), [*Strengthen/Weaken*\ Find the gap], tint: green),
      blob((3, 4), [*Assumption*\ Negation Test], tint: blue),
      blob((3, 6), [*Inference*\ Stay close to text], tint: purple),
      blob((3, 8), [*Other Types*\ Evaluate, Explain,\ Flaw, Bold-Faced], tint: red, width: 36mm),

      // Vertical flow edges
      edge((0, 0), (0, 2), "-|>"),
      edge((0, 2), (0, 4), "-|>", label: text(size: 7pt)[No], label-side: left),
      edge((0, 4), (0, 6), "-|>", label: text(size: 7pt)[No], label-side: left),
      edge((0, 6), (0, 8), (3, 8), "-|>", label: text(size: 7pt)[No], label-pos: 0.15),

      // Yes branches to strategies
      edge((0, 2), (3, 2), "-|>", label: text(size: 7pt)[Yes], label-side: left),
      edge((0, 4), (3, 4), "-|>", label: text(size: 7pt)[Yes], label-side: left),
      edge((0, 6), (3, 6), "-|>", label: text(size: 7pt)[Yes], label-side: left),
    )
  ]
}

#v(0.3em)
#align(center)[
  #text(size: 8pt, style: "italic")[Use this flow to quickly identify which CR strategy to apply]
]

#pagebreak()

= Part 3: Common Argument Flaws

== Correlation vs. Causation

#warning-box[
  Just because A happened before or along with B doesn't mean A caused B.

  *Alternative explanations:*
  - B caused A (reverse causation)
  - C caused both A and B (common cause)
  - Coincidence
]

== Sampling Errors

#warning-box[
  *Problems with generalizing from samples:*
  - Sample too small
  - Sample not representative
  - Self-selection bias
]

== False Dichotomy

#warning-box[
  Presenting only two options when more exist.

  "Either we increase prices or go bankrupt" (ignores cost-cutting, new products, etc.)
]

== Scope Shift

#warning-box[
  The conclusion is broader or different in scope than the evidence supports.

  Evidence about "some" → Conclusion about "all"
  Evidence about "City X" → Conclusion about "the country"
]

#pagebreak()

= Part 4: Answer Elimination Strategies

== Wrong Answer Types

#info-box[
  *Common wrong answers:*

  1. *Out of scope:* Irrelevant to the argument
  2. *Opposite:* Does the reverse of what's asked
  3. *Too extreme:* Uses "always," "never," "only" when unwarranted
  4. *True but irrelevant:* May be factually correct but doesn't affect the argument
  5. *Partial:* Addresses only part of what's needed
]

== Elimination Process

#strategy-box[
  1. Eliminate clearly wrong answers first
  2. Compare remaining choices to the specific question being asked
  3. For strengthen/weaken: Test each answer's effect on the argument
  4. For inference: Verify answer is supported by the passage
]

#pagebreak()

= Part 5: Time Management

== Pacing Guidelines

#info-box[
  *Target Time:* 2-2.5 minutes per CR question

  This is roughly GMAT average pace. CR should not be your fastest or slowest question type.
]

== Efficiency Tips

#strategy-box[
  1. *Read the question first* - know what you're looking for
  2. *Identify conclusion and premises quickly*
  3. *Prephrase an answer* before looking at choices
  4. *Eliminate aggressively* - don't read all choices equally
  5. *Don't overthink* - first instinct is often correct
]

#pagebreak()

= Part 6: Question-Specific Strategies

== For Strengthen Questions

#tip-box[
  - Find the gap in the argument
  - Look for answers that:
    - Provide additional evidence
    - Rule out alternative explanations
    - Support the assumption
]

== For Weaken Questions

#tip-box[
  - Find the gap in the argument
  - Look for answers that:
    - Provide counter-evidence
    - Suggest alternative explanations
    - Attack the assumption
]

== For Assumption Questions

#tip-box[
  - Use the *Negation Test*
  - If negating the answer destroys the argument, it's correct
  - Look for the "bridge" between premises and conclusion
]

== For Inference Questions

#tip-box[
  - Stay close to the text
  - Avoid extreme language
  - The answer must be supported, not just possible
  - Combine information if needed
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. Argument structure (premise, conclusion, assumption)
2. Identifying conclusions in various positions
3. Strengthen and Weaken questions
4. Basic assumption identification

*Question Time:* 5-6 CR questions focusing on strengthen/weaken

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Assumption questions with negation test
2. Inference questions
3. Evaluate and Explain questions
4. Answer elimination strategies

*Review errors from Training #1, focusing on:*
- Misidentifying the conclusion
- Choosing answers that are true but irrelevant
- Confusing strengthen with weaken

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Time management
- Bold-faced questions (if not covered)

*Assessment:* 20 questions, 40 minutes

== Common Student Difficulties

1. Not identifying the conclusion correctly
2. Choosing answers that are generally true but don't affect the argument
3. Bringing in outside knowledge
4. Confusing necessary and sufficient assumptions
5. Not using the negation test for assumption questions

#warning-box[
  *Tutor Tip:* Have students state the conclusion in their own words before looking at answer choices. This prevents confusion from complex language.
]
