import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DemoBadge } from '@/components/DemoBadge';
import { ErrorBanner } from '@/components/ErrorBanner';
import { imageSource } from '@/components/ScanHistoryCard';
import { colors, hitSlop, radii, shadows, spacing } from '@/constants/theme';
import { IS_DEMO } from '@/services/config';
import { formatConfidence, formatDate, toneColor, toneFor } from '@/services/labels';
import type { ScanUpdate } from '@/types';

interface Props {
  visible: boolean;
  updates: ScanUpdate[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
  onOpen: (update: ScanUpdate) => void;
}

export function UpdatesModal({ visible, updates, loading, error, onRetry, onClose, onOpen }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss updates">
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Close updates">
              <Ionicons name="close-circle-outline" size={26} color={colors.green800} />
            </Pressable>
            <AppText variant="h3" color={colors.green800} style={styles.headerTitle}>
              Updates
            </AppText>
          </View>

          {loading && !updates ? (
            <ActivityIndicator color={colors.green700} style={styles.loader} />
          ) : error ? (
            <ErrorBanner message={error} onRetry={onRetry} />
          ) : !updates || updates.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={28} color={colors.green600} />
              <AppText variant="bodyMedium" color={colors.green800} align="center" style={styles.emptyTitle}>
                No updates yet
              </AppText>
              <AppText variant="small" color={colors.textMuted} align="center">
                Scan a coconut leaf and your results will appear here.
              </AppText>
            </View>
          ) : (
            <FlatList
              data={updates}
              keyExtractor={(u) => u.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <UpdateRow update={item} onPress={() => onOpen(item)} />}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function UpdateRow({ update, onPress }: { update: ScanUpdate; onPress: () => void }) {
  const tone = toneFor(update.predictedClass);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${update.title}. ${update.label}. Confidence ${formatConfidence(update.confidence)}`}
      style={({ pressed }) => [styles.row, !update.isRead && styles.rowUnread, pressed && styles.rowPressed]}
    >
      <Image source={imageSource(update.imageUri)} style={styles.thumb} contentFit="cover" transition={150} />
      <View style={styles.rowBody}>
        <AppText variant="bodyMedium" color={colors.green600} numberOfLines={1}>
          {update.title}
        </AppText>
        <AppText variant="tiny" color={toneColor(tone)} numberOfLines={1} style={styles.label}>
          {update.label}
        </AppText>
        <AppText variant="tiny" color={colors.text}>
          Confidence Score:{' '}
          <AppText variant="tiny" color={colors.green500} style={styles.bold}>
            {formatConfidence(update.confidence)}
          </AppText>
        </AppText>
        <AppText variant="tiny" color={colors.textMuted}>
          Date: {formatDate(update.createdAt)}
        </AppText>
        {IS_DEMO ? <DemoBadge compact /> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  sheet: { width: '100%', maxWidth: 360, maxHeight: '70%', backgroundColor: colors.white, borderRadius: radii.xxl, padding: spacing.xl, ...shadows.modal },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.lg },
  headerTitle: { marginTop: 2 },
  loader: { paddingVertical: spacing.xxxl },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: 6 },
  emptyTitle: { marginTop: 4 },
  list: { flexGrow: 0 },
  listContent: { paddingBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.green200, backgroundColor: colors.white, marginBottom: spacing.md },
  rowUnread: { backgroundColor: colors.green50 },
  rowPressed: { opacity: 0.85 },
  thumb: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.green100 },
  rowBody: { flex: 1, marginHorizontal: spacing.md, gap: 1 },
  label: { fontFamily: 'Poppins_600SemiBold' },
  bold: { fontFamily: 'Poppins_600SemiBold' },
});
