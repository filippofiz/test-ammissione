/**
 * TestHeader — Header bar during test-taking with timer, section name,
 * question counter, saving indicator, and mode-specific controls.
 * Extracted from TakeTestPage (lines 4238-4391).
 */

import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faClock } from '@fortawesome/free-solid-svg-icons';
import { formatTime } from '../hooks/useTestTimer';
import { CalculatorButton, type CalculatorType } from '@/components/Calculator';

export interface DeviceDiagnostics {
  overall: string;
  connection: { status: string; value?: number };
  performance: { status: string; value?: number };
}

export interface TestHeaderProps {
  // Section info
  currentSection: string;
  currentQuestionIndex: number;
  sectionQuestionLimit: number;
  formatSectionName: (name: string) => string;

  // Config
  sectionOrderMode?: string;
  maxAnswerChanges?: number;

  // Timer
  timeRemaining: number | null;

  // Current question
  currentQuestionSection?: string;

  // Status indicators
  isSaving: boolean;
  saveError: string | null;
  deviceDiagnostics: DeviceDiagnostics | null;

  // Review mode
  isInReviewMode: boolean;
  answerChangesUsed: number;

  // Section navigation
  currentSectionIndex: number;
  expectedTotalSections: number;

  // Preview mode
  isPreviewMode: boolean;
  previewTestId?: string | null;
  previewStartQuestion?: number;
  currentQuestionNumber?: number;
  testLanguage: string;
  onExitPreview: () => void;
  onToggleLanguage: () => void;

  // Guided mode
  isGuidedMode: boolean;
  guidedTimed: boolean;
  showCorrectAnswers: boolean;
  onToggleCorrectAnswers: () => void;

  // Multi-question page
  questionsPerPage?: number;

  // Calculator
  calculatorType?: CalculatorType;
  onToggleCalculator?: () => void;
}

export function TestHeader({
  currentSection,
  currentQuestionIndex,
  sectionQuestionLimit,
  formatSectionName,
  sectionOrderMode,
  maxAnswerChanges,
  timeRemaining,
  currentQuestionSection,
  isSaving,
  saveError,
  deviceDiagnostics,
  isInReviewMode,
  answerChangesUsed,
  currentSectionIndex,
  expectedTotalSections,
  isPreviewMode,
  testLanguage,
  onExitPreview,
  onToggleLanguage,
  isGuidedMode,
  guidedTimed,
  showCorrectAnswers,
  onToggleCorrectAnswers,
  questionsPerPage,
  calculatorType,
  onToggleCalculator,
}: TestHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Preview Mode Exit Button */}
        {isPreviewMode && (
          <>
            <button
              onClick={onExitPreview}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center gap-2"
              title="Exit preview and return to review page"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Exit Preview
            </button>
            {/* Language Toggle in Preview */}
            <button
              onClick={onToggleLanguage}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm"
              title="Toggle language"
            >
              {testLanguage === 'it' ? '\u{1F1EE}\u{1F1F9} \u2192 \u{1F1EC}\u{1F1E7}' : '\u{1F1EC}\u{1F1E7} \u2192 \u{1F1EE}\u{1F1F9}'}
            </button>
          </>
        )}
        <div>
          <h2 className="text-xl font-bold text-brand-dark">
            {isPreviewMode && '\u{1F50D} PREVIEW MODE - '}
            {sectionOrderMode === 'no_sections'
              ? (currentQuestionSection ? formatSectionName(currentQuestionSection) : `Domanda ${currentQuestionIndex + 1}`)
              : formatSectionName(currentSection)
            }
          </h2>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-600">
            {t('takeTest.question')} {currentQuestionIndex + 1} {t('takeTest.of')} {sectionQuestionLimit}
          </p>
          {isSaving && (
            <span className="text-xs text-gray-500 italic flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          )}
          {saveError && (
            saveError.includes('internet') ? (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-red-600 text-white px-8 py-6 rounded-xl shadow-2xl text-center max-w-md">
                <div className="text-5xl mb-4">{'\u26A0\uFE0F'}</div>
                <div className="text-2xl font-bold mb-2">No Internet Connection</div>
                <div className="text-lg">Cannot proceed until connection is restored.</div>
              </div>
            ) : saveError.includes('online') ? (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-green-600 text-white px-8 py-6 rounded-xl shadow-2xl text-center max-w-md">
                <div className="text-5xl mb-4">{'\u2705'}</div>
                <div className="text-2xl font-bold mb-2">Sei di nuovo online</div>
                <div className="text-lg">Connessione ripristinata.</div>
              </div>
            ) : saveError.includes('lenta') ? (
              <span className="text-sm text-yellow-600 font-semibold flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                {'\u{1F422}'} Connessione lenta
              </span>
            ) : (
              <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                {'\u26A0\uFE0F'} {saveError}
              </span>
            )
          )}
          {/* Device Diagnostics Status from pre-test check */}
          {deviceDiagnostics && deviceDiagnostics.overall !== 'ready' && !saveError && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
              deviceDiagnostics.overall === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {deviceDiagnostics.connection.status !== 'good' && (
                <span title={`Latency: ${deviceDiagnostics.connection.value}ms`}>
                  {'\u{1F310}'} {deviceDiagnostics.connection.status === 'error' ? 'Poor connection' : 'Slow connection'}
                </span>
              )}
              {deviceDiagnostics.connection.status !== 'good' && deviceDiagnostics.performance.status !== 'good' && ' | '}
              {deviceDiagnostics.performance.status !== 'good' && (
                <span title={`Benchmark: ${deviceDiagnostics.performance.value}ms`}>
                  {'\u{1F5A5}\uFE0F'} {deviceDiagnostics.performance.status === 'error' ? 'Slow device' : 'Slow device'}
                </span>
              )}
              <span className="ml-1">{'\u2014'} you might experience delays</span>
            </span>
          )}
          {/* Review Mode Indicator with Changes Counter */}
          {isInReviewMode && maxAnswerChanges !== undefined && (
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              answerChangesUsed >= (maxAnswerChanges ?? 0)
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {'\u{1F4DD}'} {t('takeTest.changesUsed')}: {answerChangesUsed}/{maxAnswerChanges}
            </span>
          )}
        </div>
        {/* Debug info for testing - Only show in adaptive mode */}
        {/* Hidden for production - uncomment to debug adaptive algorithm
        {config?.adaptivity_mode === 'adaptive' && (
          <div className="flex gap-4 mt-1 text-xs">
            <span className={`font-semibold ${currentQuestion?.is_base ? 'text-blue-600' : 'text-purple-600'}`}>
              {currentQuestion?.is_base ? '\u{1F535} BASELINE' : '\u{1F7E3} ADAPTIVE'}
            </span>
          </div>
        )}
        */}
        </div>
      </div>

      {/* Center: Questions per page indicator */}
      {questionsPerPage && questionsPerPage > 1 && (
        <div className="flex items-center justify-center">
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-bold text-lg">
            La pagina contiene {questionsPerPage} domande
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Calculator Button */}
        {calculatorType && calculatorType !== 'none' && onToggleCalculator && (
          <CalculatorButton
            onClick={onToggleCalculator}
            calculatorType={calculatorType}
          />
        )}
      <div className="flex flex-col items-end gap-1">
        {/* Timer */}
        {timeRemaining !== null && (
          <div className="flex items-center gap-2 text-lg">
            <FontAwesomeIcon icon={faClock} className="text-brand-green" />
            <span className={`font-mono font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-800'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
        {/* Section indicator below timer */}
        {expectedTotalSections > 0 && (
          <div className="text-sm text-gray-600 font-medium">
            {t('takeTest.section')} {currentSectionIndex + 1} {t('takeTest.of')} {expectedTotalSections}
          </div>
        )}
      </div>
      </div>
      {/* Guided Mode Indicator */}
      {isGuidedMode && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
            <span>{'\u{1F393}'}</span>
            <span>{t('takeTest.guidedMode', 'Guided Mode')}</span>
            {!guidedTimed && <span className="text-purple-500">{'\u2022'} {t('takeTest.noTimeLimit', 'No time limit')}</span>}
          </div>
          {/* Toggle Show/Hide Answers */}
          <button
            onClick={onToggleCorrectAnswers}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
              showCorrectAnswers
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            {showCorrectAnswers ? '\u{1F441}\uFE0F ' + t('takeTest.hideAnswers', 'Hide Answers') : '\u{1F441}\uFE0F ' + t('takeTest.showAnswers', 'Show Answers')}
          </button>
        </div>
      )}
    </div>
  );
}
