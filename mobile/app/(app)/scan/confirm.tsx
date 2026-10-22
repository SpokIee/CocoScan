import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, PrimaryButton } from '@/components';
import { colors, radii, shadows } from '@/constants/theme';

/**
 * SCREEN 9 — Capture Confirmation (Figma 19:1913).
 * Full-bleed photo; 155 px bottom panel with rgba(79,119,48,.5)→rgba(51,83,33,.5)
 * gradient, radius 30 and upward shadow; Retry (#84B46E) at x=35, OK (#43662E) at x=218.
 */
export default function ConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri: string }>();

  const retry = () => (router.canGoBack() ? router.back() : router.replace('/(app)/scan/camera'));
  const confirm = () => {
    if (!uri) return;
    router.replace({ pathname: '/(app)/scan/detecting', params: { uri } });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={120} />
      ) : (
        <View style={styles.missing}>
          <AppText variant="body" color={colors.white} align="center">
            No image was captured. Please go back and try again.
          </AppText>
        </View>
      )}
      <View style={[styles.topBar, { paddingTop: insets.top + 17 }]}>
        <BackButton tone="dark" onPress={retry} />
      </View>

      <LinearGradient colors={['rgba(79,119,48,0.5)', 'rgba(51,83,33,0.5)']} style={[styles.bottom, { paddingBottom: insets.bottom + 36 }]}>
        <AppText variant="small" color="rgba(255,255,255,0.92)" align="center" style={styles.caption}>
          Is the leaf clear and well lit?
        </AppText>
        <View style={styles.actions}>
          <PrimaryButton title="Retry" variant="light" onPress={retry} />
          <PrimaryButton title="OK" variant="primary" onPress={confirm} disabled={!uri} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  topBar: { paddingHorizontal: 19 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 28, paddingHorizontal: 35, borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet, ...shadows.modal },
  caption: { marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
});
