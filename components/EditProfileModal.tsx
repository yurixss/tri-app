import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedInput } from './ThemedInput';
import { ThemedButton } from './ThemedButton';
import { DropdownSelector } from './DropdownSelector';
import { RadioSelector } from './RadioSelector';
import { useThemeColor } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { X } from 'phosphor-react-native';
import { Profile } from '@/hooks/useStorage';

type TrainingGoal =
  | 'Sprint (750m, 20km, 5km)'
  | 'Standard (1500m, 40km, 10km)'
  | 'Ironman 70.3 (1900m, 90km, 21km)'
  | 'Ironman 140.6 (3800m, 180km, 42km)'
  | 'T100 (2km, 80km, 18km)';

const GOAL_OPTIONS = [
  { label: 'Sprint (750m, 20km, 5km)', value: 'Sprint (750m, 20km, 5km)' },
  { label: 'Standard (1500m, 40km, 10km)', value: 'Standard (1500m, 40km, 10km)' },
  { label: 'Ironman 70.3 (1900m, 90km, 21km)', value: 'Ironman 70.3 (1900m, 90km, 21km)' },
  { label: 'Ironman 140.6 (3800m, 180km, 42km)', value: 'Ironman 140.6 (3800m, 180km, 42km)' },
  { label: 'T100 (2km, 80km, 18km)', value: 'T100 (2km, 80km, 18km)' },
];

const EXPERIENCE_OPTIONS = [
  { label: 'Iniciante', value: 'beginner' },
  { label: 'Intermediário', value: 'intermediate' },
  { label: 'Avançado', value: 'advanced' },
];

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profile: Profile) => void;
  profile: Profile;
  isLoading?: boolean;
}

export function EditProfileModal({
  visible,
  onClose,
  onSave,
  profile: initialProfile,
  isLoading = false,
}: EditProfileModalProps) {
  const [draft, setDraft] = useState<Profile>(initialProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardBg = useThemeColor({}, 'cardBackground');
  const bgColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (visible) {
      setDraft(initialProfile);
      setErrors({});
    }
  }, [visible, initialProfile]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!draft.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (!draft.age || isNaN(Number(draft.age))) newErrors.age = 'Idade válida é obrigatória';
    if (!draft.height || isNaN(Number(draft.height))) newErrors.height = 'Altura válida é obrigatória';
    if (!draft.weight || isNaN(Number(draft.weight))) newErrors.weight = 'Peso válido é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(draft);
  };

  const handleDateInput = (text: string) => {
    // Auto-format date as DD/MM/YYYY
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    setDraft(prev => ({ ...prev, raceDate: formatted }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.modalContainer, { backgroundColor: bgColor }]}
      >
        {/* Handle bar */}
        <View style={styles.handleBarContainer}>
          <View style={[styles.handleBar, { backgroundColor: borderColor }]} />
        </View>

        {/* Header */}
        <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
          <ThemedText style={styles.modalTitle} fontFamily="Inter-Bold">
            Editar Perfil
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <X size={24} color={textColor} weight="bold" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalBody}
          contentContainerStyle={styles.modalBodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Personal Info */}
          <ThemedText style={styles.sectionTitle} fontFamily="Inter-SemiBold">
            Informações Pessoais
          </ThemedText>

          <ThemedInput
            label="Nome"
            value={draft.name}
            onChangeText={(text) => setDraft(prev => ({ ...prev, name: text }))}
            placeholder="Seu nome"
            error={errors.name}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Idade"
                value={draft.age}
                onChangeText={(text) => setDraft(prev => ({ ...prev, age: text }))}
                placeholder="25"
                keyboardType="numeric"
                error={errors.age}
              />
            </View>
            <View style={styles.halfInput}>
              <RadioSelector
                label="Gênero"
                options={[
                  { label: 'Masc', value: 'male' },
                  { label: 'Fem', value: 'female' },
                ]}
                color={Colors.shared.primary}
                selectedValue={draft.gender}
                onValueChange={(value) => setDraft(prev => ({ ...prev, gender: value as 'male' | 'female' }))}
                horizontal
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Altura (cm)"
                value={draft.height}
                onChangeText={(text) => setDraft(prev => ({ ...prev, height: text }))}
                placeholder="175"
                keyboardType="numeric"
                error={errors.height}
              />
            </View>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Peso (kg)"
                value={draft.weight}
                onChangeText={(text) => setDraft(prev => ({ ...prev, weight: text }))}
                placeholder="70"
                keyboardType="numeric"
                error={errors.weight}
              />
            </View>
          </View>

          <DropdownSelector
            label="Nível de Experiência"
            options={EXPERIENCE_OPTIONS}
            selectedValue={draft.experience}
            onValueChange={(value) =>
              setDraft(prev => ({
                ...prev,
                experience: value as 'beginner' | 'intermediate' | 'advanced',
              }))
            }
          />

          {/* Equipment */}
          <ThemedText style={[styles.sectionTitle, { marginTop: 8 }]} fontFamily="Inter-SemiBold">
            Equipamento
          </ThemedText>

          <ThemedInput
            label="Modelo da Bicicleta"
            value={draft.bikeModel || ''}
            onChangeText={(text) => setDraft(prev => ({ ...prev, bikeModel: text }))}
            placeholder="Ex: Trek Speedconcept"
          />

          <ThemedInput
            label="Peso Bicicleta (kg)"
            value={draft.bikeWeight || ''}
            onChangeText={(text) => setDraft(prev => ({ ...prev, bikeWeight: text }))}
            placeholder="6.8"
            keyboardType="decimal-pad"
          />

          {/* Target Race */}
          <ThemedText style={[styles.sectionTitle, { marginTop: 8 }]} fontFamily="Inter-SemiBold">
            Prova Alvo
          </ThemedText>

          <DropdownSelector
            label="Distância Alvo"
            options={GOAL_OPTIONS}
            selectedValue={draft.trainingGoal}
            onValueChange={(value) => setDraft(prev => ({ ...prev, trainingGoal: value }))}
          />

          <ThemedInput
            label="Data da Prova (DD/MM/AAAA)"
            value={draft.raceDate || ''}
            onChangeText={handleDateInput}
            placeholder="25/06/2026"
            keyboardType="numeric"
            maxLength={10}
          />

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor }]}
              onPress={onClose}
            >
              <ThemedText style={styles.cancelText} fontFamily="Inter-Medium">
                Cancelar
              </ThemedText>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <ThemedButton
                title="Salvar"
                color={Colors.shared.primary}
                onPress={handleSave}
                isLoading={isLoading}
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 16,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 15,
    color: Colors.shared.primary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
  },
});
