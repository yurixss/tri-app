import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For web where SecureStore isn't available
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

// Type for our stored data
export interface TestResults {
  bike?: {
    ftp: number;
    date: string;
  };
  run?: {
    testType: '3km' | '5km';
    testTime: number; // in seconds
    date: string;
  };
  swim?: {
    time400m: number; // in seconds
    date: string;
  };
}

// Specific functions for each sport
export async function saveBikeTest(ftp: number): Promise<void> {
  const currentData = await getTestResults();
  const updatedData: TestResults = {
    ...currentData,
    bike: {
      ftp,
      date: new Date().toISOString(),
    }
  };
  
  await saveValue('testResults', JSON.stringify(updatedData));
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
  
  await saveValue('testResults', JSON.stringify(updatedData));
}

export async function saveSwimTest(time400m: number): Promise<void> {
  const currentData = await getTestResults();
  const updatedData: TestResults = {
    ...currentData,
    swim: {
      time400m,
      date: new Date().toISOString(),
    }
  };
  
  await saveValue('testResults', JSON.stringify(updatedData));
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
  saveBikeTest,
  saveRunTest,
  saveSwimTest,
  getTestResults,
};