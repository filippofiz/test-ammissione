#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Language-Focused Questions_],
        [
          #figure(
            image("Logo.png", width: 2cm)
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
#let passage-box(content) = box(
  fill: uptoten-blue.lighten(95%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  content
)

#let question-box(content) = block(
  fill: white,
  stroke: 1pt + uptoten-green,
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  breakable: true,
  content
)

#let stimulus-box(content) = box(
  fill: gray.lighten(95%),
  inset: 10pt,
  radius: 4pt,
  width: 100%,
  content
)

#let source-box(title, content) = block(
  fill: uptoten-orange.lighten(90%),
  inset: 10pt,
  radius: 4pt,
  width: 100%,
  breakable: true,
  [
    #text(weight: "bold", fill: uptoten-blue)[#title]
    #v(0.5em)
    #content
  ]
)

// Title page
#align(center)[
  #v(2cm)
  #figure(
    image("Logo.png", width: 7cm)
  )
  #v(1em)
  #text(size: 28pt, weight: "bold", fill: uptoten-blue)[GMAT]
  #v(0.1em)
  #text(size: 24pt, weight: "bold", fill: uptoten-blue)[Language-Focused Questions]
  #v(0.5em)
  #text(size: 16pt, fill: uptoten-green)[Verbal Reasoning & Data Insights]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    A curated collection of GMAT questions that are particularly challenging\
    in terms of language comprehension and verbal reasoning skills.\
    \
    This material focuses on Reading Comprehension, Critical Reasoning,\
    and language-intensive Data Insights questions.
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

= Table of Contents

#v(1em)

#text(weight: "bold", size: 12pt)[Part 1: Verbal Reasoning]
- Reading Comprehension Questions
- Critical Reasoning Questions

#v(0.5em)

#text(weight: "bold", size: 12pt)[Part 2: Data Insights (Language-Heavy)]
- Data Sufficiency Questions
- Two-Part Analysis Questions
- Multi-Source Reasoning Questions

#v(0.5em)

#text(weight: "bold", size: 12pt)[Appendix: Reading Passages]

#pagebreak()

= Part 1: Verbal Reasoning

This section contains questions that test your ability to understand, analyze, and evaluate written material. These questions require strong reading comprehension and critical thinking skills.

== Reading Comprehension

Reading Comprehension questions measure your ability to understand, analyze, and apply information and concepts presented in written form.

#v(1em)


=== Passage: Florence Nightingale

#passage-box[
Two recent publications offer different assessments of the career of the famous British nurse Florence Nightingale. A book by Anne Summers seeks to debunk the idealizations and present a reality at odds with Nightingale's heroic reputation. According to Summers, Nightingale's importance during the Crimean War has been exaggerated: not until near the war's end did she become supervisor of the female nurses. Additionally, Summers writes that the contribution of the nurses to the relief of the wounded was at best marginal. The prevailing problems of military medicine were caused by army organizational practices, and the addition of a few nurses to the medical staff could be no more than symbolic. Nightingale's place in the national pantheon, Summers asserts, is largely due to the propagandistic efforts of contemporary newspaper reporters.

By contrast, the editors of a new volume of Nightingale's letters view Nightingale as a person who significantly influenced not only her own age but also subsequent generations. They highlight her ongoing efforts to reform sanitary conditions after the war. For example, when she learned that peacetime living conditions in British barracks were so horrible that the death rate of enlisted men far exceeded that of neighboring civilian populations, she succeeded in persuading the government to establish a Royal Commission on the Health of the Army. She used sums raised through public contributions to found a nurses' training hospital in London. Even in administrative matters, the editors assert, her practical intelligence was formidable: as recently as 1947 the British Army's medical services were still using the cost-accounting system she had devised in the 1860's.

I believe that the evidence of her letters supports continued respect for Nightingale's brilliance and creativity. When counseling a village schoolmaster to encourage children to use their faculties of observation, she sounds like a modern educator. Her insistence on classifying the problems of the needy in order to devise appropriate treatments is similar to the approach of modern social workers. In sum, although Nightingale may not have achieved all of her goals during the Crimean War, her breadth of vision and ability to realize ambitious projects have earned her an eminent place among the ranks of social pioneers.
]

#v(1em)


#question-box[
*Question 1* (Medium)

The passage is primarily concerned with evaluating

#v(0.5em)

(A) the importance of Florence Nightingale's innovations in the field of nursing

(B) contrasting approaches to the writing of historical biography

(C) contradictory accounts of Florence Nightingale's historical significance

(D) the quality of health care in nineteenth century England

(E) the effect of the Crimean War on developments in the field of health care

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: C]
]

#v(0.5em)


#question-box[
*Question 2* (Medium)

According to the passage, the editors of Nightingale's letters credit her with contributing to which of the following?

#v(0.5em)

(A) Improvement of the survival rate for soldiers in British Army hospitals during the Crimean War

(B) The development of a nurses' training curriculum that was far in advance of its day

(C) The increase in the number of women doctors practicing in British Army hospitals

(D) Establishment of the first facility for training nurses at a major British university

(E) The creation of an organization for monitoring the peacetime living conditions of British soldiers

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: E]
]

#v(0.5em)


#question-box[
*Question 3* (Medium)

The passage suggests which of the following about Nightingale's relationship with the British public of her day?

#v(0.5em)

(A) She was highly respected, her projects receiving popular and governmental support.

(B) She encountered resistance both from the army establishment and the general public.

(C) She was supported by the working classes and opposed by the wealthier classes.

(D) She was supported by the military establishment but had to fight the governmental bureaucracy.

(E) After initially being received with enthusiasm, she was quickly forgotten.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: A]
]

#v(0.5em)


#question-box[
*Question 4* (Medium)

With which of the following statements regarding the differing interpretations of Nightingale's importance would the author most likely agree?

#v(0.5em)

(A) Summers misunderstood both the importance of Nightingale's achievements during the Crimean War and her subsequent influence on British policy.

(B) The editors of Nightingale's letters made some valid points about her practical achievements, but they still exaggerated her influence on subsequent generations.

(C) Although Summers' account of Nightingale's role in the Crimean War may be accurate, she ignored evidence of Nightingale's subsequent achievement that suggests that her reputation as an eminent social reformer is well deserved.

(D) The editors of Nightingale's letters mistakenly propagated the outdated idealization of Nightingale that only impedes attempts to arrive at a balanced assessment of her true role.

(E) The evidence of Nightingale's letters supports Summers' conclusions both about Nightingale's activities and about her influence.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: C]
]

#v(0.5em)


#question-box[
*Question 5* (Medium)

In the last paragraph, the author is primarily concerned with

#v(0.5em)

(A) summarizing the arguments about Nightingale presented in the first two paragraphs

(B) refuting the view of Nightingale's career presented in the preceding paragraph

(C) analyzing the weaknesses of the evidence presented elsewhere in the passage

(D) citing evidence to support a view of Nightingale's career

(E) correcting a factual error occurring in one of the works under review

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: D]
]

#v(0.5em)


#pagebreak()

=== Passage: Meteor Streams

#passage-box[
A meteor stream is composed of dust particles that have been ejected from a parent comet at a variety of velocities. These particles follow the same orbit as the parent comet, but due to their differing velocities they slowly gain on or fall behind the disintegrating comet until a shroud of dust surrounds the entire cometary orbit. Astronomers have hypothesized that a meteor stream should broaden with time as the dust particles' individual orbits are perturbed by planetary gravitational fields. A recent computer-modeling experiment tested this hypothesis by tracking the influence of planetary gravitation over a projected 5,000-year period on the positions of a group of hypothetical dust particles. In the model, the particles were randomly distributed throughout a computer simulation of the orbit of an actual meteor stream, the Geminid. The researcher found, as expected, that the computer-model stream broadened with time. Conventional theories, however, predicted that the distribution of particles would be increasingly dense toward the center of a meteor stream. Surprisingly, the computer-model meteor stream gradually came to resemble a thick-walled, hollow pipe.

Whenever the Earth passes through a meteor stream, a meteor shower occurs. Moving at a little over 1,500,000 miles per day around its orbit, the Earth would take, on average, just over a day to cross the hollow, computer-model Geminid stream if the stream were 5,000 years old. Two brief periods of peak meteor activity during the shower would be observed, one as the Earth entered the thick-walled "pipe" and one as it exited. There is no reason why the Earth should always pass through the stream's exact center, so the time interval between the two bursts of activity would vary from one year to the next.

Has the predicted twin-peaked activity been observed for the actual yearly Geminid meteor shower? The Geminid data between 1970 and 1979 show just such a bifurcation, a secondary burst of meteor activity being clearly visible at an average of 19 hours (1,200,000 miles) after the first burst. The time intervals between the bursts suggest the actual Geminid stream is about 3,000 years old.
]

#v(1em)


#question-box[
*Question 6* (Medium)

The author states that the research described in the first paragraph was undertaken in order to

#v(0.5em)

(A) determine the age of an actual meteor stream

(B) identify the various structural features of meteor streams

(C) explore the nature of a particularly interesting meteor stream

(D) test the hypothesis that meteor streams become broader as they age

(E) show that a computer model could help in explaining actual astronomical data

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: D]
]

#v(0.5em)


#question-box[
*Question 7* (Medium)

It can be inferred from the passage that which of the following would most probably be observed during the Earth's passage through a meteor stream if the conventional theories mentioned in the highlighted text were correct?

#v(0.5em)

(A) Meteor activity would gradually increase to a single, intense peak, and then gradually decline.

(B) Meteor activity would be steady throughout the period of the meteor shower.

(C) Meteor activity would rise to a peak at the beginning and at the end of the meteor shower.

(D) Random bursts of very high meteor activity would be interspersed with periods of very little activity.

(E) In years in which the Earth passed through only the outer areas of a meteor stream, meteor activity would be absent.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: A]
]

#v(0.5em)


#question-box[
*Question 8* (Medium)

According to the passage, why do the dust particles in a meteor stream eventually surround a comet's original orbit?

#v(0.5em)

(A) They are ejected by the comet at differing velocities.

(B) Their orbits are uncontrolled by planetary gravitational fields.

(C) They become part of the meteor stream at different times.

(D) Their velocity slows over time.

(E) Their ejection velocity is slower than that of the comet.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: A]
]

#v(0.5em)


#question-box[
*Question 9* (Medium)

The passage suggests that which of the following is a prediction concerning meteor streams that can be derived from both the conventional theories mentioned in the highlighted text and the new computer derived theory?

#v(0.5em)

(A) Dust particles in a meteor stream will usually be distributed evenly throughout any cross section of the stream.

(B) The orbits of most meteor streams should cross the orbit of the Earth at some point and give rise to a meteor shower.

(C) Over time the distribution of dust in a meteor stream will usually become denser at the outside edges of the stream than at the center.

(D) Meteor showers caused by older meteor streams should be, on average, longer in duration than those caused by very young meteor streams.

(E) The individual dust particles in older meteor streams should be, on average, smaller than those that compose younger meteor streams.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: D]
]

#v(0.5em)


#question-box[
*Question 10* (Medium)

Which of the following is an assumption underlying the last sentence of the passage?

#v(0.5em)

(A) In each of the years between 1970 and 1979, the Earth took exactly 19 hours to cross the Geminid meteor stream.

(B) The comet associated with the Geminid meteor stream has totally disintegrated.

(C) The Geminid meteor stream should continue to exist for at least 5,000 years.

(D) The Geminid meteor stream has not broadened as rapidly as the conventional theories would have predicted.

(E) The computer-model Geminid meteor stream provides an accurate representation of the development of the actual Geminid stream.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: E]
]

#v(0.5em)


#pagebreak()

=== Passage: Early Trading Companies

#passage-box[
The modern multinational corporation is described as having originated when the owner-managers of nineteenth-century British firms carrying on international trade were replaced by teams of salaried managers organized into hierarchies. Increases in the volume of transactions in such firms are commonly believed to have necessitated this structural change. Nineteenth-century inventions like the steamship and the telegraph, by facilitating coordination of managerial activities, are described as key factors. Sixteenth- and seventeenth-century chartered trading companies, despite the international scope of their activities, are usually considered irrelevant to this discussion: the volume of their transactions is assumed to have been too low and the communications and transport of their day too primitive to make comparisons with modern multinationals interesting.

In reality, however, early trading companies successfully purchased and outfitted ships, built and operated offices and warehouses, manufactured trade goods for use abroad, maintained trading posts and production facilities overseas, procured goods for import, and sold those goods both at home and in other countries. The large volume of transactions associated with these activities seems to have necessitated hierarchical management structures well before the advent of modern communications and transportation. For example, in the Hudson's Bay Company, each far-flung trading outpost was managed by a salaried agent, who carried out the trade with the Native Americans, managed day-to-day operations, and oversaw the post's workers and servants. One chief agent, answerable to the Court of Directors in London through the correspondence committee, was appointed with control over all of the agents on the bay.

The early trading companies did differ strikingly from modern multinationals in many respects. They depended heavily on the national governments of their home countries and thus characteristically acted abroad to promote national interests. Their top managers were typically owners with a substantial minority share, whereas senior managers' holdings in modern multinationals are usually insignificant. They operated in a preindustrial world, grafting a system of capitalist international trade onto a premodern system of artisan and peasant production. Despite these differences, however, early trading companies organized effectively in remarkably modern ways and merit further study as analogues of more modern structures.
]

#v(1em)


#question-box[
*Question 11* (Medium)

The author's main point is that

#v(0.5em)

(A) modern multinationals originated in the sixteenth and seventeenth centuries with the establishment of chartered trading companies

(B) the success of early chartered trading companies, like that of modern multinationals, depended primarily on their ability to carry out complex operations

(C) early chartered trading companies should be more seriously considered by scholars studying the origins of modern multinationals

(D) scholars are quite mistaken concerning the origins of modern multinationals

(E) the management structures of early chartered trading companies are fundamentally the same as those of modern multinationals

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: C]
]

#v(0.5em)


#question-box[
*Question 12* (Medium)

It can be inferred from the passage that the author would characterize the activities engaged in by early chartered trading companies as being

#v(0.5em)

(A) complex enough in scope to require a substantial amount of planning and coordination on the part of management

(B) too simple to be considered similar to those of a modern multinational corporation

(C) as intricate as those carried out by the largest multinational corporations today

(D) often unprofitable due to slow communications and unreliable means of transportation

(E) hampered by the political demands imposed on them by the governments of their home countries

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: A]
]

#v(0.5em)


#question-box[
*Question 13* (Medium)

The author lists the various activities of early chartered trading companies in order to

#v(0.5em)

(A) analyze the various ways in which these activities contributed to changes in management structure in such companies

(B) demonstrate that the volume of business transactions of such companies exceeded that of earlier firms

(C) refute the view that the volume of business undertaken by such companies was relatively low

(D) emphasize the international scope of these companies' operations

(E) support the argument that such firms coordinated such activities by using available means of communication and transport

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: C]
]

#v(0.5em)


#question-box[
*Question 14* (Medium)

With which of the following generalizations regarding management structures would the author of the passage most probably agree?

#v(0.5em)

(A) Hierarchical management structures are the most efficient management structures possible in a modern context.

(B) Firms that routinely have a high volume of business transactions find it necessary to adopt hierarchical management structures.

(C) Hierarchical management structures cannot be successfully implemented without modern communications and transportation.

(D) Modern multinational firms with a relatively small volume of business transactions usually do not have hierarchically organized management structures.

(E) Companies that adopt hierarchical management structures usually do so in order to facilitate expansion into foreign trade.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: B]
]

#v(0.5em)


#question-box[
*Question 15* (Medium)

The passage suggests that modern multinationals differ from early chartered trading companies in that

#v(0.5em)

(A) the top managers of modern multinationals own stock in their own companies rather than simply receiving a salary

(B) modern multinationals depend on a system of capitalist international trade rather than on less modern trading systems

(C) modern multinationals have operations in a number of different foreign countries rather than merely in one or two

(D) the operations of modern multinationals are highly profitable despite the more stringent environmental and safety regulations of modern governments

(E) the overseas operations of modern multinationals are not governed by the national interests of their home countries

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: E]
]

#v(0.5em)


#pagebreak()

== Critical Reasoning

Critical Reasoning questions test your ability to make arguments, evaluate arguments, and formulate or evaluate a plan of action.

#v(1em)


#question-box[
*Question 16* (Medium - Critical Reasoning)

#stimulus-box[
Correctly measuring the productivity of service workers is complex. Consider, for example, postal workers: they are often said to be more productive if more letters are delivered per postal worker. But is this really true? What if more letters are lost or delayed per worker at the same time that more are delivered?
]

#v(0.5em)

The objection implied above to the productivity measure described is based on doubts about the truth of which of the following statements?

#v(0.5em)

(A) Postal workers are representative of service workers in general.

(B) The delivery of letters is the primary activity of the postal service.

(C) Productivity should be ascribed to categories of workers, not to individuals.

(D) The quality of services rendered can appropriately be ignored in computing productivity.

(E) The number of letters delivered is relevant to measuring the productivity of postal workers.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: D]
]

#v(0.5em)


#question-box[
*Question 17* (Medium - Critical Reasoning)

#stimulus-box[
Roland: The alarming fact is that 90 percent of the people in this country now report that they know someone who is unemployed.
Sharon: But a normal, moderate level of unemployment is 5 percent, with 1 out of 20 workers unemployed. So at any given time if a person knows approximately 50 workers, 1 or more will very likely be unemployed.
]

#v(0.5em)

Sharon's argument is structured to lead to which of the following as a conclusion?

#v(0.5em)

(A) The fact that 90% of the people know someone who is unemployed is not an indication that unemployment is abnormally high.

(B) The current level of unemployment is not moderate.

(C) If at least 5% of workers are unemployed, the result of questioning a representative group of people cannot be the percentage Roland cites.

(D) It is unlikely that the people whose statements Roland cites are giving accurate reports.

(E) If an unemployment figure is given as a certain percent, the actual percentage of those without jobs is even higher.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: A]
]

#v(0.5em)


#question-box[
*Question 18* (Medium - Critical Reasoning)

#stimulus-box[
In Asia, where palm trees are non-native, the trees' flowers have traditionally been pollinated by hand, which has kept palm fruit productivity unnaturally low. When weevils, known to be efficient pollinators of palm flowers, were introduced into Asia in 1980, palm fruit productivity increased—by up to 50 percent in some areas—but then decreased sharply in 1984.
]

#v(0.5em)

Which of the following statements, if true, would best explain the 1984 decrease in productivity?

#v(0.5em)

(A) Prices for palm fruit fell between 1980 and 1984 following the rise in production and a concurrent fall in demand.

(B) Imported trees are often more productive than native trees because the imported ones have left behind their pests and diseases in their native lands.

(C) Rapid increases in productivity tend to deplete trees of nutrients needed for the development of the fruit-producing female flowers.

(D) The weevil population in Asia remained at approximately the same level between 1980 and 1984.

(E) Prior to 1980, another species of insect pollinated the Asian palm trees, but not as efficiently as the species of weevil that was introduced in 1980.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: C]
]

#v(0.5em)


#question-box[
*Question 19* (Medium - Critical Reasoning)

#stimulus-box[
According to the Tristate Transportation Authority, making certain improvements to the main commuter rail line would increase ridership dramatically. The authority plans to finance these improvements over the course of five years by raising automobile tolls on the two highway bridges along the route the rail line serves. Although the proposed improvements are indeed needed, the authority's plan for securing the necessary funds should be rejected because it would unfairly force drivers to absorb the entire cost of something from which they receive no benefit.
]

#v(0.5em)

Which of the following, if true, would cast the most doubt on the effectiveness of the authority's plan to finance the proposed improvements by increasing bridge tolls?

#v(0.5em)

(A) Before the authority increases tolls on any of the area bridges, it is required by law to hold public hearings at which objections to the proposed increase can be raised.

(B) Whenever bridge tolls are increased, the authority must pay a private contractor to adjust the automated toll-collecting machines.

(C) Between the time a proposed toll increase is announced and the time the increase is actually put into effect, many commuters buy more tokens than usual to postpone the effects of the increase.

(D) When tolls were last increased on the two bridges in question, almost 20 percent of the regular commuter traffic switched to a slightly longer alternative route that has since been improved.

(E) The chairman of the authority is a member of the Tristate Automobile Club that has registered strong opposition to the proposed toll increase.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: D]
]

#v(0.5em)


#question-box[
*Question 20* (Medium - Critical Reasoning)

#stimulus-box[
Reviewer: The book Art's Decline argues that European painters today lack skills that were common among European painters of preceding centuries. In this the book must be right, since its analysis of 100 paintings, 50 old and 50 contemporary, demonstrates convincingly that none of the contemporary paintings are executed as skillfully as the older paintings.
]

#v(0.5em)

Which of the following points to the most serious logical flaw in the reviewer's argument?

#v(0.5em)

(A) The paintings chosen by the book's author for analysis could be those that most support the book's thesis.

(B) There could be criteria other than the technical skill of the artist by which to evaluate a painting.

(C) The title of the book could cause readers to accept the book's thesis even before they read the analysis of the paintings that supports it.

(D) The particular methods currently used by European painters could require less artistic skill than do methods used by painters in other parts of the world.

(E) A reader who was not familiar with the language of art criticism might not be convinced by the book's analysis of the 100 paintings.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: A]
]

#v(0.5em)


#question-box[
*Question PT1-1* (Medium - Critical Reasoning)

#stimulus-box[
Archaeologists have long debated what caused the neolithic revolution—the major changes that occurred when large numbers of prehistoric human beings began to give up the nomadic life in favor of settling in villages and farming. One view, the "marginality hypothesis," maintains that early human beings would have lived in regions where the hunting and gathering were best. As populations increased, however, so would competition for resources, leading some people to move to neighboring regions, where domesticating plants and animals would be necessary for survival.
]

#v(0.5em)

Which of the following, if true, would present the most serious challenge to the marginality hypothesis?

#v(0.5em)

(A) The earliest farmers subsisted on diets that consisted of roughly equal proportions of food gathered through agriculture and hunting-and-gathering activities.

(B) In the earliest agricultural settlements, the community's crops were often located many miles away from its members' living quarters.

(C) Some of the regions that were optimal for hunting-and-gathering activity would not have been optimal for plant and animal domestication.

(D) Some archaeologists believe that, 3,000 years prior to the advent of agriculture, some humans lived in year-round, permanent settlements but supported themselves by hunting and gathering.

(E) Evidence suggests that, at the beginning of the neolithic revolution, regions where plant and animal domestication began had optimal conditions for hunting and gathering.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: E]
]

#v(0.5em)


#question-box[
*Question PT1-2* (Medium - Critical Reasoning)

#stimulus-box[
To facilitate development of telephone service in a rural province, the national government pays the provincial government a subsidy for each long-distance call going into the province. A corporation has offered to base a national long-distance telephone service in the province, allowing long-distance calls to be made without any charge to the callers, if the provincial government splits its subsidy with the corporation. The corporation argues that since all calls would be routed through the province, the provincial government would profit greatly from this arrangement.
]

#v(0.5em)

The corporation's prediction about the effects its plan would have, if adopted, relies on which of the following assumptions?

#v(0.5em)

(A) Without the plan, all long-distance telephone service in the province would involve at least some charges to callers.

(B) The national government's subsidy would apply not only for calls made to phones in the province, but also to at least some long-distance calls that are merely routed through the province.

(C) The provincial government would be interested in splitting its subsidy with the corporation only if doing so would yield significant profits for the province.

(D) The national government's subsidy for any long-distance call into the province is calculated as a fixed percentage of the charge to the caller.

(E) In order for the arrangement to be profitable for the province, the province must receive more from the increased subsidy than it pays the corporation.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: B]
]

#v(0.5em)


#question-box[
*Question PT1-6* (Easy - Critical Reasoning)

#stimulus-box[
An archaeological site can be excavated only once, and many sites excavated in the past would have yielded far more information if they had been excavated using current technologies. These considerations have led some to argue that sites that could yield valuable information should not be excavated now since new, archaeologically valuable technologies will almost certainly be developed in the future. Insofar as technological progress is unlikely to stop, consistently following this recommendation over time would #box(width: 5em, line(length: 100%)).
]

#v(0.5em)

Which of the following most logically completes the reasoning?

#v(0.5em)

(A) maximize the archaeologically valuable information obtained through technological advances

(B) ensure that virtually no archaeologically valuable information at all would be obtained

(C) guarantee that the number of potential archaeological sites will continue to increase

(D) encourage archaeologists to make better use of the latest archaeologically valuable technology

(E) have the additional benefit of encouraging the development of new archaeologically valuable technologies

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: B]
]

#v(0.5em)


#question-box[
*Question PT1-7* (Medium - Critical Reasoning)

#stimulus-box[
Economist: Sales taxes do not provide a fair alternative to income taxes. Low-income households must spend nearly all of their disposable income on consumption items they need to live, while high-income households can afford to buy those items and then put a substantial amount of their earnings into savings. Hence a sales tax #box(width: 5em, line(length: 100%)).
]

#v(0.5em)

Which of the following most logically completes the argument?

#v(0.5em)

(A) could result in households with different incomes paying different amounts of taxes

(B) could tax a smaller percentage of the earnings of high-income households than of low-income households

(C) would put a disproportionately high burden on the purchasers of the most expensive consumption items

(D) should be applied only to the wealthiest households

(E) should not be used to tax any consumption items

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: B]
]

#v(0.5em)


#pagebreak()

= Part 2: Data Insights (Language-Heavy)

This section contains Data Insights questions that are particularly demanding in terms of language comprehension. These questions require careful reading and logical analysis of complex verbal information.

== Data Sufficiency Questions

#v(1em)


#question-box[
*Question 2* (Medium - Data Sufficiency)

A stretch of highway, Segment X, has no traffic signals and comprises three speed zones: One with a speed limit of 55 miles per hour (mph) followed by a 75-mph zone and a second 55-mph zone. Leslie is at a certain point on Segment X, driving at a speed she will exactly maintain until after she has reached the end of Segment X and has entered the next highway segment. Is she driving faster than 55 mph?

#v(0.5em)

*(1)* Leslie's speed is at least 5 mph below the speed limit that currently applies to her.

*(2)* Leslie will reach the end of Segment X without ever exceeding any speed limits.

#v(0.5em)

(A) Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.

(B) Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.

(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.

(D) EACH statement ALONE is sufficient.

(E) Statements (1) and (2) TOGETHER are NOT sufficient.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: B]
]

#v(0.5em)


#question-box[
*Question 3* (Medium - Data Sufficiency)

Simon and Tara, who live in Neighborhood Z, wish to watch a movie together in a theater tonight. Simon only watches a movie in a theater if it is close to home and is of one of three genres: P, Q, and R. Tara does not watch movies of genres R or T in theaters. All movies playing in town tonight are of genre P, Q, or T. Will Simon and Tara watch a movie together in a theater tonight?

#v(0.5em)

*(1)* All movies of genre P or Q playing in town tonight are in theaters far from Neighborhood Z.

*(2)* All movies in theaters close to Neighborhood Z are of genre T.

#v(0.5em)

(A) Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.

(B) Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.

(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.

(D) EACH statement ALONE is sufficient.

(E) Statements (1) and (2) TOGETHER are NOT sufficient.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: D]
]

#v(0.5em)


#question-box[
*Question 7* (Hard - Data Sufficiency)

The Smiths take their children to a certain amusement park on exactly one Saturday every calendar month. Today is the 1st of July. Did the Smiths and their children make a trip to the amusement park on one of the past three days?

#v(0.5em)

*(1)* The Smiths made their June trip to the amusement park on one of the past seven days.

*(2)* The 23rd of last month was a Sunday.

#v(0.5em)

(A) Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.

(B) Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.

(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.

(D) EACH statement ALONE is sufficient.

(E) Statements (1) and (2) TOGETHER are NOT sufficient.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: C]
]

#v(0.5em)


#question-box[
*Question 10* (Hard - Data Sufficiency)

Each time Meg has visited a certain ice cream parlor with friends, she has bought chocolate ice cream, unless half or a majority of her accompanying friends all bought the same flavor of ice cream and that flavor was not chocolate—in which case Meg bought that flavor. Yesterday, Meg visited the parlor with four friends: Ann, Bart, Cathy, and Derek. Ann bought chocolate ice cream. Did Meg buy chocolate ice cream?

#v(0.5em)

*(1)* Bart bought either vanilla or chocolate ice cream, and Cathy bought neither vanilla nor chocolate ice cream.

*(2)* Derek did not buy the same flavor as Bart.

#v(0.5em)

(A) Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.

(B) Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.

(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.

(D) EACH statement ALONE is sufficient.

(E) Statements (1) and (2) TOGETHER are NOT sufficient.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: E]
]

#v(0.5em)


#pagebreak()

== Two-Part Analysis Questions

Two-Part Analysis questions present a scenario and ask you to make two related selections. These questions test your ability to analyze complex verbal information and draw logical conclusions.

#v(1em)


#question-box[
*Question 20* (Medium - Two-Part Analysis)

#stimulus-box[
The following excerpt from a fictitious science news report discusses a fictitious type of location called a morefa.

For zoologists studying the behavior of certain species of birds, the critical importance of observing the birds in those species' morefa during the annual breeding season is obvious. Such observation allows researchers to study not only the courtship displays of many different individuals within a species, but also the species' social hierarchy. Moreover, since some species repeatedly return to the same morefa, researchers can study changes in group dynamics from year to year. The value of observing a morefa when the birds are not present, however—such as prior to their arrival or after they have abandoned the area to establish their nests—is only now becoming apparent.

Based on the definition of the imaginary word morefa that can be inferred from the paragraph above, which of the following activities of a bird species must happen in a location for that location to be the species' morefa, and which must NOT happen in a location for that location to be the species' morefa?
]

#v(0.5em)

*Column 1:* Must happen in the location | *Column 2:* Must not happen in the location

#v(0.3em)

Options:

- Sleeping

- Occupying the location multiple times

- Establishing nests

- Gathering together with members of their own species

- Territorial competition with members of different species

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: Column 1: Gathering together with members of their own species | Column 2: Establishing nests]
]

#v(0.5em)


#question-box[
*Question 21* (Hard - Two-Part Analysis)

#stimulus-box[
A literature department at a small university in an English-speaking country is organizing a two-day festival in which it will highlight the works of ten writers who have been the subjects of recent scholarly work by the faculty. Five writers will be featured each day. To reflect the department's strengths, the majority of writers scheduled on one of the days will be writers whose primary writing language is not English. On the other day of the festival, at least four of the writers will be women. Neither day should have more than two writers from the same country. Departmental members have already agreed on a schedule for eight of the writers. That schedule showing names, along with each writer's primary writing language and country of origin, is shown.

Day 1:
Achebe (male, English, Nigeria)
Weil (female, French, France)
Gavalda (female, French, France)
Barrett Browning (female, English, UK)

Day 2:
Rowling (female, English, UK)
Austen (female, English, UK)
Ocantos (male, Spanish, Argentina)
Lu Xun (male, Chinese, China)

Select a writer who could be added to the schedule for either day. Then select a writer who could be added to the schedule for neither day.
]

#v(0.5em)

*Column 1:* Either day | *Column 2:* Neither day

#v(0.3em)

Options:

- LeGuin (female, English, USA)

- Longfellow (male, English, USA)

- Murasaki (female, Japanese, Japan)

- Colette (female, French, France)

- Vargas Llosa (male, Spanish, Peru)

- Zola (male, French, France)

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: Column 1: Murasaki (female, Japanese, Japan) | Column 2: Longfellow (male, English, USA)]
]

#v(0.5em)


#question-box[
*Question 17* (Medium - Two-Part Analysis)

#stimulus-box[
Agro Enterprises currently uses an antiquated database system. Upgrading to a standard contemporary system would cost a moderate amount, whereas upgrading to an innovative, cutting-edge system would cost much more. A standard contemporary system is sufficiently energy-efficient that it would pay for itself in 10 years, but no sooner, as compared to the cost of keeping the current system. The annual savings in operational costs offered by the innovative system would cause such a system to pay for its purchase and installation in 5 years, but it would be no more energy-efficient than the current system. Or the company could just keep the current system. Any of the three systems would be able to function for the next 20 years.

Select Standard contemporary system for the option that the passage most strongly suggests is true of the standard contemporary system, and select Innovative, cutting-edge system for the option that the passage most strongly suggests is true of the innovative cutting-edge system.
]

#v(0.5em)

*Column 1:* Standard contemporary system | *Column 2:* Innovative, cutting-edge system

#v(0.3em)

Options:

- Costs Agro the greatest total amount of money during 11 years of operation

- Less energy-efficient than either of the other two database systems

- The most energy-efficient of the three database systems

- Costs Agro, on average, less per year to operate than either of the other systems

- Costs Agro, on average, more per year to operate than either of the other systems

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: Column 1: The most energy-efficient of the three database systems | Column 2: Costs Agro, on average, less per year to operate than either of the other systems]
]

#v(0.5em)


#question-box[
*Question 18* (Medium - Two-Part Analysis)

#stimulus-box[
Administrator P: Government-funded research should always be accessible to the public. A certain government fund is designed to support research in the humanities and natural sciences. Therefore, the fund should have a requirement that all published work that it supports be open access (i.e., provided free of charge, with no restrictions, to people with Internet access).

Administrator Q: There are many high-quality, open-access venues for published works in the natural sciences, but very few in the humanities. The requirement would most likely have bad results. That is, most of the fund would be directed toward research in natural science and it would prevent a significant amount of fund-supported, humanities research from being published in high-quality venues.

From among the options below, select for Response to Administrator Q and for Reply to that response two statements such that the first, if true, most strongly undermines Administrator Q's argument and the second, if true, is Administrator Q's strongest reply to that response.
]

#v(0.5em)

*Column 1:* Response to Administrator Q | *Column 2:* Reply to that response

#v(0.3em)

Options:

- Although it may result in decreased support for research in certain disciplines, government-funded research should not be accessible to the public.

- The humanities are unlikely to develop high-quality open-access journals, even if resources are dedicated to supporting them.

- If research were open access, more individuals would read the research than would read it otherwise.

- In general, requiring that research be published in open-access journals will likely result in new open-access journals in the field.

- For some disciplines, open-access journals tend to be of lower quality than other journals.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: Column 1: In general, requiring that research be published in open-access journals will likely result in new open-access journals in the field. | Column 2: For some disciplines, open-access journals tend to be of lower quality than other journals.]
]

#v(0.5em)


#question-box[
*Question 19* (Easy - Two-Part Analysis)

#stimulus-box[
Art historian: Unlike many artistic traditions that sought to depict plants native to the local area in a seasonally appropriate way (for example, depicting scenes of spring with the plants in the appropriate stages of development for that season), seventeenth-century Dutch artists specializing in flower paintings almost exclusively chose to depict exotic species of flowers from outside the local area. Painting such species was worthwhile primarily because the art-buying public had developed a strong preference for images of the exotic. The great botanical centers of the time gave the artists direct access to such flowers, which the artists would freely combine in a single painting, regardless of whether the combined species occurred together in the wild, and depicted each in full bloom, regardless of whether those species bloomed at the same time in nature.

Statement: The art historian makes the point that the species of flowers these Dutch artists chose to paint were #text(weight: "bold")[(1)] largely because the species were #text(weight: "bold")[(2)].

Select for 1 and for 2 the options that complete the statement so that it is most strongly supported by the information provided.
]

#v(0.5em)

*Column 1:* 1 | *Column 2:* 2

#v(0.3em)

Options:

- native to the local area

- seasonally appropriate

- exotic

- accessible

- worth painting

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: Column 1: worth painting | Column 2: exotic]
]

#v(0.5em)


#pagebreak()

== Multi-Source Reasoning Questions

Multi-Source Reasoning questions present information from multiple sources (tabs) and require you to synthesize information across sources to answer questions.

#v(1em)


#question-box[
*Questions 13-17* (Medium-hard - Multi-Source Reasoning)

The following sources provide information about Island Museum's artifact analysis techniques and the Kaxna collection.

#v(0.5em)

#source-box[Techniques][
Island Museum analyzes historical artifacts using one or more techniques described below---all but one of which is performed by an outside laboratory---to obtain specific information about an object's creation. For each type of material listed, the museum uses only the technique described:

*Animal teeth or bones:* The museum performs isotope ratio mass spectrometry (IRMS) in-house to determine the ratios of chemical elements present, yielding clues as to the animal's diet and the minerals in its water supply.

*Metallic ores or alloys:* Inductively coupled plasma mass spectrometry (ICP-MS) is used to determine the ratios of traces of metallic isotopes present, which differ according to where the sample was obtained.

*Plant matter:* While they are living, plants absorb carbon-14, which decays at a predictable rate after death; thus radiocarbon dating is used to estimate a plant's date of death.

*Fired-clay objects:* Thermoluminescence (TL) dating is used to provide an estimate of the time since clay was fired to create the object.
]

#v(0.3em)

#source-box[Artifacts][
Island Museum has acquired a collection of metal, fired clay, stone, bone, and wooden artifacts found on the Kaxna Islands, and presumed to be from the Kaxna Kingdom of 1250-850 BC. Researchers have mapped all the mines, quarries, and sources of clay on Kaxna and know that wooden artifacts of that time were generally created within 2 years after tree harvest. There is, however, considerable uncertainty as to whether these artifacts were actually created on Kaxna.

In analyzing these artifacts, the museum assumes that radiocarbon dating is accurate to approximately plus or minus 200 years and TL dating is accurate to approximately plus or minus 100 years.
]

#v(0.3em)

#source-box[Budget][
For outside laboratory tests, the museum's first-year budget for the Kaxna collection allows unlimited IRMS testing, and a total of 7,000 USD---equal to the cost of 4 TL tests plus 15 radiocarbon tests, or the cost of 40 ICP-MS tests---for all other tests. For each technique applied by an outside lab, the museum is charged a fixed price per artifact.
]

#v(0.3em)

#v(0.5em)
*Sample Questions:*


- Bronze statue of a deer: Can a range of dates for the object's creation be obtained using one of the techniques in the manner described?

- Fired-clay pot: Can a range of dates for the object's creation be obtained using one of the techniques in the manner described?

- Wooden statue of a warrior: Can a range of dates for the object's creation be obtained using one of the techniques in the manner described?

]


#pagebreak()

= Additional Reading Passages

== Passage: Trade Promotions

#passage-box[
A primary concern among manufacturers polled in a 1998 survey was the inefficiency of trade promotions—inducements offered by manufacturers to retailers to encourage them to reduce retail prices temporarily so as to boost sales volume. Such inducements may include temporarily reduced costs of goods, free goods, or display allowances (fees manufacturers pay retailers to encourage them to allocate premium shelf space to a product). At the heart of manufacturers' dissatisfaction lies concern regarding widespread retailer opportunism. Although consumers know from experience the approximate frequency of promotional pricing, they do not typically have complete information about ongoing trade promotions in a given period, so retailers can profit by sometimes choosing not to pass along their own savings to their customers. Inefficient use of trade promotion dollars has prompted several large manufacturers to adopt an "everyday low price" policy for their goods, but at least one diaper manufacturer found it had to revert to its former pricing strategies in the face of increasing promotional competition from other brands. Adopting an alternative approach, some manufacturers have themselves advertised ongoing promotions. By informing at least some customers about promotions, manufacturers believe they can regulate retailer opportunism by increasing customers' propensity to search for discounted prices.
]

#v(1em)


#question-box[
*Question PT1-3* (Medium)

According to the passage, some manufacturers have attempted to counteract retailer opportunism by

#v(0.5em)

(A) selling goods to retailers at reduced prices

(B) offering more frequent but less potentially lucrative promotions

(C) alerting consumers when promotions are happening

(D) offering certain goods to retailers at no charge

(E) paying retailers fees to prominently display certain goods

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: C]
]

#v(0.5em)


#question-box[
*Question PT1-4* (Medium)

It can be inferred that the diaper manufacturer mentioned in the highlighted text of the passage discovered that consumers

#v(0.5em)

(A) were unlikely to continue to purchase a brand that had a lower regular price in the face of temporary discounts on diapers of other brands

(B) tended to equate higher prices on diapers with higher quality, and so were willing to pay full price for expensive brands

(C) usually became loyal to a particular brand of diaper and would purchase that brand whether or not it was on sale

(D) bought fewer diapers per shopping trip when they knew the diapers would always be available at the same "everyday low price"

(E) were more willing to search for discounted prices on diapers than for other products typically available in the same stores

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: A]
]

#v(0.5em)


#question-box[
*Question PT1-5* (Easy)

The author of the passage would be most likely to agree with which of the following statements about consumers' knowledge of retail pricing strategies?

#v(0.5em)

(A) Consumers believe that retailers do not have the option to charge full price for items that manufacturers tell them to discount.

(B) Consumers assume that a retailer who offers discounts on some items will inflate the prices of other items to compensate for it.

(C) Consumers are aware that they can expect to find familiar brands available at discounted prices at fairly predictable intervals.

(D) Consumers believe that retailers must pay the same price for goods whether or not they offer them at a discount to customers.

(E) Consumers often do not realize that price discounts typically originate from manufacturers rather than individual retailers.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: C]
]

#v(0.5em)


#pagebreak()

== Passage: Carbon and the Northern Woodlands

#passage-box[
Atmospheric carbon dioxide (CO2) has been increasing since 1700, but the amount of CO2 produced in that time by burning fossil fuels should have resulted in a much greater increase than has been observed. Plant ecologist Allen Auclair claims that the woodlands of the Northern Hemisphere have been acting as a carbon sink, absorbing carbon from the atmosphere and turning it into wood. Auclair uses measurements of factors affecting the area and density of a forest—such as logging, fires, and pests—and estimates of tree growth rates to argue that increases in the growth rates of individual trees in these forests since 1920 have created a large volume of wood that accounts for the missing carbon.

To determine whether the woodlands as a whole are releasing or absorbing carbon, the volume of wood added to the woodlands must be compared with the wood lost. Auclair's analysis of the past hundred years shows the woodlands changing from a carbon source to a carbon sink. Before 1890, northern woodlands were a source of CO2 mainly because of forest fires and logging. Such deforestation releases CO2 because debris from the forest floor rots more quickly when the trees are cleared. After 1920, the steep increase in tree growth rates surpassed the losses stemming from fire and logging, turning the northern forests from a carbon source into a carbon sink and storing CO2 from fossil fuel over the next fifty years.
]

#v(1em)


#question-box[
*Question PT1-8* (Hard)

It can be inferred from the passage that Auclair's claim about carbon and the northern woodlands would be most seriously undermined if which of the following were true?

#v(0.5em)

(A) The northern woodlands functioned as a carbon source rather than as a carbon sink prior to 1890.

(B) The rate of tree growth in the northern woodlands increased throughout the twentieth century.

(C) The northern woodlands absorbed larger amounts of carbon after 1920 than they had in previous years.

(D) During the twentieth century, the total volumes of wood lost to rot or fire in the northern woodlands exceeded increases in wood volume.

(E) The northern woodlands lost trees to forest fires and logging in the early twentieth century.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: D]
]

#v(0.5em)


#question-box[
*Question PT1-9* (Medium)

It can be inferred from the passage that the northern woodlands would be more likely to function as a carbon source if which of the following were to occur?

#v(0.5em)

(A) Vegetation regrowing on land from which trees had been cleared grew back fast enough to absorb as much CO2 as was released by deforestation.

(B) Debris from the forest floor rotted less quickly after the rate of tree growth increased.

(C) A significant increase in the number of pests that destroy trees caused an increase in tree loss.

(D) Pollution resulting from burning fossil fuels provided trees with extra nutrients, thus increasing the rate of their growth.

(E) A decrease in temperature caused a significant decrease in the number of fires in the northern woodlands.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: C]
]

#v(0.5em)


#question-box[
*Question PT1-10* (Easy)

The passage is primarily concerned with

#v(0.5em)

(A) refuting a claim about the causes of a phenomenon

(B) presenting an analysis of a common natural process

(C) providing an explanation for a puzzling phenomenon

(D) evaluating the methodology used in a recent study

(E) contrasting two explanations of an unexpected phenomenon

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: C]
]

#v(0.5em)


#pagebreak()

== Passage: Ancient DNA Research

#passage-box[
Research directed toward recovering ancient DNA began in 1984, when pieces of DNA were extracted from museum specimens of an animal extinct for about a century. Most such genetic material recovered from biological relics consists of tiny fragments, rather than the strings of thousands of molecules typically found in living organisms, but these fragments may contain sufficient information to identify a species through comparison with modern DNA from descendant species. However, the need to verify whether particular fragments actually come from ancient organisms or whether they come from modern contaminants, such as the sweat of people who have handled the specimens, is crucial. For example, some scientists claim to have extracted DNA fragments from 17-million-year-old magnolia leaves found in an unusual fossil deposit in Idaho. But other scientists suggest that this DNA is a modern contaminant; they argue that even under the most favorable conditions, the rate of degradation of DNA is such that useful genetic material could not be recovered from fossils that old and that since the leaves were trapped in wet deposits, it is particularly unlikely that any DNA would have survived so long. A solution to this debate lies in the fact that any ancient DNA should differ from that of related modern species. If the DNA extracted from the fossil leaves were actually a modern contaminant, this fact would be apparent from the information contained in the DNA.
]

#v(1em)


#question-box[
*Question PT1-11* (Medium)

Which of the following statements, if true, would most clearly undermine the usefulness of the author's solution to the scientists' debate that is discussed in the passage?

#v(0.5em)

(A) DNA extracted from ancient specimens is not identical to the DNA of related modern species.

(B) Most ancient biological relics are not preserved under favorable conditions.

(C) Only tiny fragments of genetic material can be recovered from ancient biological relics.

(D) There are many segments of DNA that show very little change between ancient and modern DNA.

(E) Careless handling of biological relics is an ongoing problem in attempts to extract ancient DNA from fossils.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: D]
]

#v(0.5em)


#question-box[
*Question PT1-12* (Easy)

The passage suggests that the scientists mentioned in the first highlighted portion of text differ from the scientists mentioned in the second highlighted portion of text in that the former

#v(0.5em)

(A) assume a higher rate of degradation of DNA in fossil material

(B) argue that the conditions of the Idaho fossil deposit were exceptional

(C) have different techniques for extracting genetic material from a specimen that is 17 million years old

(D) have devised a method for identifying modern contaminants found in biological relics

(E) believe that fragments of DNA could survive in fossils for 17 million years

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: E]
]

#v(0.5em)


#question-box[
*Question PT1-13* (Easy)

The passage is primarily concerned with

#v(0.5em)

(A) questioning the applicability of a particular methodology

(B) identifying issues central to correctly dating DNA fragments

(C) presenting evidence to undermine a theory about the age of certain biological relics

(D) describing two methods commonly used to date certain biological relics

(E) presenting several possible explanations for the survival of DNA in biological relics

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: B]
]

#v(0.5em)


#pagebreak()

== Passage: Fungus Mimicry in Plants

#passage-box[
In the late nineteenth century, the highly esteemed Italian botanist Arcangeli made a claim that at that time was considered "unbelievable" but that has been verified by subsequent research. It concerned the curious little arum lily Arisarum proboscideum, known as the mousetail plant. Its flower cluster develops inside a cylindrical, vertical chamber whose upper part is bent over and ends in a dark-colored, slender, drawn-out, and curved tip, the "mousetail." The chamber is completely closed except for an elliptical window that faces earthward.

A small flying insect, coming up from the forest floor and entering the chamber through the window, is immediately confronted by the flower cluster's appendix—a structure that extends into the bent part, well above the flowers that make up the cluster. In this case the appendix is not hard and smooth as it is in many arum lilies but spongy and full of little depressions. It is also off-white in color so that the overall visual impression it gives is deceptively like that of the underside of the cap of a Boletus mushroom. Arcangeli claimed that the plant's pollinators were fungus gnats—insects that normally breed in decaying mushrooms. The mousetail plant fools them so successfully that the females deposit their eggs—which will not be able to survive—on the appendix. Before the gnats can find their way out of the chamber, they also accidentally contact the flowers, transferring pollen.

Fungus mimicry turns out to be a fairly widespread pollination strategy. Most of the fungus mimics are forest dwellers, which remain close to the ground and produce dark purple or brown flowers with pale or translucent patterns. To the human nose at least they are either scentless or musky in odor. Usually the flowers are simple urn- or kettle-shaped traps containing structures that closely resemble the gills or pores of mushrooms. Another element in their fungus mimicry is their exudation of moisture during the period when the flower is active. Fungus gnats of both sexes are involved in the pollination and are misled by a combination of fungus-like features—odor, color, shape, texture, and humidity.
]

#v(1em)


#question-box[
*Question PT1-17* (Medium)

The passage most strongly supports which of the following inferences about flower-cluster appendixes?

#v(0.5em)

(A) Arcangeli did not hypothesize that they might play a role in attracting fungus gnats to Arisarum proboscideum.

(B) In some species of arum lilies, their texture does not mimic that of the undersides of mushrooms.

(C) In Arisarum proboscideum they help protect the plant from attack by fungus-eating insects.

(D) They are absent in some species of arum lilies that are pollinated by fungus gnats.

(E) Arcangeli found evidence that their absence in some species of arum lilies correlated with the absence of fungus gnats in those species' habitats.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: B]
]

#v(0.5em)


#question-box[
*Question PT1-18* (Medium)

Of the fungus-like features listed in the final sentence, the passage explicitly discusses which of the following as features of Arisarum proboscideum?

#v(0.5em)

(A) Odor and humidity

(B) Odor and texture

(C) Odor and shape

(D) Color and texture

(E) Color and humidity

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: D]
]

#v(0.5em)


#question-box[
*Question PT1-19* (Easy)

Which of the following most accurately expresses the main idea of the passage?

#v(0.5em)

(A) Arcangeli was correct in hypothesizing that fungus gnats pollinate Arisarum proboscideum, even though his hypothesis was based on flawed data.

(B) Arisarum proboscideum, and a number of other species of plants, rely on similarities to fungi to attract pollinators.

(C) Arcangeli correctly identified the species of insect that pollinates fungus-mimic plants such as Arisarum proboscideum but did not understand the means by which it does so.

(D) Some types of gnats that lay their eggs on fungi spend part of their lives on fungus-mimic plants such as Arisarum proboscideum.

(E) Some types of gnats reproduce on plants, such as Arisarum proboscideum, that mimic fungi.

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: B]
]

#v(0.5em)


#question-box[
*Question PT1-20* (Medium)

The passage most strongly supports the inference that the relationship between fungus gnats and Arisarum proboscideum is

#v(0.5em)

(A) harmful to both of the species

(B) beneficial to both of the species

(C) beneficial to the gnat species but harmful to Arisarum proboscideum

(D) beneficial to the gnat species but neither harmful nor beneficial to Arisarum proboscideum

(E) beneficial to Arisarum proboscideum but not to the gnat species

#v(0.3em)
#text(size: 9pt, fill: gray)[Answer: E]
]

#v(0.5em)


#pagebreak()

#align(center)[
  #v(5cm)
  #text(size: 16pt, weight: "bold", fill: uptoten-blue)[End of Language-Focused Questions]
  #v(2em)
  #figure(
    image("Logo.png", width: 5cm)
  )
]
