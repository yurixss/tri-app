/**
 * useStoreAnalytics — Tracking de Interações da Loja
 *
 * Persiste eventos em AsyncStorage para análise interna.
 * Sem dependência de serviço externo — pronto para integrar
 * analytics real (Amplitude, Mixpanel) quando necessário.
 */

import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AnalyticsEntry, AnalyticsEvent, ProblemTag, AthleteLevel } from '@/types/store';

const STORAGE_KEY = 'store_analytics';
const MAX_ENTRIES = 500;

// ─── Low-level storage ───────────────────────────────────────────────

const webStorage = new Map<string, string>();

async function saveValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStorage.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webStorage.get(key) || null;
  }
  return await SecureStore.getItemAsync(key);
}

// ─── Analytics helpers ───────────────────────────────────────────────

async function getEntries(): Promise<AnalyticsEntry[]> {
  const data = await getValue(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as AnalyticsEntry[];
  } catch {
    return [];
  }
}

async function appendEntry(entry: AnalyticsEntry): Promise<void> {
  const entries = await getEntries();
  entries.push(entry);
  // Trim old entries to prevent storage bloat
  const trimmed = entries.slice(-MAX_ENTRIES);
  await saveValue(STORAGE_KEY, JSON.stringify(trimmed));
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useStoreAnalytics() {
  const [stats, setStats] = useState<{
    totalClicks: number;
    topProducts: { id: string; count: number }[];
    topCategories: { category: string; count: number }[];
    topProblems: { problem: string; count: number }[];
  } | null>(null);

  const trackEvent = useCallback(
    async (
      event: AnalyticsEvent,
      data?: {
        productId?: string;
        category?: string;
        problemTag?: ProblemTag;
        athleteLevel?: AthleteLevel;
        metadata?: Record<string, string>;
      }
    ) => {
      const entry: AnalyticsEntry = {
        event,
        productId: data?.productId,
        category: data?.category,
        problemTag: data?.problemTag,
        athleteLevel: data?.athleteLevel,
        timestamp: new Date().toISOString(),
        metadata: data?.metadata,
      };
      await appendEntry(entry);
    },
    []
  );

  const trackProductClick = useCallback(
    (productId: string, category: string) => {
      return trackEvent('product_click', { productId, category });
    },
    [trackEvent]
  );

  const trackAffiliateLinkOpened = useCallback(
    (productId: string, category: string) => {
      return trackEvent('affiliate_link_opened', { productId, category });
    },
    [trackEvent]
  );

  const trackProblemSelected = useCallback(
    (problemTag: ProblemTag) => {
      return trackEvent('problem_selected', { problemTag });
    },
    [trackEvent]
  );

  const trackKitGenerated = useCallback(
    (metadata: Record<string, string>) => {
      return trackEvent('kit_generated', { metadata });
    },
    [trackEvent]
  );

  const loadStats = useCallback(async () => {
    const entries = await getEntries();

    const productClicks = entries.filter(
      e => e.event === 'product_click' || e.event === 'affiliate_link_opened'
    );

    // Count by product
    const productMap = new Map<string, number>();
    for (const e of productClicks) {
      if (e.productId) {
        productMap.set(e.productId, (productMap.get(e.productId) ?? 0) + 1);
      }
    }
    const topProducts = Array.from(productMap.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count by category
    const categoryMap = new Map<string, number>();
    for (const e of productClicks) {
      if (e.category) {
        categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + 1);
      }
    }
    const topCategories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Count by problem
    const problemClicks = entries.filter(e => e.event === 'problem_selected');
    const problemMap = new Map<string, number>();
    for (const e of problemClicks) {
      if (e.problemTag) {
        problemMap.set(e.problemTag, (problemMap.get(e.problemTag) ?? 0) + 1);
      }
    }
    const topProblems = Array.from(problemMap.entries())
      .map(([problem, count]) => ({ problem, count }))
      .sort((a, b) => b.count - a.count);

    setStats({
      totalClicks: productClicks.length,
      topProducts,
      topCategories,
      topProblems,
    });
  }, []);

  return {
    trackEvent,
    trackProductClick,
    trackAffiliateLinkOpened,
    trackProblemSelected,
    trackKitGenerated,
    loadStats,
    stats,
  };
}
