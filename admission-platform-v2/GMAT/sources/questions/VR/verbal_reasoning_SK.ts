import {
  VerbalReasoningQuestion,
  VRQuestionData,
  generateMCAnswers,
} from "../types";
import {
  PASSAGE_NIGHTINGALE,
  PASSAGE_METEOR_STREAM,
  PASSAGE_TRADING_COMPANIES,
} from "./passages";

export const verbalReasoningQuestions: VerbalReasoningQuestion[] = [
  // ============================================
  // READING COMPREHENSION QUESTIONS
  // ============================================
  {
    id: "VR-GMAT-SK__-00001",
    question_number: 1,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text: "The passage is primarily concerned with evaluating",
      options: {
        a: "the importance of Florence Nightingale's innovations in the field of nursing",
        b: "contrasting approaches to the writing of historical biography",
        c: "contradictory accounts of Florence Nightingale's historical significance",
        d: "the quality of health care in nineteenth century England",
        e: "the effect of the Crimean War on developments in the field of health care",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_NIGHTINGALE.id,
      passage_text: PASSAGE_NIGHTINGALE.content,
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "Consider the passage as a whole to answer this question. The author begins by announcing that two recent works about Florence Nightingale offer different assessments of her career and then summarizes those accounts. One book seeks to debunk her reputation and historical significance, while the other promotes her significance to not only her own age but also subsequent generations. In the final paragraph, the author takes a position synthesizing the two views. A. Nightingale's involvement in nursing is discussed, but not her nursing innovations. B. The passage concerns two books about an historical figure, not the writing of historical biography. C. Correct. The passage focuses on two books with different assessments of Nightingale's significance. D. The passage refers to some specific health care problems during and after the Crimean War, but it does not evaluate the general quality of health care over the course of the nineteenth century. E. No such effects are discussed in the passage.",
    categories: ["Reading Comprehension", "Main Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00002",
    question_number: 2,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "According to the passage, the editors of Nightingale's letters credit her with contributing to which of the following?",
      options: {
        a: "Improvement of the survival rate for soldiers in British Army hospitals during the Crimean War",
        b: "The development of a nurses' training curriculum that was far in advance of its day",
        c: "The increase in the number of women doctors practicing in British Army hospitals",
        d: "Establishment of the first facility for training nurses at a major British university",
        e: "The creation of an organization for monitoring the peacetime living conditions of British soldiers",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_NIGHTINGALE.id,
      passage_text: PASSAGE_NIGHTINGALE.content,
    } as VRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "This question asks the reader to find specific information that is explicitly stated. In the second paragraph, the author lists the achievements the editors of Nightingale's letters attribute to her. Among them is her work to improve sanitary conditions. When she learned how bad the peacetime living conditions of British soldiers were, she persuaded the government to establish a Royal Commission on the Health of the Army. A. The passage discusses Nightingale's work after the war, but the survival rate during the war is not mentioned. B. Nightingale founded a nurses' training hospital (mentioned in the next-to-last sentence of the second paragraph), but its curriculum is not examined. C. No information is given about women doctors. D. The passage does not discuss whether the nurses' training hospital that Nightingale founded was the first of its kind or whether it was at a major British university. E. Correct. Nightingale persuaded the government to create a commission overseeing British soldiers' living conditions.",
    categories: ["Reading Comprehension", "Supporting Ideas"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00003",
    question_number: 3,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "The passage suggests which of the following about Nightingale's relationship with the British public of her day?",
      options: {
        a: "She was highly respected, her projects receiving popular and governmental support.",
        b: "She encountered resistance both from the army establishment and the general public.",
        c: "She was supported by the working classes and opposed by the wealthier classes.",
        d: "She was supported by the military establishment but had to fight the governmental bureaucracy.",
        e: "After initially being received with enthusiasm, she was quickly forgotten.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_NIGHTINGALE.id,
      passage_text: PASSAGE_NIGHTINGALE.content,
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "An inference is drawn from stated information. This question asks the reader to gather the hints appearing throughout the passage about Nightingale's relationship with her public. Nightingale was idealized and had a heroic reputation (second sentence of the first paragraph); she occupied a place in the national pantheon (final sentence of the first paragraph). Moreover her projects were successful: she persuaded the government to establish a health commission and the public to fund a nurses' training hospital. The logical inference from the information given is that Nightingale was respected by the British public. A. Correct. Her heroic reputation implies that she was widely respected. Her success with both the government and the public allowed her projects to be realized. B. The passage shows no evidence of resistance either from the army or from the public; indeed, the public contributed to her causes. C. The passage does not divide her supporters from her detractors along class lines. D. The passage does not mention either military support or government resistance. E. She was not quickly forgotten, since the author refers to her as the famous British nurse who has earned an eminent place among the ranks of social pioneers.",
    categories: ["Reading Comprehension", "Inference"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00004",
    question_number: 4,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "With which of the following statements regarding the differing interpretations of Nightingale's importance would the author most likely agree?",
      options: {
        a: "Summers misunderstood both the importance of Nightingale's achievements during the Crimean War and her subsequent influence on British policy.",
        b: "The editors of Nightingale's letters made some valid points about her practical achievements, but they still exaggerated her influence on subsequent generations.",
        c: "Although Summers' account of Nightingale's role in the Crimean War may be accurate, she ignored evidence of Nightingale's subsequent achievement that suggests that her reputation as an eminent social reformer is well deserved.",
        d: "The editors of Nightingale's letters mistakenly propagated the outdated idealization of Nightingale that only impedes attempts to arrive at a balanced assessment of her true role.",
        e: "The evidence of Nightingale's letters supports Summers' conclusions both about Nightingale's activities and about her influence.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_NIGHTINGALE.id,
      passage_text: PASSAGE_NIGHTINGALE.content,
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "Examine the final paragraph; the author's opinion of both accounts of Nightingale's work appears there. Summers' work claims that Nightingale's importance during the Crimean War was exaggerated, and the author concedes in the final sentence of the passage that Nightingale may not have achieved all her goals during the Crimean War. However, the author believes that Nightingale's breadth of vision and her accomplishment of ambitious projects earn her an eminent place among the ranks of social pioneers. A. The author at least partly concedes Summers' point about Nightingale's achievements during the Crimean War, but does not discuss Summers' treatment of Nightingale after the war. B. The author believes the letters should establish continued respect for Nightingale's brilliance and creativity. C. Correct. The author acknowledges the point Summers makes about Nightingale's contribution during the war but finds evidence in the letters and in Nightingale's accomplishments after the war to support a highly favorable view of her work. It is reasonable to infer that the author would agree that Summers ignored this important evidence. D. The author believes that the letters illustrate Nightingale's brilliance and creativity and that Nightingale herself has earned an eminent place among social pioneers. These positions are not consistent with agreeing that the editors idealized Nightingale and prevented a just assessment of her work. E. The evidence of the letters supports just the reverse, brilliance and creativity.",
    categories: ["Reading Comprehension", "Application"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00005",
    question_number: 5,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "In the last paragraph, the author is primarily concerned with",
      options: {
        a: "summarizing the arguments about Nightingale presented in the first two paragraphs",
        b: "refuting the view of Nightingale's career presented in the preceding paragraph",
        c: "analyzing the weaknesses of the evidence presented elsewhere in the passage",
        d: "citing evidence to support a view of Nightingale's career",
        e: "correcting a factual error occurring in one of the works under review",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_NIGHTINGALE.id,
      passage_text: PASSAGE_NIGHTINGALE.content,
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "The author begins the last paragraph in the first person, I believe, in order to take a position on Nightingale's historical significance. With one concession to Summers' work, the author uses the letters as evidence of Nightingale's extraordinary abilities. The author believes that Nightingale's work has earned her a respected place in history. A. Beginning with believe shows that the author intends to do more than simply summarize. B. The author largely supports the view of Nightingale presented in the second paragraph. C. The last paragraph does analyze weak evidence, but its purpose is to state a position. D. Correct. The author cites evidence in Nightingale's letters and actions that support a highly favorable view of her career. E. No such correction appears in the final paragraph.",
    categories: ["Reading Comprehension", "Main Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00006",
    question_number: 6,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "The author states that the research described in the first paragraph was undertaken in order to",
      options: {
        a: "determine the age of an actual meteor stream",
        b: "identify the various structural features of meteor streams",
        c: "explore the nature of a particularly interesting meteor stream",
        d: "test the hypothesis that meteor streams become broader as they age",
        e: "show that a computer model could help in explaining actual astronomical data",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_METEOR_STREAM.id,
      passage_text: PASSAGE_METEOR_STREAM.content,
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "The question tells the reader where to look and what to look for: an explicit statement in the first paragraph about why the computer model was constructed. The third and fourth sentences of the first paragraph provide the reference needed to answer this question. Astronomers hypothesized that a meteor stream should broaden with time ... A recent computer-modeling experiment tested this hypothesis. Thus, the research was conducted in order to test the hypothesis that meteor streams broaden with age. A. The last paragraph shows that the approximate age of the Geminid meteor stream was determined as a result of the research, but it was not the reason the research was undertaken in the first place. B. The computer model came up with an unexpected finding about the structure of meteor streams; however, the research was undertaken not to identify the structure of the meteor streams, but to determine if they broaden over time. C. The purpose of the research was to test a general hypothesis about all meteor streams, not to explore one meteor stream in particular. D. Correct. The purpose of the research is explicitly stated in the first paragraph: to test the hypothesis that meteor streams broaden as they age. E. Although the computer model did explain actual data, the purpose of the research was not to show the computer's usefulness, but rather to test the astronomers' hypothesis.",
    categories: ["Reading Comprehension", "Supporting Ideas"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00007",
    question_number: 7,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "It can be inferred from the passage that which of the following would most probably be observed during the Earth's passage through a meteor stream if the conventional theories mentioned in the highlighted text were correct?",
      options: {
        a: "Meteor activity would gradually increase to a single, intense peak, and then gradually decline.",
        b: "Meteor activity would be steady throughout the period of the meteor shower.",
        c: "Meteor activity would rise to a peak at the beginning and at the end of the meteor shower.",
        d: "Random bursts of very high meteor activity would be interspersed with periods of very little activity.",
        e: "In years in which the Earth passed through only the outer areas of a meteor stream, meteor activity would be absent.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_METEOR_STREAM.id,
      passage_text: PASSAGE_METEOR_STREAM.content,
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "An inference is drawn from stated information. Begin by looking at the information about conventional theories in the sentence containing the highlighted text. Conventional theories held that the distribution of particles would be increasingly dense toward the center of the meteor stream. If the conventional theories were true, it could be inferred that there would be one intense period of activity as the Earth passed through the dense center of the meteor stream. The computer model showed instead that meteor stream resembled a thick-walled, hollow pipe. The next-to-last sentence of the second paragraph explains that, according to the computer model's prediction, Earth would experience two periods of meteor activity as it passed through the meteor stream, one as it entered the \"pipe\" and one as it exited. Observation of the Geminid meteor shower shows just such a bifurcation. A. Correct. Since the conventional theories predicted an increasingly dense center, Earth would experience a gradual increase of meteor activity, an intense peak at dense center, then a gradual decrease. B. For meteor activity to be steady, the distribution of dust particles would have to be more or less the same across the stream, not increasingly dense toward the center. C. This bifurcated meteor activity was predicted by the computer model, not by conventional theories. D. Conventional theories propose a dense center, which is not a structure that would result in such erratic meteor activity. E. A meteor shower always occurs when Earth passes through a meteor stream (See the first sentence of the second paragraph).",
    categories: ["Reading Comprehension", "Inference"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00008",
    question_number: 8,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "According to the passage, why do the dust particles in a meteor stream eventually surround a comet's original orbit?",
      options: {
        a: "They are ejected by the comet at differing velocities.",
        b: "Their orbits are uncontrolled by planetary gravitational fields.",
        c: "They become part of the meteor stream at different times.",
        d: "Their velocity slows over time.",
        e: "Their ejection velocity is slower than that of the comet.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_METEOR_STREAM.id,
      passage_text: PASSAGE_METEOR_STREAM.content,
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "This question asks for information explicitly stated in the passage. The first paragraph describes the composition and behavior of meteor streams. The dust particles that make up the meteor stream are ejected from the comet at a variety of velocities. Eventually, a shroud of dust surrounds the entire cometary orbit because of the differing velocities of these dust particles. A. Correct. The first two sentences of the passage show that, due to their differing velocities, the dust particles eventually surround the comet's orbit. B. The first two sentences of the passage explain that the dust particles' orbits are dislocated by, and thus under the control of, planetary gravitational fields. C. The passage does not indicate that the dust particles join the meteor stream at different times. D. The passage gives no evidence that the velocity of the dust particles slows. E. The passage does not say that the ejection velocity is slower than the comet's velocity.",
    categories: ["Reading Comprehension", "Supporting Ideas"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00009",
    question_number: 9,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "The passage suggests that which of the following is a prediction concerning meteor streams that can be derived from both the conventional theories mentioned in the highlighted text and the new computer derived theory?",
      options: {
        a: "Dust particles in a meteor stream will usually be distributed evenly throughout any cross section of the stream.",
        b: "The orbits of most meteor streams should cross the orbit of the Earth at some point and give rise to a meteor shower.",
        c: "Over time the distribution of dust in a meteor stream will usually become denser at the outside edges of the stream than at the center.",
        d: "Meteor showers caused by older meteor streams should be, on average, longer in duration than those caused by very young meteor streams.",
        e: "The individual dust particles in older meteor streams should be, on average, smaller than those that compose younger meteor streams.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_METEOR_STREAM.id,
      passage_text: PASSAGE_METEOR_STREAM.content,
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "The question's use of the word suggests means that the answer depends on making an inference. The third sentence of the passage states the hypothesis that a meteor stream should broaden with time; this hypothesis is consistent with both conventional and computer-derived theories regarding the nature of the center of the meteor stream. Thus, the broader the meteor stream is, the older it is. The first sentence of the second paragraph states that meteor showers occur whenever Earth passes through a meteor stream. It can be inferred that if the meteor stream is older and broader, Earth will experience longer periods of meteor showers as it passes through this broad stream than it would if the meteor stream were younger and therefore less broad. A. Conventional theories predict a dense center, and the computer model predicts a pipe-like structure; neither theory is consistent with an even distribution of dust particles. B. Neither theory makes predictions about the orbits of most meteor streams. C. Conventional theories predict a dense center, not a dense exterior. D. Correct. Both theories contend that meteor streams broaden over time. An older, broader meteor stream means that Earth will experience longer meteor showers from start to finish than it would if it were to pass through a younger, narrower meteor stream. E. The passage does not discuss the size of individual dust particles.",
    categories: ["Reading Comprehension", "Inference"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00010",
    question_number: 10,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Which of the following is an assumption underlying the last sentence of the passage?",
      options: {
        a: "In each of the years between 1970 and 1979, the Earth took exactly 19 hours to cross the Geminid meteor stream.",
        b: "The comet associated with the Geminid meteor stream has totally disintegrated.",
        c: "The Geminid meteor stream should continue to exist for at least 5,000 years.",
        d: "The Geminid meteor stream has not broadened as rapidly as the conventional theories would have predicted.",
        e: "The computer-model Geminid meteor stream provides an accurate representation of the development of the actual Geminid stream.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_METEOR_STREAM.id,
      passage_text: PASSAGE_METEOR_STREAM.content,
    } as VRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "The last sentence establishes the approximate date of the Geminid meteor stream. How is this date determined? The computer model shows that the Earth would cross the meteor stream in a little more than 24 hours if the stream were 5,000 years old (second sentence of the second paragraph). One decade's data showed that the Earth crossed the meteor stream in an average of 19 hours (second sentence of the final paragraph). The conclusion that the stream is about 3,000 years old assumes that the computer model is accurate. A. The data provided an average time, not an exact time for each year. B. The passage does not mention the comet associated with the meteor stream. C. The passage does not predict the longevity of the meteor stream. D. The computer model confirmed the hypothesis about broadening over time proposed by conventional theories; to do this, it projected a 5,000-year period, but that does not mean that astronomers expected the actual stream to be older or broader than it was. E. Correct. The assumption is that the computer model accurately represents the development of the actual Geminid meteor stream.",
    categories: ["Reading Comprehension", "Logical Structure"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00011",
    question_number: 11,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text: "The author's main point is that",
      options: {
        a: "modern multinationals originated in the sixteenth and seventeenth centuries with the establishment of chartered trading companies",
        b: "the success of early chartered trading companies, like that of modern multinationals, depended primarily on their ability to carry out complex operations",
        c: "early chartered trading companies should be more seriously considered by scholars studying the origins of modern multinationals",
        d: "scholars are quite mistaken concerning the origins of modern multinationals",
        e: "the management structures of early chartered trading companies are fundamentally the same as those of modern multinationals",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_TRADING_COMPANIES.id,
      passage_text: PASSAGE_TRADING_COMPANIES.content,
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "To understand the main point of the whole passage, review what the author does in each paragraph. The first paragraph presents the general view that the conditions in which early trading companies operated were too primitive to make a comparison to modern multinational corporations interesting. The second paragraph corrects this impression by citing their complex activities, and the third paragraph, after reminding the reader of important differences between them, closes by saying that early trading companies merit further study as analogues of more modern structures (final line of the passage). The author's main point is to show that an interesting comparison between early trading companies and modern multinational companies exists and deserves further study. A. Early trading companies share similarities with modern multinational companies but are not credited with having originated them. B. Early trading companies are compared to modern companies on the basis of their complex activities, but their success is not discussed. C. Correct. An interesting comparison between early trading companies and modern multinational companies may be drawn and should be further studied. D. The author does not say that the general view is mistaken, only that a comparison of early and modern companies deserves further study. E. Early trading companies had hierarchical management structures (second sentence of the second paragraph), but the author does not say they were the same as those in modern companies.",
    categories: ["Reading Comprehension", "Main Idea"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00012",
    question_number: 12,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "It can be inferred from the passage that the author would characterize the activities engaged in by early chartered trading companies as being",
      options: {
        a: "complex enough in scope to require a substantial amount of planning and coordination on the part of management",
        b: "too simple to be considered similar to those of a modern multinational corporation",
        c: "as intricate as those carried out by the largest multinational corporations today",
        d: "often unprofitable due to slow communications and unreliable means of transportation",
        e: "hampered by the political demands imposed on them by the governments of their home countries",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_TRADING_COMPANIES.id,
      passage_text: PASSAGE_TRADING_COMPANIES.content,
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "To discover what the author believes about the activities of early trading companies, look at the beginning of the second paragraph. The previous paragraph had ended with the prevailing dismissal of these companies as unimportant. The author begins the second paragraph with a transitional expression, in reality, however, to emphasize a contrasting point of view. The first sentence lists an impressive array of complex activities, and in the next sentence the author notes that the large volume of transactions associated with these activities seems to have necessitated hierarchical management structures. The author believes the complex activities of the early companies required a multi-leveled management structure to oversee them. A. Correct. The activities of early trading companies were so complex that they required hierarchical management structures to oversee them (second sentence of the second paragraph). B. This is the prevailing view rather than the author's view. C. The author demonstrates their complexity, but does not claim they are as intricate as those of modern multinational corporations. D. The large volume of transactions suggests they were profitable, but the author's focus is on the complexity of the activities rather than on their outcomes. E. The author shows they depended heavily on the governments of their countries (second sentence of the final paragraph), but does not imply they were hampered by politics.",
    categories: ["Reading Comprehension", "Inference"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00013",
    question_number: 13,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "The author lists the various activities of early chartered trading companies in order to",
      options: {
        a: "analyze the various ways in which these activities contributed to changes in management structure in such companies",
        b: "demonstrate that the volume of business transactions of such companies exceeded that of earlier firms",
        c: "refute the view that the volume of business undertaken by such companies was relatively low",
        d: "emphasize the international scope of these companies' operations",
        e: "support the argument that such firms coordinated such activities by using available means of communication and transport",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_TRADING_COMPANIES.id,
      passage_text: PASSAGE_TRADING_COMPANIES.content,
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "To find the purpose of the list in the first sentence of the second paragraph, look at the context that surrounds it. The previous paragraph closes with the point of view, not shared by the author, that the volume of transactions of these early companies is assumed to be low. The author immediately contradicts this evaluation and counters it by listing the activities the trading companies actually engaged in, noting the large volume of transactions associated with these activities. Thus, the author includes this list in order to attack the common assumption that the volume of business transactions was low. A. Management structures were necessary to oversee the activities, but the passage does not mention specific ways in which the activities contributed to changes. B. No comparison to earlier firms is made. C. Correct. The list contradicts the statement in the previous paragraph that the volume of transactions was low. D. The international scope of the activities is not in question in the passage and does not need to be defended. E. The list is included to argue against a common assumption, not to argue for a position that this passage does not call into question.",
    categories: ["Reading Comprehension", "Logical Structure"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00014",
    question_number: 14,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "With which of the following generalizations regarding management structures would the author of the passage most probably agree?",
      options: {
        a: "Hierarchical management structures are the most efficient management structures possible in a modern context.",
        b: "Firms that routinely have a high volume of business transactions find it necessary to adopt hierarchical management structures.",
        c: "Hierarchical management structures cannot be successfully implemented without modern communications and transportation.",
        d: "Modern multinational firms with a relatively small volume of business transactions usually do not have hierarchically organized management structures.",
        e: "Companies that adopt hierarchical management structures usually do so in order to facilitate expansion into foreign trade.",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_TRADING_COMPANIES.id,
      passage_text: PASSAGE_TRADING_COMPANIES.content,
    } as VRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "Consider what the author says about hierarchical management structures in the second paragraph in order to find a statement (independent of the passage) with which the author would agree. After listing activities of the early trading companies, the author says in the second sentence of the second paragraph: The large volume of transactions associated with these activities seems to have necessitated hierarchical management structures. Thus, it is likely that the author would agree that, in general, firms with large volumes of transactions must have hierarchical management structures. A. Since the passage does not discuss hierarchical management as the most efficient possible in a modern context, there is no evidence that the author would agree. B. Correct. The author would agree that firms with large volumes of transactions need hierarchical management structures. C. This statement is explicitly contradicted in the second sentence of the second paragraph. D. The passage links hierarchical management with a high volume of business but provides no evidence about a low volume of business. E. The high volume of transactions, rather than foreign trade, necessitates hierarchical management.",
    categories: ["Reading Comprehension", "Application"],
    questionSubtype: "reading-comprehension",
  },
  {
    id: "VR-GMAT-SK__-00015",
    question_number: 15,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "The passage suggests that modern multinationals differ from early chartered trading companies in that",
      options: {
        a: "the top managers of modern multinationals own stock in their own companies rather than simply receiving a salary",
        b: "modern multinationals depend on a system of capitalist international trade rather than on less modern trading systems",
        c: "modern multinationals have operations in a number of different foreign countries rather than merely in one or two",
        d: "the operations of modern multinationals are highly profitable despite the more stringent environmental and safety regulations of modern governments",
        e: "the overseas operations of modern multinationals are not governed by the national interests of their home countries",
      },
      image_url: null,
      image_options: null,
      passage_id: PASSAGE_TRADING_COMPANIES.id,
      passage_text: PASSAGE_TRADING_COMPANIES.content,
    } as VRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Since the question asks about differences, focus on the third paragraph, where differences are described. The first sentence of that paragraph is a general statement indicating that the early trading companies did differ strikingly from modern multinationals in many respects. Because the author sets up this first general statement as a contrast between the early and modern companies, the examples that follow it imply that what is mentioned as being true of the early trading companies is not true of modern multinationals. Thus, when the author says the early companies depended heavily on their national governments and thus characteristically acted abroad to promote national interests, the implication is that modern multinational companies do not. A. The author suggests in the third paragraph that at least some managers in both categories own, or owned, shares of their respective companies and that modern managers have less, not more, ownership than did the earlier managers. B. The next-to-last sentence of the passage indicates that the early trading companies established and used a system of capitalist international trade. C. The passage does not say or imply that early trading companies conducted business with only one or two foreign countries. D. The passage does not say or imply that early trading companies were less profitable than modern multinationals, nor does it discuss modern regulations. E. Correct. The passage implies that modern multinational companies, unlike early trading companies, need not depend heavily on their national governments or promote national interests abroad.",
    categories: ["Reading Comprehension", "Inference"],
    questionSubtype: "reading-comprehension",
  },
  // ============================================
  // CRITICAL REASONING QUESTIONS
  // ============================================
  {
    id: "VR-GMAT-SK__-00016",
    question_number: 16,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "The objection implied above to the productivity measure described is based on doubts about the truth of which of the following statements?",
      options: {
        a: "Postal workers are representative of service workers in general.",
        b: "The delivery of letters is the primary activity of the postal service.",
        c: "Productivity should be ascribed to categories of workers, not to individuals.",
        d: "The quality of services rendered can appropriately be ignored in computing productivity.",
        e: "The number of letters delivered is relevant to measuring the productivity of postal workers.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00001",
      passage_text:
        "Correctly measuring the productivity of service workers is complex. Consider, for example, postal workers: they are often said to be more productive if more letters are delivered per postal worker. But is this really true? What if more letters are lost or delayed per worker at the same time that more are delivered?",
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "In considering how best to measure productivity, the assumption is made that the more letters postal workers deliver, the more productive they are. This assumption is then challenged: What if the number of delayed and lost letters increases proportionately with the number of letters delivered? Which statement would NOT be accepted by those objecting to the measure? The point of the objection is that the number of letters delivered is, by itself, an inadequate measure of postal workers' productivity. The challenge introduces the issue of the quality of the work being performed by suggesting that the number of misdirected letters should also be taken into account. The challenge is based on rejecting the idea that quality can be ignored when measuring productivity. A. The argument uses postal workers as an example; the challenge does not question the fairness of the example. B. Letter-delivery is assumed to be the primary activity of postal workers because their productivity is measured on that basis; the challenge does not reject this point. C. The argument does discuss a category of workers, postal workers, rather than individuals; the challenge does not reject this point. D. Correct. This statement properly identifies the point that is the basis of the challenge to the measure; the objection does NOT accept the position that quality can be ignored in evaluating productivity. E. There is no doubt that counting letters delivered is part of measuring productivity; the challenge is to its being the only measure.",
    categories: ["Critical Reasoning", "Argument Evaluation"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00017",
    question_number: 17,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Sharon's argument is structured to lead to which of the following as a conclusion?",
      options: {
        a: "The fact that 90% of the people know someone who is unemployed is not an indication that unemployment is abnormally high.",
        b: "The current level of unemployment is not moderate.",
        c: "If at least 5% of workers are unemployed, the result of questioning a representative group of people cannot be the percentage Roland cites.",
        d: "It is unlikely that the people whose statements Roland cites are giving accurate reports.",
        e: "If an unemployment figure is given as a certain percent, the actual percentage of those without jobs is even higher.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00002",
      passage_text:
        "Roland: The alarming fact is that 90 percent of the people in this country now report that they know someone who is unemployed.\nSharon: But a normal, moderate level of unemployment is 5 percent, with 1 out of 20 workers unemployed. So at any given time if a person knows approximately 50 workers, 1 or more will very likely be unemployed.",
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "Sharon's reply leads to what conclusion about unemployment? Sharon begins her reply with \"but,\" indicating that she is about to counter either Roland's statistic or his alarm; she accepts the statistic and addresses the alarm. If the normal level of unemployment rate is 5% and if the average person knows 50 workers, then knowing one person out of work is within the normal and expected range, not a cause for alarm. Sharon shows that it is possible for 90% of the population to know someone unemployed and for unemployment to be a normal rate of 5% at the same time. A. Correct. This statement properly identifies the conclusion to which the argument is leading. B. Sharon's argument is made in the abstract. No information is provided about the current level of unemployment. C. Sharon does not challenge Roland's statistics, and her argument is not designed to make a conclusion about their accuracy, only their interpretation. D. There is no information about the accuracy of Roland's reports, so no conclusion can be made about how likely or unlikely they are to be accurate. E. No information in Sharon's argument supports this conclusion.",
    categories: ["Critical Reasoning", "Argument Construction"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00018",
    question_number: 18,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Which of the following statements, if true, would best explain the 1984 decrease in productivity?",
      options: {
        a: "Prices for palm fruit fell between 1980 and 1984 following the rise in production and a concurrent fall in demand.",
        b: "Imported trees are often more productive than native trees because the imported ones have left behind their pests and diseases in their native lands.",
        c: "Rapid increases in productivity tend to deplete trees of nutrients needed for the development of the fruit-producing female flowers.",
        d: "The weevil population in Asia remained at approximately the same level between 1980 and 1984.",
        e: "Prior to 1980, another species of insect pollinated the Asian palm trees, but not as efficiently as the species of weevil that was introduced in 1980.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00003",
      passage_text:
        "In Asia, where palm trees are non-native, the trees' flowers have traditionally been pollinated by hand, which has kept palm fruit productivity unnaturally low. When weevils, known to be efficient pollinators of palm flowers, were introduced into Asia in 1980, palm fruit productivity increased—by up to 50 percent in some areas—but then decreased sharply in 1984.",
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "In 1980, the introduction of weevils to pollinate palms trees in Asia resulted in increased palm fruit productivity. This productivity decreased sharply in 1984. What explains the sudden decrease in 1984? The palm trees had experienced a sudden burst of productivity beginning in 1980. What if an after-effect of that spurt was the cause? If that burst of productivity had used up the trees' nutrients, then the trees would be unable to produce the flowers that are pollinated in order to produce fruit. This sudden exhaustion of the tree's resources is the best explanation for the sudden decrease in productivity. A. Falling prices and falling demand do not explain the falling productivity of the trees. B. The lack of pests and diseases among imported trees does not explain the sharply decreased productivity. C. Correct. This statement properly identifies a reason for sharply decreased productivity. D. If the weevil population pollinating the trees remained the same, it is reasonable to think that productivity remained the same, so this does not explain the decrease. E. A change that occurred before 1980 does not explain a change that occurred in 1984.",
    categories: ["Critical Reasoning", "Argument Construction"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00019",
    question_number: 19,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Which of the following, if true, would cast the most doubt on the effectiveness of the authority's plan to finance the proposed improvements by increasing bridge tolls?",
      options: {
        a: "Before the authority increases tolls on any of the area bridges, it is required by law to hold public hearings at which objections to the proposed increase can be raised.",
        b: "Whenever bridge tolls are increased, the authority must pay a private contractor to adjust the automated toll-collecting machines.",
        c: "Between the time a proposed toll increase is announced and the time the increase is actually put into effect, many commuters buy more tokens than usual to postpone the effects of the increase.",
        d: "When tolls were last increased on the two bridges in question, almost 20 percent of the regular commuter traffic switched to a slightly longer alternative route that has since been improved.",
        e: "The chairman of the authority is a member of the Tristate Automobile Club that has registered strong opposition to the proposed toll increase.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00004",
      passage_text:
        "According to the Tristate Transportation Authority, making certain improvements to the main commuter rail line would increase ridership dramatically. The authority plans to finance these improvements over the course of five years by raising automobile tolls on the two highway bridges along the route the rail line serves. Although the proposed improvements are indeed needed, the authority's plan for securing the necessary funds should be rejected because it would unfairly force drivers to absorb the entire cost of something from which they receive no benefit.",
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "A transportation authority plans to pay for improvements to a commuter rail line by raising automobile tolls on the two highway bridges along the route the rail line serves. One objection to this plan is that drivers will have to pay for something from which they will not benefit. What casts doubt on how well the financing plan would work? Any financing plan is based on estimates of costs and revenues, and any factor that significantly increases costs or lowers revenues threatens the effectiveness of that plan. The authority's plan makes a revenue projection based on the current number of drivers who use the bridges and thus will pay the increased tolls. If there is a precedent that a significant percentage of regular commuters had previously used an alternate route in order to avoid the increased tolls on these specific bridges, then the revenue basis for the financing plan is considerably undermined. If that substitute route has since become an even more appealing alternative, the effectiveness of the plan is further threatened. A. Objections to the plan at public hearings do not affect how well the financing plan will work. B. The one-time costs of changing the automatic toll-collectors would not be significant given the five years of revenue from the increased tolls. C. Revenue lost to token hoarding is insignificant compared to the revenue gained from five years of increased tolls. D. Correct. This statement properly identifies a factor that weakens the authority's financing plan. E. Opposition to the increased toll can be expected; it does not mean that the plan will be less effective.",
    categories: ["Critical Reasoning", "Evaluation of a Plan"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00020",
    question_number: 20,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Which of the following points to the most serious logical flaw in the reviewer's argument?",
      options: {
        a: "The paintings chosen by the book's author for analysis could be those that most support the book's thesis.",
        b: "There could be criteria other than the technical skill of the artist by which to evaluate a painting.",
        c: "The title of the book could cause readers to accept the book's thesis even before they read the analysis of the paintings that supports it.",
        d: "The particular methods currently used by European painters could require less artistic skill than do methods used by painters in other parts of the world.",
        e: "A reader who was not familiar with the language of art criticism might not be convinced by the book's analysis of the 100 paintings.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00005",
      passage_text:
        "Reviewer: The book Art's Decline argues that European painters today lack skills that were common among European painters of preceding centuries. In this the book must be right, since its analysis of 100 paintings, 50 old and 50 contemporary, demonstrates convincingly that none of the contemporary paintings are executed as skillfully as the older paintings.",
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "What is the flaw in the reasoning? The argument is based on two samples of 50 paintings each, but there is no evidence that the samples are representative. It is quite possible that the book presents and discusses only those paintings that support its argument and ignores those paintings that do not support the argument. The reviewer accepts the selected samples of artwork without questioning how truly representative they are. A. Correct. This statement properly identifies a logical flaw in the reviewer's argument. B. This statement critiques the narrow focus of the book, not the reasoning of its argument, which is endorsed by the reviewer. C. This statement shows that the reasoning of readers may be flawed if they accept the thesis on the basis of the book's title; it does not point to a flaw in the author's or the reviewer's reasoning. D. The book compares two groups of European painters. Comparisons to painters in other parts of the world are irrelevant. E. This statement focuses on the reader's possible confusion, not on an error of reasoning on the part of the reviewer or author.",
    categories: ["Critical Reasoning", "Argument Evaluation"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00021",
    question_number: 21,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "The official's conclusion logically depends on which of the following assumptions?",
      options: {
        a: "Laws should not restrict the behavior of former government officials.",
        b: "Lobbyists are typically people who have previously been high-level government officials.",
        c: "Low-level government officials do not often become lobbyists when they leave government service.",
        d: "High-level government officials who leave government service are capable of earning a livelihood only as lobbyists.",
        e: "High-level government officials who leave government service are currently permitted to act as lobbyists for only three years.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00006",
      passage_text:
        "To prevent some conflicts of interest, Congress could prohibit high-level government officials from accepting positions as lobbyists for three years after such officials leave government service. One such official concluded, however, that such a prohibition would be unfortunate because it would prevent high-level government officials from earning a livelihood for three years.",
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "What assumption must be true for this argument to hold together? The argument is logical only if it is assumed that the sole possible job opportunity for the ex-officials is lobbying. A. This broad assumption is not needed. B. This statement may be true, but it is not needed as an assumption. C. Low-level officials are irrelevant to the argument. D. Correct. This statement properly identifies the argument's necessary assumption. E. The current situation is not relevant to the argument.",
    categories: ["Critical Reasoning", "Argument Construction"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00022",
    question_number: 22,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Which of the following, if true, most seriously weakens the argument?",
      options: {
        a: "Museums can accept a recently unearthed statue only with valid export documentation from its country of origin.",
        b: "The subject's pose and other aspects of the subject's treatment exhibit all the most common features of Greek statues of the sixth century B.C.",
        c: "The chemical bath that forgers use was at one time used by dealers and collectors to remove the splotchy surface appearance of genuinely ancient sculptures.",
        d: "Museum officials believe that forgers have no technique that can convincingly simulate the patchy weathering characteristic of the surfaces of ancient sculptures.",
        e: "An allegedly Roman sculpture with a uniform surface similar to that of the statue being offered to the museum was recently shown to be a forgery.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00007",
      passage_text:
        "A museum has been offered an undocumented statue, supposedly Greek and from the sixth century B.C. Possibly the statue is genuine, but undocumented, because it was recently unearthed or because it has been privately owned. However, an ancient surface usually has uneven weathering, whereas the surface of this statue has the uniform quality characteristically produced by a chemical bath used by forgers to imitate a weathered surface. Therefore, the statue is probably a forgery.",
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "What point weakens the argument that the statue is a forgery? The argument that the statue is a forgery rests on one point: the statue's uniform surface suggests it may have been treated in a chemical bath used by forgers to simulate weathering. If the statue acquired its surface in some legitimate way, then the conclusion that it is not a true antiquity is weakened. If art dealers or collectors once used, for esthetic reasons, the same chemical baths now used by forgers for a different purpose, that fact would throw into doubt the conclusion about the statue's lack of authenticity. A. Since the argument is about what might make the statue a forgery, not about museums' acquisition protocols, this statement fails to weaken the argument. B. Since successful forgers of antiquities might well be expected to produce a counterfeit work that typifies its supposed historical period, this statement does not affect the argument. C. Correct. This statement properly identifies a possible historical source of the statue's uniform surface and thus undermines the one-point argument that the statue is a forgery. D. This statement is not relevant to this case since the statue in question does not have patchy weathering, but rather a uniform surface. E. A similar example suggests that this statue, too, could be proven a forgery, so the conclusion is not weakened.",
    categories: ["Critical Reasoning", "Argument Evaluation"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00023",
    question_number: 23,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Which of the following, if true, most helps to resolve the paradox outlined above?",
      options: {
        a: "Brand names are taken by consumers as a guarantee of getting a product as good as the best rival products.",
        b: "Consumers recognize that the quality of products sold under invariant brand names can drift over time.",
        c: "In many acquisitions of one corporation by another, the acquiring corporation is interested more in acquiring the right to use certain brand names than in acquiring existing production facilities.",
        d: "In the days when special quality advantages were easier to obtain than they are now, it was also easier to get new brand names established.",
        e: "The advertising of a company's brand-name products is, at times, transferred to a new advertising agency, especially when sales are declining.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00008",
      passage_text:
        "Products sold under a brand name used to command premium prices because, in general, they were superior to nonbrand rival products. Technical expertise in product development has become so widespread, however, that special quality advantages are very hard to obtain these days and even harder to maintain. As a consequence, brand-name products generally neither offer higher quality nor sell at higher prices. Paradoxically, brand names are a bigger marketing advantage than ever.",
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "How can this paradox be explained? It is given that a brand-name product's only distinction from its rival products is a recognizable name. What must be true to give brand-name products a bigger marketing advantage? Could consumers be relying on their outdated knowledge and believing that brand names continue to guarantee that a product's quality is at least as good as, and possibly higher than, that of the rival products at the same price? If so, they would choose to purchase the brand-name product trusting they would, at a minimum, get comparable quality for the same price. A. Correct. This statement correctly identifies the consumer behavior that explains the marketing advantage of brand names. B. Consumers would be less likely to buy brand-name products if they were unsure of their quality, so this statement does not resolve the paradox. C. Corporations value brand names, but this statement does not say why, nor does it explain the marketing advantage of brand names. D. The relative ease or difficulty of establishing brand names does not explain why they are a marketing advantage. E. The shift from one advertising agency to another to counteract falling sales does not account for the general marketing advantage brand names enjoy.",
    categories: ["Critical Reasoning", "Argument Evaluation"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00024",
    question_number: 24,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Which of the following can be correctly inferred from the statements above?",
      options: {
        a: "Individuals who are underweight do not run any risk of developing high levels of cholesterol in the bloodstream.",
        b: "Individuals who do not exercise regularly have a high risk of developing high levels of cholesterol in the bloodstream late in life.",
        c: "Exercise and weight reduction are the most effective methods of lowering bloodstream cholesterol levels in humans.",
        d: "A program of regular exercise and weight reduction lowers cholesterol levels in the bloodstream of some individuals.",
        e: "Only regular exercise is necessary to decrease cholesterol levels in the bloodstream of individuals of average weight.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00009",
      passage_text:
        "Increases in the level of high-density lipoprotein (HDL) in the human bloodstream lowers bloodstream cholesterol levels by increasing the body's capacity to rid itself of excess cholesterol. Levels of HDL in the bloodstream of some individuals are significantly increased by a program of regular exercise and weight reduction.",
    } as VRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "What inference is supported by this information? The first statement is a general one, applying to all people. The second one applies only to some people. The resulting inference can be made only about some people, not everyone. Since some people achieve higher HDL levels through a program of regular exercise and weight reduction, these individuals will have lower cholesterol levels. A. The passage draws no comparison between being underweight and having lower cholesterol levels. B. The passage does not discuss lack of regular exercise as a risk factor for the development of high bloodstream cholesterol late in life. C. Other possible methods of lowering cholesterol levels are not discussed, and so a program of exercise and weight reduction cannot be inferred to be the best method. Moreover, a general inference applying to all humans cannot be made on the basis of some individuals. D. Correct. This statement properly identifies the inference that, since a program of exercise and weight reduction raises HDL for some people, that program should lower cholesterol for some people. E. The passage explicitly states that the two elements of regular exercise and weight reduction together contribute to some individuals' ability to increase their HDL levels. It cannot be inferred that all individuals of average weight can lower their cholesterol with regular exercise alone.",
    categories: ["Critical Reasoning", "Argument Construction"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00025",
    question_number: 25,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Which of the following is an assumption made in drawing the conclusion above?",
      options: {
        a: "The market for cheap, traditional bicycles cannot expand unless the market for high-performance competition bicycles expands.",
        b: "High-performance bicycles are likely to be improved more as a result of technological innovations developed in small workshops than as a result of technological innovations developed in major manufacturing concerns.",
        c: "Bicycle racers do not generate a strong demand for innovations that fall outside what is officially recognized as standard for purposes of competition.",
        d: "The technological conservatism of bicycle manufacturers results primarily from their desire to manufacture a product that can be sold without being altered to suit different national markets.",
        e: "The authorities who set standards for high-performance bicycle racing do not keep informed about innovative bicycle design.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00010",
      passage_text:
        "The technological conservatism of bicycle manufacturers is a reflection of the kinds of demand they are trying to meet. The only cyclists seriously interested in innovation and willing to pay for it are bicycle racers. Therefore, innovation in bicycle technology is limited by what authorities will accept as standard for purposes of competition in bicycle races.",
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "What is being assumed in this argument? This argument implies a connection between what bicycle racers want and what bicycle manufacturers make. The passage states that only racers are interested in innovation and willing to pay for it. Bicycle manufacturers have determined it is not worthwhile to produce innovative bicycles that do not meet official standards. What is the implied interaction? It is reasonable to assume that racers must not be interested in buying models that, while innovative, do not meet official standards for racing; they will pay only for those innovations that are acceptable in competition. A. The argument concerns innovation in bicycle technology. It is not about the entire market for all bicycles, so no assumption is made about traditional bicycles. B. The passage does not discuss where the best innovations are likely to be created, so no assumption about small workshops versus large manufacturers is made. C. Correct. This statement properly identifies the conclusion's underlying assumption that bicycle racers do not buy bicycles they cannot use for racing. D. The passage does not discuss different national markets; no assumption can be made about them. E. The passage does not indicate what the authorities do or do not know; this statement is extraneous to the passage and cannot be assumed.",
    categories: ["Critical Reasoning", "Argument Construction"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00026",
    question_number: 26,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Which of the following investigations is most likely to yield significant information that would help to evaluate the researcher's hypothesis?",
      options: {
        a: "Determining if a metal alloy is used to make the strings used by classical guitarists",
        b: "Determining whether classical guitarists make their strings go dead faster than do folk guitarists",
        c: "Determining whether identical lengths of string, of the same gauge, go dead at different rates when strung on various brands of guitars",
        d: "Determining whether a dead string and a new string produce different qualities of sound",
        e: "Determining whether smearing various substances on new guitar strings causes them to go dead",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00011",
      passage_text:
        "Guitar strings often go \"dead\"—become less responsive and bright in tone—after a few weeks of intense use. A researcher whose son is a classical guitarist hypothesized that dirt and oil, rather than changes in the material properties of the string, were responsible.",
    } as VRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Which investigation helps evaluate the hypothesis? The researcher needs to test the hypothesis directly. Smearing substances (such as dirt and oil) onto new strings and seeing if they go dead is a direct test. If the strings do not lose their tone, the hypothesis is false. If they do go dead, the hypothesis is a likely explanation of the problem, although not necessarily the only explanation. A. Not enough information is given about the metal alloy to evaluate its effect on the composition of the strings and their loss of tone after intense play. B. The difference in the style of play is outside the scope of the hypothesis. C. The difference in the brands of guitars is outside the scope of the hypothesis. D. The difference between a new string and a dead string has already been established. E. Correct. This statement properly identifies a procedure that is a direct test of the hypothesis.",
    categories: ["Critical Reasoning", "Evaluation of a Plan"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00027",
    question_number: 27,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "In the consumer advocate's argument, the two portions in boldface play which of the following roles?",
      options: {
        a: "The first is a generalization that the consumer advocate accepts as true; the second is presented as a consequence that follows from the truth of that generalization.",
        b: "The first is a pattern of cause and effect that the consumer advocate argues will be repeated in the case at issue; the second acknowledges a circumstance in which that pattern would not hold.",
        c: "The first is a pattern of cause and effect that the consumer advocate predicts will not hold in the case at issue; the second offers a consideration in support of that prediction.",
        d: "The first is evidence that the consumer advocate offers in support of a certain prediction; the second is that prediction.",
        e: "The first acknowledges a consideration that weighs against the main position that the consumer advocate defends; the second is that position.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00012",
      passage_text:
        "Consumer advocate: It is generally true, at least in this state, that lawyers who advertise a specific service charge less for that service than lawyers who do not advertise. It is also true that each time restrictions on the advertising of legal services have been eliminated, the number of lawyers advertising their services has increased and legal costs to consumers have declined in consequence. However, eliminating the state requirement that legal advertisements must specify fees for specific services would almost certainly increase rather than further reduce consumers' legal costs. Lawyers would no longer have an incentive to lower their fees when they begin advertising and if no longer required to specify fee arrangements, many lawyers who now advertise would increase their fees.",
    } as VRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "What part do the two sentences in boldface play in the argument? This question asks the reader to look carefully at how the advocate's argument is constructed and in particular at how the two sentences in boldface are related. It is necessary to understand the consumer advocate's main point: if lawyers are not required to specify fees in advertisements, consumers' legal costs are likely to rise. The first boldface sentence shows the cause-and-effect relation of lawyers' ads and falling consumer costs, a relation the advocate predicts will not continue in the current case. The second boldface sentence explains why that relation will change. A. The first sentence is presented as true, but the second sentence does not follow as a consequence; rather, it contradicts the first sentence. B. The first sentence shows cause and effect, but the consumer advocate does not argue that it will be repeated. The advocate argues that it will not be repeated. C. Correct. The first sentence shows general cause and effect in a situation that the advocate argues will not be true in this particular case. The second sentence explains why it will not be true. D. The consumer advocate predicts legal costs will rise; the first sentence does not offer evidence in support of that prediction, but rather evidence that costs have always fallen. E. The first sentence gives a general cause-and-effect relationship, not a special consideration; the second sentence shows how that relationship could change.",
    categories: ["Critical Reasoning", "Argument Construction"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00028",
    question_number: 28,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Which of the following, if true, most strongly supports the Write Company's projection that its plan will lead to an increase in its sales of pencil leads?",
      options: {
        a: "First-time buyers of mechanical pencils tend to buy the least expensive mechanical pencils available.",
        b: "Annual sales of mechanical pencils are expected to triple over the next five years.",
        c: "A Write Company executive is studying ways to reduce the cost of manufacturing pencil leads.",
        d: "A rival manufacturer recently announced similar plans to introduce a mechanical pencil that would accept only the leads produced by that manufacturer.",
        e: "In extensive test-marketing, mechanical-pencil users found the new Write Company pencil markedly superior to other mechanical pencils they had used.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00013",
      passage_text:
        "Manufacturers of mechanical pencils make most of their profit on pencil leads rather than on the pencils themselves. The Write Company, which cannot sell its leads as cheaply as other manufacturers can, plans to alter the design of its mechanical pencil so that it will accept only a newly designed Write Company lead, which will be sold at the same price as the Write Company's current lead.",
    } as VRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "What point supports the plan's success? It is clear that increased lead sales are directly tied to the sales and ongoing use of the new pencil that can use only that type of lead. If the new pencils sell well and then get used frequently, the buyers will need to purchase leads regularly. If thorough test-marketing has shown that potential buyers find the new pencil greatly superior to use, then the pencil buyers will have to purchase the only available leads that fit their pencils, no matter whether the leads are more expensive, and the projection that sales of these pencil leads will increase is strengthened. A. It is not known whether the Write Company's pencil is the least expensive, nor are the lead-buying habits of first-time buyers known. This information thus does not strengthen the projection. B. This expectation applies for all manufacturers and does not show that the Write Company's plan will cause increased sales of its pencil leads. C. Reducing the cost of manufacturing the leads could lead to greater profits but not to greater sales, since the passage states that the price will remain the same. D. A rival manufacturer's announcement to follow the same plan does not affect whether the plan will be successful for the Write Company. E. Correct. This statement properly identifies a point that supports the plan's success.",
    categories: ["Critical Reasoning", "Evaluation of a Plan"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00029",
    question_number: 29,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Which of the following, if true, would most strongly support the position above?",
      options: {
        a: "In many foods, the natural combination of vitamins with other nutrients makes those vitamins more usable by the body than are vitamins added in vitamin supplements.",
        b: "People who regularly eat cereals fortified with vitamin supplements sometimes neglect to eat the foods in which the vitamins occur naturally.",
        c: "Foods often must be fortified with vitamin supplements because naturally occurring vitamins are removed during processing.",
        d: "Unprocessed cereals are naturally high in several of the vitamins that are usually added to fortified breakfast cereals.",
        e: "Cereals containing vitamin supplements are no harder to digest than similar cereals without added vitamins.",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00014",
      passage_text:
        "Many breakfast cereals are fortified with vitamin supplements. Some of these cereals provide 100 percent of the recommended daily requirement of vitamins. Nevertheless, a well-balanced breakfast, including a variety of foods, is a better source of those vitamins than are such fortified breakfast cereals alone.",
    } as VRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "What strengthens the argument in favor of a balanced breakfast as a better source of vitamins? The argument compares the vitamins naturally occurring in foods and those added to cereal. What would make the vitamins in foods superior in nutritional value to the vitamin supplements in fortified cereals? If the combination of vitamins with other nutrients in many foods allowed the body to better use those vitamins, a balanced breakfast would be the preferred source of the vitamins. A. Correct. This statement properly identifies a factor that strengthens the argument. B. This statement explains who might benefit from a well-balanced breakfast, but it does not support the conclusion in favor eating a variety of foods. C. This statement shows why foods need to be fortified, but it does not support the conclusion that naturally occurring vitamins in foods are better. D. This statement provides some information about unprocessed cereals, but it does not explain why the vitamins found in a balanced breakfast are superior to the vitamins in fortified cereals. E. The ability of the body to digest fortified or unfortified cereals is outside the scope of the question.",
    categories: ["Critical Reasoning", "Argument Evaluation"],
    questionSubtype: "critical-reasoning",
  },
  {
    id: "VR-GMAT-SK__-00030",
    question_number: 30,
    section: "Verbal Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text: "Which of the following best completes the passage below?",
      options: {
        a: "affluent purchasers currently represent a shrinking portion of the population of all purchasers",
        b: "continued sales depend directly on the maintenance of an aura of exclusivity",
        c: "purchasers of premium products are concerned with the quality as well as with the price of the products",
        d: "expansion of the market niche to include a broader spectrum of consumers will increase profits",
        e: "manufacturing a premium brand is not necessarily more costly than manufacturing a standard brand of the same product",
      },
      image_url: null,
      image_options: null,
      passage_id: "CR-STIMULUS-00015",
      passage_text:
        "People buy prestige when they buy a premium product. They want to be associated with something special. Mass-marketing techniques and price reduction strategies should not be used because __________.",
    } as VRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "Argument Construction - Situation: Consumers seek prestige when they buy premium products, that is to say, expensive, top-quality products. Mass-marketing techniques and price-reduction strategies are not appropriate tools to sell these products to consumers seeking to be associated with something special.\n\nReasoning: Why are these tools NOT appropriate for selling these products to this group of consumers? Consider that these consumers want to feel that the premium product they are buying is out of the ordinary. Any strategy that makes the premium product seem more common or easier to own reduces that product's appeal to this group. By definition, mass-marketing techniques appeal to a huge number of people, rather than a small, select group. Further, reducing prices reduces any associated prestige as well because the product becomes more broadly obtainable. These two techniques would not be appropriate because these consumers would lose the feeling that the product is special.\n\nA. Mass-marketing strategies are not an appropriate match for a small, and currently dwindling, group of buyers; price reductions are not an appropriate match for consumers attracted to products by their high prices.\nB. Correct. This statement properly identifies the point that continued sales depend on making the product seem special and difficult to obtain; mass-marketing techniques and price-reduction strategies would make the product seem quite ordinary and thus hurt sales.\nC. It has not been established that these strategies would lower the products' quality, and so this offers no reason for avoiding the strategies.\nD. This statement provides a reason why broader marketing should be employed, rather than supporting an argument that it should be avoided.\nE. Manufacturing costs are not discussed and so are irrelevant.",
    categories: ["Critical Reasoning", "Argument Construction"],
    questionSubtype: "critical-reasoning",
  },
];
