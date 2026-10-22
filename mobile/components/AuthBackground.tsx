import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/theme';
import { APP_NAME, TAGLINE } from '@/services/config';

interface Props {
  children: React.ReactNode;
  /** "bottom" (Welcome) or "upper" (Login / Sign-up, brand at y≈214 of 812). */
  brandPosition?: 'bottom' | 'upper';
}

/** Figma "Front 1": full-bleed coconut photo with a rgba(37,71,11,0.2) tint. */
export function AuthBackground({ children, brandPosition = 'upper' }: Props) {
  return (
    <ImageBackground source={require('@/assets/images/welcome-bg.png')} style={styles.bg} resizeMode="cover">
      <StatusBar style="light" />
      <View style={[StyleSheet.absoluteFill, styles.tint]} />
      {brandPosition === 'upper' ? <Brand style={styles.brandUpper} /> : null}
      {children}
    </ImageBackground>
  );
}

/** "Welcome to / CocoScan" — Cal Sans 40/42 centered, tagline Poppins 12. */
export function Brand({ style }: { style?: object }) {
  return (
    <View style={[styles.brand, style]} pointerEvents="none">
      <AppText variant="display" color={colors.white} align="center">
        Welcome to{'\n'}
        {APP_NAME}
      </AppText>
      <AppText variant="small" color={colors.white} align="center" style={styles.tagline}>
        {TAGLINE}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#1F3A14' },
  tint: { backgroundColor: colors.photoTint },
  brand: { alignItems: 'center', paddingHorizontal: 24 },
  brandUpper: { position: 'absolute', top: '26%', left: 0, right: 0 },
  tagline: { marginTop: 4 },
});
