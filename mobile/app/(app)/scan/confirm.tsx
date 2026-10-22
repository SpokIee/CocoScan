import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, PrimaryButton } from '@/components';
import { colors, spacing } from '@/constants/theme';

/** SCREEN 9 — Capture Confirmation */
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
      <LinearGradient colors={['rgba(0,0,0,0.35)', 'transparent']} style={[styles.topShade, { height: insets.top + 70 }]} />
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <BackButton tone="dark" onPress={retry} />
      </View>

      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={[styles.bottom, { paddingBottom: insets.bottom + 26 }]}>
        <AppText variant="small" color="rgba(255,255,255,0.9)" align="center" style={styles.caption}>
          Is the leaf clear and well lit?
        </AppText>
        <View style={styles.actions}>
          <PrimaryButton title="Retry" variant="glass" size="sm" onPress={retry} style={styles.btn} />
          <PrimaryButton title="OK" variant="primary" size="sm" onPress={confirm} disabled={!uri} style={styles.btn} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: { paddingHorizontal: spacing.screen },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 60, paddingHorizontal: 32 },
  caption: { marginBottom: 14 },
  actions: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  btn: { flex: 1, maxWidth: 150, minHeight: 36 },
});
