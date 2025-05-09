import { Platform } from 'react-native';

const tintColorLight = '#2563EB';
const tintColorDark = '#3B82F6';

export default {
  light: {
    text: '#000000',
    background: '#F9FAFB',
    tint: tintColorLight,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorLight,
    cardBackground: '#FFFFFF',
    border: '#E5E7EB',
    notification: '#FF3B30',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  dark: {
    text: '#FFFFFF',
    background: '#111827',
    tint: tintColorDark,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorDark,
    cardBackground: '#1F2937',
    border: '#374151',
    notification: '#FF453A',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
  },
  shared: {
    swim: '#0EA5E9',   // Blue
    bike: '#10B981',   // Green
    run: '#F97316',    // Orange
    nutrition: '#EC4899', // Pink
    profile: '#8B5CF6', // Purple
    primary: '#2563EB',
    secondary: '#8B5CF6',
    accent: '#EC4899',
  },
};