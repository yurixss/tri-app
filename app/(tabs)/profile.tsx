import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity, Platform, Switch, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { RadioSelector } from '@/components/RadioSelector';
import { Header } from '@/components/Header';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { useTheme } from '@/constants/Theme';
import { Camera, Edit3, UserCircle2, CheckCircle2, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { getProfile, saveProfile, deleteAllData, getOnboardingData } from '@/hooks/useStorage';
import { useRouter } from 'expo-router';

type TrainingGoal = 
  | 'Sprint (750m, 20km, 5km)'
  | 'Standard (1500m, 40km, 10km)'
  | 'Ironman 70.3 (1900m, 90km, 21km)'
  | 'Ironman 140.6 (3800m, 180km, 42km)'
  | 'T100 (2km, 80km, 18km)';

interface Profile {
  name: string;
  age: string;
  gender: 'male' | 'female';
  height: string;
  weight: string;
  photo?: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  trainingGoal: TrainingGoal;
  bikeModel?: string;
  bikeWeight?: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    experience: 'beginner',
    trainingGoal: 'Sprint (750m, 20km, 5km)',
    bikeModel: '',
    bikeWeight: '',
  });
  const [errors, setErrors] = useState<Partial<Profile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const savedProfile = await getProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    } else {
      // Se não houver perfil salvo, tenta carregar dados do onboarding
      const onboardingData = await getOnboardingData();
      if (onboardingData) {
        setProfile(prev => ({
          ...prev,
          weight: onboardingData.weight || prev.weight,
          height: onboardingData.height || prev.height,
          gender: onboardingData.gender || prev.gender,
        }));
      }
    }
  };

  const handlePhotoSelect = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      setProfile(prev => ({ ...prev, photo: result.assets[0].uri }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Profile> = {};
    
    if (!profile.name) newErrors.name = 'Nome é obrigatório';
    if (!profile.age || isNaN(Number(profile.age))) newErrors.age = 'Idade válida é obrigatória';
    if (!profile.height || isNaN(Number(profile.height))) newErrors.height = 'Altura válida é obrigatória';
    if (!profile.weight || isNaN(Number(profile.weight))) newErrors.weight = 'Peso válido é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await saveProfile(profile);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      console.error('Error saving profile', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Deletar Conta',
      'Tem certeza que deseja deletar sua conta? Esta ação irá remover permanentemente todos os seus dados incluindo seu perfil, registros de treino e resultados de testes. Isto não pode ser desfeito.',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Deletar',
          onPress: confirmDeleteAccount,
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  const confirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAllData();
      // Navigate to onboarding after deletion
      router.replace('/onboarding/sport');
    } catch (e) {
      console.error('Error deleting account', e);
      Alert.alert('Erro', 'Falha ao deletar conta. Por favor, tente novamente.');
      setIsDeletingAccount(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Perfil"
          color="#066699"
        />
        
        <View 
          style={[
            styles.card, 
            { 
              backgroundColor: cardBg,
              borderColor: borderColor,
              borderWidth: 1,
            }
          ]}
        >
            <View style={styles.themeRow}>
              <ThemedText style={{ fontSize: 16, marginRight: 12 }} fontFamily="Inter-Medium">Tema do app</ThemedText>
              <View style={{ flex: 1 }} />
              <Switch
                value={theme.choice === 'dark'}
                onValueChange={(v) => theme.setChoice(v ? 'dark' : 'light')}
                trackColor={{ false: '#767577', true: '#066699' }}
                thumbColor={theme.choice === 'dark' ? '#fff' : '#fff'}
              />
            </View>

          {/* <View style={styles.photoContainer}>
            <View style={[styles.photoWrapper, { borderColor }]}>
              {profile.photo ? (
                <Image 
                  source={{ uri: profile.photo }} 
                  style={styles.photo}
                />
              ) : (
                <UserCircle2 
                  size={64} 
                  color={'#066699'} 
                  style={styles.photoPlaceholder}
                />
              )}
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: '#066699' }]} 
                onPress={handlePhotoSelect}
              >
                <Edit3 size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View> */}

          <>
          <ThemedInput
            label="Nome"
            value={profile.name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
            placeholder="Seu nome"
            error={errors.name}
          />

          <ThemedInput
            label="Idade"
            value={profile.age}
            onChangeText={(text) => setProfile(prev => ({ ...prev, age: text }))}
            placeholder="Sua idade"
            keyboardType="numeric"
            error={errors.age}
          />

          <RadioSelector
            label="Gênero"
            options={[
              { label: 'Masculino', value: 'male' },
              { label: 'Feminino', value: 'female' },
            ]}
            selectedValue={profile.gender}
            onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value as 'male' | 'female' }))}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Altura (cm)"
                value={profile.height}
                onChangeText={(text) => setProfile(prev => ({ ...prev, height: text }))}
                placeholder="175"
                keyboardType="numeric"
                error={errors.height}
              />
            </View>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Peso (kg)"
                value={profile.weight}
                onChangeText={(text) => setProfile(prev => ({ ...prev, weight: text }))}
                placeholder="70"
                keyboardType="numeric"
                error={errors.weight}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Modelo da Bicicleta"
                value={profile.bikeModel}
                onChangeText={(text) => setProfile(prev => ({ ...prev, bikeModel: text }))}
                placeholder="Ex: Trek Speedconcept"
              />
            </View>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Peso Bicicleta (kg)"
                value={profile.bikeWeight}
                onChangeText={(text) => setProfile(prev => ({ ...prev, bikeWeight: text }))}
                placeholder="6.8"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <RadioSelector
            label="Nível de Experiência"
            options={[
              { label: 'Iniciante', value: 'beginner' },
              { label: 'Intermediário', value: 'intermediate' },
              { label: 'Avançado', value: 'advanced' },
            ]}
            selectedValue={profile.experience}
            onValueChange={(value) => setProfile(prev => ({ ...prev, experience: value as 'beginner' | 'intermediate' | 'advanced' }))}
          />

          <ThemedText 
            style={[styles.sectionLabel, { color: '#066699' }]}
            fontFamily="Inter-Medium"
          >
            Objetivo
          </ThemedText>

          <View style={styles.goalSelector}>
            {[
              'Sprint (750m, 20km, 5km)',
              'Standard (1500m, 40km, 10km)',
              'Ironman 70.3 (1900m, 90km, 21km)',
              'Ironman 140.6 (3800m, 180km, 42km)',
              'T100 (2km, 80km, 18km)'
            ].map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalOption,
                  profile.trainingGoal === goal && styles.selectedGoalOption
                ]}
                onPress={() => setProfile(prev => ({ ...prev, trainingGoal: goal as TrainingGoal }))}
              >
                <View style={styles.goalContent}>
                  <ThemedText
                    style={[
                      styles.goalText,
                      profile.trainingGoal === goal && styles.selectedGoalText
                    ]}
                  >
                    {goal}
                  </ThemedText>
                  {profile.trainingGoal === goal && (
                    <CheckCircle2 size={20} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedButton
            title="Salvar Perfil"
            color="#066699"
            onPress={handleSave}
            isLoading={isLoading}
          />
          </>

          <View style={styles.deleteButtonContainer}>
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: '#EF4444' }]}
              onPress={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              <Trash2 size={20} color="#EF4444" />
              <ThemedText style={[styles.deleteButtonText, { color: '#EF4444' }]}>
                {isDeletingAccount ? 'Deletando Conta...' : 'Deletar Conta'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {showToast && (
        <View style={[styles.toast, { backgroundColor: Colors.light.success }]}>
          <CheckCircle2 color="#fff" size={20} />
          <ThemedText style={styles.toastText}>Perfil salvo com sucesso!</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#066699',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  goalSelector: {
    gap: 8,
    marginBottom: 16,
  },
  goalOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    borderColor: '#E5E7EB',
  },
  selectedGoalOption: {
    backgroundColor: '#066699',
    borderColor: '#066699',
  },
  goalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 14,
    flex: 1,
  },
  selectedGoalText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  goalInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  deleteButtonContainer: {
    marginTop: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});