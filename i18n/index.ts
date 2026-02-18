import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { normalizeLanguageTag, resources, supportedLanguages } from './constants';
import { getStoredLanguage } from './storage';

export function getDeviceLanguage() {
  const deviceTag = Localization.getLocales()[0]?.languageTag;
  return normalizeLanguageTag(deviceTag);
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'pt-BR',
  supportedLngs: supportedLanguages,
  defaultNS: 'common',
  ns: ['common'],
  interpolation: { escapeValue: false },
  returnNull: false,
});

export async function bootstrapI18n(): Promise<void> {
  const stored = await getStoredLanguage();
  if (stored && stored !== i18n.language) {
    await i18n.changeLanguage(stored);
  }
}

export default i18n;
