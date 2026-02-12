import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/constants/Styles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { SetupItem, ProductCategory } from '@/types/store';
import { CATEGORY_CONFIG } from '@/types/store';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';

const STORAGE_KEY = 'my_setup';

// ─── Storage helpers ─────────────────────────────────────────────────

const webStorage = new Map<string, string>();

async function saveSetup(items: SetupItem[]): Promise<void> {
  const json = JSON.stringify(items);
  if (Platform.OS === 'web') {
    webStorage.set(STORAGE_KEY, json);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, json);
}

async function loadSetup(): Promise<SetupItem[]> {
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

// ─── Component ───────────────────────────────────────────────────────

export default function MySetupScreen() {
  const router = useRouter();
  const { trackEvent } = useStoreAnalytics();

  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'tabIconDefault');
  const bgColor = useThemeColor({}, 'background');

  const [items, setItems] = useState<SetupItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('ciclismo');
  const [technicalReason, setTechnicalReason] = useState('');
  const [whenToReplace, setWhenToReplace] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');

  useEffect(() => {
    loadSetup().then(setItems);
  }, []);

  const resetForm = () => {
    setProductName('');
    setCategory('ciclismo');
    setTechnicalReason('');
    setWhenToReplace('');
    setAffiliateLink('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert('', 'Nome do produto é obrigatório');
      return;
    }

    const newItem: SetupItem = {
      id: editingId ?? `setup_${Date.now()}`,
      productName: productName.trim(),
      category,
      technicalReason: technicalReason.trim(),
      whenToReplace: whenToReplace.trim(),
      affiliateLink: affiliateLink.trim(),
      addedAt: new Date().toISOString(),
    };

    let updated: SetupItem[];
    if (editingId) {
      updated = items.map(i => (i.id === editingId ? newItem : i));
    } else {
      updated = [...items, newItem];
    }

    setItems(updated);
    await saveSetup(updated);
    trackEvent('setup_item_added', { category, metadata: { name: productName.trim() } });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Remover item?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const updated = items.filter(i => i.id !== id);
          setItems(updated);
          await saveSetup(updated);
        },
      },
    ]);
  };

  const handleEdit = (item: SetupItem) => {
    setProductName(item.productName);
    setCategory(item.category);
    setTechnicalReason(item.technicalReason);
    setWhenToReplace(item.whenToReplace);
    setAffiliateLink(item.affiliateLink);
    setEditingId(item.id);
    setShowForm(true);
  };

  const categories = Object.entries(CATEGORY_CONFIG) as [ProductCategory, typeof CATEGORY_CONFIG[ProductCategory]][];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.headerTitle} fontFamily="Inter-Bold">
            Meu Setup Atual
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: secondaryText }]}>
            Registre seus equipamentos e quando trocar
          </ThemedText>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Form */}
        {showForm && (
          <View style={[styles.formCard, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText style={styles.formTitle} fontFamily="Inter-Bold">
              {editingId ? 'Editar equipamento' : 'Adicionar equipamento'}
            </ThemedText>

            {/* Name */}
            <View style={styles.formGroup}>
              <ThemedText style={[styles.formLabel, { color: secondaryText }]}>
                Produto *
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor, backgroundColor: bgColor }]}
                value={productName}
                onChangeText={setProductName}
                placeholder="Ex: Garmin Forerunner 965"
                placeholderTextColor={secondaryText}
              />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <ThemedText style={[styles.formLabel, { color: secondaryText }]}>
                Categoria
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryRow}>
                  {categories.map(([key, config]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.categoryChip,
                        category === key
                          ? { backgroundColor: config.color, borderColor: config.color }
                          : { borderColor },
                      ]}
                      onPress={() => setCategory(key)}
                    >
                      <ThemedText
                        style={[
                          styles.categoryChipText,
                          { color: category === key ? '#FFF' : textColor },
                        ]}
                      >
                        {config.emoji} {config.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Technical Reason */}
            <View style={styles.formGroup}>
              <ThemedText style={[styles.formLabel, { color: secondaryText }]}>
                Por que uso este equipamento?
              </ThemedText>
              <TextInput
                style={[styles.input, styles.inputMultiline, { borderColor, color: textColor, backgroundColor: bgColor }]}
                value={technicalReason}
                onChangeText={setTechnicalReason}
                placeholder="Ex: Precisão de GPS multibanda para treinos com pace target"
                placeholderTextColor={secondaryText}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* When to Replace */}
            <View style={styles.formGroup}>
              <ThemedText style={[styles.formLabel, { color: secondaryText }]}>
                Quando trocar?
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor, backgroundColor: bgColor }]}
                value={whenToReplace}
                onChangeText={setWhenToReplace}
                placeholder="Ex: Quando sair Forerunner 975 ou bateria degradar"
                placeholderTextColor={secondaryText}
              />
            </View>

            {/* Affiliate Link */}
            <View style={styles.formGroup}>
              <ThemedText style={[styles.formLabel, { color: secondaryText }]}>
                Link de compra (opcional)
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor, backgroundColor: bgColor }]}
                value={affiliateLink}
                onChangeText={setAffiliateLink}
                placeholder="https://..."
                placeholderTextColor={secondaryText}
                keyboardType="url"
                autoCapitalize="none"
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

        {/* Empty state */}
        {items.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="toolbox-outline" size={56} color={secondaryText} />
            <ThemedText style={[styles.emptyTitle, { color: textColor }]} fontFamily="Inter-SemiBold">
              Nenhum equipamento cadastrado
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: secondaryText }]}>
              Registre seus equipamentos atuais, o motivo técnico de cada escolha e quando planeja trocar.
            </ThemedText>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowForm(true)}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
              <ThemedText style={styles.emptyButtonText} fontFamily="Inter-SemiBold">
                Adicionar primeiro item
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Items List */}
        {items.map((item) => {
          const catConfig = CATEGORY_CONFIG[item.category];
          return (
            <View
              key={item.id}
              style={[styles.setupCard, { backgroundColor: cardBg, borderColor }]}
            >
              <View style={styles.setupHeader}>
                <View style={[styles.setupCatBadge, { backgroundColor: `${catConfig?.color ?? '#999'}15` }]}>
                  <ThemedText style={styles.setupCatEmoji}>{catConfig?.emoji ?? '📦'}</ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.setupName} fontFamily="Inter-SemiBold">
                    {item.productName}
                  </ThemedText>
                  <ThemedText style={[styles.setupCategory, { color: secondaryText }]}>
                    {catConfig?.label ?? item.category}
                  </ThemedText>
                </View>
                <View style={styles.setupActions}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                    <MaterialCommunityIcons name="pencil-outline" size={18} color={secondaryText} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {item.technicalReason ? (
                <View style={styles.setupDetail}>
                  <MaterialCommunityIcons name="head-cog-outline" size={14} color="#066699" />
                  <ThemedText style={[styles.setupDetailText, { color: textColor }]}>
                    {item.technicalReason}
                  </ThemedText>
                </View>
              ) : null}

              {item.whenToReplace ? (
                <View style={styles.setupDetail}>
                  <MaterialCommunityIcons name="calendar-clock" size={14} color="#F59E0B" />
                  <ThemedText style={[styles.setupDetailText, { color: textColor }]}>
                    {item.whenToReplace}
                  </ThemedText>
                </View>
              ) : null}

              {item.affiliateLink ? (
                <TouchableOpacity
                  style={styles.setupLink}
                  onPress={() => Linking.openURL(item.affiliateLink)}
                >
                  <MaterialCommunityIcons name="open-in-new" size={14} color="#066699" />
                  <ThemedText style={styles.setupLinkText} fontFamily="Inter-SemiBold">
                    Ver na loja
                  </ThemedText>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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

  // Form
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryRow: { flexDirection: 'row', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  categoryChipText: { fontSize: 12 },
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

  // Empty State
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

  // Setup Card
  setupCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setupCatBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupCatEmoji: { fontSize: 22 },
  setupName: { fontSize: 15 },
  setupCategory: { fontSize: 11, marginTop: 2 },
  setupActions: { flexDirection: 'row', gap: 4 },
  actionButton: { padding: 6 },

  setupDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 4,
  },
  setupDetailText: { flex: 1, fontSize: 13, lineHeight: 18 },

  setupLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
  },
  setupLinkText: { fontSize: 13, color: '#066699' },
});
