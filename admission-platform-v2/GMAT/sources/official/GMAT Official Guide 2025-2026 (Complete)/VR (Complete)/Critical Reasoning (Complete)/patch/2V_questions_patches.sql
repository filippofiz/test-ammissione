-- SQL patch for 2V_questions (Q662-Q802)
-- Preserves markdown bold/italic formatting
-- Run in Supabase SQL editor

-- Q662
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Economist: Tropicorp, which constantly seeks profitable investment opportunities, has been buying and clearing sections of tropical forest for cattle ranching, although pastures newly created there become useless for grazing after just a few years. The company has not gone into rubber tapping, even though greater profits can be made from rubber tapping, which leaves the forest intact. Thus, some environmentalists argue that **Tropicorp''s actions do not serve even its own economic interest**. However, the initial investment required for a successful rubber-tapping operation is larger than that needed for a cattle ranch: there is a shortage of workers employable in rubber-tapping operations: and taxes are higher on profits from rubber tapping than on profits from cattle ranching. Consequently, **the environmentalists'' conclusion is probably wrong**.',
      'question_text', 'In the economist''s argument, the two **boldfaced** portions play which of the following roles?',
      'options', jsonb_build_object('a', 'The first supports the conclusion of the economist''s argument; the second calls that conclusion into question.', 'b', 'The first states the conclusion of the economist''s argument; the second supports that conclusion.', 'c', 'The first supports the conclusion of the environmentalists'' argument; the second states that conclusion.', 'd', 'The first states the conclusion of the environmentalists'' argument; the second states the conclusion of the economist''s argument.', 'e', 'Each supports the conclusion of the economist''s argument.'),
      'explanation', 'Argument Construction

**Situation**
According to an economist, the firm Tropicorp has been investing in tropical forest that it has cleared for cattle ranching. But its new pastures are useless for grazing after a few years. In contrast, rubber tapping—which would avoid cutting trees — could be more profitable. According to the economist, environmentalists consequently argue that Tropicorp''s investment does not serve the firm''s economic interest. However, the economist argues, investing in rubber tapping involves some potential costs and risks greater than those that investing in cattle ranching involves. Consequently, the economist argues, the environmentalists'' conclusion is probably wrong.

**Reasoning**
*What function is served by the statement that Tropicorp''s actions do not serve even its own economic interest? What function is served by the statement that the environmentalists'' conclusion is probably wrong?* The first statement is a conclusion that the economist attributes to environmentalists. The second statement is the conclusion of an argument presented by the economist.

A. The first states the conclusion of the argument that is attributed to environmentalists; it does not support—nor is it meant to—the conclusion of the economist.

B. The second statement, not the first, is the conclusion of the economist''s argument.

C. The first is the conclusion attributed to environmentalists and is not meant merely as support for that conclusion.

D. **Correct.** The first states the conclusion of the environmentalists'' argument as the economist presents it: the second is the conclusion of the economist''s argument.

E. Neither statement is meant as support for the economist''s conclusion, nor does it offer such support.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'easy',
  difficulty_level = 1,
  updated_at = now()
WHERE id = 'e7a4b088-3ee6-41db-b49d-08123450b2f7';

-- Q663
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Brown tides are growths of algae on the sea''s surface that prevent sunlight from reaching marine plants below, thereby destroying not only the plants but also the shellfish that live off these plants. Biologists recently isolated a virus that, when added to seawater, kills the algae that cause brown tides. Adding large quantities of this virus to waters affected by brown tides will therefore make it possible to save the populations of shellfish that inhabit those waters.',
      'question_text', 'Which of the following, if true, provides the most support for the conclusion of the argument?',
      'options', jsonb_build_object('a', 'When applied in large quantities, the virus not only kills the algae that cause brown tides but also many harmless kinds of algae.', 'b', 'Marine animals that prey on shellfish avoid areas of the sea in which brown tides are occurring.', 'c', 'The number of different kinds of viruses present in seawater is far greater than many marine biologists had, until recently, believed.', 'd', 'The presence of large quantities of the virus in seawater does not adversely affect the growth of marine plants.', 'e', 'The amount of the virus naturally present in seawater in which brown tides occur is neither significantly greater nor significantly less than the amount present in seawater in which brown tides do not occur.'),
      'explanation', 'Argument Evaluation

**Situation**
Brown tides—growths of algae on the sea''s surface—kill the marine plants on which certain shellfish depend, by depriving them of sunlight. Biologists have discovered a virus that, if added to seawater in large quantities, can kill the algae. An author argues that this can be a means of saving the shellfish populations.

**Reasoning**
*Which of the answer choices most strongly supports the conclusion of the argument?* The argument concludes that adding large quantities of the virus to seawater infected by brown tides will help the shellfish survive. Any new information suggesting that the virus would, directly or indirectly, help the shellfish survive supports the conclusion. But the conclusion would be questionable if the virus could directly or indirectly harm the shellfish in a way that would outweigh any benefits the virus provides. New information indicating that this would not occur could provide support for the argument.

A. This information suggests that deployment of the virus could have undesirable side effects, but it neither supports nor casts doubt on the conclusion. We have no information suggesting that killing algae other than those that produce brown tides would, directly or indirectly, help the shellfish survive.

B. This information neither supports nor casts doubt on the conclusion. It indicates a way in which brown tides indirectly provide a benefit to shellfish, even if the indirect harm they cause to shellfish outweighs that benefit.

C. This information indicates that certain viruses can survive in seawater environments, but this information, by itself, neither supports nor casts doubt on the conclusion.

D. **Correct.** This information indicates that the virus the biologists isolated does not directly harm the marine plants on which shellfish depend. Therefore, it provides significant support for the conclusion by indicating that the virus will not harm the shellfish indirectly by harming their food source.

E. This information suggests that only large quantities of the virus the biologists isolated will be effective in eliminating brown tides. But the conclusion of the argument specifies that the virus would need to be added in *large quantities*, so the information given in this answer choice provides no additional support for the conclusion.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'easy',
  difficulty_level = 1,
  updated_at = now()
WHERE id = '1357bfd3-93cb-4b83-8f40-901d3b7b408f';

-- Q664
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In persons with astigmatism, the clear outer layer of the eye is deformed in a way that impairs and sometimes distorts vision. The elongated figures in the paintings of El Greco (1541-1614) were so unusual that some critics sought to explain them by hypothesizing that, without knowing it, El Greco had an astigmatism that caused everything to appear to him in the distorted way that was characteristic of his painted figures.',
      'question_text', 'The proposed explanation is most vulnerable to the criticism that it fails to',
      'options', jsonb_build_object('a', 'establish that during the period in which El Greco lived, there was any correction available to those who did realize their vision was distorted', 'b', 'provide evidence that astigmatism was common in the 1500s and 1600s', 'c', 'consider that the critics who proposed the explanation might have suffered from astigmatism', 'd', 'consider the effect of the hypothesized astigmatism on El Greco''s perception of his own paintings', 'e', 'allow for the possibility that artists see the world differently than do nonartists'),
      'explanation', 'Argument Evaluation

**Situation**
Figures in the paintings of El Greco are strikingly elongated. Some art critics have hypothesized that this was an unintentional result of his having a type of astigmatism that made things look elongated to him.

**Reasoning**
*What is a significant weakness in the critics'' explanation?* Reasons to doubt the explanation could include any evidence that another explanation is more likely to be true or that the situation envisioned in the explanation may be impossible or inconsistent with the phenomena to be explained. For example, if only human figures in El Greco''s paintings were elongated while other similarly shaped objects were not, that observation would be inconsistent with the claim that the elongations were due to a general distortion in his vision. Answer choice D presents a similar reason to think that the proposed explanation is inconsistent with the facts. If El Greco perceived human models as more elongated than they appear to non-astigmatic perceivers, he would also have perceived his depictions of such models as more elongated than those depictions appear to non-astigmatic perceivers. So if he had intended to depict the figures accurately, he would have adjusted his painting accordingly, and his depictions should appear accurately shaped to typical viewers. But they do not. Therefore, the distortions were more likely intentional.

A. The hypothesis of some critics is that El Greco may have had astigmatism without being aware of it. So, the explanation does not depend on whether astigmatism could have been corrected during the period in which El Greco lived.

B. The reasoning concerning the hypothesis of some critics does not depend on whether astigmatism was common in the 1500s or 1600s. It is entirely consistent with the hypothesis that astigmatism was rare and that El Greco was one of the few people who had it.

C. Even if the critics who proposed the explanation had astigmatism, the explanation and the reasoning concerning the explanation would not be rendered faulty. The information provided is that the figures in El Greco''s paintings were unusually elongated, not merely that they appear elongated to the critics mentioned.

D. **Correct.** According to the art critics'' hypothesis, El Greco did not intend the figures in his paintings to be unnaturally elongated and did not know that they were. But this is the opposite of what one should expect if he had a type of astigmatism that made things look elongated to him. His astigmatism should have made the elongated figures in his paintings appear to him even more elongated than they appear to typical observers. So, regardless of whether he had astigmatism or not, the elongations were most likely intentional. If they were intentional, this feature of his paintings provides no more evidence that he had astigmatism than that he did not.

E. The explanation offered by the critics is entirely compatible with the possibility that artists see the world differently than do nonartists. One might wonder whether this possibility provides an alternative explanation for why El Greco painted elongated figures: he did so because he, like all artists, saw the world differently than nonartists do. But that hypothesis does not offer a coherent alternative to the critics'' explanation. If all artists see the world as El Greco did, we should expect them all to depict the world as he did. However, most do not. If, on the other hand, El Greco''s way of perceiving the world was only one of many ways in which artists'' perceptions differ from those of nonartists, this provides no reason to think that the difference between El Greco''s work and others'' was not caused by astigmatism.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'easy',
  difficulty_level = 1,
  updated_at = now()
WHERE id = '8802dce5-d1af-4950-adde-4b8c44acada1';

-- Q665
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Marketing executive for Magu Corporation: Whenever Magu opens a manufacturing facility in a new city, the company should sponsor, or make donations to, a number of nonprofit organizations in that city. Doing so would improve Magu''s image in the community, and thus the money spent on such charitable ventures would lead to increased sales.',
      'question_text', 'Which statement would, if true, point to the most serious weakness in the marketing executive''s advice?',
      'options', jsonb_build_object('a', 'Magu sells its products internationally, so sales in any one city represent only a small portion of total revenue.', 'b', 'Spending on charitable ventures would require Magu to decrease direct advertisements, which are the most effective means of reaching its target customers.', 'c', 'If market conditions change, Magu may have to close any such facility or relocate it.', 'd', 'Some nonprofit organizations are poorly organized, so money donated to them would be of little benefit to the community.', 'e', 'If workers at the manufacturing facility believed their wages or working conditions were poor, their complaints would outweigh any good impressions generated by Magu''s donations or sponsorships.'),
      'explanation', 'Evaluation of a Plan

**Situation**
A marketing executive for Magu Corporation argues that Magu can increase its sales if it sponsors or donates to nonprofit organizations in any city in which it opens a new manufacturing facility, because doing so would improve its image in that city and increase sales.

**Reasoning**
*What would most strongly suggest that Magu would not increase sales even if it followed the plan proposed by the marketing executive?* Sponsoring or donating to nonprofit organizations would require the use of financial assets that therefore cannot be spent elsewhere. If as a result Magu had to cut other expenditures that drive sales more effectively than funding nonprofit organizations drives sales, the plan may not succeed.

A. Because Magu sells its products internationally and no one city represents more than a small portion of revenue, any increase in sales in any given city will have only a slight effect on total sales; nonetheless, sales could still rise.

B. **Correct.** If sponsoring or donating to a nonprofit would require Magu to reduce advertising, and advertising is the most effective means of reaching its target customers, then any positive influence on sales resulting from the charitable venture might be overwhelmed by a decrease in sales because of the advertising cuts.

C. The fact that Magu might have to close or relocate one of these new facilities does not suggest that the marketing executive''s plan would not work; Magu''s image could nonetheless improve and sales could increase as a result.

D. Even if some nonprofit organizations are poorly organized, others may not be, and Magu could limit its support to those.

E. Even if such complaints from workers would outweigh any benefit arising from Magu''s support of nonprofit organizations, this does not indicate that the marketing executive''s plan will not work, because we have no reason to think that the workers will in fact be dissatisfied with their wages or working conditions.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'easy',
  difficulty_level = 1,
  updated_at = now()
WHERE id = '13806757-3a26-4c4d-8155-40a2f08a0efa';

-- Q666
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In the last few years, plant scientists have been able to genetically engineer seeds to produce crops highly resistant to insect damage. Farmers growing crops with these seeds will be able to spend significantly less on pesticides. This cost reduction would more than make up for the higher cost of the genetically engineered seeds. Clearly, therefore, farmers who grow crops from genetically engineered seeds will be able to reduce their costs by using them.',
      'question_text', 'Which of the following, if true, most weakens the argument?',
      'options', jsonb_build_object('a', 'Plant scientists have not yet developed insect-resistant strains of every crop that is currently grown commercially.', 'b', 'The cost of several commonly used pesticides is expected to rise in the next few years.', 'c', 'Crops grown from the genetically engineered seeds require significantly more fertilizer and water to grow well than do crops grown from nonengineered seeds.', 'd', 'In the future, the cost of genetically engineered seeds is likely to fall to the level of nonengineered seeds.', 'e', 'The crops that now require the greatest expenditure on pesticides are not the ones for which genetically engineered seeds will become available.'),
      'explanation', 'Argument Evaluation

**Situation**
Farmers who grow crops with seeds that have been genetically engineered to produce crops resistant to insect damage will be able to spend less on pesticides. Though these seeds are more expensive than regular seeds, this greater cost will be more than compensated for by lower expenditures on pesticides.

**Reasoning**
*What claim most weakens the argument''s support for the claim that farmers who grow crops from these genetically engineered seeds will be able to reduce their costs by using them?* The argument gives us good reason to think that even though these seeds are more expensive, the added expense is less than the amount that farmers will save by reducing their pesticide usage. But the argument does not tell us how the use of these seeds affects other costs the farmer might have. If, for instance, crops grown from these seeds require greater use of fertilizer or water, costs may stay stable or even increase.

A. The argument''s conclusion is only that farmers who grow crops using these seeds will be able to reduce their costs. The argument does not claim that every farmer will be able to reduce costs for every crop the farmer produces.

B. If the cost of pesticides will increase in the next few years, this gives us some reason to believe that farmers who use these genetically engineered seeds to grow crops will have lower costs than they would have if they used other seeds to grow the same crops. That strengthens rather than weakens the argument''s support for its conclusion.

C. **Correct.** As discussed above, if crops grown with the genetically engineered seeds require the use of more fertilizer or water, the farmer who uses such seeds may not see a reduction in costs.

D. If the genetically engineered seeds eventually become no more expensive than regular seeds, then it is more likely that farmers growing crops with these genetically engineered seeds will see their costs reduced.

E. This answer choice indicates that farmers will not be able to reduce costs as much as they might if all crops could be grown using seeds that are genetically engineered to produce crops resistant to insect damage. That, however, is fully consistent with the possibility that if farmers grow crops using the genetically engineered seeds that are available, they will thereby be able to reduce their costs.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'easy',
  difficulty_level = 1,
  updated_at = now()
WHERE id = '52e65b73-5d49-429f-a42a-ee9a39b4db3b';

-- Q667
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Educational theorist: Recent editorials have called for limits on the amount of homework assigned to schoolchildren younger than 12. They point out that free-time activities play an important role in childhood development and that homework in large quantities can severely restrict children''s free time, hindering their development. But the actual average homework time for children under 12—little more than 30 minutes per night—leaves plenty of free time. In reality, therefore, the editorials'' rationale cannot justify the restriction they advocate.',
      'question_text', 'Which of the following, if true, would most seriously call into question the educational theorist''s conclusion?',
      'options', jsonb_build_object('a', 'Some teachers give as homework assignments work of a kind that research suggests is most effective educationally when done in class.', 'b', 'For children younger than 12, regularly doing homework in the first years of school has no proven academic value, but many educators believe that it fosters self-discipline and time management.', 'c', 'Some homework assignments are related to free-time activities that children engage in, such as reading or hobbies.', 'd', 'A substantial proportion of schoolchildren under 12, particularly those in their first few years of school, have less than 10 minutes of homework assigned per night.', 'e', 'Some free-time activities teach children skills or information that they later find useful in their schoolwork.'),
      'explanation', 'Argument Evaluation

**Situation**
An educational theorist points out that recent editorials have called for limits on the amount of homework assigned to children under the age of 12, since large amounts of homework can restrict the sort of free-time activities that are crucial to their development. The theorist argues that such restrictions are not justified, because children under 12 spend on average only 30 minutes on homework. That leaves plenty of time for other activities.

**Reasoning**
*What would most seriously call the theorist''s conclusion into question?* The theorist gives only the average amount of time children under the age of 12 spend on homework. However, the editorials advocated a limit on the maximum amount of homework assigned, not on the average amount across all schoolchildren. There could be a wide variation among the amounts of time different children spend on homework. While a large number of children may spend only a short amount of time on homework, some children may spend much longer. For those who have the greater amounts of homework, this might leave little time for important free-time activities.

A. This claim, if true, may suggest that certain types of homework that teachers assign would be better done in class. It might be best not to give such assignments for homework, but that does not give us much reason to think that the amount of homework should be restricted.

B. This choice indicates that, despite a possible objection to assigning homework, homework does have value. That does not tell us, though, whether the maximum amount of homework that is assigned is too much, too little, or just right.

C. This claim could be true and yet children could still be left with too little time for important free-time activities.

D. **Correct.** As explained in the Reasoning section above, the educational theorist draws a conclusion regarding whether there should be a limit on the maximum amount of homework assigned to children under 12 and bases this conclusion solely on the average amount of time children under the age of 12 spend on homework. This conclusion would not be well supported if there is a wide variation in the amount of time children under the age of 12 spend on homework and if some—perhaps in the lower grades—spend only a very short amount of time on it. Suppose, for instance, as this answer choice has, that less than 10 minutes of homework is assigned to some of these children each night. If that were the case, then because the average amount of time schoolchildren under the age of 12 spend on homework each night is 30 minutes, that would mean that many schoolchildren may be spending far more than 30 minutes a night on homework. If so, then those children may not have enough free time for other important activities. That might mean that it would be appropriate to put limits on the amount of homework assigned to children under the age of 12.

E. This claim shows that some free-time activities are important for schoolwork later in life. But that does not tell us whether the maximum amount of homework that is assigned is too much, too little, or just right.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'easy',
  difficulty_level = 1,
  updated_at = now()
WHERE id = '2136f41a-dcd5-44ca-b17c-e27c8f4d3249';

-- Q668
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Thyrian lawmaker: Thyria''s Cheese Importation Board inspects all cheese shipments to Thyria and rejects shipments not meeting specified standards. Yet only 1 percent is ever rejected. Therefore, since the health consequences and associated economic costs of not rejecting that 1 percent are negligible, whereas the board''s operating costs are considerable, for economic reasons alone the board should be disbanded.
Consultant: I disagree. The threat of having their shipments rejected deters many cheese exporters from shipping substandard product.',
      'question_text', 'The consultant responds to the lawmaker''s argument by',
      'options', jsonb_build_object('a', 'rejecting the lawmaker''s argument while proposing that the standards according to which the board inspects imported cheese should be raised', 'b', 'providing evidence that the lawmaker''s argument has significantly overestimated the cost of maintaining the board', 'c', 'objecting to the lawmaker''s introducing into the discussion factors that are not strictly economic', 'd', 'pointing out a benefit of maintaining the board which the lawmaker''s argument has failed to consider', 'e', 'shifting the discussion from the argument at hand to an attack on the integrity of the cheese inspectors'),
      'explanation', 'Argument Construction

**Situation**
The Thyrian lawmaker argues that the Cheese Importation Board should be disbanded, because its operating costs are high and it rejects only a small percentage of the cheese it inspects. The consultant disagrees, pointing out that the board''s inspections deter those who export cheese to Thyria from shipping substandard cheese.

**Reasoning**
*What strategy does the consultant use in the counterargument?* The consultant indicates to the lawmaker that there is a reason to retain the board that the lawmaker has not considered. The benefit the board provides is not that it identifies a great deal of substandard cheese and rejects it (thus keeping the public healthy), but that the possibility that their cheese could be found substandard is what keeps exporters from attempting to export low-quality cheese to Thyria.

A. The consultant does reject the lawmaker''s argument, but the consultant does not propose higher standards. Indeed, in suggesting that the board should be retained, the consultant implies that the board''s standards are appropriate.

B. The consultant does not provide any evidence related to the board''s cost.

C. The only point the lawmaker raises that is not strictly economic is about the health consequences of disbanding the board, but the consultant does not address this point at all.

D. **Correct.** This statement properly identifies the strategy the consultant employs in his or her counterargument. The consultant points out that the board provides a significant benefit that the lawmaker did not consider.

E. The consultant does not attack the integrity of the cheese inspectors; to the contrary, the consultant says that their inspections deter the cheese exporters from shipping substandard cheese.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'easy',
  difficulty_level = 1,
  updated_at = now()
WHERE id = '183070f4-20f2-4e26-93fc-bed960b98b42';

-- Q669
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The tulu, a popular ornamental plant, does not reproduce naturally and is only bred and sold by specialized horticultural companies. Unfortunately, the tulu is easily devastated by a contagious fungal rot. The government ministry plans to reassure worried gardeners by requiring all tulu plants to be tested for fungal rot before being sold. However, infected plants less than 30 weeks old have generally not built up enough fungal rot in their systems to be detected reliably. And many tulu plants are sold before they are 24 weeks old.',
      'question_text', 'Which of the following, if performed by the government ministry, could logically be expected to overcome the problem with their plan to test for the fungal rot?',
      'options', jsonb_build_object('a', 'Releasing a general announcement that tulu plants less than 30 weeks old cannot be effectively tested for fungal rot', 'b', 'Requiring all tulu plants less than 30 weeks old to be labeled as such', 'c', 'Researching possible ways to test tulu plants less than 24 weeks old for fungal rot', 'd', 'Ensuring that tulu plants are not sold before they are 30 weeks old', 'e', 'Quarantining all tulu plants from horticultural companies at which any case of fungal rot has been detected until those tulu plants can be tested for fungal rot'),
      'explanation', 'Evaluation of a Plan

**Situation**
There is a contagious fungal rot that devastates the tulu, a popular ornamental plant. To reassure worried gardeners, the government ministry plans to require that tulu plants be tested for the rot before being sold. However, many tulu plants are sold before they are 24 weeks old, yet fungal rot in plants less than 30 weeks old generally cannot be detected reliably.

**Reasoning**
*What could the government ministry do to overcome the problem?* The problem arises from the fact that tulu plants are frequently sold before they are 24 weeks old, which is too soon for any fungal rot that is present to have built up enough in their root systems to be detected. Since the goal of the testing is to ensure that infected tulu plants are not sold, an obvious solution would be to make sure that no plants are sold before they are old enough for fungal rot to have built up to a detectable level. Thus, tulu plants should not be sold before they are 30 weeks old.

A. Releasing such an announcement would help overcome the problem if it guaranteed that no one would buy or sell tulu plants before the plants were 30 weeks old, but it is far from certain that it would guarantee this.

B. Requiring all tulu plants less than 30 weeks old to be labeled as such would help overcome the problem if it guaranteed that no one would buy or sell tulu plants before the plants were 30 weeks old, but it is far from certain that it would guarantee this.

C. Researching possible ways to test tulu plants less than 24 weeks old for fungal rot might lead to a solution, but there is no guarantee that such research will be successful at reducing the age at which tulu plants can be reliably tested.

D. Ensuring that tulu plants are not sold before they are 30 weeks old would directly address the problem by preventing the sale of plants that cannot be reliably tested for fungal rot.

E. Quarantining all tulu plants from horticultural companies at which any case of fungal rot has been detected until those tulu plants can be tested for fungal rot might lead horticultural companies to start selling tulu plants only if they are less than 24 weeks old, thereby minimizing the chance of quarantine by minimizing the chance of detection.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'easy',
  difficulty_level = 1,
  updated_at = now()
WHERE id = 'ffeaaef5-d942-4748-bf74-5f5821d497f2';

-- Q670
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'While many people think of genetic manipulation of food crops as being aimed at developing larger and larger plant varieties, some plant breeders have in fact concentrated on discovering or producing dwarf varieties, which are roughly half as tall as normal varieties.',
      'question_text', 'Which of the following would, if true, most help to explain the strategy of the plant breeders referred to above?',
      'options', jsonb_build_object('a', 'Plant varieties used as food by some are used as ornamentals by others.', 'b', 'The wholesale prices of a given crop decrease as the supply of it increases.', 'c', 'Crops once produced exclusively for human consumption are often now used for animal feed.', 'd', 'Short plants are less vulnerable to strong wind and heavy rains.', 'e', 'Nations with large industrial sectors tend to consume more processed grains.'),
      'explanation', 'Evaluation of a Plan

**Situation**
Some plant breeders have concentrated on discovering or producing certain species of food crop plants to be roughly half as tall as normal varieties.

**Reasoning**
*Why would some plant breeders concentrate on discovering or producing smaller varieties of certain food crops?* Presumably, these breeders would not seek smaller varieties of plant crops unless the smaller size conveyed some benefit. If short plants were less vulnerable to strong wind and heavy rains, they would be apt to be more productive, other things being equal. Plant breeders would have reason to try to discover or produce such more productive varieties.

A. This statement doesn''t indicate whether those who use the plants as ornamentals desire shorter varieties.

B. At most this suggests that higher productivity is not as much of an advantage as it otherwise would be. But there is nothing in the passage that indicates that smaller varieties would be more productive than normal-sized plants.

C. No reason is given for thinking that smaller varieties of plants are more conducive to use for animal feed than are larger varieties.

D. **Correct.** This answer choice is correct because—unlike the other choices—it helps explain why smaller plant varieties could sometimes be preferable to larger varieties. A plant that is less vulnerable to wind and rain is apt to suffer less damage. This is a clear advantage that would motivate plant breeders to try to discover or produce smaller varieties.

E. This has no direct bearing on the question posed. Processed grains are not even mentioned in the passage, let alone linked to smaller plant varieties.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'easy',
  difficulty_level = 1,
  updated_at = now()
WHERE id = 'cc69b214-6d17-4a03-bac9-30f6b2e845d4';

-- Q671
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Secret passwords are often used to control access to computers. When employees select their own passwords, they frequently choose such easily guessed passwords as their initials or birth dates. To improve security, employers should assign randomly generated passwords to employees rather than allowing employees to make up their own.',
      'question_text', 'Which of the following, if true, most seriously undermines the conclusion drawn above?',
      'options', jsonb_build_object('a', 'If passwords are generated randomly, it is theoretically possible that employees will be assigned passwords that they might have selected on their own.', 'b', 'Randomly generated passwords are so difficult for employees to recall that they often record the passwords in places where the passwords could be easily seen by others.', 'c', 'Computer systems protected by passwords are designed to ignore commands that are entered by employees or others who use invalid passwords.', 'd', 'In general, the higher the level of security maintained at the computer system, the more difficult it is for unauthorized users to obtain access to the system.', 'e', 'Control of physical access to computers by the use of locked doors and guards should be used in addition to passwords in order to maintain security.'),
      'explanation', 'Argument Evaluation

**Situation**
Passwords are intended to control access to computers, limiting access only to intended users. Employees often choose easily guessed passwords. To improve security, therefore, employers should assign randomly generated passwords.

**Reasoning**
*What would significantly undermine the argument''s conclusion?* Any evidence that suggests that assigning randomly generated passwords would be no more likely to be secure than employee-generated passwords would undermine the conclusion.

A. Even if in theory a randomly generated password could assign an employee a password the employee might have selected, that in actuality is extremely improbable.

B. **Correct.** If employees frequently record their randomly generated passwords where people who are not intended to have access to their computers can easily see them, as this option indicates, then such randomly generated passwords might in such cases reduce rather than increase security.

C. This detail is irrelevant because the issue is whether an unauthorized user can easily enter a valid password, not an invalid one.

D. This does not undermine the conclusion because the issue is whether the proposed plan does in fact increase the level of security maintained at the computer system.

E. This does not undermine the conclusion because this simply details a possible security measure that could be employed in addition to passwords.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'easy',
  difficulty_level = 1,
  updated_at = now()
WHERE id = '34b44a8f-69bb-4546-b6de-3a4f85c2b986';

-- Q672
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The economy around Lake Paqua depends on fishing of the lake''s landlocked salmon population. In recent years, scarcity of food for salmon there has caused a decline in both the number and the size of the adult salmon in the lake. As a result, the region''s revenues from salmon fishing have declined significantly. To remedy this situation, officials plan to introduce shrimp, which can serve as a food source for adult salmon, into Lake Paqua.',
      'question_text', 'Which of the following, if true, most seriously calls into question the plan''s chances for success?',
      'options', jsonb_build_object('a', 'Salmon is not a popular food among residents of the Lake Paqua region.', 'b', 'Tourists coming to fish for sport generate more income for residents of the Lake Paqua region than does commercial fishing.', 'c', 'The shrimp to be introduced into Lake Paqua are of a variety that is too small to be harvested for human consumption.', 'd', 'The primary food for both shrimp and juvenile salmon is plankton, which is not abundant in Lake Paqua.', 'e', 'Fishing regulations prohibit people from keeping any salmon they have caught in Lake Paqua that are smaller than a certain minimum size.'),
      'explanation', 'Evaluation of a Plan

**Situation**
In recent years, scarcity of food for landlocked salmon in Lake Paqua has led to a decline in number and size of the salmon there, leading to a decline in revenues from salmon fishing, on which the area''s economy depends. Officials plan to remedy this situation by introducing shrimp, a common food source for adult salmon, into Lake Paqua.

**Reasoning**
*What would seriously undermine the plan''s chances for success?* Note that shrimp are described as a food source for adult salmon. If there were good reason to think that shrimp cannot serve as a significant source of food for juvenile salmon—or that shrimp would not be able to live sustainably in the lake—there would be reason to be skeptical of the plan''s eventual success.

A. Whether salmon is a popular food among residents around Lake Paqua is not particularly relevant to the question of whether introducing shrimp will help the salmon population there rebound.

B. Nothing in the plan depends on whether salmon fishing''s primary contribution to the economy of the Lake Paqua region comes from tourists fishing or from commercial fishing.

C. The plan does not depend on the shrimp being usable as a human food source, only on their utility as food for salmon.

D. **Correct.** If the plan does not resolve the food source problem for juvenile shrimp, then the salmon may not survive to adulthood. Furthermore, because shrimp depend on plankton, which are not plentiful in the lake, any relief that the introduction of shrimp may provide will likely not be sustainable.

E. If anything, this would seem likely to assist the plan, by aiding in restoring the salmon population in the lake.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'easy',
  difficulty_level = 1,
  updated_at = now()
WHERE id = 'a719fae3-c56a-4efc-ac78-cfa06527acdf';

-- Q673
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Airline representative: The percentage of flight delays caused by airline error decreased significantly this year. This indicates that airlines listened to complaints about preventable errors and addressed the problems. Although delays caused by weather and other uncontrollable factors will always be part of travel, preventable delays are clearly decreasing.',
      'question_text', 'Which of the following most clearly points to a logical flaw in the representative''s reasoning?',
      'options', jsonb_build_object('a', 'Airlines may be motivated by financial concerns to underreport the percentage of flight delays caused by airline error.', 'b', 'The delays caused by uncontrollable factors could have led to an increase in complaints to airlines.', 'c', 'Complaints may not be the most reliable measure of how many errors occurred in a given year.', 'd', 'Delays caused by weather and other uncontrollable factors could have increased dramatically during the year under discussion.', 'e', 'Airline customers might not believe that particular delays were caused by uncontrollable factors rather than airline error.'),
      'explanation', 'Argument Evaluation

**Situation**
According to an airline representative, the percentage of flight delays caused by airline error decreased significantly this year. The representative concludes that airlines have addressed preventable errors reported by travelers.

**Reasoning**
*Which of the answer choices most clearly suggests a logical flaw in the reasoning of the airline representative?* Flight delays can be caused in many ways: for example, by unpredictable bad weather, mechanical or computer failures, bad management, or some combination of these. Some but not all errors of these kinds—and the flight delays they might cause—are preventable. Note that the argument is focused on the percentage of all flight delays that are airline-error (AE) delays. This percentage can decrease by (1) a reduction in the number of AE delays or (2) an increase in the number of non-AE delays, i.e., those delays that the airline could not have prevented. Even if a significant increase occurred in the number of AE delays, such delays could have decreased as a percentage of all flight delays if there had been a large enough increase in non-AE flight delays.

A. The hypothesis stated in this answer choice offers a slight, indirect basis for wondering whether the information on which the representative bases the reasoning is accurate. However, it provides no direct grounds for supposing that the reasoning itself is logically flawed. Even to the extent that this gives any reason to doubt the truth of the purported information, the relevance is very indirect. Even if airlines may have a motivation to underreport the percentage of flight delays caused by airline error, there is little reason to suppose that the representative''s information may be a result of any airline''s acting on such a motivation. And the representative argues on the basis of a decrease in the percentage, not on the basis of any particular percentage. If airlines systematically underreported the percentages, a decrease would still likely be significant.

B. This is only remotely relevant because the representative''s quantitative comparison is about a difference in percentage of actual delays due to certain factors, not about a difference in numbers of complaints about such delays. In principle, if the total number of complaints increased and the increase was at least partially attributable to delays caused by uncontrollable factors, this information could suggest that the number of delays caused by uncontrollable factors might have increased. This, in turn, could indirectly suggest the hypothesis stated in answer choice D. But at best the relevance of answer choice B to such a hypothesis is very oblique and conjectural.

C. The issue being discussed primarily concerns flight delays. Airlines could make many kinds of errors that do not lead to flight delays and that generally do not elicit complaints from air travelers.

D. **Correct.** As explained above, if there is a large enough increase in non-AE flight delays—delays entirely due to factors outside an airline''s control—then the overall number of flight delays also increases, provided the number of AE flight delays remains constant or also increases. So, even if the number of AE flight delays did not decrease, the percentage of all flight delays that were AE flight delays could decrease.

E. Air travelers who experience flight delays and disbelieve the explanations given by airlines for those delays may be justified in doing so—but in many, or even most, cases also may be mistaken. We have no information as to how this would affect the number of complaints from travelers. Certainly, the general level of trust between airlines and their customers does not affect the facts regarding the rate of AE flight delays or the rate of non-AE flight delays.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'f416825e-9a83-4573-9034-2c6c61db9235';

-- Q674
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Although the school would receive financial benefits if it had soft drink vending machines in the cafeteria, we should not allow them. Allowing soft drink machines there would not be in our students'' interest. If our students start drinking more soft drinks, they will be less healthy.',
      'question_text', 'The argument depends on which of the following?',
      'options', jsonb_build_object('a', 'If the soft drink vending machines were placed in the cafeteria, students would consume more soft drinks as a result.', 'b', 'The amount of soft drinks that most students at the school currently drink is not detrimental to their health.', 'c', 'Students are apt to be healthier if they do not drink soft drinks at all than if they just drink small amounts occasionally.', 'd', 'Students will not simply bring soft drinks from home if the soft drink vending machines are not placed in the cafeteria.', 'e', 'The school''s primary concern should be to promote good health among its students.'),
      'explanation', 'Argument Construction

**Situation**
Allowing soft drink vending machines in a school cafeteria would financially benefit the school, but students who drink more soft drinks would become less healthy.

**Reasoning**
*What must be true in order for the claim that students drinking more soft drinks would cause them to become less healthy to justify the conclusion that soft drink vending machines should not be allowed in the cafeteria?* The argument is that because drinking more soft drinks would be unhealthy for the students, allowing the vending machines would not be in the students'' interest, so the vending machines should not be allowed. This reasoning depends on the implicit factual assumption that allowing the vending machines would result in the students drinking more soft drinks. It also depends on the implicit value judgment that receiving financial benefits should be less important to the school than preventing a situation that would make the students less healthy.

A. **Correct.** If the cafeteria vending machines would not result in students consuming more soft drinks, then allowing the machines would not harm the students'' health in the way the argument assumes.

B. Even if the amount of soft drinks the students currently drink were unhealthy, enabling the students to drink more could make them even less healthy.

C. Even if drinking small amounts of soft drinks occasionally would not harm the students, vending machines in the cafeteria could lead the students to drink excessive amounts.

D. Even if students who cannot buy soft drinks in the cafeteria sometimes bring them from home instead, adding vending machines in the cafeteria could increase the students'' overall soft drink consumption.

E. A concern does not have to be the primary one in order to be valid and important. It could be held that promoting students'' good health should not be the schools'' primary concern but should still be a more important concern than the financial benefits from the vending machines.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'c2407cf3-3c05-46cc-9110-43c36b733ddb';

-- Q675
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Many athletes inhale pure oxygen after exercise in an attempt to increase muscular reabsorption of oxygen. Measured continuously after exercise, however, the blood lactate levels of athletes who inhale pure oxygen are practically identical, on average, to those of athletes who breathe normal air. The lower the blood lactate level is, the higher the muscular reabsorption of oxygen is.',
      'question_text', 'If the statements above are all true, they most strongly support which of the following conclusions?',
      'options', jsonb_build_object('a', 'Athletes'' muscular reabsorption of oxygen is not increased when they inhale pure oxygen instead of normal air.', 'b', 'High blood lactate levels cannot be reduced.', 'c', 'Blood lactate levels are a poor measure of oxygen reabsorption by muscles.', 'd', 'The amount of oxygen reabsorbed by an athlete''s muscles always remains constant.', 'e', 'The inhaling of pure oxygen has no legitimate role in athletics.'),
      'explanation', 'Argument Construction

**Situation**
Blood lactate levels after exercise are practically identical in athletes who breathe normal air and in those who inhale pure oxygen after exercise. The lower the blood lactate level, the higher the muscular reabsorption of oxygen.

**Reasoning**
*What conclusion do the stated facts most strongly support?* We are told that lower blood lactate levels correspond consistently to higher muscular reabsorption of oxygen. Since athletes who breathe pure oxygen after exercise have blood lactate levels practically identical to those in athletes who breathe normal air, probably muscular reabsorption of oxygen does not differ significantly between athletes who breathe pure oxygen and those who breathe pure air.

A. **Correct.** As explained above, the stated facts suggest that muscular reabsorption of oxygen does not differ significantly between athletes who breathe pure oxygen and those who breathe pure air. So, breathing pure oxygen instead of normal air after exercise probably does not increase athletes'' muscular reabsorption of oxygen.

B. None of the statements indicates that blood lactate levels cannot be reduced by means other than inhaling pure oxygen.

C. We are told that blood lactate levels are negatively correlated with muscular reabsorption of oxygen. This negative correlation might allow muscular reabsorption of oxygen to be precisely determined by measuring blood lactate levels.

D. Muscular reabsorption of oxygen might vary for reasons unrelated to whether an athlete has been inhaling pure oxygen.

E. Inhaling pure oxygen might have some legitimate role unrelated to muscular reabsorption of oxygen.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '618ad2d4-2905-4077-b694-5164bf3c1b4f';

-- Q676
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Historian: Fifteenth-century advances in mapmaking contributed to the rise of modern nation-states. In medieval Europe (from the fifth to the fifteenth century), sovereignty centered in cities and towns and radiated outward, with boundaries often ambiguously defined. The conceptual shift toward the modern state began in the late fifteenth century, when mapmakers learned to reflect geography accurately by basing maps on latitude-longitude grids. By the mid-seventeenth century, nearly all maps showed boundary lines.',
      'question_text', 'Which of the following would, if true, most strengthen the historian''s reasoning?',
      'options', jsonb_build_object('a', 'Borders did not become codified in Europe until certain treaties were signed in the early nineteenth century.', 'b', 'During the medieval period, various authorities in Europe claimed power over collections of cities and towns, not contiguous territories.', 'c', 'Many members of the political elite collected maps as a hobby during the late sixteenth and early seventeenth centuries.', 'd', 'Seventeenth-century treatises and other sources of political authority describe areas of sovereignty rather than illustrate them using maps.', 'e', 'During the fifteenth century in Europe, mapmakers simplified the borders of sovereignty by drawing clear lines of demarcation between political powers.'),
      'explanation', 'Argument Evaluation

**Situation**
A historian claims that fifteenth-century advances in mapmaking contributed to the rise of modern nation-states. In earlier centuries, boundaries of sovereignty in Europe were poorly defined, but in the fifteenth century, maps were made based on grids showing latitude and longitude.

**Reasoning**
*What additional piece of information, if true and added to the argument, would most improve the support offered for the conclusion that improved mapping contributed to the rise of nation-states?* The historian claims that there was a cause-effect relationship between progress in mapmaking and the rise of the nation-state. This claim is supported by information that territories of sovereignty were vague and ill-defined before the fifteenth century, when latitude-longitude grids began to allow progressively greater accuracy in the delineation of territories on maps. The argument assumes that the rise of nation-states would have required a high degree of clarity about each state''s nonoverlapping area of sovereignty.

A. This indicates the role of treaties in the evolution of nation-states but provides no additional support for the historian''s causal claim.

B. This information is consistent with the historian''s belief that nothing resembling the modern state existed before the fifteenth century, but it provides no additional support for the historian''s causal claim.

C. The relevance of this information to the argument is tenuous at best. There could be many nonpolitical explanations for the interest of political elites in collecting maps. Many people other than political elites may also have collected maps during the period mentioned.

D. This information tends to minimize the role of maps in defining areas of sovereignty and to cast some doubt on the historian''s causal claim.

E. **Correct.** This information makes explicit the role of mapmakers in providing clarity about the geographical boundaries of each political entity''s sovereignty. It thus provides additional evidence for the historian''s causal claim and strengthens the historian''s reasoning.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '9666c93d-172d-4ad2-932b-a52d3df3caeb';

-- Q677
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Sascha: The attempt to ban parliament''s right to pass directed-spending bills—bills that contain provisions specifically funding the favorite projects of some powerful politicians—is antidemocratic. Our nation''s constitution requires that money be drawn from our treasury only when so stipulated by laws passed by parliament, the branch of government most directly representative of the citizens. This requirement is based on the belief that exercising the power to spend public resources involves the ultimate exercise of state authority and that therefore ___.',
      'question_text', 'Which of the following most logically completes Sascha''s argument?',
      'options', jsonb_build_object('a', 'designating funding specifically for the favorite projects of some powerful politicians should be considered antidemocratic', 'b', 'the right to exercise such a power should belong exclusively to the branch of government most directly representative of the citizens', 'c', 'exercising the power to spend public resources is in most cases—but not all—protected by the constitution', 'd', 'modifications to any spending bills should be considered expenditures authorized by law', 'e', 'only officials who are motivated by concerns for reelection should retain that power'),
      'explanation', 'Argument Construction

**Situation**
According to Sascha, restricting parliament''s ability to direct public money to the projects favored by powerful politicians would be undemocratic. Sascha argues that such a restriction on directed spending would be inconsistent with constitutional requirements.

**Reasoning**
*What piece of information would most logically complete Sascha''s argument?* What piece of information would most strongly associate parliament''s spending authority with the concept of democracy? A good guess would be: some information that connects parliament''s public representation role with its spending authority.

A. Sascha believes that democratic constitutional principles require that parliament remain free to do what is described in this sentence.

B. **Correct.** This statement makes explicit the connection, implicitly relied on by Sascha''s argument, between parliament''s spending authority and its role in representing the public.

C. This statement may be true but fails to associate parliament''s spending authority under the constitution with the notion of democracy.

D. Bills are merely works-in-progress, texts of proposed laws. Modifications of bills do not in themselves provide legal authority for any public spending item.

E. Sascha opposes restrictions on parliament''s spending power, and this would seem to imply that Sascha believes every parliamentary representative should be free to vote on such measures regardless of their levels of concern for reelection.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'd70ba980-094d-4429-8835-dc16b7dd8e39';

-- Q678
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Boreal owls range over a much larger area than do other owls of similar size. Scientists have hypothesized that **it is scarcity of prey that leads the owls to range so widely**. This hypothesis would be hard to confirm directly, since it is not possible to produce a sufficiently accurate count of the populations of small mammals inhabiting the forests where boreal owls live. Careful study of owl behavior has, however, shown that **boreal owls do range over larger areas when they live in regions where food of the sort eaten by small mammals is comparatively sparse**. This indicates that the scientists'' hypothesis is not sheer speculation.',
      'question_text', 'In the argument given, the two **boldfaced** portions play which of the following roles?',
      'options', jsonb_build_object('a', 'The first presents an explanatory hypothesis; the second states the main conclusion of the argument.', 'b', 'The first presents an explanatory hypothesis; the second presents evidence tending to support this hypothesis.', 'c', 'The first presents an explanatory hypothesis; the second presents evidence to support an alternative explanation.', 'd', 'The first describes a position that the argument opposes; the second presents evidence to undermine the support for the position being opposed.', 'e', 'The first describes a position that the argument opposes; the second states the main conclusion of the argument.'),
      'explanation', 'Argument Construction

**Situation**
Boreal owls range over a much larger area than other owls of similar size. Scientists hypothesize that they do so because of prey scarcity. Counting the owls'' prey—small mammals—in the boreal owls'' habitat is inherently difficult. This makes the scientists'' hypothesis hard to confirm directly. However, it has been found that boreal owls range widely when they inhabit regions that have relatively little food for the small mammals they prey on.

**Reasoning**
*What function is served by the statement that it is scarcity of prey that leads the owls to range so widely?* What function is served by the statement that boreal owls range widely if food for their small-mammal prey is relatively sparse in the region they inhabit? The first **boldfaced** statement expresses an explanatory hypothesis. The passage explicitly says that this is a hypothesis and indicates that scientists have proposed this hypothesis as a tentative explanation for the comparatively wide range of boreal owls. The second **boldfaced** statement provides some indirect evidence for the scientists'' hypothesis. The final sentence of the passage says that the immediately preceding idea (expressed in the second **boldfaced** portion) indicates that the scientists'' hypothesis (the first **boldfaced** portion) is not mere speculation. The evidence expressed in this second **boldfaced** portion is indirect in that it depends heavily on further assumptions and is not sufficient to prove the hypothesis.

A. The main conclusion of the argument is that the scientists'' hypothesis is not sheer speculation, i.e., that the scientists have based their hypothesis on some evidence that they have discovered. The first statement presents the scientists'' hypothesis. The second statement cites some evidence for the hypothesis and is not the main conclusion of the argument.

B. **Correct.** As explained above, the first statement presents an explanatory hypothesis, while the second cites some indirect evidence for the hypothesis.

C. The second statement cites some indirect evidence for the scientists'' hypothesis, not for some other hypothesis.

D. The argument does not oppose the scientists'' hypothesis, presented in the first statement; the second statement cites evidence for the hypothesis and does not cite evidence for any position the argument opposes.

E. The second statement does not present the argument''s main conclusion. The main conclusion is that the scientists'' hypothesis is not mere speculation.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '4a81a0eb-18b6-47b9-8b47-e41e5cb47b11';

-- Q679
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Cognitive scientist: Using the pioneering work of comparative psychologist Gordon Gallup as a model, several studies have investigated animals'' capacity for mirror self-recognition (MSR). Most animals exposed to a mirror respond only with social behavior, such as aggression. However, in the case of the great apes, repeated exposure to mirrors leads to self-directed behaviors, such as exploring the inside of the mouth, suggesting that these animals recognize the reflection as an image of self. The implication of these studies is that the great apes have a capacity for self-awareness unique among nonhuman species.',
      'question_text', 'The cognitive scientist makes which of the following assumptions in the argument above?',
      'options', jsonb_build_object('a', 'Gallup''s work has established that the great apes have a capacity for MSR unique among nonhuman species.', 'b', 'If an animal does not have the capacity for MSR, it does not have the capacity for self-awareness.', 'c', 'If a researcher exposes an animal to a mirror and that animal exhibits social behavior, that animal is incapable of being self-aware.', 'd', 'When exposed to a mirror, all animals display either social behavior or self-directed behavior.', 'e', 'Animals that do not exhibit MSR may demonstrate a capacity for self-awareness in other ways.'),
      'explanation', 'Argument Construction

**Situation**
A cognitive scientist claims that several studies, modeled on Gordon Gallup''s work, have investigated animals'' capacity for mirror self-recognition (MSR) and found that, whereas most animals exposed to a mirror exhibit only social behavior in response, great apes can come to respond with self-directed behavior. The cognitive scientist infers from this that the great apes, unique among nonhumans, have a capacity for self-awareness.

**Reasoning**
*What must be true for the studies to support the cognitive scientist''s conclusion?* The implicit reasoning is that an animal has self-awareness only if the animal has the capacity for MSR; if the latter is lacking, so is the capacity for self-awareness.

A. The studies the cognitive scientist''s inference is based on were not necessarily conducted by Gallup himself. We are told only that they are modeled on his work.

B. **Correct.** If it were possible for an animal to have the capacity for self-awareness even if the animal lacks the capacity for MSR, then the studies would not imply that the great apes have a capacity for self-awareness that other nonhuman animal species lack.

C. The cognitive scientist''s reasoning does not require that an animal with the capacity for self-awareness never exhibits social behavior when exposed to a mirror; it merely requires that it does not exhibit only such behavior.

D. The cognitive scientist''s reasoning is compatible with an animal''s displaying no behavior in response to exposure to a mirror.

E. The cognitive scientist''s reasoning is compatible with the claim that an animal that does not exhibit MSR has no capacity at all for self-awareness.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '97132913-a071-4111-88a3-d7b7340763f4';

-- Q680
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Last year a record number of new manufacturing jobs were created. Will this year bring another record? Well, any new manufacturing job is created either within an existing company or by the start-up of a new company. Within existing firms, new jobs have been created this year at well below last year''s record pace. At the same time, there is considerable evidence that the number of new companies starting up will be no higher this year than it was last year, and there is no reason to think that the new companies starting up this year will create more jobs per company than did last year''s start-ups. So clearly, the number of new jobs created this year will fall short of last year''s record.',
      'question_text', 'In the argument given, the two portions in boldface play which of the following roles?',
      'options', jsonb_build_object('a', 'The first is a claim that the argument challenges; the second is an explicit assumption on which that challenge is based.', 'b', 'The first is a claim that the argument challenges; the second is a judgment advanced in support of the main conclusion of the argument.', 'c', 'The first provides evidence in support of the main conclusion of the argument; the second is an objection that has been raised against that main conclusion.', 'd', 'The first provides evidence in support of the main conclusion of the argument; the second is a judgment advanced in support of that main conclusion.', 'e', 'The first and the second are each claims that have been advanced in support of a position that the argument opposes.'),
      'explanation', 'Argument Construction

**Situation**
Manufacturing jobs are created either within existing companies or in start-ups. Manufacturing jobs are being created at a much slower rate this year than last year. It seems likely that the number of new start-ups will not exceed last year''s number and that the average number of manufacturing jobs per start-up will not exceed last year''s number. So, fewer manufacturing jobs are likely to be created this year than last year.

**Reasoning**
*What function is served by the statement that within existing firms, new jobs have been created this year at well below last year''s record pace? What function is served by the statement that there is no reason to think that the new companies starting up this year will create more jobs per company than did last year''s start-ups?* The first statement is one of the statements used as support for the argument''s main conclusion (the prediction about this year''s job creation). The second statement gives another premise used as support for that prediction.

A. The argument does not challenge the claim made by the first statement; it uses the first and the second statement as support for the argument''s main conclusion, the prediction about this year''s job creation.

B. The argument does not challenge the claim made by the first statement; it uses the first and second statements as support for the argument''s main conclusion.

C. The first provides evidence in support of the main conclusion of the argument; the second is not an objection that has been raised against the main conclusion.

D. **Correct.** The first provides evidence in support of the main conclusion of the argument; the second also provides support for the main conclusion.

E. Neither the first nor the second is meant to support a position that the argument opposes; rather, they are both meant to support the argument''s main conclusion.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'eaa35ffd-89a4-4996-9623-ea7e4c099960';

-- Q681
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'A study of ticket sales at a summer theater festival found that people who bought tickets to individual plays had a no-show rate of less than 1 percent, while those who paid in advance for all ten plays being performed that summer had a no-show rate of nearly 30 percent. This may be at least in part because the greater the awareness customers retain about the cost of an item, the more likely they are to use it.',
      'question_text', 'Which of the following would, if true, best serve as an alternative explanation of the results of the study?',
      'options', jsonb_build_object('a', 'The price per ticket was slightly cheaper for those who bought all ten tickets in advance.', 'b', 'Many people who attended the theater festival believed strongly that they should support it financially.', 'c', 'Those who attended all ten plays became eligible for a partial refund.', 'd', 'Usually, people who bought tickets to individual plays did so immediately prior to each performance that they attended.', 'e', 'People who arrived just before the performance began could not be assured of obtaining seats in a preferred location.'),
      'explanation', 'Argument Construction

**Situation**
People who bought tickets to individual plays at a theater festival had a much lower no-show rate than did people who paid in advance for all ten plays.

**Reasoning**
*What factor other than greater awareness of the ticket costs could explain why people who bought tickets individually were more likely to attend the plays?* The passage suggests that people who bought tickets individually were more likely to attend the plays because they were more vividly aware of what they had paid for each ticket. But there are other possible explanations—perhaps the people who bought the tickets individually were more eager to attend each play for its own sake, or they had other characteristics or incentives that made them more likely to attend the plays.

A. A slight price difference would not plausibly explain why the no-show rate was thirty times greater among those who bought all the tickets in advance than among those who bought them individually.

B. This could be true of many people who bought their tickets individually as well as many who bought them in advance.

C. This would provide an added incentive for those who bought tickets in advance to attend all the plays.

D. **Correct.** If people who bought individual tickets usually did so right before each performance, they would have much less time after buying the tickets to change their minds about whether to attend than would people who bought all the tickets in advance.

E. If anything, this might present an additional difficulty for those who bought individual tickets without advance planning, so it would not help to explain the lower no-show rate among buyers of individual tickets.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'fb6f1b4e-e52a-4eb1-a6e1-09be9267aa09';

-- Q682
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Although there is no record of poet Edmund Spenser''s parentage, we do know that as a youth Spenser attended the Merchant Tailors'' School in London for a period between 1560 and 1570. Records from this time indicate that the Merchant Tailors'' Guild then had only three members named Spenser: Robert Spenser, listed as a gentleman; Nicholas Spenser, elected the Guild''s Warden in 1568; and John Spenser, listed as a "journeyman cloth-maker." Of these, the last was likely the least affluent of the three—and most likely Edmund''s father, since school accounting records list Edmund as a scholar who attended the school at a reduced fee.',
      'question_text', 'Which of the following is an assumption on which the argument depends?',
      'options', jsonb_build_object('a', 'Anybody in sixteenth-century London who made clothing professionally would have had to be a member of the Merchant Tailors'' Guild.', 'b', 'The fact that Edmund Spenser attended the Merchant Tailors'' School did not necessarily mean that he planned to become a tailor.', 'c', 'No member of the Guild could become Guild warden in sixteenth-century London unless he was a gentleman.', 'd', 'Most of those whose fathers were members of the Merchant Tailors'' Guild were students at the Merchant Tailors'' School.', 'e', 'The Merchant Tailors'' School did not reduce its fees for the children of the more affluent Guild members.'),
      'explanation', 'Argument Construction

**Situation**
Records indicate that the poet Edmund Spenser attended the Merchant Tailors'' School for a reduced fee as a youth. There is no record of his parentage, but at the time, the Merchant Tailors'' Guild had only three members named Spenser, of whom the least affluent was probably John Spenser.

**Reasoning**
*What must be true in order for the cited facts to support the conclusion that John Spenser was probably Edmund Spenser''s father?* The implicit reasoning is that since Edmund Spenser attended the Merchant Tailors'' School at a reduced fee, his father must have been poor. And since John Spenser was probably the poorest of the three men named Spenser in the Merchant Tailors'' Guild, he was probably Edmund Spenser''s father.
This reasoning assumes that only the children of poor parents had reduced fees at the Merchant Tailors'' School, that the children at the school generally had fathers in the Merchant Tailors'' Guild, that children in that time and place generally shared their fathers'' surnames, and that the two other Spensers in the Merchant Tailors'' Guild were not poor enough for their children to qualify for reduced fees.

A. John Spenser, as a tailor and member of the Guild, could have been Edmund Spenser''s father even if some other professional tailors did not belong to the Guild and did not have children at the school.

B. Although Edmund Spenser became a poet as an adult, he and all his classmates might have attended the school as children because they planned to become tailors.

C. The argument assumes that a Guild''s Warden probably would have been wealthier than a journeyman cloth-maker, but that might have been probable even if the Guild''s Warden were not a "gentleman."

D. Even if most children of fathers in the Guild did not attend the school, all the children who did attend the school might have had fathers in the Guild.

E. **Correct.** If the school reduced its fees for children of wealthier Guild members, then the fact that Edmund Spenser''s fees were reduced would not provide evidence that his father was the poorest of the three Spensers in the Guild, as the argument requires.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'faff7d8c-b8a2-4ae4-8bc6-9804fffbd19c';

-- Q683
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Hea Sook: One should not readily believe urban legends. Most legends are propagated because the moral lesson underlying them supports a political agenda. People will repeat a tale if it fits their purpose. They may not deliberately spread untruths, but neither are they particularly motivated to investigate deeply to determine if the tale they are telling is true.
Kayla: But people would not repeat stories that they did not believe were true. Therefore, one can safely assume that if a story has been repeated by enough people, then it is more likely to be true.',
      'question_text', 'Kayla''s reply is most vulnerable to the criticism that it',
      'options', jsonb_build_object('a', 'does not specify how many people need to repeat a story before someone is justified in believing it', 'b', 'overstates the significance of political agendas in the retelling of stories', 'c', 'fails to address the claim that people will not verify the truth of a story that fits their purpose', 'd', 'implicitly supports the claim that the people repeating legends are not deliberately spreading untruths', 'e', 'cannot distinguish people''s motivations for repeating urban legends from their motivations for repeating other types of story'),
      'explanation', 'Argument Evaluation

**Situation**
Hea Sook and Kayla have a difference of opinion on how likely urban legends are to be true.

**Reasoning**
*What criticism is Kayla''s reply most vulnerable to?* Hea Sook argues that because urban legends generally are propagated for political purposes, people are not particularly motivated to carefully investigate whether the story they are telling is true. These people may not be deliberately telling an untruth, but they have not taken care to establish whether the story is true. Kayla responds that people would not repeat a story that they did not believe to be true, but Hea Sook not only does not attempt to deny that, but she suggests that it may be true. Kayla ignores the fact that sometimes people believe that something is true without carefully determining whether it actually is true, and that they are less likely to verify whether it is true when the story fits their purposes.

A. Kayla does not specify how many people need to repeat a story before one is justified in believing it, but she does not need to. Her claim—that there is some number sufficient for such belief to be justified—could be true even if she does not specify what that number is.

B. It is Hea Sook, not Kayla, who asserts that political agendas are a significant factor in whether one retells a story.

C. **Correct.** Kayla does not address whether people are unlikely to verify whether a story is true if the story fits their purpose.

D. Kayla does not merely implicitly claim that people who repeat legends are not deliberately spreading untruths; she explicitly states this, but in this she and Hea Sook agree.

E. We have no reason to think that Kayla cannot distinguish people''s motivations for repeating urban legends from their motivations for repeating other types of stories. She may well be able to do this.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '78bc939e-0ab0-4cb6-8672-418eac4559dd';

-- Q684
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Rainwater contains hydrogen of a heavy form called deuterium. The deuterium content of wood reflects the deuterium content of rainwater available to trees during their growth. Wood from trees that grew between 16,000 and 24,000 years ago in North America contains significantly more deuterium than wood from trees growing today. But water trapped in several North American caves that formed during that same early period contains significantly less deuterium than rainwater in North America contains today.',
      'question_text', 'Which of the following, if true, most helps to reconcile the two findings?',
      'options', jsonb_build_object('a', 'There is little deuterium in the North American caves other than the deuterium in the water trapped there.', 'b', 'Exposure to water after a tree has died does not change the deuterium content of the wood.', 'c', 'Industrialization in North America over the past 100 years has altered the deuterium content of rain.', 'd', 'Trees draw on shallow groundwater from rain that falls during their growth, whereas water trapped in caves may have fallen as rainwater thousands of years before the caves formed.', 'e', 'Wood with a high deuterium content is no more likely to remain preserved for long periods than is wood with a low deuterium content.'),
      'explanation', 'Argument Construction

**Situation**
In North America, wood from trees that grew 16,000 to 24,000 years ago contains more deuterium than wood from trees growing today. But water in caves that formed during that same period contains less deuterium than rainwater contains today.

**Reasoning**
*What could explain the puzzling discrepancy between the observed deuterium levels in wood and in caves?* Since the deuterium content of wood from trees reflects the deuterium content of rainwater available to the trees while they grew, the deuterium levels observed in wood suggests that North American rainwater contained more deuterium 16,000 to 24,000 years ago than it contains today. But this conclusion seems at odds with the low deuterium levels in water in caves that formed 16,000 to 24,000 years ago. Several factors might explain the discrepancy: the water in those caves might not be rainwater from the period when the caves formed; or some natural process might have altered the deuterium levels in the cave water or the wood; or the wood or caves in which deuterium levels were measured might be statistically abnormal somehow.

A. If the caves had absorbed deuterium out of the rainwater trapped in them, there would probably be deuterium in the cave walls. So, the observation that there is little deuterium in the caves apart from that in the water eliminates one possible explanation for the oddly low deuterium levels in the cave water.

B. This suggests that the deuterium levels in the wood accurately reflect higher deuterium levels in rainwater that fell 16,000 to 24,000 years ago, but it does not explain why the deuterium levels are so low in water in the caves that formed then.

C. This could explain why deuterium levels in rainwater have changed, but it does not help explain the discrepancy between the high deuterium levels in the wood and the low deuterium levels in the cave water.

D. **Correct.** If the water in the caves fell as rainwater thousands of years before the caves formed, it may date from a period when rainwater contained much less deuterium than during the period 16,000 to 24,000 years ago, and much less than today.

E. If wood with high deuterium content were more likely to be preserved, then wood from 16,000 to 24,000 years ago might have a high deuterium content even if the rainwater then had a low deuterium content. So the observation that wood with more deuterium is not more likely to be preserved eliminates one possible explanation for the discrepancy.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '25b639b6-2b25-4c58-ba08-f5682160d580';

-- Q685
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Enforcement of local speed limits through police monitoring has proven unsuccessful in the town of Ardane. In many nearby towns, speed humps (raised areas of pavement placed across residential streets, about 300 feet apart) have reduced traffic speeds on residential streets by 20 to 25 percent. In order to reduce traffic speed and thereby enhance safety in residential neighborhoods, Ardane''s transportation commission plans to install multiple speed humps in those neighborhoods.',
      'question_text', 'Which of the following, if true, identifies a potentially serious drawback to the plan for installing speed humps in Ardane?',
      'options', jsonb_build_object('a', 'On residential streets without speed humps, many vehicles travel at speeds more than 25 percent above the posted speed limit.', 'b', 'Because of their high weight, emergency vehicles such as fire trucks and ambulances must slow almost to a stop at speed humps.', 'c', 'The residential speed limit in Ardane is higher than that of the nearby towns where speed humps were installed.', 'd', 'Motorists who are not familiar with the streets in Ardane''s residential districts would be likely to encounter the speed humps unawares unless warned by signs and painted indicators.', 'e', 'Bicyclists generally prefer that speed humps be constructed so as to leave a space on the side of the road where bicycles can travel without going over the humps.'),
      'explanation', 'Evaluation of a Plan

**Situation**
Ardane''s difficulty in getting compliance with speed limits has led it to propose the installation of speed humps to slow traffic. In nearby towns, speed humps have reduced speeds in residential areas by up to 25 percent.

**Reasoning**
*Which one of the statements presented identifies a major disadvantage of the proposed installation of speed humps?* Is it possible that they might slow traffic too much? Clearly, there is a general need for traffic to flow smoothly. Would speed humps affect all types of traffic equally? Perhaps not. For example, certain emergency vehicles must sometimes need to travel quickly through residential neighborhoods. A problem with speed humps is that some heavier vehicles must go very slowly over speed humps.

A. This indicates a drawback of not installing speed humps.

B. **Correct.** This information indicates a significant drawback—possibly leading to loss of life and property—of the plan to install the speed humps.

C. This suggests that installing speed humps might lower speeds significantly below the current speed limits. If speeds became very low, the result could be traffic gridlock that would have unforeseen consequences. However, we have insufficient information to evaluate such possibilities.

D. This is unlikely to be a drawback, since such warning signs are typically put in place whenever speed humps are installed.

E. This information provides no evidence of a drawback in Ardane''s plan for speed humps, since the design of Ardane''s planned speed humps is not indicated.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '7daf16fc-dd84-441a-ba23-e1fedb4334b1';

-- Q686
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'NowNews, although still the most popular magazine covering cultural events in Kalopolis, has recently suffered a significant drop in advertising revenue because of falling circulation. Many readers have begun buying a competing magazine that, at 50 cents per copy, costs less than NowNews at \$1.50 per copy. In order to boost circulation and thus increase advertising revenue, NowNews''s publisher has proposed making it available at no charge, but this proposal has a serious drawback, since ___.',
      'question_text', 'Which of the following most logically completes the argument below?',
      'options', jsonb_build_object('a', 'Those Kalopolis residents with the greatest interest in cultural events are regular readers of both magazines.', 'b', 'One reason NowNews''s circulation fell was that its competitor''s reporting on cultural events was superior.', 'c', 'The newsstands and stores that currently sell NowNews will no longer carry it if it is being given away for free.', 'd', 'At present, 10 percent of the total number of copies of each issue of NowNews are distributed free to students on college campuses in the Kalopolis area.', 'e', 'NowNews''s competitor would begin to lose large amounts of money if it were forced to lower its cover price.'),
      'explanation', 'Argument Construction

**Situation**
NowNews is suffering declines in circulation and advertising revenue due to competition from a lower-priced magazine. The publisher proposes offering NowNews for free to reverse these declines.

**Reasoning**
*What would suggest that the publisher''s proposal will fail to increase circulation and advertising revenue?* The proposal''s intended effect is simply to increase advertising revenue by increasing circulation. Any evidence that offering the magazine for free will not result in more copies being circulated or will not attract advertisers would therefore be evidence of a drawback in the proposal. So, a statement offering such evidence would logically complete the argument.

A. The fact that certain highly motivated Kalopolis residents still read NowNews even at a cost of \$1.50 per issue leaves open the possibility that providing the magazine free might still boost readership.

B. This suggests that improving its cultural reporting might help NowNews increase its circulation, not that the publisher''s proposal will fail to do so.

C. **Correct.** If the proposal leads newsstands and stores to stop carrying NowNews, circulation and advertising revenue would probably decline as a result.

D. Even if 10 percent of the copies of NowNews are already distributed for free, distributing the remaining 90 percent for free could still increase circulation and advertising revenue as the publisher intends.

E. Forcing a competing magazine to lower its cover price and lose lots of money would be an advantage rather than a drawback of the proposal, as far as the publisher of NowNews is concerned.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '26383e1e-429f-41f7-ad9e-5bc599c8653a';

-- Q687
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Over the last five years, demand for hotel rooms in Cenopolis has increased significantly, as has the average price Cenopolis hotels charge for rooms. These trends are projected to continue for the next several years. In response to this economic forecast, Centennial Commercial, a real estate developer, is considering a plan to convert several unoccupied office buildings it owns in Cenopolis into hotels in order to maximize its revenues from these properties.',
      'question_text', 'Which of the following would it be most useful for Centennial Commercial to know in evaluating the plan it is considering?',
      'options', jsonb_build_object('a', 'Whether the population of Cenopolis is expected to grow in the next several years', 'b', 'Whether demand for office space in Cenopolis is projected to increase in the near future', 'c', 'Whether the increased demand for hotel rooms, if met, is likely to lead to an increase in the demand for other travel-related services', 'd', 'Whether demand for hotel rooms has also increased in other cities where Centennial Commercial owns office buildings', 'e', 'Whether, on average, hotels that have been created by converting office buildings have fewer guest rooms than do hotels that were built as hotels'),
      'explanation', 'Argument Construction

**Situation**
Cenopolis has seen rising demand for hotel rooms over the past five years, and a corresponding rise in prices for such rooms; moreover, these prices seem likely to keep increasing. Centennial Commercial is considering converting vacant office buildings in its possession into hotels to make those properties more profitable.

**Reasoning**
*What factor would affect the plan to maximize profits by converting the buildings?* Since Centennial Commercial is seeking to maximize profits from its buildings, it would be helpful for the company to have information that could affect the relative profitability of its options: to convert the buildings to hotels or to keep them as office space.

A. Demand for hotel rooms in Cenopolis is already projected to grow regardless of changes in the size of its population, so projected population increases have little bearing on the advantages of converting the buildings into hotels.

B. **Correct.** If demand for office space in Cenopolis increased significantly in coming years, then that demand would affect Centennial Commercial''s ability to profit off its office buildings without converting them into hotels. Depending on the extent of increasing demand, it might be more profitable to keep the buildings as they are, so having information regarding future need for office space would be very helpful in evaluating the plan to convert the buildings.

C. The plan concerns the possible profitability of converting the office buildings into hotels, and demand for other travel-related services has no bearing on that issue.

D. Demand for hotel rooms in other cities where Centennial Commercial owns office buildings is not relevant to the question of whether or not the company can maximize profits by converting its buildings in Cenopolis.

E. The average number of hotel rooms in converted office buildings versus the number in preexisting hotels does not affect the question of whether or not converting Centennial Commercial''s buildings would be the best way to make them profitable, though the number of rooms that could be created in these particular buildings would be relevant.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '3c8b6395-83c5-41e8-9938-15261d6b380d';

-- Q688
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Farmer: Several people in the past few years have claimed to have seen a mountain lion in the suburban outskirts—the latest just last month—and, while mountain lions were thought to have been driven from this entire region about twenty years ago, there is no reason for the people who reported seeing a mountain lion to have deliberately concocted a false report. Therefore, local wildlife managers should begin to urgently address the mountain lion''s presence.',
      'question_text', 'Which of the following would, if true, most seriously weaken the farmer''s argument?',
      'options', jsonb_build_object('a', 'Farmers in the suburban outskirts mostly raise cattle and hogs, which when fully grown are generally not attacked by mountain lions.', 'b', 'Mountain lions are dissimilar in size and color to other wild animals found near the suburban outskirts.', 'c', 'No person who claimed to have seen a mountain lion had anyone else with them at the purported sighting.', 'd', 'There have been no regional reports in the past year of mountain lions migrating to the area.', 'e', 'Recent surveys show that more than half of the people in the region report that they have never seen a mountain lion before.'),
      'explanation', 'Argument Evaluation

**Situation**
A farmer argues that, because several people in recent years, including someone just last month, have claimed to have seen a mountain lion in the suburban outskirts, local wildlife managers need to address the mountain lion''s presence. The farmer claims that people would not intentionally create a false story about seeing a mountain lion.

**Reasoning**
*What would most seriously call into question the farmer''s argument that because there have been reports of mountain lion sightings, wildlife managers should address the issue?* Even if it is true that people would not intentionally create a false report of having seen a mountain lion, it is possible that people have mistakenly believed they have seen a mountain lion when in fact what they saw was something else. If some fact called into question the accuracy of the reports of mountain lion sightings, then the farmer''s conclusion would have weaker support.

A. Even if most fully grown animals raised by farmers would not be attacked by mountain lions, there could still be good reason to be concerned about the presence of mountain lions in the suburban outskirts. The mountain lion might attack animals before they are fully grown.

B. A dissimilarity in size and color between mountain lions and other wild animals in the area where the mountain lions were purportedly sighted would make it less likely that people mistakenly believed that an animal they spotted was a mountain lion. So, this would strengthen the farmer''s argument, not weaken it.

C. **Correct.** If there actually were at least one mountain lion in the area, and several people over a period of a few years accurately claim to have seen one, then it seems likely that on at least some occasions, a person would have been in the presence of someone else at the time, given the frequency with which people are in the company of others. So, if there have been no instances of a person reporting seeing a mountain lion when in the company of another, perhaps that is because when someone has mistakenly believed that an animal is a mountain lion, the other person helps correct the mistaken belief. With no one else present, an illusory sighting would be less likely to be corrected.

D. There have been purported sightings of a mountain lion in the area for several years, so presumably, if the sightings are accurate, there has been at least one mountain lion for several years, so the sightings could be accurate even if no mountain lion has migrated to the area in the past year.

E. It might be likely that most people living in the area would not have seen a mountain lion even if one lived in the area. For instance, the mountain lion might intentionally try to avoid people.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'd440e9ff-b442-4e5c-b1ae-ee13346a93ea';

-- Q689
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The heavy traffic in Masana is a growing drain on the city''s economy—the clogging of the streets of the central business district alone cost the economy more than \$1.2 billion over the past year. In order to address this problem, officials plan to introduce congestion pricing, by which drivers would pay to enter the city''s most heavily trafficked areas during the busiest times of the day.',
      'question_text', 'Which of the following, if true, would most strongly indicate that the plan will be a success?',
      'options', jsonb_build_object('a', 'Approximately one-fifth of the vehicles in the central business district are in transit from one side of the city to the other.', 'b', 'Planners expect that, without congestion pricing, traffic in Masana is likely to grow by 6 percent in the next five years.', 'c', 'In other urban areas, congestion pricing has strongly encouraged carpooling (sharing of rides by private commuters).', 'd', 'Several studies have shown that a reduction in traffic of 15 percent in Masana could result in 5,500 or more new jobs.', 'e', 'Over 30 percent of the vehicles in the city''s center are occupied by more than one person.'),
      'explanation', 'Evaluation of a Plan

**Situation**
Traffic congestion in Masana has been harming the city''s economy. To address the problem, officials plan to make drivers pay to enter the city''s most heavily trafficked areas during the busiest times of day.

**Reasoning**
*What would most strongly suggest that the plan will reduce the harm to Masana''s economy from traffic congestion?* In order to succeed, the plan will have to be implemented and effectively enforced. Furthermore, the prices drivers pay will have to be high enough to significantly change their behavior in ways that reduce the amount of traffic congestion in the city. Finally, the economic benefits from the reduced traffic congestion will have to substantially outweigh any economically damaging side effects of the congestion pricing. Any evidence that any of these conditions will hold would provide at least some support for the prediction that the plan will succeed.

A. This provides no evidence that the congestion pricing would affect the behavior of either the one-fifth of drivers whose vehicles traverse the city or of the other four-fifths of drivers, nor does it give any evidence that the plan would produce overriding economic benefits.

B. This indicates that the traffic problem will grow worse if the plan is not implemented, but it does not provide any evidence that the plan will help address the problem.

C. **Correct.** This indicates that similar plans have successfully changed drivers'' behavior in other cities in a way likely to reduce the number of cars on the road in heavily trafficked areas at busy times of day without producing harmful economic side effects. Thus, it provides evidence that the strategy could also be successful in Masana.

D. Although this suggests that reducing traffic congestion would be economically beneficial, it doesn''t provide any evidence that the plan will succeed in reducing traffic congestion.

E. This suggests that many drivers in the city center are already carpooling, which, if anything, indicates that the plan will be less able to further affect those drivers'' behavior and thus could be less effective than it might otherwise be.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'b7a067c6-ee7e-4f1f-b6e5-a37a23234266';

-- Q690
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Economist: The most economically efficient way to reduce emissions of air pollutants is to tax them in proportion to the damage they are likely to cause. But in Country Y, many serious pollutants are untaxed and unregulated, and policy makers strongly oppose new taxes. Therefore, the best way to achieve a reduction in air pollutant emissions in Country Y would be to institute fixed upper limits on them.',
      'question_text', 'Which of the following is an assumption of the economist''s argument?',
      'options', jsonb_build_object('a', 'Policy makers in Country Y oppose all new taxes equally strongly, regardless of any benefits they may provide.', 'b', 'Country Y''s air pollutant emissions would not fall significantly if they were taxed in proportion to the damage they are likely to cause.', 'c', 'Policy makers in Country Y strongly favor reductions in air pollutant emissions.', 'd', 'Country Y''s policy makers believe that air pollutant emissions should be reduced with maximum economic efficiency.', 'e', 'Policy makers in Country Y do not oppose setting fixed upper limits on air pollutant emissions as strongly as they oppose new taxes.'),
      'explanation', 'Argument Construction

**Situation**
Although taxing air pollution emissions in proportion to the damage they cause is the most economically efficient way to reduce those emissions, many serious pollutants in Nation Y are untaxed and unregulated, and the nation''s policy makers strongly oppose new taxes. Therefore, fixed upper limits on such emissions would more effectively reach this goal.

**Reasoning**
*What must be true in order for the factors the economist cites to support the claim that fixing upper limits on air pollutant emissions in Nation Y would be the best way to reduce those emissions?* Political opposition to taxation in Nation Y is the only factor the economist cites to support the argument''s conclusion that it would be best to institute fixed upper limits on air pollutants. In order for the premise to support the conclusion, there must be less political opposition in Nation Y to instituting such limits than there would be to the proportional taxation approach the economist prefers.

A. Even if the policy makers oppose some new taxes less than others, they could still oppose the proportional taxation approach strongly enough for it to be utterly infeasible.

B. Even if the proportional taxation scheme would significantly reduce emissions, it still might not be the best approach for Nation Y if it would generate too much political opposition to be viable there.

C. Even if policy makers in Nation Y do not strongly favor reducing emissions, fixing upper limits on emissions might still be a better and more politically feasible way to reduce emissions than any alternative is.

D. Since fixing upper emissions limits would be no more economically efficient than the proportional taxation scheme, the policy makers'' support for economic efficiency would not make the former approach any more politically feasible than the latter.

E. **Correct.** If the policy makers opposed fixing upper emissions limits as strongly as they oppose new taxes, then their opposition to new taxes would no longer support the conclusion that fixing the emissions limits is a better way to reduce emissions.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'c1b7455f-d632-45c5-83a8-a67f01f5e4c6';

-- Q691
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'A study of high blood pressure treatments found certain meditation techniques and the most commonly prescribed drugs are equally effective if the selected treatment is followed as directed over the long term. Half the patients given drugs soon stop taking them regularly, whereas 80 percent of the study''s participants who were taught meditation techniques were still regularly using them five years later. Therefore, the meditation treatment is the one likely to produce the best results.',
      'question_text', 'Which of the following, if true, most seriously weakens the argument?',
      'options', jsonb_build_object('a', 'People who have high blood pressure are usually advised by their physicians to make changes in diet that have been found in many cases to reduce the severity of the condition.', 'b', 'The participants in the study were selected in part on the basis of their willingness to use meditation techniques.', 'c', 'Meditation techniques can reduce the blood pressure of people who do not suffer from high blood pressure.', 'd', 'Some of the participants in the study whose high blood pressure was controlled through meditation techniques were physicians.', 'e', 'Many people with dangerously high blood pressure are unaware of their condition.'),
      'explanation', 'Argument Evaluation

**Situation**
In a study of treatments for high blood pressure, meditation and medication both worked equally well at managing the condition as long as patients adhered to their treatment plan. However, patients prescribed meditation were significantly more likely to continue the treatment than patients prescribed medication, so the author concludes that meditation is likely to be more effective.

**Reasoning**
*What factor would undermine the contention that meditation is the better treatment for high blood pressure?* Since the argument that meditation is better than medication depends on study participants'' good adherence to a program of meditation, the argument would be weakened by evidence that the general population might not be as likely to continue meditating as the participants were.

A. The fact that high blood pressure patients are usually advised to change their diets has no bearing on the efficacy of other methods of managing high blood pressure.

B. **Correct.** If study participants were selected partly on the basis of their willingness to practice meditation, then those participants might have better adherence to a meditation program than the general population, who might well be less willing or less able to meditate consistently over long periods of time. Such a discrepancy between the study participants and other patients would seriously undermine the argument that meditation will work better than medication since that argument depends entirely on the contention that more patients will continue with meditation than with medication.

C. The fact that meditation techniques can lower blood pressure in people whose levels are healthy does not undermine the argument that meditation is the best treatment for those whose levels are unhealthy.

D. The fact that some of the participants who benefited from meditation were physicians does not undermine the argument that meditation will be the best treatment for blood pressure patients who may not be physicians. It does not, by itself, indicate the sample studied was unrepresentative.

E. People with high blood pressure being unaware of their condition reduces the likelihood that they will be treated, but it does not undermine the argument that one treatment is better than another.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '63544efd-d1f6-465d-8438-fc976183095b';

-- Q692
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Many industrialized nations are trying to reduce atmospheric concentrations of carbon dioxide, a gas released by the burning of fossil fuels. One proposal is to replace conventional cement, which is made with calcium carbonate, by a new "eco-cement." This new cement, made with magnesium carbonate, absorbs large amounts of carbon dioxide when exposed to the atmosphere. Therefore, using eco-cement for new concrete building projects will significantly help reduce atmospheric concentrations of carbon dioxide.',
      'question_text', 'Which of the following, if true, most strengthens the argument?',
      'options', jsonb_build_object('a', 'The cost of magnesium carbonate, currently greater than the cost of calcium carbonate, probably will fall as more magnesium carbonate is used in cement manufacture.', 'b', 'Eco-cement is strengthened when absorbed carbon dioxide reacts with the cement.', 'c', 'Before the development of eco-cement, magnesium-based cement was considered too susceptible to water erosion to be of practical use.', 'd', 'The manufacture of eco-cement uses considerably less fossil fuel per unit of cement than the manufacture of conventional cement does.', 'e', 'Most building-industry groups are unaware of the development or availability of eco-cement.'),
      'explanation', 'Argument Evaluation

**Situation**
Many nations are trying to reduce atmospheric concentrations of carbon dioxide. One proposed method is to use a new type of "eco-cement" that absorbs carbon dioxide from air.

**Reasoning**
*What evidence, combined with the cited facts, would most support the prediction that using eco-cement will significantly help reduce atmospheric concentrations of carbon dioxide?* The prediction assumes that the use of eco-cement would be an effective way to reduce carbon dioxide levels. Any evidence supporting this assumption will support the prediction.

A. Since eco-cement uses magnesium carbonate, the prediction that magnesium carbonate prices will fall suggests that a potential financial barrier to widespread eco-cement use will diminish. However, those prices may not fall enough to make eco-cement cost-competitive with regular cement.

B. Even if absorbed carbon dioxide strengthens eco-cement, the strengthened eco-cement might still be much weaker than regular cement and thus might never become widely used, in which case it will not significantly help reduce atmospheric concentrations of carbon dioxide.

C. Even if eco-cement is less susceptible to water erosion than earlier forms of magnesium-based cement were, it might still be much more susceptible to water erosion than regular cement is, and thus might never become widely used.

D. **Correct.** This suggests that manufacturing eco-cement produces much less carbon dioxide than manufacturing regular cement does, so it supports the claim that widespread use of eco-cement would be an effective way to reduce carbon dioxide levels.

E. If anything, this lack of awareness makes it less likely that eco-cement will become widely used, which in turn makes it less likely that eco-cementwill significantly help reduce atmospheric concentrations of carbon dioxide.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '05cde00c-5f17-419e-930b-3677e25f5f27';

-- Q693
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Professor: A marine biologist argues that transmission of sea lice from farm salmon to wild salmon is unlikely in the Broughton Archipelago, British Columbia, citing numerous studies suggesting that salinities less than 30 parts per thousand are unfavorable to sea-lice survival. The biologist concludes that the archipelago''s 25-30 parts per thousand salinity range between March and June, the critical period for wild salmon migration, tends to suppress sea-lice proliferation. But a review of the literature shows that salinities of 25—30 parts per thousand in combination with British Columbia''s cool spring temperatures favor the flourishing of sea lice.',
      'question_text', 'In this passage, the professor attempts to undermine the biologist''s argument by',
      'options', jsonb_build_object('a', 'pointing out that a condition claimed to be necessary for sea-lice survival is not sufficient for it', 'b', 'citing studies that suggest that salinity levels were not measured reliably', 'c', 'claiming that there is evidence showing that one of its premises is false', 'd', 'questioning the reliability of the biologist''s scientific sources', 'e', 'showing that its conclusion is inconsistent with its premises'),
      'explanation', 'Argument Evaluation

**Situation**
A professor gives us information about one biologist''s opinion, based on numerous studies, about the low probability of sea-lice transmission from farm salmon to wild salmon in the Broughton Archipelago. The biologist thinks salinities less than 30 parts per thousand (ppt) would make such transmission unlikely; in the archipelago, the salinity is 25—30 ppt between March and June, the period when wild salmon migration occurs. However, the professor challenges the biologist''s view, maintaining, based on a literature review, that cool spring temperatures in the archipelago, combined with the lower salinity, do favor the flourishing of sea lice.

**Reasoning**
*In what way does the professor attempt to undermine the biologist''s argument?* The professor points out that a premise used by the biologist—that the low spring salinities in the archipelago when the wild salmon migrate suppress sea-lice proliferation—is not correct. The professor claims the academic literature reveals that two conditions—the 25—30 ppt salinities combined with the cool spring temperatures—would be jointly sufficient for the flourishing of sea lice.

A. This does not accurately describe the professor''s technique. In effect, the professor points out that salinities of 30 ppt or more are NOT necessary for sea-lice survival; lower salinities combined with lower temperatures are sufficient to enable sea-lice survival.

B. The professor cites no studies that suggest unreliable measurement of salinity levels.

C. **Correct.** As explained in the Reasoning section above, the professor appeals to evidence from the literature to show that one of the biologist''s premises is false.

D. The professor primarily questions the conclusion that the biologist draws from the sources; the professor does not question the reliability of the sources.

E. The professor undermines the biologist''s argument by claiming that one of its premises is false and thus that the conclusion might not follow. The professor does not claim that if the premises were true, the conclusion would have to be false.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '3101d044-25bd-4634-ad1f-d67273ccbf2d';

-- Q694
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Advertisement: When your car''s engine is running at its normal operating temperature, any major brand of motor oil will protect it about as well as Tuff does. When the engine is cold, it is a different story: Tuff motor oil flows better at lower temperatures than its major competitors do. So, if you want your car''s engine to have maximum protection, you should use Tuff.',
      'question_text', 'Which of the following, if true, most strengthens the argument in the advertisement?',
      'options', jsonb_build_object('a', 'Tuff motor oil provides above-average protection for engines that happen to overheat.', 'b', 'Tuff motor oil is periodically supplied free of charge to automobile manufacturers to use in factory-new cars.', 'c', 'Tuff motor oil''s share of the engine oil market peaked three years ago.', 'd', 'Tuff motor oil, like any motor oil, is thicker and flows less freely at cold temperatures than at hot temperatures.', 'e', 'Tuff motor oil is manufactured at only one refinery and shipped from there to all markets.'),
      'explanation', 'Argument Evaluation

**Situation**
An advertisement argues that since Tuff motor oil flows better than its major competitors at low temperatures and works about as well as they do at normal temperatures, it provides maximum protection for car engines.

**Reasoning**
*What additional evidence would suggest that Tuff motor oil provides the best available protection for car engines?* The argument requires the assumptions that no type of motor oil other than the "major brands" provides superior protection, that flowing better at lower temperatures ensures superior protection at those temperatures, and that Tuff protects car engines at least as well as its competitors do at above-normal temperatures. Any evidence supporting any of these assumptions would strengthen the argument.

A. **Correct.** If Tuff provides above-average protection when engines overheat, in addition to the solid protection it provides at normal and low temperatures, it may well provide the best available protection overall.

B. The company that makes Tuff might give automobile manufacturers free motor oil as a promotional gimmick even if Tuff is an inferior product.

C. Tuff''s sales might have declined over the past three years because consumers have realized that Tuff is an inferior product.

D. The similar responses of Tuff and other motor oils to temperature changes do not suggest that Tuff provides better protection overall than those other motor oils do.

E. Even if Tuff is manufactured at only one refinery, it may still be an inferior product.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '656fb1a6-a8d4-44bf-8c05-16d7c71572a7';

-- Q695
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Linguist: In English, the past is described as "behind" and the future "ahead," whereas in Aymara, the past is "ahead" and the future "behind." Research indicates that English speakers sway backward when discussing the past and forward when discussing the future. Conversely, Aymara speakers gesture forward with their hands when discussing the past and backward when discussing the future. These bodily movements, therefore, suggest that the language one speaks affects how one mentally visualizes time.',
      'question_text', 'The linguist''s reasoning depends on assuming which of the following?',
      'options', jsonb_build_object('a', 'At least some Aymara speakers sway forward when discussing the past and backward when discussing the future.', 'b', 'Most people mentally visualize time as running either forward or backward.', 'c', 'Not all English and Aymara speakers tend to sway or gesture forward or backward when discussing the present.', 'd', 'How people move when discussing the future correlates to some extent with how they mentally visualize time.', 'e', 'The researchers also examined the movements of at least some speakers of languages other than English and Aymara discussing the past and the future.'),
      'explanation', 'Argument Construction

**Situation**
A linguist argues that the language one speaks affects how one mentally visualizes time. The linguist''s argument is based on the fact that English speakers, who refer to the past as "behind" and the future as "ahead," display backward and forward bodily movements when speaking of the past and the future, while speakers of Aymara, who refer to the past as "ahead" and the future as "behind," display correspondingly different body movements.

**Reasoning**
*What must be true if we are to accept the linguist''s conclusion from the given information that the language one speaks affects how one mentally visualizes time?* The linguist''s evidence will support the conclusion only if there is some correlation between people''s bodily movements and how they mentally visualize time. So, the linguist''s reasoning requires an assumption to that effect.

A. The linguist''s reasoning is based on the differences in bodily movements discussed in the argument—that is, that Aymara speakers gesture in certain ways and that English speakers sway in certain ways; thus, the linguist''s reasoning does not require that Aymara speakers sway in any way whatsoever when they discuss the past or future.

B. The linguist''s reasoning is based only on speakers of English and Aymara, so no claim related to speakers of other languages—who make up a majority of people—is required.

C. The linguist''s argument would actually be stronger if all English and Aymara speakers sway or gesture in the ways discussed, so the argument certainly does not depend on assuming that not all such speakers sway or gesture in these ways.

D. **Correct.** The fact that English and Aymara speakers sway or gesture in the ways described would be irrelevant to the linguist''s conclusion if how people move when discussing the future does not correlate at least to some extent with how they visualize time.

E. It might be helpful to the linguist''s argument to examine the movements of speakers of other languages when they discuss the past and the future, but the linguist''s argument does not require this.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '3fa855e3-b0e4-4a4c-84fc-eb181ef15519';

-- Q696
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The Testament of William Thorpe was published around 1530 as an appendix to Thorpe''s longer Examination. Many scholars, however, doubt the attribution of the Testament to Thorpe because, whereas the Examination is dated 1406, the Testament is dated 1460. One scholar has recently argued that the 1460 date be amended to 1409, based on the observation that when these numbers are expressed as Roman numerals, MCCCCLX and MCCCCIX, it becomes easy to see how the dates might have become confused through scribal error.',
      'question_text', 'Which of the following, if true, would most support the scholar''s hypothesis concerning the date of the Testament?',
      'options', jsonb_build_object('a', 'The sole evidence that historians have had that William Thorpe died no earlier than 1460 was the presumed date of publication of the Testament.', 'b', 'In the preface to the 1530 publication, the editor attributes both works to William Thorpe.', 'c', 'Few writers in fifteenth-century England marked dates in their works using only Roman numerals.', 'd', 'The Testament alludes to a date, "Friday, September 20," as apparently contemporaneous with the writing of the Testament, and September 20 fell on a Friday in 1409 but not in 1460.', 'e', 'The Testament contains few references to historical events that occurred later than 1406.'),
      'explanation', 'Argument Construction

**Situation**
The Testament of William Thorpe, dated 1460, was published around 1530 as an appendix to Thorpe''s Examination, dated 1406. But when expressed in Roman numerals, 1460 could easily be confused with 1409.

**Reasoning**
*Given the facts cited, what would provide additional evidence that Thorpe''s Testament dates from 1409 rather than 1460?* The scholar''s hypothesis that the work dates from 1409 is based on the observation that in Roman numerals, 1409 might easily have been improperly transcribed as 1460. What evidence would support this hypothesis? Any independent evidence that 1409 is a more likely date for the Testament than 1460 would certainly help. For instance, if some event or date that occurred in 1409 but not in 1460 is referred to in the Testament as being recent or contemporaneous, this would lend significant support to the hypothesis. For instance, if the Testament indicated that some day of the month had just fallen on a given day of the week, and that date fell on that day in 1409 but not in 1460, this would support the hypothesis significantly.

A. Suppose there is no reason to think that Thorpe was still alive in 1460 other than the presumption that the Testament was published in that year. That gives us no more reason to accept the scholar''s hypothesis about a scribal error in reporting the date than to accept the other scholars'' hypothesis that the Testament is improperly ascribed to Thorpe. Furthermore, it provides very little reason to support either of these hypotheses, because the mere lack of evidence, other than the purported 1460 date of creation, that Thorpe died no earlier than 1460 does not provide us with any evidence that he did die earlier than 1460.

B. The editor of the 1530 publication could easily have been mistaken about the authorship of one or both works. And even if the editor were correct, Thorpe might have lived long enough to write one work in 1406 and the other in 1460.

C. This would cast doubt on the scholar''s argument by providing evidence that the original manuscripts were not dated only in Roman numerals.

D. **Correct.** As explained in the Reasoning section above, this provides strong evidence directly supporting the hypothesis that the Testament dates from 1409 specifically.

E. Even if the Testament contained only one reference to a historical event that occurred later than 1406 (for example, one event in 1459), that reference alone could provide strong evidence that the work dates from 1460 rather than 1409.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '913edff3-c015-4753-8f93-7ee4cc6127b3';

-- Q697
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'A prominent investor who holds a large stake in the Burton Tool Company has recently claimed that the company is mismanaged, citing as evidence the company''s failure to slow down production in response to a recent rise in its inventory of finished products. It is doubtful whether an investor''s sniping at management can ever be anything other than counterproductive, but in this case, it is clearly not justified. It is true that **an increased inventory of finished products often indicates that production is outstripping demand**, but in Burton''s case it indicates no such thing. Rather, **the increase in inventory is entirely attributable to products that have already been assigned to orders received from customers**.',
      'question_text', 'In the argument given, the two **boldfaced** portions play which of the following roles?',
      'options', jsonb_build_object('a', 'The first states a generalization that underlies the position that the argument as a whole opposes; the second provides evidence to show that the generalization does not apply in the case at issue.', 'b', 'The first states a generalization that underlies the position that the argument as a whole opposes; the second clarifies the meaning of a specific phrase as it is used in that generalization.', 'c', 'The first provides evidence to support the conclusion of the argument as a whole; the second is evidence that has been used to support the position that the argument as a whole opposes.', 'd', 'The first provides evidence to support the conclusion of the argument as a whole; the second states that conclusion.', 'e', 'The first and the second each provide evidence against the position that the argument as a whole opposes.'),
      'explanation', 'Argument Construction

**Situation**
An investor has criticized a company, based on the company''s recent increase in inventory and on its not decreasing production as a result of this increase.

**Reasoning**
*What roles do the two **boldfaced** statements play in the argument?* The argument suggests that the investor''s criticism is based on a principle that increased inventory of finished products often indicates that production is faster than it should be, given the existing demand for a company''s products. However, the argument then states that the increase in inventory at the company in question is entirely attributable to existing orders of products. The argument thus suggests that the investor''s criticism is misplaced, based on a suggestion as to (1) a principle that the investor could be using to support her argument and (2) an explanation as to why the principle does not apply to the company. The two **boldfaced** portions state these respective elements.

A. **Correct.** The first **boldfaced** portion states the principle that may provide the basis of the investor''s criticism, which the argument as a whole opposes. The second **boldfaced** portion is a statement that, if true, shows the generalization would not apply to the company in question.

B. This option correctly describes the first of the boldfaced portions. However, rather than clarifying an aspect of the meaning of the first generalization, the second **boldfaced** portion indicates why the first generalization may not apply to the company.

C. This option incorrectly describes both of the **boldfaced** portions. The first **boldfaced** portion states a general principle that could support the position that the argument opposes. The second **boldfaced** portion then criticizes the application of the principle.

D. Because the second **boldfaced** portion describes a fundamental premise rather than the conclusion, the description in this option of the second **boldfaced** portion is incorrect.

E. If we think of an argument as a set of statements that are meant to support, or provide evidence for, a conclusion, then, because the **boldfaced** statements are indeed part of the argument, they may be seen as providing evidence for the position the argument opposes. However, a description of the roles of the **boldfaced** statements in this argument would need to provide more detail, such as what option A provides.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'b8dcac29-e31b-4793-b197-69dd3d102041';

-- Q698
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Kate: The recent decline in numbers of the Tennessee warbler, a North American songbird that migrates each fall to coffee plantations in South America, is due to the elimination of the dense tree cover that formerly was a feature of most South American coffee plantations.
Scott: The population of the spruce budworm, the warbler''s favorite prey in North America, has been dropping. This is a more likely explanation of the warbler''s decline.',
      'question_text', 'Which of the following, if true, most seriously calls Scott''s hypothesis into question?',
      'options', jsonb_build_object('a', 'The numbers of the Baltimore oriole, a songbird that does not eat budworms but is as dependent on South American coffee plantations as the Tennessee warbler, are declining.', 'b', 'The spruce budworm population has dropped because of a disease that can infect budworms but not Tennessee warblers.', 'c', 'The drop in the population of the spruce budworm is expected to be only temporary.', 'd', 'Many Tennessee warblers have begun migrating in the fall to places other than traditional coffee plantations.', 'e', 'Although many North American songbirds have declined in numbers, no other species has experienced as great a decline as the Tennessee warbler.'),
      'explanation', 'Argument Evaluation

**Situation**
Scott and Kate are arguing about the reason for declining numbers of Tennessee warblers. Kate believes that loss of habitat, specifically tree cover in South American coffee plantations, is to blame. Scott, by contrast, posits that the declining population of North American spruce budworms, which the warblers eat, is more likely to be to blame.

**Reasoning**
*What would undermine the argument that declining numbers of budworms have caused declining numbers of Tennessee warblers?* Scott and Kate have identified two possible causes for the warblers'' decline: loss of habitat and loss of prey. If other species that depend on the same habitat but not on the same prey are shown to be suffering similar decline, that fact would tend to support Kate''s argument that habitat loss is the main issue and to undermine Scott''s argument that prey loss is the main issue.

A. **Correct.** If the Baltimore oriole, a species that relies on the same habitat as the Tennessee warbler but not on the same food sources, is also declining, then that fact would call into question Scott''s hypothesis that not habitat loss but rather loss of food, specifically spruce budworm, is probably the reason for the warblers'' decline.

B. The reason behind declining numbers of spruce budworm does not affect the question of whether fewer budworms are the main cause of fewer warblers.

C. The fact that budworm populations are expected to rebound has no bearing on whether or not budworm population decline is the main cause of warbler population decline.

D. If Tennessee warblers have begun migrating to habitats other than South American coffee plantations, then if the new habitats lack the dense tree cover traditional in South American coffee plantations, that fact would tend to undermine Kate''s argument, not Scott''s.

E. The greater decline of Tennessee warbler populations relative to those of other songbirds has no direct bearing on the cause of the warblers'' decline.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'e7bca21e-9320-4c25-b39f-2e74f470c7c6';

-- Q699
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Advertising by mail has become much less effective, with fewer consumers responding. Because consumers are increasingly overwhelmed by the sheer amount of junk mail they receive, most discard almost all offers without considering them. Thus, an effective way for corporations to improve response rates would be to more carefully target the individuals to whom they mail advertising, thereby cutting down on the amount of junk mail each consumer receives.',
      'question_text', 'Which of the following, if true, would most support the recommendation above?',
      'options', jsonb_build_object('a', 'There are cost-effective means by which corporations that currently advertise by mail could improve response rates.', 'b', 'Many successful corporations are already carefully targeting the individuals to whom they mail advertising.', 'c', 'Any consumer who, immediately after receiving an advertisement by mail, merely glances at it is very likely to discard it.', 'd', 'Improvements in the quality of the advertising materials used in mail that is carefully targeted to individuals can improve the response rate for such mail.', 'e', 'Response rates to carefully targeted advertisements by mail are considerably higher, on average, than response rates to most other forms of advertising.'),
      'explanation', 'Evaluation of a Plan

**Situation**
Advertising by mail has become less effective because consumers overwhelmed with the amount of junk mail they receive discard almost all of it without considering it.

**Reasoning**
*What would most help to support the claim that making mail advertising more carefully targeted would improve response rates?* The passage recommends targeted advertising, reasoning that since targeted advertising would reduce the total amount of junk mail consumers receive, it would generate higher response rates. Any additional evidence for the claim that carefully targeted advertising would improve response rates would support this recommendation.

A. Even if targeted advertising and every other means of improving response rates were too expensive to be cost-effective, targeted advertising could still be effective for any corporation willing to pay the expense.

B. If many corporations already mail targeted advertising, and mail advertising is nonetheless yielding declining response rates, that suggests that targeted mail is an ineffective way to increase response rates.

C. This could be equally true for targeted and untargeted mail advertising, so it does not suggest that the former is more effective.

D. The question under consideration is whether more carefully targeted mail advertising would in itself increase response rates, not whether higher quality advertising would do so.

E. **Correct.** This provides some evidence that carefully targeted mail advertising is associated with higher response rates than untargeted mail advertising is, and therefore that targeting mail advertising more carefully would improve response rates.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'fff132ba-f119-487a-b908-c61aad51b479';

-- Q700
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Petrochemical industry officials have said that the extreme pressure exerted on plant managers during the last five years to improve profits by cutting costs has done nothing to impair the industry''s ability to operate safely. However, environmentalists contend that the recent rash of serious oil spills and accidents at petrochemical plants is traceable to cost-cutting measures.',
      'question_text', 'Which of the following, if true, would provide the strongest support for the position held by industry officials?',
      'options', jsonb_build_object('a', 'The petrochemical industry benefits if accidents do not occur, since accidents involve risk of employee injury as well as loss of equipment and product.', 'b', 'Petrochemical industry unions recently demanded that additional money be spent on safety and environmental protection measures, but the unions readily abandoned those demands in exchange for job security.', 'c', 'Despite major cutbacks in most other areas of operation, the petrochemical industry has devoted more of its resources to environmental and safety measures in the last five years than in the preceding five years.', 'd', 'There is evidence that the most damaging of the recent oil spills would have been prevented had cost-cutting measures not been instituted.', 'e', 'Both the large fines and the adverse publicity generated by the most recent oil spill have prompted the petrochemical industry to increase the resources devoted to oil-spill prevention.'),
      'explanation', 'Argument Evaluation

**Situation**
Petrochemical industry officials claim that pressure on plant managers to cut costs over the past five years has not made the industry''s operations any less safe. Environmentalists claim that recent oil spills and accidents show otherwise.

**Reasoning**
*What evidence would most strongly suggest that the cost-cutting pressure was not responsible for the recent rash of oil spills and accidents?* Evidence that the plant managers did not cut costs in any specific ways likely to have increased the likelihood of oil spills and accidents would support the industry officials'' position that the cost-cutting pressure has not made petrochemical operations any less safe.

A. Even if the petrochemical industry has good reasons to try to prevent accidents, the recent rash of serious accidents suggests that it is failing to do so and that the cost-cutting pressure might be responsible.

B. This suggests that the unions, whose members could directly observe the cost-cutting pressure''s effects, share the environmentalists'' belief that this pressure contributed to the oil spills and accidents. Because the unions abandoned their demands, their concerns probably have not been addressed.

C. **Correct.** This suggests that, as the industry officials claim, the cost-cutting pressure has not in itself reduced the industry''s effectiveness at preventing oil spills and accidents. Thus, it suggests that other factors are probably responsible for the recent problems.

D. This clearly suggests that the cost-cutting measures have indeed caused the industry to operate less safely, as the environmentalists claim.

E. Although this suggests that the industry is now trying to address the recent problems, the cost-cutting measures might nonetheless have caused all those problems.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'a5baada2-65a9-46dc-aeae-6efa6fab72a9';

-- Q701
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'A company has developed a new sensing device that, according to the company''s claims, detects weak, ultralow-frequency electromagnetic signals associated with a beating heart. These signals, which pass through almost any physical obstruction, are purportedly detected by the device even at significant distances. Therefore, if the company''s claims are true, their device will radically improve emergency teams'' ability to locate quickly people who are trapped within the wreckage of collapsed buildings.',
      'question_text', 'Which of the following, if true, most strengthens the argument?',
      'options', jsonb_build_object('a', 'People trapped within the wreckage of collapsed buildings usually have serious injuries that require prompt medical treatment.', 'b', 'The device gives a distinctive reading when the signals it detects come from human beings rather than from any other living beings.', 'c', 'Most people who have survived after being trapped in collapsed buildings were rescued within two hours of the building''s collapse.', 'd', 'Ultralow-frequency signals are not the only electromagnetic signals that can pass through almost any physical obstruction.', 'e', 'Extensive training is required in order to operate the device effectively.'),
      'explanation', 'Argument Evaluation

**Situation**
A new sensing device can detect—at significant distances and even behind obstructions such as walls—weak, ultralow-frequency electromagnetic signals that are characteristic of heartbeats. It is predicted, based on this information, that the new device will shorten the time it currently takes to locate people buried under collapsed buildings but still alive.

**Reasoning**
*What new information, if accurate, would provide further evidence that would support the prediction?* The existing evidence fails to tell us whether the new device can distinguish between human heartbeats and heartbeats from other species. If the device does not allow the user to distinguish between the heartbeats of humans and those of animals of other species, then the prediction might not be correct, because if there are any nonhuman animals in the building, emergency teams may believe they have located a trapped human and begin a rescue effort, when in fact they have merely located an animal of some other species. Any new information that implies the device can help the user to discern between signals associated with a human heartbeat and signals associated with the heartbeats of animals of other species will strengthen support for the prediction.

A. This implies that prompt rescue of people trapped under collapsed buildings is vitally important. The prediction is that the new device will speed rescue of such people, but the new information here does nothing to indicate that the prediction is accurate.

B. **Correct.** As explained in the Reasoning section above, there is a crucial gap in the argument: The argument does not indicate whether the device allows the user to distinguish between signals associated with human heartbeats and signals associated with the heartbeats of other species. This information fills that gap.

C. Even if this is true, shortening the time for locating and rescuing people from collapsed buildings would clearly be beneficial. However, the new information given here does not make it more likely that the prediction is correct.

D. If this is correct, then, if anything, it somewhat undermines the evidence given for the prediction, since it raises the possibility that the detection ability of the device might be impeded by "noise" from irrelevant electromagnetic signals near the collapsed building.

E. This could lead to practical obstacles when using the device even in emergency situations, with the result that the device might never actually be used by competent personnel to "improve emergency teams'' ability" because the "extensive training" would cost too much.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '981d0863-22a4-4e02-94b5-90f02869bcfb';

-- Q702
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Economist: The price of tap water in our region should be raised drastically. **Supplies in local freshwater reservoirs have been declining for years** because water is being used faster than it can be replenished. Since the price of tap water has been low, **few users have bothered to adopt even easy conservation measures**.',
      'question_text', 'The two sections in **boldface** play which of the following roles in the economist''s argument?',
      'options', jsonb_build_object('a', 'The first is a conclusion for which support is provided, and which in turn supports the main conclusion; the second is the main conclusion.', 'b', 'The first is an observation for which the second provides an explanation; the second is the main conclusion but not the only conclusion.', 'c', 'The first is a premise supporting the argument''s main conclusion; so is the second.', 'd', 'The first is the only conclusion; the second provides an explanation for the first.', 'e', 'The first is the main conclusion; the second is a conclusion for which support is provided, and which in turn supports the first.'),
      'explanation', 'Argument Construction

**Situation**
Local water supplies have been declining for years because of excessive water use and low prices. Few users have adopted even easy conservation measures.

**Reasoning**
*What roles do the two **boldfaced** statements play in the argument?* Both are factual observations. Since no further evidence or support is provided for either, neither can be a conclusion in the argument. However, interconnected causal explanations, signaled by because and since, are provided for both. The observation in the first **boldfaced** statement is causally explained by the further observation that water is being used faster than it can be replenished, which in turn is causally explained by the entire final sentence. The observation in the second **boldfaced** statement is causally explained by the observation that the price of tap water has been low. The only remaining portion of the argument is the initial sentence, a recommendation supported by these four observations together, and by the causal claims in which they are embedded. Thus, the four observations (including the two **boldfaced** statements) and the causal claims containing them are all premises, and the initial statement is the argument''s only conclusion.

A. As explained in the Reasoning section above, the two **boldfaced** statements are premises of the argument. Although causal explanations are provided for both, no support or evidence is provided for either. Neither statement is inferred from anything else in the argument, so neither can be a conclusion in the argument.

B. As explained in the Reasoning section above, the second **boldfaced** statement does provide part of the causal explanation for the observation in the first **boldfaced** statement. But the second is not a conclusion. It is not inferred from anything else in the argument, so it cannot be a conclusion in the argument.

C. **Correct.** As explained in the Reasoning section above, each of the statements is a premise that serves along with other claims to support the recommendation in the initial sentence, which is the argument''s only conclusion, and in that sense its main conclusion.

D. As explained in the Reasoning section above, the second **boldfaced** statement does provide part of the causal explanation for the observation in the first **boldfaced** statement. But the first is not a conclusion. It is not inferred from anything else in the argument, so it cannot be a conclusion in the argument.

E. As explained in the Reasoning section above, the two **boldfaced** statements are premises of the argument. Although causal explanations are provided for both, no support or evidence is provided for either. Neither statement is inferred from anything else in the argument, so neither can be a conclusion in the argument.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'd9f1c629-dc89-4bbe-a3d4-8287ee645279';

-- Q703
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Maize contains the vitamin niacin, but not in a form the body can absorb. Pellagra is a disease that results from niacin deficiency. When maize was introduced into southern Europe from the Americas in the eighteenth century, it quickly became a dietary staple, and many Europeans who came to subsist primarily on maize developed pellagra. Pellagra was virtually unknown at that time in the Americas, however, even among people who subsisted primarily on maize.',
      'question_text', 'Which of the following, if true, most helps to explain the contrasting incidence of pellagra described above?',
      'options', jsonb_build_object('a', 'Once introduced into southern Europe, maize became popular with landowners because of its high yields relative to other cereal crops.', 'b', 'Maize grown in the Americas contained more niacin than maize grown in Europe did.', 'c', 'Traditional ways of preparing maize in the Americas convert maize''s niacin into a nutritionally useful form.', 'd', 'In southern Europe, many of the people who consumed maize also ate niacin-rich foods.', 'e', 'Before the discovery of pellagra''s link with niacin, it was widely believed the disease was an infection that could be transmitted from person to person.'),
      'explanation', 'Argument Construction

**Situation**
Maize contains niacin in a form the body cannot readily utilize, and pellagra is a disease that results from niacin deficiency. In southern Europe a diet heavily dependent on maize resulted in a high incidence of pellagra, whereas in the Americas a diet similarly dependent on maize had no such effect.

**Reasoning**
*What would account for the differing effects of a maize-dependent diet in Europe versus the Americas?* A diet primarily consisting of maize resulted in widespread niacin deficiency, and consequent pellagra, in southern Europe, where maize was introduced, but had no such effect in the Americas, where that diet was traditional. Identifying a factor that would account for why people in the Americas were getting more niacin from the same staple food would explain that discrepancy.

A. An explanation for why maize became popular does nothing to explain the differing effects of a maize-dependent diet in Europe as opposed to the Americas.

B. Because the passage specifies the niacin in maize is not accessible to the body, higher levels of niacin would still be inaccessible and therefore would not explain the differing incidence of pellagra in the Americas versus Europe.

C. **Correct.** If methods of preparing maize in the Americas converted maize''s niacin into a form the body can absorb and European cooking techniques did not, that would explain the differing incidence of a disease caused by niacin deficiency in the two regions.

D. Consumption of niacin-rich foods in southern Europe would be expected to lower the incidence of pellagra in the region and therefore would not explain why that incidence was higher there.

E. Mistaken beliefs about the causes of pellagra do nothing to explain its relative frequency in Europe versus the Americas.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'fad93faf-7eee-466a-8591-aaf89772f3a2';

-- Q704
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Mayor: False alarms from home security systems waste so much valuable police time that in many communities, police have stopped responding to alarms from homes whose systems frequently produce false alarms. This policy reduces wastage of police time but results in a loss of protection for some residents. To achieve a comparable reduction in wastage without reducing protection for residents, the council has enacted a measure to fine residents for repeated false alarms.',
      'question_text', 'Which of the following, if true, casts the most doubt on whether the measure enacted by the council will achieve its goal?',
      'options', jsonb_build_object('a', 'A fine in the amount planned by the council will not cover the expenses police typically incur when they respond to a false alarm.', 'b', 'Homes equipped with security systems are far less likely to be broken into than are homes without security systems.', 'c', 'The threat of fines is likely to cause many residents to deactivate their security systems.', 'd', 'The number of home security systems is likely to increase dramatically over the next five years.', 'e', 'Many home security systems have never produced false alarms.'),
      'explanation', 'Evaluation of a Plan

**Situation**
In many communities, police have been responding to false home-security alarms but have ceased to respond to alarms from homes that often have such false alarms. To reduce wastage of police time without compromising residents'' home protection, one town council has enacted a new measure that will fine home residents for repeated false alarms.

**Reasoning**
*What fact or occurrence would most reduce the likelihood that the town council''s newly enacted measure would achieve its goal, which is to reduce wastage of police time without compromising home protection?* Note that the goal is not to eliminate all wastage of police time or to pay all the costs of it; some random wastage is to be expected. But if many residents deactivated their security alarms (even well-functioning systems) because they wish to avoid being fined, this could reduce the level of home protection for those residents.

A. The goal is to reduce wastage of police time resulting from false security-system alarms, not necessarily to cover all the costs in police time for such alarms.

B. This seems obviously true, but it is also irrelevant to the frequency of false home-security alarms. It is therefore irrelevant, also, to whether the council''s measure will effectively address wastage of police time stemming from such alarms.

C. **Correct.** If this occurred, it would result in a lower level of home protection for some residents and would mean that the town council''s measure would have failed to achieve its goal.

D. This scenario does not make the council''s measure more likely to fail to achieve its goal. If the increase in alarm systems occurs, it will likely result in more protection for the homes of more residents. Assuming vigorous enforcement of the new measure, we have no reason to believe that the number of false alarms would increase.

E. This has little bearing on the likelihood of the council''s measure succeeding. Any home security system that has never produced a false alarm could do so tomorrow, for all kinds of reasons.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'bfa4855a-3504-403b-b596-f2e3ef897761';

-- Q705
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Excavation of the house of a third-century Camarnian official revealed that he had served four magistrates—public officials who administer the law—over his thirty-year public career, in four provincial capital cities. However, given the Camarnian administrative system of that era, it is unclear whether he served them simultaneously, as a traveling administrator living for part of the year in each provincial capital, or else did so sequentially, leaving one magistrate after several years to join another.',
      'question_text', 'Which of the following would, if found in the excavation, most likely help reveal the pattern of the official''s administrative service?',
      'options', jsonb_build_object('a', 'Maps and documents describing each of the four provincial capitals', 'b', 'A cache of the official''s documents related to work from early in his career', 'c', 'A set of cups of a type made only in the city of the first magistrate whom the official is known to have served', 'd', 'Several pieces of furniture in the styles of two of the provincial capital cities', 'e', 'Heavy clothing appropriate only for the coldest of the four cities'),
      'explanation', 'Argument Construction

**Situation**
Evidence from an excavation makes clear that a particular third-century Camarnian official served four magistrates in four provincial capitals over his thirty-year career, but it is unclear whether he served the magistrates simultaneously or sequentially.

**Reasoning**
*What evidence, if it were also found in the excavation, would be most helpful in determining whether the official served the magistrates simultaneously or sequentially?* It would be helpful to find documents from throughout the magistrate''s career indicating at what times he worked for each magistrate, or even documents from just one period, as long as there were a large number, because this would likely show whether he was working for just one magistrate or for all four.
Consistent with the finding of the heavy clothing, the official may have worked exclusively in the city for which that clothing was appropriate, or worked intermittently in this city.

A. We already know that the official worked in each of the four capitals. The fact that maps and documents describing the capitals were at his house tells us nothing about whether he worked for magistrates in these capitals simultaneously or not.

B. **Correct.** Presumably, the work-related documents would show whom he was working for at the time, and for how long—and would provide evidence as to whether he was working for multiple magistrates or for just one.

C. Merely finding a set of cups made only in one of the cities tells us little. Even if we knew when he acquired the set, he need not have been working for the magistrate of that city at the time he acquired it; perhaps he had simply traveled to that city.

D. One frequently moves furniture when moving from one city to another, so the fact that the official had pieces of furniture that may have come from different cities does not give us any indication of whether the official worked for all four magistrates simultaneously or not.

E. The fact that heavy clothing appropriate only for the coldest of the four cities was found in the excavation of the official''s house does not imply that other clothing, appropriate for one or more of the other cities, was not found.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'ea2c6feb-d232-4ba4-b7f9-8ba2179bdc02';

-- Q706
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In 1563, in Florence''s Palazzo Vecchio, Giorgio Vasari built in front of an existing wall a new wall on which he painted a mural. Investigators recently discovered a gap between Vasari''s wall and the original, large enough to have preserved anything painted on the original. Historians believe that Leonardo da Vinci had painted, but left unfinished, a mural on the original wall; some historians had also believed that by 1563, the mural had been destroyed. However, it is known that in the late 1560s, when renovating another building, Santa Maria Novella, Vasari built a facade over its frescoes, and the frescoes were thereby preserved. Thus, Leonardo''s Palazzo Vecchio mural probably still exists behind Vasari''s wall.',
      'question_text', 'Which of the following is an assumption on which the argument depends?',
      'options', jsonb_build_object('a', 'Leonardo rarely if ever destroyed artworks that he left unfinished.', 'b', 'Vasari was likely unaware that the mural in the Palazzo Vecchio had willingly been abandoned by Leonardo.', 'c', 'Vasari probably would not have built the Palazzo Vecchio wall with a gap behind it except to preserve something behind the new wall.', 'd', 'Leonardo would probably have completed the Palazzo Vecchio mural if he had had the opportunity to do so.', 'e', 'When Vasari preserved the frescoes of Santa Maria Novella he did so secretly.'),
      'explanation', 'Argument Construction

**Situation**
Giorgio Vasari built a new wall in front of an existing wall in the Palazzo Vecchio that historians believe had had an unfinished mural by Leonardo da Vinci painted on it. Some historians, however, believe the mural had been destroyed by the time Vasari built the new wall. There is a gap between the old and new wall, large enough to have preserved anything painted on it, as there is in Santa Maria Novella, where Vasari also constructed a new wall in front of an old wall; on that wall, the building''s frescoes were preserved.

**Reasoning**
*What claim needs to be true for the cited facts to support the conclusion that Leonardo''s Palazzo Vecchio mural likely still exists behind Vasari''s wall?* If there are other equally likely reasons that Vasari would have left a gap between the old wall and a new wall, besides preserving any painting on the old wall, the stated facts would not support the conclusion. After all, it may be only fortuitous that the frescoes in the Santa Maria Novella were preserved when Vasari built the new wall with a gap between it and the old wall. Therefore, the argument depends on assuming that it is unlikely that Vasari would have created a gap between the old and new walls unless he had been trying to preserve something painted on the old wall.

A. The argument does not depend on the claim that Leonardo rarely if ever destroyed his unfinished artworks. Obviously, it does depend on the claim that he did not always do so, but even if he fairly regularly destroyed unfinished artworks, this mural could be one of the ones he did not—perhaps the reason the mural was left unfinished was that he died before completing it.

B. The argument does not depend on Vasari knowing that Leonardo had willingly abandoned the mural. Even if Leonardo did willingly leave it unfinished, Vasari could nonetheless have thought the mural was of value and wanted to preserve it.

C. **Correct.** If there had been other likely reasons for Vasari to have built a gap behind the new wall other than to preserve something painted on the old wall, the cited facts would not be a good reason to believe that Vasari built the gap for the purpose of preserving anything painted on it.

D. Leonardo may have had no interest in finishing the mural. Vasari could nevertheless have thought that there was value in preserving it.

E. There is no need to assume that Vasari preserved the frescoes at Santa Maria Novella secretly. Even if he did not do so in this instance, he could have preserved other paintings secretly by the same means, or he may have let others know that he was preserving Leonardo''s mural, although there is no historical record that he did let them know.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '6dc087be-4771-4000-b0c2-5ef0cd626067';

-- Q707
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Coffee shop owner: A large number of customers will pay at least the fair market value for a cup of coffee, even if there is no formal charge. Some will pay more than this out of appreciation of the trust that is placed in them. And our total number of customers is likely to increase. We could therefore improve our net cash flow by implementing an honor system in which customers pay what they wish for coffee by depositing money in a can.
Manager: We''re likely to lose money on this plan. Many customers would cheat the system, paying a very small sum or nothing at all.',
      'question_text', 'Which of the following, if true, would best support the owner''s plan, in light of the manager''s concern?',
      'options', jsonb_build_object('a', 'The new system, if implemented, would increase the number of customers.', 'b', 'By roasting its own coffee, the shop has managed to reduce the difficulties (and cost) of maintaining an inventory of freshly roasted coffee.', 'c', 'Many customers stay in the cafe for long stretches of time.', 'd', 'The shop makes a substantial profit from pastries and other food bought by the coffee drinkers.', 'e', 'No other coffee shop in the area has such a system.'),
      'explanation', 'Evaluation of a Plan

**Situation**
The owner and the manager of a coffee shop disagree about whether allowing customers to pay for coffee on an honor system would increase or decrease profits.

**Reasoning**
*What would be the best evidence that the honor-system plan would increase profits even if many customers cheated the system?* The owner argues that profits would increase because many customers will choose to pay as much or more than before and the total number of customers will likely increase. But the manager points out that many customers would also choose to pay little or nothing. Assuming that the manager is correct about that, what further support could the owner present for the claim that the plan would still be profitable?

A. Since the owner has already basically asserted this, asserting it again would not provide any significant additional support for the plan.

B. This suggests that the shop is already profitable, not that the honor-system plan would make it more profitable.

C. Customers who stay in the cafe for long stretches would not necessarily pay any more per cup on the honor-system plan than other customers would.

D. **Correct.** If the customer base increases (as both the owner and the manager seem to agree), more customers will likely purchase highly profitable pastries and other foods, thus boosting profits.

E. The reason no other coffee shop in the area has an honor system may be that their owners and managers have determined that it would not be profitable.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'bf4c7806-f0fb-43bc-8a2a-124c601abee4';

-- Q708
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Birds have been said to be descended from certain birdlike dinosaur species with which they share distinctive structural features. The fossil record, however, shows that this cannot be so, since there are bird fossils that are much older than the earliest birdlike dinosaur fossils that have been found.',
      'question_text', 'Which of the following is an assumption on which the argument relies?',
      'options', jsonb_build_object('a', 'The birdlike dinosaurs have no living descendants.', 'b', 'There are no flightless dinosaur species that have the distinctive structural features shared by birds and birdlike dinosaurs.', 'c', 'There are no birdlike dinosaur fossils that are older than the bird fossils but have not yet been unearthed.', 'd', 'It could not have been the case that some birds were descended from one of the birdlike dinosaur species and other birds from another.', 'e', 'Birds cannot have been descended from dinosaur species with which the birds do not share the distinctive structural features.'),
      'explanation', 'Argument Construction

**Situation**
Although birds have been said to be descended from birdlike dinosaurs, some bird fossils predate the earliest known birdlike dinosaur fossils.

**Reasoning**
*What must be true in order for the premise that some bird fossils predate the earliest known birdlike dinosaur fossils to support the conclusion that birds are not descended from birdlike dinosaurs?* The argument implicitly reasons that since the cited bird fossils predate the earliest known birdlike dinosaur fossils, they must be from birds that lived before the earliest birdlike dinosaurs, and which therefore could not have been descended from birdlike dinosaurs. This reasoning assumes that any birdlike dinosaurs that lived before the first birds would have left fossils that still exist. It also assumes that no undiscovered birdlike dinosaur fossils predate the cited bird fossils.

A. The argument is only about whether birds are descended from birdlike dinosaurs. Whether birdlike dinosaurs have any living descendants other than birds is irrelevant.

B. The argument is only about birds and birdlike dinosaurs. It is not about other types of dinosaurs that were not birdlike.

C. **Correct.** If any undiscovered birdlike dinosaur fossils predate the cited bird fossils, then the latter fossils'' age does not support the conclusion that birds are not descended from birdlike dinosaurs.

D. The argument purports to establish that the relative ages of bird fossils and birdlike dinosaur fossils show that birds cannot be descended from any of the known birdlike dinosaur species. In doing this, it acknowledges multiple birdlike dinosaur species and leaves open the question of whether some birds may be descended from one such species and other birds from another such species.

E. The argument does not claim that the known fossil record shows that birds cannot be descended from dinosaurs. It only claims that the record shows that they cannot be descended from the birdlike dinosaurs that shared their distinctive structural features.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '96461c0a-19f8-4550-9ff2-0237dc9389ea';

-- Q709
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The total market value of real estate in Altonville has steadily declined over the past four years. This decline has meant the overall figure on which the city''s property tax is based—the assessed value of that real estate—has also declined. Moreover, the percentage of assessed value that was paid as property taxes to the city did not change during this period.',
      'question_text', 'The information above most strongly supports which of the following?',
      'options', jsonb_build_object('a', 'Money collected from property taxes provided most of Altonville''s revenue during the past four years.', 'b', 'The percentage of Altonville''s overall revenue that was collected from property taxes did not change over the past four years.', 'c', 'Altonville officials had proposed raising property tax rates during the past four years but never did so because of strong opposition from property owners.', 'd', 'The total amount of revenue that Altonville has collected from property taxes has declined over the past four years.', 'e', 'During the past four years, Altonville officials also did not increase tax rates on other sources of revenue such as retail sales or business profits.'),
      'explanation', 'Argument Construction

**Situation**
Altonville''s real estate has declined in value in recent years, and therefore the total value of the property on which the city can charge property taxes is also reduced. The percentage of assessed value charged as property tax has remained constant.

**Reasoning**
*What would follow from the facts presented?* A constant percentage of a total that is decreasing would likewise decrease—for example, 10 percent of eighty is less than 10 percent of one hundred. Therefore, the information supports the conclusion that Altonville''s total revenue from property taxes has fallen over the period specified.

A. The passage suggests nothing about property taxes relative to other sources of revenue.

B. The passage does not suggest property taxes are unchanged as a share of Altonville''s total revenue.

C. There is no mention of any proposal to raise property tax rates.

D. **Correct.** The passage states total property values have fallen while the percentage of that value levied as tax is constant. Therefore, the information supports the conclusion that revenues from property tax have fallen in tandem with the declining value of property in the city.

E. The passage implies nothing about whether taxes other than property taxes have increased.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '62b9c49f-8ad1-4319-a79b-27227d242538';

-- Q710
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Certain groups of Asian snails include both "left-handed" and "right-handed" species, with shells coiling to the left and right, respectively. Some left-handed species have evolved from right-handed ones. Also, researchers found that snail-eating snakes in the same habitat have asymmetrical jaws, allowing them to grasp right-handed snail shells more easily. If these snakes ate more right-handed snails over time, this would have given left-handed snails an evolutionary advantage over right-handed snails, with the left-handed snails eventually becoming a new species. Thus, the snakes'' asymmetrical jaws probably helped drive the emergence of the left-handed snail species.',
      'question_text', 'Which of the following would, if true, most strengthen the argument that asymmetrical snake jaws helped drive left-handed snail evolution?',
      'options', jsonb_build_object('a', 'In one snake species, the snakes with asymmetrical jaws eat snails, while the snakes with symmetrical jaws do not eat snails.', 'b', 'Some species of Asian snails contain either all right-handed snails, or all left-handed snails.', 'c', 'Anatomical differences prevent left-handed snails from mating easily with right-handed snails.', 'd', 'Some right-handed snails in this habitat have shells with a very narrow opening that helps prevent snakes from extracting the snails from inside their shells.', 'e', 'Experiments show that the snail-eating snakes in this habitat fail more often in trying to eat left-handed snails than in trying to eat right-handed snails.'),
      'explanation', 'Argument Evaluation

**Situation**
There are both Asian snails with shells that coil to the right and Asian snails with shells that coil to the left, and the latter have evolved from the former; furthermore, there are snakes that have asymmetrical jaws that allow the snakes to grasp the snails with right-coiled shells more easily.

**Reasoning**
*What fact would help support the claim that the snakes'' asymmetrical jaws helped drive the emergence of species of snails with left-coiled shells?* We are told that if over time the snakes with asymmetrical jaws ate more snails with right-coiled shells than snails with left-coiled shells, then this would give snails with left-coiled shells an evolutionary survival advantage. So, if some evidence showed that the snakes with such jaws in fact were more likely to have successfully eaten the snails with the right-coiled shells, then we would have good reason to think the snakes'' asymmetrical jaws helped drive the emergence of snails with left-coiled shells.

A. The fact that snakes with asymmetrical jaws eat snails and other snakes do not does not give any indication as to whether snails with left-coiled shells have any evolutionary advantages over snails with right-coiled shells. At best it only tells us that if snakes drove the evolution of snails with left-coiled shells, it would likely have been the snakes with asymmetrical jaws.

B. The fact that some species of Asian snails have no variation in the direction in which their shells coil tells us nothing about what, if any, evolutionary advantages they have relative to other snails, or whether the snakes'' asymmetrical jaws had any effect on any such evolutionary advantages.

C. The inability of snails with left-coiled shells to mate easily with snails with right-coiled shells in and of itself tells us nothing about whether the snakes'' asymmetrical jaws had any effect on the emergence of snails with left-coiled shells. Although it does suggest a different factor that could have contributed to the emergence of the snail species with left-coiled shells, it does not exclude the possibility that the snakes were also a factor.

D. The fact that snakes cannot extract some snails with right-coiled shells from their shells would suggest that these snails might have an evolutionary advantage, but the argument''s conclusion is about an evolutionary advantage that snails with left-coiled shells presumably have, not an advantage that snails with right-coiled shells would have.

E. **Correct.** The fact that experiments show that the snakes are more successful at eating snails with right-coiled shells than they are at eating snails with left-coiled shells would support the claim that these snakes did in fact eat more snails with right-coiled shells, and hence the snails with left-coiled shells would as a result have an evolutionary advantage.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '58b56891-e8e7-4f17-9027-db79b78ced9d';

-- Q711: SKIPPED (not in DB)

-- Q712: SKIPPED (not in DB)

-- Q713: SKIPPED (not in DB)

-- Q714: SKIPPED (not in DB)

-- Q715: SKIPPED (not in DB)

-- Q716
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Last year a record number of new manufacturing jobs were created. Will this year bring another record? Well, **any new manufacturing job is created either within an existing company or by the start-up of a new company**. Within existing firms, new jobs have been created this year at well below last year''s record pace. At the same time, there is considerable evidence that the number of new companies starting up will be no higher this year than it was last year, and there is no reason to think that the new companies starting up this year will create more jobs per company than did last year''s start-ups. So clearly, **the number of new jobs created this year will fall short of last year''s record**.',
      'question_text', 'In the argument given, the two portions in **boldface** play which of the following roles?',
      'options', jsonb_build_object('a', 'The first is presented as an obvious truth on which the argument is based; the second is the main conclusion of the argument.', 'b', 'The first is presented as an obvious truth on which the argument is based; the second is a conclusion drawn in order to support the main conclusion of the argument.', 'c', 'The first and the second each provide evidence in support of the main conclusion of the argument.', 'd', 'The first is a generalization that the argument seeks to establish; the second is the main conclusion of the argument.', 'e', 'The first is a generalization that the argument seeks to establish; the second is a conclusion that has been drawn in order to challenge that generalization.'),
      'explanation', 'Argument Construction

**Situation**
Manufacturing jobs are created either within existing companies or in start-ups. Manufacturing jobs at existing firms are being created at a much slower rate this year than last year. It seems likely that the number of new start-ups will not exceed last year''s number and that the average number of new manufacturing jobs per start-up will not exceed last year''s number. So, fewer manufacturing jobs are likely to be created this year than last year.

**Reasoning**
*What function is served by the statement that any new manufacturing job is created either within an existing company or by the start-up of a new company? What function is served by the statement that the number of new jobs created this year will fall short of last year''s record number?* The first statement makes explicit a general background assumption that manufacturing jobs are created in just two ways. This assumption is used, along with other information, to support the argument''s main conclusion. The second statement gives the argument''s main conclusion, a prediction about how this year''s manufacturing-job creation will compare with last year''s.

A. **Correct.** The first statement expresses a truism: assuming that all manufacturing jobs are created by companies, it is obviously true that all such jobs are created either by companies that already existed or by new companies that did not exist before. The argument then goes on to claim that new-job creation in each of these categories in the current year will be less than in the previous year. Since these two categories are exhaustive (as indicated in the first **boldfaced** portion), the argument concludes that new-job creation in the current year will be less than in the previous year. This is the argument''s main conclusion (expressed in the second **boldfaced** portion).

B. The second statement is the argument''s main conclusion, not an intermediate conclusion used to support the argument''s main conclusion.

C. The second statement is the main conclusion of the argument, not a statement used as support for the main conclusion.

D. The argument merely asserts, and does not "seek to establish," the first statement. The first statement is a truism that does not need to be supported with evidence.

E. The second statement is the argument''s main conclusion and is not meant to present a challenge to the first statement. The first statement serves to provide partial support for the argument''s main conclusion.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '0b0eff83-c108-4777-b08b-f07cc0bd981c';

-- Q717
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In Stenland, many workers have been complaining that they cannot survive on minimum wage, the lowest wage an employer is permitted to pay. The government is proposing to raise the minimum wage. Many employers who pay their workers the current minimum wage argue that if it is raised, unemployment will increase because they will no longer be able to afford to employ as many workers.',
      'question_text', 'Which of the following, if true in Stenland, most strongly supports the claim that raising the minimum wage there will not have the effects that the employers predict?',
      'options', jsonb_build_object('a', 'For any position with wages below a living wage, the difficulty of finding and retaining employees adds as much to employment costs as would raising wages.', 'b', 'Raising the minimum wage does not also increase the amount employers have to contribute in employee benefits.', 'c', 'When inflation is taken into account, the proposed new minimum wage is not as high as the current one was when it was introduced.', 'd', 'Many employees currently being paid wages at the level of the proposed new minimum wage will demand significant wage increases.', 'e', 'Many employers who pay some workers only the minimum wage also pay other workers wages that are much higher than the minimum.'),
      'explanation', 'Argument Evaluation

**Situation**
Stenland''s government proposes to raise the minimum wage because many workers have complained they cannot survive on it. But many employers claim that raising the minimum wage will increase unemployment.

**Reasoning**
*What evidence would most strongly suggest that raising the minimum wage will not increase unemployment?* The employers with minimum-wage workers implicitly reason that because raising the minimum wage will increase the wages they have to pay each worker, it will reduce the number of workers they can afford to employ, and thus will increase unemployment. Evidence that the increased wage would not actually increase the employers'' expenses per employee would cast doubt on their prediction, as would evidence that reducing the number of minimum-wage workers would not increase the nation''s overall unemployment rate.

A. **Correct.** This suggests that raising the minimum wage would make it easier for employers to find and retain minimum-wage employees, and that the savings would fully offset the cost of paying the higher wages. If there were such offsetting savings, the employers should still be able to afford to employ as many workers as they currently do.

B. Even if raising the minimum wage does not increase employers'' costs for employee benefits, paying the higher wage might still in itself substantially increase employers'' overall costs per employee.

C. For all we know, the current minimum wage might have substantially increased unemployment when it was introduced.

D. These additional demands would probably raise employers'' overall costs per employee, making it more likely that increasing the minimum wage would increase overall unemployment.

E. Even if some workers receive more than the minimum wage, raising that wage could still raise employers'' expenses for employing low-wage workers, making it too expensive for the employers to employ as many workers overall.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '99be49db-5f2d-4e5a-87a2-18c06290c78a';

-- Q718
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Biologists with a predilection for theory have tried—and largely failed—to define what it is that makes something a living thing. Organisms take in energy-providing materials and excrete waste products, but so do automobiles.
Living things replicate and take part in evolution, but so do some computer programs. We must be open to the possibility that there are living things on other planets. Therefore, we will not be successful in defining what it is that makes something a living thing merely by examining living things on Earth—the only ones we know. Trying to do so is analogous to trying to specify ___.',
      'question_text', 'Which of the following most logically completes the passage?',
      'options', jsonb_build_object('a', 'the laws of physics by using pure mathematics', 'b', 'what a fish is by listing its chemical components', 'c', 'what an animal is by examining a plant', 'd', 'what a machine is by examining a sketch of it', 'e', 'what a mammal is by examining a zebra'),
      'explanation', 'Argument Construction

**Situation**
Some biologists have tried, unsuccessfully, to find a theoretically defensible account of what it means for something to be a living thing. Some of the suggested definitions are too broad because they include things that we would not regard as living. To find life on other planets, we must not narrow our conception of life by basing it simply on the kinds of life encountered on Earth.

**Reasoning**
*Which of the answer choices would be the logically most appropriate completion of the argument?* The argument points out that life-forms elsewhere in the universe may be very different from any of the life-forms on Earth. Both life-forms on Earth and life-forms discovered elsewhere would all qualify as members of a very large class, the class of all life-forms. Taking life-forms on Earth, a mere subset of the class of all life-forms, as representative of all life-forms would be a logical mistake and might not lead to success in defining what it means for something to be a living thing. The correct answer choice, therefore, would involve a case of specifying what some general class of things is by examining the members of only a small, and not necessarily representative, subset of that class of things. In other words, the correct answer choice will involve the logical mistake of taking a subset as representative of a larger class.

A. Pure mathematics is not a subset of the law of physics, so this does not involve the logical mistake of taking a subset as representative of a larger class.

B. The chemical components of a fish are what make up the fish; they are not a small subset of the fish, so this does not involve the logical mistake of taking a subset as representative of a larger class.

C. Plants are not a subset of the class of animals, so this does not involve the logical mistake of taking a subset as representative of a larger class.

D. A sketch of a machine is not a subclass of the machine itself, so this does not involve the logical mistake of taking a subset as representative of a larger class.

E. **Correct.** This involves the logical mistake of taking the class of zebras, a subclass of the class of mammals, as representative of the class of all mammals. Logically, it resembles taking the class of life-forms on Earth as representative of the class of all life-forms.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'd0516abe-58cf-44c8-b8e3-2b73b41ca478';

-- Q719
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'For the period from the eighth century through the eleventh century, the shifting boundaries between Kingdom F and Kingdom G have not been well charted. Although a certain village in a border region between the two kingdoms usually belonged to Kingdom G, ninth-century artifacts found in the village were in the typical Kingdom F style of that time. It is unclear whether the village was actually a part of Kingdom F in the ninth century or whether it was a part of Kingdom G but had merely adopted Kingdom F''s artistic styles under Kingdom F''s cultural influence.',
      'question_text', 'Which of the following would, if found in ninth-century sites in the village, best help in determining whether the village was a part of Kingdom F or Kingdom G in the ninth century?',
      'options', jsonb_build_object('a', 'A trading contract written in the Kingdom G dialect', 'b', 'A drawing of a dwelling complex known to have existed on the border of Kingdom F and Kingdom G in the ninth century', 'c', 'Knives and other utensils made from metal typical of ninth-century mining sites in Kingdom F', 'd', 'Some fragments of pottery made in the Kingdom G style from the seventh century out of materials only found in Kingdom F', 'e', 'Numerous teeth from the ninth century with a chemical signature typical only of teeth from people who had grown up in the heart of Kingdom F'),
      'explanation', 'Argument Construction

**Situation**
From the eighth century to the eleventh century, the boundaries between two kingdoms, F and G, shifted, but these shifts are not well documented. A certain village in a border region was usually part of Kingdom G, but ninth-century artifacts in the village are typical of the style of ninth-century artifacts from Kingdom F.

**Reasoning**
*What evidence, if it were found in the ninth-century sites in the village, would be most helpful in determining which of the two kingdoms the village was a part of during that century?* Information strongly indicating that during the ninth century the village was primarily settled by people clearly from Kingdom F would lend support to the claim that the village was part of Kingdom F in the ninth century.

A. A trading contract found at a ninth-century site in the village written in Kingdom G dialect would not settle whether the village was part of Kingdom G, because it could be the case that such a document would be written in that dialect even if the village were part of Kingdom F but regularly traded with Kingdom G.

B. Finding at a ninth-century site in the village a drawing of a dwelling complex known to have been on the border of Kingdom F and Kingdom G would not be useful in determining to which kingdom the village belonged at the time. We are not told in which kingdom that dwelling complex existed, and even if we were told, it could be that a villager in the other kingdom had a drawing of that complex for some reason (e.g., the villager could have had it because that complex was going to be attacked in a skirmish between the kingdoms).

C. Because there could have been trade between Kingdom F and Kingdom G, the fact that utensils made from metal typical of ninth-century mining sites in Kingdom F would not be very helpful in determining to which of the two kingdoms the village belonged in that century.

D. If fragments of pottery from the seventh century made in the Kingdom G style but from materials found only in Kingdom F were discovered, it would be unclear in which kingdom the pottery had been made. Given that the fragments may be from two centuries earlier than the period in question, and that we do not even know what kingdom the pottery was created in, these fragments would be of no use in determining to which kingdom the village belonged in the ninth century.

E. **Correct.** Although the mere presence of people from Kingdom F in the village would not provide strong support for the claim that the village was part of Kingdom F during the ninth century—the village could have shifted from Kingdom F to Kingdom G while maintaining much of its Kingdom F population—the presence of significant numbers of people from the heart of Kingdom F would support the claim that there was widespread migration of people from Kingdom F to the village. This is what one might reasonably expect if the village was part of Kingdom F during the ninth century. The discovery of numerous teeth that clearly belonged to people who grew up in the heart of Kingdom F in the ninth century would support the claim that many such people lived in the village during that century.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'b43db5bf-2386-45a0-8dad-752a638ee0b8';

-- Q720
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Sammy: For my arthritis, I am going to try my aunt''s diet: large amounts of wheat germ and garlic. She was able to move more easily right after she started that diet.
Pat: When my brother began that diet, his arthritis got worse. But he has been doing much better since he stopped eating vegetables in the nightshade family, such as tomatoes and peppers.',
      'question_text', 'Which of the following, if true, would provide a basis for explaining the fact that Sammy''s aunt and Pat''s brother had contrasting experiences with the same diet?',
      'options', jsonb_build_object('a', 'A change in diet, regardless of the nature of the change, frequently brings temporary relief from arthritis symptoms.', 'b', 'The compounds in garlic that can lessen the symptoms of arthritis are also present in tomatoes and peppers.', 'c', 'Arthritis is a chronic condition whose symptoms improve and worsen from time to time without regard to diet.', 'd', 'In general, men are more likely to have their arthritis symptoms alleviated by avoiding vegetables in the nightshade family than are women.', 'e', 'People who are closely related are more likely to experience the same result from adopting a particular diet than are people who are unrelated.'),
      'explanation', 'Argument Construction

**Situation**
Sammy''s aunt''s arthritis apparently improved after she consumed large amounts of wheat germ and garlic. Pat''s brother''s arthritis deteriorated after he followed the same diet. Since he stopped eating vegetables in the nightshade family, such as tomatoes and peppers, his arthritis has improved.

**Reasoning**
*What could account for the fact that Sammy''s aunt''s arthritis improved and Pat''s brother''s arthritis got worse after they both followed the wheat germ and garlic diet?* The fact that a person has a health improvement following a diet is, by itself, very weak evidence for the claim that the diet caused the improvement. More generally, the fact that one event follows another is seldom, by itself, evidence that the earlier event caused the later. This applies to both the experience of Sammy''s aunt and that of Pat''s brother with the wheat germ and garlic diet.

A. In theory, this could be somewhat relevant to Sammy''s aunt''s experience but not to Pat''s brother''s experience. It is, however, insufficient to explain either.

B. Even if this is true, it might be the case that a large quantity of the compounds in question must be consumed in concentrated form to benefit arthritis. No evidence is given to indicate whether this is so. Regardless, the puzzle as to why the wheat germ and garlic diet was followed by arthritis improvement in one case and not in the other remains.

C. **Correct.** If we know there are typically fluctuations in the severity of arthritis symptoms and these can occur independent of diet, then the divergent experiences of the two people can be attributed to such fluctuations—even if it is conceded that some diets can affect arthritis symptoms in some manner. The wheat germ and garlic diet may, or may not, be such a diet.

D. This could throw light on Pat''s brother''s experience but not on Sammy''s aunt''s experience.

E. If this is correct, it is still far too general to provide a basis for explaining why the experiences of the two people were different. Does it apply to arthritis? We''re not told. Nor are we told that it applies to the wheat germ and garlic diet. Is Pat''s brother closely related to Sammy''s aunt? We don''t know.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '4cea3fa5-dc00-4009-811d-bbfc475ab096';

-- Q721
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In the 1960s, surveys of Florida''s alligator population indicated that the population was dwindling rapidly. Hunting alligators was banned. By the early 1990s, the alligator population had recovered, and restricted hunting was allowed. Over the course of the 1990s, reports of alligators appearing on golf courses and lawns increased dramatically. Therefore, in spite of whatever alligator hunting went on, the alligator population must have increased significantly over the decade of the 1990s.',
      'question_text', 'Which of the following, if true, most seriously weakens the argument?',
      'options', jsonb_build_object('a', 'The human population of Florida increased significantly during the 1990s.', 'b', 'The hunting restrictions applied to commercial as well as private hunters.', 'c', 'The number of sightings of alligators in lakes and swamps increased greatly in Florida during the 1990s.', 'd', 'Throughout the 1990s, selling alligator products was more strictly regulated than hunting was.', 'e', 'Most of the sightings of alligators on golf courses and lawns in the 1990s occurred at times at which few people were present on those golf courses and lawns.'),
      'explanation', 'Argument Evaluation

**Situation**
In the 1960s, hunting alligators was banned in Florida to allow the alligator population to recover—as it did by the early 1990s. Then restricted hunting was allowed. But over the decade, reports of alligators appearing on golf courses and lawns increased greatly. The author of the argument concludes from this information that the alligator population must have increased significantly during the 1990s.

**Reasoning**
*What new piece of information would seriously weaken the argument?* Increased sightings of alligators could occur either because there are more alligators or because more people are seeing the ones that are there. Any information indicating an increase in the ratio of people to alligators in locations where the two species coexist could offer an alternative to the hypothesis that the alligator population increased.

A. **Correct.** The argument suggests that Florida is an area in which golf courses and lawns are common. A large rapid increase in the human population of such an area would probably lead to a significant increase in the number of golf courses and lawns, some of which would encroach on the alligators'' habitats. Even without any increase in the overall number of alligators, this could lead to an increase in both the percentage of alligators that venture onto golf courses and lawns and the number of people who happen to be in such locations when alligators are present.

B. This information is peripheral to the issue we are being asked to address; it neither weakens nor strengthens the argument.

C. This information tends to strengthen, not weaken, the argument; it suggests that the frequency of reported sightings in other places was reliable and that the sightings indicated a surge in the alligator population.

D. To the extent that this is relevant, it could provide some weak support for the argument. Strictly regulating the sale of alligator products could deter alligator hunting by making it less profitable and could thus allow further increases in the alligator population.

E. Without further evidence, the net effect of this information cannot be reliably determined. On the one hand, if sightings is understood as elliptical for reports of seeing alligators, this could suggest that some of the reports may be dubious because they are not corroborated by additional observers. On the other hand, it suggests that the alligator population may in fact have increased. Times when few people are present are also times when wildlife such as alligators would be more likely to venture onto lawns and golf courses. Without any evidence that sightings before the 1990s did not typically occur in such conditions, this suggests that the number of alligators observable at those times increased in the 1990s.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '1ab49717-45f0-44a9-b278-bdff6c07fccc';

-- Q722
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Infotek, a computer manufacturer in Katrovia, has just introduced a new personal computer model that sells for significantly less than any other model. Market research shows, however, that very few Katrovian households without personal computers would buy a computer, regardless of its price. Therefore, introducing the new model is unlikely to increase the number of computers in Katrovian homes.',
      'question_text', 'Which of the following is an assumption on which the argument depends?',
      'options', jsonb_build_object('a', 'Infotek achieved the lower price of the new model by using components of lower quality than those used by other manufacturers.', 'b', 'The main reason cited by consumers in Katrovia for replacing a personal computer is the desire to have an improved model.', 'c', 'Katrovians in households that already have computers are unlikely to purchase the new Infotek model as an additional computer for home use.', 'd', 'The price of other personal computers in Katrovia is unlikely to drop below the price of Infotek''s new model in the near future.', 'e', 'Most personal computers purchased in Katrovia are intended for home use.'),
      'explanation', 'Argument Construction

**Situation**
In Katrovia, a new personal computer model costs less than any other model. But market research shows that very few Katrovian households without personal computers would buy even cheap ones.

**Reasoning**
*What must be true in order for the stated facts to support the conclusion that introducing the new computer model is unlikely to increase the overall number of computers in Katrovian homes?* The market research supports the conclusion that no new computer model is likely to significantly increase the number of computers in Katrovian homes that currently lack computers. But the overall number of computers in Katrovian homes will still increase if Katrovian homes that already have computers buy additional computers while keeping their existing ones. So, the argument has to assume that the new computer model will not increase the number of additional computers purchased for Katrovian homes that already have computers.

A. Even if Infotek used high-quality components in the new computer model, Katrovians might still refuse to buy it.

B. Replacing a personal computer does not change the overall number of personal computers in homes, so Katrovians'' motives for replacing their computers are irrelevant to the argument.

C. **Correct.** As explained above, unless computers of the new model are purchased as additional computers for Katrovian homes that already have computers, the new model''s introduction is unlikely to increase the overall number of computers in Katrovian homes.

D. The assumption that other personal computer prices would stay relatively high does not help establish the link between its premises and its conclusion. If answer choice D were false, the argument would be no weaker than it is without any consideration of other computers'' potential prices.

E. If most personal computers purchased in Katrovia were not intended for home use, then the new model''s introduction would be even less likely to increase the number of personal computers in Katrovian homes. So, the argument does not depend on assuming that most of the computers purchased are for home use.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'dfa1ad81-7316-4746-bf70-3acc5f2227e5';

-- Q723
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Fast-food restaurants make up 45 percent of all restaurants in Canatria. Customers at these restaurants tend to be young; in fact, studies have shown that the older people get, the less likely they are to eat in fast-food restaurants. Since the average age of the Canatrian population is gradually rising and will continue to do so, the number of fast-food restaurants is likely to decrease.',
      'question_text', 'Which of the following, if true, most seriously weakens the argument?',
      'options', jsonb_build_object('a', 'Fast-food restaurants in Canatria are getting bigger, so each one can serve more customers.', 'b', 'Some older people eat at fast-food restaurants more frequently than the average young person.', 'c', 'Many people who rarely eat in fast-food restaurants nevertheless eat regularly in restaurants.', 'd', 'The overall population of Canatria is growing steadily.', 'e', 'As the population of Canatria gets older, more people are eating at home.'),
      'explanation', 'Argument Evaluation

**Situation**
In Canatria, the older people get, the less likely they are to eat in fast-food restaurants. The average age of Canatrians is increasing.

**Reasoning**
*What evidence would most weaken the support provided by the cited facts for the prediction that the number of fast-food restaurants in Canatria is likely to decrease?* The argument implicitly reasons that since studies have shown that Canatrians tend to eat in fast-food restaurants less as they get older, and since Canatrians are getting older on average, the proportion of Canatrians eating in fast-food restaurants will decline. The argument assumes that this means the overall number of fast-food restaurant customers will decline and that demand will decrease enough to reduce the number of fast-food restaurants that can sustain profitability. Consequently, fewer new fast-food restaurants will open or more old ones will close, or both. Thus, the number of fast-food restaurants in Canatria will fall. Any evidence casting doubt on any inference in this chain of implicit reasoning will weaken the argument.

A. This strengthens the argument by providing additional evidence that the total number of fast-food restaurants will decrease. If the average number of customers per fast-food restaurant is increasing, then fewer fast-food restaurants will be needed to serve the same—or a lesser—number of customers.

B. Even if a few individuals do not follow the general trends described, those trends could still reduce the overall demand for and number of fast-food restaurants.

C. The argument is only about fast-food restaurants, not restaurants of other types.

D. **Correct.** This suggests that even if the proportion of Canatrians eating at fast-food restaurants declines, the total number doing so may not decline. Thus, the total demand for and profitability of fast-food restaurants may not decline either, so the total number of fast-food restaurants in Canatria may not decrease.

E. If anything, this strengthens the argument by pointing out an additional trend likely to reduce the demand for, and thus the number of, fast-food restaurants in Canatria.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '60760eca-0a41-4021-b815-a94c67a6d879';

-- Q724
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Last year a chain of fast-food restaurants, whose menu had always centered on hamburgers, added its first vegetarian sandwich, much lower in fat than the chain''s other offerings. Despite heavy marketing, the new sandwich accounts for a very small proportion of the chain''s sales. The sandwich''s sales would have to quadruple to cover the costs associated with including it on the menu. Since such an increase is unlikely, the chain would be more profitable if it dropped the sandwich.',
      'question_text', 'Which of the following, if true, most seriously weakens the argument?',
      'options', jsonb_build_object('a', 'Although many of the chain''s customers have never tried the vegetarian sandwich, in a market research survey, most of those who had tried it reported that they were very satisfied with it.', 'b', 'Many of the people who eat at the chain''s restaurants also eat at the restaurants of competing chains and report no strong preference among the competitors.', 'c', 'Among fast-food chains in general, there has been little or no growth in hamburger sales over the past several years as the range of competing offerings at other restaurants has grown.', 'd', 'When even one member of a group of diners is a vegetarian or has a preference for low-fat food, the group tends to avoid restaurants that lack vegetarian or low-fat menu options.', 'e', 'An attempt by the chain to introduce a lower-fat hamburger failed several years ago, since it attracted few new customers and most of the chain''s regular customers greatly preferred the taste of the regular hamburgers.'),
      'explanation', 'Argument Evaluation

**Situation**
Last year a fast-food restaurant chain specializing in hamburgers started offering a low-fat vegetarian sandwich and marketed it heavily. The new sandwich''s sales are far too low to cover the costs associated with including it on the menu.

**Reasoning**
*What evidence would most weaken the support provided by the cited facts for the prediction that it would be more profitable for the chain to drop the sandwich?* The implicit argument is that since the new sandwich''s sales are too low to cover the costs associated with including it on the menu, offering the sandwich diminishes the chain''s profitability and will continue to do so if the sandwich continues to be offered. This reasoning assumes that the sandwich provides the chain no substantial indirect financial benefits except through its direct sales. It also assumes that the sandwich''s sales will not increase sufficiently to make the sandwich a viable product. Any evidence casting doubt on either of these assumptions will weaken the argument.

A. This gives information only about the respondents to the survey who had tried the sandwich (possibly very few), who were probably already more open to liking a vegetarian sandwich than any of the chain''s other customers. So, their responses are probably unrepresentative of the chain''s customers in general and do not suggest that the sandwich has enough market potential.

B. Although the issue of competition with other restaurants is not raised in the information provided, this new information, if anything, strengthens the argument by suggesting that the introduction of the new sandwich has not significantly enhanced customer preference for eating at the restaurants that offer the new sandwich.

C. This suggests that the cause of stagnation in fast-food restaurants'' hamburger sales has been competition from non-fast-food restaurants, but not that the non-fast-food restaurants competed by offering vegetarian options.

D. **Correct.** This suggests that even if the sandwich''s sales are low, it may indirectly increase the chain''s overall profits by encouraging large groups to eat at the chain.

E. This strengthens the argument by suggesting that the chain''s customers are generally not interested in low-fat menu options such as the new sandwich.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'e3eb4395-a77b-4d58-af45-73e8310f6a06';

-- Q725
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Transportation expenses accounted for a large portion of the total dollar amount spent on trips for pleasure by residents of the United States in 1997, and about half of the total dollar amount spent on transportation was for airfare. However, the large majority of United States residents who took trips for pleasure in 1997 did not travel by airplane but used other means of transportation.',
      'question_text', 'If the statements above are true, which of the following must also be true about United States residents who took trips for pleasure in 1997?',
      'options', jsonb_build_object('a', 'Most of those who traveled by airplane did so because the airfare to their destination was lower than the cost of other available means of transportation.', 'b', 'Most of those who traveled by airplane did so because other means of transportation to their destination were unavailable.', 'c', 'Per mile traveled, those who traveled by airplane tended to spend more on transportation to their destination than did those who used other means of transportation.', 'd', 'Overall, people who did not travel by airplane had lower average transportation expenses than people who did.', 'e', 'Those who traveled by airplane spent about as much, on average, on other means of transportation as they did on airfare.'),
      'explanation', 'Argument Construction

**Situation**
In 1997, about half of total transportation spending by U.S. residents taking trips for pleasure was for airfare. But the large majority of U.S. residents who took trips for pleasure in 1997 did not travel by airplane.

**Reasoning**
*What can be deduced from the stated facts?* The information provided indicates that among U.S. residents who took trips for pleasure in 1997, those who traveled by airplane were a small minority. Yet this small minority''s spending for airfare accounted for half of all transportation spending among residents taking trips for pleasure. It follows that on average, those who traveled by airplane must have spent far more per person on transportation than those who did not travel by airplane.

A. This does not follow logically from the information given. Most of those who traveled by airplane may have done so even if flying was more expensive than other modes of transportation—for example, because flying was faster or more comfortable.

B. This does not follow from the information given. Most of those who traveled by airplane may have done so even if many other modes of transportation were available—the other modes may all have been less desirable.

C. This does not follow from the information given. Those who traveled by airplane may have traveled much farther on average than those who used other means of transportation, so their transportation spending per mile traveled need not have been greater.

D. **Correct.** As explained above, those who traveled by airplane must have spent more per person on transportation than those who did not travel by airplane, on average. In other words, those who did not travel by airplane must have had lower average transportation expenses than those who did.

E. This does not follow from the information given. Although half the total dollar spending on transportation was for airfare, much of the transportation spending that was not for airfare was by the large majority of U.S. residents who did not travel by airplane.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '5102870b-f4a8-4466-88aa-ccefd1f962c3';

-- Q726
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Voters commonly condemn politicians for being insincere, but politicians often must disguise their true feelings when they make public statements. If they expressed their honest views—about, say, their party''s policies—then achieving politically necessary compromises would be much more difficult. Clearly, the very insincerity that people decry shows that our government is functioning well.',
      'question_text', 'Which of the following, if true, most seriously undermines this reasoning?',
      'options', jsonb_build_object('a', 'Achieving political compromises is not all that is necessary for the proper functioning of a government.', 'b', 'Some political compromises are not in the best long-term interest of the government.', 'c', 'Voters often judge politicians by criteria other than the sincerity with which they express their views.', 'd', 'A political party''s policies could turn out to be detrimental to the functioning of a government.', 'e', 'Some of the public statements made by politicians about their party''s policies could in fact be sincere.'),
      'explanation', 'Argument Evaluation

**Situation**
Politicians must often make insincere public statements because expressing their true feelings would make it harder for them to achieve politically necessary compromises.

**Reasoning**
*What would suggest that the argument''s premises do not establish that politicians'' insincerity shows our government is functioning well?* The implicit reasoning is that insincerity helps politicians achieve politically necessary compromises, and these compromises help our government to function well, so insincerity must show that our government is functioning well. Evidence that these necessary compromises do not ensure that our government functions well would undermine the argument''s reasoning, as would evidence that politicians'' insincerity has other substantial effects that hinder the government''s functioning.

A. **Correct.** If governments may function poorly even when insincerity allows necessary political compromises to be made, then the argument''s premises do not establish that politicians'' insincerity shows our government is functioning well.

B. The argument does not require that all political compromises help government to function well, only that politically necessary compromises do.

C. Even if voters often judge politicians by criteria other than their sincerity, they may also often decry politicians'' insincerity, not realizing or caring that such insincerity helps the government function well.

D. Even if a political party''s policies impair the government''s functioning, politically necessary compromises by politicians in that party could improve the government''s functioning.

E. Even if politicians sometimes speak sincerely about their party''s policies, their general willingness to be insincere as needed to achieve politically necessary compromises could be a sign that the government is functioning well.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'ecd19571-21a2-4949-aee8-267515163bb5';

-- Q727
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'One summer, floods covered low-lying garlic fields situated in a region with a large mosquito population. Since mosquitoes lay their eggs in standing water, flooded fields would normally attract mosquitoes, yet no mosquitoes were found in the fields. Diallyl sulfide, a major component of garlic, is known to repel several species of insects, including mosquitoes, so it is likely that diallyl sulfide from the garlic repelled the mosquitoes.',
      'question_text', 'Which of the following, if true, most strengthens the argument?',
      'options', jsonb_build_object('a', 'Diallyl sulfide is also found in onions but at concentrations lower than in garlic.', 'b', 'The mosquito population of the region as a whole was significantly smaller during the year in which the flooding took place than it had been in previous years.', 'c', 'By the end of the summer, most of the garlic plants in the flooded fields had been killed by waterborne fungi.', 'd', 'Many insect species not repelled by diallyl sulfide were found in the flooded garlic fields throughout the summer.', 'e', 'Mosquitoes are known to be susceptible to toxins in plants other than garlic, such as marigolds.'),
      'explanation', 'Argument Evaluation

**Situation**
When summer floods covered garlic fields in an area with many mosquitoes, no mosquitoes were found in the fields, even though flooded fields would normally attract mosquitoes to lay their eggs in the water.
Diallyl sulfide, which is found in garlic, repels mosquitoes and some other insect species and likely accounts for the lack of mosquitoes in the area.

**Reasoning**
*Given the facts cited, what would provide additional evidence that diallyl sulfide from the garlic made mosquitoes avoid the flooded fields?* The argument would be strengthened by any independent evidence suggesting that diallyl sulfide pervaded the flooded fields or excluding other factors that might explain the absence of mosquitoes in the fields.

A. This could strengthen the argument if mosquitoes also avoid flooded onion fields, but we do not know whether they do.

B. This would weaken the argument by suggesting that the general mosquito population decline, rather than the diallyl sulfide, could explain the absence of mosquitoes in the fields.

C. It is not clear how this would affect the amount of diallyl sulfide in the flooded fields, so this does not provide evidence that the diallyl sulfide repelled the mosquitoes.

D. **Correct.** This provides evidence that there was no factor other than diallyl sulfide that reduced insect populations in the flooded garlic fields.

E. If anything, this would weaken the argument, since it is at least possible that some of these toxins were present in the flooded fields.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'b0241133-801d-4c40-a8be-b12259efc75e';

-- Q728
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The population of desert tortoises in Targland''s Red Desert has declined, partly because they are captured for sale as pets and partly because people riding all-terrain vehicles have damaged their habitat. Targland plans to halt this population decline by blocking the current access routes into the desert and announcing new regulations to allow access only on foot. Targland''s officials predict that these measures will be adequate, since it is difficult to collect the tortoises without a vehicle.',
      'question_text', 'Which of the following would it be most important to establish in order to evaluate the officials'' prediction?',
      'options', jsonb_build_object('a', 'Whether possessing the tortoises as pets remains legally permissible in Targland', 'b', 'Whether Targland is able to enforce the regulations with respect to all-terrain vehicle entry at points other than the current access routes', 'c', 'Whether the Red Desert tortoises are most active during the day or at night', 'd', 'Whether people who travel on foot in the Red Desert often encounter the tortoises', 'e', 'Whether the Targland authorities held public hearings before restricting entry by vehicle into the Red Desert'),
      'explanation', 'Argument Evaluation

**Situation**
Desert tortoises in Targland''s Red Desert have been captured for sale as pets. Furthermore, these tortoises'' habitat has been damaged by people riding all-terrain vehicles. These factors have led to the decline of the tortoise population in the Red Desert, a decline Targland plans to halt by blocking current access and announcing new regulations limiting access to only by foot. Officials predict these will be adequate because prohibiting vehicles will make it harder to collect tortoises.

**Reasoning**
*What would be most useful to know in order to evaluate the officials'' prediction?* If Targland''s new restrictions are not enforceable, then there is good reason to doubt the officials'' prediction that these restrictions will be adequate to protect the tortoises. Thus, it would be useful to know whether either or both of the new restrictions can be enforced.

A. The prediction is not based on whether it is legally permissible to possess the tortoises as pets, but rather on whether people will be as capable of collecting them.

B. **Correct.** The prediction is based on whether Targland can effectively restrict access to foot traffic. If it cannot, and people can still gain entry to the desert using all-terrain vehicles at points other than the current access routes, then the fact that they would still be able to gain access casts doubt on the officials'' prediction.

C. The prediction in no way depends on whether the tortoises are most active during the day or at night.

D. The prediction is based on the difficulty of collecting tortoises without a vehicle—presumably because it would be harder to transport them. Therefore, it is not particularly relevant whether people on foot in the Red Desert often encounter tortoises.

E. The prediction would be just as likely to be accurate whether or not the Targland authorities held public hearings before restricting entry by vehicle to the desert. All that matters is whether the restrictions are effectively communicated and enforced.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '4868a994-407a-49c8-be4c-8763b5f0adbe';

-- Q729
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Yeasts capable of leavening bread are widespread, and in the many centuries during which the ancient Egyptians made only unleavened bread, such yeasts must frequently have been mixed into bread doughs accidentally. The Egyptians, however, did not discover leavened bread until about 3000 B.C. That discovery roughly coincided with the introduction of a wheat variety that was preferable to previous varieties because its edible kernel could be removed from the husk without first toasting the grain.',
      'question_text', 'Which of the following, if true, provides the strongest evidence that the two developments were causally related?',
      'options', jsonb_build_object('a', 'Even after the ancient Egyptians discovered leavened bread and the techniques for reliably producing it were well known, unleavened bread continued to be widely consumed.', 'b', 'Only when the Egyptians stopped the practice of toasting grain were their stone-lined grain-toasting pits available for baking bread.', 'c', 'Heating a wheat kernel destroys its gluten, a protein that must be present in order for yeast to leaven bread dough.', 'd', 'The new variety of wheat, which had a more delicate flavor because it was not toasted, was reserved for the consumption ofhigh officials when it first began to be grown.', 'e', 'Because the husk of the new variety of wheat was more easily removed, flour made from it required less effort to produce.'),
      'explanation', 'Argument Construction

**Situation**
Because they were widespread, yeasts capable of leavening bread most likely were occasionally accidentally mixed into the doughs of the unleavened bread made by ancient Egyptians. Despite this, Egyptians did not discover leavened bread until about 3000 B.C., around the time of the introduction of an improved variety of wheat that had kernels that could be removed from the husk without toasting.

**Reasoning**
*What evidence would suggest these developments were causally linked?* If one of these two developments would not have been possible without the other, there is reason to think that the developments were causally linked in some way.

A. Continued consumption of unleavened bread tells us nothing about the improved variety of wheat and so provides no evidence regarding a causal link between that variety of wheat and the ancient Egyptians'' discovery of leavened bread.

B. The availability of the pits for baking bread does not indicate that leavened bread could not have been discovered, and then baked, in the ovens that were used previously to bake unleavened bread.

C. **Correct.** Because gluten is destroyed when a wheat kernel is toasted and gluten is necessary for yeast to be able to leaven dough, leavened dough was directly enabled by the introduction of the improved wheat variety.

D. The new variety of wheat could have been reserved for high officials because of its delicate flavor even if the ancient Egyptians had never discovered leavened bread, so it does not imply a causal link.

E. Because the husk of the new variety of wheat was more easily removed, flour made from it required less effort to produce.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '4c5f4256-3844-4dbf-96dc-437d11aa14fc';

-- Q730
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In parts of the Caribbean, the manatee, an endangered marine mammal, has long been hunted for food. Having noted the manatee hunters'' expert knowledge of manatees'' habits, local conservationists are encouraging the hunters to stop hunting and instead to take tourists on boat rides to see manatees. Many tourists are interested, so the plan has promise of achieving the twin goals of giving the former hunters a good income and helping ensure the manatees'' survival.',
      'question_text', 'Which of the following, if true, raises the most serious doubt about the plan''s chance of success?',
      'options', jsonb_build_object('a', 'Some tourists who visit these parts of the Caribbean are uninterested in manatees and would not take a boat ride to see them.', 'b', 'Recovery of the species would enable some hunting to continue without putting the manatees'' survival in jeopardy again.', 'c', 'In areas where manatees have traditionally been hunted for food, local people could easily replace the manatee meat in their diets with other foods obtained from the sea.', 'd', 'There would not be enough former manatee hunters to act as guides for all the tourists who want to see manatees.', 'e', 'To maintain a good income guiding tourists, manatee hunters would have to use far larger boats and make many more trips into the manatees'' fragile habitat than they currently do.'),
      'explanation', 'Evaluation of a Plan

**Situation**
The hunters of manatees in the Caribbean are experts in the habits of the endangered animals. Because of this, conservationists are encouraging the hunters to stop hunting and to give tours to the many tourists who are interested in the animals, thereby helping to preserve manatees without forsaking their livelihoods.

**Reasoning**
*What would cast doubt on this plan being successful?* If there were additional evidence that switching to giving tours would be at least as harmful to the manatees'' survival as hunting, then this evidence would cast doubt on the plan''s likelihood of success.

A. The success of the plan would not depend on whether every Caribbean tourist has interest in taking a boat ride to see manatees; it merely requires that there be a large enough number of them.

B. This claim is relevant only if the plan is at least a partial success. It therefore provides no reason to believe the plan would not be successful.

C. If people who have traditionally consumed manatee meat as food could easily replace manatee meat in their diets, then that would suggest an additional reason why the plan might be successful rather than a failure.

D. This would provide some evidence that the plan might succeed, not fail, because it suggests that there would be plenty of work for the hunters, thereby helping to ensure that they had a good income.

E. **Correct.** If the hunters who switch from hunting to tourism would be required to have larger boats and increase their number of trips into the manatees'' fragile habitat to maintain a good income, then at least one of the two goals of the plan would be less likely to be met: Either the hunters would not be able to have a good income or the manatees'' habitat, and thereby the manatees themselves, would be at risk.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '95ad5c85-3311-4305-a8b1-ac23ff2458da';

-- Q731
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'That the application of new technology can increase the productivity of existing coal mines is demonstrated by the case of Tribnia''s coal industry. Coal output per miner in Tribnia is double what it was five years ago even though no new mines have opened.',
      'question_text', 'Which of the following can be properly concluded from the statement about coal output per miner in the passage?',
      'options', jsonb_build_object('a', 'If the number of miners working in Tribnian coal mines has remained constant in the past five years, Tribnia''s total coal production has doubled in that period of time.', 'b', 'Any individual Tribnian coal mine that achieved an increase in overall output in the past five years has also experienced an increase in output per miner.', 'c', 'If any new coal mines had opened in Tribnia in the past five years, then the increase in output per miner would have been even greater than it actually was.', 'd', 'If any individual Tribnian coal mine has not increased its output per miner in the past five years, then that mine''s overall output has declined or remained constant.', 'e', 'In Tribnia, the cost of producing a given quantity of coal has declined over the past five years.'),
      'explanation', 'Argument Construction

**Situation**
Tribnia''s coal industry provides an example of the increased productivity enabled by new technology. In the past five years, coal output per miner has doubled. No new mines have opened in the same period.

**Reasoning**
*What conclusion can be drawn from the information regarding average output per miner?* If coal output per miner has doubled in five years, then that increase would produce a corresponding change in overall output factored by the number of miners.

A. **Correct.** The passage states that output per miner has doubled in five years. If the total number of miners is the same, it would necessarily follow that overall output has doubled in five years.

B. While this is plausible, individual mines may have experienced the same or lower output per miner regardless of their overall output; they could have simply hired more miners to increase output.

C. There is no reason to conclude that new mines would have increased the output per miner.

D. It does not follow that a lack of increased output per miner implies a similar lack of overall increase; individual mines could have increased total output with more hiring.

E. While increased productivity might imply declining costs, such a decline does not necessarily follow—for example, savings in labor costs might be offset by the cost of the new technology.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '832ad06d-8678-4727-ba6d-655b827959bd';

-- Q732
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The quality of an unrefined olive oil is not actually defined in terms of acidity, yet extensive tests have shown that the less free oleic acid an unrefined olive oil contains per liter, the higher its quality. The proportion of free oleic acid that an olive oil contains is an accurate measure of the oil''s acidity.',
      'question_text', 'If the statements above are all true, which of the following conclusions is best supported by them?',
      'options', jsonb_build_object('a', 'When an olive oil is refined, the concentration of oleic acid in the oil is reduced.', 'b', 'The quality of an unrefined olive oil can be determined only by accurately measuring its acidity.', 'c', 'If an unrefined olive oil is intermediate in acidity between two other unrefined olive oils, it will also be intermediate between them in quality.', 'd', 'Free oleic acid is the only acid that unrefined olive oil contains.', 'e', 'People who judge the quality of unrefined olive oils actually judge those oils by their acidity, which the judges can taste.'),
      'explanation', 'Argument Construction

**Situation**
While the quality of unrefined olive oil is not explicitly equated with its acidity, tests show that progressively lower levels of free oleic acid correlate with progressively higher quality. Levels of free oleic acid accurately correspond to the oil''s overall acidity.

**Reasoning**
*What follows from the stated relationships regarding acidity and quality?* The passage states there is a direct relation between levels of free oleic acid and overall acidity, but an inverse relation between levels of free oleic acid and quality: the lower the level of free oleic acid, the higher the quality. Taken together, these facts support the conclusion that overall acidity is a strong predictor of quality in unrefined olive oil:
lower-acid oils will be higher quality, higher-acid oils will be lower quality, and medium-acidity oils will be of medium quality.

A. The passage suggests nothing about the effects of refinement on levels of oleic acid.

B. The facts included imply that acidity inversely predicts quality, not that acidity is the only way to assess quality.

C. **Correct.** The information supports the conclusion that higher-acid oils will be lower quality, lower-acid oils will be higher quality, and therefore that intermediate-acid oils will be of intermediate quality.

D. The passage states oleic acid levels precisely correspond with overall acid levels; it does not support the conclusion that oleic acid is the only acid in unrefined olive oil.

E. While the information certainly supports the conclusion that acidity affects the taste of olive oil, it does not follow that judges are evaluating olive oils specifically on their acidity, only that they are likely to prefer the taste of less acidic oils.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '24cd32fb-becb-4136-a4f6-7d60056e23b9';

-- Q733
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Shipping clerk: The five specially ordered shipments sent out last week were sent out on Thursday. Last week, all of the shipments sent out on Friday consisted entirely of building supplies, and the shipping department then closed for the weekend. Four shipments were sent to Truax Construction last week, only three of which consisted of building supplies.',
      'question_text', 'If the shipping clerk''s statements are true, which of the following must also be true?',
      'options', jsonb_build_object('a', 'At least one of the shipments sent to Truax Construction last week was specially ordered.', 'b', 'At least one of last week''s specially ordered shipments did not consist of building supplies.', 'c', 'At least one of the shipments sent to Truax Construction was not sent out on Thursday of last week.', 'd', 'At least one of the shipments sent out on Friday of last week was sent to Truax Construction.', 'e', 'At least one of the shipments sent to Truax Construction last week was sent out before Friday.'),
      'explanation', 'Argument Construction

**Situation**
A shipping clerk states five specially ordered shipments went out on Thursday. Moreover, all the Friday shipments exclusively contained building supplies; no shipments went out after Friday. Truax was sent four shipments, and only three of those shipments were building supplies.

**Reasoning**
*What follows from the facts presented?* The clerk states Truax was sent four shipments, of which three were building supplies. Some or all of those three shipments could have been sent on Friday since only building supplies went out that day. That leaves at least one shipment to Truax unaccounted for. Since no shipments went out after Friday, it follows that at least one shipment to Truax must have been sent before Friday.

A. It does not follow that any of Truax''s shipments were specially ordered; they could have been shipped before Thursday.

B. There is not enough information provided to conclude anything about the nature of Thursday''s specially ordered shipments.

C. We can only conclude that at least one Truax shipment went out before Friday; if Truax''s shipments were specially ordered, it is quite possible they all went out on Thursday.

D. All of the Truax shipments could have gone out on any day before Friday of that week, so we cannot conclude one shipment to Truax must have gone on Friday.

E. **Correct.** Since only building materials went out on Friday and three out of four of Truax''s shipments contained building materials, it follows that at least one of Truax''s shipments cannot have been sent on Friday and therefore must have been shipped on one of the days before.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '3d098bf7-8102-466e-bdaf-392440e7456c';

-- Q734
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In Kravonia, the average salary for jobs requiring a college degree has always been higher than the average salary for jobs that do not require a degree. Current enrollments in Kravonia''s colleges indicate that over the next four years, the percentage of the Kravonian workforce with college degrees will increase dramatically. Therefore, the average salary for all workers in Kravonia is likely to increase over the next four years.',
      'question_text', 'Which of the following is an assumption on which the argument depends?',
      'options', jsonb_build_object('a', 'Kravonians with more than one college degree earn more, on average, than do Kravonians with only one college degree.', 'b', 'The percentage of Kravonians who attend college in order to earn higher salaries is higher now than it was several years ago.', 'c', 'The higher average salary for jobs requiring a college degree is not due largely to a scarcity among the Kravonian workforce of people with a college degree.', 'd', 'The average salary in Kravonia for jobs that do not require a college degree will not increase over the next four years.', 'e', 'Few members of the Kravonian workforce earned their degrees in other countries.'),
      'explanation', 'Argument Construction

**Situation**
In Kravonia, average salaries for college graduates are higher than for nongraduates. High enrollment in Kravonia''s colleges will result in a far greater share of workers with college degrees in coming years. Overall average salaries will therefore increase.

**Reasoning**
*What must be true for the conclusion to follow?* A growing percentage of higher-paid workers would indeed be expected to raise average salaries in Kravonia, but that average increase will follow only if college graduates continue to command high salaries even when their numbers increase dramatically. Therefore, the argument relies on the assumption that greater numbers of degreed workers will not increase competition for degree-dependent jobs and thereby lower their average salaries.

A. While this might be the case, the argument does not depend on relative salaries for workers with multiple degrees.

B. The conclusion does not rely on the motivations of Kravonians for attending college.

C. **Correct.** The argument relies on the assumption that college graduates have not received high salaries owing to the relative scarcity of degreed workers; if scarcity is the reason for those high salaries, an abundance of new college graduates entering the job market will lower their salaries and therefore lower the average Kravonian salaries overall.

D. The conclusion may rely on the assumption that salaries for nondegree jobs will not decline significantly since that would depress the average, but it does not rely on such salaries not rising.

E. The argument states that national enrollment figures indicate the percentage of all graduates will rise dramatically; there is no reason to believe the expectation of rising overall salaries depends on a low number of foreign degrees.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '79726e91-ae60-487c-81b1-069c3a58562e';

-- Q735
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Charcoal from a hearth site in Colorado, 2,000 miles south of Alaska, is known to be 11,200 years old. Siberia is located in northeast Russia, and Alaska is located in northwest America. Researchers reasoned since glaciers prevented human migration south from the Alaska-Siberia land bridge between 18,000 and 11,000 years ago, humans must have come to the Americas more than 18,000 years ago.',
      'question_text', 'Which of the following pieces of new evidence would cast doubt on the conclusion drawn above?',
      'options', jsonb_build_object('a', 'Using new radiocarbon dating techniques, it was determined the charcoal from the Colorado site was at least 11,400 years old.', 'b', 'Another campsite was found in New Mexico with remains dated at 16,000 years old.', 'c', 'A computer simulation of glacial activity showed it would already have been impossible for humans to travel south overland from Alaska 18,500 years ago.', 'd', 'Using new radiocarbon dating techniques, it was proved that an ice-free corridor allowed passage south from the Alaska-Siberia land bridge approximately 11,400 years ago.', 'e', 'Studies of various other hunting-gathering populations showed convincingly that once the glaciers allowed passage, humans could have migrated from Alaska to Colorado in about 20 years.'),
      'explanation', 'Argument Evaluation

**Situation**
A hearth site in Colorado is 11,200 years old. Glaciers obstructed human migration from Siberia to Alaska, and therefore to the rest of North America, during a period lasting from 18,000 to 11,000 years ago, so researchers concluded human migration must have occurred before the glaciers blocked the land bridge—that is, before 18,000 years ago.

**Reasoning**
*What would have made it possible for humans to migrate more recently?* The researchers'' conclusion that humans must have come to North America prior to the obstruction caused by the glaciers 18,000 years ago is reasonable unless new evidence calls their premises into question. If, for example, evidence suggested the land bridge was open at any more recent date before the date of the hearth site, that would imply humans could have arrived later and therefore cast doubt on the researchers'' conclusion.

A. If the hearth site is at least 11,400 years old, it would still fall in or prior to the interval when the land bridge was obstructed and therefore suggest humans must have arrived before the obstruction; therefore, that fact would not cast doubt on the conclusion.

B. A much earlier campsite would tend to support the researchers'' conclusion, not cast doubt on it.

C. While this fact would imply an even earlier date of human migration, it would not cast doubt on the conclusion that such migration occurred more than 18,000 years ago.

D. **Correct.** Evidence of a corridor that allowed human migration 11,400 years ago—200 years before the date of the campsite—would cast doubt on the conclusion that humans necessarily must have arrived in North America much earlier.

E. The fact that hunter-gatherers could have made the journey to Colorado in twenty years has no bearing on whether they could have made that journey more recently than 18,000 years ago.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '20880b8d-bc10-48e1-b949-f1256a664010';

-- Q736
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'A group of children of various ages was read stories in which people caused harm, with some of those people doing so intentionally, and some accidentally. When asked about appropriate punishments for those who had caused harm, the younger children, unlike the older ones, assigned punishments that did not vary according to whether the harm was done intentionally or accidentally. Younger children, then, do not regard people''s intentions as relevant to punishment.',
      'question_text', 'Which of the following, if true, would most seriously weaken the conclusion above?',
      'options', jsonb_build_object('a', 'In interpreting these stories, the listeners had to draw on a relatively mature sense of human psychology in order to tell whether harm was produced intentionally or accidentally.', 'b', 'In these stories, the severity of the harm produced was clearly stated.', 'c', 'Younger children are as likely to produce harm unintentionally as older children.', 'd', 'The older children assigned punishment in a way that closely resembled the way adults had assigned punishment in a similar experiment.', 'e', 'The younger children assigned punishments that varied according to the severity of the harm done by the agents in the stories.'),
      'explanation', 'Argument Evaluation

**Situation**
Children of mixed ages heard stories about people causing harm; in some cases the harm was caused deliberately, and in other cases it was caused accidentally. When the children were asked what punishments would be appropriate, younger children, unlike older ones, assigned equal punishments regardless of whether the harm was intentional. This leads to the conclusion that younger children do not think intentions should matter when determining punishment.

**Reasoning**
*What would undermine support for the conclusion that young children regard intention as irrelevant?* If the younger children had difficulty discerning whether or not the harmful acts in the stories were intentional, that would weaken support for the conclusion that these children think intention should not matter.

A. **Correct.** If it required maturity to evaluate whether the harm caused was intentional or accidental, that fact might suggest the younger children simply could not make that determination, not that they believed intention should not affect punishment as the argument concludes.

B. The argument rests on children''s understanding of the intention behind the harm, not on their understanding the severity of the harm itself.

C. The relative rates at which younger and older children accidentally cause harm are not relevant to the conclusion.

D. The similarity between older children''s responses and those of adults has no bearing on the beliefs of younger children regarding the relationship between intentionality and guilt.

E. The fact that younger children took the severity of harm into account does not affect the conclusion that these children believed intention should not be taken into account.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = 'd09cae28-9e43-48e4-ad71-f50f252020e7';

-- Q737
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Mansour: We should both plan to change some of our investments from coal companies to less polluting energy companies, and here''s why: Consumers are increasingly demanding nonpolluting energy, and energy companies are increasingly supplying it.
Therese: I''m not sure we should do what you suggest. As demand for nonpolluting energy increases relative to supply, its price will increase, and then the more polluting energy will cost relatively less. Demand for the cheaper, dirtier energy forms will then increase, as will the stock values of the companies that produce them.',
      'question_text', 'Therese responds to Mansour''s proposal by doing which of the following?',
      'options', jsonb_build_object('a', 'Advocating that consumers use less expensive forms of energy', 'b', 'Implying that not all uses of coal for energy are necessarily polluting', 'c', 'Disagreeing with Mansour''s claim that consumers are increasingly demanding nonpolluting energy', 'd', 'Suggesting that leaving their existing energy investments unchanged could be the better course', 'e', 'Providing a reason to doubt Mansour''s assumption that supply of nonpolluting energy will increase in line with demand'),
      'explanation', 'Evaluation of a Plan

**Situation**
Therese and Mansour are discussing what energy investments will be more profitable. Mansour claims the most profitable course is to move their investments from dirty to clean energy because consumer demand for clean energy is increasing. Therese counters with the claim that demand for clean energy will outstrip supply and thereby raise prices for such energy; that in turn will make dirty energy comparatively cheap, driving demand back in its direction and thereby making investments in dirty energy more profitable once again.

**Reasoning**
*What function does Therese''s argument perform?* Mansour argues they should switch to investing in clean energy as he believes it will be more profitable. Therese argues shifting demand will ultimately make dirty energy more profitable; this in turn implies keeping their investments in dirty energy will be the superior course.

A. Therese anticipates consumers will choose cheaper energy but does not advocate for such a choice.

B. Therese does not imply there are some uses of coal for energy that may not be polluting, only that investing in coal is likely to be profitable.

C. Therese does not dispute Mansour''s claim that demand for clean energy is rising; rather, she anticipates rising demand will lead to rising prices.

D. **Correct.** Therese''s argument suggests their current investments in dirty energy will ultimately become more profitable, and therefore it would be better not to switch to investing in clean energy.

E. Mansour may well assume the supply of clean energy will increase in line with demand, and Therese assumes supply will not meet demand, but she offers no evidence that her position is the correct one.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'medium',
  difficulty_level = 2,
  updated_at = now()
WHERE id = '8729d8d9-f7f7-4dea-b838-7a34134933b7';

-- Q738: SKIPPED (not in DB)

-- Q739
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Duckbill dinosaurs, like today''s monitor lizards, had particularly long tails, which they could whip at considerable speed. Monitor lizards use their tails to strike predators. However, although duckbill tails were otherwise very similar to those of monitor lizards, the duckbill''s tailbones were proportionately much thinner and thus more delicate. Moreover, to ward off their proportionately much larger predators, duckbills would have had to whip their tails considerably faster than monitor lizards do.',
      'question_text', 'The information given, if accurate, provides the strongest support for which of the following hypotheses?',
      'options', jsonb_build_object('a', 'If duckbills whipped their tails faster than monitor lizards do, the duckbill''s tail would have been effective at warding off the duckbills'' fiercest predators.', 'b', 'Duckbills used their tails to strike predators, and their tailbones were frequently damaged from the impact.', 'c', 'Using their tails was not the only means duckbills had for warding off predators.', 'd', 'Duckbills were at much greater risk of being killed by a predator than monitor lizards are.', 'e', 'The tails of duckbills, if used to ward off predators, would have been more likely than the tails of monitor lizards to sustain damage from the impact.'),
      'explanation', 'Argument Construction

**Situation**
Duckbill dinosaur tails were like the tails of contemporary monitor lizards in that they were very long. They differed, though, in that their tailbones were much thinner and more delicate than monitor lizards'' tailbones. Monitor lizards use their tails to strike predators. If duckbills did so, they would have had to whip their tails much faster, as their predators were proportionately much larger.

**Reasoning**
*Which hypothesis is most strongly supported by the given information?* The information states that duckbills would have had to whip their tails much faster than monitor lizards do to ward off their proportionately larger predators, but their tailbones were more delicate. It would be reasonable to conclude, then, that duckbills'' tails would have been more likely to sustain damage if used to ward off predators than monitor lizards'' tails are.

A. The information gives us little reason to be confident that duckbills would have been effective at warding off their fiercest predators even if they whipped their tails faster than monitor lizards do. Note that we are not even told how effective monitor lizards are at warding off particularly fierce predators.

B. The information gives us both a reason to think that duckbills might have used their tails to strike predators—their tails are similar in length to the tails of monitor lizards, which are used to strike predators—and reasons to think they might not have done so—their tailbones were much thinner and more delicate than monitor lizards'' tailbones, and they would have had to whip their tails much faster than monitor lizards whip theirs. Therefore, the support for this answer choice is not very strong.

C. The information does give some modest support for the claim that duckbills'' tails would not provide a particularly good defense against their predators. This suggests weakly that they had other defenses against their predators. Note, though, that this answer choice, as worded, entails that duckbills did use their tails as a defense; it was simply not the only defense. But the information on which we are to base the hypothesis is compatible with duckbills not having used their tails to ward off predators.

D. The information does not give much support for this answer choice. It could be that duckbills had other effective defenses against their predators. Perhaps they were fast or had sharp claws.

E. **Correct.** As noted above, duckbills would have had to whip their tails much faster than monitor lizards do to ward off their proportionately larger predators, but their tailbones were more delicate, so duckbills'' tails would have been more likely to sustain damage if used to ward off predators than monitor lizards'' tails are.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '0be4089a-6196-4705-90f1-d0aef98799fb';

-- Q740
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In an attempt to produce a coffee plant that would yield beans containing no caffeine, the synthesis of a substance known to be integral to the initial stages of caffeine production was blocked either in the beans, in the leaves, or both. For those plants in which synthesis of the substance was blocked only in the leaves, the resulting beans contained no caffeine.',
      'question_text', 'Any of the following, if true, would provide the basis for an explanation of the observed results EXCEPT:',
      'options', jsonb_build_object('a', 'In coffee plants, the substance is synthesized only in the leaves and then moves to the beans, where the initial stages of caffeine production take place.', 'b', 'In coffee plants, the last stage of caffeine production takes place in the beans using a compound that is produced only in the leaves by the substance.', 'c', 'In coffee plants, the initial stages of caffeine production take place only in the beans, but later stages depend on another substance that is synthesized only in the leaves and does not depend on the blocked substance.', 'd', 'In coffee plants, caffeine production takes place only in the leaves, but the caffeine then moves to the beans.', 'e', 'Caffeine was produced in the beans of the modified coffee plants, but all of it moved to the leaves, which normally produce their own caffeine.'),
      'explanation', 'Argument Evaluation

**Situation**
The synthesis of a substance integral to the initial production of caffeine was blocked only in the beans of some coffee plants, only in the leaves of others, and in both the beans and leaves of yet other coffee plants.
No caffeine was found in beans from the plants in which the synthesis of the substance was blocked only in the leaves.

**Reasoning**
*Which claim would NOT form the basis for an explanation of the observed results?* There are many possible explanations. For instance, the results could be explained by any claim that indicates (1) that the substance integral to the initial production of caffeine is synthesized only in the leaves, or (2) that the substance is also produced in the beans but, when it is blocked from being produced in the leaves, that substance or the caffeine that is produced in the beans is entirely depleted from the beans. However, the observed results would not be explained by any claim that (1) indicates that the early stages of caffeine synthesis can occur in the beans, entailing that the crucial substance is present in the beans even when it is blocked in the leaves, and (2) provides no explanation for why blocking the crucial substance in the leaves would prevent the completion of the caffeine synthesis in the beans.
A.If a substance that is integral to the initial production of caffeine is produced only in the leaves, and that production has been blocked, then the observed results are to be expected.
Therefore, this answer choice does not give us reason to expect the observed results, and so does not serve as the basis for an explanation of those results.

B. If the last stage of caffeine production requires a compound that is produced in the leaves by a substance the synthesis of which is blocked in the leaves, then the observed results are to be expected.

C. **Correct.** Suppose the initial stages of caffeine production take place in the beans. The substance integral to those initial stages must therefore be present in the beans. But this does not tell us whether that substance is synthesized in the beans or elsewhere. It does tell us that some other substance that plays a part in the production of caffeine is synthesized in the leaves, but we are not told that the synthesis of that substance is blocked.

D. Suppose we know that caffeine production in coffee plants takes place entirely in the leaves but at least some of the caffeine migrates from there to the beans. Then, if the synthesis of a substance that is integral to the initial production of caffeine is blocked in the leaves, it seems reasonable to expect the observed results.

E. If caffeine is normally produced in both the leaves and the beans of a coffee plant, but all the caffeine produced in the beans will migrate from the beans to the leaves if for any reason caffeine is not produced in the leaves, then it is reasonable to expect the observed results.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '44d041f2-ca00-439d-b60b-f37f77db2e2d';

-- Q741
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Laminated glass is much harder to break than the glass typically used in the windows of cars driven in Relnia. It is more difficult for thieves to break into cars with laminated glass windows than into cars with ordinary glass windows, and laminated glass windows are less likely to break in a collision. Nevertheless, considerations of security and safety do not unambiguously support a proposal to require that in Relnia all glass installed in cars be laminated glass, since ___.',
      'question_text', 'Which of the following most logically completes the passage?',
      'options', jsonb_build_object('a', 'most people cannot visually distinguish laminated glass from the glass typically used for car windows', 'b', 'a significant proportion of cars driven in Relnia are manufactured elsewhere', 'c', 'some cars in Relnia already have laminated glass in their windows', 'd', 'the rates of car theft and of collisions have both fallen slightly in Relnia in recent years', 'e', 'there are times when breaking a car''s window is the best way to provide timely help for people trapped inside'),
      'explanation', 'Argument Construction

**Situation**
Laminated glass is much more difficult to break than the glass that is typically used in car windows in Relnia and, when used in a car window, makes it harder for thieves to break into the car and is less likely to shatter in collisions.

**Reasoning**
*What claim, despite the given information, most helps support the conclusion that considerations of security and safety do not unambiguously support a proposal to require that in Relnia all glass installed in cars be laminated glass?* If there are any significant safety or security problems that would arise from having laminated glass, this would count against the proposal. For instance, sometimes it is essential to break a car''s window to help people trapped in the car.

A. None of the security- or safety-related characteristics of laminated glass discussed in the argument depend on laminated glass being visually distinguishable from the glass typically used for car windows. Therefore, this answer choice does not help justify the conclusion and so would not logically complete the passage.

B. Even if most cars in Relnia are manufactured elsewhere, there may be no reason not to require that all glass installed in cars in Relnia be laminated glass.

C. Whether some cars, no cars, or all cars currently in Relnia have laminated glass in their windows is irrelevant to whether it is a good idea to require that all glass installed in cars in Relnia be laminated glass.

D. Even if rates of car theft and of collision have fallen, that does not mean they could not fall further if laminated glass were required. In fact, we are not told why they fell. Could it be that more cars in Relnia had windows made of laminated glass, and that this led to these reduced rates?

E. **Correct.** This answer choice provides a reason to think that sometimes, for the security or safety of passengers in cars, it might be better not to have all the windows of every car made of laminated glass. Therefore, it logically completes the passage.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '8205c80c-0693-4e5a-92ae-7b0cf3a72d84';

-- Q742
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Consultant: **Ace Repairs ends up having to redo a significant number of the complex repair jobs it undertakes, but when those repairs are redone, they are invariably done right**. Since we have established that there is no systematic difference between the mechanics who are assigned to do the initial repairs and those who are assigned to redo unsatisfactory jobs, we must reject the hypothesis that mistakes made in the initial repairs are due to the mechanics'' lack of competence. Rather, it is likely that **complex repairs require a level of focused attention that the company''s mechanics apply consistently only to repair jobs that have not been done right on the first try**.',
      'question_text', 'In the consultant''s reasoning, the two portions in **boldface** play which of the following roles?',
      'options', jsonb_build_object('a', 'The first is the consultant''s main conclusion; the second provides evidence in support of that main conclusion.', 'b', 'The first is evidence that serves as the basis for rejecting one explanation of a certain finding; the second is the consultant''s own explanation of that finding.', 'c', 'The first is a claim whose truth is at issue in the reasoning; the second provides evidence to show that the claim is true.', 'd', 'The first presents a contrast whose explanation is at issue in the reasoning; the second is the consultant''s explanation of that contrast.', 'e', 'The first presents a contrast whose explanation is at issue in the reasoning; the second is evidence that has been used to challenge the consultant''s explanation of that contrast.'),
      'explanation', 'Argument Construction

**Situation**
The following information is attributed to a consultant: Some complex repair jobs done by Ace Repairs have to be redone. The repairs, when redone, are usually successful. But the mechanics who do the initial repairs and any others who redo those repairs are, overall, competent to do the repairs successfully.

**Reasoning**
*What role in the consultant''s reasoning do the **boldfaced** statements play?* The consultant''s first sentence describes a phenomenon that could be puzzling and needs explanation. One might be inclined to argue that the mechanics who redo the repairs are more competent than those who did the initial repairs. But the second **boldfaced** statement rebuts this explanation by telling us that it has been established that there are no systematic differences in competence. The final sentence of the consultant''s reasoning puts forward another explanation: that the redoing of a repair elicits from mechanics a higher level of focused attention than did the performance of the initial repair.

A. The first describes a puzzling phenomenon for which the consultant seeks an explanation. It is not presented as a conclusion, i.e., a statement that is asserted on the basis of other statements. The second is not a statement presented in support of the first; it gives an explanation offered by the consultant for the puzzling phenomenon described in the first **boldfaced** portion.

B. The first describes a puzzling phenomenon for which the consultant seeks an explanation, and it is not offered to show that a certain explanation does not fit. The second gives the consultant''s own explanation of that finding.

C. The reasoning does not question the accuracy of the first **boldfaced** portion; that portion is a description of a phenomenon that the consultant believes needs explanation. The second is not meant as evidence to indicate that the first is true; rather, it is offered as an explanation for the puzzling phenomenon described in the first.

D. **Correct.** The first **boldfaced** portion contrasts the success of repairs that are redone with the failure of those repairs when they were first done. The second gives an explanation proposed by the consultant for the difference.

E. The first contrasts the success of repairs that are redone with the failure of those repairs when they were first done. Rather than giving evidence to challenge the consultant''s explanation, the second provides that explanation itself.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'a7f387b9-e9c2-4611-9e0e-36a0ed76d311';

-- Q743
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'To reduce waste of raw materials, the government of Sperland is considering requiring household appliances to be broken down for salvage when discarded. To cover the cost of salvage, the government is planning to charge a fee, which would be imposed when the appliance is first sold. Imposing the fee at the time of salvage would reduce waste more effectively, however, because consumers tend to keep old appliances longer if they are faced with a fee for discarding them.',
      'question_text', 'Which of the following, if true, most seriously weakens the argument?',
      'options', jsonb_build_object('a', 'Increasing the cost of disposing of an appliance properly increases the incentive to dispose of it improperly.', 'b', 'The fee provides manufacturers with no incentive to produce appliances that are more durable.', 'c', 'For people who have bought new appliances recently, the salvage fee would not need to be paid for a number of years.', 'd', 'People who sell their used, working appliances to others would not need to pay the salvage fee.', 'e', 'Many nonfunctioning appliances that are currently discarded could be repaired at relatively little expense.'),
      'explanation', 'Evaluation of a Plan

**Situation**
A government is considering requiring household appliances to be broken down for salvage when discarded. To cover the salvage costs, the government plans to charge a fee on appliance sales.

**Reasoning**
*What would suggest that charging the fee at the time of salvage would less effectively reduce waste than charging the fee at the time of sale would?* The argument is that charging the fee at the time of salvage would reduce waste of raw materials because it would encourage consumers to keep their appliances longer before salvaging them. This argument could be weakened by pointing out other factors that might increase waste if the fee is charged at the time of salvage or reduce waste if the fee is charged at the time of sale.

A. **Correct.** This suggests that charging the fee at the time of salvage rather than the time of sale would encourage consumers to discard their appliances illegally, thereby increasing waste of raw materials by reducing the proportion of discarded appliances that are salvaged.

B. This factor would remain the same regardless of whether the fee was charged at the time of sale or the time of salvage.

C. This might be a reason for consumers to prefer the fee be charged at the time of salvage rather than the time of sale, but it does not suggest that charging the fee at the time of salvage would reduce waste less effectively.

D. This provides an additional reason to expect that charging the fee at the time of salvage would help reduce waste, so it strengthens rather than weakens the argument.

E. This would give consumers an additional reason to keep using their old appliances and postpone paying a fee at the time of salvage, so it strengthens rather than weakens the argument.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '22867752-d177-4c5c-bdb1-941227d296f0';

-- Q744
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Twelve years ago and again five years ago, there were extended periods when the Changir Republic''s currency, the pundra, was weak: Its value was unusually low relative to the world''s most stable currencies. Both times, a weak pundra made Changir''s manufactured products a bargain on world markets, and Changir''s exports were up substantially. Now some politicians are saying in order to cause another similarly sized increase in exports, the government should allow the pundra to become weak again.',
      'question_text', 'Which of the following, if true, provides the government with the strongest grounds to doubt that if followed, the politicians'' recommendation will achieve its aim?',
      'options', jsonb_build_object('a', 'Several of the politicians now recommending the pundra be allowed to become weak made that same recommendation before each of the last two periods of currency weakness.', 'b', 'After several decades of operating well below peak capacity, Changir''s manufacturing sector is now operating at near-peak levels.', 'c', 'The economy of a country experiencing a rise in exports will become healthier only if the country''s currency is strong or the rise in exports is significant.', 'd', 'Those countries with manufactured products competing with Changir''s on the world market all currently have stable currencies.', 'e', 'A sharp improvement in the efficiency of Changir''s manufacturing plants would make Changir''s products a bargain in world markets even without any weakening of the pundra relative to other currencies.'),
      'explanation', 'Argument Construction

**Situation**
During two periods within the past two decades, the weakness of Changir''s currency, the pundra, caused its exported goods to become more affordable in other countries; this affordability led to increased demand and increased exports. Politicians propose deliberately weakening the pundra to create a new surge in exports.

**Reasoning**
*What would prevent a weakened pundra from increasing exports?* The causal relationship between a weak pundra and surging exports would be likely to persist unless some additional factor inhibited an increase in exports from Changir. The existence of such a factor would therefore cast doubt on the plan''s success.

A. The fact that particular politicians who recommended a successful plan in the past are again recommending the same plan—to increase exports by weakening the nation''s currency—does not suggest the plan is unlikely to succeed in this case.

B. **Correct.** This factor would cast doubt on the plan''s success. A weak pundra can lead to a surge in exports only if Changir''s manufacturing sector has the capacity to meet a surge in demand. During the past two surges in exporting, that spare capacity existed since the option specifies manufacturing was below capacity for several decades. If, however, manufacturing is currently near capacity, the manufacturing sector will be unable to make substantially more goods for export even if a weakened pundra creates demand for those goods.

C. Because the plan only concerns increasing exports by weakening the currency, the possible impact of that plan on the overall economy is not relevant to the question of whether or not the plan is likely to succeed.

D. The stability of competing countries'' currencies would not reduce the likelihood that a weaker pundra would increase demand for Changir''s exports.

E. The fact that an alternative strategy could be employed for making Changir''s products a bargain on the world market does not make it less likely that the strategy of making those products an attractive bargain by weakening the pundra would succeed.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'a1e3bf2c-ff81-4e94-9248-bbda1aa63f7a';

-- Q745
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Increased use of incineration is sometimes advocated as a safe way to dispose of chemical waste. But opponents of incineration point to the 40 incidents involving unexpected releases of dangerous chemical agents that were reported just last year at two existing incinerators commissioned to destroy a quantity of chemical waste material. Since designs for proposed new incinerators include no additional means of preventing such releases, leaks will only become more prevalent if use of incineration increases.',
      'question_text', 'Which of the following, if true, most seriously weakens the argument?',
      'options', jsonb_build_object('a', 'At the two incinerators at which leaks were reported, staff had had only cursory training on the proper procedures for incinerating chemical waste.', 'b', 'Other means of disposing of chemical waste, such as chemical neutralization processes, have not been proven safer than incineration.', 'c', 'The capacity of existing incinerators is sufficient to allow for increased incineration of chemical waste without any need for new incinerators.', 'd', 'The frequency of reports of unexpected releases of chemical agents at newly built incinerators is about the same as the frequency at older incinerators.', 'e', 'In only three of the reported incidents of unexpected chemical leaks did the releases extend outside the property on which the incinerators were located.'),
      'explanation', 'Argument Evaluation

**Situation**
Last year, at two chemical waste incinerators, there were forty reported incidents involving unexpected releases of dangerous chemicals. Designs for proposed new incinerators include no additional safeguards against such releases. Therefore, increased use of incineration will likely make such releases more prevalent.

**Reasoning**
*What would undermine the support provided for the conclusion that leaks will become more prevalent if more chemical waste is disposed of through incineration?* The argument draws a general conclusion about chemical waste incineration from evidence about only two particular incinerators. This reasoning would be undermined by any evidence that the leaks at those two incinerators were the result of something other than insufficient safeguards against such releases.

A. **Correct.** If the staff training at the two incinerators was cursory, then the leaks may have been the results of staff not knowing how to use safeguards with which the incinerators are equipped that, if properly used, would have prevented the release of dangerous chemicals. Therefore, if staff at newer incinerators will be better trained, leaks might not become more prevalent even if chemical waste incineration becomes more common.

B. Other chemical waste disposal methods may be safer than incineration even if no one has proven so, and even if they''re not safer overall, they may involve fewer leaks.

C. Continuing to use existing incinerators might well produce just as many leaks as switching to new incinerators would.

D. This suggests that new incinerators produce as many leaks as older incinerators do, a finding that provides additional evidence that increased incineration even with proposed new incinerators would lead to more leaks.

E. The argument is not about how far the releases from leaks extend, only about how many of them are likely to occur.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'af608569-8433-4937-84db-21e06f79f160';

-- Q746
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Public health expert: **Increasing the urgency of a public health message may be counterproductive**. In addition to irritating the majority who already behave responsibly, **it may undermine all government pronouncements on health by convincing people that such messages are overly cautious**. And there is no reason to believe that those who ignore measured voices will listen to shouting.',
      'question_text', 'The two sections in **boldface** play which of the following roles in the public health expert''s argument?',
      'options', jsonb_build_object('a', 'The first is a conclusion for which support is provided, but it is not the argument''s main conclusion; the second is an unsupported premise supporting the argument''s main conclusion.', 'b', 'The first is a premise supporting the only explicit conclusion; so is the second.', 'c', 'The first is the argument''s main conclusion; the second supports that conclusion and is itself a conclusion for which support is provided.', 'd', 'The first is a premise supporting the argument''s only conclusion; the second is that conclusion.', 'e', 'The first is the argument''s only explicit conclusion; the second is a premise supporting that conclusion.'),
      'explanation', 'Argument Construction

**Situation**
A public health expert argues against increasing the urgency of public health messages by pointing out negative effects that may arise from such an increase, as well as by questioning its efficacy.

**Reasoning**
*What roles are played in the argument by the two claims in **boldface**?* The first claim in **boldface** states that increasing the urgency of public health messages may be counterproductive. After making this claim, the public health expert mentions two specific reasons this could be so: it could irritate people who already behave responsibly, and it could convince people that all public health messages are too cautious (the latter reason in the second claim in **boldface**.) The phrase In addition to indicates that neither claim in the second sentence is intended to support or explain the other. However, since each claim in the second sentence gives a reason to believe the claim in the first sentence, each independently supports the first sentence as a conclusion. The word And beginning the third sentence reveals that its intended role in the argument is the same as that of the two claims in the second sentence.
B.Everything stated after the first sentence is intended to help support it, so the first sentence is a conclusion, not a premise.

A. Everything stated after the first sentence is intended to help support it, so the first sentence is the argument''s main conclusion.

C. Each of the three claims in the second and third sentences is presented as an independent reason to accept the general claim in the first sentence. Therefore, nothing in the passage is intended to support the second statement in **boldface** as a conclusion.

D. Everything stated after the first sentence is intended to help support it, so the first sentence is a conclusion, not a premise.

E. **Correct.** Each of the three claims in the second and third sentences is presented as an independent reason to accept the general claim in the first sentence. Thus, each of those claims is a premise supporting the claim in the first sentence as the argument''s only conclusion.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'e4fd05c7-803b-4354-b8f9-89d92d8c766b';

-- Q747
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'A new machine for harvesting corn will allow rows to be planted only 15 inches apart instead of the usual 30 inches. Corn planted this closely will produce lower yields per plant. Nevertheless, the new machine will allow corn growers to double their profits per acre because ___.',
      'question_text', 'Which of the following most logically completes the argument?',
      'options', jsonb_build_object('a', 'with the closer spacing of the rows, the growing corn plants will quickly form a dense canopy of leaves, which by shading the ground will minimize the need for costly weed control and irrigation', 'b', 'with the closer spacing of the rows, corn plants will be forced to grow taller because of increased competition for sunlight from neighboring corn plants', 'c', 'with the larger number of plants growing per acre, more fertilizer will be required', 'd', 'with the spacing between rows cut by half, the number of plants grown per acre will almost double', 'e', 'with the closer spacing of the rows, the acreage on which corn is planted will be utilized much more intensively than it was before, requiring more frequent fallow years in which corn fields are left unplanted'),
      'explanation', 'Argument Construction

**Situation**
New harvesting technology allows farmers to plant corn at double the usual density, but such dense planting reduces yields per plant. Despite these lower yields, farmers can still realize twice the profits per acre with this new technology.

**Reasoning**
*What additional factor would explain doubled profits from doubled corn plants if the doubled plants produce lower yields?* The passage states farmers can plant twice as many plants per acre, but the crowded plants yield less corn than plants spaced more widely. These facts taken together would result in profits that were somewhat less than doubled unless some additional factor—such as a reduction in other associated costs explained why they doubled. Therefore, a statement that shows such a reduction in costs would logically complete the argument.

A. **Correct.** Reducing costs, such as costs for weed control and irrigation, could explain why twice as many plants with lower yields per plant nonetheless could produce twice the profit, so this explanation of reduced costs logically completes the argument.

B. The fact that densely planted corn grows taller has no relevance to the question of profits derived from those plants since the corn and not the stalks is the product.

C. An increase in fertilizer costs would be expected to reduce overall profits, not increase them.

D. The fact that denser spacing doubles, or almost doubles, the number of plants would not explain how double the plants at lower yields per plant could double profits.

E. More fallow years would be expected to reduce profits, not explain how profits could double.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'acb402a7-fd05-4bc6-953a-44b4c91fa56f';

-- Q748
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The difference in average annual income in favor of employees who have college degrees, compared with those who do not have such degrees, doubled between 1980 and 1990. Some analysts have hypothesized that increased competition between employers for employees with college degrees drove up income for such employees.',
      'question_text', 'Which of the following, if true, most seriously undermines the explanation described above?',
      'options', jsonb_build_object('a', 'During the 1980s a growing percentage of college graduates, unable to find jobs requiring a college degree, took unskilled jobs.', 'b', 'The average age of all employees increased slightly during the 1980s.', 'c', 'The unemployment rate changed very little throughout most of the 1980s.', 'd', 'From 1980 to 1990, the difference in average income between employees with advanced degrees and those with bachelor''s degrees also increased.', 'e', 'During the 1980s there were some employees with no college degree who earned incomes comparable to the top incomes earned by employees with a college degree.'),
      'explanation', 'Argument Evaluation

**Situation**
The amount by which average annual income for employees with college degrees exceeds that for employees without such degrees doubled between 1980 and 1990.

**Reasoning**
*What evidence would most strongly suggest that increased competition among employers for employees with college degrees does not explain the relative increase in those employees'' incomes?* Such increased competition could not explain the relative increase in income for employees with college degrees if the competition did not actually increase, or if such competition occurred but did not result in employers paying higher wages or salaries, or if the increase in competition to hire employees without college degrees was even greater. So, evidence that any of those conditions existed would undermine the analysts'' explanation.

A. **Correct.** This suggests that the supply of college graduates grew relative to employers'' demand for them, and hence that employers'' competition for college-educated employees did not actually increase.

B. The average age might have increased equally for employees with college degrees and for those without them, so the increase is not clearly relevant to explaining why the difference between these two groups'' average incomes grew.

C. Even if the overall unemployment rate did not change, competition for college-educated employees could have increased while competition for other employees decreased.

D. This statement gives information comparing income trends among two groups of those with college degrees and is irrelevant to the comparison of income trends for those with college degrees and those without college degrees.

E. Even if there was strong competition and high pay for certain unusual types of employees without college degrees, increasing competition for employees with college degrees might have explained the overall growing difference in average pay between employees with college degrees and those without.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '083e7234-b776-4b6b-81c8-adf24f91a63f';

-- Q749
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Which of the following most logically completes the passage?',
      'question_text', 'According to the last pre-election poll in Whippleton, most voters believe that the three problems government needs to address, in order of importance, are pollution, crime, and unemployment. Yet in the election, candidates from parties perceived as strongly against pollution were defeated, while those elected were all from parties with a history of opposing legislation designed to reduce pollution. These results should not be taken to indicate that the poll was inaccurate, however, since',
      'options', jsonb_build_object('a', 'some voters in Whippleton do not believe that pollution needs to be reduced', 'b', 'every candidate who was defeated had a strong antipollution record', 'c', 'there were no issues other than crime, unemployment, and pollution on which the candidates had significant differences of opinion', 'd', 'all the candidates who were elected were perceived as being stronger against both crime and unemployment than the candidates who were defeated', 'e', 'many of the people who voted in the election refused to participate in the poll'),
      'explanation', 'Argument Construction

**Situation**
A pre-election poll indicated that most voters believed the three problems government needs to address, in order of importance, are pollution, crime, and unemployment. But in the election, candidates from parties with a history of opposing antipollution legislation beat candidates from parties perceived as more strongly against pollution.

**Reasoning**
*What would most help explain how the poll might have been accurate despite the election results?* Since the poll indicated that voters were most concerned about pollution, it suggested that candidates from antipollution parties would be more likely to be elected, other things being equal—and yet those candidates were not elected. There are many possible explanations for this outcome that are compatible with the poll having been accurate. For example, voters might have been swayed by the candidates'' personalities, qualifications, or advertising more than by their positions on the issues. Or some candidates might have convinced voters that their personal positions on the issues were different from those of their parties. Or voters might have chosen candidates based on their positions on crime and unemployment, considering those issues together more important than pollution alone. Any statement suggesting that any such factors explained the election results would logically complete the passage by providing a reason to believe that the poll could have been accurate despite those results.

A. If the number of voters who did not believe that pollution needed to be reduced was large enough to explain the election results, then the poll was probably inaccurate. So, this does not explain how the poll might have been accurate despite those results.

B. This eliminates the possibility that candidates were defeated for having weak antipollution records conflicting with their parties'' antipollution stances, so it eliminates one explanation of how the poll might have been accurate despite the election results. Thus, it slightly weakens the conclusion of the argument instead of providing a premise to support it.

C. This eliminates the possibility that differences of opinion among the candidates on these other issues might explain the election results, but it does not explain how the poll could have been accurate despite the election results.

D. **Correct.** The poll indicated that voters believed that the government needs to address crime and unemployment as well as pollution. So, if the poll was accurate, the election outcome might have resulted from voters considering candidates'' positions on crime and unemployment to be jointly more important than their positions on pollution.

E. If anything, this provides a reason to doubt that the poll accurately reflected voters'' opinions. It does not explain how the poll might have accurately reflected those opinions despite the election results.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '6bb28427-d059-4e68-a847-ec0f64d77103';

-- Q750
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Manufacturing plants in Arundia have recently been acquired in substantial numbers by investors from abroad. Arundian politicians are proposing legislative action to stop such investment, justifying the proposal by arguing that foreign investors, opportunistically exploiting a recent fall in the value of the Arundian currency, were able to buy Arundian assets at less than their true value.',
      'question_text', 'Which of the following, if true, casts the most serious doubt on the adequacy of the Arundian politicians'' justification for the proposed legislation?',
      'options', jsonb_build_object('a', 'The Arundian government originally welcomed the fall in the value of the Arundian currency because the fall made Arundian exports more competitive on international markets.', 'b', 'Foreign investors who acquired Arundian manufacturing plants generally did so with no intention of keeping and running those plants over the long term.', 'c', 'Without the recent fall in the value of the Arundian currency, many of the Arundian assets bought by foreign investors would have been beyond the financial reach of those investors.', 'd', 'In Concordia, a country broadly similar to Arundia, the share of manufacturing assets that is foreign-controlled is 60 percent higher than it is in Arundia.', 'e', 'The true value of an investment is determined by the value of the profits from it, and the low value of the Arundian currency has depressed the value of any profits earned by foreign investors from Arundian assets.'),
      'explanation', 'Argument Evaluation

**Situation**
After a recent fall in the value of Arundian currency, foreign investors have been acquiring many Arundian manufacturing plants. Arundian politicians are proposing legislation to stop such investment.

**Reasoning**
*What would most undermine the Arundian politicians'' justification for the proposed legislation?* The politicians are justifying their proposal by claiming that foreign investors have been exploiting the fall in the currency''s value by buying Arundian assets at less than their true value (whatever that means). Any evidence that their claim is false or meaningless would undermine their justification for the proposal, as would any evidence that the claim, even if true, does not provide a good reason to stop the foreign investments.

A. This suggests that the foreign investors got a good deal on the manufacturing plants, since it provides evidence that those plants will now be more competitive and profitable. So, if anything, it supports the politicians'' justification for their proposal rather than undermining it.

B. This suggests that the foreign investors generally believe the manufacturing plants are undervalued and intend to sell them at a profit as soon as the currency rises enough. So, it supports the politicians'' justification for their proposal rather than undermining it.

C. This suggests that the recent fall in the currency''s value made Arundian assets cost less than usual for foreign investors, thus arguably allowing the investors to buy the assets at less than their true value. So, if anything, it supports the politicians'' justification for their proposal rather than undermining it.

D. The Arundian politicians might consider the example of Concordia to be a warning of the disaster that could befall Arundia unless the legislation is enacted. So, the situation in Concordia might be cited as support for the politicians'' justification of their proposal.

E. **Correct.** This implies that the fall in the Arundian currency''s value has reduced the true value of Arundian manufacturing plants and any profits they may make, so it undermines the politicians'' claim that the foreign investors exploited the fall in the currency''s value to acquire the plants for less than their true value.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '0f47be51-f391-4134-a6fe-b387beb54efe';

-- Q751
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Proposal: Carbon dioxide and methane in the atmosphere block the escape of heat into space. So, emission of these "greenhouse" gases contributes to global warming. In order to reduce global warming, emission of greenhouse gases needs to be reduced. Therefore, the methane now emitted from open landfills should instead be burned to produce electricity.
Objection: The burning of methane generates carbon dioxide that is released into the atmosphere.',
      'question_text', 'Which of the following, if true, most adequately counters the objection made to the proposal?',
      'options', jsonb_build_object('a', 'Every time a human being or other mammal exhales, there is some carbon dioxide released into the air.', 'b', 'The conversion of methane to electricity would occur at a considerable distance from the landfills.', 'c', 'The methane that is used to generate electricity would generally be used as a substitute for a fuel that does not produce any greenhouse gases when burned.', 'd', 'Methane in the atmosphere is more effective in blocking the escape of heat from the Earth than is carbon dioxide.', 'e', 'The amount of methane emitted from the landfills could be reduced if the materials whose decomposition produces methane were not discarded but recycled.'),
      'explanation', 'Evaluation of a Plan

**Situation**
The greenhouse gases methane and carbon dioxide trap heat in Earth''s atmosphere and warm the planet. To reduce that global warming, emission of these gases needs to be reduced. For these reasons, someone has proposed that the methane emitted from landfills should be captured and burned to produce electricity. However, an objection to the proposal is that burning methane causes the release of carbon dioxide (another greenhouse gas) into the atmosphere.

**Reasoning**
*What would be a logically effective response to counter the objection to the proposal?* It is true that burning methane causes the release of carbon dioxide. However, if burning methane from landfills to generate electricity helps reduce net global warming, then the objection would not provide a good reason for rejecting the proposal. It turns out that, as a greenhouse gas, methane has a much more powerful impact on global warming than does carbon dioxide. This fact provides strong support for rejecting the objection to the proposal.

A. Clearly, the effects referred to here are unavoidable in the lives of humans and other mammals on Earth. The emissions that must be curtailed to avoid global warming are those that are avoidable as a result of voluntary human activity.

B. This suggests that there could be costs in implementing the proposal, but the possibility of such costs does not, by itself, counter the proposal. Such costs could presumably be reduced by better siting of landfills and electricity-generation plants.

C. This information, if true, would not counter the objection and would provide some support for it. We would still need some reason to believe that allowing carbon dioxide emissions from burning methane would be better than continuing to release methane itself. In the absence of such a reason, we should expect no net greenhouse-gas-related benefit in substituting the landfill-emitted methane for a fuel that produces no greenhouse gases.

D. **Correct.** This information provides a strong rebuttal of the objection. Since methane has more powerful global-warming effects than does carbon dioxide, there is a net greenhouse-gas-reduction benefitin generating electricity by burning methane from landfills even though that burning itself emits the greenhouse gas carbon dioxide.

E. Undoubtedly, it would be better to reduce the amount of methane that landfills will generate in the future. However, the possibility of doing so tells us nothing about whether the potential emission of carbon dioxide provides a reason not to burn the methane that is currently emitted from landfills.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '76fa78c4-a1b8-4935-800d-5bed08ea633a';

-- Q752
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Proposed new safety rules for the Beach City airport would lengthen considerably the minimum time between takeoffs from the airport. In consequence, the airport would be able to accommodate 10 percent fewer flights than currently use the airport daily. The city''s operating budget depends heavily on taxes generated by tourist spending, and most of the tourists come by plane. Therefore, the proposed new safety rules, if adopted, will reduce the revenue available for the operating budget.',
      'question_text', 'The argument depends on assuming which of the following?',
      'options', jsonb_build_object('a', 'There are no periods of the day during which the interval between flights taking off from the airport is significantly greater than the currently allowed minimum.', 'b', 'Few, if any, of the tourists who use the Beach City airport do so when their main destination is a neighboring community and not Beach City itself.', 'c', 'If the proposed safety rules are adopted, the reduction in tourist numbers will not result mainly from a reduction in the number of tourists who spend relatively little in Beach City.', 'd', 'Increasing the minimum time between takeoffs is the only way to achieve necessary safety improvements without a large expenditure by the city government on airport enhancements.', 'e', 'The response to the adoption of the new safety rules would not include an increase in the number of passengers per flight.'),
      'explanation', 'Argument Construction

**Situation**
Proposed safety rules for a city airport would reduce the number of daily flights the airport can accommodate. The city''s operating budget depends heavily on taxes generated by tourists, who mostly come by plane. Therefore, adopting the safety rules will result in lower revenue available for the operating budget.

**Reasoning**
*What must be true in order for the cited facts to support the conclusion that the proposed rules would reduce the revenue for the operating budget?* The implicit reasoning is that since the rules would reduce the number of flights that can be accommodated, they would thereby reduce the number of tourists arriving by plane, which in turn would reduce the tax revenue that tourist spending generates for the operating budget. This assumes that the actual number of daily flights would fall along with the number that the airport can accommodate; that fewer daily flights would mean fewer people flying into the airport; that fewer people flying into the airport would mean fewer tourists flying into the airport; that fewer tourists flying into the airport would mean fewer tourists visiting the city; that fewer tourists visiting the city would mean less taxable spending by tourists; and that less taxable spending by tourists would mean less revenue overall for the operating budget.

A. Even if flights depart the airport less frequently during some periods of the day, increasing the minimum time between flights at busy times of day could reduce the total number of daily flights from the airport.

B. Even if half the tourists flying into the airport were bound for other nearby towns, the other half could still spend enough in town to generate lots of revenue for the operating budget.

C. It is possible that most tourists spend relatively little in the city, but a few spend a lot. In that case, even if a reduction in tourist numbers resulted mainly from a declining number of tourists who spend relatively little, it could also greatly reduce the already small number of tourists who spend a lot.

D. This suggests that the proposed rules might be financially better for the city than any alternative way to improve safety, whereas the argument''s conclusion is that the proposed rules are financially disadvantageous.

E. **Correct.** If adopting the proposed rules would result in a large increase in the number of passengers per flight, fewer daily flights would not necessarily mean fewer passengers or fewer tourists overall.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '71e5b50a-33eb-4d48-9638-df1c95ae7ab0';

-- Q753
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The introduction of new drugs into the market is frequently prevented by a shortage of human subjects for the clinical trials needed to show that the drugs are safe and effective. Since the lives and health of people in future generations may depend on treatments that are currently experimental, practicing physicians are morally in the wrong when, in the absence of any treatment proven to be effective, they fail to encourage suitable patients to volunteer for clinical trials.',
      'question_text', 'Which of the following, if true, casts most doubt on the conclusion of the argument?',
      'options', jsonb_build_object('a', 'Many drugs undergoing clinical trials are intended for the treatment of conditions for which there is currently no effective treatment.', 'b', 'Patients do not share the physician''s professional concern for public health, but everyone has a moral obligation to alleviate suffering when able to do so.', 'c', 'Usually, half the patients in a clinical trial serve as a control group and receive a nonactive drug in place of the drug being tested.', 'd', 'An experimental drug cannot legally be made available to patients unless those patients are subjects in clinical trials of the drug.', 'e', 'Physicians have an overriding moral and legal duty to care for the health and safety of their current patients.'),
      'explanation', 'Argument Evaluation

**Situation**
A shortage of human subjects for clinical trials needed to show that new drugs are safe and effective often prevents those drugs from being introduced into the market. The lives and health of future generations may depend on treatments that are now experimental.

**Reasoning**
*What would cast doubt on the judgment that doctors are morally obligated to encourage their patients to volunteer for clinical trials?* Note that the argument''s conclusion, unlike its premises, is a moral judgment.
This judgment could be cast into doubt by a moral principle that would be likely to conflict with it under the conditions described. For example, a principle suggesting that it is sometimes morally unacceptable for doctors to encourage their patients to volunteer for clinical trials would also suggest that they are not morally obligated to encourage their patients to volunteer for clinical trials, since anything morally obligatory must also be morally acceptable.

A. If anything, this highlights how important it is to ensure that these drugs undergo clinical trials to benefit future generations, so it supports rather than casts doubt on the argument''s conclusion.

B. This suggests that patients are morally obligated to volunteer for clinical trials to help prevent suffering in future generations. If anything, this supports the claim that doctors are morally obligated to encourage their patients to volunteer.

C. The clinical trial will probably not harm any patients in the control group, yet their participation will benefit future generations. So, if anything, this supports the claim that doctors should encourage their patients to volunteer.

D. This legal barrier makes it even more essential for the drugs to undergo clinical trials in order to benefit patients, so it supports rather than casts doubt on the argument''s conclusion.

E. **Correct.** Since the experimental drugs'' safety is being tested during the trials, the drugs may prove unsafe for subjects in the trials. If doctors have an overriding moral duty to keep their current patients safe, then it may be morally unacceptable for them to encourage those patients to volunteer for the trials.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'b2537744-71a4-4fff-b0ad-848311220eb7';

-- Q754
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'As a construction material, bamboo is as strong as steel and sturdier than concrete. Moreover, in tropical areas, bamboo is a much less expensive construction material than either steel or concrete and is always readily available. In tropical areas, therefore, building with bamboo makes better economic sense than building with steel or concrete, except where land values are high.',
      'question_text', 'Which of the following, if true, most helps to explain the exception noted above?',
      'options', jsonb_build_object('a', 'Buildings constructed of bamboo are less likely to suffer earthquake damage than are steel and concrete buildings.', 'b', 'Bamboo is unsuitable as a building material for multistory buildings.', 'c', 'In order to protect it from being damaged by termites and beetles, bamboo must be soaked, at some expense, in a preservative.', 'd', 'In some tropical areas, bamboo is used to make the scaffolding that is used during large construction projects.', 'e', 'Bamboo growing in an area where land values are increasing is often cleared to make way for construction.'),
      'explanation', 'Argument Construction

**Situation**
Bamboo is as strong as steel and sturdier than concrete when used as a construction material. In tropical areas, bamboo is much less expensive and is always readily available.

**Reasoning**
*What explains the exception specified in the conclusion?* The argument''s conclusion is that in tropical areas, bamboo is a more economical building material than steel or concrete, except where land values are high.
The information in the passage makes clear why bamboo is a more economical building material in tropical areas than are concrete or steel. So the question is: Why must an exception be made for areas where land values are high? Multistory buildings are particularly desirable in areas where land values are high, but bamboo may not be suitable for such buildings.

A. This explains why bamboo would be preferable to steel or concrete in tropical areas especially prone to earthquakes. However, there is no clear connection to be made between areas where land values are high and areas especially prone to earthquakes.

B. **Correct.** Multistory buildings provide a greater area of floor space for a given site area, and in that sense are more economical. A single-story building with the same floor space will occupy a much bigger site, so the higher the land values, the more likely it is that a multistory building will be built on that land. Thus, given this information, bamboo is less suitable for areas where land values are high.

C. This undermines, to some extent, the claim that bamboo is an economical building material. But it does nothing to explain why it would be less economical specifically in areas where land values are high.

D. This is irrelevant. Bamboo is used to build scaffolding for construction projects and as a building material for permanent structures. There is no way to infer from this that bamboo is less economical specifically in areas where land values are high.

E. The fact that bamboo is cleared from an area to make room for construction in no way implies that bamboo would not be a suitable and economical building material for the area once it has been cleared.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '29e55547-f06d-4972-a512-dec7e8d05ede';

-- Q755
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The country of Virodia has, until now, been barely self-sufficient in both meat and grain. Greater prosperity there has gone hand in hand with steadily increasing per capita consumption of meat, and it takes several pounds of grain used as feed to produce one pound of meat. Per capita income is almost certain to rise further, yet increases in domestic grain production are unlikely.',
      'question_text', 'Which of the following is most strongly supported by the information given?',
      'options', jsonb_build_object('a', 'Some land in Virodia that is currently used for grain production will soon be turned into pastureland for grazing cattle for meat.', 'b', 'In the future, per capita income in Virodia is unlikely to increase as rapidly as it has in the past.', 'c', 'In Virodia, the amount of grain it takes to produce one pound of meat is likely to increase in coming years.', 'd', 'Grain is soon likely to make up a larger proportion of the average Virodian''s diet than ever before.', 'e', 'Virodia is likely to become an importer of grain or meat or both.'),
      'explanation', 'Argument Construction

**Situation**
Virodia has been barely self-sufficient in both meat and grain. Recently per capita meat consumption in Virodia has been increasing. Recent increases in per capita income will probably continue, but production of grain will probably not increase. It takes several pounds of grain to produce each pound of meat.

**Reasoning**
*What claim is most strongly supported by the given information?* We are told that producing a pound of meat requires several pounds of grain. If (1) more meat is going to be consumed in Virodia, (2) more grain will not be produced, and (3) there is no excess grain, then Virodia will have to import meat, or import grain so it can produce more meat, or both.

A. The information given says nothing about pastureland for grazing cattle, and it provides no evidence that meat producers would be able to produce more meat per area of land by using the land for pasture than by using it for grain production. Furthermore, there is no evidence that the meat in Virodia is produced from cattle rather than from some other types of animals that are fed on grain. Given that the information suggests that there may be an increase in demand for grain, it seems unlikely that there will be a reduction in the amount of land used to produce grain.

B. The information says that per capita income is likely to increase and that greater prosperity correlates positively with greater meat consumption. It provides no reason to think that the correlation between rising income and increasing meat consumption occurs only with more rapid rises in income.

C. Nothing in the information given provides any evidence as to whether the amount of grain needed to produce a pound of meat will change.

D. The information indicates that per capita meat consumption is likely to continue to increase, which actually supports the opposite of what this answer choice states.

E. **Correct.** The information indicates that grain production will probably not increase. We are told, however, that meat consumption will increase. Meat production in Virodia requires a substantial amount of grain, and we know that Virodia produces no excess grain or meat. This indicates that Virodia will likely have to become an importer of meat, or, if not, it will have to become an importer of grain so that it will be able to produce more meat.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'd6dd1d05-b25c-4773-b385-c9d949c08236';

-- Q756
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Newspaper editors should not allow reporters to write the headlines for their own stories. The reason for this is that, while the headlines that reporters themselves write are often clever, what typically makes them clever is that they allude to little-known information that is familiar to the reporter but that never appears explicitly in the story itself.',
      'question_text', 'Which of the following, if true, most strengthens the argument?',
      'options', jsonb_build_object('a', 'The reporter who writes a story is usually better placed than the reporter''s editor is to judge what the story''s most newsworthy features are.', 'b', 'To write a headline that is clever, a person must have sufficient understanding of the story that the headline accompanies.', 'c', 'Most reporters rarely bother to find out how other reporters have written stories and headlines about the same events that they themselves have covered.', 'd', 'For virtually any story that a reporter writes, there are at least a few people who know more about the story''s subject matter than does the reporter.', 'e', 'The kind of headlines that newspaper editors want are those that anyone who has read a reporter''s story in its entirety will recognize as clever.'),
      'explanation', 'Argument Evaluation

**Situation**
The headlines newspaper reporters write for their own stories are often clever only because they allude to little-known information that never appears explicitly in the stories themselves.

**Reasoning**
*What would most help the argument support the conclusion that newspaper editors should not allow reporters to write headlines for their own stories?* The argument''s only explicit premise is that the headlines newspaper reporters write for their own stories are often clever only because they allude to little-known information that never appears explicitly in the stories themselves. In order for this premise to support the conclusion that newspaper editors should not allow reporters to write their own headlines, it would be helpful to be given a reason why editors should avoid headlines alluding to such little-known information.

A. This suggests that reporters are likely to write better headlines for their stories than editors are, so it weakens the argument that editors should not allow reporters to write their own headlines.

B. Since a reporter who wrote a story is likely to understand that story well, this does not provide a reason why editors should not allow reporters to write their own headlines.

C. If most reporters did what is suggested, they could perhaps hone their headline-writing skills—unless almost all reporters are weak in such skills, as suggested in the given information. The fact that they do not bother to do so may help explain why reporters'' headline-writing skills are weak. An explanation of why this is so does not provide additional support for the argument''s conclusion.

D. The people who know more about a story''s subject matter than the reporter writing the story might be just as likely to see the cleverness of allusions to little-known information as the reporters are. So, to the extent that this is relevant at all, it slightly weakens the argument by suggesting that obscurely clever headlines sometimes function as intended.

E. **Correct.** The argument''s explicit premise suggests that typically a reporter''s headline for his or her own story cannot be recognized as clever by a reader who has read the whole story. So, if editors want headlines that anyone who has read the accompanying stories would recognize as clever, they have a reason not to let reporters write the headlines.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '118ef697-d3bd-4a83-87e7-843ae5ddaebc';

-- Q757
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Advertisement: Our competitors'' computer salespeople are paid according to the value of the products they sell, so they have a financial incentive to convince you to buy the most expensive units—whether you need them or not. But here at Comput-o-Mart, our salespeople are paid a salary that is not dependent on the value of their sales, so they won''t try to tell you what to buy. That means when you buy a computer at Comput-o-Mart, you can be sure you''re not paying for computing capabilities you don''t need.',
      'question_text', 'Which of the following would, if true, most weaken the advertisement''s reasoning?',
      'options', jsonb_build_object('a', 'Some less-expensive computers actually have greater computing power than more expensive ones.', 'b', 'Salespeople who have a financial incentive to make sales generally provide more attentive service than do other salespeople.', 'c', 'Extended warranties purchased for less-expensive computers can cost nearly as much as the purchase price of the computer.', 'd', 'Comput-o-Mart is open only limited hours, which makes it more difficult for many shoppers to buy computers there than at other retail stores.', 'e', 'Comput-o-Mart does not sell any computers that support only basic computing.'),
      'explanation', 'Argument Evaluation

**Situation**
An advertisement states that other computer stores pay salespeople on commission. Since these salespeople receive a percentage of total sales, they have a motive to sell the most expensive computers possible to customers who might require only cheaper, and presumably less powerful, computers. Because Comput-o-Mart pays salaries rather than commissions, their salespeople are not motivated to sell unnecessarily expensive machines. Therefore, Comput-o-Mart shoppers can feel confident they are buying a machine targeted to their needs rather than a pointlessly powerful and more expensive model.

**Reasoning**
*What would undermine the argument that customers at Comput-o-Mart will not pay for needless computing power?* The advertisement relies on the suggestion that Comput-o-Mart will sell inexpensive, basic computers to those customers whose needs are basic. That argument is therefore weakened if Comput-o-Mart does not offer such basic, low-cost computers for sale.

A. The fact that price does not always correlate with computing power would not affect the argument that Comput-o-Mart will not sell needlessly expensive machines to its customers.

B. The fact that salaried salespeople might be less attentive has no bearing on the argument that such employees will not attempt to sell unnecessarily expensive computers.

C. The cost of warranties is not relevant to the argument that Comput-o-Mart will not upsell.

D. The relative business hours of different stores have no bearing on the question of whether Comput-o-Mart will sell basic machines to customers who require nothing more powerful.

E. **Correct.** The advertisement relies on the suggestion that Comput-o-Mart will sell a basic machine to a customer with basic needs rather than trying to induce them to buy a fancier, more expensive model; that argument is undermined if Comput-o-Mart has no such basic computers available for purchase.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '7af3ec08-dfa7-4712-808a-54de59a542f5';

-- Q758
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Proponents of the recently introduced tax on sales of new luxury boats had argued that a tax of this sort would be an equitable way to increase government revenue because the admittedly heavy tax burden would fall only on wealthy people, and neither they nor anyone else would suffer any economic hardship. In fact, however, 20 percent of the workers employed by manufacturers of luxury boats have lost their jobs as a direct result of this tax.',
      'question_text', 'The information given, if true, most strongly supports which of the following?',
      'options', jsonb_build_object('a', 'The market for luxury boats would have collapsed even if the new tax on luxury boats had been lower.', 'b', 'The new tax would produce a net gain in tax revenue for the government only if the yearly total revenue that it generates exceeds the total of any yearly tax-revenue decrease resulting from the workers'' loss of jobs.', 'c', 'Because many people never buy luxury items, imposing a sales tax on luxury items is the kind of legislative action that does not cost incumbent legislators much popular support.', 'd', 'Before the tax was instituted, luxury boats were largely bought by people who were not wealthy.', 'e', 'Taxes can be equitable only if their burden is evenly distributed over the entire population.'),
      'explanation', 'Argument Construction

**Situation**
Proponents of a recently introduced tax on sales of new luxury boats argued that it would be an equitable way to increase government revenue because the tax would fall only on the wealthy and cause no economic hardship. But because of the tax, 20 percent of luxury-boat manufacturing workers have lost their jobs.

**Reasoning**
*What conclusion do the statements about the proponents'' argument and the tax''s effects support?* Since the tax caused many workers to lose their jobs, apparently the proponents were incorrect in asserting that it would cause no one to suffer any economic hardship. Thus, their justification for concluding that the tax is an equitable way to increase government revenue is factually inaccurate, casting doubt on that conclusion.

A. The passage indicates that the tax directly caused a significant decrease (though not necessarily a collapse) in the market for luxury boats. But the passage contains no evidence about whether such a decrease might not have occurred if the new tax had been somewhat lower.

B. **Correct.** Since the tax caused the workers to lose their jobs, it might have made the government lose revenue from payroll taxes that the laid-off workers would have paid if they had kept their jobs. So, if the yearly total revenue generated directly and indirectly by the tax were less than those total yearly payroll taxes and any other tax revenue that was lost as a result of the tax, the tax would have caused a net loss in tax revenue.

C. The passage contains no information about what types of legislative actions cost, or do not cost, incumbent legislators popular support.

D. Although the passage suggests that some of the tax proponents'' assumptions were wrong, it contains no information suggesting that those proponents were wrong in thinking that luxury boats are purchased mainly by wealthy people.

E. The passage does not provide any basis for determining what makes a tax equitable or about whether the luxury boat tax is equitable. The tax''s proponents evidently felt that a tax whose burden falls only on the wealthy rather than evenly on the entire population can be equitable.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '7f403523-78ee-4e00-8637-f67c7f2a2206';

-- Q759
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In Wareland last year, 16 percent of licensed drivers under 21 and 11 percent of drivers ages 21—24 were in serious accidents. By contrast, only 3 percent of licensed drivers 65 and older were involved in serious accidents. These figures clearly show that the greater experience and developed habits of caution possessed by drivers in the 65-and-older group make them far safer behind the wheel than the younger drivers are.',
      'question_text', 'Which of the following is an assumption on which the argument depends?',
      'options', jsonb_build_object('a', 'Drivers 65 and older do not, on average, drive very many fewer miles per year than drivers 24 and younger.', 'b', 'Drivers 65 and older do not constitute a significantly larger percentage of licensed drivers in Wareland than drivers ages 18—24 do.', 'c', 'Drivers 65 and older are less likely than are drivers 24 and younger to drive during weather conditions that greatly increase the risk of accidents.', 'd', 'The difference between the accident rate of drivers under 21 and of those ages 21-24 is attributable to the greater driving experience of those in the older group.', 'e', 'There is no age bracket for which the accident rate is lower than it is for licensed drivers 65 and older.'),
      'explanation', 'Argument Evaluation

**Situation**
Last year in Wareland, a much higher percentage of drivers 24 and under than of drivers 65 and older were in serious accidents.

**Reasoning**
*What must be true for the observation about the accident rates to support the conclusion that the greater experience and caution of drivers 65 and older make them safer behind the wheel than the younger drivers?*
Several factors other than greater experience and caution could explain the lower accident rate among the older drivers. For example, the older drivers might simply drive much less than the younger ones but still get in just as many accidents per mile driven. Or perhaps because the older drivers are more often retired, their schedules less often lead them to drive at times of day when accident rates are greater for everyone.
Or they might be more likely to live in rural areas with less traffic and lower accident rates. The argument depends on assuming that none of these factors fully explains the difference in accident rates.

A. **Correct.** Although we are given no information about the possible extent of any difference in average miles driven, the (somewhat vague) information that drivers 65 and older drive very many fewer miles per year, on average, than drivers 24 and younger would cast serious doubt on the statistical argument given. The argument assumes that the difference in miles driven is not sufficiently substantial to undermine the argument.

B. The argument is only about the discrepancy between the percentages of the drivers in two specific age groups who were in serious accidents last year. The percentages of licensed drivers who fall in these age groups are irrelevant.

C. Even if drivers 65 and older are just as likely as younger drivers to drive in inclement weather, they may do so far more carefully than the younger drivers, so the older drivers'' greater experience and caution could still explain their lower accident rates.

D. Even if greater experience does not explain the difference between the accident rates of the two younger groups of drivers, it might still explain the differences between the accident rate of those two younger groups taken together and that of drivers aged 65 and older.

E. The accident rate could be lower for drivers in late middle age than for those 65 and older because drivers in late middle age are also cautious and experienced, but their reflexes and vision tend to be less impaired. Even if that were true, the experience and caution of the drivers 65 and older might still make them safer than drivers 24 and under.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '908e2af9-13a9-4ec5-94c6-4d72ddfc2c69';

-- Q760
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In the past, the country of Malvernia has relied heavily on imported oil. Malvernia recently implemented a program to convert heating systems from oil to natural gas. Malvernia currently produces more natural gas each year than it uses, and oil production in Malvernian oil fields is increasing at a steady pace. If these trends in fuel production and usage continue, therefore, Malvernian reliance on foreign sources for fuel is likely to decline soon.',
      'question_text', 'Which of the following would it be most useful to establish in evaluating the argument?',
      'options', jsonb_build_object('a', 'When, if ever, will production of oil in Malvernia outstrip production of natural gas?', 'b', 'Is Malvernia among the countries that rely most on imported oil?', 'c', 'What proportion of Malvernia''s total energy needs is met by hydroelectric, solar, and nuclear power?', 'd', 'Is the amount of oil used each year in Malvernia for generating electricity and fuel for transportation increasing?', 'e', 'Have any existing oil-burning heating systems in Malvernia already been converted to natural-gas-burning heating systems?'),
      'explanation', 'Argument Evaluation

**Situation**
Malvernia has relied heavily on imported oil but recently began a program to convert heating systems from oil to natural gas. Malvernia produces more natural gas than it uses. Furthermore, Malvernia''s oil production is expanding, Therefore, Malvernia will probably reduce its reliance on imported oils if these trends continue.

**Reasoning**
*Which option provides the information that it would be most useful to know in evaluating the argument?* In other words, we are looking for the option which—depending on whether it was answered yes or no— would either most weaken or most strengthen the argument. The argument indicates that Malvernia will be using less oil for heating and will be producing more oil domestically. But the conclusion that Malvernia''s reliance on foreign oil will decline, assuming the current trends mentioned continue, would be undermined if there was something in the works that could offset these trends—for instance, if it turned out that the country''s need for oil was going to rise in the coming years.

A. Since both domestic oil production and domestic natural gas production counteract the need for imported oil, it makes little difference to the argument whether domestic oil production exceeds domestic natural gas.

B. Whether there are many countries that rely more on foreign oil than Malvernia would have little impact on whether Malvernia''s need for foreign oil can be expected to decline.

C. Since there is no information in the argument about whether Malvernia can expect an increase or decrease from these other energy sources, it does not matter how much they now provide.

D. **Correct.** This option provides the information that it would be most useful to know in evaluating the argument. As explained in the Reasoning section above, if Malvernia''s need for oil rises in the coming years, the conclusion that Malvernia''s reliance on foreign oil will decline is undermined.

E. The argument tells us that a program has begun recently to convert heating systems from oil to gas. So, even if no such conversions have been completed, the argument still indicates that they can be expected to occur.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '2aaa0291-6449-4bcc-a263-3fbf5e12d4a7';

-- Q761
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Exposure to certain chemicals commonly used in elementary schools as cleaners or pesticides causes allergic reactions in some children. Elementary school nurses in Renston report that the proportion of schoolchildren sent to them for treatment of allergic reactions to those chemicals has increased significantly over the past ten years. Therefore, either Renston''s schoolchildren have been exposed to greater quantities of the chemicals or they are more sensitive to them than schoolchildren were ten years ago.',
      'question_text', 'Which of the following is an assumption on which the argument depends?',
      'options', jsonb_build_object('a', 'The number of school nurses employed by Renston''s elementary schools has not decreased over the past ten years.', 'b', 'Children who are allergic to the chemicals are no more likely than other children to have allergies to other substances.', 'c', 'Children who have allergic reactions to the chemicals are not more likely to be sent to a school nurse now than they were ten years ago.', 'd', 'The chemicals are not commonly used as cleaners or pesticides in houses and apartment buildings in Renston.', 'e', 'Children attending elementary school do not make up a larger proportion of Renston''s population now than they did ten years ago.'),
      'explanation', 'Argument Construction

**Situation**
Some children have allergic reactions to some of the chemicals commonly used in elementary schools as cleaners and pesticides. The number of children sent to elementary school nurses in Renston for allergic reactions to such chemicals has risen significantly over the past ten years.

**Reasoning**
*What must the argument assume?* The argument''s conclusion presents just two alternatives: either the children are exposed to more of the chemicals than children in earlier years or they are more sensitive. But there is a third possible explanation for the significant increase in school-nurse visits that the school nurses have reported: that children are just more inclined to go to the school nurse when they experience an allergic reaction than were children several years ago. For the conclusion to follow from its premises, the argument must assume that this is not the correct explanation.

A. If the number of school nurses in Renston elementary schools had decreased over the past ten years, that would in no way explain the rise in the proportion of children reporting to school nurses for allergic reactions.

B. Only school-nurse visits for allergic reactions to the cleaners and pesticides used in elementary schools are in question in the argument. Of course there could be school-nurse visits for allergic reactions to other things, but that issue does not arise in the argument.

C. **Correct.** This can be seen by considering whether the argument would work if we assume that this were false, i.e., that a school-nurse visit is more likely in such cases. As noted above, this provides an alternative to the two explanations that the conclusion claims are the sole possibilities.

D. This does not need to be assumed by the argument. The argument''s conclusion suggests that children may in recent years have had greater exposure to the chemicals, not that this exposure has occurred exclusively in the schools. The argument does not rely on this latter assumption.

E. The argument does not need to make this assumption. The argument is framed in terms of proportions of children having school-nurse visits for certain allergic reactions. How many children there are or what proportion such children are of Renston''s total population is not directly relevant to the argument.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '5f866420-22dd-4fd9-9b55-57d4aadf739a';

-- Q762
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Lockeport''s commercial fishing boats use gill nets, which kill many of the netted fish, including some fish of endangered species. The fishing commission has proposed requiring the use of tent nets, which do not kill fish; boat crews would then throw back fish of endangered species. Profitable commercial fishing boats in similar areas have already switched over to tent nets. The proposal can therefore be implemented without economic harm to Lockeport''s commercial fishing boat operators.',
      'question_text', 'Which of the following, if true, casts the most serious doubt on the argument made for the proposal?',
      'options', jsonb_build_object('a', 'In places where the use of tent nets has been mandated, there are typically fewer commercial fishing boats in operation than there were before tent nets came into use.', 'b', 'Even when used properly, gill nets require many more repairs than do tent nets.', 'c', 'Recreational anglers in Lockeport catch more fish of endangered species than do commercial fishing boats.', 'd', 'The endangered species of fish in Lockeport''s commercial fishing area did not become endangered as a result of the use of gill nets by fishing fleets.', 'e', 'The endangered species of fish caught by Lockeport''s commercial fishing fleet are of no commercial value.'),
      'explanation', 'Evaluation of a Plan

**Situation**
Gill nets, used by Lockeport''s commercial fishing boats, kill some fish of endangered species. The fishing commission has proposed requiring the use of tent nets, which do not kill fish. This would allow the fish of endangered species to be thrown back. It is argued that the proposed requirement will not harm commercial fishing boat operators, since commercial fishing boats in other similar places are using tent nets and are profitable.

**Reasoning**
*What new piece of information would weaken the argument for the proposed requirement?* The crucial support given for the argument is that in other similar places, commercial fishing boats that use tent nets and not gill nets are profitable. But if, in places where only tent nets are now used, the numbers of commercial fishing boats diminished, it would be reasonable to suspect that switching entirely to tent nets may have driven some of the fishing operations out of business or caused them to move to other areas in which there was no expectation that they would use only tent nets.

A. **Correct.** This is new information. As explained above, it would justify doubt about the argument made in favor of the proposal.

B. This suggests that implementation of the proposed requirement could, overtime, lowera certain type of operational costs for commercial fishing boats using tent nets. This would provide a new reason in support of the proposed requirement, not a reason to doubt the argument for it.

C. This suggests that perhaps recreational fishing in Lockeportneeds to be regulated more strictly, but that is a separate issue from the one addressed in the argument for the proposed tent-net requirement.

D. This information casts no doubt on the relevance of the stated information that using gill nets contributes to undermining populations ofat least some of the endangered fish species in Lockeport. If the species are currently endangered, they may need protection regardless of how they became endangered.

E. This information suggests that fish of the endangered species in Lockeport cannot profitably be sold. It does not cast doubt on the argument made in favor of the proposed requirement. Neither does it cast doubt on the practicality or the desirability of the proposed requirement.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '282ec088-fed0-4e50-823a-78194d46ee02';

-- Q763
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Normally, the pineal gland governs a person''s sleep-wake cycle by secreting melatonin in response to the daily cycle of light and darkness as detected by the eye. Nonetheless, many people who are totally blind due to lesions in the visual cortex of the brain easily maintain a 24-hour sleep-wake cycle. So, the neural pathway by which the pineal gland receives information from the eye probably does not pass through the visual cortex.',
      'question_text', 'For purposes of evaluating the argument, it would be most useful to establish which of the following?',
      'options', jsonb_build_object('a', 'Whether melatonin supplements help people who have difficulty maintaining a 24-hour sleep cycle to establish such a pattern', 'b', 'Whether the melatonin levels of most totally blind people who successfully maintain a 24-hour sleep-wake cycle change in response to changes in exposure to light and darkness', 'c', 'Whether melatonin is the only substance secreted by the pineal gland', 'd', 'Whether most people who do not have a 24-hour sleep-wake cycle nevertheless have a cycle of consistent duration', 'e', 'Whether there are any people with normal vision whose melatonin levels respond abnormally to periods of light and darkness'),
      'explanation', 'Argument Evaluation

**Situation**
Normally, a person''s sleep-wake cycle is governed by the pineal gland secreting melatonin in response to the daily cycle of light and darkness as detected by the eye. Yet many people who are totally blind due to lesions of the visual cortex easily maintain a 24-hour sleep-wake cycle.

**Reasoning**
*What additional information would be most helpful in evaluating the argument?* The argument''s conclusion is that the neural pathway by which the pineal gland receives information probably does not pass through the visual cortex. This is suggested by the fact that people without a well-functioning visual cortex (e.g., people with a certain type of blindness) can nonetheless maintain a 24-hour sleep-wake cycle. Is it by the pineal gland''s secretion of melatonin that they do so? The argument tells us that normally (i.e., in sighted people), this is the mechanism for sleep regulation. But the argument depends on assuming that a similar mechanism is operating in people who are blind but have well-regulated sleep cycles. The best choice will be the one that helps us decide whether that assumption is correct.

A. This question would not give us an answer that would help in evaluating the argument. A "no" answer would not clarify whether the pineal gland-melatonin mechanism operates in people who are blind. A "yes" answer would do no better. The question refers only to people who have sleep dysfunctions (which the argument does not address).

B. **Correct.** Answering this question would provide the most useful information for evaluating the argument. A "yes" answer would help confirm a key assumption of the argument: that blind people rely on the pineal gland-melatonin mechanism for sleep regulation. A "no" answer would help disconfirm that assumption.

C. Whether or not there are other substances secreted by the pineal gland makes no difference to the reasoning. The argument relies on the premise that the pineal gland governs the sleep cycle by secreting melatonin. For example, if the pineal gland sometimes secreted adrenaline, that would still have no bearing on the argument.

D. The consistency or inconsistency of the duration of some people''s sleep patterns has no relevance to the reasoning. Their sleep patterns could be due to any of a number of factors.

E. This does not help, for there could be sighted people whose melatonin levels respond abnormally simply because of a pineal-gland abnormality.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '5738d395-f0be-4406-9e08-453ee376c92e';

-- Q764
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Last year Comfort Airlines had twice as many delayed flights as the year before, but the number of complaints from passengers about delayed flights went up three times. It is unlikely that this disproportionate increase in complaints was rooted in an increase in overall dissatisfaction with the service Comfort Airlines provides, since the airline made a special effort to improve other aspects of its service last year.',
      'question_text', 'Which of the following, if true, most helps to explain the disproportionate increase in customer complaints?',
      'options', jsonb_build_object('a', 'Comfort Airlines had more flights last year than the year before.', 'b', 'Last year a single period of unusually bad weather caused a large number of flights to be delayed.', 'c', 'Some of the improvements that Comfort Airlines made in its service were required by new government regulations.', 'd', 'The average length of a flight delay was greater last year than it was the year before.', 'e', 'The average number of passengers per flight was no higher last year than the year before.'),
      'explanation', 'Argument Construction

**Situation**
Last year Comfort Airlines had twice as many delayed flights as it did the year before but three times as many passenger complaints about delayed flights. The airline made a special effort to improve other aspects of its service last year.

**Reasoning**
*What could explain why the number of complaints about delayed flights increased disproportionately to the number of delayed flights last year?* In other words, why did the average number of passenger complaints per delayed flight go up last year? One obvious possibility is that the average number of passengers per delayed flight was greater last year than it had been the year before. Another is that the flight delays tended to cause worse problems for passengers last year than they had the year before, so that on average each delay was more upsetting for the passengers.

A. This helps explain why the airline had more delayed flights last year, but not why the increase in complaints about delayed flights was disproportionate to the increase in delayed flights.

B. This helps explain why the airline had more delayed flights last year. But, if anything, the situation should have reduced the number of passenger complaints per delayed flight, since many passengers should have realized that the unusually bad weather was not the airline''s fault.

C. If any of the improvements concerned handling of flight delays, for example, and passengers were aware that government regulations addressed this, then passengers might have complained more than previously. But the information we are given here is too general and too vague to explain the disproportionate increase in complaints.

D. **Correct.** Longer flight delays would have more severely inconvenienced passengers and thus would probably have generated more passenger complaints per delay.

E. This rules out the possibility that an increased number of passengers per delayed flight could have caused the disproportionate increase in the number of complaints about delayed flights. But no alternative explanation is offered.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '7bc1cd99-daa3-4d8d-b990-c3eab5f4b026';

-- Q765
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Last year a global disturbance of weather patterns disrupted harvests in many of the world''s important agricultural areas. Worldwide production of soybeans, an important source of protein for people and livestock alike, was not adversely affected, however. Indeed, last year''s soybean crop was actually slightly larger than average. Nevertheless, the weather phenomenon is probably responsible for a recent increase in the world price of soybeans.',
      'question_text', 'Which of the following, if true, provides the strongest justification for the attribution of the increase in soybean prices to the weather phenomenon?',
      'options', jsonb_build_object('a', 'Last year''s harvest of anchovies, which provide an important protein source for livestock, was disrupted by the effects of the weather phenomenon.', 'b', 'Most countries that produce soybeans for export had above-average harvests of a number of food crops other than soybeans last year.', 'c', 'The world price of soybeans also rose several years ago, immediately after an earlier occurrence of a similar global weather disturbance.', 'd', 'Heavy rains attributable to the weather phenomenon improved grazing pastures last year, allowing farmers in many parts of the world to reduce their dependence on supplemental feed.', 'e', 'Prior to last year, soybean prices had been falling for several years.'),
      'explanation', 'Argument Construction

**Situation**
A weather disturbance last year disrupted harvests worldwide but did not reduce production of soybeans, a protein source for both people and livestock. Soybean prices increased nonetheless, likely a result of the weather.

**Reasoning**
*What evidence would suggest that the weather disturbance caused the increase in soybean prices even though it did not reduce soybean production?* Prices tend to increase when the supply of a product falls relative to the demand for the product. But the production of soybeans did not fall. Evidence that the weather disturbance either hindered the global distribution of soybeans or increased global demand for soybeans could support the claim that the weather disturbance caused the increase in soybean prices.

A. **Correct.** If the weather disturbance reduced the anchovy harvest, and anchovies provide protein for livestock just as soybeans do, then more soybeans for livestock feed would be needed to compensate for the lack of anchovies. The resulting increase in demand for soybeans could thus have increased global soybean prices.

B. This is not surprising, given that the weather disturbance did not severely affect the soybean-producing countries, but it does not explain how the weather disturbance could have caused soybean prices to increase.

C. The rise in soybean prices after the earlier weather disturbance could easily have been a coincidence. Or, unlike last year''s disturbance, the earlier disturbance could have reduced soybean production.

D. This suggests that demand for soybeans should have fallen as a result of the weather disturbance, so it does not explain why soybean prices rose.

E. If soybean prices were unusually low for some temporary reason when the weather disturbance occurred, they might have been likely to rise back to normal levels even without the weather disturbance.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '8fd40582-9e84-4a7c-ae3c-a6d4d0ec93bd';

-- Q766
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Most of the year, the hermit thrush, a North American songbird, eats a diet consisting mainly of insects, but in autumn, as the thrushes migrate to their Central and South American wintering grounds, they feed almost exclusively on wild berries. Wild berries, however, are not as rich in calories as insects, yet thrushes need to consume plenty of calories in order to complete their migration. One possible explanation is that berries contain other nutrients that thrushes need for migration and that insects lack.',
      'question_text', 'Which of the following, if true, most seriously calls into question the explanation given for the thrush''s diet during migration?',
      'options', jsonb_build_object('a', 'Hermit thrushes, if undernourished, are unable to complete their autumn migration before the onset of winter.', 'b', 'Insect species contain certain nutrients that are not found in wild berries.', 'c', 'For songbirds, catching insects requires the expenditure of significantly more calories than eating wild berries does.', 'd', 'Along the hermit thrushes'' migration routes, insects are abundant throughout the migration season.', 'e', 'There are some species of wild berries that hermit thrushes generally do not eat, even though these berry species are exceptionally rich in calories.'),
      'explanation', 'Argument Evaluation

**Situation**
Hermit thrushes are songbirds that usually eat insects but switch to eating berries when migrating. The thrushes need lots of calories to migrate, but berries contain fewer calories than insects do. Perhaps the berries contain nutrients that insects do not provide.

**Reasoning**
*What would cast doubt on the claim that the thrushes switch to berries because berries contain nutrients that insects lack and that the thrushes need for their migration?* Evidence that berries do not contain such nutrients or that thrushes do not decrease their net calorie consumption by eating berries would cast doubt on the proposed explanation. So would any evidence that supported an alternative explanation for the diet change during migration—for example, seasonal or regional differences in the amount or quality of berries or insects available for the thrushes to consume.

A. Even if thrushes need to be well-nourished to finish migrating before winter, extra nutrients found in berries but not insects might help provide the nourishment they need.

B. Even if insects contain certain nutrients not found in wild berries, those specific nutrients may not be the ones the thrushes need for their migration.

C. **Correct.** This suggests that the thrushes might gain more net calories from eating berries than from eating insects, which could explain why they switch to eating berries even if the berries contain no extra nutrients.

D. By ruling out a lack of insects to eat while migrating as an alternative explanation for why the thrushes switch to eating berries, this would support the proposed explanation.

E. The calorie-rich species of berries the thrushes do not eat might be poisonous or indigestible for them, even if the species of berries the thrushes do eat contain nutrients they need to migrate.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'bb02aed2-1061-43d9-b7e0-d4a97b26d7b3';

-- Q767
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The kinds of hand and wrist injuries that result from extended use of a computer while maintaining an incorrect posture are common among schoolchildren in Harnville. Computers are important to the school curriculum there, so instead of reducing the amount their students use computers, teachers plan to bring about a sharp reduction in the number of these injuries by carefully monitoring their students'' posture when using computers in the classroom.',
      'question_text', 'Which of the following would it be most useful to know in order to assess the likelihood that the teachers'' plan will be successful?',
      'options', jsonb_build_object('a', 'Whether extended use of a computer while maintaining incorrect posture can cause injuries other than hand and wrist injuries', 'b', 'Whether hand and wrist injuries not caused by computer use are common among schoolchildren in Harnville', 'c', 'What proportion of schoolchildren in Harnville with hand and wrist injuries use computers extensively outside the classroom', 'd', 'Whether changes in the curriculum could reduce the schools'' dependence on computers', 'e', 'What proportion of schoolchildren in Harnville already use correct posture while using a computer'),
      'explanation', 'Evaluation of a Plan

**Situation**
Hand and wrist injuries from using computers while maintaining poor posture are common among schoolchildren in Harnville. Teachers plan to greatly reduce the number of such injuries by monitoring their students'' posture while the students use computers in the classroom.

**Reasoning**
*What would be most helpful to know to determine the likelihood that the teachers'' plan will succeed?* The primary concern is the posture students adopt while using computers. To succeed, the teachers'' plan must reduce the time students spend with poor posture while using computers and reduce it enough to greatly reduce the number of injuries. To know how likely this is, it would help to know how effectively the teachers will be able to monitor and improve their students'' posture inside the classroom. But how many of the students use computers outside of school while maintaining poor posture, and how often do they do so? If many students do so quite often, they may develop hand and wrist injuries regardless of what happens in school.

A. The teachers do not plan to reduce any injuries other than hand and wrist injuries, so whether computer use with poor posture causes any such other injuries is irrelevant to the likelihood that their plan will produce its intended effect.

B. The plan being discussed concerns only the reduction of hand and wrist injuries caused specifically by computer use with poor posture, so the frequency of hand and wrist injuries from other causes is irrelevant to the likelihood that the plan will produce its intended effect.

C. **Correct.** If the students'' school use of computers is a large part of their overall computer use, any retraining that accompanies the monitoring might have some effect on their posture and related injury rates overall. However, the greater the proportion of children with hand and wrist injuries who use computers extensively outside the classroom, the more children are likely to keep developing the injuries regardless of any monitoring at school, so the less effective the teachers'' plan involving only computer use at school is likely to be.

D. Knowing whether this is the case might help in developing a potential alternative to the teachers'' plan, but if it did, this would not help significantly toward assessing the likelihood that the actual plan will succeed. The teachers'' actual plan involves monitoring computer use in school without reducing such use. Other possible means of achieving the plan''s goal are not part of the plan and are therefore irrelevant to the likelihood that the teachers'' actual plan will succeed.

E. The passage indicates that the proportion of the schoolchildren maintaining poor posture while using computers is high enough for many to develop hand and wrist injuries as a result. Whatever the exact proportion is, the teachers'' plan may or may not succeed in reducing it.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'c5ac2792-6764-4578-a8e6-58df76d303c0';

-- Q768
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'A certain cultivated herb is one of a group of closely related plants that thrive in soil with high concentrations of metals that are toxic to most other plants. Agronomists studying the growth of this herb have discovered that it produces large amounts of histidine, an amino acid that, in test-tube solutions, renders these metals chemically inert. Hence, the herb''s high histidine production must be the key feature that allows it to grow in metal-rich soils.',
      'question_text', 'In evaluating the argument, it would be most important to determine which of the following?',
      'options', jsonb_build_object('a', 'Whether the herb can thrive in soil that does not have high concentrations of the toxic metals', 'b', 'Whether others of the closely related group of plants also produce histidine in large quantities', 'c', 'Whether the herb''s high level of histidine production is associated with an unusually low level of production of some other amino acid', 'd', 'Whether growing the herb in soil with high concentrations of the metals will, over time, reduce their concentrations in the soil', 'e', 'Whether the concentration of histidine in the growing herb declines as the plant approaches maturity'),
      'explanation', 'Argument Evaluation

**Situation**
A certain herb and closely related species thrive in soil full of metals toxic to most plants. The herb produces much histidine, which makes those metals chemically inert. Histidine production, therefore, is largely what accounts for the herb''s thriving in metal-rich soils.

**Reasoning**
*What evidence would help determine whether the herb''s histidine production is what enables it to thrive in metal-rich soils?* The argument is that since the herb''s histidine chemically neutralizes the metals that are toxic to most plants, it must explain why the herb can thrive in metal-rich soils. To evaluate this argument, it would be helpful to know about the relationship between other closely related plant species'' histidine production and the ability to thrive in metal-rich soils. It would also be helpful to know about any other factors that might plausibly explain why the herb can thrive in those soils.

A. Whether or not the herb thrives in metal-free soils, histidine production could enable it to thrive in soils that contain toxic metals.

B. **Correct.** If the closely related plants do not produce much histidine, whatever other factor allows them to thrive in metal-rich soils would likely account for why the herb thrives in those soils as well.

C. The given information suggests no particular reason to suppose that a low level of some unspecified amino acid would enable a plant to thrive in metal-rich soils.

D. The herb might absorb metals from any metal-rich soil it grows in, regardless of why it thrives in that soil.

E. Whether or not histidine concentrations in the herb decline as it approaches maturity, there could still be enough histidine in the growing herb to neutralize the metals and explain why it can grow in metal-rich soil.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'aea7c584-4cf9-4366-9fe2-6ba129d144e7';

-- Q769
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Many people suffer an allergic reaction to certain sulfites, including those that are commonly added to wine as preservatives. However, since there are several winemakers who add sulfites to none of the wines they produce, people who would like to drink wine but are allergic to sulfites can drink wines produced by these winemakers without risking an allergic reaction to sulfites.',
      'question_text', 'Which of the following is an assumption on which the argument depends?',
      'options', jsonb_build_object('a', 'These winemakers have been able to duplicate the preservative effect produced by adding sulfites by means that do not involve adding any potentially allergenic substances to their wine.', 'b', 'Not all forms of sulfite are equally likely to produce the allergic reaction.', 'c', 'Wine is the only beverage to which sulfites are commonly added.', 'd', 'Apart from sulfites, there are no substances commonly present in wine that give rise to an allergic reaction.', 'e', 'Sulfites are not naturally present in the wines produced by these winemakers in amounts large enough to produce an allergic reaction in someone who drinks these wines.'),
      'explanation', 'Argument Construction

**Situation**
People who are allergic to certain sulfites can avoid risking an allergic reaction by drinking wine from one of the several producers that does not add sulfites.

**Reasoning**
*On what assumption does the argument depend?* Drinking wine to which no sulfites have been added will not prevent exposure to sulfites if, for instance, sulfites occur naturally in wines. In particular, if the wines that do not have sulfites added have sulfites present naturally in quantities sufficient to produce an allergic reaction, drinking these wines will not result in an allergic reaction. The argument therefore depends on assuming that this is not the case.

A. The argument does not require this because the conclusion does not address allergic reactions to substances other than sulfites.

B. The argument specifically refers to "certain sulfites" producing allergic reactions. It is entirely compatible with certain other forms of sulfites not producing allergic reactions in anyone.

C. This is irrelevant. The argument does not claim that one can avoid having an allergic reaction to sulfites from any source just by restricting one''s wine consumption to those varieties to which no sulfites have been added.

D. Once again, the argument''s conclusion does not address allergic reactions to substances other than sulfites in wine.

E. **Correct.** As explained in the Reasoning section above, the argument relies on the assumption that sulfites are not naturally present, in quantities sufficient to cause allergic reactions, in the wines to which no sulfites are added. If this assumption is not made, then the fact that no sulfites are added to certain wines is not a good reason to believe that people with sulfite allergies who consume the wines will not have an allergic reaction; if there are enough sulfites that naturally occur in the wine, people who consume the wine may well have an allergic reaction despite the fact that no sulfites have been added.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '55be5e6b-63ad-4ba9-ad36-64914aaa58ae';

-- Q770
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'A new law gives ownership of patents—documents providing exclusive right to make and sell an invention—to universities, not the government, when those patents result from government-sponsored university research. Administrators at Logos University plan to sell any patents they acquire to corporations in order to fund programs to improve undergraduate teaching.',
      'question_text', 'Which of the following, if true, would cast the most doubt on the viability of the college administrators'' plan described above?',
      'options', jsonb_build_object('a', 'Profit-making corporations interested in developing products based on patents held by universities are likely to try to serve as exclusive sponsors of ongoing university research projects.', 'b', 'Corporate sponsors of research in university facilities are entitled to tax credits under new federal tax-code guidelines.', 'c', 'Research scientists at Logos University have few or no teaching responsibilities and participate little if at all in the undergraduate programs in their field.', 'd', 'Government-sponsored research conducted at Logos University for the most part duplicates research already completed by several profit-making corporations.', 'e', 'Logos University is unlikely to attract corporate sponsorship of its scientific research.'),
      'explanation', 'Evaluation of a Plan

**Situation**
Universities own the patents resulting from government-sponsored research at their institutions. One university plans to sell its patents to corporations and use the proceeds to fund a program to improve teaching.

**Reasoning**
*What would cast doubt on the university''s plan?* The plan assumes that the university has been granted, and/or will be granted, patents for its inventions; that there will be a market for its patents; and that corporations will want to buy them. What might make this untrue? For example, the university''s inventions might have no practical value or might be useful only for government agencies, and if some of the corporations have already done the same or similar research, they will likely not be prospective buyers of the university''s patents.

A. This point is irrelevant to the plan to sell patents in order to fund a program.

B. The university plans to sell the patents to the corporations, not to invite the corporations to sponsor research.

C. This point is irrelevant to the university''s plan to sell offpatents since the plan does not specify that the research scientists will be involved in the programs to improve undergraduate teaching.

D. **Correct.** This statement properly identifies a factor that casts doubt on the university''s plan. The plan presupposes that corporations will want to buy the rights to the inventions. If some of the corporations have already done the same or similar research, they would likely have developed ways of achieving what the university''s inventions promise to achieve. In the case of potential future patents, they might even have already patented the inventions that the university would develop, in which case the university would be unable to patent them. Or the corporations might have developed similar, but not identical, inventions that serve the same purpose. In such cases, they probably would not need the university''s inventions.

E. The plan concerns selling patents resulting from government-sponsored research, not attracting corporate sponsorship for research.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '8621105a-684f-44b7-a024-b3459705be8d';

-- Q771
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Since it has become known that **several of a bank''s top executives have been buying shares in their own bank**, the bank''s depositors, who had been worried by rumors that the bank faced impending financial collapse, have been greatly relieved. They reason that, since top executives evidently have faith in the bank''s financial soundness, those worrisome rumors must be false. Such reasoning might well be overoptimistic, however, since **corporate executives have been known to buy shares in their own company in a calculated attempt to dispel negative rumors about the company''s health**.',
      'question_text', 'In the argument given, the two **boldfaced** portions play which of the following roles?',
      'options', jsonb_build_object('a', 'The first describes evidence that has been taken as supporting a conclusion; the second gives a reason for questioning that support.', 'b', 'The first describes evidence that has been taken as supporting a conclusion; the second states a contrary conclusion that is the main conclusion of the argument.', 'c', 'The first provides evidence in support of the main conclusion of the argument; the second states that conclusion.', 'd', 'The first describes the circumstance that the argument as a whole seeks to explain; the second gives the explanation that the argument seeks to establish.', 'e', 'The first describes the circumstance that the argument as a whole seeks to explain; the second provides evidence in support of the explanation that the argument seeks to establish.'),
      'explanation', 'Argument Evaluation

**Situation**
Top executives at a bank that has been rumored to be in financial trouble have been buying shares in the bank. Bank depositors see this as a good sign, because they believe that it indicates that the executives have faith in the bank. However, corporate executives sometimes do this just to dispel rumors about a company''s health.

**Reasoning**
*What is the role that the two **boldfaced** portions play in the argument?* The first **boldfaced** portion states that bank executives are buying bank shares, which the passage indicates is taken by bank depositors to be evidence of the executives'' faith in the bank; in other words, the bank depositors take the fact that the executives are buying shares in the bank as supporting the conclusion that the executives have faith in the bank and thus that the rumors that the bank is facing financial collapse are wrong. The passage then tells us what some have inferred from this (namely, that worrisome rumors about the bank''s impending financial collapse are false). Finally, the passage offers in the second **boldfaced** portion evidence that undermines this inference: corporate executives have sometimes bought shares in their own companies just to dispel negative rumors, presumably whether the rumors are true or not.

A. **Correct.** This option correctly identifies the roles played by the **boldfaced** portions. As discussed in the Reasoning section above, the bank depositors have drawn the conclusion from the first **boldfaced** portion that the bank''s finances are sound, but the second **boldfaced** portion is presented to call their conclusion into question.

B. This correctly describes the first portion''s role, but the second portion is not offered as a conclusion—no evidence is given for it; rather, it is evidence for something else.

C. The second portion is not offered as a conclusion; no evidence is given for it.

D. The second portion is not itself offered as an explanation of why these bank executives are investing in the bank; if it were, that would mean that the bank executives are doing so because corporate executives are known to do such things in a calculated effort to dispel worries. Furthermore, the argument does not conclude that this other explanation (which the **boldfaced** portion points to) is correct, only that the one inferred by depositors may not be.

E. The argument is not so much seeking to establish an explanation of its own as it is trying to undermine that inferred by the depositors.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'c1bc4366-b896-46b4-9e15-b20cef4ca1d1';

-- Q772
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Between 1980 and 2000, the sea otter population of the Aleutian Islands declined precipitously. There were no signs of disease or malnutrition, so there was probably an increase in the number of otters being eaten by predators. Orcas will eat otters when seals, their normal prey, are unavailable, and the Aleutian Islands seal population declined dramatically in the 1980s. Therefore, orcas were most likely the immediate cause of the otter population decline.',
      'question_text', 'Which of the following, if true, most strengthens the argument?',
      'options', jsonb_build_object('a', 'The population of sea urchins, the main food of sea otters, has increased since the sea otter population declined.', 'b', 'Seals do not eat sea otters, nor do they compete with sea otters for food.', 'c', 'Most of the surviving sea otters live in a bay that is inaccessible to orcas.', 'd', 'The population of orcas in the Aleutian Islands has declined since the 1980s.', 'e', 'An increase in commercial fishing near the Aleutian Islands in the 1980s caused a slight decline in the population of the fish that seals use for food.'),
      'explanation', 'Argument Evaluation

**Situation**
A sea otter population declined even though there were no signs of disease or malnutrition. The local seal population also declined. Orcas eat otters when seals are unavailable, and thus are probably the cause of the decline in the otter population.

**Reasoning**
*What would be evidence that predation by orcas reduced the sea otter population?* Disease and malnutrition are ruled out as alternative explanations of the decline in the sea otter population. The argument could be further strengthened by casting doubt on other possible explanations, such as predation by other animals, or by presenting observations that predation of otters by orcas would help to explain.

A. Regardless of whether or not orcas ate the sea otters, the sea urchin population would most likely have increased when the population of sea otters preying on them decreased.

B. Because the seal population declined during the initial years of the otter population decline, predation by and competition with seals were already implausible explanations of the otter population decline.

C. **Correct.** Orcas eating most of the accessible otters could plausibly explain this observation, which therefore provides additional evidence that orca predation reduced the sea otter population.

D. If the orca population declined at the same time as the sea otter population, it would be less likely that increasing predation by orcas reduced the otter population.

E. Since the sea otters showed no signs of malnutrition, they were probably getting enough fish. But if they were not, commercial fishing rather than orcas might have caused the otter population decline.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'f2970350-c893-40f2-add8-2e6f4f12f549';

-- Q773
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Political strategist: The domestic policies of our opponents in Party X are contrary to the priorities of many middle-class voters. Yet some of these same voters are supporters of Party X and its candidates due to the party''s appeals about foreign policy. In order to win these voters back, we in Party Y must prove to middle-class voters that Party X does not represent their priorities with respect to domestic policy.',
      'question_text', 'Which of the following would, if true, most strongly suggest that the political strategist''s plan is unlikely to succeed?',
      'options', jsonb_build_object('a', 'Many in the middle class who support Party X for its foreign policies also support its domestic policies and are fully aware of the implications of those policies.', 'b', 'Most middle-class supporters of Party X care about foreign policy and know very little about its domestic policies.', 'c', 'Long-term domestic policy sometimes conflicts with short-term domestic policy.', 'd', 'There are topics on which Party X and Party Y have significant agreement.', 'e', 'Some middle-class voters are concerned about both domestic and foreign policy.'),
      'explanation', 'Evaluation of a Plan

**Situation**
A political strategist for Party Y notes that the domestic policies of Party X are contrary to the priorities of middle-class voters. Many middle-class voters nonetheless support Party X because of its foreign policy.
The strategist argues that to win these voters back, Party Y should prove to middle-class voters that Party X''s domestic policies do not represent their priorities.

**Reasoning**
*What claim would most strongly suggest that the strategist''s plan will not succeed?* Suppose that a large number of the middle-class voters who support Party X''s foreign policies also support its domestic policies, despite the fact that the domestic policies are contrary to their priorities. If that were true, then Party Y might well be unable to win back these voters by following the strategist''s plan.

A. **Correct.** As noted above, if many middle-class voters who support Party X''s foreign policies also support its domestic policies, the strategy of attempting to show these voters that there is a conflict between their priorities and Party X''s domestic policies may well fail to get them to vote for Party Y. Presumably, these voters are aware of the conflict and support Party X nonetheless—perhaps because Party Y''s domestic policies conflict with their priorities even more.

B. If most middle-class supporters of Party X know little about its domestic policies, Party Y may well be able to win them back simply by showing them the inconsistencies between those policies and their own priorities.

C. A conflict between long-term domestic policy and short-term domestic policy tells us nothing about whether educating middle-class voters about conflicts between their priorities and Party X''s domestic policies would help win them back to Party Y.

D. The fact that the two parties have significant agreement on certain topics does not suggest the strategist''s plan will not succeed. In fact, if the parties agreed on very little, the strategy of pointing only to issues related to domestic policy might be less likely to work. Therefore, this answer choice helps rule out a reason for thinking that the plan might not work.

E. If anything, this would help support the claim that the strategist''s plan will succeed.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'ec48a3b1-c1d1-4258-909f-ec116e0ec04a';

-- Q774
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Studies in restaurants show that the tips left by customers who pay their bill in cash tend to be larger when the bill is presented on a tray that bears a credit-card logo. Consumer psychologists hypothesize that simply seeing a credit-card logo makes many credit-card holders willing to spend more because it reminds them that their spending power exceeds the cash they have immediately available.',
      'question_text', 'Which of the following, if true, most strongly supports the psychologists'' interpretation of the studies?',
      'options', jsonb_build_object('a', 'The effect noted in the studies is not limited to patrons who have credit cards.', 'b', 'Patrons who are under financial pressure from their credit-card obligations tend to tip less when presented with a restaurant bill on a tray with a credit-card logo than when the tray has no logo.', 'c', 'In virtually all of the cases in the studies, the patrons who paid bills in cash did not possess credit cards.', 'd', 'In general, restaurant patrons who pay their bills in cash leave larger tips than do those who pay by credit card.', 'e', 'The percentage of restaurant bills paid with a given brand of credit card increases when that credit card''s logo is displayed on the tray with which the bill is presented.'),
      'explanation', 'Argument Evaluation

**Situation**
Studies have found that restaurant customers give more generous tips when their bills are brought on trays bearing a credit-card logo. Psychologists speculate that this is because the logo reminds customers of their ability to spend more money than they have.

**Reasoning**
*Which of the options most helps to support the psychologists'' explanation of the studies?* The psychologists'' hypothesis is that the credit-card logos on the trays bring to the minds of those who tip more the fact that they have more purchasing power than merely the cash that they have at hand. This explanation would not be valid even if those people who are not reminded of their own excess purchasing power—if in fact they have any such power—when they see such a logo nonetheless tip more in such trays. Thus, if restaurant patrons who are under financial pressure from their credit-card obligations do not tip more when their bills are presented on trays bearing credit-card logos, then the psychologists'' interpretation of the studies is supported.

A. This undermines the psychologists'' interpretation, for it shows that the same phenomenon occurs even when the alleged cause has been removed.

B. **Correct.** If the consumer psychologists'' hypothesis is true, it implies that only those who do, in fact, have additional spending power in the form of credit will be influenced by the logos to leave larger tips. If those who do not have such additional spending power are influenced in the same way, the hypothesis is flawed. Answer choice B indicates that the hypothesis is not flawed in this way, so it thereby tends to strengthen the hypothesis. It also strengthens the hypothesis by weakening some alternative hypotheses such as the following: Most of the customers who pay with cash do so because they have excessive credit-card debt and cannot use a credit card. However, seeing a credit-card logo makes them wonder whether credit-card customers may leave larger tips, and to avoid displeasing the server by leaving a small tip, they decide to leave a larger tip than they might otherwise have done.

C. This undermines the psychologists'' interpretation by showing that the same phenomenon occurs even when the alleged cause has been removed; patrons cannot be reminded of something that is not there.

D. To the extent that this bears on the interpretation of the study, it weakens it. Patrons using credit cards are surely aware that they have credit, and yet they spend less generously.

E. This does not support the idea that being reminded that one has a credit card induces one to be more generous, only that it induces one to use that credit card.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '71ae7956-8c9c-411b-89f1-ae02b3ff65db';

-- Q775
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In an experiment, each volunteer was allowed to choose between an easy task and a hard task and was told that another volunteer would do the other task. Each volunteer could also choose to have a computer assign the two tasks randomly. Most volunteers chose the easy task for themselves and under questioning later said they had acted fairly. But when the scenario was described to another group of volunteers, almost all said choosing the easy task would be unfair. This shows that most people apply weaker moral standards to themselves than to others.',
      'question_text', 'Which of the following is an assumption required by this argument?',
      'options', jsonb_build_object('a', 'At least some volunteers who said they had acted fairly in choosing the easy task would have said that it was unfair for someone else to do so.', 'b', 'The most moral choice for the volunteers would have been to have the computer assign the two tasks randomly.', 'c', 'There were at least some volunteers who were assigned to do the hard task and felt that the assignment was unfair.', 'd', 'On average, the volunteers to whom the scenario was described were more accurate in their moral judgments than the other volunteers were.', 'e', 'At least some volunteers given the choice between assigning the tasks themselves and having the computer assign them felt that they had made the only fair choice available to them.'),
      'explanation', 'Argument Construction

**Situation**
In an experiment, most volunteers chose to do an easy task themselves and leave a hard task for someone else. They later said they had acted fairly, but almost all volunteers in another group to which the scenario was described said choosing the easy task would be unfair, indicating that most people apply weaker moral standards to themselves.

**Reasoning**
*What must be true in order for the facts presented to support the conclusion that most people apply weaker moral standards to themselves than to others?* One set of volunteers said they had acted fairly in taking the easy task, whereas different volunteers said that doing so would be unfair. In neither case did any of the volunteers actually judge their own behavior differently from how they judged anyone else''s. So, the argument implicitly infers from the experimental results that most of the volunteers would judge their own behavior differently from someone else''s if given the chance. This inference assumes that the volunteers in the second group would have applied the same moral standards that those in the first group did if they had been in the first group''s position, and vice versa.

A. **Correct.** If none of the volunteers who said their own behavior was fair would have judged someone else''s similar behavior as unfair, then their relaxed moral judgment of themselves would not suggest that they applied weaker moral standards to themselves than to others.

B. Even if this is so, the experimental results could still suggest that the volunteers would apply weaker moral standards to themselves than to others.

C. The argument would be equally strong even if volunteers who were assigned the hard task did not know that someone else had gotten an easier task—or even if no volunteers were actually assigned the hard task at all.

D. Even if the moral standards applied by the volunteers who judged themselves were as accurate as those applied by the volunteers to whom the scenario was described, the former standards were still weaker.

E. Even if all the volunteers in the first group had felt that all the choices available to them would have been fair for them to make personally, they might have applied stricter moral standards to someone else in the same position.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '0744904b-aeb5-4d40-b44e-f74372299a29';

-- Q776
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Country X''s recent stock-trading scandal should not diminish investors'' confidence in the country''s stock market. For one thing, **the discovery of the scandal confirms that Country X has a strong regulatory system**, as the following considerations show. In any stock market, some fraudulent activity is inevitable. Ifa stock market is well regulated, any significant stock-trading fraud in it will very likely be discovered. This deters potential perpetrators and facilitates improvement in regulatory processes.',
      'question_text', 'In the argument, the portion in **boldface** plays which of the following roles?',
      'options', jsonb_build_object('a', 'It is the argument''s only conclusion.', 'b', 'It is a conclusion for which the argument provides support and which itself is used to support the argument''s main conclusion.', 'c', 'It is the argument''s main conclusion and is supported by another explicitly stated conclusion for which further support is provided.', 'd', 'It is an assumption for which no explicit support is provided and is used to support the argument''s only conclusion.', 'e', 'It is a compound statement containing both the argument''s main conclusion and an assumption used to support that conclusion.'),
      'explanation', 'Argument Construction

**Situation**
Country X recently had a stock-trading scandal.

**Reasoning**
*What role does the statement that the scandal''s discovery confirms that Country X has a strong regulatory system play in the argument?* In the sentence containing the **boldfaced** statement, the phrase For one thing indicates that the statement is being used to justify the claim in the preceding sentence. Thus, the **boldfaced** statement must support that preceding sentence as a conclusion. Directly after the **boldfaced** statement, the phrase as the following considerations show indicates that the subsequent sentences are being used to support the **boldfaced** statement. Thus, the **boldfaced** statement is a conclusion supported by the sentences following it, and this statement itself supports the sentence preceding it, which must be the argument''s main conclusion.

A. As explained above, the **boldfaced** statement supports the claim in the preceding sentence, so it cannot be the argument''s only conclusion.

B. **Correct.** As explained above, the **boldfaced** statement is supported by the statements following it and in turn is used to support the argument''s main conclusion in the statement preceding it.

C. As explained above, the **boldfaced** statement cannot be the argument''s main conclusion, because it supports a further conclusion presented in the sentence preceding it.

D. As explained above, the sentences following the **boldfaced** statement are the explicit support provided for it.

E. As explained above, the argument''s main conclusion is stated only in the first sentence, which precedes the **boldfaced** statement. It is not repeated anywhere in the **boldfaced** statement.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '627252a2-9820-42d8-a470-deb4e97c3006';

-- Q777
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'A product that represents a clear technological advance over competing products can generally command a high price. Because **technological advances tend to be quickly surpassed** and companies want to make large profits while they still can, many companies charge the greatest price the market will bear when they have such a product. But **large profits on the new product will give competitors a strong incentive to quickly match the new product''s capabilities**. Consequently, the strategy to maximize overall profit from a new product is to charge less than the greatest possible price.',
      'question_text', 'In the argument above, the two portions in **boldface** play which of the following roles?',
      'options', jsonb_build_object('a', 'The first is an assumption that forms the basis for a course of action that the argument criticizes; the second presents the course of action endorsed by the argument.', 'b', 'The first is a consideration raised to explain the appeal of a certain strategy; the second is a consideration raised to call into question the wisdom of adopting that strategy.', 'c', 'The first is an assumption that has been used to justify a certain strategy; the second is a consideration that is used to cast doubt on that assumption.', 'd', 'The first is a consideration raised in support of a strategy the argument endorses; the second presents grounds in support of that consideration.', 'e', 'The first is a consideration raised to show that adopting a certain strategy is unlikely to achieve the intended effect; the second is presented to explain the appeal of that strategy.'),
      'explanation', 'Argument Evaluation

**Situation**
Companies generally charge the greatest price the market will bear when they have a product that represents a technological advance. This is because they want to make large profits while they can. But making large profits inspires competition. As a result, profits can be maximized by charging less than the greatest price possible.

**Reasoning**
*What logical roles do the two portions in **boldface** play in the argument?* The first sentence of the passage introduces a connection between technological advances and price. The second sentence discusses a pricing strategy related to such advances and offers certain considerations that help explain that strategy. The first **boldfaced** portion of the passage, which is contained in the second sentence, presents one of these considerations. The third sentence begins with the word But, which suggests that what follows—the second **boldfaced** section—presents a consideration that may be at least superficially at odds with the strategy just described. The final sentence of the argument presents an alternative strategy that is supported by the preceding discussion.

A. The course of action endorsed by the argument is described in the passage''s fourth and final sentence, not in the second boldfaced portion, which is found in the passage''s third sentence.

B. **Correct.** The first **boldfaced** portion is part of an explanation of why many companies follow the strategy of charging as much as the market will bear when they have a product representing a technological advance. The second **boldfaced** portion gives a reason not to follow that strategy.

C. The second **boldfaced** portion does not cast doubt on an assumption used to justify a strategy, but rather casts doubt on the strategy itself.

D. The first **boldfaced** portion is raised in support of a strategy that the argument calls into question, not a strategy that the argument endorses.

E. The first **boldfaced** portion helps explain the appeal of adopting a certain strategy; it does not show that the strategy is likely to fail. The second **boldfaced** portion does not explain the appeal of the strategy, but rather calls the strategy into question.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'edc0121b-3aa6-4c12-86e2-b3f15bb49c06';

-- Q778
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Theater critic: The play La Finestrina, now at Central Theater, was written in Italy in the eighteenth century. The director claims that this production is as similar to the original production as is possible in a modern theater. Although the actor who plays Harlequin the clown gives a performance very reminiscent of the twentieth-century American comedian Groucho Marx, Marx''s comic style was very much within the comic acting tradition that had begun in sixteenth-century Italy.',
      'question_text', 'The considerations given best serve as part of an argument that',
      'options', jsonb_build_object('a', 'modern audiences would find it hard to tolerate certain characteristics of a historically accurate performance of an eighteenth-century play', 'b', 'Groucho Marx once performed the part of the character Harlequin in La Finestrina', 'c', 'in the United States, the training of actors in the twentieth century is based on principles that do not differ radically from those that underlay the training of actors in eighteenth-century Italy', 'd', 'the performance of the actor who plays Harlequin in La Finestrina does not serve as evidence against the director''s claim', 'e', 'the director of La Finestrina must have advised the actor who plays Harlequin to model his performance on comic performances of Groucho Marx'),
      'explanation', 'Argument Construction

**Situation**
The director of the local production of La Finestrina says it is as similar to the original production as is possible in a modern theater. The actor playing Harlequin gives a performance reminiscent of Groucho Marx, whose comic style falls within an acting tradition which began in sixteenth-century Italy.

**Reasoning**
*For which of the options would the consideration given best serve as an argument?* The actor''s performance was reminiscent of someone who fell within a tradition going back to sixteenth-century Italy. The play was written, and therefore was likely first performed, in eighteenth-century Italy. All of this suggests that there could be a similarity between the performances of Harlequin in the local production and in the original production. While the two performances might have been quite dissimilar, there is nothing here that supports that.

A. Regardless of how plausible this option might be on its own merits, the passage provides no support for it because the passage provides no information about the characteristics of a historically accurate performance of an eighteenth-century play.

B. The passage neither says this nor implies it.

C. The passage says nothing about the training of actors, so this option would be supported by the passage only in a very roundabout, indirect way.

D. **Correct.** This is the option that the considerations most support.

E. That the performance reminded the theater critic of Groucho Marx hardly shows that the similarity was intentional, let alone that it was at the director''s instruction.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '242dc3df-606f-470d-a220-0cbb725fd56c';

-- Q779
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Although the discount stores in Goreville''s central shopping district are expected to close within five years as a result of competition from a SpendLess discount department store that just opened, those locations will not stay vacant for long. In the five years since the opening of Colson''s, a nondiscount department store, a new store has opened at the location of every store in the shopping district that closed because it could not compete with Colson''s.',
      'question_text', 'Which of the following, if true, most seriously weakens the argument?',
      'options', jsonb_build_object('a', 'Many customers of Colson''s are expected to do less shopping there than they did before the SpendLess store opened.', 'b', 'Increasingly, the stores that have opened in the central shopping district since Colson''s opened have been discount stores.', 'c', 'At present, the central shopping district has as many stores operating in it as it ever had.', 'd', 'Over the course of the next five years, it is expected that Goreville''s population will grow at a faster rate than it has for the past several decades.', 'e', 'Many stores in the central shopping district sell types of merchandise that are not available at either SpendLess or Colson''s.'),
      'explanation', 'Argument Evaluation

**Situation**
Due to competition from a recently opened SpendLess discount department store, discount stores in Goreville''s central shopping district are expected to close within five years. But those locations will not be vacant long, for new stores have replaced all those that closed because of the opening five years ago of a Colson''s nondiscount department store.

**Reasoning**
*Which option would most weaken the argument?* The arguer infers that stores that leave because of the SpendLess will be replaced in their locations by other stores because that is what happened after the Colson''s department store came in. Since the reasoning relies on a presumed similarity between the two cases, any information that brings to light a relevant dissimilarity would weaken the argument. If the stores that were driven out by Colson''s were replaced mostly by discount stores, that suggests that the stores were replaced because of a need that no longer exists after the opening of SpendLess.

A. The fact that Colson''s may be seeing fewer customers does not mean that the discount stores that close will not be replaced; they might be replaced by stores that in no way compete with Colson''s or SpendLess.

B. **Correct.** As explained in the Reasoning section above, the reasoning in the argument relies on a presumed similarity between the two cases, so any information that brings to light a relevant dissimilarity would weaken the argument. In the previous five years, the stores that went out of business were apparently direct competitors of Colson''s, whereas their replacements were of a different type. In contrast, in the predicted scenario, the stores that are expected to go out of business are apparently direct competitors of the new SpendLess discount store. Furthermore, if there has been a significant increase in the number of discount stores in the shopping district, the market for discount stores may well be nearly saturated, so that few, if any, new ones can survive.

C. If anything, this strengthens the argument by indicating that Goreville''s central shopping district is thriving.

D. This strengthens the argument because one is more likely to open a new store in an area with a growing population.

E. Because this statement does not indicate whether any of these stores that offer goods not sold at SpendLess or Colson''s will be among those that are closing, it is not possible to determine what effect it has on the strength of the argument.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '8055066d-df4b-4db7-bd20-7efe8ada7b3b';

-- Q780
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Last year all refuse collected by Shelbyville city services was incinerated. This incineration generated a large quantity of residual ash. In order to reduce the amount of residual ash Shelbyville generates this year to half of last year''s total, the city has revamped its collection program. This year city services will separate for recycling enough refuse to reduce the number of truckloads of refuse to be incinerated to half of last year''s number.',
      'question_text', 'Which of the following is required for the revamped collection program to achieve its aim?',
      'options', jsonb_build_object('a', 'This year no materials that city services could separate for recycling will be incinerated.', 'b', 'Separating recyclable materials from materials to be incinerated will cost Shelbyville less than half what it cost last year to dispose of the residual ash.', 'c', 'Refuse collected by city services will contain a larger proportion of recyclable materials this year than it did last year.', 'd', 'The refuse incinerated this year will generate no more residual ash per truckload incinerated than did the refuse incinerated last year.', 'e', 'The total quantity of refuse collected by Shelbyville city services this year will be no greater than that collected last year.'),
      'explanation', 'Argument Construction

**Situation**
To cut in half the residual ash produced at its incinerator, the city will separate, for recycling, enough refuse to cut in half the number of truckloads of refuse going to the incinerator.

**Reasoning**
*Which option is required if the city''s revamped collection program is to achieve its aim?* Cutting the number of truckloads of refuse in half must reduce the amount of residual ash to half last year''s level. But if removal of the recycled refuse does not proportionately reduce the amount of ash, this will not happen. So, if the amount of residual ash produced per truckload increases after recycling, then the amount of ash produced will not be cut in half by cutting in half the number of truckloads.

A. This merely indicates that no further reduction of ash through recycling could be achieved this year; it indicates nothing about how much the ash will be reduced.

B. This suggests a further benefit from recycling but does not bear on the amount of ash that will be produced.

C. Since no information is provided about how much, if any, recyclable materials were removed from the refuse last year, this does not affect the reasoning.

D. **Correct.** This states a requirement for the collection program to achieve its aim. To see why this is required, assume this were not true. Suppose, instead, that the refuse incinerated this year would generate more residual ash per truckload incinerated than the refuse incinerated last year did. If that were the case, then cutting in half the truckloads to be incinerated would not cut in half the amount of residual ash generated by incineration.

E. This is not a requirement because even if the city collects more refuse this year, it could still cut in half the amount of residual ash by cutting in half the number of truckloads going to the incinerator.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '41749341-f06c-45af-950e-a9f32374ebcb';

-- Q781
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Veterinarians generally derive some of their income from selling several manufacturers'' lines of pet-care products. Knowing that pet owners rarely throw away mail from their pet''s veterinarian unread, one manufacturer of pet-care products offered free promotional materials on its products to veterinarians for mailing to their clients. Very few veterinarians accepted the offer, however, even though the manufacturer''s products are of high quality.',
      'question_text', 'Which of the following, if true, most helps to explain the veterinarians'' reaction to the manufacturer''s promotional scheme?',
      'options', jsonb_build_object('a', 'Most of the veterinarians to whom the free promotional materials were offered were already selling the manufacturer''s pet-care products to their clients.', 'b', 'The special promotional materials were intended as a supplement to the manufacturer''s usual promotional activities rather than as a replacement for them.', 'c', 'The manufacturer''s products, unlike most equally good competing products sold by veterinarians, are also available in pet stores and in supermarkets.', 'd', 'Many pet owners have begun demanding quality in products they buy for their pets that is as high as that in products they buy for themselves.', 'e', 'Veterinarians sometimes recommend that pet owners use products formulated for people when no suitable product specially formulated for animals is available.'),
      'explanation', 'Evaluation of a Plan

**Situation**
Veterinarians generally derive some income from selling various manufacturers'' pet-care products, but very few veterinarians accepted free promotional materials from one such manufacturer to mail to their clients.

**Reasoning**
*What would most help explain why so few veterinarians accepted the free promotional materials to mail to their clients?* The passage says that veterinarians generally derive income from selling pet-care products, which suggests that it should have been in many veterinarians'' financial interest to accept and mail out the free promotional materials to increase sales. Any evidence that mailing out these specific promotional materials from this manufacturer would not actually have been in many veterinarians'' financial interest could help explain why so few veterinarians accepted the materials.

A. This suggests that most of the veterinarians should have had a financial interest in accepting and mailing out the promotional materials in order to increase their sales of the manufacturer''s products.

B. Even if the promotional materials supplemented the manufacturer''s usual promotional activities, they could still have increased the veterinarians'' sales of the manufacturer''s products and thus generated more income for the veterinarians.

C. **Correct.** If this manufacturer''s products are available in pet stores and supermarkets but most other products sold by veterinarians are not, then distributing the manufacturer''s promotional materials could have encouraged customers to buy this manufacturer''s products from pet stores and supermarkets rather than to buy competing products from the veterinarians. Thus, the veterinarians may have been concerned that the promotions would reduce their profits.

D. The passage says the manufacturer''s products are of high quality, so we have no reason to suppose that clients'' demand for quality products would discourage veterinarians from accepting the manufacturer''s promotional materials.

E. Presumably the manufacturer''s products are specially formulated for pets, so any products veterinarians recommend only when no specially formulated pet-care products are available would not reduce the veterinarians'' interest in promoting the manufacturer''s products.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'cfc0c71e-54f8-48b8-a3ae-d38cd3273c5d';

-- Q782
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The average hourly wage of television assemblers in Vernland has long been significantly lower than that in neighboring Borodia. Since Borodia dropped all tariffs on Vernlandian televisions three years ago, the number of televisions sold annually in Borodia has not changed. However, recent statistics show a drop in the number of television assemblers in Borodia. Therefore, updated trade statistics will probably indicate that the number of televisions Borodia imports annually from Vernland has increased.',
      'question_text', 'Which of the following is an assumption on which the argument depends?',
      'options', jsonb_build_object('a', 'The number of television assemblers in Vernland has increased by at least as much as the number of television assemblers in Borodia has decreased.', 'b', 'Televisions assembled in Vernland have features that televisions assembled in Borodia do not have.', 'c', 'The average number of hours it takes a Borodian television assembler to assemble a television has not decreased significantly during the past three years.', 'd', 'The number of televisions assembled annually in Vernland has increased significantly during the past three years.', 'e', 'The difference between the hourly wage of television assemblers in Vernland and the hourly wage of television assemblers in Borodia is likely to decrease in the next few years.'),
      'explanation', 'Argument Construction

**Situation**
Television assemblers in Vernland are paid less than those in neighboring Borodia. The number of televisions sold in Borodia has not dropped since its tariffs on Vernlandian TVs were lowered three years ago, but the number of TV assemblers in Borodia has. So, TV imports from Vernland have likely increased.

**Reasoning**
*What assumption does the argument depend on?* The fact that fewer individuals in Borodia are working as TV assemblers is offered as evidence that TV imports from Vernland into Borodia have likely increased.
That piece of evidence is relevant only as an indication that the number of TVs being produced within Borodia has decreased. But a drop in the number of TV assemblers does not indicate a drop in the number of TVs being assembled if the number of TVs an average assembler puts together has increased. Thus, the argument must be assuming that the average time it takes an assembler to put together a TV has not significantly decreased.

A. The argument does not rely on any information about the number of television assemblers in Vernland nor, for that matter, on the number of TVs assembled in Vernland.

B. The argument need not assume there is any difference in the features of the TVs produced in the two countries. Increased sales of Vernlandian TVs in Borodia could be due to any number of other reasons, such as price or quality.

C. **Correct.** If the average productivity of TV assemblers had increased significantly, the fact that there are fewer Borodian TV assemblers would not strongly support the conclusion that there has been a decrease in the number of TVs assembled in Borodia and an increase in imports; fewer assemblers may be producing just as many TVs as before. Therefore, for the argument to work, it needs to assume that productivity per assembler in Borodia has not decreased significantly.

D. The argument does not depend upon this being so: Vernland''s domestic TV sales (or perhaps its exports to countries other than Borodia) may have decreased by more than its exports to Borodia have increased.

E. The argument''s conclusion addresses what has happened; the argument in no way relies on any assumptions about what may or may not happen in the coming years.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '28403576-0568-4c76-a578-7b9b4a4e6591';

-- Q783
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', '**In countries where automobile insurance includes compensation for whiplash injuries sustained in automobile accidents, reports of having suffered such injuries are twice as frequent as they are in countries where whiplash is not covered**. Presently, no objective test for whiplash exists, so it is true that spurious reports of whiplash injuries cannot be readily identified. Nevertheless, these facts do not warrant the conclusion drawn by some commentators that in the countries with the higher rates of reported whiplash injuries, half of the reported cases are spurious. Clearly, **in countries where automobile insurance does not include compensation for whiplash, people often have little incentive to report whiplash injuries that they actually have suffered**.',
      'question_text', 'In the argument given, the two **boldfaced** portions play which of the following roles?',
      'options', jsonb_build_object('a', 'The first is a claim that the argument disputes; the second is a conclusion that has been based on that claim.', 'b', 'The first is a claim that has been used to support a conclusion that the argument accepts; the second is that conclusion.', 'c', 'The first is evidence that has been used to support a conclusion for which the argument provides further evidence; the second is the main conclusion of the argument.', 'd', 'The first is a finding whose implications are at issue in the argument; the second is a claim presented in order to argue against deriving certain implications from that finding.', 'e', 'The first is a finding whose accuracy is evaluated in the argument; the second is evidence presented to establish that the finding is accurate.'),
      'explanation', 'Argument Evaluation

**Situation**
Reported whiplash injuries are twice as common in countries where car insurance companies pay compensation for such injuries as they are in countries where insurance companies do not. Although there is no objective test for whiplash, this does not mean, as some suggest, that half of the reports of such injuries are fake. It could simply be that where insurance will not pay for such injuries, people are less inclined to report them.

**Reasoning**
*What roles do the two **boldfaced** portions play in the argument?* The first portion tells us about the correlation between reported cases of whiplash in countries and the willingness of insurance companies in those countries to compensate for whiplash injuries. The argument next states that whiplash is difficult to verify objectively. The argument then asserts that although this last fact, taken together with the first **boldfaced** portion, has led some to infer that over half of the reported cases in countries with the highest whiplash rates are spurious, such an inference is unwarranted. The second **boldfaced** portion then helps to explain, by offering an alternative explanation, why such an inference is not necessarily warranted.

A. The claim made in the first **boldfaced** portion is never disputed in the argument. The second is not the argument''s conclusion.

B. Perhaps the argument uses the first portion to support its conclusion, but there is no indication that it has been used elsewhere to do so. Regardless, the second **boldfaced** portion is not the argument''s conclusion.

C. The first portion has been used to support a conclusion that the argument rejects; the second portion is not the argument''s conclusion.

D. **Correct.** This answer choice correctly identifies the roles played in the argument by the **boldfaced** portions. As explained in the Reasoning section above, the first **boldfaced** portion tells us about the correlation between reported cases of whiplash in countries and the willingness of insurance companies in those countries to compensate for whiplash injuries. This is presented as a fact whose implications are at issue in the ensuing portions of the passage. The argument then reports that this fact, considered together with the difficulty ofproving whiplash injuries, has led some to infer that over half of the reported cases in countries with the highest whiplash rates are spurious. The conclusion of the argument is that this inference is unwarranted. The second **boldfaced** portion expresses the basis for the argument''s conclusion: there is a reasonable alternative explanation for the differences in frequency of whiplash injury reports between the two types of countries.

E. The accuracy of the first **boldfaced** portion is never questioned in the argument, nor is the second intended to somehow help show that the first is accurate. Rather, the argument assumes that the first **boldfaced** portion is accurate.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'b15fe790-37cc-46cf-8c6a-d76ed1a8d3c6';

-- Q784
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', '**Delta Products Inc. has recently switched at least partly from older technologies using fossil fuels to new technologies powered by electricity**. The question has been raised whether it can be concluded that, **for a given level of output, Delta''s operation now causes less fossil fuel to be consumed than it did formerly**. The answer, clearly, is yes, since the amount of fossil fuel used to generate the electricity needed to power the new technologies is less than the amount needed to power the older technologies, provided level of output is held constant.',
      'question_text', 'In the argument given, the two **boldfaced** portions play which of the following roles?',
      'options', jsonb_build_object('a', 'The first identifies the content of the conclusion of the argument; the second provides support for that conclusion.', 'b', 'The first provides support for the conclusion of the argument; the second identifies the content of that conclusion.', 'c', 'The first states the conclusion of the argument; the second calls that conclusion into question.', 'd', 'The first provides support for the conclusion of the argument; the second calls that conclusion into question.', 'e', 'Each provides support for the conclusion of the argument.'),
      'explanation', 'Argument Evaluation

**Situation**
Delta switched from technologies using fossil fuels to ones using electricity. It has been asked whether this results in less fossil fuel used per level of output. The answer is that it does.

**Reasoning**
*What roles do the two **boldfaced** portions play in the argument?* The first **boldfaced** statement is simply asserted by the passage; no premise, or reason, is given to support it. But the second **boldfaced** statement, when it is first introduced, is not asserted to be true, but rather is identified as something that might be inferred from the first statement. By the end of the passage, the argument concludes that the second statement is true.

A. This option simply reverses the roles that the statements play in the argument.

B. **Correct.** This option identifies the roles the **boldfaced** portions play: The second statement is not, on its own, the conclusion, because the argument initially merely asks whether it can be concluded on the basis of the first statement—that is, it asks whether the first **boldfaced** statement provides support for it. The conclusion of the argument is actually the statement The answer, clearly, is yes. The word yes is elliptical for Yes, it can be concluded that for a given level of output, Delta''s operation now causes less fossil fuel to be consumed than it did formerly. The **boldfaced** portion tells us what can be concluded, and thus it can accurately be described as the content of the conclusion.

C. Nothing in the passage is intended to support the first statement, and the second statement is not supposed to call the first into question.

D. This correctly identifies the role of the first statement, but the second **boldfaced** portion does not call the argument''s conclusion into question—it is part of a sentence that refers to the question whether that conclusion can be drawn from the first statement.

E. Again, this is only half right. The second **boldfaced** portion is not offered as support for the conclusion; if it were offered as such support, the argument would be guilty of circular reasoning, since the second **boldfaced** portion states exactly what the argument concludes.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '109f4c37-f4c1-4553-8e75-9c7b3cbe4343';

-- Q785
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Guidebook writer: I have visited hotels throughout the country and have noticed that in those built before 1930 the quality of the original carpentry work is generally superior to that in hotels built afterward. Clearly, carpenters working on hotels before 1930 typically worked with more skill, care, and effort than carpenters who have worked on hotels built subsequently.',
      'question_text', 'Which of the following, if true, most seriously weakens the guidebook writer''s argument?',
      'options', jsonb_build_object('a', 'The quality of original carpentry in hotels is generally far superior to the quality of original carpentry in other structures, such as houses and stores.', 'b', 'Hotels built since 1930 can generally accommodate more guests than those built before 1930.', 'c', 'The materials available to carpenters working before 1930 were not significantly different in quality from the materials available to carpenters working after 1930.', 'd', 'The better the quality of original carpentry in a building, the less likely that building is to fall into disuse and be demolished.', 'e', 'The average length of apprenticeship for carpenters has declined significantly since 1930.'),
      'explanation', 'Argument Evaluation

**Situation**
The original carpentry in hotels built before 1930 shows superior care, skill, and effort to that in hotels built after 1930. This leads to the conclusion that carpenters working on hotels before 1930 were superior in skill, care, and effort to those who came after.

**Reasoning**
*Which option most seriously weakens the argument?* The argument draws an inference from a comparison between carpentry in hotels of different eras to a judgment about the carpenters working on hotels in those eras. One way to weaken this inference is by finding some way in which the carpentry in the hotels may be unrepresentative of the skill, care, and effort of the carpenters working in the eras. The comparison is between the carpentry evident in hotels of the two eras that still exist. Thus, if there is some reason to think that hotels with good carpentry survive longer than those with bad carpentry, then still-existing hotels from the older era will have disproportionately more good carpentry, even assuming no difference between the skill, care, and effort of the carpenters from the two eras.

A. This option applies equally to both eras, so it has no bearing on the argument.

B. It is not clear whether carpenters working on larger hotels would exercise more, less, or the same skill and care as those working on smaller hotels; thus, this option does not weaken the argument.

C. The argument does not rely, even implicitly, on there being any difference in the quality of materials used in the two eras, so it does not weaken the argument to point out that no such difference exists.

D. **Correct.** This weakens the reasoning in the argument by showing a respect in which the comparison between existing hotels may be unrepresentative. Specifically, the comparison may be unrepresentative in that still-existing hotels that were built prior to 1930 may well have been better built than most hotels built prior to 1930 were; the hotels that did not have unusually high-quality carpentry work may have all fallen into disuse and been demolished.

E. The longer a carpenter works as an apprentice, the more skill he or she is apt to have upon becoming a full-fledged carpenter. So, this option would tend to slightly strengthen rather than weaken the argument.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'ea10779a-378e-4394-9eb4-59a130abeb59';

-- Q786
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Most of Western music since the Renaissance has been based on a seven-note scale known as the diatonic scale, but when did the scale originate? A fragment of a bone flute excavated at a Neanderthal campsite has four holes, which are spaced in exactly the right way for playing the third through sixth notes of a diatonic scale. **The entire flute must surely have had more holes**, and the flute was made from a bone that was long enough for these additional holes to have allowed a complete diatonic scale to be played. Therefore, **the Neanderthals who made the flute probably used a diatonic musical scale**.',
      'question_text', 'In the argument given, the two portions in **boldface** play which of the following roles?',
      'options', jsonb_build_object('a', 'The first is presented as evidence that is confirmed by data presented elsewhere in the argument given; the second states a hypothesis this evidence is used to undermine.', 'b', 'The first is an opinion for which no supporting evidence is presented in the argument given, which is used to support the main conclusion of the argument; the second is that main conclusion.', 'c', 'The first describes a discovery as undermining the position against which the argument is directed; the second states the main conclusion of the argument.', 'd', 'The first is a preliminary conclusion drawn on the basis of evidence presented elsewhere in the argument given; the second is the main conclusion this preliminary conclusion supports.', 'e', 'The first provides evidence to support the main conclusion of the argument; the second states a subsidiary conclusion that is drawn in order to support the main conclusion stated earlier in the argument.'),
      'explanation', 'Argument Evaluation

**Situation**
Western music has generally relied on the seven-note diatonic scale for centuries. A piece of Neanderthal bone flute has holes corresponding to part, but not all, of a diatonic scale. Because the fragment suggests a longer bone, the author infers that there must have been more holes corresponding to more notes and concludes the Neanderthal flute-makers probably employed a full diatonic scale.

**Reasoning**
*Two key phrases are in **boldface**: What function does each phrase perform?* The first phrase in **boldface** states the original flute "surely" had more holes corresponding to more notes. While this is a plausible inference, the word surely overstates the case. There is no convincing evidence provided to support the idea that the flute certainly had the extra holes before it was broken, and thereby that the original flute likely played a diatonic scale. The second **boldface** phrase concludes this particular group of Neanderthals likely used a diatonic scale; this conclusion relies entirely on the first, unsupported, assertion.

A. The first phrase is not supported by concrete data, only by the intuitive belief that the extra holes must have existed, and it supports rather than undermines the second phrase.

B. **Correct.** No actual evidence is presented for the assertion that the flute surely had more holes, making the first phrase an unsupported opinion; the second phrase concludes these Neanderthals likely used a diatonic scale, and that conclusion rests entirely on the assertion that the broken flute played such a scale in its complete form.

C. The first phrase constitutes an assertion, not a description of a discovery, and it supports rather than undermines the conclusion in the second phrase.

D. While the first phrase is a preliminary conclusion, it rests on the author''s intuitive belief that there were surely more holes when the flute was complete rather than on actual evidence that such holes existed—those missing holes and their corresponding notes are possible, but far from certain. The second phrase is a final conclusion based on that previous overstatement of the case.

E. The first phrase presents an assertion, not evidence, and the second phrase is a final rather than subsidiary conclusion.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '6e8d7c1b-1528-4272-afe8-4581d4d70318';

-- Q787
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'NorthAir charges low fares for its economy-class seats, but it provides very cramped seating and few amenities. Market research shows that economy passengers would willingly pay more for wider seating and better service, and additional revenue provided by these higher ticket prices would more than cover the additional cost of providing these amenities. Even though NorthAir is searching for ways to improve its profitability, it has decided not to make these improvements.',
      'question_text', 'Which of the following, if true, would most help to explain NorthAir''s decision in light of its objectives?',
      'options', jsonb_build_object('a', 'None of NorthAir''s competitors offers significantly better seating and service to economy-class passengers than NorthAir does.', 'b', 'On many of the routes that NorthAir flies, it is the only airline to offer direct flights.', 'c', 'A few of NorthAir''s economy-class passengers are satisfied with the service they receive, given the low price they pay.', 'd', 'Very few people avoid flying on NorthAir because of the cramped seating and poor service offered in economy class.', 'e', 'The number of people who would be willing to pay the high fares NorthAir charges for its business-class seats would decrease if its economy-class seating were more acceptable.'),
      'explanation', 'Evaluation of a Plan

**Situation**
Market research shows that improving some amenities for economy-class passengers would allow NorthAir to raise its economy ticket prices more than enough to cover the additional cost of providing those amenities. But NorthAir has decided not to improve those amenities, even though it is looking for ways to improve its profitability.

**Reasoning**
*What would most help explain why NorthAir decided not to improve the seating and other amenities, even though the resulting increase in economy-class ticket prices would more than cover the expense?* NorthAir is looking for ways to improve its profitability. Making improvements that would increase ticket prices enough to generate more revenue than they cost should improve profitability, other things being equal. But if improving the amenities would generate side effects that reduced profitability, those side effects would provide a good reason for NorthAir''s decision not to improve the amenities and hence would help explain why NorthAir made that decision.

A. The passage says that for NorthAir, the cost of providing better economy seating and other amenities would be more than met by the increased revenue from the higher ticket prices that passengers would be willing to pay. This could give NorthAir a competitive edge, with improved profitability.

B. Even if NorthAir faces little or no competition on certain routes, offering extra amenities might increase passengers'' interest in flying those routes. It might also lead passengers to choose NorthAir on other routes that competing airlines also serve. Both of these effects could improve NorthAir''s profitability.

C. Even if a few NorthAir economy passengers would not pay more for extra amenities, the market research indicates that most of them would, so offering the amenities could still improve NorthAir''s profits attributable to economy-class seating.

D. This suggests that improving the amenities would not increase the total number of NorthAir passengers. But improving the amenities might still enable the airline to increase its ticket prices per passenger enough to improve its profitability.

E. **Correct.** This suggests that improving the economy-class amenities would reduce NorthAir''s revenue from sales of business-class tickets, which are likely much more expensive than economy-class tickets. This reduction in revenue could be enough to reduce NorthAir''s total profitability despite the increased revenue from economy-class ticket sales.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'dd5f20f7-2d78-4724-9f1d-804a8d5fdf63';

-- Q788
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Asthma, a chronic breathing disorder, is significantly more common today among adult competitive swimmers than it is among competitive athletes who specialize in other sports. Although chlorine is now known to be a lung irritant and swimming pool water is generally chlorinated, it would be rash to assume that frequent exposure to chlorine is the explanation of the high incidence of asthma among these swimmers, since ___.',
      'question_text', 'Which of the following most logically completes the argument given?',
      'options', jsonb_build_object('a', 'young people who have asthma are no more likely to become competitive athletes than are young people who do not have asthma', 'b', 'competitive athletes who specialize in sports other than swimming are rarely exposed to chlorine', 'c', 'competitive athletes as a group have a significantly lower incidence of asthma than do people who do not participate in competitive athletics', 'd', 'until a few years ago, physicians routinely recommended competitive swimming to children with asthma, in the belief that this form of exercise could alleviate asthma symptoms', 'e', 'many people have asthma without knowing they have it and thus are not diagnosed with the condition until they begin engaging in very strenuous activities, such as competitive athletics'),
      'explanation', 'Argument Construction

**Situation**
Asthma is more common among competitive swimmers than among other competitive athletes. Chlorine is a lung irritant generally present in swimming pool water.

**Reasoning**
*What would cast doubt on the hypothesis that exposure to chlorine in swimming pools accounts for the high incidence of asthma among adult competitive swimmers?* Evidence of any other factor that would provide an alternative explanation of why asthma is more common among adult competitive swimmers than among other competitive athletes would make it rash to assume that frequent exposure to chlorine explains the high incidence of asthma among these swimmers, so a statement providing such evidence would logically fill in the blank at the end of the passage to complete the argument.

A. This might help explain why competitive athletes in general are not especially likely to have asthma, but it does not explain why adult competitive swimmers are more likely to have asthma than other competitive athletes are.

B. This provides additional evidence that exposure to chlorine explains why adult competitive swimmers are more likely to have asthma than other competitive athletes are, so it does not cast doubt on that hypothesis.

C. A lower incidence of asthma among competitive athletes than among nonathletes does not help explain the higher incidence of asthma among adult competitive swimmers than among other competitive athletes.

D. **Correct.** Routinely encouraging children with asthma to take up competitive swimming would likely have made the proportion of adult competitive swimmers with asthma exceed the proportion of other competitive athletes with asthma, even if chlorine in swimming pool water never causes asthma in swimmers.

E. This might help explain why people with asthma are just as likely as other people to become competitive athletes, but it does not help explain why adult competitive swimmers are more likely to have asthma than other competitive athletes are.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '182c14fa-1008-4e18-9914-4495a1f0773f';

-- Q789
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In the country of Marut, the Foreign Trade Agency''s records were reviewed in 1994 in light of information then newly available about neighboring Goro. The review revealed that in every year since 1963, the agency''s projection of what Goro''s gross national product (GNP) would be five years later was a serious underestimate. The review also revealed that in every year since 1963, the agency estimated Goro''s GNP for the previous year—a Goro state secret— very accurately.',
      'question_text', 'Of the following claims, which is most strongly supported by the statements given?',
      'options', jsonb_build_object('a', 'Goro''s GNP fluctuated greatly between 1963 and 1994.', 'b', 'Prior to 1995, Goro had not released data intended to mislead the agency in making its five-year projections.', 'c', 'The amount by which the agency underestimated the GNP it projected for Goro tended to increase over time.', 'd', 'Even before the new information came to light, the agency had reason to think that at least some of the five-year projections it had made were inaccurate.', 'e', 'The agency''s five-year projections of Goro''s GNP had no impact on economic planning in Marut.'),
      'explanation', 'Argument Construction

**Situation**
A review in 1994 revealed that every year since 1963, Marut''s Foreign Trade Agency had seriously underestimated what Goro''s GNP would be five years later but accurately estimated what Goro''s GNP had been the previous year.

**Reasoning**
*What conclusion do the stated facts most strongly support?* Goro''s GNP in each year at least from 1969 through 1993 had been seriously underestimated by the agency five years in advance, yet was then accurately estimated by the agency one year after the fact. It follows that for each of these years, the agency''s earlier projection of Goro''s GNP must have been much lower than its later estimate.

A. This is not supported by the information given. The fact that the agency consistently underestimated each year''s GNP in its five-year projections and then correctly estimated it after the fact does not indicate that Goro''s GNP fluctuated greatly.

B. This is not supported by the information given. The reason the agency''s five-year projections were inaccurate might well have been that Goro deliberately released data intended to mislead the agency in making those projections.

C. This is not supported by the information given. The fact that the underestimates remained large throughout the years in question does not indicate that the underestimates increased over time.

D. **Correct.** As explained above, for many years there were serious discrepancies between the agency''s five-year projections of Goro''s GNP and its retrospective estimates of each previous year''s trade. In any year at least from 1970 through 1993, these discrepancies, if noticed, would have given the agency reason to doubt some of the five-year projections.

E. This is not supported by the information given. Even though at least some of the five-year projections were eventually known to be serious underestimates, they could still have affected Marut''s economic planning. The economic planners might have retained an unreasonable faith in the accuracy of the most recent projections.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'fafdf8c2-4d23-4b23-a5ed-74c65eaf329e';

-- Q790
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Vargonia has just introduced a legal requirement that student-teacher ratios in government-funded schools not exceed a certain limit. All Vargonian children are entitled to education, free of charge, in these schools. When a recession occurs and average incomes fall, the number of children enrolled in government-funded schools tends to increase. Therefore, though most employment opportunities contract in economic recessions, getting a teaching job in Vargonia''s government-funded schools will not be made more difficult by a recession.',
      'question_text', 'Which of the following would be most important to determine in order to evaluate the argument?',
      'options', jsonb_build_object('a', 'Whether in Vargonia there are any schools not funded by the government that offer children an education free of charge', 'b', 'Whether the number of qualified applicants for teaching positions in government-funded schools increases significantly during economic recessions', 'c', 'What the current student-teacher ratio in Vargonia''s government-funded schools is', 'd', 'What proportion of Vargonia''s workers currently hold jobs as teachers in government-funded schools', 'e', 'Whether in the past a number of government-funded schools in Vargonia have had student-teacher ratios well in excess of the new limit'),
      'explanation', 'Argument Evaluation

**Situation**
During a recession, the number of children in government-funded schools in Vargonia tends to increase. Vargonian children are entitled to a free education in these schools. A new law requires student-teacher ratios in these schools to remain below a certain limit.

**Reasoning**
*Which of the five questions would provide us with the best information for evaluating the argument?* The argument''s conclusion is that recessions do not make teaching jobs in Vargonia''s government-funded schools harder to get. During recessions, the reasoning goes, more students will enroll in Vargonia''s government-funded schools than in nonrecession times. Implicit in the argument is the thought that, because the new law sets an upper limit on the average number of students per teacher, schools that get an influx of new students would have to hire more teachers. During a recession, however, there might be much more competition in the labor market for teachers because many more qualified people are applying for teaching jobs.

A. This information is not significant in the context of the argument, which does not need to assume that only government-funded schools provide free education.

B. **Correct.** Getting an answer to this question would provide us with specific information useful in evaluating the argument. A "yes" answer to this question would suggest that competition for teaching jobs in Vargonian government-funded schools would be keener during recessions. A "no" answer would suggest that the level of competition would decrease during recessions.

C. Discovering the current student-teacher ratio in Vargonia''s schools would be of no value, by itself, in evaluating the argument. We do not know what the new upper limit on the student-teacher ratio is, and we do not know whether Vargonia is currently in a recession.

D. Finding out whether the proportion this refers to is 1 percent, for example, or 4 percent, would tell us nothing about whether getting teaching jobs at government-funded schools in Vargonia becomes more difficult during a recession. Among other things, we do not know whether Vargonia is currently in a recession, and we do not know what proportion of Vargonia''s workers would be qualified candidates for teaching jobs.

E. This is of no relevance in evaluating the argument because, presumably, the new limit on student-teacher ratios will be complied with. Thus, even if student-teacher ratios in the past would have exceeded the new limit, the argument concerns whether, in the future, getting a teaching job in Vargonia''s government-funded schools will be made more difficult by a recession.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '478a8148-64db-466a-af79-0b9f208200c8';

-- Q791
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In Colorado subalpine meadows, nonnative dandelions co-occur with a native flower, the larkspur. Bumblebees visit both species, creating the potential for interactions between the two species with respect to pollination. In a recent study, researchers selected 16 plots containing both species; all dandelions were removed from eight plots; the remaining eight control plots were left undisturbed. The control plots yielded significantly more larkspur seeds than the dandelion-free plots, leading the researchers to conclude that the presence of dandelions facilitates pollination (and hence seed production) in the native species by attracting more pollinators to the mixed plots.',
      'question_text', 'Which of the following, if true, most seriously undermines the researchers'' reasoning?',
      'options', jsonb_build_object('a', 'Bumblebees preferentially visit dandelions over larkspurs in mixed plots.', 'b', 'In mixed plots, pollinators can transfer pollen from one species to another to augment seed production.', 'c', 'If left unchecked, nonnative species like dandelions quickly crowd out native species.', 'd', 'Seed germination is a more reliable measure of a species'' fitness than seed production.', 'e', 'Soil disturbances can result in fewer blooms, and hence lower seed production.'),
      'explanation', 'Argument Evaluation

**Situation**
Bumblebees visit both larkspur and dandelions in certain meadows. A study found that more larkspur seeds were produced in meadow plots in which both larkspur and dandelions grew than in similar plots from which all dandelions had been removed. The researchers inferred that dandelions facilitate larkspur pollination.

**Reasoning**
*What evidence would cast the most doubt on the inference from the study''s findings to the conclusion that dandelions facilitate larkspur pollination by attracting more pollinators?* The argument assumes that the only relevant difference between the two types of plots was whether dandelions were present. Evidence that the plots differed in some other way that could provide a plausible alternative explanation of why more larkspur seeds were produced in the plots with dandelions would weaken the argument.

A. This would suggest that the larkspur pollination should have been lower in the plots with dandelions, so it does not provide a plausible alternative explanation for the study''s findings.

B. This is fully compatible with the claim that the dandelions attracted more pollinators to the mixed plots, and it would also help to support the argument''s conclusion that dandelions facilitated larkspur pollination in those plots.

C. Although this suggests that the mixed plots won''t remain mixed for long, it does not provide a plausible alternative explanation for the study''s finding that larkspur seed production was higher in the mixed plots.

D. The argument is not about how fit larkspurs are as a species but about why they produced different numbers of seeds in the different plots.

E. **Correct.** This provides a plausible alternative explanation for why larkspur seed production was lower in the plots from which dandelions had been removed, since digging them out would have disturbed the soil.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '6a1cf425-031a-4097-93da-ec7860be8fd5';

-- Q792
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Paleontologist: About 2.8 million years ago, many species that lived near the ocean floor suffered substantial population declines. These declines coincided with the onset of an ice age. The notion that cold killed those bottom-dwelling creatures outright is misguided, however; temperatures near the ocean floor would have changed very little. Nevertheless, **the cold probably did cause the population declines, though indirectly**. Many bottom-dwellers depended on plankton, small organisms that lived close to the surface and sank to the bottom when they died, for food. **Most probably, the plankton suffered a severe population decline as a result of sharply lower temperatures at the surface**, depriving many bottom-dwellers of food.',
      'question_text', 'In the paleontologist''s reasoning, the two portions in **boldface** play which of the following roles?',
      'options', jsonb_build_object('a', 'The first introduces the hypothesis proposed by the paleontologist; the second is a judgment offered in spelling out that hypothesis.', 'b', 'The first introduces the hypothesis proposed by the paleontologist; the second is a position the paleontologist opposes.', 'c', 'The first is an explanation challenged by the paleontologist; the second is an explanation proposed by the paleontologist.', 'd', 'The first is a judgment advanced in support of a conclusion reached by the paleontologist; the second is that conclusion.', 'e', 'The first is a generalization put forward by the paleontologist; the second presents certain exceptional cases in which that generalization does not hold.'),
      'explanation', 'Evaluation of a Plan

**Situation**
At the beginning of an ice age roughly 2.8 million years ago, many species of deep-sea animals suffered sharp drops in population. Because temperatures at those depths would have been very modestly affected, the author rejects the conclusion that cold killed these animals directly. Rather, the author suggests cold had an indirect impact by killing off surface-dwelling plankton since the bottom-dwelling animals relied on dead plankton drifting downward for food. The author concludes that sharp declines in plankton populations near the ocean surface likely led to population declines among species far below.

**Reasoning**
*Two key phrases are in **boldface**: What function does each phrase perform?* The first phrase states the cold probably had an indirect impact on populations of deep-sea animals. This constitutes a hypothesis proposed by the author to explain the correlation between the beginning of an ice age and sharp drops in population among bottom-dwelling animals. The second phrase states the cold probably killed a large proportion of plankton near the surface. This is a judgment spelling out the hypothesis that cold was indirectly responsible for deep-sea population declines by identifying a mechanism that would show how cold could have that effect.

A. **Correct.** The first phrase presents the author''s hypothesis that cold indirectly caused population declines among deep-sea species; the second phrase, that the cold likely killed a large proportion of the plankton, is a judgment regarding probable effects of the cold that spells out the details of how that hypothesis would work.

B. While the first phrase is the author''s hypothesis, the author endorses rather than opposes the position in the second phrase—that cold probably killed off a large proportion of the plankton.

C. The author challenges the explanation that cold was directly responsible for population declines among deep-sea species; the first phrase, that cold was indirectly responsible, is the explanation the author proposes, and the second phrase elaborates on that explanation.

D. The first phrase is a hypothesis, not a judgment; the second phrase develops that hypothesis rather than drawing a conclusion.

E. The first phrase presents a hypothesis, not a generalization, and the second phrase develops that hypothesis rather than saying anything about exceptional cases.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '740a5521-19bb-4ea7-a4bd-4b13a7cb71cb';

-- Q793
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'With seventeen casinos, Moneyland operates the most casinos in a certain state. Although intent on expanding, it was outmaneuvered by Apex Casinos in negotiations to acquire the Eldorado chain. To complete its acquisition of Eldorado, Apex must sell five casinos to comply with a state law forbidding any owner to operate more than one casino per county. Since Apex will still be left operating twenty casinos in the state, it will then have the most casinos in the state.',
      'question_text', 'Which of the following, if true, most seriously undermines the prediction?',
      'options', jsonb_build_object('a', 'Apex, Eldorado, and Moneyland are the only organizations licensed to operate casinos in the state.', 'b', 'The majority of Eldorado''s casinos in the state will need extensive renovations if they are to continue to operate profitably.', 'c', 'Some of the state''s counties do not permit casinos.', 'd', 'Moneyland already operates casinos in the majority of the state''s counties.', 'e', 'Apex will use funds it obtains from the sale of the five casinos to help fund its acquisition of the Eldorado chain.'),
      'explanation', 'Argument Evaluation

**Situation**
Moneyland operates seventeen casinos, the most in a certain state, and is intent on expanding. Another operator, Apex Casinos, is acquiring the Eldorado casino chain but must sell five casinos to comply with a state law forbidding any owner to operate more than one casino per county. After these transactions, Apex will operate twenty casinos in the state.

**Reasoning**
*What observation would cast the most doubt on the prediction that Apex will have the most casinos in the state after the transactions?* Apex will operate twenty casinos, whereas Moneyland now operates just seventeen, and no one else operates even that many. It follows that Apex will operate more casinos after its transactions than Moneyland or any other one owner now operates. However, if Moneyland also acquires three or more casinos during the transactions, then Apex will not have the most casinos in the state afterward. Thus, any observation suggesting that Moneyland is about to acquire several casinos would undermine the prediction.

A. **Correct.** Since Apex is acquiring Eldorado, Moneyland and Apex will be the only remaining licensed casino operators in the state. Therefore, Moneyland is the only likely buyer for the five casinos Apex needs to sell. So, Moneyland is likely to acquire the five casinos during the sale and end up with twenty-two casinos—more than Apex.

B. This does not undermine the prediction. Even if the Eldorado casinos cannot operate profitably for long without extensive renovations, Apex will still have twenty casinos immediately after its transactions.

C. This supports rather than undermines the prediction. If fewer counties permit casinos, there will be fewer opportunities for Moneyland or any other operator to acquire more casinos to surpass the twenty Apex will own.

D. This supports rather than undermines the prediction. If Moneyland''s seventeen casinos are in most of the state''s counties already, then there are fewer counties in which Moneyland could acquire additional casinos to surpass the twenty Apex will own.

E. This supports rather than undermines the prediction. Apex''s use of the funds from selling the five casinos to acquire the Eldorado chain will not help anyone else to acquire more casinos to surpass the twenty Apex will own.

**The correct answer is A.**'
    ),
  answers = jsonb_build_object('correct_answer', 'a', 'wrong_answers', ARRAY['b','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'ecf8ec8c-0900-491c-85f3-620b53d9f169';

-- Q794
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'It is widely assumed that people need to engage in intellectual activities such as solving crossword puzzles or mathematics problems in order to maintain mental sharpness as they age. In fact, however, simply talking to other people—that is, participating in social interaction, which engages many mental and perceptual skills—suffices. Evidence to this effect comes from a study showing that the more social contact people report, the better their mental skills.',
      'question_text', 'Which of the following, if true, most seriously weakens the force of the evidence cited?',
      'options', jsonb_build_object('a', 'As people grow older, they are often advised to keep exercising their physical and mental capacities in order to maintain or improve them.', 'b', 'Many medical conditions and treatments that adversely affect a person''s mental sharpness also tend to increase that person''s social isolation.', 'c', 'Many people are proficient both in social interactions and in solving mathematical problems.', 'd', 'The study did not itself collect data but analyzed data bearing on the issue from prior studies.', 'e', 'The tasks evaluating mental sharpness for which data were compiled by the study were more akin to mathematics problems than to conversation.'),
      'explanation', 'Argument Evaluation

**Situation**
A study shows that the more social contact people report, the better their mental skills are, so engaging in social interaction is sufficient for maintaining mental sharpness.

**Reasoning**
*What would suggest that the study does not establish the truth of the conclusion?* The study shows a correlation between mental sharpness and social interaction but does not indicate why this correlation exists.
Evidence that mental sharpness contributes to social interaction, or that some third factor affects both mental sharpness and social interaction, could provide an alternative explanation for the correlation and thus cast doubt on the explanation that social interaction contributes to mental sharpness.

A. People are often wrongly advised to do things that are not actually beneficial. And even if exercising mental capacities does help to maintain them, the passage says that social interaction provides such exercise.

B. **Correct.** This provides evidence that the correlation observed in the study results from mental sharpness facilitating social interaction, in which case the study results do not indicate that social interaction facilitates mental sharpness.

C. This would be expected, given the argument''s conclusion that social interaction helps to maintain better mental skills overall.

D. A study that analyzes data from prior studies can provide evidence just as well as a study that collects its own data can.

E. The argument''s conclusion would be compatible with this observation and would then suggest that social interaction contributes to the mental sharpness needed for tasks similar to math problems.

**The correct answer is B.**'
    ),
  answers = jsonb_build_object('correct_answer', 'b', 'wrong_answers', ARRAY['a','c','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'e3c06f25-e0cb-42ca-8a96-ad6d944a23bd';

-- Q795
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'In the United States, of the people who moved from one state to another when they retired, the percentage who retired to Florida has decreased by three percentage points over the past ten years. Since many local businesses in Florida cater to retirees, these declines are likely to have a noticeably negative economic effect on these businesses and therefore on the economy of Florida.',
      'question_text', 'Which of the following, if true, most seriously weakens the argument given?',
      'options', jsonb_build_object('a', 'People who moved from one state to another when they retired moved a greater distance, on average, last year than such people did ten years ago.', 'b', 'People were more likely to retire to North Carolina from another state last year than people were ten years ago.', 'c', 'The number of people who moved from one state to another when they retired has increased significantly over the past ten years.', 'd', 'The number of people who left Florida when they retired to live in another state was greater last year than it was ten years ago.', 'e', 'Florida attracts more people who move from one state to another when they retire than does any other state.'),
      'explanation', 'Argument Evaluation

**Situation**
Of those people who move to another state when they retire, the percentage moving to Florida has declined. This trend is apt to harm Florida''s economy because many businesses there cater to retirees.

**Reasoning**
*Which of the options most weakens the argument?* The argument draws its conclusion from data about the proportion of emigrating retirees moving to Florida. Yet what matters more directly to the conclusion (and to Florida''s economy) is the absolute number of retirees immigrating to Florida. That number could have remained constant, or even risen, if the absolute number of emigrating retirees itself increased while the proportion going to Florida decreased.

A. This has no obvious bearing on the argument one way or another. It makes it more likely, perhaps, that a person in a distant state will retire to Florida but less likely that one in a neighboring state will do so.

B. This has no bearing on whether fewer people have been retiring to Florida over the last ten years.

C. **Correct.** This is the option that most seriously weakens the argument.

D. This makes it more likely that Florida''s economy will be harmed because of decreasing numbers of retirees, but it has no real bearing on the argument which concludes specifically that declines in the proportion of emigrating retirees moving to Florida will have a negative effect on the state''s economy.

E. This is irrelevant. At issue is how the numbers of retirees in Florida from one year compare to the next, not how those numbers compare with numbers of retirees in other states.

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '4a020203-8aa4-4cdf-b65a-8083898c03e2';

-- Q796
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The spacing of the four holes on a fragment of a bone flute excavated at a Neanderthal campsite is just what is required to play the third through sixth notes of the diatonic scale—the seven-note musical scale used in much of Western music since the Renaissance. Musicologists therefore hypothesize that the diatonic musical scale was developed and used thousands of years before it was adopted by Western musicians.',
      'question_text', 'Which of the following, if true, most strongly supports the hypothesis?',
      'options', jsonb_build_object('a', 'Bone flutes were probably the only musical instrument made by Neanderthals.', 'b', 'No musical instrument that is known to have used a diatonic scale is of an earlier date than the flute found at the Neanderthal campsite.', 'c', 'The flute was made from a cave-bear bone, and the campsite at which the flute fragment was excavated was in a cave that also contained skeletal remains of cave bears.', 'd', 'Flutes are the simplest wind instrument that can be constructed to allow playing a diatonic scale.', 'e', 'The cave-bear leg bone used to make the Neanderthal flute would have been long enough to make a flute capable of playing a complete diatonic scale.'),
      'explanation', 'Argument Evaluation

**Situation**
The arrangement of the holes in a bone fragment from a Neanderthal campsite matches part of the scale used in Western music since the Renaissance. Musicologists hypothesize from this that the scale was developed thousands of years before Western musicians adopted it.

**Reasoning**
*Which of the options, if true, would provide the most support for the musicologists'' hypothesis?* One way to approach this question is to ask yourself, "If this option were false, would the hypothesis be less likely to be true?" If the Neanderthal bone fragment could not have been part of a flute that encompassed the entire seven-note diatonic scale, then the bone fragment''s existence would not provide strong support for the hypothesis.

A. To the extent that this is even relevant, it tends to weaken the hypothesis; it makes less likely the possibility that Neanderthals used other types of musical instruments employing the diatonic scale.

B. This also weakens the hypothesis because it states that there is no known evidence of a certain type that would support the hypothesis.

C. The fact that the cave-bear bone fragment that was apparently a flute came from a site where many other cave-bear skeletal remains were found has little bearing on the hypothesis and in no way supports it.

D. This does not strengthen the hypothesis, for even if the option were false—even if a simpler instrument could be constructed that employed the diatonic scale—the existence of a flute employing the diatonic scale would provide no less support for the hypothesis.

E. **Correct.** This option most strongly supports the hypothesis.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'a782f354-b992-479c-b9dd-63837460a9ea';

-- Q797
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'The figures in portraits by the Spanish painter El Greco (1541-1614) are systematically elongated. In El Greco''s time, the intentional distortion of human figures was unprecedented in European painting. Consequently, some critics have suggested that El Greco had an astigmatism, a type of visual impairment, that resulted in people appearing to him in the distorted way that is characteristic of his paintings. However, this suggestion cannot be the explanation, because ___.',
      'question_text', 'Which of the following most logically completes the passage?',
      'options', jsonb_build_object('a', 'several twentieth-century artists have consciously adopted from El Greco''s paintings the systematic elongation of the human form', 'b', 'some people do have elongated bodies somewhat like those depicted in El Greco''s portraits', 'c', 'if El Greco had an astigmatism, then, relative to how people looked to him, the elongated figures in his paintings would have appeared to him to be distorted', 'd', 'even if El Greco had an astigmatism, there would have been no correction for it available in the period in which he lived', 'e', 'there were non-European artists, even in El Greco''s time, who included in their works human figures that were intentionally distorted'),
      'explanation', 'Argument Evaluation

**Situation**
Figures in portraits by the Spanish painter El Greco are elongated. Some critics infer that this was because El Greco suffered from an astigmatism that made people appear elongated to him. But this explanation cannot be correct.

**Reasoning**
*Which option would most logically complete the argument?* We need something that provides the best reason for thinking that the explanation suggested by critics—astigmatism—cannot be right. The critics'' explanation might seem to work because ordinarily an artist would try to paint an image of a person so that the image would have the same proportions as the perceived person. So, if people seemed to El Greco to have longer arms and legs than they actually had, the arms and legs of the painted figures should appear to others to be longer than people''s arms and legs normally are. This is how the explanation seems to make sense. But if astigmatism were the explanation, then the elongated images in his pictures should have appeared to El Greco to be too long: he would have perceived the images as longer than they actually are—and therefore as inaccurate representations of what he perceived. So, astigmatism cannot be a sufficient explanation for the elongated figures in his paintings.

A. Even if subsequent artists intentionally depicted human forms as more elongated than human figures actually are, and they did so to mimic El Greco''s painted figures, that does not mean that El Greco''s figures were intentionally elongated.

B. Although this option provides another possible explanation for El Greco''s elongated figures, it provides no evidence that the people El Greco painted had such elongated figures.

C. **Correct.** El Greco would have perceived the images of people in his paintings as too long, relative to his perception of the people themselves. This means that even if El Greco did have astigmatism, that factor would not provide an answer to the question, "Why did El Greco paint images that he knew were distorted?"

D. The absence of an ability to correct astigmatism in El Greco''s day does not undermine the hypothesis that it was astigmatism that caused El Greco to paint elongated figures.

E. Again, this suggests another possible explanation for the distortion—namely, that El Greco did it deliberately—but it does not provide any reason to think that this is the correct explanation (and that the critics'' explanation is actually incorrect).

**The correct answer is C.**'
    ),
  answers = jsonb_build_object('correct_answer', 'c', 'wrong_answers', ARRAY['a','b','d','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'cc497c3b-0612-4629-9050-beaade8a79dd';

-- Q798
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Museums that house Renaissance oil paintings typically store them in environments that are carefully kept within narrow margins of temperature and humidity to inhibit any deterioration. Laboratory tests have shown that the kind of oil paint used in these paintings actually adjusts to climatic changes quite well. If, as some museum directors believe, **paint is the most sensitive substance in these works**, then by relaxing the standards for temperature and humidity control, **museums can reduce energy costs without risking damage to these paintings**. Museums would be rash to relax those standards, however, since results of preliminary tests indicate that gesso, a compound routinely used by Renaissance artists to help paint adhere to the canvas, is unable to withstand significant variations in humidity.',
      'question_text', 'In the argument above, the two portions in **boldface** play which of the following roles?',
      'options', jsonb_build_object('a', 'The first is an objection that has been raised against the position taken by the argument; the second is the position taken by the argument.', 'b', 'The first is the position taken by the argument; the second is the position that the argument calls into question.', 'c', 'The first is a judgment that has been offered in support of the position that the argument calls into question; the second is a circumstance on which that judgment is, in part, based.', 'd', 'The first is a judgment that has been offered in support of the position that the argument calls into question; the second is that position.', 'e', 'The first is a claim that the argument calls into question; the second is the position taken by the argument.'),
      'explanation', 'Argument Evaluation

**Situation**
Museums house Renaissance paintings under strictly controlled climatic conditions to prevent deterioration. This is costly. But the paint in these works actually adjusts well to climate changes. On the other hand, another compound routinely used in these paintings, gesso, does not react well to changes in humidity.

**Reasoning**
*What roles do the two **boldfaced** statements play in the argument?* The first statement is not asserted by the author of the argument, but rather attributed as a belief to some museum directors. What the argument itself asserts is that IF this belief is true, THEN the second **boldfaced** statement is true. But the argument then goes on to offer evidence that the first statement is false and so concludes that museum directors would be ill-advised to assume that the second statement was true.

A. This option mistakenly claims that the argument adopts the second statement as its position, when in fact the argument calls this position into question.

B. Rather than adopting the first statement, the argument offers evidence that calls it into question.

C. This option contends that the first statement is a judgment that is based on the second; in fact, the opposite is true.

D. **Correct.** This option properly identifies the roles the two portions in **boldface** play in the argument.

E. The first is a claim that the argument calls into question; the second is the position taken by the argument.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '629a0773-dc19-4a69-a649-a34d65b0d1a1';

-- Q799
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Codex Berinensis, a Florentine copy of an ancient Roman medical treatise, is undated but contains clues to when it was produced. Its first 80 pages are by a single copyist, but the remaining 20 pages are by three different copyists, which indicates some significant disruption. Since a letter in handwriting, identified as that of the fourth copyist, mentions a plague that killed many people in Florence in 1148, Codex Berinensis was probably produced in that year.',
      'question_text', 'Which of the following, if true, most strongly supports the hypothesis that Codex Berinensis was produced in 1148?',
      'options', jsonb_build_object('a', 'Other than Codex Berinensis, there are no known samples of the handwriting of the first three copyists.', 'b', 'According to the account by the fourth copyist, the plague went on for 10 months.', 'c', 'A scribe would be able to copy a page of text the size and style of Codex Berinensis in a day.', 'd', 'There was only one outbreak of plague in Florence in the 1100s.', 'e', 'The number of pages of Codex Berinensis produced by a single scribe becomes smaller with each successive change of copyist.'),
      'explanation', 'Argument Evaluation

**Situation**
The Florentine copy of an ancient Roman work is undated but provides clues as to the time it was produced. The first 80 pages of Codex Berinensis are the work of one copyist. The fact that the last 20 pages are the work of a succession of three different copyists is an indication of serious turmoil at the time the copying was done. Since a letter in the fourth copyist''s handwriting reveals that a plague killed many people there in 1148, Codex Berinensis was probably produced in that year.

**Reasoning**
*Which information supports the hypothesis dating the Codex to 1148?* Consider the basis of the hypothesis: the succession of copyists indicating the work was significantly disrupted, and the fourth copyist''s letter indicating the plague of 1148 caused serious loss of life. From this, it is argued that the plague of 1148 was the reason for the multiple copyists and that the work can thus be dated to that year. What if there were multiple plagues?
In that case, Codex Berinensis could have been produced at another time. If, instead, only one plague occurred in the 1100s, the elimination of that possibility supports the hypothesis that the work was done in 1148.

A. Examples of the copyists'' handwriting might help date Codex Berinensis; the absence of handwriting samples does not help support 1148 as the date.

B. The length of the plague, while it may account for the succession of copyists, does not help support the particular year the work was done.

C. The amount of work a copyist could achieve each day does not provide any information about the year the work appeared.

D. **Correct.** This statement properly identifies a circumstance that supports the hypothesis.

E. The productivity or tenure of the various copyists is irrelevant to establishing the date.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = 'd7ba0e93-bf42-43cd-973e-f9ee75fb8004';

-- Q800
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Excavations of the Roman city of Sepphoris have uncovered numerous detailed mosaics depicting several readily identifiable animal species: a hare, a partridge, and various Mediterranean fish. Oddly, most of the species represented did not live in the Sepphoris region when these mosaics were created. Since identical motifs appear in mosaics found in other Roman cities, however, the mosaics of Sepphoris were very likely created by traveling artisans from some other part of the Roman Empire.',
      'question_text', 'Which of the following is an assumption on which the argument depends?',
      'options', jsonb_build_object('a', 'The Sepphoris mosaics are not composed exclusively of types of stones found naturally in the Sepphoris area.', 'b', 'There is no single region to which all the species depicted in the Sepphoris mosaics are native.', 'c', 'No motifs appear in the Sepphoris mosaics that do not also appear in the mosaics of some other Roman city.', 'd', 'All of the animal figures in the Sepphoris mosaics are readily identifiable as representations of known species.', 'e', 'There was not a common repertory of mosaic designs with which artisans who lived in various parts of the Roman Empire were familiar.'),
      'explanation', 'Argument Construction

**Situation**
Mosaics uncovered at the site of the Roman city of Sepphoris depict animals that did not live in Sepphoris. Because identical motifs appear in other Roman cities, traveling artisans from elsewhere in the Roman Empire likely created the mosaics of Sepphoris.

**Reasoning**
*What assumption underlies this argument?* The argument implicitly assumes that the artisans who created the mosaics had seen the animals depicted firsthand. This suggests that the artisans had been to the regions where these animals live and then traveled to Sepphoris to create the mosaics depicting non-native animals. This, in turn, suggests the assumption that the artisans were not including these motifs based solely on familiarity with motifs common throughout the Empire.

A. The argument draws its conclusion based on subjects of the mosaics, not on the types of stones used in the mosaics, so the origin of the stone is irrelevant.

B. The argument does not rely on the assumption that the species depicted in the Sepphoris mosaics are native to disparate regions, only on the idea that traveling artisans must have seen such species.

C. Nothing in the argument relies on whether or not any of the motifs appear exclusively in Sepphoris. The argument relies only on the fact that there are motifs depicting animals not native to Sepphoris.

D. The argument requires only that at least some of the animals in the mosaics are identifiable as known species that are non-native to Sepphoris.

E. **Correct.** If there was a common repertory of mosaic designs with which artisans who lived in various parts of the Roman Empire were familiar, then it could well be that artisans native to Sepphoris would have been familiar with these designs and could have produced them without ever having seen for themselves animals of the species depicted and without having been the same artisans who created the mosaics elsewhere. Therefore, the argument must assume that such a common repertory did not exist.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '9dd203e2-2bfc-4c9e-8877-7aafd90ddd05';

-- Q801
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'As a large corporation in a small country, Hachnut wants its managers to have international experience, so **each year it sponsors management education abroad for its management trainees**. Hachnut has found, however, that the attrition rate of graduates from this program is very high, with many of them leaving Hachnut to join competing firms soon after completing the program. Hachnut does use performance during the program as a criterion in deciding among candidates for management positions, but **both this function and the goal of providing international experience could be achieved in other ways**. Therefore, if the attrition problem cannot be successfully addressed, Hachnut should discontinue the sponsorship program.',
      'question_text', 'In the argument given, the two **boldfaced** portions play which of the following roles?',
      'options', jsonb_build_object('a', 'The first describes a practice that the argument seeks to justify; the second states a judgment that is used in support of a justification for that practice.', 'b', 'The first describes a practice that the argument seeks to explain; the second presents part of the argument''s explanation of that practice.', 'c', 'The first introduces a practice that the argument seeks to evaluate; the second provides grounds for holding that the practice cannot achieve its objective.', 'd', 'The first introduces a policy that the argument seeks to evaluate; the second provides grounds for holding that the policy is not needed.', 'e', 'The first introduces a consideration supporting a policy that the argument seeks to evaluate; the second provides evidence for concluding that the policy should be abandoned.'),
      'explanation', 'Argument Construction

**Situation**
One of Hachnut''s goals is for its managers to have international experience, so it sponsors education abroad for management trainees. Graduates of this program, however, frequently leave the company soon after the training to work for competitors. Even though Hachnut uses trainees'' performance in the program to make placement decisions, it should discontinue the sponsorship program, because both achievement of international experience and assistance in making placement decisions can be achieved in other ways.

**Reasoning**
*What role do the two portions in **boldface** play in the argument?* The first **boldfaced** portion introduces the policy of sponsorship of management training abroad. The argument goes on to evaluate this policy in light of the second **boldfaced** portion—which states that there are alternative ways of accomplishing what the sponsorship is intended to do—and concludes that the program should be discontinued.

A. The argument does not seek to justify the practice described in the first **boldfaced** portion, and the second portion argues against the practice, not for it.

B. The argument does not seek to explain the practice, but rather to evaluate whether it should be retained.

C. Although the first **boldfaced** portion does introduce a practice that the argument seeks to evaluate, the second does not provide grounds for holding that the practice cannot achieve its objective, but rather states that there are other means of achieving that objective.

D. **Correct.** The first **boldfaced** portion introduces a policy the argument seeks to evaluate. The second states that there are alternative ways to achieve the goal, which provides grounds for holding that the policy is not needed.

E. Although the second **boldfaced** portion does provide a reason to abandon the policy the argument evaluates, the first does not introduce a consideration supporting that policy, but rather introduces the policy itself.

**The correct answer is D.**'
    ),
  answers = jsonb_build_object('correct_answer', 'd', 'wrong_answers', ARRAY['a','b','c','e']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '27ce2814-2aed-4e9e-83cd-b1cb005ee075';

-- Q802
UPDATE "2V_questions"
SET
  question_data = question_data::jsonb
    || jsonb_build_object(
      'passage_text', 'Letter to the editor: If the water level in the Searle River Delta continues to drop, the rising sea level will make the water saltier and less suitable for drinking. Currently, 40 percent of the water from upstream tributaries is diverted to neighboring areas. To keep the delta''s water level from dropping any further, we should end all current diversions from the upstream tributaries. Neighboring water utilities are likely to see higher costs and diminished water supplies, but these costs are necessary to preserve the delta.',
      'question_text', 'Which of the following would, if true, indicate a serious potential weakness of the suggested plan of action?',
      'options', jsonb_build_object('a', 'Desalination equipment would allow water from the delta to be used for drinking even it if became saltier.', 'b', 'Water level is only one factor that affects salinity in the delta.', 'c', 'The upstream tributaries'' water levels are controlled by systems of dams and reservoirs.', 'd', 'Neighboring areas have grown in population since the water was first diverted from upstream tributaries.', 'e', 'Much of the recent drop in the delta''s water level can be attributed to a prolonged drought that has recently ended.'),
      'explanation', 'Evaluation of a Plan

**Situation**
A letter states that progressively lower levels in the Searle River Delta will raise the salt content of its water and make that water less fit for human consumption. Because 40 percent of the water flowing to the delta from upstream is diverted for the use of upstream communities, the letter proposes reclaiming that diverted water regardless of negative impacts on upstream communities in order to protect the delta''s water levels from dropping further.

**Reasoning**
*What would weaken the argument for this plan?* The argument for the plan to end diversion of water rests on the assumption that if diversion continues, water levels in the Searle River Delta will likewise continue to drop. If some additional factor suggested water levels in the delta might hold steady or rebound even if upstream communities continue to divert water, then that new fact would weaken the argument that the plan is necessary to protect the delta.

A. The fact that desalination equipment could create drinking water would argue against the necessity of the plan specifically for providing drinking water, but it would not weaken the argument that the plan is necessary to protect the delta''s water levels per se.

B. Even if factors other than water level affect the delta''s salinity, that would not weaken the argument that the plan is necessary to defend the delta''s water levels.

C. A system of dams upstream would not affect the argument that upstream communities should no longer be allowed to divert water because that water is needed in the Searle River Delta.

D. Growing need for water upstream would increase the negative impact of the plan, but it would not undermine the claim that the plan is necessary to protect the delta.

E. **Correct.** If the drop in the delta''s water level was largely caused by a drought, and if that drought has ended, then the water level in the delta might stay constant or rise even without the plan to end water diversion by upstream communities. Water flowing into the delta from increased rain would weaken the argument that the plan is necessary to defend the delta.

**The correct answer is E.**'
    ),
  answers = jsonb_build_object('correct_answer', 'e', 'wrong_answers', ARRAY['a','b','c','d']::text[]),
  difficulty = 'hard',
  difficulty_level = 3,
  updated_at = now()
WHERE id = '82b101f0-adf0-40bf-9b05-44b76c1ccab2';
