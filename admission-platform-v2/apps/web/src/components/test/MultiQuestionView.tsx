/**
 * MultiQuestionView Component
 * Displays multiple questions per page with side-by-side layout
 * Passage/paragraph shown above, question text on left, answers on right
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { QuestionRenderer, type UnifiedAnswer } from './QuestionRenderer';
import { MathJaxRenderer } from '../MathJaxRenderer';

interface Question {
  id: string;
  question_type: string;
  question_text?: string;
  question_data: any;
  answers?: any;
  section?: string;
}

interface MultiQuestionViewProps {
  questions: Question[];
  answers: Record<string, any>;
  currentSection: string;
  testLanguage: string;
  bookmarkedQuestions: Set<string>;
  timeRemaining: number | null;
  allowBookmarks?: boolean;
  isGuidedMode?: boolean;
  showCorrectAnswers?: boolean;
  isPreviewMode?: boolean;
  onAnswerChange: (questionId: string, answer: UnifiedAnswer) => void;
  onToggleBookmark: (questionId: string) => void;
  toUnifiedAnswer: (answer: any) => UnifiedAnswer;
  startIndex: number; // For displaying question numbers
}

// Extract question text from various question data formats
function getQuestionText(question: Question, language: 'it' | 'en'): string | null {
  const data = question.question_data;
  if (!data) return question.question_text || null;

  // Try localized first
  if (language === 'en') {
    return data.question_text_eng || data.question_text || data.question || data.text || data.prompt || data.problem || question.question_text || null;
  }
  return data.question_text || data.question_text_eng || data.question || data.text || data.prompt || data.problem || question.question_text || null;
}

// Extract passage text if present
function getPassageText(question: Question, language: 'it' | 'en'): { text: string | null; title: string | null } {
  const data = question.question_data;
  if (!data) return { text: null, title: null };

  const text = language === 'en'
    ? (data.passage_text_eng || data.passage_text || data.passage)
    : (data.passage_text || data.passage_text_eng || data.passage);

  const title = language === 'en'
    ? (data.passage_title_eng || data.passage_title)
    : (data.passage_title || data.passage_title_eng);

  return { text: text || null, title: title || null };
}

export function MultiQuestionView({
  questions,
  answers,
  currentSection,
  testLanguage,
  bookmarkedQuestions,
  timeRemaining,
  allowBookmarks = false,
  isGuidedMode = false,
  showCorrectAnswers = false,
  isPreviewMode = false,
  onAnswerChange,
  onToggleBookmark,
  toUnifiedAnswer,
  startIndex,
}: MultiQuestionViewProps) {
  const isTimeExpired = timeRemaining !== null && timeRemaining <= 1;
  const isEnglishSection = currentSection?.toLowerCase().includes('inglese');
  const rendererLanguage: 'it' | 'en' = (testLanguage === 'en' || isEnglishSection) ? 'en' : 'it';

  // Check if any question has a passage - if so, show it at the top
  const firstQuestionWithPassage = questions.find(q => {
    const { text } = getPassageText(q, rendererLanguage);
    return !!text;
  });
  const sharedPassage = firstQuestionWithPassage ? getPassageText(firstQuestionWithPassage, rendererLanguage) : null;

  return (
    <div className="space-y-6">
      {/* Shared Passage Section (if any question has a passage) */}
      {sharedPassage?.text && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
          {sharedPassage.title && (
            <h3 className="text-lg font-bold text-blue-900 mb-4 pb-2 border-b border-blue-200">
              {sharedPassage.title}
            </h3>
          )}
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            <MathJaxRenderer>{sharedPassage.text}</MathJaxRenderer>
          </div>
        </div>
      )}

      {/* Questions */}
      {questions.map((question, idx) => {
        const questionNumber = startIndex + idx + 1;
        const questionText = getQuestionText(question, rendererLanguage);

        return (
          <div
            key={question.id}
            className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="bg-brand-green text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  {questionNumber}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  Domanda {questionNumber}
                </span>
              </div>
              {/* Bookmark Button */}
              {allowBookmarks && (
                <button
                  onClick={() => onToggleBookmark(question.id)}
                  disabled={isTimeExpired}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    bookmarkedQuestions.has(question.id)
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-400'
                      : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faBookmark} />
                </button>
              )}
            </div>

            {/* Two-column layout: Question text left, Answers right */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: Question Text */}
              <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/30">
                {questionText ? (
                  <div className="text-gray-800 text-base leading-relaxed">
                    <MathJaxRenderer>{questionText}</MathJaxRenderer>
                  </div>
                ) : (
                  <div className="text-gray-400 italic text-sm">
                    Vedi le opzioni di risposta →
                  </div>
                )}
              </div>

              {/* Right: Answer Options */}
              <div className="p-6">
                {question.question_data && (
                  question.question_data.di_type ||
                  (question.question_type === 'multiple_choice' && question.question_data.options) ||
                  question.question_type === 'open_ended'
                ) ? (
                  <QuestionRenderer
                    question={{
                      id: question.id,
                      question_type: question.question_type,
                      question_data: question.question_data,
                      answers: question.answers,
                    }}
                    currentAnswer={toUnifiedAnswer(answers[question.id])}
                    onAnswerChange={(answer) => onAnswerChange(question.id, answer)}
                    language={rendererLanguage}
                    showResults={(isGuidedMode && showCorrectAnswers) || isPreviewMode}
                    hideQuestionText={true}
                  />
                ) : (
                  <div className="text-gray-500 italic">
                    Nessuna opzione disponibile
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
