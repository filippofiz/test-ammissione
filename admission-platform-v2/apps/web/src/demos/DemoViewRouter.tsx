import { useParams, useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const views: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'results-score': lazy(() => import('./views/ResultsScoreDemo')),
  'results-time': lazy(() => import('./views/ResultsTimeDemo')),
  'results-questions': lazy(() => import('./views/ResultsQuestionsDemo')),
  'test-answer': lazy(() => import('./views/TakeTestAnswerDemo')),
  'test-nav': lazy(() => import('./views/TakeTestNavDemo')),
  'test-submit': lazy(() => import('./views/TakeTestSubmitDemo')),
  'student-dashboard': lazy(() => import('./views/StudentDashboardDemo')),
  'student-unlock': lazy(() => import('./views/StudentUnlockDemo')),
  'analytics-overview': lazy(() => import('./views/AnalyticsOverviewDemo')),
  'analytics-deepdive': lazy(() => import('./views/AnalyticsDeepDiveDemo')),
  'gmat-score': lazy(() => import('./views/GMATScoreDemo')),
  'gmat-prep': lazy(() => import('./views/GMATPrepDemo')),
  'question-gallery': lazy(() => import('./views/QuestionGalleryDemo')),
  'ai-validation': lazy(() => import('./views/AIValidationDemo')),
  // Exam Simulations
  'sim-tolc-i': lazy(() => import('./views/SimTolcIDemo')),
  'sim-tolc-med': lazy(() => import('./views/SimTolcMedDemo')),
  'sim-tolc-e': lazy(() => import('./views/SimTolcEDemo')),
  'sim-gmat': lazy(() => import('./views/SimGmatDemo')),
  'sim-sat': lazy(() => import('./views/SimSatDemo')),
  // Test Prep
  'prep-comparison': lazy(() => import('./views/PrepComparisonDemo')),
  'prep-report': lazy(() => import('./views/PrepReportDemo')),
};

export default function DemoViewRouter() {
  const { demoId } = useParams<{ demoId: string }>();
  const navigate = useNavigate();

  const ViewComponent = demoId ? views[demoId] : null;

  if (!ViewComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Demo not found</h2>
          <p className="text-gray-500 mb-4">The demo "{demoId}" doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/demo-showcase')}
            className="px-6 py-2 bg-[#00a666] text-white font-medium rounded-xl hover:bg-[#008855] transition-colors"
          >
            Back to Showcase
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#00a666] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading demo...</p>
          </div>
        </div>
      }
    >
      {/* Back button — top-left corner, outside the browser frame */}
      <div className="fixed top-3 left-3 z-[9997]">
        <button
          onClick={() => navigate('/admin/demo-showcase')}
          className="bg-gray-900/70 backdrop-blur-sm text-white/80 hover:text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-900/90 transition-all flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
      <ViewComponent />
    </Suspense>
  );
}
