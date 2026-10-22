import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radii } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'dark' | 'light' | 'glass' | 'outline';
export type ButtonSize = 'md' | 'sm';

interface Props {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const BG: Record<ButtonVariant, string> = {
  primary: colors.green700,
  dark: colors.green800,
  light: colors.green400,
  glass: 'rgba(255,255,255,0.22)',
  outline: 'transparent',
};

const FG: Record<ButtonVariant, string> = {
  primary: colors.white,
  dark: colors.white,
  light: colors.white,
  glass: colors.white,
  outline: colors.green700,
};

export function PrimaryButton({ title, onPress, variant = 'primary', size = 'md', loading, disabled, style, accessibilityLabel }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: BG[variant] },
        variant === 'outline' && styles.outline,
        variant === 'glass' && styles.glass,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={FG[variant]} />
      ) : (
        <AppText variant="button" color={FG[variant]} style={size === 'sm' && styles.smText}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  md: { minHeight: 48, paddingHorizontal: 24 },
  sm: { minHeight: 36, paddingHorizontal: 18, borderRadius: radii.sm },
  smText: { fontSize: 13 },
  outline: { borderWidth: 1.5, borderColor: colors.green700 },
  glass: { borderWidth: 1, borderColor: colors.glassBorder },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.6 },
});
