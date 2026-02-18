import { useCallback, useEffect, useState } from 'react';

import i18n, { getDeviceLanguage } from '@/i18n';
import { clearStoredLanguage, setStoredLanguage } from '@/i18n/storage';
import type { SupportedLanguage } from '@/i18n/constants';

export function useAppLanguage() {
  const [language, setLanguage] = useState<SupportedLanguage>(i18n.language as SupportedLanguage);

  useEffect(() => {
    const onLanguageChanged = (lng: string) => setLanguage(lng as SupportedLanguage);
    i18n.on('languageChanged', onLanguageChanged);
    return () => i18n.off('languageChanged', onLanguageChanged);
  }, []);

  const changeLanguage = useCallback(async (lng: SupportedLanguage) => {
    await i18n.changeLanguage(lng);
    await setStoredLanguage(lng);
  }, []);

  const resetToDeviceLanguage = useCallback(async () => {
    const deviceLanguage = getDeviceLanguage();
    await i18n.changeLanguage(deviceLanguage);
    await clearStoredLanguage();
  }, []);

  return { language, changeLanguage, resetToDeviceLanguage };
}
