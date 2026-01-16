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
import TestResultsPage from './pages/TestResultsPage';
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
import GMATPreparationPage from './pages/GMATPreparationPage';
import GMATMaterialsManagementPage from './pages/GMATMaterialsManagementPage';
import GMATQuestionAllocationPage from './pages/GMATQuestionAllocationPage';
import { ProtectedRoute } from './components/ProtectedRoute';

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
              <TestResultsPage />
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
              <TestResultsPage />
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
