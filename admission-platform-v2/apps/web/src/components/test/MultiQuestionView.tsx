/**
 * MultiQuestionView Component
 * Displays multiple questions per page stacked vertically
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

  return (
    <div className="space-y-8">
      {questions.map((question, idx) => {
        const questionNumber = startIndex + idx + 1;
        const isEnglishSection = currentSection?.toLowerCase().includes('inglese');
        const rendererLanguage: 'it' | 'en' = (testLanguage === 'en' || isEnglishSection) ? 'en' : 'it';

        return (
          <div
            key={question.id}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="bg-brand-green text-white px-3 py-1 rounded-full text-sm font-bold">
                  {questionNumber}
                </span>
              </div>
              {/* Bookmark Button */}
              {allowBookmarks && (
                <button
                  onClick={() => onToggleBookmark(question.id)}
                  disabled={isTimeExpired}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    bookmarkedQuestions.has(question.id)
                      ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faBookmark} className="mr-1" />
                  {bookmarkedQuestions.has(question.id) ? '✓' : ''}
                </button>
              )}
            </div>

            {/* Legacy format fallback */}
            {!question.question_data && question.question_text && (
              <div className="text-gray-800 text-lg whitespace-pre-wrap mb-4">
                <MathJaxRenderer>{question.question_text}</MathJaxRenderer>
              </div>
            )}

            {/* Question Rendering via QuestionRenderer */}
            {question.question_data && (
              question.question_data.di_type ||
              (question.question_type === 'multiple_choice' && question.question_data.options) ||
              question.question_type === 'open_ended'
            ) && (
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
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
