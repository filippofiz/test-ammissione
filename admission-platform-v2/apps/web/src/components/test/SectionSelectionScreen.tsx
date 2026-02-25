/**
 * SectionSelectionScreen — Drag-and-drop section order selection for user_choice mode.
 * Extracted from TakeTestPage (lines 3877-3963).
 */

import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../Layout';

export interface SectionSelectionScreenProps {
  config: {
    questions_per_section?: Record<string, number>;
    time_per_section: Record<string, number> | null;
  };
  sections: string[];
  draggedSectionIndex: number | null;
  hasSpecialNeeds: boolean;
  /** Fallback question count per section when questions_per_section is not set */
  questionCountBySection: Record<string, number>;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onMoveSectionUp: (index: number) => void;
  onMoveSectionDown: (index: number) => void;
  onBack: () => void;
  onBegin: () => void;
}

export function SectionSelectionScreen({
  config,
  sections,
  draggedSectionIndex,
  hasSpecialNeeds,
  questionCountBySection,
  onDragStart,
  onDragOver,
  onDragEnd,
  onMoveSectionUp,
  onMoveSectionDown,
  onBack,
  onBegin,
}: SectionSelectionScreenProps) {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-4">
            {t('takeTest.chooseSectionOrder')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('takeTest.chooseSectionOrderDesc')}
          </p>

          {/* Section List */}
          <div className="space-y-3 mb-8">
            {sections.map((section, index) => (
              <div
                key={`${section}-${index}`}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
                onDrop={onDragEnd}
                className={`flex items-center gap-3 border-2 rounded-xl p-4 transition-all cursor-move ${
                  draggedSectionIndex === index
                    ? 'border-brand-green bg-green-50 opacity-50 scale-95'
                    : 'bg-gray-50 border-gray-200 hover:border-brand-green hover:shadow-md'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => onMoveSectionUp(index)}
                    disabled={index === 0}
                    className="text-gray-500 hover:text-brand-green disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} rotation={90} />
                  </button>
                  <button
                    onClick={() => onMoveSectionDown(index)}
                    disabled={index === sections.length - 1}
                    className="text-gray-500 hover:text-brand-green disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <FontAwesomeIcon icon={faArrowRight} rotation={90} />
                  </button>
                </div>

                <div className="flex-shrink-0 w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{section}</div>
                  <div className="text-sm text-gray-500">
                    {config?.questions_per_section?.[section] || questionCountBySection[section] || 0} {t('takeTest.questions')}
                    {config.time_per_section?.[section] && (
                      <> • {hasSpecialNeeds ? Math.round(config.time_per_section[section] * 1.3) : config.time_per_section[section]} {t('common.minutes')}</>
                    )}
                  </div>
                </div>

                <FontAwesomeIcon icon={faGripVertical} className="text-gray-400 cursor-grab active:cursor-grabbing" />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('common.back')}
            </button>
            <button
              onClick={onBegin}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              {t('takeTest.beginTest')}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
