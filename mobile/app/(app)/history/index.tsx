import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, EmptyState, ErrorBanner, LightBackground, PrimaryButton, ScanHistoryCard, ScreenHeader } from '@/components';
import { colors, spacing } from '@/constants/theme';
import { useScanContext } from '@/context/ScanContext';
import { errorMessage } from '@/hooks/useAsync';
import { scanService } from '@/services';
import type { ScanResult } from '@/types';

/** SCREEN 13 — Scan History */
export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { version, setCurrentResult } = useScanContext();
  const [scans, setScans] = useState<ScanResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      setScans(await scanService.history());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(scans !== null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, version]),
  );

  const open = (scan: ScanResult) => {
    setCurrentResult(scan);
    router.push({ pathname: '/(app)/history/[id]', params: { id: scan.id } });
  };
  const goHome = () => router.replace('/(app)/home');
  const scanNew = () => router.push('/(app)/scan/camera');

  return (
    <LightBackground>
      <ScreenHeader title="Scan History" onBack={goHome} />

      {loading && scans === null ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.green700} />
        </View>
      ) : error && !scans ? (
        <View style={styles.errorWrap}>
          <ErrorBanner message={error} onRetry={() => load()} />
        </View>
      ) : (
        <FlatList
          data={scans ?? []}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => <ScanHistoryCard scan={item} onPress={() => open(item)} />}
          contentContainerStyle={[styles.list, (scans?.length ?? 0) === 0 && styles.listEmpty]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(true);
              }}
              tintColor={colors.green700}
              colors={[colors.green700]}
            />
          }
          ListHeaderComponent={error ? <ErrorBanner message={error} onRetry={() => load(true)} /> : undefined}
          ListEmptyComponent={
            <EmptyState icon="leaf-outline" title="No scans yet" message="You haven't scanned a coconut leaf yet. Saved results will show up here, most recent first." actionLabel="Scan a Leaf" onAction={scanNew} />
          }
        />
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        <Pressable onPress={goHome} accessibilityRole="link" hitSlop={10}>
          <AppText variant="tiny" color={colors.green800} style={styles.backHome}>
            Back to Home
          </AppText>
        </Pressable>
        <PrimaryButton title="Scan New" size="sm" onPress={scanNew} />
      </View>
    </LightBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorWrap: { padding: spacing.screen },
  list: { paddingHorizontal: spacing.screen, paddingTop: spacing.md, paddingBottom: spacing.xl },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screen, paddingTop: spacing.sm },
  backHome: { fontFamily: 'Poppins_600SemiBold', textDecorationLine: 'underline' },
});
