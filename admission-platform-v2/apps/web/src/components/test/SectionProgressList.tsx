/**
 * SectionProgressList Component
 * Displays answered/non-answered question counts per section
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

interface SectionProgressListProps {
  sections: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questions: Array<{ id: string; section?: string; macro_section?: string; [key: string]: any }>;
  answers: Record<string, {
    answer?: string | null;
    msrAnswers?: string[];
    blank1?: string;
    blank2?: string;
    taAnswers?: Record<number, 'true' | 'false'>;
    column1?: string;
    column2?: string;
  }>;
  currentSection: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSectionField: (question: any) => string;
}

/**
 * Check if a question has been answered based on answer type
 */
function isQuestionAnswered(answer: SectionProgressListProps['answers'][string] | undefined): boolean {
  if (!answer) return false;

  // Check all possible answer types
  return !!(
    answer.answer ||
    (answer.msrAnswers && answer.msrAnswers.length > 0) ||
    answer.blank1 ||
    answer.taAnswers ||
    answer.column1
  );
}

export function SectionProgressList({
  sections,
  questions,
  answers,
  currentSection,
  getSectionField,
}: SectionProgressListProps) {
  const { t } = useTranslation();

  // Calculate progress for each section
  const sectionProgress = sections.map(section => {
    const sectionQuestions = questions.filter(q => getSectionField(q) === section);
    const answeredCount = sectionQuestions.filter(q => isQuestionAnswered(answers[q.id])).length;
    const totalCount = sectionQuestions.length;

    return {
      section,
      answered: answeredCount,
      total: totalCount,
      isComplete: answeredCount === totalCount && totalCount > 0,
      isCurrent: section === currentSection,
    };
  });

  // Don't show if no sections
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        {t('takeTest.sectionProgress', 'Section Progress')}
      </h4>
      <div className="space-y-2">
        {sectionProgress.map(({ section, answered, total, isComplete, isCurrent }) => (
          <div
            key={section}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
              isCurrent
                ? 'bg-blue-100 border border-blue-300'
                : isComplete
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-white border border-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={isComplete ? faCheckCircle : faCircle}
                className={`text-sm ${
                  isComplete
                    ? 'text-green-500'
                    : isCurrent
                      ? 'text-blue-400'
                      : 'text-gray-300'
                }`}
              />
              <span className={`text-sm ${isCurrent ? 'font-semibold text-blue-800' : 'text-gray-700'}`}>
                {section}
              </span>
              {isCurrent && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                  {t('takeTest.current', 'Current')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                isComplete
                  ? 'text-green-600'
                  : answered > 0
                    ? 'text-blue-600'
                    : 'text-gray-400'
              }`}>
                {answered}/{total}
              </span>
              {isComplete && (
                <span className="text-xs text-green-600">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
