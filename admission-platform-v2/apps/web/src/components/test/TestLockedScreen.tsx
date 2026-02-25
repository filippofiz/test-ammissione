/**
 * TestLockedScreen — Displayed when a completed test is locked.
 * Extracted from TakeTestPage (lines 3724-3751).
 */

import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../Layout';

export interface TestLockedScreenProps {
  onBackToHome: () => void;
}

export function TestLockedScreen({ onBackToHome }: TestLockedScreenProps) {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faLock} className="text-5xl text-red-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t('takeTest.testLocked') || 'Test Locked'}
          </h2>
          <p className="text-gray-700 mb-6">
            {t('takeTest.testLockedMessage') || 'This test has been completed and is now locked. Contact your tutor to unlock it if you need to retake the test.'}
          </p>
          <button
            onClick={onBackToHome}
            className="px-8 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
          >
            {t('takeTest.backToHome') || 'Back to Home'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
