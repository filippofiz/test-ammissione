#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2": canvas, draw

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Multi-Source Reasoning",
  level: "Lesson Material",
  intro: "Comprehensive tutor guide covering multi-tab information synthesis, cross-referencing data, and strategic navigation.",
  logo: "/Logo.png"
)

= Lesson Overview

*Topic:* Multi-Source Reasoning (MSR)\
*Section:* Data Insights\
*Lesson Sequence:* DI-05 (Fifth of 5 DI topics - Final DI topic)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Navigate multiple information tabs efficiently
2. Synthesize information from 2-3 different sources
3. Cross-reference data to answer questions
4. Identify which sources contain relevant information
5. Resolve contradictions or updates between sources
6. Manage time effectively on longer MSR sets

== GMAT Relevance

Multi-Source Reasoning mirrors real business scenarios where information comes from multiple reports, emails, and data sources. This is arguably the most "real-world" question type on the GMAT.

#pagebreak()

= Part 1: MSR Question Format

== Structure

#info-box[
  *Every MSR Set Has:*
  1. 2-3 tabs of information (click to switch between)
  2. 1-3 questions based on ALL sources
  3. Questions may require information from one OR multiple tabs

  *Tab types:* Text (emails, reports), Tables, Charts, Descriptions
]

#example-box[
  *Sample MSR Structure:*

  *Tab 1 - Email:* Project timeline and budget overview
  *Tab 2 - Report:* Detailed cost breakdown by department
  *Tab 3 - Chart:* Historical spending trends

  Questions ask about:
  - Total budget (requires Tab 1 + Tab 2)
  - Comparison to last year (requires Tab 3)
  - Timeline feasibility (Tab 1)
]

#v(0.5em)

#align(center)[
  #canvas(length: 1cm, {
    import draw: *

    // Colors
    let tab_active = rgb("#4a5568")
    let tab_inactive = rgb("#e2e8f0")
    let border_color = rgb("#2d3748")
    let content_bg = rgb("#f7fafc")
    let question_bg = rgb("#edf2f7")
    let accent = rgb("#3182ce")

    // Dimensions
    let prompt_width = 5.5
    let prompt_height = 4.5
    let question_width = 4.5
    let question_height = 4.5
    let tab_width = 1.4
    let tab_height = 0.5
    let gap = 0.8

    // Prompt panel (left side)
    let px = 0
    let py = 0

    // Prompt label
    content((px + 0.3, py + prompt_height + 0.3), text(size: 8pt, weight: "bold")[Prompt])

    // Main prompt box
    rect((px, py), (px + prompt_width, py + prompt_height), stroke: border_color + 1.5pt, fill: content_bg)

    // Tabs at top of prompt box
    let tab1_x = px + 0.2
    let tab2_x = px + 0.2 + tab_width + 0.1
    let tab3_x = px + 0.2 + 2 * (tab_width + 0.1)
    let tab_y = py + prompt_height - 0.1

    // Tab 1 - Proposal (inactive, white background)
    rect((tab1_x, tab_y - tab_height), (tab1_x + tab_width, tab_y), stroke: border_color + 1pt, fill: white)
    content((tab1_x + tab_width/2, tab_y - tab_height/2), text(size: 7pt)[Proposal])

    // Tab 2 - Objectives (active, gray background)
    rect((tab2_x, tab_y - tab_height), (tab2_x + tab_width, tab_y), stroke: border_color + 1pt, fill: tab_inactive)
    content((tab2_x + tab_width/2, tab_y - tab_height/2), text(size: 7pt, weight: "bold")[Objectives])

    // Tab 3 - Budget (inactive, white background)
    rect((tab3_x, tab_y - tab_height), (tab3_x + tab_width, tab_y), stroke: border_color + 1pt, fill: white)
    content((tab3_x + tab_width/2, tab_y - tab_height/2), text(size: 7pt)[Budget])

    // "Click tabs to read" annotation with arrows
    let arrow_y = tab_y + 0.8
    content((px + prompt_width/2, arrow_y + 0.3), text(size: 7pt)[Click tabs to read.])
    line((px + prompt_width/2 - 1.2, arrow_y), (tab1_x + tab_width/2, tab_y + 0.15), stroke: 0.8pt, mark: (end: "stealth", scale: 0.4))
    line((px + prompt_width/2, arrow_y), (tab2_x + tab_width/2, tab_y + 0.15), stroke: 0.8pt, mark: (end: "stealth", scale: 0.4))
    line((px + prompt_width/2 + 1.2, arrow_y), (tab3_x + tab_width/2, tab_y + 0.15), stroke: 0.8pt, mark: (end: "stealth", scale: 0.4))

    // Content area (below tabs)
    let content_y = tab_y - tab_height - 0.3

    // Email header
    content((px + 0.4, content_y - 0.2), anchor: "west", text(size: 7pt)[Email from #text(weight: "bold")[manager] to staff])
    content((px + 0.4, content_y - 0.55), anchor: "west", text(size: 7pt, style: "italic")[April 7, 1:03 pm])

    // Email body
    content((px + 0.4, content_y - 1.1), anchor: "west", text(size: 7pt)[The results of the recent])
    content((px + 0.4, content_y - 1.4), anchor: "west", text(size: 7pt)[marketing survey have been])
    content((px + 0.4, content_y - 1.7), anchor: "west", text(size: 7pt)[compiled . . . .])

    // Body annotation
    let body_note_y = py + 0.5
    content((px + prompt_width/2, body_note_y - 1), text(size: 6.5pt)[Body may include text, tables,])
    content((px + prompt_width/2, body_note_y - 1.25), text(size: 6.5pt)[graphs, or other diagrams.])
    line((px + prompt_width/2, body_note_y - 0.55), (px + prompt_width/2, py - 0.4), stroke: 0.8pt, mark: (end: "stealth", scale: 0.4))

    // Question panel (right side)
    let qx = px + prompt_width + gap
    let qy = py

    // Question label
    content((qx + question_width/2, qy + prompt_height + 0.3), text(size: 8pt, weight: "bold")[Question: Standard Multiple-Choice])

    // Question box
    rect((qx, qy), (qx + question_width, qy + question_height), stroke: border_color + 1.5pt, fill: question_bg)

    // Question text
    content((qx + 0.3, qy + question_height - 0.5), anchor: "west", text(size: 8pt, weight: "bold")[What is the increase . . . ?])

    // Answer options
    let opt_x = qx + 0.6
    let opt_start_y = qy + question_height - 1.2
    let opt_spacing = 0.5

    // Radio circles and options
    circle((opt_x, opt_start_y), radius: 0.12, stroke: border_color + 0.8pt, fill: white)
    content((opt_x + 0.3, opt_start_y), anchor: "west", text(size: 7.5pt)[10%])

    circle((opt_x, opt_start_y - opt_spacing), radius: 0.12, stroke: border_color + 0.8pt, fill: tab_active)
    content((opt_x + 0.3, opt_start_y - opt_spacing), anchor: "west", text(size: 7.5pt)[20%])

    circle((opt_x, opt_start_y - 2*opt_spacing), radius: 0.12, stroke: border_color + 0.8pt, fill: white)
    content((opt_x + 0.3, opt_start_y - 2*opt_spacing), anchor: "west", text(size: 7.5pt)[30%])

    circle((opt_x, opt_start_y - 3*opt_spacing), radius: 0.12, stroke: border_color + 0.8pt, fill: white)
    content((opt_x + 0.3, opt_start_y - 3*opt_spacing), anchor: "west", text(size: 7.5pt)[40%])

    circle((opt_x, opt_start_y - 4*opt_spacing), radius: 0.12, stroke: border_color + 0.8pt, fill: white)
    content((opt_x + 0.3, opt_start_y - 4*opt_spacing), anchor: "west", text(size: 7.5pt)[50%])

    // Answer annotation
    let ans_note_y = qy + 0.5
    content((qx + question_width/2, ans_note_y - 1), text(size: 6.5pt)[Choose one answer from five.])
    line((qx + question_width/2, ans_note_y - 0.55), (qx + question_width/2, qy - 0.4), stroke: 0.8pt, mark: (end: "stealth", scale: 0.4))
  })
]

#v(0.3em)
#align(center)[
  #text(size: 8pt, style: "italic")[MSR Interface: Tabbed information sources (left) with standard question format (right)]
]

== Question Types

#info-box[
  *Common MSR question formats:*
  - Yes/No/Cannot be determined
  - Multiple choice
  - Inference questions
  - Calculation questions
  - "According to" questions
]

#pagebreak()

= Part 2: Source Types

== Text Sources (Emails, Reports, Memos)

#info-box[
  *Characteristics:*
  - Written communication between parties
  - May contain opinions vs. facts
  - Time-sensitive information
  - May update or contradict other sources
]

*What to look for:*
- Key facts and figures mentioned
- Dates and timelines
- Recommendations or decisions
- Updates to previous information

== Tabular Data

#info-box[
  *Characteristics:*
  - Organized numerical data
  - May be sortable (like Table Analysis)
  - Precise values available
]

*What to look for:*
- Column headers and what they measure
- Units (thousands, millions, percentages)
- Totals and subtotals

== Graphical Data

#info-box[
  *Characteristics:*
  - Visual representation of trends or comparisons
  - May show time series or categorical data
  - Often requires estimation
]

== Descriptive Text

#info-box[
  *Characteristics:*
  - Background information
  - Definitions or context
  - Rules or constraints
]

#pagebreak()

= Part 3: Navigation Strategy

== Initial Scan

#strategy-box[
  *Before answering questions:*
  1. Click through ALL tabs quickly (30-45 seconds)
  2. Note what type of information each tab contains
  3. Don't read in detail yet—just survey
  4. Create a mental "index" of what's where
]

== Question-Driven Approach

#strategy-box[
  *For each question:*
  1. Read the question carefully
  2. Identify what information you need
  3. Go to the relevant tab(s)
  4. Find the specific data
  5. Synthesize if multiple tabs needed
]

#warning-box[
  *Don't:*
  - Read all sources thoroughly before looking at questions
  - Toggle between tabs randomly
  - Memorize data you might not need
]

#pagebreak()

= Part 4: Information Synthesis

== Cross-Referencing

#info-box[
  *When questions require multiple sources:*
  1. Identify what each source contributes
  2. Note any common reference points (same categories, time periods)
  3. Combine information logically
  4. Watch for unit differences between sources
]

#example-box[
  *Question: What was the total marketing expense in Q3?*

  - Tab 1 (Email): "Marketing budget is 15% of total budget"
  - Tab 2 (Report): "Total Q3 budget: \$2 million"

  Synthesis: Q3 Marketing = 15% × \$2M = \$300,000
]

== Handling Contradictions

#warning-box[
  *Sources may contradict each other!*

  Look for:
  - Time stamps (later information may update earlier)
  - Projected vs. actual figures
  - Different scopes or definitions

  Usually, more recent or actual data supersedes projections.
]

#pagebreak()

= Part 5: Question Types in MSR

== Type 1: Single Source Questions

"According to the email, what was the proposed deadline?"

*Strategy:* Go directly to the relevant tab, find the answer.

== Type 2: Multi-Source Synthesis

"What is the total cost if the project uses the recommended approach?"

*Strategy:* Identify all relevant sources, combine information.

== Type 3: Inference Questions

"Which of the following can be inferred from the information provided?"

*Strategy:* Test each answer choice against the sources.

== Type 4: Yes/No/Cannot Be Determined

"Can it be determined whether the project will be profitable?"

#info-box[
  *The three options:*
  - *Yes:* Information definitively supports it
  - *No:* Information definitively contradicts it
  - *Cannot be determined:* Information is insufficient

  "Cannot be determined" is NOT the same as "No"!
]

== Type 5: Calculation Questions

"What percentage of total revenue came from Division A?"

*Strategy:* Find relevant numbers in sources, calculate.

#pagebreak()

= Part 6: Time Management

== Pacing Guidelines

#info-box[
  *Target Time:* 3-4 minutes per MSR set (not per question)

  MSR sets are the most time-consuming in DI. Budget time carefully!

  *Hard limit:* Don't spend more than 4 minutes on any MSR set.
]

== Efficiency Tips

#strategy-box[
  1. *Don't read everything* - question-driven approach
  2. *Note tab contents quickly* - build mental index
  3. *Answer easier questions first* - if a set has 3 questions
  4. *Cut losses* - if a question is too time-consuming, make best guess
]

#warning-box[
  *MSR Time Trap:*

  It's easy to spend 5+ minutes on an MSR set. This hurts your overall section timing. Set a mental alarm at 3 minutes to check progress.
]

#pagebreak()

= Part 7: Common MSR Patterns

== Pattern 1: Budget/Financial Analysis

Sources: Proposal, budget table, historical data
Questions: Total cost, variance from budget, comparison to previous period

== Pattern 2: Project Management

Sources: Timeline email, task list, resource allocation
Questions: Completion date, resource requirements, schedule impact

== Pattern 3: Business Decision

Sources: Options description, pros/cons analysis, market data
Questions: Best option, key factors, risks

== Pattern 4: Research Summary

Sources: Study description, results table, conclusions
Questions: Findings interpretation, limitations, implications

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. MSR format and tab navigation
2. Initial scanning technique
3. Question-driven approach
4. Single-source questions

*Question Time:* 3-4 MSR sets with 2-3 sources each

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Multi-source synthesis
2. Handling contradictions
3. Yes/No/Cannot be determined questions
4. Time management strategies

*Review errors from Training #1, focusing on:*
- Missing information in a source
- Misinterpreting "cannot be determined"
- Time management issues

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Efficient navigation
- Time limits and when to move on

*Assessment:* ~20 questions from 7-8 MSR sets, 50 minutes

== Common Student Difficulties

1. Spending too much time reading all sources thoroughly
2. Missing information that's in a different tab
3. Confusing "No" with "Cannot be determined"
4. Not cross-referencing when needed
5. Running out of time

#warning-box[
  *Tutor Tip:* Practice the "45-second scan" technique. Students should be able to identify the type and general content of each tab in under a minute total.
]

#tip-box[
  *After this topic:* DI section is complete! Next, the student will take DI section assessments before moving to Verbal Reasoning.
]
