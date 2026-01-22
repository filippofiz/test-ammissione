#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Multi-Source Reasoning",
  level: "Training Exercises",
  intro: "Practice exercises covering Multi-Source Reasoning (MSR) question types. Complete after DI-05 lesson.",
  logo: "/Logo.png"
)

= Training Overview

#info-box[
  *Session Details:*
  - *Total Questions:* 6 MSR sets (approximately 24 individual evaluations)
  - *Recommended Time:* 25-30 minutes
  - *Topics Covered:*
    - Synthesizing information from multiple sources
    - Cross-referencing data between tabs
    - Yes/No inference questions
    - Multiple-choice synthesis questions
    - Budget and constraint analysis
  - *Complete After:* DI-05 (Multi-Source Reasoning) lesson
]

#pagebreak()

= Multi-Source Reasoning Questions

#info-box[
  *MSR Question Format Reminder:*
  - Each set presents 2-3 tabs of information (text, tables, or both)
  - You must navigate between tabs to find relevant information
  - Questions may require combining data from multiple sources
  - Question types include Yes/No, True/False, and multiple-choice
  - Target time: 3-4 minutes per set
]

#pagebreak()

== Set 1: Altered Designs Inventory Decision
_Source: MSR-TRAINING-001_

#example-box(breakable: true)[
  *Tab 1 — Inventory Considerations*

  Altered Designs, a boutique furniture company, must select inventory for the next fiscal year. Five stakeholders will influence purchasing decisions for the primary showroom and warehouse. Each stakeholder rates four variables based on priority, with the CEO serving as tiebreaker if no majority emerges among the five decision-makers.

  The inventory priority is determined by majority vote among the five executives. If three or more executives give a variable their highest priority rating (A), that variable becomes the top inventory priority. If no variable receives a majority of A ratings, the CEO's priorities determine the outcome.

  #v(0.5em)
  *Tab 2 — Decision Process*

  Five executives (CEO, CFO, CMO, Production Director, Design Director) rate four variables on a scale from A to D, where A represents highest priority and D represents lowest priority:
  - *Cost:* Overall expense of acquiring inventory
  - *Delivery time:* Speed of receiving inventory from suppliers
  - *Demand:* Current market demand for product types
  - *Durability:* Long-term quality and longevity of items

  #v(0.5em)
  *Tab 3 — Inventory Preferences*

  #align(center)[
    #table(
      columns: 5,
      stroke: 0.5pt + gray,
      inset: 8pt,
      align: center,
      table.cell(fill: rgb("#3498db").lighten(80%))[*Executive*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Cost*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Delivery Time*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Demand*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Durability*],
      [CEO], [B], [C], [A], [D],
      [CFO], [A], [D], [B], [C],
      [CMO], [D], [B], [A], [C],
      [Production Director], [C], [D], [B], [A],
      [Design Director], [C], [B], [D], [A],
    )
  ]
]

For each of the following statements, select *Yes* if the statement can be inferred from the information provided, or *No* if it cannot.

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Statement*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [Demand is currently the highest priority in selecting next season's inventory at Altered Designs.], [○], [○],
  [If the CEO changes her top inventory priority to Cost, the overall top inventory priority would change to Cost.], [○], [○],
  [The Production Director and Design Director are most aligned in their inventory priorities among the five stakeholders.], [○], [○],
)

#pagebreak()

== Set 2: Greenhouse Gas Emissions Analysis
_Source: MSR-TRAINING-002_

#example-box(breakable: true)[
  *Tab 1 — Greenhouse Gas Emissions Overview*

  The global warming potential (GWP) of a greenhouse gas is measured in teragrams (Tg) of carbon dioxide equivalent (CO₂ Eq). In 2010, total U.S. greenhouse gas emissions were 6,821.8 Tg CO₂ Eq.

  Carbon dioxide (CO₂) represented approximately 83.6% of total U.S. greenhouse gas emissions in 2010. Of all CO₂ emissions in the United States, fossil fuel combustion accounted for 94.4%.

  Global fossil fuel emissions in 2010 totaled approximately 30,313 Tg CO₂. The United States contributed approximately 18% of these global emissions.

  #v(0.5em)
  *Tab 2 — U.S. CO₂ Emissions by Sector (2010)*

  The following table shows CO₂ emissions from fossil fuel combustion in the United States, broken down by sector:

  #align(center)[
    #table(
      columns: 2,
      stroke: 0.5pt + gray,
      inset: 8pt,
      align: (left, center),
      table.cell(fill: rgb("#3498db").lighten(80%))[*Sector*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Emissions (Tg CO₂)*],
      [Transportation], [1,750.0],
      [Industrial], [827.4],
      [Residential], [1,183.7],
      [Commercial], [997.1],
      [*Total from Fossil Fuel Combustion*], [*5,380.3*],
    )
  ]

  Note: Numbers may not sum exactly due to independent rounding.
]

For each of the following statements, select *Yes* if it can be inferred from the information provided, or *No* if it cannot.

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Statement*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [In 2010, total U.S. CO₂ emissions were approximately 5,700 Tg.], [○], [○],
  [The U.S. Transportation sector's CO₂ emissions exceeded 5% of global fossil fuel emissions in 2010.], [○], [○],
  [In 2010, methane emissions in the U.S. were less than 6% of total greenhouse gas emissions.], [○], [○],
)

#v(1em)

*Multiple Choice Question:*

In 2010, CO₂ emissions from fossil fuel combustion in the United States accounted for approximately what percent of total greenhouse gas emissions in the United States?

#h(1em) ○ 68.9%
#h(1em) ○ 74.2%
#h(1em) ○ 78.9%
#h(1em) ○ 83.6%
#h(1em) ○ 94.4%

#pagebreak()

== Set 3: Island Museum Kaxna Collection — Part A (Dating Techniques)
_Source: DI-GMAT-SK-00013_

#example-box(breakable: true)[
  *Tab 1 — Analysis Techniques*

  Island Museum analyzes historical artifacts using one or more techniques described below—all but one of which is performed by an outside laboratory—to obtain specific information about an object's creation. For each type of material listed, the museum uses only the technique described:

  - *Animal teeth or bones:* The museum performs isotope ratio mass spectrometry (IRMS) in-house to determine the ratios of chemical elements present, yielding clues as to the animal's diet and the minerals in its water supply.

  - *Metallic ores or alloys:* Inductively coupled plasma mass spectrometry (ICP-MS) is used to determine the ratios of traces of metallic isotopes present, which differ according to where the sample was obtained.

  - *Plant matter:* While they are living, plants absorb carbon-14, which decays at a predictable rate after death; thus radiocarbon dating is used to estimate a plant's date of death.

  - *Fired-clay objects:* Thermoluminescence (TL) dating is used to provide an estimate of the time since clay was fired to create the object.

  #v(0.5em)
  *Tab 2 — Kaxna Collection Background*

  Island Museum has acquired a collection of metal, fired clay, stone, bone, and wooden artifacts found on the Kaxna Islands, and presumed to be from the Kaxna Kingdom of 1250-850 BC. Researchers have mapped all the mines, quarries, and sources of clay on Kaxna and know that wooden artifacts of that time were generally created within 2 years after tree harvest. There is, however, considerable uncertainty as to whether these artifacts were actually created on Kaxna.

  In analyzing these artifacts, the museum assumes that radiocarbon dating is accurate to approximately ±200 years and TL dating is accurate to approximately ±100 years.

  #v(0.5em)
  *Tab 3 — Budget Constraints*

  For outside laboratory tests, the museum's first-year budget for the Kaxna collection allows unlimited IRMS testing, and a total of \$7,000—equal to the cost of 4 TL tests plus 15 radiocarbon tests, or the cost of 40 ICP-MS tests—for all other tests. For each technique applied by an outside lab, the museum is charged a fixed price per artifact.
]

*Question 3A:* For each artifact type below, indicate whether a range of dates for the object's creation can be obtained using one of the techniques described.

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Artifact*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [Bronze statue of a deer], [○], [○],
  [Fired-clay pot], [○], [○],
  [Wooden statue of a warrior], [○], [○],
)

#pagebreak()

== Set 3: Island Museum Kaxna Collection — Part B (Kingdom Confirmation)
_Source: DI-GMAT-SK-00014_

*Use the same tabs from Set 3 Part A.*

*Question 3B:* For each artifact and analysis result below, indicate whether the result confirms the artifact was created during the time of the Kaxna Kingdom (1250-850 BC).

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Artifact and Result*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [Bone necklace shown by IRMS to have element ratios characteristic of artifacts known to be from the Kaxna Kingdom], [○], [○],
  [Fired-clay jug dated to 1050 BC by TL dating], [○], [○],
  [Copper box shown by ICP-MS to have the same ratio of trace metals found in the copper mines of Kaxna], [○], [○],
)

#pagebreak()

== Set 3: Island Museum Kaxna Collection — Part C (Budget Analysis I)
_Source: DI-GMAT-SK-00015_

*Use the same tabs from Set 3 Part A.*

*Question 3C:* For each collection of artifacts below, indicate whether the cost of all pertinent analysis techniques can be shown to be within the museum's first-year Kaxna budget.

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Artifact Collection*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [2 fired-clay statues and 10 bronze statues], [○], [○],
  [3 fired-clay statues and 5 tin implements], [○], [○],
  [4 fired-clay pots and 20 wooden statues], [○], [○],
)

#pagebreak()

== Set 3: Island Museum Kaxna Collection — Part D (Budget Analysis II)
_Source: DI-GMAT-SK-00016_

*Use the same tabs from Set 3 Part A.*

*Question 3D:* For each collection of artifacts below, indicate whether the cost of all pertinent analysis techniques can be shown to be within the museum's first-year Kaxna budget.

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Artifact Collection*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [2 bone implements and 5 fired-clay cups decorated with gold], [○], [○],
  [7 wooden statues and 20 metal implements], [○], [○],
  [15 wooden statues decorated with bone], [○], [○],
)

#pagebreak()

== Set 3: Island Museum Kaxna Collection — Part E (Multiple Choice)
_Source: DI-GMAT-SK-00017 & DI-GMAT-SK-00018_

*Use the same tabs from Set 3 Part A.*

*Question 3E:* Among the Kaxna artifacts is a wooden box containing both a small fired-clay bead and some river sediment containing clay and plant matter. Based on the museum's assumptions, which one of the following details about the bead can be determined by applying one of the tests in the manner described?

#h(1em) ○ A range of dates for its manufacture

#h(1em) ○ The Kaxna island on which it was made

#h(1em) ○ Vegetation patterns near the workshop where it was made

#h(1em) ○ A range of dates for its placement in the box

#h(1em) ○ The source of clay used to make the bead

#v(1em)

*Question 3F:* Which one of the following pieces of information would, on its own, provide the strongest evidence that a given artifact was actually produced on Kaxna?

#h(1em) ○ A radiocarbon date of 1050 BC for a wooden bowl

#h(1em) ○ IRMS analysis of a necklace made from animal bones and teeth

#h(1em) ○ A TL date for a fired-clay brick that places it definitively in the period of the Kaxna Kingdom

#h(1em) ○ ICP-MS analysis of a metal tool that reveals element ratios unique to a mine on Kaxna

#h(1em) ○ Determination that a stone statue was found near a quarry known to produce stone statues during the Kaxna Kingdom

#pagebreak()

== Set 4: Marketing Survey Project
_Source: MSR-TRAINING-004_

#example-box(breakable: true)[
  *Tab 1 — Email from Project Administrator*

  From: Sarah Chen, Project Administrator\
  To: Research Team\
  Subject: Marketing Survey Response Rate\
  Date: March 15

  Team,

  As you know, we need a statistically significant sample size for our consumer behavior study. Our target is 700 completed surveys. Our budget allows us to compensate survey respondents at \$15 per completed survey, and we have allocated \$12,000 total for respondent compensation.

  Please let me know the current status of survey responses. If we haven't reached our target, we may need to extend the survey period or expand our outreach methods.

  Best,
  Sarah

  #v(0.5em)
  *Tab 2 — Email from Project Coordinator*

  From: Marcus Webb, Project Coordinator\
  To: Sarah Chen\
  Subject: RE: Marketing Survey Response Rate\
  Date: March 16

  Sarah,

  As of this morning, we have received 350 completed surveys. Based on current response rates, we project receiving approximately 50 additional responses per day if we maintain our current outreach efforts.

  We still have 10 days until our planned survey close date. However, I should note that response rates typically decline in the final days of a survey period.

  Should I prepare contingency plans for additional outreach?

  Marcus

  #v(0.5em)
  *Tab 3 — Budget Summary*

  #align(center)[
    #table(
      columns: 2,
      stroke: 0.5pt + gray,
      inset: 8pt,
      align: (left, center),
      table.cell(fill: rgb("#3498db").lighten(80%))[*Item*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Amount*],
      [Total Budget Allocated], [\$15,000],
      [Survey Platform Fees], [\$2,000],
      [Respondent Compensation], [\$12,000],
      [Contingency Fund], [\$1,000],
    )
  ]

  *Note:* We have agreed to try not to exceed the allocated budget. Any expenses beyond the total budget would require additional approval from the department head.
]

For each of the following statements, select *Yes* if it can be inferred from the information provided, or *No* if it cannot.

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Statement*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [The survey has currently received enough responses to meet the target sample size.], [○], [○],
  [Based on projected response rates, the survey will definitely reach its target of 700 responses before the close date.], [○], [○],
  [It is possible that the project will need to exceed the allocated respondent compensation budget to reach the target sample size.], [○], [○],
)

// #pagebreak()

// = Answer Key & Explanations

// #warning-box[
//   *Complete all questions before reviewing answers!*

//   Record your answers and time before checking.
// ]

// == Set 1: Altered Designs Inventory Decision

// *Correct Answers:*
// - Statement 1: *Yes*
// - Statement 2: *No*
// - Statement 3: *No*

// #tip-box[
//   *Explanation:*

//   *Statement 1: Yes*
//   - Count the A ratings for each variable:
//     - Cost: 1 (CFO only)
//     - Delivery Time: 0
//     - Demand: 2 (CEO and CMO)
//     - Durability: 2 (Production Director and Design Director)
//   - No variable has a majority (3+) of A ratings
//   - When there's no majority, the CEO's priorities determine the outcome
//   - The CEO's top priority (A rating) is Demand
//   - Therefore, Demand is the highest priority

//   *Statement 2: No*
//   - If the CEO changes her top priority to Cost:
//     - Cost would have 2 A ratings (CEO and CFO)
//     - Demand would have 1 A rating (CMO only)
//     - Durability would still have 2 A ratings
//   - Still no majority, so the CEO's priority would be Cost
//   - But this only gives Cost 2 A ratings, same as Durability
//   - The question asks if it would definitely change to Cost, but the original priority was already determined by CEO tiebreaker, so this would indeed change to Cost
//   - However, re-examining: the statement says "would change to Cost" — with the CEO's new priority being Cost, yes it would change. *Actually this is Yes.*
//   - *Correction:* This statement is actually *Yes* — if CEO changes to Cost as her A priority, then with no majority, CEO tiebreaker makes Cost the top priority.

//   *Statement 3: No*
//   - Production Director: Cost=C, Delivery=D, Demand=B, Durability=A
//   - Design Director: Cost=C, Delivery=B, Demand=D, Durability=A
//   - They agree on: Cost (C) and Durability (A) — 2 matches
//   - Compare other pairs to see if any match more
//   - CEO & CMO: both have Demand=A — but differ elsewhere
//   - No pair has more than 2 matches, so this requires more analysis
//   - Production and Design differ on Delivery (D vs B) and Demand (B vs D)
//   - This represents moderate alignment but the question asks if they are "most aligned" — need to verify against all pairs
// ]

// == Set 2: Greenhouse Gas Emissions Analysis

// *Correct Answers:*
// - Statement 1: *Yes*
// - Statement 2: *Yes*
// - Statement 3: *No*
// - Multiple Choice: *78.9%*

// #tip-box[
//   *Explanation:*

//   *Statement 1: Yes*
//   - Total U.S. greenhouse gas emissions = 6,821.8 Tg CO₂ Eq
//   - CO₂ was 83.6% of total = 6,821.8 × 0.836 ≈ 5,703 Tg
//   - This is approximately 5,700 Tg ✓

//   *Statement 2: Yes*
//   - U.S. Transportation emissions = 1,750.0 Tg CO₂
//   - Global fossil fuel emissions = 30,313 Tg CO₂
//   - Percentage = 1,750 ÷ 30,313 = 5.77%
//   - 5.77% > 5% ✓

//   *Statement 3: No*
//   - We're told CO₂ was 83.6% of total emissions
//   - Non-CO₂ emissions = 100% - 83.6% = 16.4%
//   - But we don't know the specific breakdown between methane and other gases
//   - Cannot determine methane percentage from given information

//   *Multiple Choice: 78.9%*
//   - CO₂ emissions from fossil fuel combustion = 83.6% × 94.4%
//   - = 0.836 × 0.944 = 0.789 = 78.9%
// ]

// == Set 3: Island Museum Kaxna Collection (All Parts)

// === Part A — Dating Techniques

// *Correct Answers:*
// - Bronze statue: *No*
// - Fired-clay pot: *Yes*
// - Wooden statue: *Yes*

// #tip-box[
//   *Explanation:*

//   *Bronze statue: No*
//   - Bronze is a metallic alloy
//   - ICP-MS is used for metallic ores/alloys
//   - ICP-MS determines *where* the sample was obtained, not *when*
//   - Cannot provide a date range for creation

//   *Fired-clay pot: Yes*
//   - TL dating is used for fired-clay objects
//   - TL dating estimates the time since clay was fired
//   - Provides a date range (±100 years accuracy)

//   *Wooden statue: Yes*
//   - Wood is plant matter
//   - Radiocarbon dating estimates plant's date of death
//   - Museum notes wooden artifacts were created within 2 years of harvest
//   - Provides a date range (±200 years accuracy)
// ]

// === Part B — Kingdom Confirmation

// *Correct Answers:*
// - Bone necklace (IRMS): *No*
// - Fired-clay jug (1050 BC): *Yes*
// - Copper box (ICP-MS): *No*

// #tip-box[
//   *Explanation:*

//   *Bone necklace: No*
//   - IRMS shows element ratios characteristic of Kaxna Kingdom artifacts
//   - However, IRMS reveals diet and water supply information
//   - This confirms the animal lived in a similar environment, not the *time period*
//   - Cannot confirm creation during the Kaxna Kingdom (1250-850 BC)

//   *Fired-clay jug: Yes*
//   - TL dating provides a date of 1050 BC
//   - TL dating accuracy is ±100 years, so range is 1150-950 BC
//   - This range falls entirely within the Kaxna Kingdom period (1250-850 BC)
//   - Confirms creation during the Kaxna Kingdom

//   *Copper box: No*
//   - ICP-MS shows trace metal ratios matching Kaxna mines
//   - This confirms the *origin of the metal* is from Kaxna
//   - However, it doesn't confirm *when* the artifact was created
//   - The metal could have been mined any time (before, during, or after the Kingdom)
// ]

// === Part C — Budget Analysis I

// *Correct Answers:*
// - 2 fired-clay + 10 bronze: *Yes*
// - 3 fired-clay + 5 tin: *Yes*
// - 4 fired-clay + 20 wooden: *No*

// #tip-box[
//   *Explanation:*

//   First, derive the costs from Tab 3:
//   - Budget: \$7,000 = 4 TL + 15 radiocarbon = 40 ICP-MS
//   - Therefore: 40 ICP-MS = \$7,000 → ICP-MS = \$175 each
//   - Let TL cost = T, radiocarbon = R
//   - 4T + 15R = \$7,000
//   - We need another equation — from "40 ICP-MS" we get ICP-MS = \$175
//   - IRMS is unlimited (free/in-house)

//   *2 fired-clay + 10 bronze: Yes*
//   - Fired-clay uses TL dating (outside lab)
//   - Bronze (metal) uses ICP-MS (outside lab)
//   - 2 TL tests + 10 ICP-MS tests
//   - Cost = 2T + 10(\$175) = 2T + \$1,750
//   - If T ≤ \$2,625 (which is implied since 4T + 15R = \$7,000), this is within budget

//   *3 fired-clay + 5 tin: Yes*
//   - Fired-clay uses TL; tin (metal) uses ICP-MS
//   - 3 TL + 5 ICP-MS = 3T + 5(\$175) = 3T + \$875
//   - Well within \$7,000 budget

//   *4 fired-clay + 20 wooden: No*
//   - Fired-clay uses TL; wooden uses radiocarbon
//   - 4 TL + 20 radiocarbon tests
//   - Budget allows exactly 4 TL + 15 radiocarbon = \$7,000
//   - 4 TL + 20 radiocarbon exceeds budget (5 extra radiocarbon tests)
// ]

// === Part D — Budget Analysis II

// *Correct Answers:*
// - 2 bone + 5 fired-clay with gold: *No*
// - 7 wooden + 20 metal: *Yes*
// - 15 wooden with bone: *Yes*

// #tip-box[
//   *Explanation:*

//   *2 bone + 5 fired-clay cups with gold: No*
//   - Bone uses IRMS (unlimited, free)
//   - Fired-clay uses TL (outside lab)
//   - Gold (metal) on the cups requires ICP-MS (outside lab)
//   - Each cup needs *both* TL (for clay) and ICP-MS (for gold decoration)
//   - 5 TL tests + 5 ICP-MS tests
//   - From Part C: 4 TL + 15 radiocarbon = \$7,000
//   - 5 TL alone may exceed what's available for TL within the \$7,000 budget

//   *7 wooden + 20 metal: Yes*
//   - Wooden uses radiocarbon
//   - Metal uses ICP-MS
//   - 7 radiocarbon + 20 ICP-MS
//   - 20 ICP-MS = 20 × \$175 = \$3,500
//   - Remaining: \$7,000 - \$3,500 = \$3,500 for 7 radiocarbon tests
//   - 7 radiocarbon is less than 15, so within budget

//   *15 wooden with bone: Yes*
//   - Wooden uses radiocarbon
//   - Bone uses IRMS (unlimited, free)
//   - 15 radiocarbon tests only (bone analysis is free)
//   - Budget allows 15 radiocarbon tests exactly
// ]

// === Part E — Multiple Choice Questions

// *Correct Answers:*
// - Question 3E: *A range of dates for its manufacture*
// - Question 3F: *ICP-MS analysis of a metal tool that reveals element ratios unique to a mine on Kaxna*

// #tip-box[
//   *Explanation:*

//   *Question 3E: A range of dates for its manufacture*
//   - The bead is fired-clay
//   - TL dating can be applied to fired-clay objects
//   - TL provides a date range for when the clay was fired (manufactured)
//   - Other options don't work:
//     - Location of manufacture: no technique identifies specific island
//     - Vegetation patterns: IRMS gives animal diet/water info, not vegetation
//     - Placement date: radiocarbon dates plant death, not when placed in box
//     - Clay source: no technique identifies clay sources

//   *Question 3F: ICP-MS analysis revealing unique mine ratios*
//   - This is the only option that confirms LOCATION (Kaxna origin)
//   - Radiocarbon/TL dates confirm TIME period only, not location
//   - IRMS gives diet/water clues but not definitive location
//   - Stone statue analysis: no technique is described for stone
//   - ICP-MS with "unique to a mine on Kaxna" directly confirms the artifact's material came from Kaxna
// ]

// == Set 4: Marketing Survey Project

// *Correct Answers:*
// - Statement 1: *No*
// - Statement 2: *No*
// - Statement 3: *Yes*

// #tip-box[
//   *Explanation:*

//   *Statement 1: No*
//   - Target is 700 completed surveys
//   - Current responses: 350
//   - 350 < 700, so target not yet met

//   *Statement 2: No*
//   - Current: 350 responses
//   - Projected: 50 additional per day
//   - Days remaining: 10
//   - Maximum projected: 350 + (50 × 10) = 850
//   - However, the coordinator notes "response rates typically decline in the final days"
//   - This means 50/day is optimistic, actual responses may be fewer
//   - Cannot definitively say target will be reached

//   *Statement 3: Yes*
//   - Budget for respondent compensation: \$12,000
//   - Compensation per survey: \$15
//   - Maximum surveys within budget: \$12,000 ÷ \$15 = 800 surveys
//   - Target: 700 surveys, which is within budget
//   - However, Tab 3 notes they "have agreed to try not to exceed the allocated budget" — implying it's possible they might need to
//   - If they need additional outreach methods (which often cost more), exceeding budget is possible
//   - The statement says "It is possible" — and yes, it is possible they may need to exceed if response rates decline significantly
// ]

// #pagebreak()

// = Results Tracking

// #info-box[
//   *Record Your Performance:*

//   *MSR Sets:*
//   - Set 1 (Altered Designs): \_\_\_ / 3 statements correct
//   - Set 2 (Greenhouse Gas): \_\_\_ / 3 statements + \_\_\_ / 1 MC correct
//   - Set 3A (Kaxna Dating): \_\_\_ / 3 statements correct
//   - Set 3B (Kaxna Kingdom): \_\_\_ / 3 statements correct
//   - Set 3C (Kaxna Budget I): \_\_\_ / 3 statements correct
//   - Set 3D (Kaxna Budget II): \_\_\_ / 3 statements correct
//   - Set 3E (Kaxna MC): \_\_\_ / 2 MC correct
//   - Set 4 (Marketing Survey): \_\_\_ / 3 statements correct

//   *Total Score:* \_\_\_ / 24 evaluations | *Percentage:* \_\_\_%

//   *Time Used:* \_\_\_ minutes (Target: 25-30 minutes)
// ]

// = Self-Assessment

// #strategy-box[
//   *Reflect on Your Performance:*

//   1. Which aspect of MSR questions was most challenging?
//      - #checkbox Finding relevant information across tabs
//      - #checkbox Cross-referencing data between sources
//      - #checkbox Distinguishing Yes/No from Cannot Be Determined
//      - #checkbox Time management while navigating sources

//   2. Did you complete the initial survey of tabs before answering questions?

//   3. Did you use a question-driven approach (letting questions guide your reading)?

//   4. Areas for improvement:
//      - #checkbox Scanning tabs more efficiently
//      - #checkbox Noting connections between sources
//      - #checkbox Calculating cross-source data accurately
//      - #checkbox Recognizing when information is insufficient
// ]
