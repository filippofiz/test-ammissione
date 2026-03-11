import { useTranslation } from 'react-i18next';

interface ChangeBlockedToastProps {
  visible: boolean;
}

export default function ChangeBlockedToast({ visible }: ChangeBlockedToastProps) {
  const { t } = useTranslation();
  if (!visible) return null;
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="font-semibold">{t('takeTest.maxChangesReached') || 'Maximum changes reached'}</p>
          <p className="text-sm">
            {t('takeTest.cannotChangeMore') || 'You cannot change any more answers in this section'}
          </p>
        </div>
      </div>
    </div>
  );
}
