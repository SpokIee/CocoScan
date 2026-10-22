import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, fonts, hitSlop, radii } from '@/constants/theme';

interface Props extends Omit<TextInputProps, 'style'> {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  error?: string | null;
  /** "dark" = translucent field on a photo background (auth screens). */
  tone?: 'dark' | 'light';
  secure?: boolean;
}

export function TextField({ icon, error, tone = 'dark', secure, ...inputProps }: Props) {
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);
  const isDark = tone === 'dark';
  const fg = isDark ? colors.white : colors.text;
  const placeholder = isDark ? 'rgba(255,255,255,0.75)' : colors.textFaint;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.field,
          isDark ? styles.fieldDark : styles.fieldLight,
          focused && (isDark ? styles.focusedDark : styles.focusedLight),
          !!error && styles.fieldError,
        ]}
      >
        <View style={[styles.iconBox, isDark ? styles.iconBoxDark : styles.iconBoxLight]}>
          <Ionicons name={icon} size={14} color={isDark ? colors.green800 : colors.white} />
        </View>
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
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={hitSlop}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            style={styles.eye}
          >
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={isDark ? 'rgba(255,255,255,0.85)' : colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="small" color={isDark ? '#FFD2CB' : colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    borderRadius: radii.md,
    paddingLeft: 10,
    paddingRight: 12,
    borderWidth: 1.5,
  },
  fieldDark: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.85)' },
  fieldLight: { backgroundColor: colors.white, borderColor: colors.border },
  focusedDark: { backgroundColor: 'rgba(255,255,255,0.2)' },
  focusedLight: { borderColor: colors.green600 },
  fieldError: { borderColor: '#FF8A75' },
  iconBox: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  iconBoxDark: { backgroundColor: colors.white },
  iconBoxLight: { backgroundColor: colors.green700 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 13, paddingVertical: 10 },
  eye: { paddingLeft: 8 },
  error: { marginTop: 4, marginLeft: 6 },
});
