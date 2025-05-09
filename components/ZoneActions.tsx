import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Share2, Copy } from 'lucide-react-native';
import { ThemedText } from './ThemedText';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { shareZones, copyZonesToClipboard } from '@/utils/shareUtils';

interface ZoneActionsProps {
  title: string;
  zones: any[];
  color: string;
  onCopySuccess?: () => void;
}

export function ZoneActions({ title, zones, color, onCopySuccess }: ZoneActionsProps) {
  const handleShare = async () => {
    await shareZones(title, zones);
  };

  const handleCopy = async () => {
    const success = await copyZonesToClipboard(title, zones);
    if (success && onCopySuccess) {
      onCopySuccess();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, { borderColor: color }]} 
        onPress={handleCopy}
      >
        <Copy size={20} color={color} />
        <ThemedText style={[styles.buttonText, { color }]}>
          Copy
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, { borderColor: color }]} 
        onPress={handleShare}
      >
        <Share2 size={20} color={color} />
        <ThemedText style={[styles.buttonText, { color }]}>
          Share
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});