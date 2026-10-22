import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

import { colors } from '@/constants/theme';

/** Soft white-to-green leafy background used by Detecting / Result / Saved / History. */
export function LightBackground({ children, strength = 1 }: { children: React.ReactNode; strength?: number }) {
  return (
    <ImageBackground source={require('@/assets/images/light-leaf-bg.png')} style={styles.bg} imageStyle={{ opacity: 0.55 * strength }} resizeMode="cover">
      <StatusBar style="dark" />
      <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.4)', 'rgba(220,238,210,0.6)']} style={StyleSheet.absoluteFill} />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.background },
});
