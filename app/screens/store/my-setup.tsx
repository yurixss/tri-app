import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform as RNPlatform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/constants/Styles';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type {
  SetupItem,
  SetupModality,
  SetupCategory,
  InvestmentInsight,
} from '@/data/store/setup/setup.model';
import {
  MODALITY_CONFIG,
  CATEGORY_SETUP_CONFIG,
} from '@/data/store/setup/setup.model';
import {
  getInvestmentSummary,
  generateInsights,
  sortItems,
} from '@/data/store/setup/setup.service';
import {
  saveSetup,
  loadSetup,
  migrateV1ToV2,
  formatCurrency,
  formatDate,
  calcPercentage,
  generateId,
} from '@/data/store/setup/setup.utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODALITY_CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

// ─── Component ───────────────────────────────────────────────────────

export default function MySetupScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'tabIconDefault');
  const bgColor = useThemeColor({}, 'background');

  const [items, setItems] = useState<SetupItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formModality, setFormModality] = useState<SetupModality>('ciclismo');
  const [formCategory, setFormCategory] = useState<SetupCategory>('outros');
  const [formPrice, setFormPrice] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    let data = await loadSetup();
    // Migrate from v1 if v2 is empty
    if (data.length === 0) {
      data = await migrateV1ToV2();
    }
    setItems(data);
    setLoaded(true);
  };

  // ─── Derived Data ──────────────────────────────────────────────────

  const summary = getInvestmentSummary(items);
  const insights = generateInsights(items);
  const sortedItems = sortItems(items, 'pricePaid', false); // most expensive first

  // ─── Form Helpers ──────────────────────────────────────────────────

  const resetForm = () => {
    setFormName('');
    setFormModality('ciclismo');
    setFormCategory('outros');
    setFormPrice('');
    setFormDate('');
    setFormNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert('', 'Nome do equipamento é obrigatório');
      return;
    }

    const rawPrice = formPrice.replace(/[^\d.,]/g, '').replace(',', '.');
    const pricePaid = parseFloat(rawPrice) || 0;

    // Parse date DD/MM/YYYY → ISO
    let purchaseDate: string | undefined;
    if (formDate.trim()) {
      const parts = formDate.trim().split('/');
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const d = new Date(`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`);
        if (!isNaN(d.getTime())) {
          purchaseDate = d.toISOString().split('T')[0];
        }
      }
    }

    const newItem: SetupItem = {
      id: editingId ?? generateId(),
      name: formName.trim(),
      modality: formModality,
      category: formCategory,
      purchaseDate,
      pricePaid,
      notes: formNotes.trim() || undefined,
      addedAt: editingId
        ? items.find((i) => i.id === editingId)?.addedAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };

    let updated: SetupItem[];
    if (editingId) {
      updated = items.map((i) => (i.id === editingId ? newItem : i));
    } else {
      updated = [...items, newItem];
    }

    setItems(updated);
    await saveSetup(updated);
    resetForm();
  };

  const handleEdit = (item: SetupItem) => {
    setFormName(item.name);
    setFormModality(item.modality);
    setFormCategory(item.category);
    setFormPrice(item.pricePaid > 0 ? item.pricePaid.toString() : '');
    setFormDate(item.purchaseDate ? formatDate(item.purchaseDate) : '');
    setFormNotes(item.notes ?? '');
    setEditingId(item.id);
    setShowForm(true);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 150);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remover equipamento?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const updated = items.filter((i) => i.id !== id);
          setItems(updated);
          await saveSetup(updated);
        },
      },
    ]);
  };

  // ─── Modality & Category Lists ────────────────────────────────────

  const modalityEntries = Object.entries(MODALITY_CONFIG) as [
    SetupModality,
    (typeof MODALITY_CONFIG)[SetupModality],
  ][];

  const categoryEntries = Object.entries(CATEGORY_SETUP_CONFIG) as [
    SetupCategory,
    (typeof CATEGORY_SETUP_CONFIG)[SetupCategory],
  ][];

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.headerTitle} fontFamily="Inter-Bold">
            Meu Setup
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: secondaryText }]}>
            Painel de investimento em equipamentos
          </ThemedText>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowForm(true);
            setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 150);
          }}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ═══════════════ FORM ═══════════════ */}
          {showForm && (
            <View style={[styles.formCard, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={styles.formTitle} fontFamily="Inter-Bold">
                {editingId ? 'Editar equipamento' : 'Novo equipamento'}
              </ThemedText>

              {/* Name */}
              <View style={styles.formGroup}>
                <ThemedText style={[styles.formLabel, { color: secondaryText }]}>
                  Equipamento *
                </ThemedText>
                <TextInput
                  style={[styles.input, { borderColor, color: textColor, backgroundColor: bgColor }]}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Ex: Garmin Forerunner 965"
                  placeholderTextColor={secondaryText}
                />
              </View>

              {/* Modality */}
              <View style={styles.formGroup}>
                <ThemedText style={[styles.formLabel, { color: secondaryText }]}>
                  Modalidade
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {modalityEntries.map(([key, config]) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.chip,
                          formModality === key
                            ? { backgroundColor: config.color, borderColor: config.color }
                            : { borderColor },
                        ]}
                        onPress={() => setFormModality(key)}
                      >
                        <ThemedText
                          style={[
                            styles.chipText,
                            { color: formModality === key ? '#FFF' : textColor },
                          ]}
                        >
                          {config.emoji} {config.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Category */}
              <View style={styles.formGroup}>
                <ThemedText style={[styles.formLabel, { color: secondaryText }]}>
                  Categoria
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {categoryEntries.map(([key, config]) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.chip,
                          formCategory === key
                            ? { backgroundColor: '#066699', borderColor: '#066699' }
                            : { borderColor },
                        ]}
                        onPress={() => setFormCategory(key)}
                      >
                        <ThemedText
                          style={[
                            styles.chipText,
                            { color: formCategory === key ? '#FFF' : textColor },
                          ]}
                        >
                          {config.emoji} {config.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Price */}
              <View style={styles.formGroup}>
                <ThemedText style={[styles.formLabel, { color: secondaryText }]}>
                  Valor pago (R$) *
                </ThemedText>
                <TextInput
                  style={[styles.input, { borderColor, color: textColor, backgroundColor: bgColor }]}
                  value={formPrice}
                  onChangeText={setFormPrice}
                  placeholder="Ex: 3899"
                  placeholderTextColor={secondaryText}
                  keyboardType="numeric"
                />
              </View>

              {/* Purchase Date */}
              <View style={styles.formGroup}>
                <ThemedText style={[styles.formLabel, { color: secondaryText }]}>
                  Data da compra
                </ThemedText>
                <TextInput
                  style={[styles.input, { borderColor, color: textColor, backgroundColor: bgColor }]}
                  value={formDate}
                  onChangeText={setFormDate}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={secondaryText}
                  keyboardType="numbers-and-punctuation"
                />
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <ThemedText style={[styles.formLabel, { color: secondaryText }]}>
                  Observações
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputMultiline,
                    { borderColor, color: textColor, backgroundColor: bgColor },
                  ]}
                  value={formNotes}
                  onChangeText={setFormNotes}
                  placeholder="Ex: Precisão GPS multibanda, excelente bateria"
                  placeholderTextColor={secondaryText}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Actions */}
              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                  <ThemedText style={[styles.cancelText, { color: secondaryText }]}>
                    Cancelar
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <ThemedText style={styles.saveText} fontFamily="Inter-SemiBold">
                    {editingId ? 'Salvar' : 'Adicionar'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ═══════════════ EMPTY STATE ═══════════════ */}
          {loaded && items.length === 0 && !showForm && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="chart-donut" size={56} color={secondaryText} />
              <ThemedText
                style={[styles.emptyTitle, { color: textColor }]}
                fontFamily="Inter-SemiBold"
              >
                Nenhum equipamento cadastrado
              </ThemedText>
              <ThemedText style={[styles.emptyText, { color: secondaryText }]}>
                Registre seus equipamentos para visualizar seu investimento total por modalidade e
                categoria.
              </ThemedText>
              <TouchableOpacity style={styles.emptyButton} onPress={() => setShowForm(true)}>
                <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
                <ThemedText style={styles.emptyButtonText} fontFamily="Inter-SemiBold">
                  Adicionar primeiro equipamento
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* ═══════════════ DASHBOARD ═══════════════ */}
          {items.length > 0 && !showForm && (
            <>
              {/* ── Total Geral ── */}
              <View style={[styles.totalCard, { backgroundColor: '#066699' }]}>
                <View style={styles.totalCardInner}>
                  <ThemedText style={styles.totalLabel}>Total investido</ThemedText>
                  <ThemedText style={styles.totalValue} fontFamily="Inter-Bold">
                    {formatCurrency(summary.total)}
                  </ThemedText>
                  <ThemedText style={styles.totalSub}>
                    {summary.itemCount} equipamento{summary.itemCount !== 1 ? 's' : ''} registrado
                    {summary.itemCount !== 1 ? 's' : ''}
                  </ThemedText>
                </View>
                <MaterialCommunityIcons
                  name="chart-arc"
                  size={48}
                  color="rgba(255,255,255,0.15)"
                  style={styles.totalIcon}
                />
              </View>

              {/* ── Modality Cards 2×2 ── */}
              <View style={styles.modalityGrid}>
                {(['ciclismo', 'corrida', 'natacao', 'transicao'] as SetupModality[]).map(
                  (mod) => {
                    const config = MODALITY_CONFIG[mod];
                    const val = summary.byModality[mod];
                    const pct = calcPercentage(val, summary.total);
                    return (
                      <View
                        key={mod}
                        style={[styles.modalityCard, { backgroundColor: cardBg, borderColor }]}
                      >
                        <View style={styles.modalityCardHeader}>
                          <View
                            style={[
                              styles.modalityDot,
                              { backgroundColor: config.color },
                            ]}
                          />
                          <ThemedText style={[styles.modalityLabel, { color: secondaryText }]}>
                            {config.emoji} {config.label}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.modalityValue} fontFamily="Inter-Bold">
                          {formatCurrency(val)}
                        </ThemedText>
                        {/* Mini bar */}
                        <View style={[styles.miniBar, { backgroundColor: `${config.color}20` }]}>
                          <View
                            style={[
                              styles.miniBarFill,
                              {
                                backgroundColor: config.color,
                                width: `${Math.max(pct, 2)}%`,
                              },
                            ]}
                          />
                        </View>
                        <ThemedText style={[styles.modalityPct, { color: secondaryText }]}>
                          {pct}% do total
                        </ThemedText>
                      </View>
                    );
                  },
                )}
              </View>

              {/* ── Category Breakdown ── */}
              {(() => {
                const activeCats = categoryEntries
                  .filter(([key]) => summary.byCategory[key] > 0)
                  .sort((a, b) => summary.byCategory[b[0]] - summary.byCategory[a[0]]);

                if (activeCats.length === 0) return null;

                return (
                  <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
                    <ThemedText style={styles.sectionTitle} fontFamily="Inter-Bold">
                      Investimento por Categoria
                    </ThemedText>
                    {activeCats.map(([key, config]) => {
                      const val = summary.byCategory[key];
                      const pct = calcPercentage(val, summary.total);
                      return (
                        <View key={key} style={styles.catRow}>
                          <ThemedText style={styles.catEmoji}>{config.emoji}</ThemedText>
                          <View style={{ flex: 1 }}>
                            <View style={styles.catRowTop}>
                              <ThemedText style={styles.catLabel} fontFamily="Inter-SemiBold">
                                {config.label}
                              </ThemedText>
                              <ThemedText style={styles.catValue} fontFamily="Inter-SemiBold">
                                {formatCurrency(val)}
                              </ThemedText>
                            </View>
                            <View
                              style={[
                                styles.catBar,
                                { backgroundColor: `${secondaryText}20` },
                              ]}
                            >
                              <View
                                style={[
                                  styles.catBarFill,
                                  {
                                    backgroundColor: '#066699',
                                    width: `${Math.max(pct, 2)}%`,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                          <ThemedText style={[styles.catPct, { color: secondaryText }]}>
                            {pct}%
                          </ThemedText>
                        </View>
                      );
                    })}
                  </View>
                );
              })()}

              {/* ── Insights ── */}
              {insights.length > 0 && (
                <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
                  <ThemedText style={styles.sectionTitle} fontFamily="Inter-Bold">
                    Insights
                  </ThemedText>
                  {insights.map((insight) => (
                    <View
                      key={insight.id}
                      style={[
                        styles.insightRow,
                        {
                          backgroundColor:
                            insight.type === 'highlight'
                              ? 'rgba(6,102,153,0.06)'
                              : insight.type === 'suggestion'
                              ? 'rgba(245,158,11,0.06)'
                              : 'rgba(107,114,128,0.06)',
                        },
                      ]}
                    >
                      <ThemedText style={styles.insightIcon}>{insight.icon}</ThemedText>
                      <ThemedText style={[styles.insightText, { color: textColor }]}>
                        {insight.text}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}

              {/* ── Divider ── */}
              <View style={[styles.divider, { backgroundColor: borderColor }]} />

              {/* ── Equipment List ── */}
              <View style={styles.listHeader}>
                <ThemedText style={styles.listTitle} fontFamily="Inter-Bold">
                  Equipamentos
                </ThemedText>
                <ThemedText style={[styles.listCount, { color: secondaryText }]}>
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </ThemedText>
              </View>

              {sortedItems.map((item) => {
                const modConfig = MODALITY_CONFIG[item.modality];
                const catConfig = CATEGORY_SETUP_CONFIG[item.category];
                return (
                  <View
                    key={item.id}
                    style={[styles.itemCard, { backgroundColor: cardBg, borderColor }]}
                  >
                    {/* Item Header */}
                    <View style={styles.itemHeader}>
                      <View
                        style={[
                          styles.itemBadge,
                          { backgroundColor: `${modConfig.color}15` },
                        ]}
                      >
                        <ThemedText style={styles.itemBadgeEmoji}>
                          {modConfig.emoji}
                        </ThemedText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.itemName} fontFamily="Inter-SemiBold">
                          {item.name}
                        </ThemedText>
                        <View style={styles.itemMetaRow}>
                          <ThemedText style={[styles.itemMeta, { color: secondaryText }]}>
                            {modConfig.label}
                          </ThemedText>
                          <View style={[styles.itemMetaDot, { backgroundColor: secondaryText }]} />
                          <ThemedText style={[styles.itemMeta, { color: secondaryText }]}>
                            {catConfig.emoji} {catConfig.label}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.itemActions}>
                        <TouchableOpacity
                          onPress={() => handleEdit(item)}
                          style={styles.actionBtn}
                        >
                          <MaterialCommunityIcons
                            name="pencil-outline"
                            size={18}
                            color={secondaryText}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDelete(item.id)}
                          style={styles.actionBtn}
                        >
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={18}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Price + Date row */}
                    <View style={styles.itemDataRow}>
                      <View style={styles.itemDataBlock}>
                        <ThemedText style={[styles.itemDataLabel, { color: secondaryText }]}>
                          Valor pago
                        </ThemedText>
                        <ThemedText style={styles.itemDataValue} fontFamily="Inter-Bold">
                          {item.pricePaid > 0 ? formatCurrency(item.pricePaid) : '—'}
                        </ThemedText>
                      </View>
                      <View style={[styles.itemDataDivider, { backgroundColor: borderColor }]} />
                      <View style={styles.itemDataBlock}>
                        <ThemedText style={[styles.itemDataLabel, { color: secondaryText }]}>
                          Compra
                        </ThemedText>
                        <ThemedText style={styles.itemDataValue} fontFamily="Inter-SemiBold">
                          {formatDate(item.purchaseDate)}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Notes */}
                    {item.notes ? (
                      <View style={styles.itemNotes}>
                        <MaterialCommunityIcons
                          name="note-text-outline"
                          size={14}
                          color={secondaryText}
                        />
                        <ThemedText style={[styles.itemNotesText, { color: secondaryText }]}>
                          {item.notes}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 22 },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#066699',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // ─── Total Card ────────────────────────────────────────────────────
  totalCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  totalCardInner: { zIndex: 1 },
  totalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  totalValue: { fontSize: 32, color: '#FFF', marginTop: 4 },
  totalSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  totalIcon: { position: 'absolute', right: 20, bottom: 16 },

  // ─── Modality Grid ─────────────────────────────────────────────────
  modalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  modalityCard: {
    width: MODALITY_CARD_WIDTH,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  modalityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalityDot: { width: 8, height: 8, borderRadius: 4 },
  modalityLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  modalityValue: { fontSize: 18, marginTop: 2 },
  miniBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 2 },
  modalityPct: { fontSize: 11 },

  // ─── Section Card ──────────────────────────────────────────────────
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    gap: 14,
  },
  sectionTitle: { fontSize: 16 },

  // Category breakdown
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catEmoji: { fontSize: 18, width: 28, textAlign: 'center' },
  catRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  catLabel: { fontSize: 13 },
  catValue: { fontSize: 13 },
  catBar: { height: 5, borderRadius: 2.5, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 2.5 },
  catPct: { fontSize: 11, width: 34, textAlign: 'right' },

  // Insights
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 10,
  },
  insightIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  insightText: { flex: 1, fontSize: 13, lineHeight: 18 },

  // Divider
  divider: { height: 1, marginVertical: 8 },

  // ─── Equipment List ────────────────────────────────────────────────
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  listTitle: { fontSize: 16 },
  listCount: { fontSize: 12 },

  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBadgeEmoji: { fontSize: 22 },
  itemName: { fontSize: 15 },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  itemMeta: { fontSize: 11 },
  itemMetaDot: { width: 3, height: 3, borderRadius: 1.5 },
  itemActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 6 },

  // Data row
  itemDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107,114,128,0.05)',
    borderRadius: 10,
    padding: 12,
  },
  itemDataBlock: { flex: 1, alignItems: 'center' },
  itemDataLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  itemDataValue: { fontSize: 15 },
  itemDataDivider: { width: 1, height: 28 },

  // Notes
  itemNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 4,
  },
  itemNotesText: { flex: 1, fontSize: 12, lineHeight: 17 },

  // ─── Form ──────────────────────────────────────────────────────────
  formCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    gap: 16,
  },
  formTitle: { fontSize: 18 },
  formGroup: { gap: 6 },
  formLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 12 },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: { paddingHorizontal: 20, paddingVertical: 12 },
  cancelText: { fontSize: 14 },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#066699',
  },
  saveText: { fontSize: 14, color: '#FFF' },

  // ─── Empty State ───────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, textAlign: 'center' },
  emptyText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#066699',
  },
  emptyButtonText: { fontSize: 14, color: '#FFF' },
});
