#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Two-Part Analysis & Multi-Source Reasoning",
  level: "Lesson Material",
  intro: "Comprehensive lesson covering two-part analysis questions with interconnected answers and multi-source reasoning with tabbed information synthesis.",
  logo: "/Logo.png"
)

= Lesson Overview

*Topics:* Two-Part Analysis (TPA) & Multi-Source Reasoning (MSR)\
*Section:* Data Insights\
*Lesson Sequence:* DI-04/05 (Combined TPA and MSR topics)

== Learning Objectives

By the end of this lesson, you should be able to:

*Two-Part Analysis (TPA):*
1. Understand the TPA format with two columns and shared options
2. Identify relationships between the two parts
3. Solve mathematical TPA problems (equations, constraints)
4. Solve logical TPA problems (strengthen/weaken style)
5. Determine which part to solve first
6. Check answer consistency efficiently

*Multi-Source Reasoning (MSR):*
1. Navigate multiple information tabs efficiently
2. Synthesize information from 2-3 different sources
3. Cross-reference data to answer questions
4. Identify which sources contain relevant information
5. Resolve contradictions or updates between sources
6. Manage time effectively on longer MSR sets

== GMAT Relevance

*TPA* tests the ability to solve interconnected problems—a skill essential for business analysis where multiple related factors must be considered simultaneously.

*MSR* mirrors real business scenarios where information comes from multiple reports, emails, and data sources. This is arguably the most "real-world" question type on the GMAT.

#pagebreak()

= Part 1: Two-Part Analysis (TPA)

== TPA Question Format

#info-box[
  *Every TPA Question Has:*
  1. A problem statement or scenario
  2. A table with two question columns and shared answer options
  3. You select ONE option for each column

  Both selections must come from the SAME set of answer options.
]

#example-box[
  *Sample TPA Format:*

  A store sells two products. Product A costs \$15 and Product B costs \$20. A customer spent exactly \$100.

  #align(center)[
    #table(
      columns: 3,
      stroke: 0.5pt + gray,
      inset: 8pt,
      align: center,
      fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
      [*Product A Qty*], [*Product B Qty*], [*Options*],
      [○], [○], [0],
      [○], [○], [1],
      [○], [○], [2],
      [●], [○], [4],
      [○], [●], [2],
      [○], [○], [5],
    )
  ]

  Select 4 for Product A ($4 times 15 = 60$) and 2 for Product B ($2 times 20 = 40$)\
  Total $= 100$ ✓
]

== TPA Scoring

#info-box[
  Each column selection is scored together.
  - Getting one correct but not the other: zero credit
  - Both must be from the same option list
]

#pagebreak()

== Types of TPA Problems

=== Type 1: Mathematical/Constraint Problems

#info-box[
  *Characteristics:*
  - Two unknowns related by equations or constraints
  - Answer options are numerical values
  - Solutions must satisfy given conditions
]

#example-box[
  *Given: $x + y = 10$ and $x - y = 4$*

  Find $x$ and $y$ from the options.

  Solving: $x = 7$, $y = 3$
]

=== Type 2: Logical/Argument Problems

#info-box[
  *Characteristics:*
  - Argument or scenario described
  - One column: "Strengthens the argument"
  - Other column: "Weakens the argument"
  - Options are statements or facts

  These are like Critical Reasoning questions with a twist.
]

=== Type 3: Business Scenario Problems

#info-box[
  *Characteristics:*
  - Real-world business scenario
  - Find two related quantities (cost and revenue, supply and demand)
  - May involve optimization
]

#tip-box[
  *Frequency on GMAT:*
  - Mathematical TPA: Most common
  - Logical TPA: Common
  - Business Scenario TPA: Less common
]

#pagebreak()

== Solving Mathematical TPA

=== Identifying Relationships

#strategy-box[
  *Look for:*
  - Equations relating the two unknowns
  - Constraints limiting possible values
  - Whether the two parts are independent or dependent
]

=== Constraint Analysis

#example-box[
  *Problem: A vendor sells apples for \$2 and bananas for \$3. Total revenue was \$50.*

  *Constraint:* $2A + 3B = 50$ (where $A$ and $B$ are positive integers)

  *Test options:*
  - If $A = 4$: $2(4) + 3B = 50 arrow.r 3B = 42 arrow.r B = 14$ ✓
  - If $A = 10$: $2(10) + 3B = 50 arrow.r 3B = 30 arrow.r B = 10$ ✓

  Multiple solutions possible! Need additional constraint or check options.
]

=== Systems of Equations

#tip-box[
  *For two equations with two unknowns:*
  1. Use substitution or elimination
  2. Verify solution satisfies both equations
  3. Match to answer options
]

#pagebreak()

== Solving Logical TPA

=== The Strengthen/Weaken Format

#info-box[
  *Common logical TPA format:*

  "Select the statement that strengthens the conclusion and the statement that weakens the conclusion."

  Apply Critical Reasoning skills to both columns.
]

=== Approach for Logical TPA

#strategy-box[
  1. Identify the conclusion in the argument
  2. Identify the evidence supporting it
  3. Find the assumption (gap between evidence and conclusion)
  4. Look for options that:
     - Support the assumption (strengthen)
     - Attack the assumption (weaken)
]

=== Common Logical Relationships

#info-box[
  *Strengthening:*
  - Provides additional evidence
  - Rules out alternative explanations
  - Supports the assumption

  *Weakening:*
  - Provides counter-evidence
  - Suggests alternative explanations
  - Attacks the assumption
]

#pagebreak()

== TPA Strategic Solving

=== Which Part First?

#strategy-box[
  *Solve the more constrained part first:*

  - If one column has fewer valid options, start there
  - If one part is independent, solve it first
  - If neither is clearly easier, just pick one and test
]

=== Testing Efficiency

#tip-box[
  *Smart Testing:*
  1. Don't test all options for both columns
  2. Narrow down one column first
  3. Then test remaining candidates in the other
]

=== Checking Consistency

#warning-box[
  *Before finalizing:*
  - Verify both selections satisfy ALL given conditions
  - For math problems: plug values back into equations
  - For logical problems: ensure one truly strengthens and one truly weakens
]

#pagebreak()

== Common TPA Patterns

=== Pattern 1: Sum and Difference

If given $x + y$ and $x - y$, you can find $x$ and $y$:\
\
$x = display(("sum" + "difference") / 2)$\
\
$y = display(("sum" - "difference") / 2)$

=== Pattern 2: Price × Quantity

#info-box[
  $"Total" = "Price"_1 times "Quantity"_1 + "Price"_2 times "Quantity"_2$

  If you know the total and prices, test quantity combinations from options.
]

=== Pattern 3: Ratio Problems

If items are in ratio $a:b$ and total is known:
- First item $= display(a / (a+b)) times "Total"$
- Second item $= display(b / (a+b)) times "Total"$

=== Pattern 4: Rate × Time Problems

$"Distance" = "Rate" times "Time"$ or $"Work" = "Rate" times "Time"$

#tip-box[
  *Tip:* Memorize these patterns to save time! Recognize the pattern → Apply the formula → Test options
]

#pagebreak()

== TPA Time Management

#info-box[
  *Target Time:* 2-2.5 minutes per TPA question

  TPA requires careful analysis but shouldn't take too long if you identify the relationship quickly.
]

#strategy-box[
  *Efficiency Tips:*
  1. *Identify problem type immediately* - math or logical?
  2. *Write down relationships/constraints* - don't solve in your head
  3. *Eliminate impossible options* - reduce testing
  4. *Check both parts together* - they must be consistent
]

#pagebreak()

= Part 2: Multi-Source Reasoning (MSR)

== MSR Question Format

#info-box[
  *Every MSR Set Has:*
  1. 2-3 tabs of information (click to switch between)
  2. 1-3 questions based on ALL sources
  3. Questions may require information from one OR multiple tabs

  *Tab types:* Text (emails, reports), Tables, Charts, Descriptions
]

#example-box[
  *Sample MSR Structure:*

  *Tab 1 - Email:* Project timeline and budget overview\
  *Tab 2 - Report:* Detailed cost breakdown by department\
  *Tab 3 - Chart:* Historical spending trends

  Questions ask about:
  - Total budget (requires Tab 1 + Tab 2)
  - Comparison to last year (requires Tab 3)
  - Timeline feasibility (Tab 1)
]

== MSR Question Types

#info-box[
  *Common MSR question formats:*
  - Yes/No/Cannot be determined
  - Multiple choice
  - Inference questions
  - Calculation questions
  - "According to" questions
]

#pagebreak()

== Source Types in MSR

=== Text Sources (Emails, Reports, Memos)

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

=== Tabular Data

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

=== Graphical Data

#info-box[
  *Characteristics:*
  - Visual representation of trends or comparisons
  - May show time series or categorical data
  - Often requires estimation
]

=== Descriptive Text

#info-box[
  *Characteristics:*
  - Background information
  - Definitions or context
  - Rules or constraints
]

#pagebreak()

== MSR Navigation Strategy

=== Initial Scan

#strategy-box[
  *Before answering questions:*
  1. Click through ALL tabs quickly (30-45 seconds)
  2. Note what type of information each tab contains
  3. Don't read in detail yet—just survey
  4. Create a mental "index" of what's where
]

=== Question-Driven Approach

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

== Information Synthesis in MSR

=== Cross-Referencing

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

=== Handling Contradictions

#warning-box[
  *Sources may contradict each other!*

  Look for:
  - Time stamps (later information may update earlier)
  - Projected vs. actual figures
  - Different scopes or definitions

  Usually, more recent or actual data supersedes projections.
]

#pagebreak()

== MSR Question Types Deep Dive

=== Type 1: Single Source Questions

"According to the email, what was the proposed deadline?"

*Strategy:* Go directly to the relevant tab, find the answer.

=== Type 2: Multi-Source Synthesis

"What is the total cost if the project uses the recommended approach?"

*Strategy:* Identify all relevant sources, combine information.

=== Type 3: Inference Questions

"Which of the following can be inferred from the information provided?"

*Strategy:* Test each answer choice against the sources.

=== Type 4: Yes/No/Cannot Be Determined

"Can it be determined whether the project will be profitable?"

#info-box[
  *The three options:*
  - *Yes:* Information definitively supports it
  - *No:* Information definitively contradicts it
  - *Cannot be determined:* Information is insufficient

  "Cannot be determined" is NOT the same as "No"!
]

=== Type 5: Calculation Questions

"What percentage of total revenue came from Division A?"

*Strategy:* Find relevant numbers in sources, calculate.

#pagebreak()

== MSR Time Management

#info-box[
  *Target Time:* 3-4 minutes per MSR set (not per question)

  MSR sets are the most time-consuming in DI. Budget time carefully!

  *Hard limit:* Don't spend more than 4 minutes on any MSR set.
]

#strategy-box[
  *Efficiency Tips:*
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

== Common MSR Patterns

=== Pattern 1: Budget/Financial Analysis

*Sources:* Proposal, budget table, historical data\
*Questions:* Total cost, variance from budget, comparison to previous period

=== Pattern 2: Project Management

*Sources:* Timeline email, task list, resource allocation\
*Questions:* Completion date, resource requirements, schedule impact

=== Pattern 3: Business Decision

*Sources:* Options description, pros/cons analysis, market data\
*Questions:* Best option, key factors, risks

=== Pattern 4: Research Summary

*Sources:* Study description, results table, conclusions\
*Questions:* Findings interpretation, limitations, implications

#pagebreak()

= Practice Questions

== Two-Part Analysis Questions

#v(1em)

*Question 1* #h(1fr) #box(fill: rgb("#ffb606").lighten(80%), inset: 4pt, radius: 2pt)[Medium]

The Quasi JX is a new car model. Under ideal driving conditions, the Quasi JX's fuel economy is $E$ kilometers per liter $(E frac("km","L"))$ when its driving speed is constant at $S$ kilometers per hour $(S frac("km","hr"))$.

In terms of the variables $S$ and $E$, select the expression that represents the number of liters of fuel used in 1 hour of driving under ideal driving conditions at a constant speed $S$, and select the expression that represents the number of liters of fuel used in a 60 km drive under ideal driving conditions at a constant speed $S$. Make only two selections, one in each column.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Liters in 1 hour*], [*Liters in 60 km*], [*Expression*],
    [○], [○], [$frac(S, E)$],
    [○], [○], [$frac(60, E)$],
    [○], [○], [$frac(60, S)$],
    [○], [○], [$frac(S, 60)$],
    [○], [○], [$frac(E, 60)$],
  )
]

#v(2em)

*Question 2* #h(1fr) #box(fill: rgb("#e53935").lighten(80%), inset: 4pt, radius: 2pt)[Hard]

Over a period of 5 academic years from Fall 1999 through Spring 2004, the number of faculty at a certain college increased despite a decrease in student enrollment from 5,500 students in Fall 1999. In the given expressions, $F$ and $S$ represent the percent change in the number of faculty and students, respectively, over the 5 academic years, and $R$ represents the number of students per faculty member in Fall 1999. The percent change in a quantity $X$ is calculated using the formula $display(frac(X_"new" - X_"old", X_"old"))(100)$.

Select the expression that represents the number of faculty in Fall 1999, and select the expression that represents the number of students per faculty member in Spring 2004.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Faculty Fall 1999*], [*Students/Faculty Spring 2004*], [*Expression*],
    [○], [○], [$5500R$],
    [○], [○], [$frac(5500, R)$],
    [○], [○], [$frac(1, R)$],
    [○], [○], [$display(frac(100+S, 100+F))R$],
    [○], [○], [$display(frac(100-S, 100+F))R$],
    [○], [○], [$display(frac(100+S, 100-F))R$],
  )
]

#pagebreak()

*Question 3* #h(1fr) #box(fill: rgb("#4caf50").lighten(80%), inset: 4pt, radius: 2pt)[Easy]

Trains M and N are traveling west on parallel tracks. At exactly noon, the front of Train M, which is traveling at a constant speed of 80 kilometers per hour (km/h), is at the rail crossing at Location X, and the front of Train N, which is traveling at a constant speed of 65 km/h, is 30 km west of the rail crossing at Location X.

In the table, identify the number of kilometers that the front of Train M has traveled between noon and 12:45 p.m. and the number of kilometers that the front of Train N has traveled between noon and 1:00 p.m.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Train M (noon to 12:45)*], [*Train N (noon to 1:00)*], [*Kilometers*],
    [○], [○], [55],
    [○], [○], [60],
    [○], [○], [65],
    [○], [○], [70],
    [○], [○], [75],
  )
]

#v(2em)

*Question 4* #h(1fr) #box(fill: rgb("#4caf50").lighten(80%), inset: 4pt, radius: 2pt)[Easy]

An international basketball tournament will be held in either Nation QN or Nation RN. Exactly six nations, including the host, plan to participate, depending on the following conditions:

- SN will participate only if TN does.
- UN will not participate if either VN or WN does.
- WN will not participate unless the tournament is held in RN.

Based on the information provided, and assuming WN participates, in the first column select the nation that must also participate, and in the second column select the nation that will not participate.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Must participate*], [*Will not participate*], [*Nation*],
    [○], [○], [QN],
    [○], [○], [RN],
    [○], [○], [SN],
    [○], [○], [TN],
    [○], [○], [UN],
    [○], [○], [VN],
  )
]

#pagebreak()

*Question 5* #h(1fr) #box(fill: rgb("#4caf50").lighten(80%), inset: 4pt, radius: 2pt)[Easy]

A portion of an automobile test track is divided into Segment A, Segment B, and Segment C, in that order. In a performance test on a car, the car traveled Segment A at a constant speed of 140 kilometers per hour (km/h). Immediately after this, the car rapidly slowed on Segment B and then traveled on Segment C at a constant speed of 70 km/h. The length of Segment C is 3 times the length of Segment A, and it took a total of 42 minutes for the car to travel both Segments A and C.

In the table, select the length of Segment A, in kilometers, and select the length of Segment C, in kilometers.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Segment A (km)*], [*Segment C (km)*], [*Length*],
    [○], [○], [8],
    [○], [○], [14],
    [○], [○], [24],
    [○], [○], [42],
    [○], [○], [72],
    [○], [○], [126],
  )
]

#v(2em)

*Question 6* #h(1fr) #box(fill: rgb("#4caf50").lighten(80%), inset: 4pt, radius: 2pt)[Easy]

For a randomly selected day, the probability that a visitor to a certain pond will see at least one swan is 0.35. The probability that a visitor to that pond on a randomly selected day will see at least one heron is 0.2. Furthermore, seeing a swan and seeing a heron are independent of each other.

Based on the information provided, select *Both swan and heron* for the probability that a visitor to the pond will see both at least one swan and at least one heron on any given day, and select *Neither swan nor heron* for the probability that a visitor to the pond will see neither a swan nor a heron on any given day.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Both swan and heron*], [*Neither swan nor heron*], [*Probability*],
    [○], [○], [0.02],
    [○], [○], [0.07],
    [○], [○], [0.48],
    [○], [○], [0.52],
    [○], [○], [0.70],
  )
]

#pagebreak()

*Question 7* #h(1fr) #box(fill: rgb("#ffb606").lighten(80%), inset: 4pt, radius: 2pt)[Medium]

The following excerpt from a fictitious science news report discusses a fictitious type of location called a *morefa*.

#example-box[
For zoologists studying the behavior of certain species of birds, the critical importance of observing the birds in those species' morefa during the annual breeding season is obvious. Such observation allows researchers to study not only the courtship displays of many different individuals within a species, but also the species' social hierarchy. Moreover, since some species repeatedly return to the same morefa, researchers can study changes in group dynamics from year to year. The value of observing a morefa when the birds are not present, however—such as prior to their arrival or after they have abandoned the area to establish their nests—is only now becoming apparent.
]

Based on the definition of the imaginary word morefa that can be inferred from the paragraph above, which of the following activities of a bird species *must happen* in a location for that location to be the species' morefa, and which *must NOT happen* in a location for that location to be the species' morefa?

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Must happen*], [*Must NOT happen*], [*Activity*],
    [○], [○], [Sleeping],
    [○], [○], [Occupying the location multiple times],
    [○], [○], [Establishing nests],
    [○], [○], [Gathering together with members of their own species],
    [○], [○], [Territorial competition with members of different species],
  )
]

#pagebreak()

*Question 8* #h(1fr) #box(fill: rgb("#e53935").lighten(80%), inset: 4pt, radius: 2pt)[Hard]

A literature department at a small university in an English-speaking country is organizing a two-day festival in which it will highlight the works of ten writers who have been the subjects of recent scholarly work by the faculty. Five writers will be featured each day. To reflect the department's strengths, the majority of writers scheduled on one of the days will be writers whose primary writing language is not English. On the other day of the festival, at least four of the writers will be women. Neither day should have more than two writers from the same country. Departmental members have already agreed on a schedule for eight of the writers:

*Day 1:*
- Achebe (male, English, Nigeria)
- Weil (female, French, France)
- Gavalda (female, French, France)
- Barrett Browning (female, English, UK)

*Day 2:*
- Rowling (female, English, UK)
- Austen (female, English, UK)
- Ocantos (male, Spanish, Argentina)
- Lu Xun (male, Chinese, China)

Select a writer who could be added to the schedule for *either day*. Then select a writer who could be added to the schedule for *neither day*.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Either day*], [*Neither day*], [*Writer*],
    [○], [○], [LeGuin (female, English, USA)],
    [○], [○], [Longfellow (male, English, USA)],
    [○], [○], [Murasaki (female, Japanese, Japan)],
    [○], [○], [Colette (female, French, France)],
    [○], [○], [Vargas Llosa (male, Spanish, Peru)],
    [○], [○], [Zola (male, French, France)],
  )
]

#pagebreak()

*Question 9* #h(1fr) #box(fill: rgb("#ffb606").lighten(80%), inset: 4pt, radius: 2pt)[Medium]

Radhika is refinancing a business loan and is considering 2 different loan offers. Under Offer 1, the loan's initial principal would be \$190,000, and she would pay down \$1,250 in principal with each monthly payment during the first year of the loan. Under Offer 2, \$4,000 in refinancing fees would be added to bring the principal to \$194,000, but she would pay down \$1,775 in principal with each monthly payment during the first year of the loan.

In the first column of the table, select the amount of principal that would remain after 12 monthly payments under Offer 1. In the second column of the table, select the amount of principal that would remain after 12 monthly payments under Offer 2.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Offer 1 remaining*], [*Offer 2 remaining*], [*Amount*],
    [○], [○], [\$168,700],
    [○], [○], [\$171,000],
    [○], [○], [\$172,700],
    [○], [○], [\$175,000],
    [○], [○], [\$176,700],
    [○], [○], [\$179,000],
  )
]

#v(2em)

*Question 10* #h(1fr) #box(fill: rgb("#ffb606").lighten(80%), inset: 4pt, radius: 2pt)[Medium]

Loan X has a principal of $x$ and a yearly simple interest rate of 4%. Loan Y has a principal of $y$ and a yearly simple interest rate of 8%. Loans X and Y will be consolidated to form Loan Z with a principal of $(x + y)$ and a yearly simple interest rate of $r%$, where $r = display(frac(4x + 8y, x + y))$.

Select a value for $x$ and a value for $y$ corresponding to a yearly simple interest rate of 5% for the consolidated loan.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*x*], [*y*], [*Value*],
    [○], [○], [21,000],
    [○], [○], [32,000],
    [○], [○], [51,000],
    [○], [○], [64,000],
    [○], [○], [81,000],
    [○], [○], [96,000],
  )
]

#pagebreak()

== Multi-Source Reasoning Questions

The following questions (11-16) are based on the same set of sources about the Island Museum's Kaxna collection.

#info-box[
*Tab 1: Techniques*

Island Museum analyzes historical artifacts using one or more techniques described below—all but one of which is performed by an outside laboratory—to obtain specific information about an object's creation. For each type of material listed, the museum uses only the technique described:

- *Animal teeth or bones:* The museum performs isotope ratio mass spectrometry (IRMS) in-house to determine the ratios of chemical elements present, yielding clues as to the animal's diet and the minerals in its water supply.

- *Metallic ores or alloys:* Inductively coupled plasma mass spectrometry (ICP-MS) is used to determine the ratios of traces of metallic isotopes present, which differ according to where the sample was obtained.

- *Plant matter:* While they are living, plants absorb carbon-14, which decays at a predictable rate after death; thus radiocarbon dating is used to estimate a plant's date of death.

- *Fired-clay objects:* Thermoluminescence (TL) dating is used to provide an estimate of the time since clay was fired to create the object.
]

#info-box[
*Tab 2: Artifacts*

Island Museum has acquired a collection of metal, fired clay, stone, bone, and wooden artifacts found on the Kaxna Islands, and presumed to be from the Kaxna Kingdom of 1250-850 BC. Researchers have mapped all the mines, quarries, and sources of clay on Kaxna and know that wooden artifacts of that time were generally created within 2 years after tree harvest. There is, however, considerable uncertainty as to whether these artifacts were actually created on Kaxna.

In analyzing these artifacts, the museum assumes that radiocarbon dating is accurate to approximately ±200 years and TL dating is accurate to approximately ±100 years.
]

#info-box[
*Tab 3: Budget*

For outside laboratory tests, the museum's first-year budget for the Kaxna collection allows unlimited IRMS testing, and a total of \$7,000—equal to the cost of 4 TL tests plus 15 radiocarbon tests, or the cost of 40 ICP-MS tests—for all other tests. For each technique applied by an outside lab, the museum is charged a fixed price per artifact.
]

#pagebreak()

*Question 11* #h(1fr) #box(fill: rgb("#4caf50").lighten(80%), inset: 4pt, radius: 2pt)[Easy]

For each of the following artifacts, indicate whether a range of dates for the object's creation can be obtained using one of the techniques in the manner described.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Yes*], [*No*], [*Artifact*],
    [○], [○], [Bronze statue of a deer],
    [○], [○], [Fired-clay pot],
    [○], [○], [Wooden statue of a warrior],
  )
]

#v(2em)

*Question 12* #h(1fr) #box(fill: rgb("#ffb606").lighten(80%), inset: 4pt, radius: 2pt)[Medium]

For each of the following, indicate whether the test result confirms the artifact was created during the time of the Kaxna Kingdom (1250-850 BC).

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Yes*], [*No*], [*Artifact and test result*],
    [○], [○], [Bone necklace shown by IRMS to have element ratios characteristic of artifacts known to be from the Kaxna Kingdom],
    [○], [○], [Fired-clay jug dated to 1050 BC by TL dating],
    [○], [○], [Copper box shown by ICP-MS to have the same ratio of trace metals found in the copper mines of Kaxna],
  )
]

#pagebreak()

*Question 13* #h(1fr) #box(fill: rgb("#ffb606").lighten(80%), inset: 4pt, radius: 2pt)[Medium]

For each of the following sets of artifacts, indicate whether the cost of all pertinent techniques can be shown to be within the museum's first-year Kaxna budget.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Yes*], [*No*], [*Artifacts*],
    [○], [○], [2 fired-clay statues and 10 bronze statues],
    [○], [○], [3 fired-clay statues and 5 tin implements],
    [○], [○], [4 fired-clay pots and 20 wooden statues],
  )
]

#v(2em)

*Question 14* #h(1fr) #box(fill: rgb("#e53935").lighten(80%), inset: 4pt, radius: 2pt)[Hard]

For each of the following sets of artifacts, indicate whether the cost of all pertinent techniques can be shown to be within the museum's first-year Kaxna budget.

#align(center)[
  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: center,
    fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
    [*Yes*], [*No*], [*Artifacts*],
    [○], [○], [2 bone implements and 5 fired-clay cups decorated with gold],
    [○], [○], [7 wooden statues and 20 metal implements],
    [○], [○], [15 wooden statues decorated with bone],
  )
]

#pagebreak()

*Question 15* #h(1fr) #box(fill: rgb("#ffb606").lighten(80%), inset: 4pt, radius: 2pt)[Medium]

Among the Kaxna artifacts is a wooden box containing both a small fired-clay bead and some river sediment containing clay and plant matter. Based on the museum's assumptions, which one of the following details about the bead can be determined by applying one of the tests in the manner described?

#v(0.5em)
(A) A range of dates for its manufacture

(B) The Kaxna island on which it was made

(C) Vegetation patterns near the workshop where it was made

(D) A range of dates for its placement in the box

(E) The source of clay used to make the bead

#v(2em)

*Question 16* #h(1fr) #box(fill: rgb("#ffb606").lighten(80%), inset: 4pt, radius: 2pt)[Medium]

Which one of the following pieces of information would, on its own, provide the strongest evidence that the given artifact was actually produced on Kaxna?

#v(0.5em)
(A) A radiocarbon date of 1050 BC for a wooden bowl

(B) IRMS analysis of a necklace made from animal bones and teeth

(C) A TL date for a fired-clay brick that places it definitively in the period of the Kaxna Kingdom

(D) ICP-MS analysis of a metal tool that reveals element ratios unique to a mine on Kaxna

(E) Determination that a stone statue was found near a quarry known to produce stone statues during the Kaxna Kingdom

#pagebreak()

= Answer Key

== Two-Part Analysis Answers

#table(
  columns: (auto, auto, auto, auto),
  align: center,
  fill: (col, row) => if row == 0 { rgb("#021d49").lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Q*], [*Column 1*], [*Column 2*], [*Difficulty*],
  [1], [$frac(S, E)$], [$frac(60, E)$], [Medium],
  [2], [$frac(5500, R)$], [$display(frac(100+S, 100+F))R$], [Hard],
  [3], [60], [65], [Easy],
  [4], [RN], [UN], [Easy],
  [5], [14], [42], [Easy],
  [6], [0.07], [0.52], [Easy],
  [7], [Gathering together...], [Establishing nests], [Medium],
  [8], [Murasaki], [Longfellow], [Hard],
  [9], [\$175,000], [\$172,700], [Medium],
  [10], [96,000], [32,000], [Medium],
)

#v(1em)

== Multi-Source Reasoning Answers

#table(
  columns: (auto, auto, auto),
  align: center,
  fill: (col, row) => if row == 0 { rgb("#021d49").lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Q*], [*Answer(s)*], [*Difficulty*],
  [11], [No, Yes, Yes], [Easy],
  [12], [No, Yes, No], [Medium],
  [13], [Yes, Yes, No], [Medium],
  [14], [No, Yes, Yes], [Hard],
  [15], [A], [Medium],
  [16], [D], [Medium],
)

#pagebreak()

= Answer Explanations

== TPA Explanations

*Question 1:* In 1 hour at speed $S$ km/hr, you travel $S$ km. With fuel economy $E$ km/L, you use $S/E$ liters. For 60 km, regardless of speed, you use $60/E$ liters.

*Question 2:* Faculty in Fall 1999 = Students / (Students per faculty) = $5,500/R$. For Spring 2004 ratio, both quantities change by their respective percentages, giving the formula $(100+S)/(100+F) times R$.

*Question 3:* Train M at 80 km/hr for 45 min (0.75 hr) = 60 km. Train N at 65 km/hr for 1 hr = 65 km.

*Question 4:* If WN participates, tournament must be in RN (WN's condition). Since RN hosts, RN participates. UN won't participate if WN does.

*Question 5:* Let A = length of Segment A. Then C = 3A. Time: $A/140 + 3A/70 = A/140 + 6A/140 = 7A/140 = 42/60$ hours. Solving: A = 14 km, C = 42 km.

*Question 6:* Both: $0.35 times 0.2 = 0.07$. Neither: $(1-0.35) times (1-0.2) = 0.65 times 0.8 = 0.52$.

*Question 7:* The passage indicates morefas are where birds gather for courtship (social gathering) and birds "abandon the area to establish their nests" (nesting happens elsewhere).

*Question 8:* Day 1 needs majority non-English writers (has 2 French), so adding another non-English helps. Day 2 has 2 UK writers already. Murasaki (female, Japanese) works for both. Longfellow (male, English) helps neither day.

*Question 9:* Offer 1: $190,000 - 12(1,250) = 175,000$. Offer 2: $194,000 - 12(1,775) = 172,700$.

*Question 10:* For $r = 5$: $(4x + 8y)/(x+y) = 5$. Solving: $3y = x$. With $x = 96,000$, $y = 32,000$.

== MSR Explanations

*Question 11:* Bronze (metallic) → ICP-MS gives location, not dates. Fired-clay → TL dating gives dates. Wood → radiocarbon dating gives dates.

*Question 12:* IRMS gives diet info, not dates. TL at 1050 BC ± 100 years (950-1150 BC) is within Kaxna period (1250-850 BC). ICP-MS gives location, not dates.

*Question 13-14:* Budget: \$7,000 = 4 TL + 15 radiocarbon = 40 ICP-MS. So: TL ≈ \$1,000, radiocarbon ≈ \$200, ICP-MS = \$175. IRMS is unlimited (in-house).

*Question 15:* Fired-clay bead → TL dating gives manufacture date range. Other options require tests not applicable to fired clay.

*Question 16:* ICP-MS showing element ratios unique to Kaxna mines provides direct evidence of origin. Other tests show dates or non-location info.

#v(2em)

#tip-box[
  *Key Takeaways:*

  1. *TPA*: Always identify the relationship between parts first. Solve the more constrained column first.

  2. *MSR*: Use the 45-second scan technique. Let questions guide which tabs you read in detail.

  3. *Time Management*: TPA = 2-2.5 min/question; MSR = 3-4 min/set (not per question).
]
