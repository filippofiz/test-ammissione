import { useTranslation } from 'react-i18next';

interface AnswerRequiredModalProps {
  visible: boolean;
  isPartialAnswer: boolean;
  onClose: () => void;
}

export default function AnswerRequiredModal({ visible, isPartialAnswer, onClose }: AnswerRequiredModalProps) {
  const { t } = useTranslation();
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-600 mb-4">
          {t('takeTest.answerRequired')}
        </h3>
        <p className="text-gray-700 mb-6">
          {isPartialAnswer
            ? t('takeTest.mustCompleteAllParts')
            : t('takeTest.mustAnswerQuestion')
          }
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
}
