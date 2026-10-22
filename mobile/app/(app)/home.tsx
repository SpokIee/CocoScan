import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Card, DemoBadge, LogoutModal, UpdatesModal } from '@/components';
import { Chevron } from '@/components/ScanHistoryCard';
import { ABOUT_TEXT } from '@/constants/diseases';
import { colors, fonts, hitSlop, radii, shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useScanContext } from '@/context/ScanContext';
import { errorMessage } from '@/hooks/useAsync';
import { scanService } from '@/services';
import { IS_DEMO } from '@/services/config';
import type { ScanUpdate } from '@/types';

/**
 * SCREEN 4 — Home Dashboard (Figma 2:121), plus SCREEN 6 Updates and SCREEN 7 Logout modals.
 * Layout coordinates follow the 375-wide frame: 28 px gutter, banner 320 × 82 with
 * the coconut cutout overlapping its top-left, three 98 × 149 cards, 306 × 255 About card.
 */
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
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {/* Header: greeting at x=70, bell box 41 × 39 at x=312 */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <AppText variant="title" color={colors.green700}>
              Welcome back
            </AppText>
            <AppText variant="tiny" color={colors.green700} style={styles.name} numberOfLines={1}>
              {firstName}!
            </AppText>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setLogoutOpen(true)} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Log out" style={({ pressed }) => [styles.iconBox, pressed && styles.pressed]}>
              <Image source={require('@/assets/icons/logout.png')} style={styles.logoutIcon} resizeMode="contain" />
            </Pressable>
            <Pressable
              onPress={() => setUpdatesOpen(true)}
              hitSlop={hitSlop}
              accessibilityRole="button"
              accessibilityLabel={unread ? `Updates, ${unread} unread` : 'Updates'}
              style={({ pressed }) => [styles.iconBox, pressed && styles.pressed]}
            >
              <Image source={require('@/assets/icons/bell.png')} style={styles.bellIcon} resizeMode="contain" />
              {unread > 0 ? <View style={styles.dot} /> : null}
            </Pressable>
          </View>
        </View>

        <AppText color={colors.green700} style={styles.heading}>
          Curious about your{'\n'}coconut’s health?
        </AppText>

        {IS_DEMO ? (
          <View style={styles.demo}>
            <DemoBadge text="Demo Mode — predictions are simulated" />
          </View>
        ) : null}

        {/* Disease banner: #43662E 320 × 82, coconut cutout 142 × 149 overlapping at (-14, -51) */}
        <View style={styles.bannerWrap}>
          <Pressable onPress={() => router.push('/(app)/diseases')} accessibilityRole="button" accessibilityLabel="All About Coconut Diseases. Learn more" style={({ pressed }) => [styles.banner, pressed && styles.pressed]}>
            <View style={styles.bannerBody}>
              <AppText variant="label" color={colors.white}>
                All About Coconut Diseases
              </AppText>
              <AppText color={colors.white} style={styles.bannerDesc}>
                Discover common coconut diseases, their symptoms, causes, and ways to protect your crops.
              </AppText>
              <View style={styles.learnMore}>
                <AppText color={colors.white} style={styles.learnMoreText}>
                  Learn More
                </AppText>
              </View>
            </View>
          </Pressable>
          <Image source={require('@/assets/images/home-coconut.png')} style={styles.coconut} resizeMode="contain" pointerEvents="none" />
        </View>

        {/* Three navigation cards: 98 × 149, radius 8 */}
        <View style={styles.cardRow}>
          <NavCard icon={require('@/assets/icons/scan.png')} title="Scan Now" subtitle="Coconut Leaf" description="Scan a leaf for diseases." onPress={() => router.push('/(app)/scan/camera')} />
          <NavCard icon={require('@/assets/icons/read.png')} title="Read" subtitle="About Coconuts" description="Discover more diseases and health tips." onPress={() => router.push('/(app)/diseases')} />
          <NavCard icon={require('@/assets/icons/history.png')} title="Recently" subtitle="Scanned" description="Check your scan history." onPress={() => router.push('/(app)/history')} />
        </View>

        {/* About card: 306 × 255, leaf photo at 80 % + 40 % black */}
        <Pressable onPress={() => router.push('/(app)/diseases')} accessibilityRole="button" accessibilityLabel="About CocoScan" style={({ pressed }) => [styles.aboutWrap, pressed && styles.pressed]}>
          <ImageBackground source={require('@/assets/images/about-bg.png')} style={styles.about} imageStyle={styles.aboutImage} resizeMode="cover">
            <View style={styles.aboutTint} />
            <AppText variant="h2" color={colors.white} style={styles.aboutTitle}>
              About CocoScan
            </AppText>
            <AppText color={colors.white} style={styles.aboutText}>
              {ABOUT_TEXT}
            </AppText>
            <View style={styles.aboutArrow}>
              <Chevron color={colors.white} size={18} />
            </View>
          </ImageBackground>
        </Pressable>
      </ScrollView>

      <UpdatesModal visible={updatesOpen} updates={updates} loading={updatesLoading} error={updatesError} onRetry={loadUpdates} onClose={() => setUpdatesOpen(false)} onOpen={openUpdate} />
      <LogoutModal visible={logoutOpen} loading={loggingOut} onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />
    </View>
  );
}

function NavCard({ icon, title, subtitle, description, onPress }: { icon: number; title: string; subtitle: string; description: string; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.navCard} accessibilityLabel={`${title} ${subtitle}`}>
      <Image source={icon} style={styles.navIcon} resizeMode="contain" />
      <AppText variant="label" color={colors.green700} align="center">
        {title}
      </AppText>
      <AppText color={colors.green700} align="center" style={styles.navSubtitle}>
        {subtitle}
      </AppText>
      <AppText color={colors.green700} align="center" style={styles.navDesc} numberOfLines={2}>
        {description}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  bgImage: { opacity: 0.67 },
  scroll: { paddingHorizontal: 28 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingLeft: 42, marginTop: 10 },
  greeting: { flex: 1, paddingRight: 8, paddingTop: 2 },
  name: { fontFamily: fonts.italic, marginTop: -2 },
  headerActions: { flexDirection: 'row', gap: 8, marginRight: -6 },
  iconBox: { width: 41, height: 39, borderRadius: 12, borderWidth: 3, borderColor: 'rgba(79,119,48,0.35)', backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  bellIcon: { width: 19, height: 19 },
  logoutIcon: { width: 18, height: 18 },
  dot: { position: 'absolute', top: 5, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: colors.white },
  pressed: { opacity: 0.85 },
  heading: { fontFamily: fonts.heading, fontSize: 36, lineHeight: 38, marginTop: 34, textShadowColor: 'rgba(0,0,0,0.11)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 2 } },
  demo: { marginTop: 10 },
  bannerWrap: { marginTop: 63, height: 82 },
  banner: { height: 82, backgroundColor: colors.green800, borderRadius: radii.button, ...shadows.button },
  bannerBody: { position: 'absolute', left: 122, right: 14, top: 13, bottom: 10 },
  bannerDesc: { fontFamily: fonts.regular, fontSize: 7.5, lineHeight: 10, textAlign: 'justify', marginTop: 3, width: 130 },
  learnMore: { position: 'absolute', right: 0, bottom: 0, width: 57, height: 15, borderRadius: 4, borderWidth: 1, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  learnMoreText: { fontFamily: fonts.heading, fontSize: 7, lineHeight: 9 },
  coconut: { position: 'absolute', left: -14, top: -51, width: 142, height: 149 },
  cardRow: { flexDirection: 'row', gap: 9, marginTop: 29, marginHorizontal: 4 },
  navCard: { flex: 1, height: 149, alignItems: 'center', paddingTop: 24, paddingHorizontal: 6 },
  navIcon: { width: 39, height: 39, marginBottom: 2 },
  navSubtitle: { fontFamily: fonts.italic, fontSize: 8, lineHeight: 11 },
  navDesc: { fontFamily: fonts.regular, fontSize: 6.5, lineHeight: 9, marginTop: 16 },
  aboutWrap: { marginTop: 25, marginHorizontal: 4, borderRadius: radii.card, overflow: 'hidden', ...shadows.card },
  about: { minHeight: 255, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 16 },
  aboutImage: { borderRadius: radii.card, opacity: 0.8 },
  aboutTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  aboutTitle: { fontSize: 24, lineHeight: 28 },
  aboutText: { fontFamily: fonts.medium, fontSize: 10, lineHeight: 12, textAlign: 'justify', marginTop: 9, width: 230 },
  aboutArrow: { alignSelf: 'flex-end', marginTop: 'auto', paddingTop: 12 },
});
