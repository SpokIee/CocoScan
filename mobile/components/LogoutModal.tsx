import React from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, radii, shadows } from '@/constants/theme';

interface Props {
  visible: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Figma "Log Out": 329 × 294 white card, radius 30, 79 px icon, Cal Sans 26 "Logout", Cancel #84B46E / Logout #43662E. */
export function LogoutModal({ visible, loading, onCancel, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel} accessibilityLabel="Dismiss">
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Image source={require('@/assets/icons/logout.png')} style={styles.icon} resizeMode="contain" />
          <AppText variant="h2" color={colors.green900} align="center" style={styles.title}>
            Logout
          </AppText>
          <AppText variant="smallMedium" color={colors.green700} align="center">
            Are you sure you want to logout?
          </AppText>
          <View style={styles.actions}>
            <PrimaryButton title="Cancel" variant="light" onPress={onCancel} disabled={loading} />
            <PrimaryButton title="Logout" variant="primary" onPress={onConfirm} loading={loading} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 23 },
  sheet: { width: '100%', maxWidth: 329, backgroundColor: colors.white, borderRadius: radii.sheet, paddingTop: 33, paddingBottom: 46, paddingHorizontal: 28, alignItems: 'center', ...shadows.modal },
  icon: { width: 79, height: 79 },
  title: { marginTop: 9, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 13, marginTop: 28 },
});
