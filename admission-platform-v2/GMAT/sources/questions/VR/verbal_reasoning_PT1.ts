import {
  VerbalReasoningQuestion,
  VRQuestionData,
  generateMCAnswers,
} from "../types";
import {
  PASSAGE_TRADE_PROMOTIONS,
  PASSAGE_CARBON_WOODLANDS,
  PASSAGE_ANCIENT_DNA,
  PASSAGE_FUNGUS_MIMICRY,
} from "./passages";

export const verbalReasoningQuestionsPT1: VerbalReasoningQuestion[] = [
  // ============================================
  // CRITICAL REASONING QUESTIONS
  // ============================================
  {
    id: "VR-GMAT-PT1_-00001",
    question_number: 1,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Which of the following, if true, would present the most serious challenge to the marginality hypothesis?",
      options: {
        a: "The earliest farmers subsisted on diets that consisted of roughly equal proportions of food gathered through agriculture and hunting-and-gathering activities.",
        b: "In the earliest agricultural settlements, the community's crops were often located many miles away from its members' living quarters.",
        c: "Some of the regions that were optimal for hunting-and-gathering activity would not have been optimal for plant and animal domestication.",
        d: "Some archaeologists believe that, 3,000 years prior to the advent of agriculture, some humans lived in year-round, permanent settlements but supported themselves by hunting and gathering.",
        e: "Evidence suggests that, at the beginning of the neolithic revolution, regions where plant and animal domestication began had optimal conditions for hunting and gathering.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-PT1-00001",
      passage_text:
        "Archaeologists have long debated what caused the neolithic revolution—the major changes that occurred when large numbers of prehistoric human beings began to give up the nomadic life in favor of settling in villages and farming. One view, the \"marginality hypothesis,\" maintains that early human beings would have lived in regions where the hunting and gathering were best. As populations increased, however, so would competition for resources, leading some people to move to neighboring regions, where domesticating plants and animals would be necessary for survival.",
    } as VRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "The marginality hypothesis claims that agriculture began in marginal areas (not optimal for hunting/gathering) because people were pushed out of optimal regions. If evidence shows that agriculture actually began in regions with optimal hunting and gathering conditions (option E), this directly contradicts the hypothesis.",
    categories: ["Critical Reasoning", "Analysis/Critique"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-PT1_-00002",
    question_number: 2,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "The corporation's prediction about the effects its plan would have, if adopted, relies on which of the following assumptions?",
      options: {
        a: "Without the plan, all long-distance telephone service in the province would involve at least some charges to callers.",
        b: "The national government's subsidy would apply not only for calls made to phones in the province, but also to at least some long-distance calls that are merely routed through the province.",
        c: "The provincial government would be interested in splitting its subsidy with the corporation only if doing so would yield significant profits for the province.",
        d: "The national government's subsidy for any long-distance call into the province is calculated as a fixed percentage of the charge to the caller.",
        e: "In order for the arrangement to be profitable for the province, the province must receive more from the increased subsidy than it pays the corporation.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-PT1-00002",
      passage_text:
        "To facilitate development of telephone service in a rural province, the national government pays the provincial government a subsidy for each long-distance call going into the province. A corporation has offered to base a national long-distance telephone service in the province, allowing long-distance calls to be made without any charge to the callers, if the provincial government splits its subsidy with the corporation. The corporation argues that since all calls would be routed through the province, the provincial government would profit greatly from this arrangement.",
    } as VRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "The corporation's plan relies on routing all calls through the province to generate subsidies. For this to work, the subsidy must apply not just to calls going TO the province, but also to calls merely routed THROUGH it. Without this assumption, routing calls through the province wouldn't generate additional subsidies.",
    categories: ["Critical Reasoning", "Plan/Construct"],
    questionSubtype: "critical-reasoning",
  },
  // ============================================
  // READING COMPREHENSION QUESTIONS
  // ============================================
  {
    id: "VR-GMAT-PT1_-00003",
    question_number: 3,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "According to the passage, some manufacturers have attempted to counteract retailer opportunism by",
      options: {
        a: "selling goods to retailers at reduced prices",
        b: "offering more frequent but less potentially lucrative promotions",
        c: "alerting consumers when promotions are happening",
        d: "offering certain goods to retailers at no charge",
        e: "paying retailers fees to prominently display certain goods",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_TRADE_PROMOTIONS.id,
      passage_text: PASSAGE_TRADE_PROMOTIONS.content,
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "The passage states that some manufacturers have themselves advertised ongoing promotions to inform customers, thereby increasing customers' propensity to search for discounted prices and regulating retailer opportunism.",
    categories: ["Reading Comprehension", "Identify Stated Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-PT1_-00004",
    question_number: 4,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "It can be inferred that the diaper manufacturer mentioned in the highlighted text of the passage discovered that consumers",
      options: {
        a: "were unlikely to continue to purchase a brand that had a lower regular price in the face of temporary discounts on diapers of other brands",
        b: "tended to equate higher prices on diapers with higher quality, and so were willing to pay full price for expensive brands",
        c: "usually became loyal to a particular brand of diaper and would purchase that brand whether or not it was on sale",
        d: "bought fewer diapers per shopping trip when they knew the diapers would always be available at the same \"everyday low price\"",
        e: "were more willing to search for discounted prices on diapers than for other products typically available in the same stores",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_TRADE_PROMOTIONS.id,
      passage_text: PASSAGE_TRADE_PROMOTIONS.content,
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "The passage mentions that a diaper manufacturer had to revert to its former pricing strategies in the face of increasing promotional competition from other brands. This implies that consumers were swayed by temporary discounts on competing brands rather than staying loyal to the everyday low price brand.",
    categories: ["Reading Comprehension", "Identify Inferred Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-PT1_-00005",
    question_number: 5,
    section: "Verbal Reasoning",
    difficulty: "easy",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "The author of the passage would be most likely to agree with which of the following statements about consumers' knowledge of retail pricing strategies?",
      options: {
        a: "Consumers believe that retailers do not have the option to charge full price for items that manufacturers tell them to discount.",
        b: "Consumers assume that a retailer who offers discounts on some items will inflate the prices of other items to compensate for it.",
        c: "Consumers are aware that they can expect to find familiar brands available at discounted prices at fairly predictable intervals.",
        d: "Consumers believe that retailers must pay the same price for goods whether or not they offer them at a discount to customers.",
        e: "Consumers often do not realize that price discounts typically originate from manufacturers rather than individual retailers.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_TRADE_PROMOTIONS.id,
      passage_text: PASSAGE_TRADE_PROMOTIONS.content,
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "The passage states that consumers know from experience the approximate frequency of promotional pricing, indicating they are aware that discounts occur at fairly predictable intervals.",
    categories: ["Reading Comprehension", "Identify Inferred Idea"],
    questionSubtype: "reading-comprehension",
  },
  // ============================================
  // MORE CRITICAL REASONING QUESTIONS
  // ============================================
  {
    id: "VR-GMAT-PT1_-00006",
    question_number: 6,
    section: "Verbal Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "Which of the following most logically completes the reasoning?",
      options: {
        a: "maximize the archaeologically valuable information obtained through technological advances",
        b: "ensure that virtually no archaeologically valuable information at all would be obtained",
        c: "guarantee that the number of potential archaeological sites will continue to increase",
        d: "encourage archaeologists to make better use of the latest archaeologically valuable technology",
        e: "have the additional benefit of encouraging the development of new archaeologically valuable technologies",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-PT1-00003",
      passage_text:
        "An archaeological site can be excavated only once, and many sites excavated in the past would have yielded far more information if they had been excavated using current technologies. These considerations have led some to argue that sites that could yield valuable information should not be excavated now since new, archaeologically valuable technologies will almost certainly be developed in the future. Insofar as technological progress is unlikely to stop, consistently following this recommendation over time would __________.",
    } as VRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "If we always wait for better technology (which will always be coming), we would never excavate any sites. This would mean virtually no archaeological information would ever be obtained.",
    categories: ["Critical Reasoning", "Plan/Construct"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-PT1_-00007",
    question_number: 7,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Which of the following most logically completes the argument?",
      options: {
        a: "could result in households with different incomes paying different amounts of taxes",
        b: "could tax a smaller percentage of the earnings of high-income households than of low-income households",
        c: "would put a disproportionately high burden on the purchasers of the most expensive consumption items",
        d: "should be applied only to the wealthiest households",
        e: "should not be used to tax any consumption items",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-PT1-00004",
      passage_text:
        "Economist: Sales taxes do not provide a fair alternative to income taxes. Low-income households must spend nearly all of their disposable income on consumption items they need to live, while high-income households can afford to buy those items and then put a substantial amount of their earnings into savings. Hence a sales tax __________.",
    } as VRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "Since low-income households spend nearly all their income on taxable consumption while high-income households save a substantial portion (which is not subject to sales tax), a sales tax would tax a smaller percentage of high-income households' total earnings compared to low-income households.",
    categories: ["Critical Reasoning", "Plan/Construct"],
    questionSubtype: "critical-reasoning",
  },
  // ============================================
  // CARBON WOODLANDS PASSAGE QUESTIONS
  // ============================================
  {
    id: "VR-GMAT-PT1_-00008",
    question_number: 8,
    section: "Verbal Reasoning",
    difficulty: "hard",
    difficultyLevel: 5,
    questionData: {
      question_text:
        "It can be inferred from the passage that Auclair's claim about carbon and the northern woodlands would be most seriously undermined if which of the following were true?",
      options: {
        a: "The northern woodlands functioned as a carbon source rather than as a carbon sink prior to 1890.",
        b: "The rate of tree growth in the northern woodlands increased throughout the twentieth century.",
        c: "The northern woodlands absorbed larger amounts of carbon after 1920 than they had in previous years.",
        d: "During the twentieth century, the total volumes of wood lost to rot or fire in the northern woodlands exceeded increases in wood volume.",
        e: "The northern woodlands lost trees to forest fires and logging in the early twentieth century.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_CARBON_WOODLANDS.id,
      passage_text: PASSAGE_CARBON_WOODLANDS.content,
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "Auclair's claim depends on the idea that increases in tree growth created a large volume of wood that absorbed the missing carbon. If wood lost to rot or fire exceeded the increases in wood volume, then the woodlands couldn't have served as a carbon sink, undermining his claim.",
    categories: ["Reading Comprehension", "Identify Inferred Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-PT1_-00009",
    question_number: 9,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "It can be inferred from the passage that the northern woodlands would be more likely to function as a carbon source if which of the following were to occur?",
      options: {
        a: "Vegetation regrowing on land from which trees had been cleared grew back fast enough to absorb as much CO_2 as was released by deforestation.",
        b: "Debris from the forest floor rotted less quickly after the rate of tree growth increased.",
        c: "A significant increase in the number of pests that destroy trees caused an increase in tree loss.",
        d: "Pollution resulting from burning fossil fuels provided trees with extra nutrients, thus increasing the rate of their growth.",
        e: "A decrease in temperature caused a significant decrease in the number of fires in the northern woodlands.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_CARBON_WOODLANDS.id,
      passage_text: PASSAGE_CARBON_WOODLANDS.content,
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "The passage indicates that forests become a carbon source when losses (from fire, logging, pests) exceed growth. An increase in pests destroying trees would increase tree loss, making the woodlands more likely to release carbon rather than absorb it.",
    categories: ["Reading Comprehension", "Identify Inferred Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-PT1_-00010",
    question_number: 10,
    section: "Verbal Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text: "The passage is primarily concerned with",
      options: {
        a: "refuting a claim about the causes of a phenomenon",
        b: "presenting an analysis of a common natural process",
        c: "providing an explanation for a puzzling phenomenon",
        d: "evaluating the methodology used in a recent study",
        e: "contrasting two explanations of an unexpected phenomenon",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_CARBON_WOODLANDS.id,
      passage_text: PASSAGE_CARBON_WOODLANDS.content,
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "The passage explains Auclair's theory about why atmospheric CO_2 has not increased as much as expected—the puzzling phenomenon is the 'missing carbon,' and the explanation is that northern woodlands have been absorbing it.",
    categories: ["Reading Comprehension", "Identify Stated Idea"],
    questionSubtype: "reading-comprehension",
  },
  // ============================================
  // ANCIENT DNA PASSAGE QUESTIONS
  // ============================================
  {
    id: "VR-GMAT-PT1_-00011",
    question_number: 11,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Which of the following statements, if true, would most clearly undermine the usefulness of the author's solution to the scientists' debate that is discussed in the passage?",
      options: {
        a: "DNA extracted from ancient specimens is not identical to the DNA of related modern species.",
        b: "Most ancient biological relics are not preserved under favorable conditions.",
        c: "Only tiny fragments of genetic material can be recovered from ancient biological relics.",
        d: "There are many segments of DNA that show very little change between ancient and modern DNA.",
        e: "Careless handling of biological relics is an ongoing problem in attempts to extract ancient DNA from fossils.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_ANCIENT_DNA.id,
      passage_text: PASSAGE_ANCIENT_DNA.content,
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "The author's solution is that ancient DNA should differ from modern DNA, so contaminants can be identified. If many DNA segments show very little change between ancient and modern DNA, this method wouldn't work—you couldn't tell ancient DNA from modern contamination.",
    categories: ["Reading Comprehension", "Identify Inferred Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-PT1_-00012",
    question_number: 12,
    section: "Verbal Reasoning",
    difficulty: "easy",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "The passage suggests that the scientists mentioned in the first highlighted portion of text differ from the scientists mentioned in the second highlighted portion of text in that the former",
      options: {
        a: "assume a higher rate of degradation of DNA in fossil material",
        b: "argue that the conditions of the Idaho fossil deposit were exceptional",
        c: "have different techniques for extracting genetic material from a specimen that is 17 million years old",
        d: "have devised a method for identifying modern contaminants found in biological relics",
        e: "believe that fragments of DNA could survive in fossils for 17 million years",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_ANCIENT_DNA.id,
      passage_text: PASSAGE_ANCIENT_DNA.content,
    } as VRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "The first group of scientists claims to have extracted DNA from 17-million-year-old magnolia leaves, implying they believe DNA can survive that long. The second group argues that DNA degrades too quickly for this to be possible.",
    categories: ["Reading Comprehension", "Identify Inferred Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-PT1_-00013",
    question_number: 13,
    section: "Verbal Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text: "The passage is primarily concerned with",
      options: {
        a: "questioning the applicability of a particular methodology",
        b: "identifying issues central to correctly dating DNA fragments",
        c: "presenting evidence to undermine a theory about the age of certain biological relics",
        d: "describing two methods commonly used to date certain biological relics",
        e: "presenting several possible explanations for the survival of DNA in biological relics",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_ANCIENT_DNA.id,
      passage_text: PASSAGE_ANCIENT_DNA.content,
    } as VRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "The passage discusses the challenges of verifying whether DNA fragments are truly ancient or modern contaminants—the central issue is correctly identifying/dating DNA fragments from ancient specimens.",
    categories: ["Reading Comprehension", "Identify Stated Idea"],
    questionSubtype: "reading-comprehension",
  },
  // ============================================
  // MORE CRITICAL REASONING QUESTIONS
  // ============================================
  {
    id: "VR-GMAT-PT1_-00014",
    question_number: 14,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Which of the following, if true, provides the strongest reason for the manufacturer of Lorex not to challenge the chain's use of the triangular package design?",
      options: {
        a: "The manufacturer of Lorex depends on sales on the willingness of the chain to stock Lorex and other of the manufacturer's products.",
        b: "The black-and-white labeling of the chain's shampoo indicates to the consumer that irrelevant expense has been spared in order to bring the product to the consumer at a lower cost.",
        c: "The cost of manufacturing the chain's shampoo is substantially lower than the cost of manufacturing Lorex.",
        d: "Lawsuits brought for the purpose of protecting distinctive package designs are generally successful.",
        e: "The manufacturer of Lorex also manufactures other shampoos, and those shampoos are not sold in triangular-shaped bottles.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-PT1-00005",
      passage_text:
        "Under United States law, a distinctive package design can be legally protected against copying. Lorex shampoo, a leading brand, is packaged in a triangular-shaped bottle with a gold label. A major pharmacy chain has introduced a similar, less expensive shampoo in similarly shaped bottles with plain black-and-white labels carrying the chain's name. Though the triangular shape is distinctive, the manufacturer of Lorex has not legally challenged its use for the chain's shampoo.",
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "If Lorex depends on the pharmacy chain to stock its products, challenging the chain legally could damage that business relationship and hurt Lorex's sales more than the copying of its bottle design.",
    categories: ["Critical Reasoning", "Plan/Construct"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-PT1_-00015",
    question_number: 15,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Which of the following, if true, most seriously weakens the dye manufacturer's argument?",
      options: {
        a: "At the time Alidin was reformulated, a number of other reformulated and new dyeing products became available.",
        b: "The manufacturer refused for many years to reformulate Alidin, despite numerous complaints about the damage it was causing to the environment.",
        c: "In the Bouvierville factory, many workers who do not use Alidin in their own work nevertheless contracted lung ailments.",
        d: "While most dyeing factories apply Alidin by brush, the Bouvierville factory has always sprayed the dye onto fabric.",
        e: "None of the solvents eliminated from Alidin was ever suspected of causing respiratory problems.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-PT1-00006",
      passage_text:
        "The fabric dye Alidin was recently reformulated to eliminate certain solvents known to cause damage to the ozone layer. When a factory in Bouvierville started to use the reformulated version of Alidin, several workers contracted serious lung ailments. The manufacturer of Alidin denied that the reformulated product could be the cause of the ailments since numerous other factories had also started to use it, and none of their workers had suffered any ill effects.",
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "If Bouvierville sprays the dye while other factories apply it by brush, the different application method could explain why only Bouvierville workers got sick—spraying creates airborne particles that can be inhaled, while brushing doesn't.",
    categories: ["Critical Reasoning", "Analysis/Critique"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-PT1_-00016",
    question_number: 16,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If all of the information above is true, which of the following hypotheses does it most strongly support?",
      options: {
        a: "The cheetah, because of certain distinctive skeletal features, is an efficient predator.",
        b: "The outward appearance of an animal can be reconstructed from its skeletal structure.",
        c: "The cheetah's skeletal structure has remained unchanged since prehistoric times.",
        d: "The ancestor of the cheetah had relatively few nonskeletal features in common with the modern cheetah.",
        e: "The cheetah or an ancestor of it migrated to what is now Africa from what is now North America.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-PT1-00007",
      passage_text:
        "The extinct earliest known ancestor of the cheetah, a large cat now found only in Africa, lived only in what is now western North America when the two continents were conjoined, as fossil skeletons found in North America but nowhere else indicate. That ancestor shared certain skeletal features with the cheetah but with no other cat.",
    } as VRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Since the earliest known cheetah ancestor lived only in North America (based on fossil evidence) and modern cheetahs live only in Africa, this strongly supports the hypothesis that the cheetah or an ancestor migrated from North America to Africa.",
    categories: ["Critical Reasoning", "Plan/Construct"],
    questionSubtype: "critical-reasoning",
  },
  // ============================================
  // FUNGUS MIMICRY PASSAGE QUESTIONS
  // ============================================
  {
    id: "VR-GMAT-PT1_-00017",
    question_number: 17,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "The passage most strongly supports which of the following inferences about flower-cluster appendixes?",
      options: {
        a: "Arcangeli did not hypothesize that they might play a role in attracting fungus gnats to Arisarum proboscideum.",
        b: "In some species of arum lilies, their texture does not mimic that of the undersides of mushrooms.",
        c: "In Arisarum proboscideum they help protect the plant from attack by fungus-eating insects.",
        d: "They are absent in some species of arum lilies that are pollinated by fungus gnats.",
        e: "Arcangeli found evidence that their absence in some species of arum lilies correlated with the absence of fungus gnats in those species' habitats.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_FUNGUS_MIMICRY.id,
      passage_text: PASSAGE_FUNGUS_MIMICRY.content,
    } as VRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "The passage states that in Arisarum proboscideum the appendix is 'spongy and full of little depressions' like a mushroom, but notes that 'in many arum lilies' the appendix is 'hard and smooth'—implying that in some species the texture does not mimic mushrooms.",
    categories: ["Reading Comprehension", "Identify Inferred Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-PT1_-00018",
    question_number: 18,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Of the fungus-like features listed in the final sentence, the passage explicitly discusses which of the following as features of Arisarum proboscideum?",
      options: {
        a: "Odor and humidity",
        b: "Odor and texture",
        c: "Odor and shape",
        d: "Color and texture",
        e: "Color and humidity",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_FUNGUS_MIMICRY.id,
      passage_text: PASSAGE_FUNGUS_MIMICRY.content,
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "The passage explicitly describes the appendix as 'off-white in color' (color) and 'spongy and full of little depressions' (texture) that resembles a mushroom. Odor, humidity, and shape are mentioned for fungus mimics generally, but not specifically discussed for Arisarum proboscideum.",
    categories: ["Reading Comprehension", "Identify Stated Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-PT1_-00019",
    question_number: 19,
    section: "Verbal Reasoning",
    difficulty: "easy",
    difficultyLevel: 1,
    questionData: {
      question_text:
        "Which of the following most accurately expresses the main idea of the passage?",
      options: {
        a: "Arcangeli was correct in hypothesizing that fungus gnats pollinate Arisarum proboscideum, even though his hypothesis was based on flawed data.",
        b: "Arisarum proboscideum, and a number of other species of plants, rely on similarities to fungi to attract pollinators.",
        c: "Arcangeli correctly identified the species of insect that pollinates fungus-mimic plants such as Arisarum proboscideum but did not understand the means by which it does so.",
        d: "Some types of gnats that lay their eggs on fungi spend part of their lives on fungus-mimic plants such as Arisarum proboscideum.",
        e: "Some types of gnats reproduce on plants, such as Arisarum proboscideum, that mimic fungi.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_FUNGUS_MIMICRY.id,
      passage_text: PASSAGE_FUNGUS_MIMICRY.content,
    } as VRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "The passage starts with Arcangeli's claim about Arisarum proboscideum using fungus mimicry for pollination, then expands to say 'Fungus mimicry turns out to be a fairly widespread pollination strategy.' The main idea is that this plant and others use fungus mimicry to attract pollinators.",
    categories: ["Reading Comprehension", "Identify Stated Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-PT1_-00020",
    question_number: 20,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "The passage most strongly supports the inference that the relationship between fungus gnats and Arisarum proboscideum is",
      options: {
        a: "harmful to both of the species",
        b: "beneficial to both of the species",
        c: "beneficial to the gnat species but harmful to Arisarum proboscideum",
        d: "beneficial to the gnat species but neither harmful nor beneficial to Arisarum proboscideum",
        e: "beneficial to Arisarum proboscideum but not to the gnat species",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_FUNGUS_MIMICRY.id,
      passage_text: PASSAGE_FUNGUS_MIMICRY.content,
    } as VRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "The plant benefits from pollination by the gnats. However, the gnats are deceived into laying eggs on the plant's appendix, and the passage explicitly states that these eggs 'will not be able to survive'—so the gnats receive no benefit and may even be harmed.",
    categories: ["Reading Comprehension", "Identify Inferred Idea"],
    questionSubtype: "reading-comprehension",
  },
  // ============================================
  // FINAL CRITICAL REASONING QUESTIONS
  // ============================================
  {
    id: "VR-GMAT-PT1_-00021",
    question_number: 21,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "In their response, the critics of the counseling offices use which of the following argumentative techniques?",
      options: {
        a: "Attempting to show that evidence used by the opposing side to support its position actually undermines that position",
        b: "Arguing that the opposing side, in gathering its evidence, systematically neglected potential counterevidence",
        c: "Attempting to show that the opposing side had confused the notion of revenue with that of profit",
        d: "Attempting to show that something that is true of a larger group is not necessarily also true of every subgroup of the larger group",
        e: "Arguing that the evidence used by the opposing side is purely self-serving and in need of independent corroboration",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-PT1-00008",
      passage_text:
        "In a certain country, the government maintains agricultural counseling offices to dispense free advice. Critics contend these offices should close, since they are a waste of public money. Office staff counter that the value to farmers of the advice given greatly exceeds the cost of maintaining those offices. The critics' response is that it is precisely services generating such extra value that can, and therefore should, be rendered by private enterprise for profit.",
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "The staff argued that the offices provide value exceeding their cost (supporting keeping them). The critics take this same evidence and argue that precisely because the service is so valuable, it should be privatized—turning the staff's evidence against their position.",
    categories: ["Critical Reasoning", "Analysis/Critique"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-PT1_-00022",
    question_number: 22,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Which of the following is an assumption on which the city's plan depends?",
      options: {
        a: "The trees that will be planted as shade trees are hardier and have a greater chance of surviving to maturity than do the trees that have typically been planted in the city in the past.",
        b: "The streets that currently have shade trees are no wider than the streets for which shade-tree plantings are planned.",
        c: "Trees planted in the region of Masonville but outside the city would have a lower mortality rate than trees planted along city streets.",
        d: "The growing conditions do not vary so much from district to district within the city that the mortality rate of trees differs greatly according to the district in which they are planted.",
        e: "Apart from the issue of whether shade trees can be grown, the width of a city street does not contribute to the temperature there on hot summer days.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-PT1-00009",
      passage_text:
        "In Masonville few streets currently have shade trees. The city's newly adopted goal is to have shade trees on all streets that are wide enough. The trees will cool summer temperatures in the city as well as improve its appearance. Because statistics show that three of every four trees planted in the city die before maturity, the city will plant a tree every ten feet in order to achieve an eventual spacing of 30 to 50 feet between trees.",
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "The plan uses a city-wide mortality rate (3 out of 4) to determine planting density. If mortality rates vary greatly by district, some districts might end up with too many trees and others with too few. The plan assumes fairly uniform conditions across the city.",
    categories: ["Critical Reasoning", "Plan/Construct"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-PT1_-00023",
    question_number: 23,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Which of the following, if true, casts the most serious doubt on the Post-Gazette's conclusion?",
      options: {
        a: "Last year several new retail stores opened in Chabberton, offering high quality merchandise at competitive prices.",
        b: "Many Chabberton residents do most of their shopping at stores in other towns in the vicinity of Chabberton.",
        c: "Most of the Chabberton stores that the survey covered advertise regularly in the Chabberton Post-Gazette.",
        d: "A separate survey of manufacturing businesses in Chabberton shows that they did a greater volume of business last year than the year before.",
        e: "The year before last was a year of record sales for retail stores in Chabberton, with most stores reporting their highest sales volume ever.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-PT1-00010",
      passage_text:
        "The Chabberton Post-Gazette reported that the overall volume of retail sales in Chabberton was lower last year than it was the year before. The Post-Gazette based that conclusion on a survey of all retail stores that were in business in Chabberton throughout both of those years: these stores, taken together, had a smaller sales volume last year than the year before.",
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "The survey only covered stores in business throughout BOTH years, excluding new stores. If new stores opened last year with competitive prices, they likely took sales from existing stores. Total retail sales could have stayed the same or increased, even though existing stores sold less.",
    categories: ["Critical Reasoning", "Analysis/Critique"],
    questionSubtype: "critical-reasoning",
  },
];
