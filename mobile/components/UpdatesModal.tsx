import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DemoBadge } from '@/components/DemoBadge';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Chevron, imageSource } from '@/components/ScanHistoryCard';
import { colors, hitSlop, radii, shadows } from '@/constants/theme';
import { IS_DEMO } from '@/services/config';
import { formatConfidence, formatDate } from '@/services/labels';
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

/** Figma "Updates": 329 × 410 white panel, radius 30, close ⊗ + "Updates" Cal Sans 24, rows with 3 px #9CCB81 border. */
export function UpdatesModal({ visible, updates, loading, error, onRetry, onClose, onOpen }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss updates">
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Close updates">
              <Ionicons name="close-circle-outline" size={28} color={colors.green900} />
            </Pressable>
            <AppText variant="h2" color={colors.green900} style={styles.headerTitle}>
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
              <AppText variant="title" color={colors.green700} align="center" style={styles.emptyTitle}>
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
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${update.title}. ${update.label}. Confidence ${formatConfidence(update.confidence)}`}
      style={({ pressed }) => [styles.row, !update.isRead && styles.rowUnread, pressed && styles.rowPressed]}
    >
      <Image source={imageSource(update.imageUri)} style={styles.thumb} contentFit="cover" transition={150} />
      <View style={styles.rowBody}>
        <AppText variant="title" color={colors.green500} numberOfLines={1}>
          {update.title}
        </AppText>
        <AppText variant="label" color={colors.green700} style={styles.score}>
          Confidence Score:{' '}
          <AppText variant="label" color={colors.green600} style={styles.score}>
            {formatConfidence(update.confidence)}
          </AppText>
        </AppText>
        <AppText variant="micro" color={colors.green700}>
          Date: {formatDate(update.createdAt)}
        </AppText>
        <AppText variant="micro" color={colors.textFaint} numberOfLines={1}>
          {update.label}
        </AppText>
        {IS_DEMO ? (
          <View style={styles.badge}>
            <DemoBadge compact />
          </View>
        ) : null}
      </View>
      <View style={styles.chevron}>
        <Chevron size={16} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 23 },
  sheet: { width: '100%', maxWidth: 329, maxHeight: '64%', backgroundColor: colors.white, borderRadius: radii.sheet, paddingVertical: 24, paddingHorizontal: 22, ...shadows.modal },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  headerTitle: { fontSize: 24, lineHeight: 28 },
  loader: { paddingVertical: 32 },
  empty: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  emptyTitle: { marginTop: 4 },
  list: { flexGrow: 0 },
  listContent: { paddingHorizontal: 10, paddingBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 100, padding: 14, paddingRight: 10, borderRadius: radii.cardLg, borderWidth: 3, borderColor: colors.green500, backgroundColor: colors.white, marginBottom: 14, ...shadows.cardLg },
  rowUnread: { backgroundColor: colors.green50 },
  rowPressed: { opacity: 0.85 },
  thumb: { width: 66, height: 66, borderRadius: radii.cardLg, backgroundColor: colors.green100 },
  rowBody: { flex: 1, marginLeft: 12, gap: 1 },
  score: { fontSize: 12, lineHeight: 16 },
  badge: { marginTop: 4 },
  chevron: { paddingLeft: 4 },
});
