import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, LightBackground, PrimaryButton } from '@/components';
import { colors } from '@/constants/theme';

/** SCREEN 12 — Result Saved */
export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goHome = () => router.replace('/(app)/home');
  const viewHistory = () => router.replace('/(app)/history');

  // Hardware back goes Home rather than re-opening the (already saved) result.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goHome();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LightBackground>
      <View style={[styles.body, { paddingTop: insets.top, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.ring}>
          <Ionicons name="checkmark" size={64} color={colors.green500} />
        </View>
        <AppText variant="h1" color={colors.green600} align="center" style={styles.title}>
          Result Saved!
        </AppText>
        <AppText variant="small" color={colors.textMuted} align="center" style={styles.message}>
          Scan is completed, you may view your history or go back to the main home page.
        </AppText>
        <PrimaryButton title="View History" variant="dark" onPress={viewHistory} style={styles.cta} />
        <Pressable onPress={goHome} accessibilityRole="link" hitSlop={10} style={styles.homeLink}>
          <AppText variant="small" color={colors.green800} style={styles.homeText}>
            Home
          </AppText>
        </Pressable>
      </View>
    </LightBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  ring: { width: 136, height: 136, borderRadius: 68, borderWidth: 8, borderColor: colors.green500, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)' },
  title: { marginTop: 28 },
  message: { marginTop: 8, maxWidth: 280 },
  cta: { marginTop: 24, minWidth: 180, minHeight: 44 },
  homeLink: { marginTop: 16 },
  homeText: { fontFamily: 'Poppins_600SemiBold', textDecorationLine: 'underline' },
});
