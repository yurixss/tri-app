import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native'; 
import { Share2, Copy } from 'lucide-react-native'; 
import { ThemedText } from './ThemedText';
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
      <Pressable 
        style={({ pressed }) => [
          styles.button,
          { borderColor: color },
          { opacity: pressed ? 0.6 : 1 },
        ]}
        onPress={handleCopy}
      >
        <Copy size={16} color={color} />
        <ThemedText style={[styles.buttonText, { color }]}>
          Copy
        </ThemedText>
      </Pressable>

      <Pressable 
        style={({ pressed }) => [
          styles.button,
          { borderColor: color },
          { opacity: pressed ? 0.6 : 1 },
        ]}
        onPress={handleShare}
      >
        <Share2 size={16} color={color} />
        <ThemedText style={[styles.buttonText, { color }]}>
          Share
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});