import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './locales/vi.json';
import en from './locales/en.json';
import { useUIStore } from '../stores';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en }
    },
    lng: 'vi', // Fallback to 'vi', will be updated by client
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  });

// Subscribe to store changes only on client
const language = useUIStore.getState().language;
if (language) {
  i18n.changeLanguage(language);
}
useUIStore.subscribe((state, prevState) => {
  if (state.language !== prevState.language) {
    i18n.changeLanguage(state.language);
  }
});

export default i18n;
