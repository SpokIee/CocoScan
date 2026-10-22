import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { BUTTON, colors, radii, shadows } from '@/constants/theme';

/**
 * primary = dark green (#43662E): Login / OK / Save / Logout / View History
 * light   = light green (#84B46E): Cancel / Retry / Scan Again / Scan New
 * muted   = #4F7730 @ 60 % used by the Sign Up button on the photo sheet
 * glass / outline for secondary actions not in Figma
 */
export type ButtonVariant = 'primary' | 'light' | 'muted' | 'glass' | 'outline';
/** md = 126×42 Figma pair button; lg = 195×50 (View History); sm = 98×33 (Scan New); wide = full-width 45 (Get Started/Login). */
export type ButtonSize = 'md' | 'lg' | 'sm' | 'wide';

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
  primary: colors.green800,
  light: colors.green600,
  muted: 'rgba(79,119,48,0.85)',
  glass: 'rgba(255,255,255,0.22)',
  outline: 'transparent',
};

const FG: Record<ButtonVariant, string> = {
  primary: colors.white,
  light: colors.white,
  muted: colors.white,
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
        styles[size],
        { backgroundColor: BG[variant] },
        variant !== 'outline' && variant !== 'glass' && shadows.button,
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
        <AppText variant="button" color={FG[variant]} style={size === 'lg' ? styles.lgText : size === 'wide' ? styles.wideText : undefined}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radii.button, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  md: { minWidth: BUTTON.width, height: BUTTON.height, paddingHorizontal: 16 },
  lg: { minWidth: 195, height: 50, paddingHorizontal: 24 },
  sm: { minWidth: 98, height: 33, paddingHorizontal: 14 },
  wide: { alignSelf: 'stretch', height: 45, paddingHorizontal: 24 },
  lgText: { fontSize: 20, lineHeight: 24 },
  wideText: { fontSize: 15, lineHeight: 19 },
  outline: { borderWidth: 1.5, borderColor: colors.green700 },
  glass: { borderWidth: 1, borderColor: colors.glassBorder },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.6 },
});
