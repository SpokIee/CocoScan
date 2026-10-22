import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

import { colors } from '@/constants/theme';

/**
 * Figma "oco (1) 1" white leaf photo at 30 % opacity plus the bottom
 * gradient rgba(217,217,217,0) → rgba(180,255,137,0.2) over the lower 40 %.
 * Used by Detecting / Saved / History (and Home at 67 %).
 */
export function LightBackground({ children, opacity = 0.3 }: { children: React.ReactNode; opacity?: number }) {
  return (
    <ImageBackground source={require('@/assets/images/light-leaf-bg.png')} style={styles.bg} imageStyle={{ opacity }} resizeMode="cover">
      <StatusBar style="dark" />
      <LinearGradient colors={['rgba(217,217,217,0)', 'rgba(180,255,137,0.2)']} style={styles.bottomGlow} pointerEvents="none" />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.white },
  bottomGlow: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%' },
});
