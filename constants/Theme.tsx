import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import storage from '@/hooks/useStorage';

type ThemeChoice = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  choice: ThemeChoice;
  colorScheme: 'light' | 'dark';
  setChoice: (c: ThemeChoice) => void;
}

const STORAGE_KEY = 'appThemeChoice';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useSystemColorScheme() ?? 'light';
  const [choice, setChoiceState] = useState<ThemeChoice>('dark');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const saved = await storage.getValue(STORAGE_KEY);
        if (!mounted) return;
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setChoiceState(saved);
        } else {
          // se não houver preferência salva, ativar dark por padrão conforme solicitado
          setChoiceState('dark');
          await storage.saveValue(STORAGE_KEY, 'dark');
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

  const value: ThemeContextValue = {
    choice,
    colorScheme,
    setChoice: (c: ThemeChoice) => setChoiceState(c),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Retorno padrão caso o provedor ainda não esteja montado (evita crashes em hooks)
    return {
      choice: 'dark' as ThemeChoice,
      colorScheme: 'dark' as 'light' | 'dark',
      setChoice: () => {},
    };
  }
  return ctx;
}

export default ThemeProvider;
