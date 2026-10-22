import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, PrimaryButton } from '@/components';
import { colors, hitSlop, radii, shadows } from '@/constants/theme';

/**
 * SCREEN 8 — Image Capture (Figma 9:12).
 * Title Cal Sans 20 at y=26, back (19,17) + close (315,17), 268 × 256 corner guide,
 * bottom panel 155 tall (green gradient, radius 30) with flip · shutter (83/65) · gallery.
 */
export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const goConfirm = (uri: string) => router.push({ pathname: '/(app)/scan/confirm', params: { uri } });

  const capture = async () => {
    if (!cameraRef.current || !ready || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, skipProcessing: false });
      if (photo?.uri) goConfirm(photo.uri);
      else Alert.alert('Capture failed', 'No photo was returned by the camera. Please try again.');
    } catch (e) {
      Alert.alert('Capture failed', e instanceof Error ? e.message : 'Unable to take a photo. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos permission needed', 'Allow CocoScan to access your photos to upload a coconut leaf image.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85, allowsEditing: false });
      if (!res.canceled && res.assets[0]?.uri) goConfirm(res.assets[0].uri);
    } catch (e) {
      Alert.alert('Could not open gallery', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(app)/home'));

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <Fallback insets={insets} onClose={close}>
        <Ionicons name="camera-outline" size={44} color={colors.white} />
        <AppText variant="h2" color={colors.white} align="center" style={styles.fallbackTitle}>
          Camera access needed
        </AppText>
        <AppText variant="small" color="rgba(255,255,255,0.85)" align="center">
          CocoScan uses the camera to photograph coconut leaves. {permission.canAskAgain ? 'Grant permission to continue, or pick a photo from your gallery.' : 'Camera permission was denied. Enable it in Settings, or pick a photo from your gallery.'}
        </AppText>
        <View style={styles.fallbackActions}>
          {permission.canAskAgain ? <PrimaryButton title="Allow Camera" size="wide" onPress={() => requestPermission()} /> : <PrimaryButton title="Open Settings" size="wide" onPress={() => Linking.openSettings()} />}
          <PrimaryButton title="Choose from Gallery" variant="glass" size="wide" onPress={pickFromGallery} />
        </View>
      </Fallback>
    );
  }

  if (mountError || Platform.OS === 'web') {
    return (
      <Fallback insets={insets} onClose={close}>
        <MaterialCommunityIcons name="camera-off-outline" size={44} color={colors.white} />
        <AppText variant="h2" color={colors.white} align="center" style={styles.fallbackTitle}>
          Camera unavailable
        </AppText>
        <AppText variant="small" color="rgba(255,255,255,0.85)" align="center">
          {mountError ?? 'No camera device is available on this platform.'} You can still upload a coconut leaf photo from your gallery.
        </AppText>
        <View style={styles.fallbackActions}>
          <PrimaryButton title="Choose from Gallery" size="wide" onPress={pickFromGallery} />
          {mountError ? <PrimaryButton title="Try Again" variant="glass" size="wide" onPress={() => setMountError(null)} /> : null}
        </View>
      </Fallback>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} onCameraReady={() => setReady(true)} onMountError={(e) => setMountError(e.message)} animateShutter={false} />

      <TopBar insets={insets} onClose={close} />

      {/* Framing guide: Figma Group 13 — four 74 × 63 rounded corners spanning 268 × 256 */}
      <View style={styles.frameWrap} pointerEvents="none">
        <View style={styles.frame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        <AppText variant="tiny" color="rgba(255,255,255,0.9)" align="center" style={styles.hint}>
          Center a single coconut leaflet inside the frame
        </AppText>
      </View>

      {/* Bottom controls panel */}
      <LinearGradient colors={['rgba(79,119,48,0.5)', 'rgba(51,83,33,0.5)']} style={[styles.bottomBar, { paddingBottom: insets.bottom + 26 }]}>
        <Pressable onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Switch camera" style={styles.sideBtn}>
          <Ionicons name="camera-reverse-outline" size={30} color={colors.white} />
        </Pressable>

        <Pressable
          onPress={capture}
          disabled={!ready || capturing}
          accessibilityRole="button"
          accessibilityLabel="Capture photo"
          accessibilityState={{ disabled: !ready || capturing, busy: capturing }}
          style={({ pressed }) => [styles.shutter, pressed && styles.shutterPressed, (!ready || capturing) && styles.shutterDisabled]}
        >
          <View style={styles.shutterInner}>{capturing ? <ActivityIndicator color={colors.white} /> : <Ionicons name="scan-outline" size={40} color={colors.white} />}</View>
        </Pressable>

        <Pressable onPress={pickFromGallery} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Upload from gallery" style={styles.sideBtn}>
          <Ionicons name="image-outline" size={30} color={colors.white} />
        </Pressable>
      </LinearGradient>
    </View>
  );
}

function TopBar({ insets, onClose }: { insets: { top: number }; onClose: () => void }) {
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + 17 }]}>
      <BackButton tone="dark" />
      <AppText variant="h3" color={colors.white} align="center" style={styles.topTitle}>
        Scan New Coconut Leaf
      </AppText>
      <Pressable onPress={onClose} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Close scanner" style={styles.closeBtn}>
        <Ionicons name="close" size={22} color={colors.white} />
      </Pressable>
    </View>
  );
}

function Fallback({ children, insets, onClose }: { children: React.ReactNode; insets: { top: number; bottom: number }; onClose: () => void }) {
  return (
    <ImageBackground source={require('@/assets/images/camera-fallback.png')} style={styles.root} resizeMode="cover">
      <StatusBar style="light" />
      <View style={styles.fallbackTint} />
      <TopBar insets={insets} onClose={onClose} />
      <View style={[styles.fallbackBody, { paddingBottom: insets.bottom + 40 }]}>{children}</View>
    </ImageBackground>
  );
}

const FRAME_W = 268;
const FRAME_H = 256;
const CORNER_W = 74;
const CORNER_H = 63;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  center: { flex: 1, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 19, paddingBottom: 10 },
  topTitle: { flex: 1 },
  closeBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  frameWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  frame: { width: FRAME_W, height: FRAME_H },
  corner: { position: 'absolute', width: CORNER_W, height: CORNER_H, borderColor: colors.white },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 22 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 22 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 22 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 22 },
  hint: { marginTop: 18 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 45, paddingTop: 36, borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet, ...shadows.modal },
  sideBtn: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  shutter: { width: 83, height: 83, borderRadius: 42, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 65, height: 65, borderRadius: 33, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  shutterPressed: { transform: [{ scale: 0.95 }] },
  shutterDisabled: { opacity: 0.6 },
  fallbackTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  fallbackBody: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 8 },
  fallbackTitle: { marginTop: 8 },
  fallbackActions: { width: '100%', gap: 12, marginTop: 20 },
});
