import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (languages: 'ITA' | 'ENG' | 'BOTH') => void;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState<'ITA' | 'ENG' | 'BOTH'>('BOTH');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedLanguage);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-dark">Select Languages</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Choose which language(s) to extract from the PDF:
        </p>

        <div className="space-y-3 mb-8">
          {/* Italian Only */}
          <button
            onClick={() => setSelectedLanguage('ITA')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedLanguage === 'ITA'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedLanguage === 'ITA'
                    ? 'border-blue-600'
                    : 'border-gray-300'
                }`}
              >
                {selectedLanguage === 'ITA' && (
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                )}
              </div>
              <div>
                <div className="font-semibold text-brand-dark">🇮🇹 Italian Only</div>
                <div className="text-sm text-gray-600">Extract questions in Italian only</div>
              </div>
            </div>
          </button>

          {/* English Only */}
          <button
            onClick={() => setSelectedLanguage('ENG')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedLanguage === 'ENG'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedLanguage === 'ENG'
                    ? 'border-blue-600'
                    : 'border-gray-300'
                }`}
              >
                {selectedLanguage === 'ENG' && (
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                )}
              </div>
              <div>
                <div className="font-semibold text-brand-dark">🇬🇧 English Only</div>
                <div className="text-sm text-gray-600">Extract questions in English only</div>
              </div>
            </div>
          </button>

          {/* Both Languages */}
          <button
            onClick={() => setSelectedLanguage('BOTH')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedLanguage === 'BOTH'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedLanguage === 'BOTH'
                    ? 'border-blue-600'
                    : 'border-gray-300'
                }`}
              >
                {selectedLanguage === 'BOTH' && (
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                )}
              </div>
              <div>
                <div className="font-semibold text-brand-dark">🇮🇹 🇬🇧 Both Languages</div>
                <div className="text-sm text-gray-600">Extract and translate to both Italian and English</div>
              </div>
            </div>
          </button>
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
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
