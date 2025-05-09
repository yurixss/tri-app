import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { RadioSelector } from '@/components/RadioSelector';
import { Header } from '@/components/Header';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { Camera, Edit3 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { saveProfile, getProfile } from '@/hooks/useStorage';

interface Profile {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  height: string;
  weight: string;
  photo?: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    experience: 'beginner',
    goal: '',
  });
  const [errors, setErrors] = useState<Partial<Profile>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

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
      // Show success feedback here if needed
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
          title="Profile"
          subtitle="Manage your personal information"
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
              { label: 'Other', value: 'other' },
            ]}
            selectedValue={profile.gender}
            onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value as 'male' | 'female' | 'other' }))}
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

          <ThemedInput
            label="Training Goal"
            value={profile.goal}
            onChangeText={(text) => setProfile(prev => ({ ...prev, goal: text }))}
            placeholder="e.g., Complete a marathon"
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
  goalInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});