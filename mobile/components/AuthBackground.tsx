import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/theme';
import { APP_NAME, TAGLINE } from '@/services/config';

interface Props {
  children: React.ReactNode;
  /** Where the brand block sits: "bottom" (Welcome) or "upper" (Login / Sign-up). */
  brandPosition?: 'bottom' | 'upper';
}

/** Full-bleed coconut photograph + dark gradient + "Welcome to CocoScan" branding. */
export function AuthBackground({ children, brandPosition = 'upper' }: Props) {
  return (
    <ImageBackground source={require('@/assets/images/welcome-bg.png')} style={styles.bg} resizeMode="cover">
      <StatusBar style="light" />
      <LinearGradient colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.35)', 'rgba(9,24,8,0.92)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      {brandPosition === 'upper' ? <Brand style={styles.brandUpper} /> : null}
      {children}
    </ImageBackground>
  );
}

export function Brand({ style }: { style?: object }) {
  return (
    <View style={[styles.brand, style]} pointerEvents="none">
      <AppText variant="display" color={colors.white} align="center" style={styles.title}>
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
  bg: { flex: 1, backgroundColor: colors.green900 },
  brand: { alignItems: 'center', paddingHorizontal: 24 },
  brandUpper: { position: 'absolute', top: '26%', left: 0, right: 0 },
  title: { textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  tagline: { marginTop: 2, opacity: 0.95 },
});
