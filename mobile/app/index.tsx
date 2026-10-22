import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBackground, Brand, PrimaryButton } from '@/components';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

/** SCREEN 1 — Welcome */
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <View style={styles.restoring}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }
  if (isAuthenticated) return <Redirect href="/(app)/home" />;

  return (
    <AuthBackground brandPosition="bottom">
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 36 }]}>
        <Brand />
        <PrimaryButton title="Get Started" onPress={() => router.push('/(auth)/login')} style={styles.cta} />
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  restoring: { flex: 1, backgroundColor: colors.green800, alignItems: 'center', justifyContent: 'center' },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: spacing.screen },
  cta: { marginTop: 22, marginHorizontal: 12 },
});
