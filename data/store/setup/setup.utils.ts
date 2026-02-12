/**
 * Setup Utils — Helpers de formatação e persistência
 *
 * Formatação de moeda, datas, storage helpers.
 * Zero lógica de negócio.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { SetupItem, SetupModality } from './setup.model';

const STORAGE_KEY = 'my_setup_v2';

const webStorage = new Map<string, string>();

// ─── Persistence ────────────────────────────────────────────────────

export async function saveSetup(items: SetupItem[]): Promise<void> {
  const json = JSON.stringify(items);
  if (Platform.OS === 'web') {
    webStorage.set(STORAGE_KEY, json);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, json);
}

export async function loadSetup(): Promise<SetupItem[]> {
  let data: string | null;
  if (Platform.OS === 'web') {
    data = webStorage.get(STORAGE_KEY) || null;
  } else {
    data = await SecureStore.getItemAsync(STORAGE_KEY);
  }
  if (!data) return [];
  try {
    return JSON.parse(data) as SetupItem[];
  } catch {
    return [];
  }
}

/**
 * Migrate items from old v1 format (if any).
 * Old format had: productName, category (ProductCategory), technicalReason, whenToReplace, affiliateLink
 * New format has: name, modality, category (SetupCategory), pricePaid, purchaseDate, notes
 */
export async function migrateV1ToV2(): Promise<SetupItem[]> {
  const OLD_KEY = 'my_setup';
  let oldData: string | null;

  if (Platform.OS === 'web') {
    oldData = webStorage.get(OLD_KEY) || null;
  } else {
    oldData = await SecureStore.getItemAsync(OLD_KEY);
  }

  if (!oldData) return [];

  try {
    const oldItems = JSON.parse(oldData) as Array<{
      id: string;
      productName: string;
      category: string;
      technicalReason?: string;
      whenToReplace?: string;
      affiliateLink?: string;
      addedAt?: string;
    }>;

    const categoryToModality: Record<string, SetupModality> = {
      natacao: 'natacao',
      ciclismo: 'ciclismo',
      corrida: 'corrida',
      transicao: 'transicao',
      nutricao: 'outros',
      recuperacao: 'outros',
      tecnologia: 'outros',
      aerodinamica: 'ciclismo',
    };

    const migrated: SetupItem[] = oldItems.map((old) => ({
      id: old.id,
      name: old.productName || 'Item sem nome',
      modality: categoryToModality[old.category] ?? 'outros',
      category: 'outros' as const,
      purchaseDate: undefined,
      pricePaid: 0, // user will need to fill in
      notes: [old.technicalReason, old.whenToReplace].filter(Boolean).join(' | ') || undefined,
      addedAt: old.addedAt || new Date().toISOString(),
    }));

    // Save migrated data in v2 format
    if (migrated.length > 0) {
      await saveSetup(migrated);
    }

    return migrated;
  } catch {
    return [];
  }
}

// ─── Formatting ─────────────────────────────────────────────────────

/**
 * Format a number as Brazilian Real currency.
 * e.g. 3899 → "R$ 3.899,00"
 */
export function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Format currency compact for cards.
 * e.g. 45000 → "R$ 45.000"
 */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toLocaleString('pt-BR', {
      minimumFractionDigits: value % 1000 === 0 ? 0 : 1,
      maximumFractionDigits: 1,
    })}k`;
  }
  return formatCurrency(value);
}

/**
 * Format a date string to "DD/MM/YYYY".
 */
export function formatDate(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '—';
  }
}

/**
 * Format a date string to "MMM YYYY" (e.g. "Mar 2025").
 */
export function formatDateShort(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return '—';
  }
}

/**
 * Calculates the percentage, rounded, with protection against division by zero.
 */
export function calcPercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Generate a unique ID for a new setup item.
 */
export function generateId(): string {
  return `setup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
