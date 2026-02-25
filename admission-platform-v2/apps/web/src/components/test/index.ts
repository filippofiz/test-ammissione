/**
 * Test-taking components
 *
 * This folder contains shared components for test-taking functionality
 * used by both TakeTestPage and GMATTrainingTestPage.
 *
 * Components:
 * - TestTimer: Unified countdown timer with urgency colors
 * - QuestionRenderer: Universal question type router
 * - QuestionNavigator: Question grid with status indicators
 * - ReviewScreen: Pre-submission review summary
 * - SectionTransition: Between-section pause/transition screens
 * - TestStartScreen: Pre-test welcome screen
 * - SectionSelectionScreen: Drag-and-drop section ordering
 * - TestHeader: Header bar with timer and status indicators
 * - NavigationControls: Prev/Next footer buttons
 * - TestLockedScreen: Locked test screen
 * - TestAnnulledScreen: Proctoring violation screen
 * - ExitWarningScreen: 5-second exit countdown
 */

export { TestTimer, TestTimerCompact, TestTimerLarge } from './TestTimer';
export type { TestTimerProps } from './TestTimer';

export { QuestionRenderer } from './QuestionRenderer';
export type {
  QuestionRendererProps,
  Question,
  QuestionData,
  UnifiedAnswer,
} from './QuestionRenderer';

export { QuestionNavigator, QuestionNavigatorSidebar } from './QuestionNavigator';
export type { QuestionNavigatorProps, QuestionStatus } from './QuestionNavigator';

export { ReviewScreen, ReviewPanel } from './ReviewScreen';
export type { ReviewScreenProps } from './ReviewScreen';

export {
  SectionCompleted,
  PauseChoice,
  PauseScreen,
  TestCompleted,
  TimeUpModal,
} from './SectionTransition';
export type {
  SectionCompletedProps,
  PauseChoiceProps,
  PauseScreenProps,
  TestCompletedProps,
  TimeUpModalProps,
} from './SectionTransition';

export { TestStartScreen } from './TestStartScreen';
export type { TestStartScreenProps } from './TestStartScreen';

export { SectionSelectionScreen } from './SectionSelectionScreen';
export type { SectionSelectionScreenProps } from './SectionSelectionScreen';

export { TestHeader } from './TestHeader';
export type { TestHeaderProps, DeviceDiagnostics } from './TestHeader';

export { NavigationControls } from './NavigationControls';
export type { NavigationControlsProps } from './NavigationControls';

export { TestLockedScreen } from './TestLockedScreen';
export type { TestLockedScreenProps } from './TestLockedScreen';

export { TestAnnulledScreen } from './TestAnnulledScreen';
export type { TestAnnulledScreenProps } from './TestAnnulledScreen';

export { ExitWarningScreen } from './ExitWarningScreen';
export type { ExitWarningScreenProps } from './ExitWarningScreen';
