/**
 * ExitWarningScreen — 5-second countdown warning before test annulment.
 * Extracted from TakeTestPage (lines 3790-3832).
 */

import { useTranslation } from 'react-i18next';
import { Layout } from '../Layout';

export interface ExitWarningScreenProps {
  exitCountdown: number;
  onConfirmExit: () => void;
  onStayInTest: () => void;
}

export function ExitWarningScreen({ exitCountdown, onConfirmExit, onStayInTest }: ExitWarningScreenProps) {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-lg border-4 border-red-500">
          <div className="text-6xl mb-6">{'\u26A0\uFE0F'}</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            {t('takeTest.exitWarningTitle')}
          </h2>
          <p className="text-gray-700 mb-6">
            {t('takeTest.exitWarningMessage')}
          </p>

          {/* Countdown Timer */}
          <div className="bg-red-600 text-white rounded-2xl p-8 mb-6">
            <p className="text-sm uppercase tracking-wide mb-2">{t('takeTest.testWillBeAnnulledIn')}</p>
            <div className="text-8xl font-bold font-mono">
              {exitCountdown}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onConfirmExit}
              disabled={exitCountdown <= 1}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('takeTest.exitTest')}
            </button>
            <button
              onClick={onStayInTest}
              disabled={exitCountdown <= 1}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('takeTest.stayInTest')}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
