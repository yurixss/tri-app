import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import storage from '@/hooks/useStorage';
import Colors from './Colors';

type ThemeChoice = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  choice: ThemeChoice;
  colorScheme: 'light' | 'dark';
  setChoice: (c: ThemeChoice) => void;
  tint: string;
  text: string;
  background: string;
  cardBackground: string;
  border: string;
  destructive: string;
}

const STORAGE_KEY = 'appThemeChoice';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useSystemColorScheme() ?? 'light';
  const [choice, setChoiceState] = useState<ThemeChoice>('light');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const saved = await storage.getValue(STORAGE_KEY);
        if (!mounted) return;
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setChoiceState(saved);
        } else {
          // se não houver preferência salva, ativar light por padrão conforme solicitado
          setChoiceState('light');
          await storage.saveValue(STORAGE_KEY, 'light');
        }
      } catch (e) {
        console.warn('Failed to load theme choice', e);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // persist choice sempre que mudar
    async function persist() {
      try {
        await storage.saveValue(STORAGE_KEY, choice);
      } catch (e) {
        console.warn('Failed to save theme choice', e);
      }
    }
    persist();
  }, [choice]);

  const colorScheme: 'light' | 'dark' = choice === 'system' ? (system === 'dark' ? 'dark' : 'light') : choice;
  const colors = Colors[colorScheme];

  const value: ThemeContextValue = {
    choice,
    colorScheme,
    setChoice: (c: ThemeChoice) => setChoiceState(c),
    tint: colors.tint,
    text: colors.text,
    background: colors.background,
    cardBackground: colors.cardBackground,
    border: colors.border,
    destructive: colors.destructive,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Retorno padrão caso o provedor ainda não esteja montado (evita crashes em hooks)
    return {
      choice: 'light' as ThemeChoice,
      colorScheme: 'light' as 'light' | 'dark',
      setChoice: () => {},
      tint: Colors.light.tint,
      text: Colors.light.text,
      background: Colors.light.background,
      cardBackground: Colors.light.cardBackground,
      border: Colors.light.border,
      destructive: Colors.light.destructive,
    };
  }
  return ctx;
}

export default ThemeProvider;
