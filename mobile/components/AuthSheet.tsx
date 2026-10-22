import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { colors, radii } from '@/constants/theme';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Figma "Frame 6": bottom sheet with 30 px top radius, vertical gradient
 * rgba(135,139,57,0.4) → #335321, a 67 × 2 white handle and a Cal Sans 40 title.
 * Fields are 268 wide inside a 375 frame → 54 px side padding.
 */
export function AuthSheet({ title, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
        <LinearGradient colors={['rgba(135,139,57,0.4)', '#335321']} locations={[0, 1]} style={[styles.sheet, { paddingBottom: insets.bottom + 28 }]}>
          <View style={styles.handle} />
          <AppText variant="display" color={colors.white} style={styles.title}>
            {title}
          </AppText>
          {children}
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet, paddingTop: 14, paddingHorizontal: 54 },
  handle: { alignSelf: 'center', width: 67, height: 2, borderRadius: 1, backgroundColor: colors.white, marginBottom: 34 },
  title: { marginBottom: 20, marginLeft: 12 },
});
