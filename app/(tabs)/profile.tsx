import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity, Platform, Switch } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { RadioSelector } from '@/components/RadioSelector';
import { Header } from '@/components/Header';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { useTheme } from '@/constants/Theme';
import { Camera, Edit3, UserCircle2, CheckCircle2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { getProfile, saveProfile } from '@/hooks/useStorage';

type TrainingGoal = 
  | 'Super Sprint (200m, 4km, 1km)'
  | 'Sprint (750m, 20km, 5km)'
  | 'Standard (1500m, 40km, 10km)'
  | 'Ironman 70.3 (1900m, 90km, 21km)'
  | 'Ironman 140.6 (3800m, 180km, 42km)'
  | 'T100';

interface Profile {
  name: string;
  age: string;
  gender: 'male' | 'female';
  height: string;
  weight: string;
  photo?: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  trainingGoal: TrainingGoal;
  customGoal?: string;
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
  });
  const [errors, setErrors] = useState<Partial<Profile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const theme = useTheme();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const savedProfile = await getProfile();
    if (savedProfile) {
      setProfile(savedProfile);
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
    
    if (!profile.name) newErrors.name = 'Name is required';
    if (!profile.age || isNaN(Number(profile.age))) newErrors.age = 'Valid age is required';
    if (!profile.height || isNaN(Number(profile.height))) newErrors.height = 'Valid height is required';
    if (!profile.weight || isNaN(Number(profile.weight))) newErrors.weight = 'Valid weight is required';
    
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Perfil"
          color={Colors.shared.profile}
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
                trackColor={{ false: '#767577', true: Colors.shared.primary }}
                thumbColor={theme.choice === 'dark' ? '#fff' : '#fff'}
              />
            </View>

          <View style={styles.photoContainer}>
            <View style={[styles.photoWrapper, { borderColor }]}>
              {profile.photo ? (
                <Image 
                  source={{ uri: profile.photo }} 
                  style={styles.photo}
                />
              ) : (
                <UserCircle2 
                  size={64} 
                  color={Colors.shared.profile} 
                  style={styles.photoPlaceholder}
                />
              )}
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: Colors.shared.profile }]} 
                onPress={handlePhotoSelect}
              >
                <Edit3 size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ThemedInput
            label="Name"
            value={profile.name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
            placeholder="Your name"
            error={errors.name}
          />

          <ThemedInput
            label="Age"
            value={profile.age}
            onChangeText={(text) => setProfile(prev => ({ ...prev, age: text }))}
            placeholder="Your age"
            keyboardType="numeric"
            error={errors.age}
          />

          <RadioSelector
            label="Gender"
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ]}
            selectedValue={profile.gender}
            onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value as 'male' | 'female' }))}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Height (cm)"
                value={profile.height}
                onChangeText={(text) => setProfile(prev => ({ ...prev, height: text }))}
                placeholder="175"
                keyboardType="numeric"
                error={errors.height}
              />
            </View>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Weight (kg)"
                value={profile.weight}
                onChangeText={(text) => setProfile(prev => ({ ...prev, weight: text }))}
                placeholder="70"
                keyboardType="numeric"
                error={errors.weight}
              />
            </View>
          </View>

          <RadioSelector
            label="Experience Level"
            options={[
              { label: 'Beginner', value: 'beginner' },
              { label: 'Intermediate', value: 'intermediate' },
              { label: 'Advanced', value: 'advanced' },
            ]}
            selectedValue={profile.experience}
            onValueChange={(value) => setProfile(prev => ({ ...prev, experience: value as 'beginner' | 'intermediate' | 'advanced' }))}
          />

          <ThemedText 
            style={styles.sectionLabel}
            fontFamily="Inter-Medium"
          >
            Training Goal
          </ThemedText>

          <View style={styles.goalSelector}>
            {[
              'Super Sprint (200m, 4km, 1km)',
              'Sprint (750m, 20km, 5km)',
              'Standard (1500m, 40km, 10km)',
              'Ironman 70.3 (1900m, 90km, 21km)',
              'Ironman 140.6 (3800m, 180km, 42km)',
              'T100'
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

          <ThemedInput
            label="Custom Goal (optional)"
            value={profile.customGoal}
            onChangeText={(text) => setProfile(prev => ({ ...prev, customGoal: text }))}
            placeholder="e.g., Improve my swimming technique"
            multiline
            numberOfLines={3}
            style={styles.goalInput}
          />

          <ThemedButton
            title="Save Profile"
            color={Colors.shared.profile}
            onPress={handleSave}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>

      {showToast && (
        <View style={[styles.toast, { backgroundColor: Colors.light.success }]}>
          <CheckCircle2 color="#fff" size={20} />
          <ThemedText style={styles.toastText}>Profile saved successfully!</ThemedText>
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
    backgroundColor: Colors.shared.profile,
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
    backgroundColor: Colors.shared.profile,
    borderColor: Colors.shared.profile,
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
});