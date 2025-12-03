import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';

type Props = {
  visible: boolean;
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export const ScrollToTopButton: React.FC<Props> = ({ visible, onPress, style, accessibilityLabel }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const opacity = anim;

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.container, { transform: [{ translateY }], opacity }, style]}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? 'Voltar ao topo'}
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.button}
      >
        <Text style={styles.icon}>↑</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 28,
    zIndex: 50,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.shared.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    color: Colors.shared.backgrounds?.pureWhite ?? '#FFF',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
});

export default ScrollToTopButton;
