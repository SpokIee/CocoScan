import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, typography } from '@/constants/theme';

type Variant = keyof typeof typography;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
}

export function AppText({ variant = 'body', color = colors.text, align, style, ...rest }: Props) {
  return <Text {...rest} style={[styles.base, typography[variant], { color, textAlign: align }, style]} />;
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
