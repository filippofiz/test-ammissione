#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Verbal Reasoning - Fundamentals_],
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
  #text(size: 16pt, fill: uptoten-green)[Fundamentals]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    Essential foundations for GMAT Verbal Reasoning: understanding arguments, analyzing passages, and mastering logical structure.\
    \
    This guide covers the building blocks of critical reasoning and reading comprehension that you'll use throughout your GMAT preparation.
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

= Analyzing Arguments

Understanding argument structure is the foundation of GMAT Verbal Reasoning. This section teaches you to identify and analyze the components of any argument.

== What Is an Argument?

An *argument* gives one or more ideas as reasons to accept one or more other ideas. Often some of these ideas are implied but not stated.

#example-box[
  *Example*:

  "The sidewalk is dry, so it must not have rained last night."

  This argument gives the observation that the sidewalk is dry as a reason to accept that it didn't rain last night. The argument implies but doesn't say that rain typically leaves sidewalks wet.
]

== Premises

A *premise* is an idea that an argument gives as a reason to accept another idea. An argument can have any number of premises.

=== Premise Marker Words

#table(
  columns: (1fr, 1fr, 1fr),
  align: (left, left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Markers*], [*Markers*], [*Markers*],
  [after all], [for one thing], [moreover],
  [because], [furthermore], [seeing that],
  [for], [given that], [since],
  [for the reason that], [in light of the fact that], [whereas],
)

#example-box[
  *Example*:

  "Our mayor shouldn't support the proposal to expand the freeway *because* the expansion's benefits wouldn't justify the costs. *Furthermore*, most voters oppose the expansion."

  This argument has two stated premises:
  - Premise 1 (marked by "because"): The expansion's benefits wouldn't justify the costs
  - Premise 2 (marked by "furthermore"): Most voters oppose the expansion
]

#pagebreak()

== Conclusions

A *conclusion* is an idea an argument supports with one or more premises.

- *Intermediate conclusion*: A conclusion the argument uses to support another conclusion
- *Main conclusion*: A conclusion the argument doesn't use to support any other conclusion

=== Conclusion Marker Words

#table(
  columns: (1fr, 1fr, 1fr),
  align: (left, left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Markers*], [*Markers*], [*Markers*],
  [clearly], [it follows that], [suggests that],
  [entails that], [proves], [surely],
  [hence], [shows that], [therefore],
  [implies that], [so], [thus],
)

#example-box[
  *Example*:

  "Julia just hiked fifteen kilometers, *so* she must have burned a lot of calories. *Surely*, she's hungry now."

  - Premise: Julia just hiked fifteen kilometers
  - Intermediate conclusion (marked by "so"): She must have burned a lot of calories
  - Main conclusion (marked by "surely"): She's hungry now
]

#tip-box[
  *Finding Conclusions Without Marker Words*

  Sometimes no marker words indicate which statements are premises and which are conclusions. Ask yourself: "Which statement is the author trying to get me to accept?" That's the conclusion. The reasons given to support it are the premises.
]

#pagebreak()

== Valid and Sound Arguments

=== Valid Arguments

A *valid argument* is one whose conclusions follow from its premises. A valid argument can have false premises and conclusions. In a valid argument with false premises, the conclusion would follow if the premises were true.

#example-box[
  *Example (Valid but not Sound)*:

  "Everyone who tries fried eggplant is guaranteed to love the taste. So, if you try it, you'll love the taste too."

  The premise is false (not everyone loves fried eggplant), but the argument is valid - if the premise were true, the conclusion would follow.
]

=== Sound Arguments

A *sound argument* is a valid argument with true premises. Since a sound argument's premises are true and its conclusions follow from those premises, its conclusions must also be true.

#example-box[
  *Example (Invalid, therefore not Sound)*:

  "Some people who try fried eggplant dislike the taste. So, if you try it, you'll probably dislike the taste too."

  The premise is true, but the argument is invalid - some people disliking something doesn't mean you probably will too.
]

#pagebreak()

== Assumptions

An *assumption* is an idea taken for granted. It may be:
- A premise in an argument
- A claim about a cause or effect
- A condition a plan relies on
- Any other idea taken for granted in a passage

#warning-box[
  *Important*: A conclusion is never an assumption - an argument doesn't take a conclusion for granted, but rather gives reasons to accept it.
]

=== Implicit Assumptions

A passage may have *implicit assumptions* the author considers too obvious to state. These unstated ideas fill logical gaps between the passage's statements.

#info-box[
  *Key Insight*

  An argument or explanation with implausible implicit assumptions is weak and vulnerable to criticism. Identifying these assumptions is crucial for answering GMAT questions.
]

=== Necessary Assumptions

A *necessary assumption* is an idea that must be true for the argument's stated premises to be good enough reasons to accept its conclusions.

#example-box[
  *Example*:

  "Mario has booked a flight scheduled to arrive at 5:00 p.m. - which should let him get here by around 6:30 p.m. So, by 7:00 p.m. we'll be going out to dinner with Mario."

  Necessary assumptions:
  - The flight will arrive not much later than scheduled
  - Mario actually caught his flight
  - Mario will come to dinner after arriving
]

=== Sufficient Assumptions

A *sufficient assumption* is an idea whose truth would make the argument's main conclusion follow from the stated premises.

#example-box[
  *Example*:

  "The study of poetry is entirely without value since poetry has no practical use."

  Sufficient assumption: Studying anything with no practical use is entirely without value.

  If this assumption is true, the conclusion necessarily follows.
]

#pagebreak()

= Types of Arguments

Arguments can be classified based on what kinds of conclusions they support.

== Prescriptive Arguments

A *prescriptive argument* supports a conclusion about what should or shouldn't be done.

#example-box[
  *Example*:

  "Our company's staff is too small to handle our upcoming project. So, to make sure the project succeeds, the company *should* hire more employees."

  The conclusion advocates a specific action (hiring).
]

== Evaluative Arguments

An *evaluative argument* supports a conclusion that something is good or bad, desirable or undesirable, without advocating any particular action.

#example-box[
  *Example*:

  "This early novel is clearly *one of the greatest of all time*. Not only did it pioneer brilliantly innovative narrative techniques, but it did so with exceptional grace, subtlety, and sophistication."

  The conclusion evaluates the novel's quality without recommending any action.
]

== Interpretive Arguments

An *interpretive argument* supports a conclusion about something's underlying significance.

#example-box[
  *Example*:

  "Many famous authors have commented emphatically on this early novel, either praising or condemning it. This *suggests* the novel has had an enormous influence on later fiction."

  The conclusion interprets the significance of the observations.
]

#pagebreak()

== Causal Arguments

A *causal argument* supports a conclusion that one or more factors did or did not contribute to one or more effects.

#example-box[
  *Example*:

  "Our houseplant started to thrive only when we moved it to a sunny window. So, probably *the reason* it was sickly before then was that it wasn't getting enough sunlight."

  The conclusion identifies a cause for the observed effect.
]

== Basic Factual Arguments

A *basic factual argument* supports a factual conclusion that doesn't fit in any other category.

#example-box[
  *Example*:

  "All dogs are mammals. Rover is a dog. *Therefore*, Rover is a mammal."

  This is a straightforward logical deduction.
]

#pagebreak()

= Explanations and Plans

== Causal Explanations

A *causal explanation* claims that one or more factors contribute to one or more effects. Unlike an argument, a causal explanation might not have premises or conclusions.

=== Causal Explanation Marker Words

#table(
  columns: (1fr, 1fr, 1fr),
  align: (left, left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Markers*], [*Markers*], [*Markers*],
  [as a result], [due to], [results in],
  [because], [leads to], [that's why],
  [causes], [produces], [thereby],
  [contributes to], [responsible for], [thus],
)

#example-box[
  *Example (Causal Explanation, not Argument)*:

  "Julia just hiked fifteen kilometers, *thereby* burning a lot of calories. *That's why* she's hungry now."

  This explains what made Julia hungry - it doesn't try to convince you she's hungry.
]

#tip-box[
  *Distinguishing Explanations from Arguments*

  Ask: Is the author giving reasons to accept a conclusion, or saying what caused an effect?
  - If trying to persuade: It's an argument
  - If explaining causation: It's a causal explanation
]

== Observations and Hypotheses

- An *observation* is a claim that something was observed or is directly known
- A *hypothesis* is a tentative idea neither known nor assumed to be true

#example-box[
  *Example (Two Alternative Hypotheses)*:

  "A bush in our yard just died. The invasive insects we've seen around lately might be the cause. Or the bush might not have gotten enough water. It's been a dry summer."

  This presents two competing explanations without arguing for either.
]

#pagebreak()

== Plans

A *plan* describes an imagined set of actions meant to work together to achieve one or more goals.

#info-box[
  *Key Distinction*

  A plan is not itself an argument. Its actions aren't proposed as reasons to accept a goal, but rather as ways to reach it. However, a plan can be part of an argument.
]

#example-box[
  *Example*:

  "To repaint our house, we will need to buy gallons of paint. To do that, we could go to the hardware store."

  - Main goal: Repaint the house
  - Intermediate goal: Buy gallons of paint
  - Action: Go to the hardware store
]

Like arguments, plans have assumptions:
- *Necessary assumption*: Must be true for the plan to achieve its goals
- *Sufficient assumption*: Guarantees the plan would achieve its goals if followed

= Narratives and Descriptions

A *narrative* describes a sequence of related events. It's not an argument, explanation, or plan, but may contain any of these.

=== Narrative Sequence Markers

#table(
  columns: (1fr, 1fr, 1fr),
  align: (left, left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Markers*], [*Markers*], [*Markers*],
  [after], [earlier], [then],
  [afterwards], [later], [thereafter],
  [before], [previously], [until],
  [beforehand], [since], [while],
  [during], [subsequently], [when],
)

#example-box[
  *Example (Narrative)*:

  "*While* Julia was hiking fifteen kilometers, she burned a lot of calories. *Afterwards*, she felt hungry."

  This describes events in sequence without explicitly stating causal links.
]

#pagebreak()

= Inductive Reasoning

== What Is Inductive Reasoning?

In an *inductive argument*, the premises are meant to support a conclusion but not to fully prove it. The conclusion is probably true, but might be false despite the evidence.

#info-box[
  *Strengthening and Weakening*

  An inductive argument can be:
  - *Strengthened* by adding support for the conclusion
  - *Weakened* by adding reasons to doubt the conclusion
]

== Generalizations and Predictions

=== Argument by Generalization

An *argument by generalization* uses premises about a sample to support a conclusion about a whole population.

#example-box[
  *Example*:

  "Six of the eight apartments available for lease in this building are studio apartments. So, probably about three fourths of all the apartments in the building are studio apartments."

  The sample (apartments for lease) is used to generalize about the population (all apartments).
]

=== Predictive Arguments

A *predictive argument by generalization* uses a premise about an observed sample to support a conclusion about an unobserved part of the population.

#example-box[
  *Example*:

  "Of the eight apartments I've visited so far, six have been studio apartments. So, probably about six out of the next eight apartments I visit will also be studio apartments."
]

#pagebreak()

=== Flaws in Generalizations

==== Sampling Bias

A *biased sample* is chosen in a way likely to make it relevantly different from the population. Arguments using biased samples are flawed.

#example-box[
  *Example (Biased Sample)*:

  "In a telephone survey, about four out of five respondents said they usually answer the phone when it rings. So, about four out of five city residents usually answer the phone."

  The bias: People who answer phones are more likely to respond to telephone surveys.
]

==== Hasty Generalization

*Hasty generalization* occurs when a sample is too small to justify the conclusion.

#example-box[
  *Example*:

  "A coin came up heads five of the eight times Beth flipped it. This suggests the coin is weighted to favor heads."

  Eight flips is too small a sample - a fair coin often shows similar variations by chance.
]

==== Fallacy of Specificity

An argument whose conclusion is too precise for its premises to justify is flawed by the *fallacy of specificity*.

#example-box[
  *Example*:

  "Biologists weighed fifty frogs averaging 32.86 grams apiece. So, all frogs in the lake must average 32.86 grams."

  A better conclusion: "The frogs probably average between 25 and 40 grams."
]

#pagebreak()

== Causal Reasoning

=== Basic Causal Arguments

Causal arguments use premises about correlations to support conclusions about causes and effects.

#example-box[
  *Example*:

  "A bush in our yard just died. There's been no rain this summer, and no one has been watering the yard. Bushes of this species tend to die after several weeks without water. So, probably the bush died because it didn't get enough water."
]

=== Testing Causal Explanations

To check competing causal explanations, look at situations with one possible cause but not the other.

#example-box[
  *Example - Two Competing Explanations*:

  *Explanation 1*: Lack of water kills the bushes.
  *Explanation 2*: Heat alone kills the bushes.

  *Tests*:
  - Water bushes during extreme heat #sym.arrow Tests explanation 2
  - Keep bushes dry in cooler weather #sym.arrow Tests explanation 1

  Results help determine which explanation is correct.
]

=== Determining Causal Direction

Even when two factors are clearly linked, it can be hard to tell which causes which, or whether a third factor causes both.

#example-box[
  *Example*:

  "Earthworms are more often found near healthy bushes than sickly ones."

  Possible causal links:
  - Earthworms improve bush health
  - Healthier bushes attract earthworms
  - Certain soil conditions both improve bush health and attract earthworms
]

#pagebreak()

== Analogies

An *argument by analogy* says two things are alike in certain ways, then uses a claim about one as a reason to accept a similar claim about the other.

#example-box[
  *Example*:

  "Laotian cuisine and Thai cuisine use many of the same ingredients and cooking techniques. Ahmed enjoys Thai cuisine. So, if he tried Laotian cuisine, he'd probably enjoy it."

  The similarities (ingredients, techniques) are relevant to whether Ahmed would enjoy both cuisines.
]

=== Irrelevant Similarities

An analogy is weak if it only notes similarities irrelevant to the conclusion.

#example-box[
  *Example (Flawed Analogy)*:

  "Laotian cuisine and Latvian cuisine both come from nations whose names start with 'L'. Ahmed enjoys Latvian cuisine. If he tried Laotian cuisine, he'd probably enjoy it."

  The spelling of nation names has no relevance to cuisine enjoyment.
]

=== Strengthening and Weakening Analogies

- *Strengthen* by noting other relevant similarities
- *Weaken* by noting relevant dissimilarities

#example-box[
  *Example*:

  "Beth and Alan are children on the same block. Beth attends Tubman Primary School. Therefore, Alan probably does as well."

  *Strengthens*: Noting they're in the same grade
  *Weakens*: Noting Beth is eight years older than Alan
]

#pagebreak()

= Deductive Reasoning

== What Is Deductive Reasoning?

In a *deductive argument*, the premises are given to fully prove the conclusion. A valid deductive argument with true premises must have a true conclusion.

#warning-box[
  *Key Difference from Inductive*

  - Inductive: Conclusion is probably true
  - Deductive: Conclusion must be true (if argument is valid and premises are true)
]

== Logical Operators

A *logical operator* shows how the truth of one or more statements affects the truth of a larger statement.

=== Negation

A statement's *negation* is true when the statement is false, and vice versa.

=== Logical Conjunction

A *logical conjunction* (A and B) is true just when both statements are true.

#table(
  columns: (1fr, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Conjunction Markers*], [*Implication*],
  [A and B / not only A but also B], [A and B are both relevant],
  [although A, B / A but B / however], [Tension or surprise between A and B],
)

=== Disjunction

A *disjunction* (A or B) is true when at least one statement is true.

- *Inclusive*: True when either or both are true
- *Exclusive*: True when exactly one is true

#pagebreak()

=== Conditional

A *conditional* says that for one statement to be true, another must be true.

#table(
  columns: (1fr, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Conditional Form*], [*Meaning*],
  [If A, then B], [A would mean B is true],
  [A only if B], [A requires B],
  [Not A unless B], [A requires B],
  [B provided that A], [A would mean B is true],
)

#warning-box[
  *Critical Understanding*

  "If A then B" does NOT mean "If B then A"

  Example: "If it snows, it's below 5°C" does NOT mean "If it's below 5°C, it snows"
]

== Logical Equivalences

Two *logically equivalent* statements are always both true or both false under the same conditions.

#info-box[
  *Key Equivalences*

  - "not (A and B)" #sym.equiv "not-A or not-B"
  - "not (A or B)" #sym.equiv "not-A and not-B"
  - "if A then B" #sym.equiv "if not-B then not-A" (contrapositive)
]

#pagebreak()

== Valid and Invalid Inferences

#table(
  columns: (1fr, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Valid*], [*Invalid*],
  [A and B, therefore A], [A, therefore A and B],
  [A, therefore A or B], [A or B, therefore A],
  [if A then B; A; therefore B], [if A then B; B; therefore A],
  [if A then B; not-B; therefore not-A], [if A then B; not-A; therefore not-B],
)

#example-box[
  *Valid Example*:

  "If Ashley lives in this neighborhood, so does Tim. Ashley does live in this neighborhood. Therefore, Tim also lives in this neighborhood."

  *Invalid Example*:

  "If Ashley lives in this neighborhood, so does Tim. Tim does live in this neighborhood. Therefore, Ashley lives in this neighborhood."

  (Tim could live there even if Ashley doesn't)
]

== Quantifiers

A *quantifier* is a word for a proportion, number, or amount.

#table(
  columns: (1fr, 1fr, 1fr, 1fr),
  align: (left, left, left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*All*], [*Most*], [*Some*], [*None*],
  [all, always, any, each, every], [generally, majority, most, usually], [a few, some, sometimes, at least one], [never, no, none, not any],
)

#tip-box[
  *Key Quantifier Rules*

  - "All As are Bs" #sym.equiv "No As are not Bs"
  - "Some As are Bs" #sym.equiv "Some Bs are As"
  - "No As are Bs" #sym.equiv "No Bs are As"
  - "Some As are not Bs" #sym.equiv "Not all As are Bs"

  But: "All As are Bs" is NOT equivalent to "All Bs are As"
]

#pagebreak()

= Summary

This Fundamentals guide has covered:

*Argument Structure*:
- Premises, conclusions, and assumptions
- Marker words for each component
- Valid vs. sound arguments

*Types of Arguments*:
- Prescriptive, evaluative, interpretive
- Causal and basic factual arguments

*Other Passage Types*:
- Causal explanations
- Plans and hypotheses
- Narratives

*Inductive Reasoning*:
- Generalizations and predictions
- Sampling bias and hasty generalization
- Causal reasoning and analogies

*Deductive Reasoning*:
- Logical operators (and, or, if-then)
- Valid and invalid inferences
- Quantifiers and their relationships

Master these fundamentals before moving on to the Core topics (specific question types and strategies) and Excellence techniques (advanced optimization).