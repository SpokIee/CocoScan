import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, shadows } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** "sm" = Home nav cards (radius 8); "lg" = History / Updates rows (radius 20). */
  size?: 'sm' | 'lg';
}

/** Rounded white card with the Figma shadows. */
export function Card({ children, style, onPress, accessibilityLabel, size = 'sm' }: Props) {
  const base = [styles.card, size === 'lg' ? styles.lg : styles.sm];
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [...base, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[...base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface },
  sm: { borderRadius: radii.card, ...shadows.card },
  lg: { borderRadius: radii.cardLg, ...shadows.cardLg },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
