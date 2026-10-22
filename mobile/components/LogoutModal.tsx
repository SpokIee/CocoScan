import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, radii, shadows, spacing } from '@/constants/theme';

interface Props {
  visible: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ visible, loading, onCancel, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel} accessibilityLabel="Dismiss">
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Ionicons name="log-out-outline" size={44} color={colors.green800} />
          <AppText variant="h2" color={colors.green800} style={styles.title}>
            Logout
          </AppText>
          <AppText variant="small" color={colors.textMuted} align="center">
            Are you sure you want to logout?
          </AppText>
          <View style={styles.actions}>
            <PrimaryButton title="Cancel" variant="light" size="sm" onPress={onCancel} disabled={loading} style={styles.btn} />
            <PrimaryButton title="Logout" variant="dark" size="sm" onPress={onConfirm} loading={loading} style={styles.btn} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  sheet: { width: '100%', maxWidth: 340, backgroundColor: colors.white, borderRadius: radii.xxl, paddingVertical: 34, paddingHorizontal: 28, alignItems: 'center', ...shadows.modal },
  title: { marginTop: spacing.md, marginBottom: spacing.xs },
  actions: { flexDirection: 'row', gap: 12, marginTop: spacing.xxl, width: '100%' },
  btn: { flex: 1, minHeight: 40 },
});
