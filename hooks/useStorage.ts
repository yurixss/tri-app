import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const webStorage = new Map<string, string>();

export async function saveTestResults(results: TestResults): Promise<void> {
  await saveValue('testResults', JSON.stringify(results));

  // Also attach test results to the saved user profile so tests are available
  // directly from the user's profile object used by the app.
  const existingProfile = await getProfile();
  if (existingProfile) {
    const updatedProfile = { ...existingProfile, tests: results } as Profile & { tests?: TestResults };
    try {
      await saveProfile(updatedProfile);
    } catch (e) {
      console.error('Failed to attach tests to profile', e);
    }
  }
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

export async function saveBikeTest(testType: '20min' | '60min', ftp: number): Promise<void> {
  const currentData = await getTestResults();
  const updatedData: TestResults = {
    ...currentData,
    bike: {
      testType,
      ftp,
      date: new Date().toISOString(),
    }
  };
  
  await saveTestResults(updatedData);
}

export async function saveRunTest(testType: '3km' | '5km', testTime: number): Promise<void> {
  const currentData = await getTestResults();
  const updatedData: TestResults = {
    ...currentData,
    run: {
      testType,
      testTime,
      date: new Date().toISOString(),
    }
  };
  
  await saveTestResults(updatedData);
}

export async function saveSwimTest(testType: '200m' | '400m', testTime: number): Promise<void> {
  const currentData = await getTestResults();
  const updatedData: TestResults = {
    ...currentData,
    swim: {
      testType,
      testTime,
      date: new Date().toISOString(),
    }
  };
  
  await saveTestResults(updatedData);
}

export async function saveHeartRateTest(maxHR: number, restingHR: number): Promise<void> {
  const currentData = await getTestResults();
  const updatedData: TestResults = {
    ...currentData,
    heartRate: {
      maxHR,
      restingHR,
      date: new Date().toISOString(),
    }
  };
  
  await saveTestResults(updatedData);
}

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
  bikeModel?: string;
  bikeWeight?: string;
  raceDate?: string;
  isPremium?: boolean;
  tests?: TestResults;
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
    testType: '200m' | '400m';
    testTime: number;
    date: string;
  };
  heartRate?: {
    maxHR: number;
    restingHR: number;
    date: string;
  };
}

export interface SavedTriathlonPrediction {
  date: string;
  totalTimeSeconds: number;
  totalTimeFormatted: string;
  swimTimeSeconds: number;
  swimTimeFormatted: string;
  bikeTimeSeconds: number;
  bikeTimeFormatted: string;
  runTimeSeconds: number;
  runTimeFormatted: string;
  t1Seconds: number;
  t1Formatted: string;
  t2Seconds: number;
  t2Formatted: string;
  raceType: string;
}

export interface SavedBikePrediction {
  date: string;
  totalTimeSeconds: number;
  totalTimeFormatted: string;
  totalDistance: number;
  totalElevation: number;
  avgSpeedKmh: number;
  avgPower: number;
  ftpPercentage: number;
}

export async function deleteAllData(): Promise<void> {
  await deleteValue('userProfile');
  await deleteValue('onboardingData');
  await deleteValue('testResults');
  // Reset onboarding to show it again on next launch
  await saveOnboardingData({ onboardingComplete: false });
}

export async function saveTriathlonPrediction(prediction: SavedTriathlonPrediction): Promise<void> {
  await saveValue('lastTriathlonPrediction', JSON.stringify(prediction));
}

export async function getTriathlonPrediction(): Promise<SavedTriathlonPrediction | null> {
  const data = await getValue('lastTriathlonPrediction');
  if (!data) return null;
  
  try {
    return JSON.parse(data) as SavedTriathlonPrediction;
  } catch (e) {
    console.error('Error parsing stored triathlon prediction', e);
    return null;
  }
}

export async function saveBikePrediction(prediction: SavedBikePrediction): Promise<void> {
  await saveValue('lastBikePrediction', JSON.stringify(prediction));
}

export async function getBikePrediction(): Promise<SavedBikePrediction | null> {
  const data = await getValue('lastBikePrediction');
  if (!data) return null;
  
  try {
    return JSON.parse(data) as SavedBikePrediction;
  } catch (e) {
    console.error('Error parsing stored bike prediction', e);
    return null;
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
  saveTestResults,
  saveBikeTest, 
  saveRunTest,
  saveSwimTest,
  saveHeartRateTest,
  saveTriathlonPrediction,
  getTriathlonPrediction,
  saveBikePrediction,
  getBikePrediction,
  deleteAllData
};
