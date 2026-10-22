import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, fonts, hitSlop, radii } from '@/constants/theme';

const ICONS = {
  email: require('@/assets/icons/email.png'),
  lock: require('@/assets/icons/lock.png'),
} as const;

interface Props extends Omit<TextInputProps, 'style'> {
  icon: keyof typeof ICONS;
  error?: string | null;
  /** "dark" = white-outlined field on the photo sheet (Figma auth screens). */
  tone?: 'dark' | 'light';
  secure?: boolean;
}

/** Figma: 268 × 40, 2 px white border, radius 10, 16 px icon at x=20, Poppins Medium placeholder. */
export function TextField({ icon, error, tone = 'dark', secure, ...inputProps }: Props) {
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);
  const isDark = tone === 'dark';
  const fg = isDark ? colors.white : colors.text;
  const placeholder = isDark ? 'rgba(255,255,255,0.8)' : colors.textFaint;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.field, isDark ? styles.fieldDark : styles.fieldLight, focused && (isDark ? styles.focusedDark : styles.focusedLight), !!error && styles.fieldError]}>
        <Image source={ICONS[icon]} style={[styles.icon, !isDark && styles.iconLight]} resizeMode="contain" />
        <TextInput
          {...inputProps}
          secureTextEntry={hidden}
          placeholderTextColor={placeholder}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          style={[styles.input, { color: fg }]}
          autoCapitalize={inputProps.autoCapitalize ?? 'none'}
          autoCorrect={false}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'} style={styles.eye}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={isDark ? 'rgba(255,255,255,0.85)' : colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="tiny" color={isDark ? '#FFD2CB' : colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  field: { flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: radii.input, paddingLeft: 18, paddingRight: 12, borderWidth: 2 },
  fieldDark: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: colors.white },
  fieldLight: { backgroundColor: colors.white, borderColor: colors.border },
  focusedDark: { backgroundColor: 'rgba(255,255,255,0.16)' },
  focusedLight: { borderColor: colors.green700 },
  fieldError: { borderColor: '#FF8A75' },
  icon: { width: 16, height: 16, marginRight: 14 },
  iconLight: { tintColor: colors.green700 },
  input: { flex: 1, fontFamily: fonts.medium, fontSize: 12, paddingVertical: 8 },
  eye: { paddingLeft: 8 },
  error: { marginTop: 4, marginLeft: 6 },
});
