import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLanguage } from '@fortawesome/free-solid-svg-icons';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (languages: 'ITA' | 'ENG' | 'BOTH', useGoogleTranslate?: boolean) => void;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [useGoogleTranslate, setUseGoogleTranslate] = React.useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Always use BOTH languages, with Google Translate toggle
    console.log(`🔵 LanguageSelectionModal: Confirming with useGoogleTranslate = ${useGoogleTranslate}`);
    onConfirm('BOTH', useGoogleTranslate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-dark">Language Extraction Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Configure language extraction settings:
        </p>

        <div className="mb-8">
          {/* Info box */}
          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="font-semibold text-blue-900 mb-2">🇮🇹 🇬🇧 Extracting Both Languages</div>
            <div className="text-sm text-blue-700">
              The system will always try to extract both Italian and English from the PDF.
              Use the toggle below to control translation behavior.
            </div>
          </div>

          {/* Google Translate Toggle */}
          <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useGoogleTranslate}
                onChange={(e) => setUseGoogleTranslate(e.target.checked)}
                className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-semibold text-purple-900 mb-2">
                  <FontAwesomeIcon icon={faLanguage} />
                  <span>Use Google Translate API</span>
                </div>
                <div className="text-sm text-purple-700 space-y-2">
                  {useGoogleTranslate ? (
                    <>
                      <div>
                        <strong>✅ Enabled:</strong> Will use Google Translate API to automatically translate the missing language.
                      </div>
                      <div className="pl-4 border-l-2 border-purple-300">
                        <strong>Example:</strong> If PDF is in Italian only, it will extract Italian and auto-translate to English.
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <strong>❌ Disabled:</strong> Will only extract languages that exist in the PDF.
                      </div>
                      <div className="pl-4 border-l-2 border-purple-300">
                        <strong>Example:</strong> If PDF is in Italian only, you'll only get Italian (no English).
                      </div>
                    </>
                  )}
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Start Extraction
          </button>
        </div>
      </div>
    </div>
  );
};
