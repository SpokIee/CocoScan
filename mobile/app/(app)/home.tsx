import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Card, DemoBadge, LogoutModal, UpdatesModal } from '@/components';
import { ABOUT_TEXT } from '@/constants/diseases';
import { colors, hitSlop, radii, shadows, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useScanContext } from '@/context/ScanContext';
import { errorMessage } from '@/hooks/useAsync';
import { scanService } from '@/services';
import { IS_DEMO } from '@/services/config';
import type { ScanUpdate } from '@/types';

/** SCREEN 4 — Home Dashboard (+ SCREEN 6 Updates modal, SCREEN 7 Logout modal) */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { version, setCurrentResult } = useScanContext();

  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [updates, setUpdates] = useState<ScanUpdate[] | null>(null);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [updatesError, setUpdatesError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadUpdates = useCallback(async () => {
    setUpdatesLoading(true);
    setUpdatesError(null);
    try {
      const rows = await scanService.updates();
      setUpdates(rows);
      setUnread(rows.filter((u) => !u.isRead).length);
    } catch (e) {
      setUpdatesError(errorMessage(e));
    } finally {
      setUpdatesLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUpdates();
    }, [loadUpdates, version]),
  );

  const openUpdate = async (u: ScanUpdate) => {
    setUpdatesOpen(false);
    try {
      await scanService.markUpdateRead(u.id);
    } catch {
      /* non-critical */
    }
    const result = await scanService.get(u.resultId).catch(() => null);
    if (result) {
      setCurrentResult(result);
      router.push({ pathname: '/(app)/history/[id]', params: { id: result.id } });
    }
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setLogoutOpen(false);
      router.replace('/(auth)/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const firstName = user?.name?.trim() || user?.email.split('@')[0] || 'Farmer';

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ImageBackground source={require('@/assets/images/light-leaf-bg.png')} style={StyleSheet.absoluteFill} imageStyle={styles.bgImage} resizeMode="cover" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <AppText variant="h3" color={colors.green600} style={styles.welcome}>
              Welcome back
            </AppText>
            <AppText variant="small" color={colors.textMuted} style={styles.name} numberOfLines={1}>
              {firstName}!
            </AppText>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setLogoutOpen(true)} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Log out" style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
              <Ionicons name="log-out-outline" size={18} color={colors.green800} />
            </Pressable>
            <Pressable
              onPress={() => setUpdatesOpen(true)}
              hitSlop={hitSlop}
              accessibilityRole="button"
              accessibilityLabel={unread ? `Updates, ${unread} unread` : 'Updates'}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            >
              <Ionicons name="notifications-outline" size={18} color={colors.green800} />
              {unread > 0 ? <View style={styles.dot} /> : null}
            </Pressable>
          </View>
        </View>

        <AppText variant="h1" color={colors.green600} style={styles.heading}>
          Curious about your{'\n'}coconut’s health?
        </AppText>

        {IS_DEMO ? <DemoBadge text="Demo Mode — predictions are simulated" /> : null}

        {/* Disease information banner */}
        <Pressable onPress={() => router.push('/(app)/diseases')} accessibilityRole="button" accessibilityLabel="All About Coconut Diseases. Learn more" style={({ pressed }) => [styles.banner, pressed && styles.pressed]}>
          <Image source={require('@/assets/images/home-banner.png')} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerBody}>
            <AppText variant="bodyMedium" color={colors.white} style={styles.bannerTitle}>
              All About Coconut Diseases
            </AppText>
            <AppText variant="tiny" color="rgba(255,255,255,0.85)" numberOfLines={3}>
              Discover common coconut diseases, their symptoms, causes, and ways to protect your crops.
            </AppText>
            <View style={styles.learnMore}>
              <AppText variant="tiny" color={colors.green800} style={styles.learnMoreText}>
                Learn More
              </AppText>
            </View>
          </View>
        </Pressable>

        {/* Three navigation cards */}
        <View style={styles.cardRow}>
          <NavCard
            icon={<Ionicons name="camera-outline" size={26} color={colors.green700} />}
            title="Scan Now"
            subtitle="Coconut Leaf"
            description="Scan a leaf for diseases"
            onPress={() => router.push('/(app)/scan/camera')}
          />
          <NavCard
            icon={<Ionicons name="book-outline" size={26} color={colors.green700} />}
            title="Read"
            subtitle="About Coconuts"
            description="Discover more diseases and health tips"
            onPress={() => router.push('/(app)/diseases')}
          />
          <NavCard
            icon={<MaterialCommunityIcons name="history" size={26} color={colors.green700} />}
            title="Recently"
            subtitle="Scanned"
            description="Check your scan history"
            onPress={() => router.push('/(app)/history')}
          />
        </View>

        {/* About card */}
        <Pressable onPress={() => router.push('/(app)/diseases')} accessibilityRole="button" accessibilityLabel="About CocoScan" style={({ pressed }) => [styles.aboutWrap, pressed && styles.pressed]}>
          <ImageBackground source={require('@/assets/images/about-bg.png')} style={styles.about} imageStyle={styles.aboutImage} resizeMode="cover">
            <View style={styles.aboutTint} />
            <AppText variant="h2" color={colors.white}>
              About CocoScan
            </AppText>
            <AppText variant="small" color="rgba(255,255,255,0.92)" style={styles.aboutText}>
              {ABOUT_TEXT}
            </AppText>
            <Ionicons name="chevron-forward" size={20} color={colors.white} style={styles.aboutArrow} />
          </ImageBackground>
        </Pressable>
      </ScrollView>

      <UpdatesModal visible={updatesOpen} updates={updates} loading={updatesLoading} error={updatesError} onRetry={loadUpdates} onClose={() => setUpdatesOpen(false)} onOpen={openUpdate} />
      <LogoutModal visible={logoutOpen} loading={loggingOut} onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />
    </View>
  );
}

function NavCard({ icon, title, subtitle, description, onPress }: { icon: React.ReactNode; title: string; subtitle: string; description: string; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.navCard} accessibilityLabel={`${title} ${subtitle}`}>
      <View style={styles.navIcon}>{icon}</View>
      <AppText variant="bodyMedium" color={colors.green600} align="center" style={styles.navTitle}>
        {title}
      </AppText>
      <AppText variant="tiny" color={colors.textMuted} align="center" style={styles.navSubtitle}>
        {subtitle}
      </AppText>
      <AppText variant="tiny" color={colors.textFaint} align="center" style={styles.navDesc} numberOfLines={2}>
        {description}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  bgImage: { opacity: 0.35 },
  scroll: { paddingHorizontal: spacing.screen },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingLeft: 36, paddingRight: 4 },
  greeting: { flex: 1, paddingRight: 8 },
  welcome: { fontSize: 15, lineHeight: 20 },
  name: { fontStyle: 'italic', marginTop: -1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.green800, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)' },
  dot: { position: 'absolute', top: 6, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: colors.white },
  pressed: { opacity: 0.85 },
  heading: { marginTop: 22, marginBottom: 12, fontSize: 27, lineHeight: 32 },
  banner: { flexDirection: 'row', backgroundColor: colors.green800, borderRadius: radii.lg, marginTop: 16, overflow: 'hidden', minHeight: 104, ...shadows.card },
  bannerImage: { width: 120, height: '100%' },
  bannerBody: { flex: 1, padding: 12, paddingLeft: 10 },
  bannerTitle: { marginBottom: 2 },
  learnMore: { alignSelf: 'flex-end', backgroundColor: colors.white, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 3, marginTop: 8 },
  learnMoreText: { fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
  cardRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  navCard: { flex: 1, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', minHeight: 130 },
  navIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  navTitle: { fontSize: 13, lineHeight: 17 },
  navSubtitle: { fontSize: 9, lineHeight: 12, color: colors.green800 },
  navDesc: { fontSize: 8, lineHeight: 11, marginTop: 8 },
  aboutWrap: { marginTop: 16, borderRadius: radii.lg, overflow: 'hidden', ...shadows.card },
  about: { padding: 18, minHeight: 190 },
  aboutImage: { borderRadius: radii.lg },
  aboutTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(16,36,14,0.45)' },
  aboutText: { marginTop: 6, textAlign: 'justify', paddingRight: 8 },
  aboutArrow: { alignSelf: 'flex-end', marginTop: 10 },
});
