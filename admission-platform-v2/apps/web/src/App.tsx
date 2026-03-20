import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { PlatformChoicePage } from './pages/PlatformChoicePage';
import StudentHomePage from './pages/StudentHomePage';
import TutorSelectionPage from './pages/TutorSelectionPage';
import TutorStudentsPage from './pages/TutorStudentsPage';
import StudentProfilePage from './pages/StudentProfilePage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import StudentTestsPage from './pages/StudentTestsPage';
// TestResultsPage and GMATAssessmentResultsPage replaced by UnifiedResultsPage
import UnifiedResultsPage from './pages/UnifiedResultsPage';
import TestManagementPage from './pages/TestManagementPage';
import TestStructurePage from './pages/TestStructurePage';
import ManageSectionOrderPage from './pages/ManageSectionOrderPage';
import TestTypeSelectionPage from './pages/TestTypeSelectionPage';
import TestTrackConfigPage from './pages/TestTrackConfigPage';
import AlgorithmConfigPage from './pages/AlgorithmConfigPage';
import TakeTestPage from './pages/TakeTestPage';
import TestRunnerPage from './pages/TestRunnerPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PDFToLatexConverterPage from './pages/PDFToLatexConverterPage';
import ReviewQuestionsPage from './pages/ReviewQuestionsPage';
import AdminMigrateAnswersPage from './pages/AdminMigrateAnswersPage';
import ManageAccountsPage from './pages/ManageAccountsPage';
import AIValidationDashboard from './pages/AIValidationDashboard';
import CloneTestsPage from './pages/CloneTestsPage';
import PoolReviewPage from './pages/PoolReviewPage';
import GMATPreparationPage from './pages/GMATPreparationPage';
import GMATMaterialsManagementPage from './pages/GMATMaterialsManagementPage';
import GMATMaterialPage from './pages/GMATMaterialPage';
import GMATQuestionAllocationPage from './pages/GMATQuestionAllocationPage';
import GMATConfigPage from './pages/GMATConfigPage';
// GMATAssessmentResultsPage: kept for rollback, replaced by UnifiedResultsPage
import GMATTrainingTestPage from './pages/GMATTrainingTestPage';
import GMATPlacementWrapper from './pages/GMATPlacementWrapper';
import GMATSectionAssessmentWrapper from './pages/GMATSectionAssessmentWrapper';
import GMATSimulationWrapper from './pages/GMATSimulationWrapper';
import GMATSimulationPage from './pages/GMATSimulationPage';
import SemestreFiltroPage from './pages/SemestreFiltroPage';
import TheoryManagementPage from './pages/TheoryManagementPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route
          path="/error-preview"
          element={
            <ErrorPage
              previewState={{
                type: 'crash',
                errorName: 'TypeError',
                message: 'Cannot read properties of undefined (reading "id")',
                componentStack: '    at TakeTestPage (TakeTestPage.tsx:123)\n    at ProtectedRoute (ProtectedRoute.tsx:45)\n    at Routes\n    at App',
                timestamp: new Date().toISOString(),
              }}
            />
          }
        />
        <Route path="*" element={<ErrorPage />} />

        {/* Protected routes - require authentication */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/platform-choice"
          element={
            <ProtectedRoute>
              <PlatformChoicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role-selection"
          element={
            <ProtectedRoute>
              <RoleSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/home"
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <StudentHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/test-results/:assignmentId"
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <UnifiedResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/gmat-preparation"
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <GMATPreparationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/take-test/gmat-training/:templateId"
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <GMATTrainingTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/take-test/gmat-section-assessment/:section"
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <GMATSectionAssessmentWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/take-test/gmat-simulation"
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <GMATSimulationWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/take-test/gmat-placement-assessment"
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <GMATPlacementWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/take-test/gmat-simulation"
          element={
            <ProtectedRoute requiredRoles={['STUDENT', 'TUTOR', 'ADMIN']}>
              <GMATSimulationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/gmat-results/:assessmentId"
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <UnifiedResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/gmat-materials"
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <GMATMaterialPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <TutorSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/students"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <TutorStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/student/:studentId/profile"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/student/:studentId/gmat-materials"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <GMATMaterialsManagementPage />
            </ProtectedRoute>
          }
        />
        {/* Tutor view of student's GMAT materials - view mode with lock/unlock */}
        <Route
          path="/tutor/student/:studentId/gmat-materials-view"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <GMATMaterialPage />
            </ProtectedRoute>
          }
        />
        {/* Tutor view of student's GMAT preparation - uses same page as student */}
        <Route
          path="/tutor/student/:studentId/gmat-preparation"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <GMATPreparationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/analytics"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <AnalyticsDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/student/:studentId/tests/:testType"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <StudentTestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/test-results/:assignmentId"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <UnifiedResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/take-test/gmat-section-assessment/:section"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <GMATSectionAssessmentWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/take-test/gmat-simulation"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <GMATSimulationWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/take-test/gmat-placement-assessment"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <GMATPlacementWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/gmat-results/:assessmentId"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <UnifiedResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/test-management"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <TestManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/test-structure"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <TestStructurePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/manage-section-order"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <ManageSectionOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/select-test-type"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <TestTypeSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/gmat-question-allocation"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <GMATQuestionAllocationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/gmat-config"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <GMATConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/theory-management"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <TheoryManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/test-track-config/:testType"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <TestTrackConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/algorithm-config"
          element={
            <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
              <AlgorithmConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/test-runner"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <TestRunnerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pdf-to-latex"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <PDFToLatexConverterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/review-questions"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <ReviewQuestionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/migrate-answers"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <AdminMigrateAnswersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-accounts"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <ManageAccountsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ai-validation"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <AIValidationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clone-tests"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <CloneTestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pool-review"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <PoolReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/semestre-filtro/:assignmentId"
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <SemestreFiltroPage />
            </ProtectedRoute>
          }
        />
        {/* GMAT assessment fork — no assignmentId, identified by type+section */}
        <Route
          path="/take-test/gmat/:assessmentType/:section"
          element={
            <ProtectedRoute requiredRoles={['STUDENT', 'TUTOR', 'ADMIN']}>
              <TakeTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/take-test/gmat/:assessmentType"
          element={
            <ProtectedRoute requiredRoles={['STUDENT', 'TUTOR', 'ADMIN']}>
              <TakeTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/take-test/:assignmentId"
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <TakeTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preview-test/:testId/:startQuestionNumber"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <TakeTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
