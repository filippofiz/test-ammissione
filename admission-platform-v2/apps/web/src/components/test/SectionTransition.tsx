/**
 * SectionTransition Component
 *
 * Screens shown between test sections for transitions, pauses, and completion.
 * Includes several variants:
 * - SectionCompleted: Brief transition showing section complete + next section preview
 * - PauseChoice: Lets user choose to take a break or continue
 * - PauseScreen: Mandatory or chosen break with countdown
 * - TestCompleted: Final completion screen
 */

import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowRight, faCoffee, faPause } from '@fortawesome/free-solid-svg-icons';
import { formatTime } from '../hooks/useTestTimer';

/**
 * Section completed transition - brief screen before moving to next section
 */
export interface SectionCompletedProps {
  /** Name of the completed section */
  completedSectionName: string;
  /** Name of the next section */
  nextSectionName: string;
  /** Countdown seconds before auto-continue */
  countdown: number;
  /** Callback when user clicks to continue immediately */
  onContinue: () => void;
  /** Whether the continue action is in progress */
  isLoading?: boolean;
  /** Whether the continue button is disabled */
  disabled?: boolean;
}

export function SectionCompleted({
  completedSectionName,
  nextSectionName,
  countdown,
  onContinue,
  isLoading = false,
  disabled = false,
}: SectionCompletedProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-lg">
        {/* Success icon */}
        <div className="text-6xl mb-6">✅</div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {t('takeTest.sectionCompleted', 'Section Completed!')}
        </h2>

        {/* Completed section name */}
        <p className="text-xl text-gray-700 mb-2">{completedSectionName}</p>
        <p className="text-gray-600 mb-8">
          {t('takeTest.wellDone', 'Well done!')}
        </p>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 mb-6">
          <p className="text-sm uppercase tracking-wide mb-2">
            {t('takeTest.nextSectionIn', 'Next section in')}
          </p>
          <div className="text-6xl font-bold font-mono">{countdown}</div>
          <p className="text-sm mt-2 opacity-90">
            {t('takeTest.secondsRemaining', 'seconds')}
          </p>
        </div>

        {/* Next section preview */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            {t('takeTest.upNext', 'Up Next')}
          </p>
          <p className="text-xl font-bold text-gray-800">{nextSectionName}</p>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          disabled={disabled || isLoading || countdown <= 1}
          className="w-full px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('common.loading', 'Loading...')}
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faArrowRight} />
              {t('takeTest.continueNow', 'Continue Now')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Pause choice screen - user can choose to take a break or continue
 */
export interface PauseChoiceProps {
  /** Name of the completed section */
  completedSectionName: string;
  /** Number of pauses remaining */
  pausesRemaining: number;
  /** Duration of pause in minutes */
  pauseDurationMinutes: number;
  /** Countdown before auto-continue (no pause) */
  countdown: number;
  /** Callback when user chooses to take pause */
  onTakePause: () => void;
  /** Callback when user chooses to skip pause */
  onSkipPause: () => void;
  /** Whether buttons are disabled */
  disabled?: boolean;
}

export function PauseChoice({
  completedSectionName,
  pausesRemaining,
  pauseDurationMinutes,
  countdown,
  onTakePause,
  onSkipPause,
  disabled = false,
}: PauseChoiceProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-lg">
        {/* Icon */}
        <div className="text-6xl mb-6">☕</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {t('takeTest.sectionComplete', 'Section Complete')}
        </h2>

        {/* Completed section */}
        <p className="text-gray-600 mb-6">
          {t('takeTest.completedSection', 'You have completed')}{' '}
          <span className="font-semibold">{completedSectionName}</span>
        </p>

        {/* Auto-continue countdown */}
        <div className="bg-orange-500 text-white rounded-2xl p-6 mb-6">
          <p className="text-sm uppercase tracking-wide mb-2">
            {t('takeTest.autoContinueIn', 'Auto-continue in')}
          </p>
          <div className="text-6xl font-bold font-mono">{countdown}</div>
          <p className="text-sm mt-2 opacity-90">
            {t('takeTest.secondsRemaining', 'seconds')}
          </p>
        </div>

        {/* Pause info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <p className="text-gray-700 mb-2">
            {t('takeTest.pauseQuestion', 'Would you like to take a break?')}
          </p>
          <p className="text-sm text-gray-600">
            {t('takeTest.pausesRemaining', 'Pauses remaining')}:{' '}
            <span className="font-bold text-green-600">{pausesRemaining}</span>
          </p>
          <p className="text-sm text-gray-600">
            {t('takeTest.pauseDuration', 'Pause duration')}:{' '}
            <span className="font-bold">
              {pauseDurationMinutes} {t('common.minutes', 'minutes')}
            </span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={onSkipPause}
            disabled={disabled || countdown <= 1}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowRight} />
            {t('takeTest.continueWithoutPause', 'Continue')}
          </button>
          <button
            onClick={onTakePause}
            disabled={disabled || countdown <= 1}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faCoffee} />
            {t('takeTest.takePause', 'Take Break')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Pause screen - countdown during break
 */
export interface PauseScreenProps {
  /** Name of the section before pause */
  sectionName: string;
  /** Time remaining in seconds */
  timeRemaining: number | null;
  /** Whether this is a mandatory break */
  isMandatory?: boolean;
}

export function PauseScreen({
  sectionName,
  timeRemaining,
  isMandatory = false,
}: PauseScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
        {/* Icon */}
        <div className="text-6xl mb-6 text-green-600">
          <FontAwesomeIcon icon={faPause} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {isMandatory
            ? t('takeTest.mandatoryBreak', 'Mandatory Break')
            : t('takeTest.pauseBreak', 'Break Time')}
        </h2>

        {/* Section info */}
        <p className="text-gray-600 mb-6">
          {t('takeTest.completedSection', 'You have completed')}{' '}
          <span className="font-semibold">{sectionName}</span>
        </p>

        {/* Countdown timer */}
        {timeRemaining !== null && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-8 mb-6">
            <p className="text-sm uppercase tracking-wide mb-2">
              {t('takeTest.timeRemaining', 'Time Remaining')}
            </p>
            <div className="text-6xl font-bold font-mono">
              {formatTime(timeRemaining)}
            </div>
          </div>
        )}

        {/* Relaxation message */}
        <p className="text-sm text-gray-500">
          {t('takeTest.relaxAndRecharge', 'Take a moment to relax and recharge.')}
        </p>
      </div>
    </div>
  );
}

/**
 * Test completed screen - final success screen
 */
export interface TestCompletedProps {
  /** Callback when user clicks to return to dashboard */
  onReturnToDashboard: () => void;
  /** Optional custom message */
  message?: string;
  /** Button text override */
  buttonText?: string;
}

export function TestCompleted({
  onReturnToDashboard,
  message,
  buttonText,
}: TestCompletedProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12">
          {/* Success Icon */}
          <div className="mb-6">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-8xl" />
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {t('takeTest.testComplete', 'Test Complete!')}
          </h2>

          {/* Confirmation message */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
            <p className="text-lg text-gray-700 mb-2">
              ✓ {message || t('takeTest.answersSubmitted', 'Your answers have been successfully submitted')}
            </p>
            <p className="text-sm text-gray-600">
              {t('takeTest.thankYou', 'Thank you for completing the test')}
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={onReturnToDashboard}
            className="px-10 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg rounded-xl font-semibold hover:shadow-xl transition-all"
          >
            {buttonText || t('takeTest.returnToDashboard', 'Return to Dashboard')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Time's Up Modal - shown when test time expires
 */
export interface TimeUpModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback when user clicks submit */
  onSubmit: () => void;
  /** Whether submission is in progress */
  isSubmitting?: boolean;
  /** Number of unanswered questions */
  unansweredCount?: number;
  /** Total questions */
  totalQuestions?: number;
}

export function TimeUpModal({
  isOpen,
  onSubmit,
  isSubmitting = false,
  unansweredCount = 0,
  totalQuestions = 0,
}: TimeUpModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">⏰</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('takeTest.timesUp', "Time's Up!")}
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-4">
          {t('takeTest.timeExpiredMessage', 'Your time has expired. Your test will now be submitted.')}
        </p>

        {/* Unanswered warning */}
        {unansweredCount > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-orange-700">
              {t('takeTest.unansweredWillBeIncorrect', `${unansweredCount} of ${totalQuestions} questions are unanswered and will be marked as incorrect.`)}
            </p>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('takeTest.submitting', 'Submitting...')}
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} />
              {t('takeTest.submitTest', 'Submit Test')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default {
  SectionCompleted,
  PauseChoice,
  PauseScreen,
  TestCompleted,
  TimeUpModal,
};
