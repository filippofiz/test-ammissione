import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

interface SubmittingOverlayProps {
  visible: boolean;
}

export default function SubmittingOverlay({ visible }: SubmittingOverlayProps) {
  const { t } = useTranslation();
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
        <FontAwesomeIcon icon={faClock} className="text-6xl text-brand-green animate-spin mb-4" />
        <h3 className="text-xl font-bold text-brand-dark mb-2">
          {t('takeTest.submittingTest') || 'Submitting Test...'}
        </h3>
        <p className="text-gray-600">
          {t('takeTest.pleaseWait') || 'Please wait while we save your answers...'}
        </p>
      </div>
    </div>
  );
}
