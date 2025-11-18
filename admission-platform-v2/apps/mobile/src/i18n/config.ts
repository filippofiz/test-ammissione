import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import it from './locales/it.json';

// Initialize i18n
const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem('language');

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        it: { translation: it },
      },
      lng: savedLanguage || 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;
