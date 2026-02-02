#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.4.2"
#import "@preview/cetz-plot:0.1.3": plot, chart

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Table Analysis",
  level: "Lesson Material",
  intro: "Comprehensive guide covering table sorting, True/False statement evaluation, calculations from tables, and analytical strategies.",
  logo: "/Logo.png"
)

#outline(title: "Table of Contents", indent: auto, depth: 2)

#pagebreak()

/*
===============================================================================
LESSON OVERVIEW AND TUTOR NOTES
The following section contains lesson structure information and teaching notes.
This content is intended for tutors and should not be displayed to students.
===============================================================================

= Lesson Overview

*Topic:* Table Analysis (TA)\
*Section:* Data Insights\
*Lesson Sequence:* DI-03 (Third of 5 DI topics)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Navigate and sort tables efficiently
2. Evaluate True/False statements about tabular data
3. Calculate statistics from tables (median, percentages, ratios)
4. Identify patterns and relationships in data
5. Use sorting strategically to answer questions
6. Manage time effectively on TA questions

== GMAT Relevance

Table Analysis questions test your ability to organize and analyze data—a critical business skill. The sortable table format requires strategic thinking about how to extract information efficiently.

===============================================================================
END OF TUTOR-ONLY SECTION
===============================================================================
*/

= Introduction to Table Analysis

Table Analysis questions test one of the most practical skills in business: the ability to extract meaningful insights from tabular data. In business settings, professionals constantly work with spreadsheets, databases, and reports organized in table format. The GMAT includes Table Analysis specifically because this skill translates directly to success in business school case studies and real-world business analysis.

What makes Table Analysis unique among GMAT question types is the interactive sorting feature. Unlike static tables you might encounter in printed materials, the tables in this section can be sorted by any column with a single click. This functionality mirrors the way professionals actually work with data in spreadsheet applications, and learning to use it strategically is key to performing well on these questions.

Table Analysis appears in the Data Insights section of the GMAT Focus Edition. Each question presents a data table and three True/False statements that you must evaluate based on the information in the table. The statements range from simple lookups to complex analyses requiring calculations or pattern recognition. Your task is to determine whether each statement is true or false given the data provided.

The interactive nature of these questions means that success depends not just on analytical ability but also on strategic thinking. Knowing when to sort, which column to sort by, and how to extract information efficiently can save valuable time and reduce errors.

#pagebreak()

= The Table Analysis Format

== Question Structure

Every Table Analysis question follows a consistent format. Understanding this structure helps you approach each question systematically and allocate your time effectively.

The question presents a data table containing multiple rows and columns of information. The table might show company financial data, survey results, demographic information, or any other type of structured data. Each column represents a different variable or attribute, and each row represents a different entity or observation.

Below the table, you find exactly three statements, each requiring a True or False response. These statements make claims about the data—for example, "Company X has the highest revenue" or "The median number of employees is greater than 2,500." Your task is to evaluate each statement independently and determine whether it is true or false based on the information in the table.

#info-box[
  *Components of Every TA Question:*

  1. A sortable data table with multiple rows and columns
  2. Three True/False statements to evaluate
  3. Each statement is scored independently

  You must determine if each statement is True or False based on the table data.
]

== The Sortable Table Feature

The most distinctive feature of Table Analysis is that you can sort the table by clicking on any column header. This sorting capability is not just a convenience—it is an essential tool for answering many types of questions efficiently.

When you click a column header, the entire table reorders so that the values in that column appear in ascending or descending order. Clicking the same header again reverses the sort order. This allows you to quickly identify maximum and minimum values, find medians, count items above or below thresholds, and spot patterns in the data.

#align(center)[
  #grid(
    columns: (auto, auto, auto),
    gutter: 1.5em,
    align: center + horizon,
    [
      *Original Order*
      #table(
        columns: 2,
        stroke: 0.5pt + gray,
        inset: 8pt,
        align: center,
        fill: (_, y) => if y == 0 { rgb("#3498db").lighten(60%) } else { white },
        table.header([*Company*], [*Revenue*]),
        [Alpha], [150],
        [Beta], [220],
        [Gamma], [180],
      )
    ],
    [
      #text(size: 1.5em)[→]\
      #text(size: 0.8em)[Sort by Revenue]
    ],
    [
      *Sorted (Descending)*
      #table(
        columns: 2,
        stroke: 0.5pt + gray,
        inset: 8pt,
        align: center,
        fill: (x, y) => {
          if y == 0 {
            if x == 1 { rgb("#e74c3c").lighten(60%) } else { rgb("#3498db").lighten(60%) }
          } else if y == 1 {
            rgb("#d5f5e3")
          } else {
            white
          }
        },
        table.header([*Company*], [*Revenue* ↓]),
        [Beta], [*220*],
        [Gamma], [180],
        [Alpha], [150],
      )
      #text(size: 0.85em, fill: rgb("#27ae60"))[Max value now at top!]
    ],
  )
]

The diagram above illustrates how sorting transforms the table. In the original order, identifying the company with the highest revenue requires scanning all values and comparing them. After sorting by revenue in descending order, the maximum value appears immediately at the top of the table, making the answer instantly visible.

== Scoring and Partial Credit

Each of the three True/False selections is scored independently. This means that getting two statements correct and one incorrect results in partial credit—you receive credit for each correct selection regardless of how you performed on the others.

This scoring system has important implications for your approach. You should always answer all three statements, even if you are uncertain about some. An educated guess has a 50% chance of being correct, while leaving a statement blank guarantees zero credit for that selection. Additionally, you cannot proceed to the next question until you have answered all three statements.

#info-box[
  *Scoring Facts:*

  - Each True/False selection is scored independently
  - Partial credit is possible (e.g., 2 out of 3 correct)
  - You must answer all three statements to proceed
]

#pagebreak()

= Common Table Types

Table Analysis questions present data in several common formats. Recognizing these formats helps you understand what the data represents and anticipate the types of questions that might be asked.

== Comparative Tables

Comparative tables present multiple entities (companies, products, countries, etc.) with several attributes measured for each. This format allows direct comparison across entities for any given attribute.

#example-box[
  *Sample Comparative Table:*
  #align(center)[
    #table(
      columns: 4,
      stroke: 0.5pt + gray,
      inset: 6pt,
      [*Company*], [*Revenue (\$M)*], [*Employees*], [*Founded*],
      [Alpha], [150], [2,500], [1985],
      [Beta], [220], [3,100], [1992],
      [Gamma], [180], [2,800], [1988],
    )
  ]
]

In a comparative table, you might be asked to identify which entity has the highest or lowest value for a particular attribute, calculate derived values like revenue per employee, or analyze relationships between different attributes across entities.

== Time Series Tables

Time series tables track the same entity or entities over multiple time periods. These tables are excellent for analyzing trends, growth rates, and changes over time. You might see quarterly revenue figures, annual population data, or monthly sales numbers.

With time series data, questions often focus on identifying periods of growth or decline, calculating percentage changes between periods, or determining when certain thresholds were crossed.

== Mixed and Multi-Dimensional Tables

Some tables combine elements of both comparative and time series formats, or present data grouped by multiple categories. For example, a table might show sales data for multiple products across multiple regions, or financial metrics for several companies over several years.

These more complex tables require careful attention to understand how the data is organized. Before attempting to answer any statements, take a moment to identify what the rows represent, what the columns represent, and how the data is structured.

#pagebreak()

= Strategic Sorting

Sorting is your most powerful tool in Table Analysis. Using it strategically can dramatically reduce the time needed to evaluate statements and minimize the risk of errors.

== When to Sort

Sorting is particularly valuable when you need to identify extreme values, find medians, or count items meeting certain conditions. Before calculating or scanning manually, ask yourself whether sorting might provide the answer more directly.

#strategy-box[
  *Sort when you need to find:*

  - Maximum or minimum values in a column
  - The median of a dataset
  - Rankings or relative positions
  - How many values fall above or below a threshold
  - Patterns or trends in ordered data
]

For example, if a statement claims "Company X has the highest revenue," sorting by revenue immediately reveals whether this is true—Company X will either be at the top of the sorted list or it will not. No calculation or comparison is necessary once the data is sorted.

== Finding the Median

The median is the middle value in an ordered dataset. Table Analysis questions frequently ask about medians because finding them requires understanding how to use sorting effectively.

To find the median, first sort the table by the relevant column. Then identify the middle row. If the table has an odd number of rows, the median is simply the value in the middle row. If the table has an even number of rows, the median is the average of the two middle values.

#info-box[
  *Finding the Median:*

  1. Sort by the relevant column
  2. Count the total number of rows ($n$)
  3. If n is odd: The median is the value in row $display((n+1)/2)$

  4. If n is even: The median is the average of values in rows $display(n/2)$ and $display((n/2)+1)$
]

The visual below demonstrates finding the median in a table with seven rows. After sorting, the fourth row contains the median because three rows fall above it and three rows fall below it.

#align(center)[
  #block(breakable: false)[
    *Finding the Median (7 rows = odd)*
    #v(0.5em)
    #table(
      columns: 4,
      stroke: 0.5pt + gray,
      inset: 8pt,
      align: center,
      fill: (x, y) => {
        if y == 0 { rgb("#3498db").lighten(60%) }
        else if y == 4 { rgb("#f1c40f").lighten(60%) }
        else { white }
      },
      table.header([*Row*], [*Item*], [*Sales*], []),
      [1], [G], [85], [],
      [2], [A], [92], [],
      [3], [E], [105], [],
      [*4*], [*B*], [*120*], table.cell(fill: rgb("#f1c40f").lighten(60%))[#text(fill: rgb("#e67e22"), weight: "bold")[← Median]],
      [5], [D], [135], [],
      [6], [C], [148], [],
      [7], [F], [162], [],
    )
    #v(0.3em)
    #text(size: 0.9em)[_4th row is the middle: 3 rows above, 3 rows below_]
  ]
]

== Sorting for Threshold Analysis

Many statements ask about the number or proportion of items meeting certain conditions. Sorting can make these counts easier by grouping qualifying items together.

For example, if you need to determine how many companies have revenue above \$100 million, sorting by revenue places all high-revenue companies at one end of the table. You can then quickly count how many fall above the threshold without scanning the entire unsorted table.

#tip-box[
  *Counting Items Meeting a Condition:*

  1. Sort by the relevant column
  2. Locate where the threshold falls in the sorted order
  3. Count rows above (or below) that point
  4. For percentages, divide this count by the total number of rows
]

#pagebreak()

= Calculation Strategies

While sorting handles many Table Analysis questions, some statements require calculations. Understanding common calculation types and approaches helps you work efficiently.

== Percentages from Tables

Percentage calculations appear frequently in Table Analysis. The basic formula is straightforward: divide the part by the whole and multiply by 100.

Common percentage scenarios include calculating what percentage of total revenue comes from a single company, what percentage of items meet a certain condition, or how a value compares to some benchmark as a percentage.

#info-box[
  *Common Percentage Calculations:*

  - Part / Total × 100 (e.g., one company's revenue as a percentage of total revenue)
  - Items meeting condition / Total items × 100 (e.g., percentage of companies founded before 1990)
  - (New - Old) / Old × 100 (percentage change between periods)
]

== Ratios and Derived Values

Some statements require you to calculate values that are not directly shown in the table. For example, if a table shows revenue and number of employees, you might need to calculate revenue per employee for each company to determine which has the highest efficiency.

These derived values require calculation for each relevant row. Since the derived values are not in the table, you cannot sort by them directly—you must calculate them and compare manually or on scratch paper.

#warning-box[
  *Derived Values Cannot Be Sorted Directly:*

  The table shows only raw data. If a statement asks about a derived value (like revenue per employee), you must calculate it for each relevant row yourself. The sorting feature only works on columns that exist in the table.
]

#example-box[
  *Calculating Revenue per Employee:*

  For each company: Revenue ÷ Employees = Revenue per Employee

  - Alpha: 150 ÷ 2,500 = 0.060 (\$M per employee)
  - Beta: 220 ÷ 3,100 = 0.071 (\$M per employee)
  - Gamma: 180 ÷ 2,800 = 0.064 (\$M per employee)

  Beta has the highest revenue per employee.
]

== The GMAT Calculator

The Data Insights section provides access to an on-screen calculator. This tool can save time on complex calculations, but you should use it judiciously—simple mental math is often faster than navigating the calculator interface.

The calculator includes basic arithmetic operations, memory functions for storing intermediate results, and special functions like square root and percentage. Familiarizing yourself with these features before test day helps you use the calculator efficiently when you need it.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Calculator outline
    rect((0, 0), (5.5, 8), fill: white, stroke: 1.5pt)

    // Title bar
    rect((0.2, 7.2), (4.3, 7.7), fill: white, stroke: 1pt)
    content((2.25, 7.45), text(size: 9pt, weight: "bold")[CALCULATOR])
    rect((4.8, 7.2), (5.3, 7.7), fill: white, stroke: 1pt)
    content((5.05, 7.45), text(size: 10pt, weight: "bold")[X])

    // Display
    rect((0.2, 6.2), (5.3, 7), fill: white, stroke: 1pt)
    content((4.5, 6.6), text(size: 14pt)[123.45])

    // Button dimensions
    let btn-w = 0.9
    let btn-h = 0.7
    let gap = 0.15
    let start-x = 0.3
    let start-y = 5.3

    // Function to draw a button
    let draw-btn(x, y, label, size: 10pt) = {
      rect((x, y), (x + btn-w, y + btn-h), fill: white, stroke: 1pt)
      content((x + btn-w/2, y + btn-h/2), text(size: size, weight: "bold")[#label])
    }

    // Row 1: MC, MR, MS, M+, M-
    let row1 = ("MC", "MR", "MS", "M+", "M-")
    for (i, label) in row1.enumerate() {
      let x = start-x + i * (btn-w + gap)
      draw-btn(x, start-y, label, size: 8pt)
    }

    // Row 2: ←, CE, C, ±, √
    let row2-y = start-y - (btn-h + gap)
    let row2 = (sym.arrow.l, "CE", "C", sym.plus.minus, $sqrt("")$)
    for (i, label) in row2.enumerate() {
      let x = start-x + i * (btn-w + gap)
      draw-btn(x, row2-y, label, size: 9pt)
    }

    // Row 3: 7, 8, 9, /, %
    let row3-y = row2-y - (btn-h + gap)
    let row3 = ("7", "8", "9", "/", "%")
    for (i, label) in row3.enumerate() {
      let x = start-x + i * (btn-w + gap)
      draw-btn(x, row3-y, label)
    }

    // Row 4: 4, 5, 6, *, 1/x
    let row4-y = row3-y - (btn-h + gap)
    let row4 = ("4", "5", "6", sym.ast, "1/x")
    for (i, label) in row4.enumerate() {
      let x = start-x + i * (btn-w + gap)
      draw-btn(x, row4-y, label, size: if label == "1/x" { 8pt } else { 10pt })
    }

    // Row 5: 1, 2, 3, -, = (tall button)
    let row5-y = row4-y - (btn-h + gap)
    let row5 = ("1", "2", "3", "-")
    for (i, label) in row5.enumerate() {
      let x = start-x + i * (btn-w + gap)
      draw-btn(x, row5-y, label)
    }

    // Row 6: 0 (wide), ., +
    let row6-y = row5-y - (btn-h + gap)
    // Wide 0 button
    rect((start-x, row6-y), (start-x + 2*btn-w + gap, row6-y + btn-h), fill: white, stroke: 1pt)
    content((start-x + btn-w + gap/2, row6-y + btn-h/2), text(size: 10pt, weight: "bold")[0])
    // . button
    draw-btn(start-x + 2*(btn-w + gap), row6-y, ".")
    // + button
    draw-btn(start-x + 3*(btn-w + gap), row6-y, "+")

    // = button (tall, spanning rows 5 and 6)
    let eq-x = start-x + 4*(btn-w + gap)
    rect((eq-x, row6-y), (eq-x + btn-w, row5-y + btn-h), fill: white, stroke: 1pt)
    content((eq-x + btn-w/2, row6-y + btn-h + gap/2), text(size: 12pt, weight: "bold")[=])
  })
]

#tip-box[
  *Calculator Tips:*

  - Use M+ to accumulate running totals without re-entering intermediate results
  - The 1/x button quickly calculates reciprocals for ratio comparisons
  - The % button can calculate percentages directly
  - For simple arithmetic, mental math is often faster than using the calculator
]

#pagebreak()

= Types of True/False Statements

Table Analysis statements fall into several categories, each requiring different approaches. Understanding these categories helps you recognize what each statement requires and choose the most efficient strategy.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    // Type boxes arranged in a single horizontal line
    let types = (
      (0, 1.8, "1. Direct\nLookup", rgb("#3498db")),
      (2.6, 1.8, "2. Calculation\nRequired", rgb("#9b59b6")),
      (5.2, 1.8, "3. Conditional\nCounting", rgb("#e67e22")),
      (7.8, 1.8, "4. Derived\nValues", rgb("#27ae60")),
      (10.4, 1.8, "5. Relation-\nships", rgb("#e74c3c")),
    )

    for (x, y, label, color) in types {
      rect((x - 1.1, y - 0.55), (x + 1.2, y + 0.55), fill: color.lighten(70%), stroke: color + 1.5pt, radius: 5pt)
      content((x + 0.05, y), text(size: 7pt, weight: "bold")[#label])
    }

    // Difficulty indicator arrow below
    line((-0.8, 0.5), (11.2, 0.5), stroke: gray + 1pt, mark: (end: ">"))
    content((-0.8, 0.1), text(size: 8pt, fill: gray.darken(20%))[Easier])
    content((11.2, 0.1), text(size: 8pt, fill: gray.darken(20%))[Harder])
  })
]

== Type 1: Direct Lookup

Direct lookup statements can be verified simply by finding the right information in the table. These are typically the easiest statements to evaluate.

*Example:* "Company X has the highest revenue."

*Strategy:* Sort by revenue in descending order. If Company X appears at the top, the statement is true; otherwise, it is false. No calculation is needed—just locate the information.

== Type 2: Calculation Required

These statements require you to perform a calculation before you can evaluate them. The calculation might involve finding a median, computing a sum, or determining a percentage.

*Example:* "The median number of employees is greater than 2,500."

*Strategy:* Sort by employees, identify the median row(s), determine the median value, and compare it to 2,500. The statement is true if the median exceeds 2,500.

== Type 3: Conditional Counting

Conditional counting statements ask about items that meet multiple criteria or about proportions of items meeting certain conditions.

*Example:* "More than half of the companies founded before 1990 have revenue above \$100M."

*Strategy:* First identify all companies founded before 1990 (this is your denominator). Then count how many of those companies have revenue above \$100M (this is your numerator). Compare the numerator to half the denominator.

== Type 4: Derived Values

Derived value statements require calculating values that are not directly in the table, such as ratios, rates, or differences between columns.

*Example:* "Company Alpha has the highest revenue per employee."

*Strategy:* Calculate revenue per employee for each company. Compare the calculated values to determine which company has the highest. This requires multiple calculations since the derived values cannot be sorted.

== Type 5: Relationship Statements

Relationship statements make claims about patterns or correlations in the data. These are often the most challenging because they require analyzing the overall structure of the data.

*Example:* "As revenue increases, the number of employees tends to increase."

*Strategy:* Sort by one variable and observe whether the other variable generally follows the same pattern. Look for the overall trend rather than expecting a perfect correlation.

#pagebreak()

= Time Management

Table Analysis questions typically take slightly longer than other Data Insights questions because you must evaluate three separate statements. Effective time management is essential for completing these questions without rushing.

== Pacing Guidelines

Plan to spend approximately 2 to 2.5 minutes on each Table Analysis question. This allows adequate time to understand the table, evaluate all three statements, and verify your answers without excessive rushing.

If you find yourself spending significantly more than 2.5 minutes on a single question, consider making your best judgments on any remaining statements and moving on. The partial credit system means that getting two out of three correct is valuable, and spending too long on difficult statements can hurt your performance on subsequent questions.

#info-box[
  *Target Timing:*

  2 to 2.5 minutes per Table Analysis question.

  This accounts for the three statements and any necessary sorting or calculations.
]

== Working Efficiently

Several strategies can help you work more efficiently on Table Analysis questions.

Before evaluating any individual statement, read all three statements to understand what information you will need. This allows you to plan your sorting strategy—you may find that a single sort helps with multiple statements, saving time compared to sorting separately for each one.

Start with the statements that appear easiest to evaluate. Building confidence on straightforward statements helps maintain momentum and ensures you capture those points before tackling more challenging statements.

Avoid over-verifying your answers. Once you are confident in a response, mark it and move on. Re-checking each answer multiple times consumes valuable time that could be better spent on other questions.

#strategy-box[
  *Efficiency Tips:*

  1. Read all three statements first to identify what data you need
  2. Plan your sorting strategy to minimize redundant sorts
  3. Evaluate easiest statements first to build confidence
  4. Once confident, move on without excessive re-checking
]

== Common Mistakes to Avoid

Awareness of common errors helps you avoid them. Many test-takers lose points on Table Analysis not because they lack analytical skills but because they make preventable mistakes.

Sorting errors occur when test-takers forget to sort or sort by the wrong column. Before evaluating a statement, confirm that you have sorted by the appropriate column if sorting is needed.

Counting errors are common, especially with conditional statements. Take care to count accurately, and consider using your finger or scratch paper to track which rows meet the conditions.

Threshold confusion involves misinterpreting words like "at least," "more than," and "at most." These phrases have precise mathematical meanings: "at least 5" includes 5, while "more than 5" does not.

#warning-box[
  *Common Mistakes:*

  - Failing to sort when sorting would help
  - Sorting by the wrong column
  - Miscounting rows that meet conditions
  - Confusing "at least" (≥) with "more than" (>)
  - Missing rows that meet multiple conditions
]

#pagebreak()

= Advanced Table Analysis Skills

Some Table Analysis questions require more sophisticated analytical approaches. Developing these skills prepares you for the most challenging questions.

== Multi-Column Analysis

Some statements require examining relationships across multiple columns simultaneously. For example, a statement might claim that all companies meeting one condition also meet another condition.

*Example:* "All companies with revenue above \$200M were founded after 1990."

To evaluate this statement, you must identify all companies with revenue above \$200M, then check whether every one of them was founded after 1990. A single counterexample makes the statement false.

For "all" statements, you are looking for any exception. For "some" or "at least one" statements, you need to find just one example that satisfies the condition.

== Handling Ties and Edge Cases

Tables sometimes contain tied values, and statements may hinge on how ties are interpreted. Understanding how ties affect different types of questions helps you evaluate statements accurately.

For "highest" or "lowest" questions, ties mean that multiple items share the extreme value. If a statement asks whether a specific item has the highest value, it is true if that item is tied for the highest (unless the statement specifies "unique highest").

For median calculations with an even number of rows, remember that the median is the average of the two middle values, not simply one of them.

#info-box[
  *Handling Ties:*

  - "Highest value" questions: Any tied value at the top qualifies
  - "Unique highest" questions: Ties mean no single item qualifies
  - Rankings: Tied values share the same rank
  - Medians with even n: Average the two middle values
]

== Precision in Language

Table Analysis statements often use precise language that must be interpreted carefully. Pay close attention to quantifiers and comparison operators.

*"At least"* means greater than or equal to (≥). A statement "at least 5 companies" is true if there are 5, 6, 7, or more companies meeting the condition.

*"More than"* means strictly greater (>). A statement "more than 5 companies" requires 6 or more companies; exactly 5 would make it false.

*"At most"* means less than or equal to (≤). This sets an upper limit including the boundary value.

*"All"* requires every single item to meet the condition with no exceptions. *"Some"* requires at least one item to meet the condition. *"None"* requires zero items to meet the condition.

#warning-box[
  *Watch for Precise Language:*

  - "At least" vs. "more than" vs. "at most"
  - "All" vs. "some" vs. "none"
  - "Greater than" vs. "greater than or equal to"
  - Inclusive vs. exclusive boundaries
]

/*
===============================================================================
TEACHING NOTES AND LESSON BREAKDOWN
The following section contains detailed guidance for tutors on how to structure
and deliver the Table Analysis lessons. This content is internal and should not
be displayed to students.
===============================================================================

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Primary Objectives:*
1. TA format and True/False structure
2. Sorting mechanics and when to sort
3. Direct lookup statements
4. Finding median using sorting

*Suggested Pacing:*
Spend time demonstrating the sorting interface and having students practice sorting on sample tables before introducing actual questions.

*Practice Questions:* 5-6 TA questions with straightforward tables

*Common Session A Issues:*
- Students not using sorting when it would help
- Confusion about how to find medians
- Not reading all three statements before beginning

== Lesson B Focus (Deep Dive)

*Primary Objectives:*
1. Calculation-required statements
2. Derived value problems
3. Conditional counting
4. Multi-column analysis

*Review errors from Training #1, focusing on:*
- Median calculation errors
- Counting mistakes
- Missing sorting opportunities

*Practice Questions:* 6-8 questions with more complex tables and calculations

*Key Teaching Point:*
Emphasize that derived values cannot be sorted—students must calculate them. Practice identifying when a statement requires derived value calculations.

== Lesson C Focus (Assessment Prep)

*Primary Objectives:*
1. Brief review of any patterns from Training #2 errors
2. Efficient sorting strategies
3. Edge case awareness
4. Time management practice

*Session Structure:*
- 15 minutes: Quick review of trouble areas
- 25 minutes: Timed practice set with full questions
- 10 minutes: Discussion of timing and strategy

*Assessment:* 20 questions, 50 minutes

== Common Student Difficulties

The following issues appear most frequently:

1. *Not using sorting when it would help*
   - Solution: Before each statement, ask "would sorting make this easier?"

2. *Miscounting rows meeting conditions*
   - Solution: Use scratch paper to track counts systematically

3. *Median calculation errors with even number of rows*
   - Solution: Practice identifying middle rows and averaging when needed

4. *Confusing derived values with sortable columns*
   - Solution: Highlight that only existing columns can be sorted

5. *"At least" vs. "more than" confusion*
   - Solution: Emphasize the mathematical meaning of each phrase

*General Tutoring Advice:*
Have students practice sorting and finding medians on sample tables before tackling full questions. Build familiarity with the sorting mechanic so it becomes automatic.

===============================================================================
END OF TUTOR NOTES SECTION
===============================================================================
*/
