import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AppText, LightBackground, PrimaryButton } from '@/components';
import { colors, shadows } from '@/constants/theme';

/**
 * SCREEN 12 — Result Saved (Figma 13:1774).
 * 194 px ring with 15 px #4F7730 stroke + shadow, 75 px check (stroke 15 #43662E),
 * "Result Saved!" Cal Sans 35, body Poppins 16, View History 195 × 50, underlined "Home".
 */
export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goHome = () => router.replace('/(app)/home');
  const viewHistory = () => router.replace('/(app)/history');

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
          <Svg width={75} height={76} viewBox="0 0 75 76" fill="none">
            <Path d="M67.5 7.5L26.25 68.5L7.5 40.77" stroke={colors.green800} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <AppText variant="h1" color={colors.green700} align="center" style={styles.title}>
          Result Saved!
        </AppText>
        <AppText color={colors.green700} align="center" style={styles.message}>
          Scan is completed, you may view your history or go back to the main home page.
        </AppText>
        <PrimaryButton title="View History" size="lg" onPress={viewHistory} style={styles.cta} />
        <Pressable onPress={goHome} accessibilityRole="link" hitSlop={10} style={styles.homeLink}>
          <AppText variant="title" color={colors.green700} style={styles.homeText}>
            Home
          </AppText>
        </Pressable>
      </View>
    </LightBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 },
  ring: { width: 194, height: 190, borderRadius: 97, borderWidth: 15, borderColor: colors.green700, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.5)', ...shadows.cardLg },
  title: { marginTop: 36 },
  message: { fontSize: 16, lineHeight: 20, marginTop: 8, maxWidth: 279 },
  cta: { marginTop: 22 },
  homeLink: { marginTop: 16 },
  homeText: { textDecorationLine: 'underline' },
});
