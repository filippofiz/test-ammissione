#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"
#import "@preview/cetz-plot:0.1.1"

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Graphics Interpretation",
  level: "Lesson Material",
  intro: "Comprehensive guide covering chart reading, graph types, fill-in-the-blank format, and visual data analysis strategies.",
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

*Topic:* Graphics Interpretation (GI)\
*Section:* Data Insights\
*Lesson Sequence:* DI-02 (Second of 5 DI topics)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Read and interpret various chart types (line, bar, pie, scatter)
2. Complete fill-in-the-blank statements using dropdown options
3. Calculate values from graphical data
4. Identify trends, correlations, and outliers
5. Avoid common visual traps (scale manipulation, truncated axes)
6. Manage time effectively on GI questions

== GMAT Relevance

Graphics Interpretation tests data literacy—the ability to extract meaningful information from visual representations. This skill is essential for business contexts.

===============================================================================
END OF TUTOR-ONLY SECTION
===============================================================================
*/

= Introduction to Graphics Interpretation

Graphics Interpretation (GI) questions test your ability to read, understand, and draw conclusions from visual data displays. In today's data-driven business environment, professionals routinely encounter charts, graphs, and infographics that convey important information. The GMAT includes these questions specifically because visual data literacy is essential for success in business school and beyond.

Unlike Data Sufficiency questions, which require logical analysis of mathematical relationships, Graphics Interpretation questions present you with actual data in visual form and ask you to extract specific information. The challenge lies not in complex calculations but in accurately reading the visual display and avoiding the subtle traps that can lead to misinterpretation.

Graphics Interpretation appears in the Data Insights section of the GMAT Focus Edition. These questions typically require you to complete fill-in-the-blank statements by selecting from dropdown menus. Each statement tests your ability to read a specific aspect of the graphic—a particular value, a comparison between elements, or a conclusion that can be drawn from the displayed data.

The good news is that GI questions are often among the more approachable questions in Data Insights. The information you need is right in front of you; your task is simply to read it correctly and avoid common pitfalls. With practice and awareness of typical traps, most test-takers can become quite proficient at these questions.

#pagebreak()

= The Graphics Interpretation Format

== Question Structure

Every Graphics Interpretation question follows a consistent format that becomes familiar with practice. Understanding this format allows you to approach each question efficiently and know exactly what to expect.

The question begins with a graphic—some form of visual data display. This might be a line graph showing trends over time, a bar chart comparing categories, a pie chart showing proportions, a scatter plot revealing relationships, or a more complex visualization combining multiple elements. The graphic typically includes a title, axis labels, a legend explaining different colors or patterns, and the data itself.

Below the graphic, you encounter one or more fill-in-the-blank statements. Each statement contains a gap where you must select an answer from a dropdown menu. The dropdown presents several options, and you must choose the one that correctly completes the statement based on the information in the graphic.

#info-box[
  *Components of Every GI Question:*

  1. A graphic displaying data (chart, graph, or other visualization)
  2. One or more incomplete statements about the data
  3. Dropdown menus with answer options for each blank

  Your task is to select the option that correctly completes each statement.
]

#example-box[
  *Sample GI Question Format:*

  [Bar chart showing quarterly revenue for four companies]

  Statement 1: "In Q3, Company B's revenue was approximately \_\_\_\_ million dollars."

  Dropdown options: [25 | 30 | 35 | 40]

  Statement 2: "The company with the highest Q4 revenue is \_\_\_\_."

  Dropdown options: [Company A | Company B | Company C | Company D]
]

== Scoring and Partial Credit

An important aspect of Graphics Interpretation scoring is that each dropdown selection is evaluated independently. If a GI question contains two statements, answering one correctly and one incorrectly results in partial credit—you receive credit for the correct selection even though you missed the other one.

This scoring system has practical implications for your test-taking strategy. If you are confident about one statement but uncertain about another, you should still make your best selection for each. Leaving a dropdown blank guarantees zero credit for that selection, while an educated guess at least gives you a chance. Additionally, you cannot proceed to the next question until you have made a selection for every dropdown, so there is no strategic benefit to leaving blanks.

#info-box[
  *Scoring Facts:*

  - Each dropdown selection is scored independently
  - Partial credit is possible when you answer some selections correctly and others incorrectly
  - You must select an answer for each dropdown to proceed to the next question
]

#pagebreak()

= Understanding Chart Types

The GMAT uses several standard chart types in Graphics Interpretation questions. Each type is designed to convey particular kinds of information effectively, and understanding the purpose and structure of each type helps you read them quickly and accurately.

== Line Graphs

Line graphs are the premier tool for displaying trends over time. By connecting data points with lines, these graphs make it easy to see how values change across a time period and to compare the trajectories of multiple data series.

The horizontal axis (x-axis) of a line graph typically represents time—days, months, quarters, years, or some other time unit. The vertical axis (y-axis) represents the measured variable, such as revenue, temperature, stock price, or population. Each data point sits at the intersection of its time value and measured value, and the line connecting points reveals the overall pattern.

When multiple lines appear on the same graph, you can compare how different entities (companies, products, regions) behave over the same time period. The lines might move together, suggesting correlation, or diverge, indicating different underlying patterns. Points where lines cross indicate moments when two entities had equal values.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (10, 5),
      x-label: "Quarter",
      y-label: "Revenue (millions)",
      x-tick-step: 1,
      y-tick-step: 10,
      y-min: 0,
      y-max: 50,
      x-min: 0,
      x-max: 5,
      legend: "north-east",
      {
        // Company A - steady growth
        plot.add(
          ((1, 20), (2, 25), (3, 32), (4, 40)),
          mark: "o",
          style: (stroke: rgb("#3498db") + 2pt),
          label: "Company A"
        )
        // Company B - volatile
        plot.add(
          ((1, 30), (2, 22), (3, 35), (4, 28)),
          mark: "square",
          style: (stroke: rgb("#e74c3c") + 2pt),
          label: "Company B"
        )
      }
    )
  })
]

When analyzing a line graph, pay attention to the overall trend (whether values are generally increasing, decreasing, or remaining stable), the rate of change (steep slopes indicate rapid change while gentle slopes indicate gradual change), inflection points (where the direction of change reverses), and intersections between lines (where two data series have equal values). The graph above, for instance, shows Company A with steady growth throughout the year, while Company B exhibits volatility with peaks and valleys.

== Bar Charts

Bar charts excel at comparing discrete categories. Whether showing sales by region, survey responses by answer choice, or performance by department, bar charts make it easy to see relative sizes at a glance.

In a standard bar chart, each category receives its own bar, and the height (or length, for horizontal bar charts) represents the value for that category. The bars are typically separated by gaps, emphasizing that the categories are distinct rather than continuous. Labels identify each category, and the axis provides a scale for reading values.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Bar chart - Quarterly Sales by Region
    let bar_width = 0.6
    let gap = 0.3
    let colors = (rgb("#3498db"), rgb("#e74c3c"), rgb("#2ecc71"), rgb("#f39c12"))
    let data = (("Q1", 35), ("Q2", 42), ("Q3", 38), ("Q4", 50))
    let max_val = 60

    // Axes
    line((0, 0), (8, 0), stroke: black + 1pt)
    line((0, 0), (0, 5), stroke: black + 1pt)

    // Y-axis labels
    for i in range(0, 7) {
      let y = i * 5 / 6
      let val = i * 10
      content((-0.5, y), text(size: 8pt)[#val])
      line((-0.1, y), (0, y), stroke: gray + 0.5pt)
    }
    content((-1.2, 2.5), text(size: 9pt)[Sales])

    // Bars
    for (i, (label, value)) in data.enumerate() {
      let x = 1 + i * 1.7
      let height = value / 60 * 5
      rect(
        (x, 0), (x + bar_width, height),
        fill: colors.at(i),
        stroke: colors.at(i).darken(20%) + 1pt
      )
      content((x + bar_width/2, -0.4), text(size: 9pt)[#label])
      content((x + bar_width/2, height + 0.3), text(size: 8pt)[#value])
    }
  })
]

Bar charts come in several variations. *Grouped bar charts* (also called clustered bar charts) place multiple bars side by side for each category, allowing comparison across categories and across groups simultaneously. *Stacked bar charts* divide each bar into segments representing subcategories, showing both the total and the composition. Reading stacked charts requires care, as we will discuss later.

When analyzing bar charts, focus on relative heights to make comparisons, look for patterns across categories (such as a consistent increase or a particular category that stands out), and in stacked versions, pay attention to both individual segment sizes and the overall totals.

== Pie Charts

Pie charts represent parts of a whole. The entire circle represents 100% of something (total revenue, complete survey responses, full time allocation), and each slice represents a portion of that whole. The visual size of each slice corresponds to its percentage of the total.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    let center = (4, 2.5)
    let radius = 2
    let colors = (rgb("#3498db"), rgb("#e74c3c"), rgb("#2ecc71"), rgb("#9b59b6"))
    let data = (("Product A", 35), ("Product B", 25), ("Product C", 25), ("Product D", 15))

    // Draw pie slices
    let start_angle = 0deg
    for (i, (label, pct)) in data.enumerate() {
      let angle = pct / 100 * 360deg
      let end_angle = start_angle + angle
      let mid_angle = start_angle + angle / 2

      // Draw arc sector using lines from center
      let steps = 20
      let points = (center,)
      for j in range(steps + 1) {
        let a = start_angle + angle * j / steps
        points.push((center.at(0) + radius * calc.cos(a), center.at(1) + radius * calc.sin(a)))
      }
      points.push(center)

      // Fill the sector
      line(..points, fill: colors.at(i), stroke: white + 1pt, close: true)

      // Label position
      let label_dist = radius + 0.6
      let lx = center.at(0) + label_dist * calc.cos(mid_angle)
      let ly = center.at(1) + label_dist * calc.sin(mid_angle)
      content((lx, ly), text(size: 8pt)[#pct%])

      start_angle = end_angle
    }

    // Legend
    for (i, (label, pct)) in data.enumerate() {
      let ly = 4.5 - i * 0.6
      rect((8, ly - 0.15), (8.4, ly + 0.15), fill: colors.at(i), stroke: none)
      content((9.2, ly), text(size: 8pt)[#label])
    }
  })
]

Pie charts work best when displaying a small number of categories (ideally five or fewer) where the relative sizes are distinctly different. They become difficult to read when slices are similar in size or when too many small slices crowd the chart. The human eye is not particularly good at comparing angles, so precise readings from pie charts are challenging—they are better suited for conveying general proportions than exact values.

When working with pie charts, identify the largest and smallest segments quickly, note any segments that appear equal or nearly equal, and remember that all slices must sum to 100%. Questions might ask you to combine percentages (what is Product A plus Product C?) or to identify the relationship between segments (which two products together account for more than half?).

== Scatter Plots

Scatter plots reveal relationships between two variables. Each point on the plot represents a single data item, positioned according to its values on both the x-axis variable and the y-axis variable. The overall pattern of points reveals whether and how the two variables are related.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (8, 5),
      x-label: "Study Hours",
      y-label: "Test Score",
      x-tick-step: 2,
      y-tick-step: 10,
      y-min: 50,
      y-max: 100,
      x-min: 0,
      x-max: 10,
      {
        // Scatter points showing positive correlation
        plot.add(
          ((1, 55), (2, 62), (2.5, 58), (3, 68), (4, 72), (4.5, 70), (5, 75), (6, 80), (6.5, 78), (7, 85), (8, 88), (9, 92)),
          mark: "o",
          mark-size: 0.15,
          style: (stroke: none),
          mark-style: (fill: rgb("#3498db"), stroke: rgb("#2980b9") + 1pt)
        )
        // Trend line
        plot.add(
          ((0, 52), (10, 95)),
          style: (stroke: (paint: rgb("#e74c3c"), thickness: 1.5pt, dash: "dashed"))
        )
      }
    )
  })
]

The scatter plot above shows a *positive correlation* between study hours and test scores—as one variable increases, the other tends to increase as well. Points that follow an upward-sloping pattern indicate positive correlation; a downward-sloping pattern indicates *negative correlation* (as one increases, the other decreases); and points scattered with no discernible pattern indicate *no correlation*.

The dashed line is a *trend line* or *line of best fit*, which summarizes the overall relationship. Points close to the trend line indicate a strong correlation; points widely scattered around it indicate a weak correlation. *Outliers*—points that fall far from the general pattern—are also important to notice, as they represent unusual cases that do not follow the typical relationship.

#warning-box[
  *Correlation Does Not Imply Causation*

  A scatter plot showing correlation between two variables does NOT prove that one causes the other. The relationship might be coincidental, or both variables might be influenced by a third factor.

  "X and Y are correlated" $eq.not$ "X causes Y"
]

#pagebreak()

= Advanced Graph Types

Beyond the fundamental chart types, the GMAT occasionally presents more complex visualizations. Understanding these advanced formats prevents confusion and saves valuable time during the exam.

== Dual-Axis Graphs

Dual-axis graphs display two different variables on the same chart, each with its own y-axis scale. Typically, one variable uses the left y-axis while the other uses the right y-axis. This format allows comparison of trends between variables that are measured in different units or have vastly different magnitudes.

For example, a dual-axis graph might show monthly revenue (measured in millions of dollars on the left axis) alongside employee headcount (measured in number of employees on the right axis). Both variables can be plotted over the same time period, allowing viewers to see how they move together—or differently—over time.

#warning-box[
  *Critical Warning About Dual-Axis Graphs:*

  The two y-axes have DIFFERENT scales. You must use the correct axis when reading each variable's values.

  - Check which variable corresponds to which axis (usually indicated by color matching or explicit labels)
  - Do not directly compare the height of elements using different axes
  - A line appearing "higher" than another does not necessarily mean a larger value—it depends on the scales
]

The visual impression of dual-axis graphs can be manipulated by adjusting the scales. Two variables might appear to move together or diverge based purely on how the axes are scaled, not because of any real relationship in the data. Always read the actual values rather than relying on visual impressions.

== Stacked Area Charts

Stacked area charts show how multiple components contribute to a total over time. Each colored area represents one component, and the areas are stacked on top of each other so that the top line shows the cumulative total.

These charts are useful for seeing both how the total changes over time and how the composition of that total changes. However, they can be tricky to read accurately. The bottom area is easy to read—its height at any point shows its value. But for upper areas, you must look at the *height of the band itself*, not where its top edge falls on the y-axis.

For instance, if the bottom area reaches from 0 to 40, and the next area extends from 40 to 70, the second component's value is 30 (the height of its band), not 70 (where its top edge falls). This distinction is a common source of errors.

== 100% Stacked Charts

In a 100% stacked chart, each bar or column is scaled to represent 100% of some total. The segments within each bar show proportions rather than absolute values. This format is excellent for comparing how composition differs across categories, but it completely hides information about absolute magnitudes.

For example, a 100% stacked bar chart comparing regional sales composition would show that Region A gets 40% from retail and 60% from wholesale, while Region B gets 55% from retail and 45% from wholesale. What it would *not* show is that Region A might have total sales of \$10 million while Region B has only \$2 million. The proportions are visible; the absolute values are not.

#info-box[
  *Key Distinction:*

  - *Regular stacked charts:* Show both absolute values and composition
  - *100% stacked charts:* Show only composition (proportions), not absolute values

  When working with 100% stacked charts, focus on comparing proportions across categories, not on trying to extract absolute values.
]

#pagebreak()

= Reading Graphs Accurately

The single most important skill for Graphics Interpretation is reading graphs accurately. Many errors come not from misunderstanding what the question asks but from misreading the visual data. Developing systematic habits for reading graphs prevents these errors.

== Scale Awareness

Before extracting any specific values from a graph, take a moment to understand the scales. What are the minimum and maximum values on each axis? What do the gridlines represent? Are the intervals consistent? Starting with scale awareness prevents many common errors.

One particularly important issue is the *truncated axis*. A graph whose y-axis starts at a value other than zero can make small differences appear dramatic. If a bar chart shows values ranging from 95 to 105 but uses an axis that starts at 90, a 10% difference (from 95 to 105) visually appears to nearly double because the bars' heights differ by a factor of about 3.

#align(center)[
  #grid(
    columns: 2,
    gutter: 2em,
    [
      #align(center)[*Truncated Axis (Misleading)*]
      #cetz.canvas({
        import cetz.draw: *

        // Truncated axis (95-105)
        line((0, 0), (4, 0), stroke: black + 1pt)
        line((0, 0), (0, 4), stroke: black + 1pt)

        // Y-axis labels (95-105)
        for i in range(0, 5) {
          let y = i * 1
          let val = 95 + i * 2.5
          content((-0.6, y), text(size: 7pt)[#calc.round(val)])
          line((-0.1, y), (0, y), stroke: gray + 0.5pt)
        }

        // Break symbol
        line((-.15, 0.15), (0.15, 0.35), stroke: black + 1pt)
        line((-.15, 0.35), (0.15, 0.55), stroke: black + 1pt)

        // Bars - appear very different
        rect((0.5, 0), (1.3, 1.6), fill: rgb("#3498db"), stroke: none)  // 99
        rect((2.2, 0), (3, 4), fill: rgb("#e74c3c"), stroke: none)      // 105
        content((0.9, -0.4), text(size: 8pt)[A])
        content((2.6, -0.4), text(size: 8pt)[B])
      })
    ],
    [
      #align(center)[*Full Axis (Accurate)*]
      #cetz.canvas({
        import cetz.draw: *

        // Full axis (0-105)
        line((0, 0), (4, 0), stroke: black + 1pt)
        line((0, 0), (0, 4), stroke: black + 1pt)

        // Y-axis labels (0-105)
        for i in range(0, 5) {
          let y = i * 1
          let val = i * 30
          content((-0.5, y), text(size: 7pt)[#val])
          line((-0.1, y), (0, y), stroke: gray + 0.5pt)
        }

        // Bars - appear similar (as they should)
        let scale = 4 / 120
        rect((0.5, 0), (1.3, 99 * scale), fill: rgb("#3498db"), stroke: none)   // 99
        rect((2.2, 0), (3, 105 * scale), fill: rgb("#e74c3c"), stroke: none)    // 105
        content((0.9, -0.4), text(size: 8pt)[A])
        content((2.6, -0.4), text(size: 8pt)[B])
      })
    ]
  )
  #text(size: 9pt, fill: gray)[_Same data (99 vs 105) shown with different axis scales_]
]

The same data appears dramatically different depending on how the axis is scaled. Always check where the axis starts before drawing conclusions about magnitudes or differences. A truncated axis is sometimes necessary for showing small variations in large values, but you must interpret such graphs carefully.

#warning-box[
  *Scale Issues to Watch For:*

  - *Truncated y-axis:* Does not start at zero—makes small differences look large
  - *Inconsistent intervals:* Spacing between gridlines is not uniform
  - *Different scales on dual axes:* Can create misleading visual comparisons
  - *Logarithmic scales:* Each gridline represents a multiplication, not an addition
]

== Reading Values Precisely

When you need to read a specific value from a graph, follow a systematic process. First, locate the relevant data point—the bar, the point on the line, or the intersection you need. Second, trace horizontally to the y-axis (for height-based readings) or vertically to the x-axis (for position-based readings). Third, estimate the value relative to the gridlines. Fourth, verify that you are reading the correct units.

The unit check is crucial and easily overlooked. Is the axis labeled in millions, thousands, or individual units? Is it showing percentages or absolute numbers? Misreading units is one of the most common GI errors, and it is entirely preventable with a moment of attention.

#strategy-box[
  *Process for Reading Values:*

  1. Locate the specific data point you need
  2. Trace horizontally to the y-axis (or vertically to the x-axis)
  3. Estimate the value, interpolating between gridlines if necessary
  4. Verify the units (millions? thousands? percent?)
]

== Common Calculations

Graphics Interpretation questions sometimes require simple calculations based on the data you read. The most common types include:

*Percent change* measures how much a value has changed relative to its starting point. The formula is $("New value" - "Old value") / "Old value" times 100%$. For example, if revenue grew from 40 to 50, the percent change is $(50 - 40) / 40 times 100% = 25%$.

*Differences* require reading two values and subtracting. This might mean finding how much higher one bar is than another or how much a value changed between two time points.

*Ratios* require reading two values and dividing. A question might ask what fraction one category represents of another, or how many times larger one value is than another.

*Averages* require summing multiple values and dividing by the count. If asked for the average quarterly revenue across four quarters, read all four values, add them, and divide by four.

#tip-box[
  *Common Calculation Formulas:*

  - *Percent change:* $("New" - "Old") / "Old" times 100%$
  - *Difference:* $"Value"_1 - "Value"_2$
  - *Ratio:* $"Value"_1 / "Value"_2$
  - *Average:* $("Sum of values") / ("Number of values")$
]

#pagebreak()

= Strategies for GI Questions

== Time Management

Graphics Interpretation questions should typically be completed in about 1.5 to 2 minutes each. Because the data is presented directly and you do not need to perform complex reasoning or extensive calculations, these questions can often be answered relatively quickly.

If you find yourself spending significantly more time on GI questions, consider whether you are overcomplicating the task. The information you need is visible in the graphic; you simply need to find it and read it correctly. Spending extra time usually indicates either difficulty locating the relevant data or unnecessary rechecking of work.

#info-box[
  *Target Timing:*

  Aim for 1.5 to 2 minutes per GI question.

  GI should be among your faster question types—the data is given, and you need only read and interpret it correctly.
]

== A Systematic Approach

Approaching each GI question systematically reduces errors and improves efficiency. The following process works well for most questions.

First, spend about 10-15 seconds scanning the graphic before reading the statements. Identify what type of chart it is, what the axes or categories represent, what units are used, and any special features such as multiple data series or a legend. This initial orientation makes subsequent reading much faster.

Second, read the first fill-in-the-blank statement carefully. Identify exactly what information you need—a specific value, a comparison, a maximum or minimum, a calculation result. Understanding precisely what is asked prevents wasted effort looking at irrelevant parts of the graphic.

Third, locate the relevant data in the graphic. Go directly to the part of the chart that contains the information you need. Read the value carefully, paying attention to the scale and units.

Fourth, select your answer from the dropdown options. If your reading matches one option exactly, select it. If you had to estimate or calculate, choose the option closest to your result. If the options are widely spaced, estimation is sufficient; if they are close together, more precise reading may be necessary.

Repeat the process for any additional fill-in-the-blank statements, which may require you to look at different parts of the graphic.

#strategy-box[
  *Systematic Approach to GI Questions:*

  1. *Scan the graphic* (10-15 seconds): What type of chart? What are the axes? What units? Any special features?

  2. *Read the statement carefully*: What exactly is being asked? What part of the graphic is relevant?

  3. *Find the relevant data*: Locate the specific data point(s) and read values accurately.

  4. *Select the answer*: Match your reading to the dropdown options, choosing the closest match if estimating.
]

== When to Estimate vs. Calculate

Not every GI question requires precise calculation. Understanding when estimation is sufficient saves time without sacrificing accuracy.

Estimation is appropriate when the dropdown options are spread far apart—if the options are 10, 25, 50, and 100, you do not need to calculate exactly whether the answer is 23 or 27, since 25 is clearly closest. Estimation also works when the question explicitly asks for an "approximate" value, or when the visual reading is inherently imprecise (such as reading a value between gridlines).

More precise calculation is warranted when the dropdown options are close together (choosing between 47%, 49%, and 51% requires precision), when the question involves combining multiple values, or when the calculation is simple enough that doing it carefully takes minimal extra time.

#tip-box[
  *When to Estimate:*
  - Dropdown options are widely spaced
  - Question asks for "approximately" or "about"
  - Exact reading would take significant effort

  *When to Calculate:*
  - Dropdown options are close together
  - Question requires combining multiple values
  - Simple calculation is quick and adds confidence
]

#pagebreak()

= Common GI Traps

Test-makers design Graphics Interpretation questions to identify test-takers who read carelessly or make common errors. Understanding these traps helps you avoid them.

== Trap 1: Unit Confusion

The most frequent error in GI questions involves units. Test-takers read a value correctly but interpret it in the wrong units—reading 45 from an axis labeled "Revenue (millions)" and reporting 45 dollars instead of 45 million dollars, or vice versa.

Before answering any GI question, verify the units on the relevant axis. Is the measurement in millions, thousands, or individual units? Is it showing percentages or absolute numbers? This verification takes only a moment and prevents costly errors.

#warning-box[
  *Always Check Units:*

  - Is the y-axis in millions, thousands, or individual units?
  - Is it showing percentages or absolute numbers?
  - Are you comparing values in compatible units?
]

== Trap 2: Axis Misreading

In graphs with multiple elements—especially dual-axis graphs—test-takers sometimes use the wrong axis to read a value. Each data series corresponds to a specific axis, and using the wrong one produces an incorrect reading.

Additionally, ensure you are reading the correct axis (x vs. y) for the information you need. Reading the x-value when you need the y-value (or vice versa) produces nonsensical answers.

#warning-box[
  *Axis Reading Checklist:*

  - In dual-axis graphs, match each variable to its correct axis (usually indicated by color or explicit labels)
  - Verify whether you need to read from the x-axis or y-axis for your specific question
  - Check if the axis is linear or logarithmic
]

== Trap 3: Stacked Chart Errors

Stacked charts create a particular type of misreading error. For the bottom segment, reading is straightforward—the height equals the value. But for upper segments, the value is the *height of the segment itself*, not where its top edge intersects the y-axis.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Stacked bar example
    let bar_width = 1.2

    // Axes
    line((0, 0), (6, 0), stroke: black + 1pt)
    line((0, 0), (0, 5), stroke: black + 1pt)

    // Y-axis labels
    for i in range(0, 6) {
      let y = i * 1
      let val = i * 20
      content((-0.5, y), text(size: 7pt)[#val])
      line((-0.1, y), (0, y), stroke: gray + 0.5pt)
    }

    // Q1 stacked bar
    let q1_a = 2    // Category A = 40
    let q1_b = 1.5  // Category B = 30
    let q1_c = 1    // Category C = 20
    rect((0.8, 0), (2, q1_a), fill: rgb("#3498db"), stroke: white + 0.5pt)
    rect((0.8, q1_a), (2, q1_a + q1_b), fill: rgb("#e74c3c"), stroke: white + 0.5pt)
    rect((0.8, q1_a + q1_b), (2, q1_a + q1_b + q1_c), fill: rgb("#2ecc71"), stroke: white + 0.5pt)
    content((1.4, -0.4), text(size: 8pt)[Q1])

    // Q2 stacked bar
    let q2_a = 2.5  // Category A = 50
    let q2_b = 1    // Category B = 20
    let q2_c = 0.75 // Category C = 15
    rect((3.5, 0), (4.7, q2_a), fill: rgb("#3498db"), stroke: white + 0.5pt)
    rect((3.5, q2_a), (4.7, q2_a + q2_b), fill: rgb("#e74c3c"), stroke: white + 0.5pt)
    rect((3.5, q2_a + q2_b), (4.7, q2_a + q2_b + q2_c), fill: rgb("#2ecc71"), stroke: white + 0.5pt)
    content((4.1, -0.4), text(size: 8pt)[Q2])

    // Annotations
    line((2.2, q1_a), (3, q1_a), stroke: gray + 0.5pt)
    line((2.2, q1_a + q1_b), (3, q1_a + q1_b), stroke: gray + 0.5pt)
    content((3.2, q1_a + q1_b/2), text(size: 7pt)[30], anchor: "west")

    // Legend
    rect((6.5, 4), (7, 4.4), fill: rgb("#2ecc71"), stroke: none)
    content((7.8, 4.2), text(size: 7pt)[Cat C])
    rect((6.5, 3.2), (7, 3.6), fill: rgb("#e74c3c"), stroke: none)
    content((7.8, 3.4), text(size: 7pt)[Cat B])
    rect((6.5, 2.4), (7, 2.8), fill: rgb("#3498db"), stroke: none)
    content((7.8, 2.6), text(size: 7pt)[Cat A])

    // Callout
    content((5, -1), text(size: 8pt)[_Cat B in Q1 = 30 (segment height), not 70 (top position)_])
  })
]

In the chart above, Category B in Q1 has a value of 30—the height of the red segment—not 70 (where the red segment's top meets the y-axis). This distinction is crucial for accurate readings.

#warning-box[
  *Reading Stacked Charts:*

  - For the *bottom* segment: Value = height of segment = where top edge meets y-axis
  - For *upper* segments: Value = height of segment only (subtract bottom edge from top edge)
  - The *total* is shown by where the top of the entire stack meets the y-axis
]

== Trap 4: Visual Deception

Finally, be wary of letting visual impressions override numerical readings. A bar that looks twice as tall might not represent twice the value if the axis is truncated. Two lines that appear to cross might not actually intersect if you read the values precisely. Colors that look similar might represent different categories.

Always verify your visual impressions by reading actual values from the scales. The picture provides a quick overview, but the numbers provide the accurate answer.

// #pagebreak()

/*
===============================================================================
TEACHING NOTES AND LESSON BREAKDOWN
The following section contains detailed guidance for tutors on how to structure
and deliver the Graphics Interpretation lessons. This content is internal and
should not be displayed to students.
===============================================================================

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Primary Objectives:*
1. GI format and dropdown selection mechanics
2. Line graphs and bar charts (the most common types)
3. Basic value reading and estimation
4. Unit awareness (start building this habit early)

*Suggested Pacing:*
Begin with the format explanation so students know what to expect. Then work through line graph and bar chart examples, emphasizing the scale-checking habit from the start.

*Practice Questions:* 5-6 GI questions with various chart types (emphasize line and bar)

*Common Session A Issues:*
- Not checking axis scales before reading values
- Rushing through without orienting to the graphic first
- Unit errors (millions vs. thousands, percent vs. absolute)

== Lesson B Focus (Deep Dive)

*Primary Objectives:*
1. Advanced chart types (dual-axis, stacked, scatter)
2. Common traps (truncated axes, stacked chart misreading)
3. Calculation from graphics (percent change, ratios)
4. Time-efficient strategies

*Review errors from Training #1, focusing on:*
- Misreading axes or scales
- Unit errors
- Estimation accuracy (were students too precise or not precise enough?)

*Practice Questions:* 6-8 questions including advanced chart types and trap questions

*Key Teaching Point:*
The stacked chart reading error is extremely common. Use multiple examples and have students verbalize the difference between segment height and axis position.

== Lesson C Focus (Assessment Prep)

*Primary Objectives:*
1. Brief review of any patterns from Training #2 errors
2. Quick chart type recognition (minimize orientation time)
3. Efficient estimation techniques
4. Confidence building before assessment

*Session Structure:*
- 15 minutes: Quick review of trouble areas
- 25 minutes: Timed practice set (6-8 questions)
- 10 minutes: Discussion of timing and strategy

*Assessment:* 20 questions, 45 minutes

== Common Student Difficulties

The following issues appear most frequently:

1. *Not checking axis scales (especially truncated axes)*
   - Solution: Build the habit of always checking scale before reading values

2. *Confusing values in stacked charts*
   - Solution: Practice distinguishing segment height from axis position

3. *Mixing up dual-axis readings*
   - Solution: Identify which variable uses which axis before reading any values

4. *Spending too long on single questions*
   - Solution: Practice quick orientation (10-15 seconds) followed by targeted reading

5. *Unit conversion errors*
   - Solution: Make unit verification part of the standard reading process

*General Tutoring Advice:*
Practice with a variety of chart types. Many students have limited experience with stacked or dual-axis graphs. Build comfort through exposure.

===============================================================================
END OF TUTOR NOTES SECTION
===============================================================================
*/
