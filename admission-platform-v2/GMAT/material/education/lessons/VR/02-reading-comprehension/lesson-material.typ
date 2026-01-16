#import "/templates/uptoten-template.typ": *
#import "@preview/fletcher:0.5.8" as fletcher: diagram, node, edge

#show: uptoten-doc.with(
  title: "GMAT Verbal Reasoning",
  subtitle: "Reading Comprehension",
  level: "Lesson Material",
  intro: "Comprehensive tutor guide covering passage analysis, question types, active reading strategies, and efficient time management for RC.",
  logo: "/Logo.png"
)

= Lesson Overview

*Topic:* Reading Comprehension (RC)\
*Section:* Verbal Reasoning\
*Lesson Sequence:* VR-02 (Second of 2 VR topics - Final VR topic)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Read passages actively and efficiently
2. Identify main ideas, structure, and author's tone
3. Answer different RC question types accurately
4. Navigate between passage and questions efficiently
5. Avoid common RC traps in answer choices
6. Manage time across multiple passages

== GMAT Relevance

Reading Comprehension comprises approximately half of the Verbal Reasoning section (~11-12 questions out of 23, from 3-4 passages). It tests the reading and analytical skills essential for business.

#pagebreak()

= Part 1: Passage Types

== Subject Areas

#info-box[
  *GMAT RC passages cover:*
  - Business and economics
  - Social sciences (history, psychology, sociology)
  - Biological sciences
  - Physical sciences
  - Art and culture

  *No prior knowledge required:* All information needed is in the passage.
]

== Passage Structures

#info-box[
  *Common structures:*

  1. *Thesis-Support:* Main claim followed by supporting evidence
  2. *Problem-Solution:* Issue presented, then solution(s) discussed
  3. *Compare-Contrast:* Two or more viewpoints compared
  4. *Chronological:* Historical or process-based progression
  5. *Cause-Effect:* Phenomenon explained through causes
]

#v(0.5em)

#align(center)[
  #text(size: 10pt, weight: "bold")[Common Passage Structures]
]

#v(0.3em)

#{
  let blob(pos, label, tint: white, ..args) = node(
    pos, align(center, label),
    width: 24mm,
    fill: tint.lighten(60%),
    stroke: 1pt + tint.darken(20%),
    corner-radius: 5pt,
    ..args,
  )

  align(center)[
    #fletcher.diagram(
      spacing: 6pt,
      cell-size: (10mm, 10mm),
      edge-stroke: 1pt,
      edge-corner-radius: 5pt,
      mark-scale: 70%,

      // Thesis-Support (column 0)
      blob((0, 0), [*Thesis*], tint: blue, width: 20mm),
      blob((0, 2), [Support 1], tint: blue.lighten(30%), width: 20mm),
      blob((0, 3.5), [Support 2], tint: blue.lighten(30%), width: 20mm),
      edge((0, 0), (0, 2), "-|>"),
      edge((0, 2), (0, 3.5), "-|>"),

      // Problem-Solution (column 2)
      blob((2, 0), [*Problem*], tint: red, width: 20mm),
      blob((2, 2), [Analysis], tint: orange, width: 20mm),
      blob((2, 3.7), [*Solution*], tint: green, width: 20mm),
      edge((2, 0), (2, 2), "-|>"),
      edge((2, 2), (2, 3.7), "-|>"),

      // Compare-Contrast (column 4)
      blob((4, 0), [*View A*], tint: purple, width: 20mm),
      blob((4, 2), [*View B*], tint: maroon, width: 20mm),
      blob((4, 3.5), [Evaluation], tint: gray, width: 20mm),
      edge((4, 0), (4, 2), "<->"),
      edge((4, 0), (4, 3.5), "-|>", bend: 50deg),
      edge((4, 2), (4, 3.5), "-|>"),

      // Labels below
      node((0, 4.2), text(size: 7pt)[Thesis-Support]),
      node((2, 4.2), text(size: 7pt)[Problem-Solution]),
      node((4, 4.2), text(size: 7pt)[Compare-Contrast]),
    )
  ]
}

#v(0.3em)
#align(center)[
  #text(size: 8pt, style: "italic")[Recognize structure early to predict where information will appear]
]

#pagebreak()

= Part 2: Active Reading

#v(0.5em)

#align(center)[
  #text(size: 10pt, weight: "bold")[Active Reading Process]
]

#v(0.3em)

#{
  let blob(pos, label, tint: white, ..args) = node(
    pos, align(center, label),
    width: 30mm,
    fill: tint.lighten(60%),
    stroke: 1pt + tint.darken(20%),
    corner-radius: 5pt,
    ..args,
  )

  align(center)[
    #fletcher.diagram(
      spacing: 8pt,
      cell-size: (12mm, 10mm),
      edge-stroke: 1pt,
      edge-corner-radius: 5pt,
      mark-scale: 70%,

      // Main flow (horizontal)
      blob((0, 0), [*Skim*\ (2-3 min)], tint: blue),
      blob((1.5, 0), [*Map*\ Paragraphs], tint: green),
      blob((3, 0), [*Note*\ Key Points], tint: orange),
      blob((4.5, 0), [*Answer*\ Questions], tint: purple),

      // Flow edges
      edge((0, 0), (1.5, 0), "-|>"),
      edge((1.5, 0), (3, 0), "-|>"),
      edge((3, 0), (4.5, 0), "-|>"),
      edge((4.5, 0), (6, 0), "-|>",
        label: text(size: 6pt, fill: gray.darken(20%))[Done], label-side: right),

      // Return arrow for re-reading
      edge((6, 0), (3, 0), "--|>", bend: -50deg,
        label: text(size: 6pt, fill: gray.darken(20%))[re-read as needed], label-side: right),
    )
  ]
}

#v(0.3em)
#align(center)[
  #text(size: 8pt, style: "italic")[Don't memorize - understand structure and locate information quickly]
]

#v(0.5em)

== The Two-Minute Read

#strategy-box[
  *Don't try to memorize everything!*

  Goal: Understand the STRUCTURE and MAIN POINTS in 2-3 minutes.

  Note:
  - Main idea/thesis
  - Paragraph purposes
  - Author's tone (positive, negative, neutral)
  - Key terms and their definitions
]

== Passage Mapping

#tip-box[
  *Create a mental map:*

  - Brief note - e.g., "Introduces traditional view"
  - Brief note - e.g., "Presents new research"
  - Brief note - e.g., "Author evaluates"

  This helps you locate information quickly when answering questions.
]

== What to Note While Reading

#info-box[
  *Pay attention to:*
  - Topic sentences (usually first sentence of each paragraph)
  - Transition words (however, moreover, in contrast, therefore)
  - Author opinion words (fortunately, surprisingly, mistakenly)
  - Definitions of key terms
  - Examples (note what they support, don't memorize details)
]

#warning-box[
  *Don't note:*
  - Specific dates and numbers (you can look these up)
  - Detailed examples (know they exist, not specifics)
  - Technical terminology you don't understand yet
]

#pagebreak()

= Part 3: RC Question Types

== Type 1: Main Idea

#info-box[
  *Question stems:*
  - "The primary purpose of the passage is to..."
  - "The passage is primarily concerned with..."
  - "Which best describes the main idea?"

  *Strategy:* Should encompass the whole passage, not just one part.
]

== Type 2: Specific Detail

#info-box[
  *Question stems:*
  - "According to the passage..."
  - "The author states that..."
  - "The passage indicates which of the following about X?"

  *Strategy:* Go back to the passage; the answer is explicitly stated.
]

== Type 3: Inference

#info-box[
  *Question stems:*
  - "It can be inferred from the passage that..."
  - "The passage suggests which of the following?"
  - "The author would most likely agree that..."

  *Strategy:* Must be supported by passage but not directly stated.
]

== Type 4: Author's Tone/Attitude

#info-box[
  *Question stems:*
  - "The author's attitude toward X can best be described as..."
  - "The author's tone in discussing X is..."

  *Strategy:* Look for opinion words, qualifiers, and overall stance.
]

== Type 5: Logical Structure

#info-box[
  *Question stems:*
  - "The author develops the argument by..."
  - "The second paragraph serves to..."
  - "Which best describes the organization of the passage?"

  *Strategy:* Use your passage map; focus on purpose, not content.
]

== Type 6: Application

#info-box[
  *Question stems:*
  - "Based on the passage, the author would most likely respond to X by..."
  - "Which situation is most analogous to..."

  *Strategy:* Apply the passage's logic to a new situation.
]

#v(0.5em)

#align(center)[
  #text(size: 10pt, weight: "bold")[RC Question Type Identification]
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
    width: 28mm,
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
      decision((0, 2), [About whole\ passage?]),
      decision((0, 4), [Explicitly\ stated?]),
      decision((0, 6), [About\ structure?]),

      // Column 2: Strategy outputs (to the right)
      blob((3, 2), [*Main Idea*\ Whole passage scope], tint: blue, width: 50mm),
      blob((3, 4), [*Specific Detail*\ Return to passage], tint: green, width: 50mm),
      blob((3, 6), [*Logical Structure*\ Use passage map], tint: orange, width: 50mm),
      blob((3, 8), [*Inference, Tone,*\ *Application*\ Must be supported], tint: purple, width: 50mm),

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
  #text(size: 8pt, style: "italic")[Identify question type first, then apply the appropriate strategy]
]

#pagebreak()

= Part 4: Answer Elimination

== Wrong Answer Types

#info-box[
  *Common wrong answers:*

  1. *Too extreme:* Uses "always," "never," "all," "none" when passage is more moderate
  2. *Too narrow:* Only addresses part of the passage (for main idea questions)
  3. *Too broad:* Goes beyond what passage discusses
  4. *Out of scope:* Introduces information not in the passage
  5. *Opposite:* Contradicts what the passage says
  6. *True but irrelevant:* May be factually accurate but doesn't answer the question
]

== The Evidence Test

#strategy-box[
  *For every answer you choose, ask:*

  "Where in the passage does it say this?"

  If you can't point to specific support, reconsider the answer.
]

#pagebreak()

= Part 5: Time Management

== Pacing Guidelines

#info-box[
  *For each passage (3-4 questions):*
  - Reading: 2-3 minutes
  - Questions: 4-5 minutes total
  - Total per passage: 6-8 minutes

  *For VR section overall:*
  - 3-4 RC passages in ~45 minutes
  - Budget ~20-25 minutes total for RC
]

== Efficiency Strategies

#strategy-box[
  1. *Don't read every word equally* - skim examples, focus on main points
  2. *Read questions, then passage* - some prefer this approach
  3. *Use your passage map* - locate info quickly
  4. *Don't re-read entire passage* - just relevant sections
  5. *If stuck, move on* - don't spend 5 minutes on one question
]

#pagebreak()

= Part 6: Difficult Passage Strategies

== Unfamiliar Topics

#tip-box[
  *For topics you know nothing about:*
  - Focus on structure, not content understanding
  - Identify what the author is DOING (arguing, explaining, comparing)
  - Don't worry about technical terms; understand their function
  - The passage gives you everything you need
]

== Dense or Complex Passages

#tip-box[
  *For complicated passages:*
  - Read more slowly the first time
  - Identify the main claim early
  - Track relationships between ideas
  - Don't get lost in details
]

== Long Passages

#tip-box[
  *For longer passages:*
  - Paragraph mapping is even more important
  - Note transitions between sections
  - Be strategic about which parts to read carefully
]

#pagebreak()

= Part 7: Practice Techniques

== Active Recall

After reading, ask yourself:
- What is the main point?
- What is the author's purpose?
- How is the passage organized?

== Prephrase Answers

Before looking at choices:
- Main idea: "This passage is mainly about..."
- Detail: "The passage says X is..."
- Inference: "Based on this, it seems that..."

== Learn from Errors

#warning-box[
  *For every wrong answer, identify:*
  - Did you misread the passage?
  - Did you misread the question?
  - Did you fall for a trap answer?
  - Did you bring in outside knowledge?
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. Active reading technique
2. Passage mapping
3. Main idea questions
4. Specific detail questions

*Question Time:* 2 passages with 3-4 questions each

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Inference questions
2. Author's tone questions
3. Logical structure questions
4. Answer elimination strategies

*Review errors from Training #1, focusing on:*
- Not returning to passage for evidence
- Choosing answers that are too extreme
- Missing author's tone signals

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Time management across passages
- Handling difficult passages

*Assessment:* 5 passages (~20 questions), 45 minutes

== Common Student Difficulties

1. Reading too slowly/carefully
2. Not returning to passage when answering
3. Bringing in outside knowledge
4. Missing author's opinion/tone
5. Choosing overly extreme answers

#warning-box[
  *Tutor Tip:* Practice with a variety of passage topics. Students often struggle with unfamiliar subjects, but the skills transfer once they realize content knowledge isn't tested.
]

#tip-box[
  *After this topic:* VR section is complete! Next, the student will take VR section assessments before beginning final mock simulations.
]
