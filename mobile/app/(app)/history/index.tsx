import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, EmptyState, ErrorBanner, LightBackground, PrimaryButton, ScanHistoryCard, ScreenHeader } from '@/components';
import { colors } from '@/constants/theme';
import { useScanContext } from '@/context/ScanContext';
import { errorMessage } from '@/hooks/useAsync';
import { scanService } from '@/services';
import type { ScanResult } from '@/types';

/**
 * SCREEN 13 — Scan History (Figma 16:1801).
 * Cards 342 × 132 at x=15 with 23 px gaps; footer "Back to Home" (underlined, x=35)
 * and "Scan New" 98 × 33 #84B46E at the right.
 */
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
          ListEmptyComponent={<EmptyState icon="leaf-outline" title="No scans yet" message="You haven't scanned a coconut leaf yet. Saved results will show up here, most recent first." actionLabel="Scan a Leaf" onAction={scanNew} />}
        />
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 26 }]}>
        <Pressable onPress={goHome} accessibilityRole="link" hitSlop={10}>
          <AppText variant="tiny" color={colors.green700} style={styles.backHome}>
            Back to Home
          </AppText>
        </Pressable>
        <PrimaryButton title="Scan New" variant="light" size="sm" onPress={scanNew} />
      </View>
    </LightBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorWrap: { padding: 20 },
  list: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 20 },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 35, paddingRight: 26, paddingTop: 8 },
  backHome: { fontFamily: 'CalSans_400Regular', textDecorationLine: 'underline' },
});
