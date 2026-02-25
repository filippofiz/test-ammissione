/**
 * TestStartScreen — Pre-test welcome screen with start/cancel buttons.
 * Extracted from TakeTestPage (lines 3835-3875).
 */

import { useTranslation } from 'react-i18next';
import { Layout } from '../Layout';
import { PreTestDiagnostics } from '../PreTestDiagnostics';
import { translateTestTrack } from '../../lib/translateTestTrack';

export interface TestStartScreenProps {
  config: {
    test_type: string;
    track_type: string;
    test_start_message?: string;
    messaggio_iniziale_test?: string;
  };
  onCancel: () => void;
  onStart: () => void;
  onDiagnosticsComplete: (results: any) => void;
}

export function TestStartScreen({ config, onCancel, onStart, onDiagnosticsComplete }: TestStartScreenProps) {
  const { t, i18n } = useTranslation();

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-6">
            {config.test_type} - {translateTestTrack(config.track_type, t)}
          </h1>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <pre className="whitespace-pre-wrap font-sans text-gray-800">
              {(i18n.language === 'en' ? config.test_start_message : config.messaggio_iniziale_test) || t('takeTest.welcome') || 'Welcome to the test!'}
            </pre>
          </div>

          {/* Pre-test System Diagnostics */}
          <PreTestDiagnostics
            supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
            supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
            onDiagnosticsComplete={onDiagnosticsComplete}
          />

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('takeTest.cancel')}
            </button>
            <button
              onClick={onStart}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              {t('takeTest.startTest')}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
