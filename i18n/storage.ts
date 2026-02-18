import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { supportedLanguages, type SupportedLanguage } from './constants';

const STORAGE_KEY = 'appLanguage';
const webStorage = new Map<string, string>();

function isSupportedLanguage(value: string): value is SupportedLanguage {
  return supportedLanguages.includes(value as SupportedLanguage);
}

async function setValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStorage.set(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webStorage.get(key) ?? null;
  }

  return await SecureStore.getItemAsync(key);
}

async function deleteValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStorage.delete(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function setStoredLanguage(language: SupportedLanguage): Promise<void> {
  await setValue(STORAGE_KEY, language);
}

export async function getStoredLanguage(): Promise<SupportedLanguage | null> {
  const stored = await getValue(STORAGE_KEY);
  if (!stored) return null;
  return isSupportedLanguage(stored) ? stored : null;
}

export async function clearStoredLanguage(): Promise<void> {
  await deleteValue(STORAGE_KEY);
}
