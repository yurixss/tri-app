import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';

export const supportedLanguages = ['pt-BR', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const resources = {
  'pt-BR': { common: ptBR },
  en: { common: en },
} as const;

export function normalizeLanguageTag(tag?: string): SupportedLanguage {
  if (!tag) return 'pt-BR';
  const lower = tag.toLowerCase();
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('pt')) return 'pt-BR';
  return 'pt-BR';
}
