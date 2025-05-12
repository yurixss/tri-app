import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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
    const value = webStorage.get(key);
    return value || null;
  }
  
  return await SecureStore.getItemAsync(key);
}

async function deleteValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStorage.delete(key);
    return;
  }
  
  await SecureStore.deleteItemAsync(key);
}

interface OnboardingData {
  sport?: 'triathlete' | 'runner' | 'swimmer' | 'cyclist';
  weight?: string;
  height?: string;
  gender?: 'male' | 'female';
  records?: Array<{
    distance: string;
    time: string;
  }>;
  onboardingComplete?: boolean;
}

export interface Profile {
  name: string;
  age: string;
  gender: 'male' | 'female';
  height: string;
  weight: string;
  photo?: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  trainingGoal: string;
  customGoal?: string;
}

export async function saveOnboardingData(data: Partial<OnboardingData>): Promise<void> {
  const currentData = await getOnboardingData();
  const updatedData = { ...currentData, ...data };
  await saveValue('onboardingData', JSON.stringify(updatedData));
}

export async function getOnboardingData(): Promise<OnboardingData | null> {
  const data = await getValue('onboardingData');
  if (!data) return null;
  
  try {
    return JSON.parse(data) as OnboardingData;
  } catch (e) {
    console.error('Error parsing stored onboarding data', e);
    return null;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  await saveValue('userProfile', JSON.stringify(profile));
}

export async function getProfile(): Promise<Profile | null> {
  const data = await getValue('userProfile');
  if (!data) return null;
  
  try {
    return JSON.parse(data) as Profile;
  } catch (e) {
    console.error('Error parsing stored profile data', e);
    return null;
  }
}

export interface TestResults {
  bike?: {
    ftp: number;
    testType: '20min' | '60min';
    date: string;
  };
  run?: {
    testType: '3km' | '5km';
    testTime: number;
    date: string;
  };
  swim?: {
    time400m: number;
    date: string;
  };
}

export async function getTestResults(): Promise<TestResults> {
  const data = await getValue('testResults');
  if (!data) return {};
  
  try {
    return JSON.parse(data) as TestResults;
  } catch (e) {
    console.error('Error parsing stored test results', e);
    return {};
  }
}

export default {
  saveValue,
  getValue,
  deleteValue,
  saveOnboardingData,
  getOnboardingData,
  saveProfile,
  getProfile,
  getTestResults,
};
