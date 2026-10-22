import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, hitSlop } from '@/constants/theme';

interface Props {
  /** "dark" = dark circle on photos; "light" = outlined square on light screens. */
  tone?: 'dark' | 'light';
  /** Where to go if there is no history to pop. */
  fallbackHref?: Href;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function BackButton({ tone = 'light', fallbackHref = '/(app)/home', onPress, style }: Props) {
  const router = useRouter();
  const handle = () => {
    if (onPress) return onPress();
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  };
  const isDark = tone === 'dark';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={hitSlop}
      onPress={handle}
      style={({ pressed }) => [styles.base, isDark ? styles.dark : styles.light, pressed && styles.pressed, style]}
    >
      <Ionicons name="arrow-back" size={18} color={isDark ? colors.white : colors.green800} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  dark: { borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.45)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)' },
  light: { borderRadius: 10, borderWidth: 1.5, borderColor: colors.green800, backgroundColor: 'rgba(255,255,255,0.7)' },
  pressed: { opacity: 0.7 },
});
