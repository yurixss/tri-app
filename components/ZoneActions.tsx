import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native'; 
import { Share2, Copy } from 'lucide-react-native'; 

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
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
  },
});