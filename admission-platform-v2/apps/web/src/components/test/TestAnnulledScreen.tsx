/**
 * TestAnnulledScreen — Displayed when a test is annulled due to proctoring violation.
 * Extracted from TakeTestPage (lines 3753-3788).
 */

import { useTranslation } from 'react-i18next';
import { Layout } from '../Layout';

export interface TestAnnulledScreenProps {
  multipleScreensDetected: boolean;
  onBackToSelection: () => void;
}

export function TestAnnulledScreen({ multipleScreensDetected, onBackToSelection }: TestAnnulledScreenProps) {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="text-6xl mb-6">{'\u26A0\uFE0F'}</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            {t('takeTest.testAnnulled')}
          </h2>
          <p className="text-gray-700 mb-6">
            {multipleScreensDetected
              ? t('takeTest.multipleScreensDetected')
              : t('takeTest.fullscreenExitDetected')}
          </p>
          <p className="text-gray-600 mb-8">
            {t('takeTest.contactInstructor')}
          </p>
          <button
            onClick={onBackToSelection}
            className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all"
          >
            {t('takeTest.backToTestSelection')}
          </button>
        </div>
      </div>
    </Layout>
  );
}
