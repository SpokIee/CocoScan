import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { colors, spacing } from '@/constants/theme';

interface Props {
  title: string;
  children: React.ReactNode;
}

/** Bottom form area with the thin white "handle" used on Login / Sign-up. */
export function AuthSheet({ title, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.handle} />
        <AppText variant="h1" color={colors.white} style={styles.title}>
          {title}
        </AppText>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: spacing.screen + 8 },
  handle: { alignSelf: 'center', width: 44, height: 3, borderRadius: 2, backgroundColor: colors.white, marginBottom: 26 },
  title: { marginBottom: 14, fontSize: 28, lineHeight: 34 },
});
