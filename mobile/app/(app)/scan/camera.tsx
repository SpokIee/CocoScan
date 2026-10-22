import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, PrimaryButton } from '@/components';
import { colors, hitSlop, spacing } from '@/constants/theme';

/** SCREEN 8 — Image Capture */
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

  // ---- Permission states -------------------------------------------------
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
          {permission.canAskAgain ? (
            <PrimaryButton title="Allow Camera" onPress={() => requestPermission()} />
          ) : (
            <PrimaryButton title="Open Settings" onPress={() => Linking.openSettings()} />
          )}
          <PrimaryButton title="Choose from Gallery" variant="glass" onPress={pickFromGallery} />
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
          <PrimaryButton title="Choose from Gallery" onPress={pickFromGallery} />
          {mountError ? <PrimaryButton title="Try Again" variant="glass" onPress={() => setMountError(null)} /> : null}
        </View>
      </Fallback>
    );
  }

  // ---- Live camera -------------------------------------------------------
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={() => setReady(true)}
        onMountError={(e) => setMountError(e.message)}
        animateShutter={false}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <BackButton tone="dark" />
        <AppText variant="bodyMedium" color={colors.white} style={styles.topTitle}>
          Scan New Coconut Leaf
        </AppText>
        <Pressable onPress={close} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Close scanner" style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.white} />
        </Pressable>
      </View>

      {/* Framing guide */}
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

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 22 }]}>
        <Pressable onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Switch camera" style={styles.sideBtn}>
          <Ionicons name="camera-reverse-outline" size={28} color={colors.white} />
        </Pressable>

        <Pressable
          onPress={capture}
          disabled={!ready || capturing}
          accessibilityRole="button"
          accessibilityLabel="Capture photo"
          accessibilityState={{ disabled: !ready || capturing, busy: capturing }}
          style={({ pressed }) => [styles.shutter, pressed && styles.shutterPressed, (!ready || capturing) && styles.shutterDisabled]}
        >
          <View style={styles.shutterInner}>{capturing ? <ActivityIndicator color={colors.white} /> : <MaterialCommunityIcons name="leaf-circle-outline" size={34} color={colors.white} />}</View>
        </Pressable>

        <Pressable onPress={pickFromGallery} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Upload from gallery" style={styles.sideBtn}>
          <Ionicons name="image-outline" size={28} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

function Fallback({ children, insets, onClose }: { children: React.ReactNode; insets: { top: number; bottom: number }; onClose: () => void }) {
  return (
    <ImageBackground source={require('@/assets/images/camera-fallback.png')} style={styles.root} resizeMode="cover">
      <StatusBar style="light" />
      <View style={styles.fallbackTint} />
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <BackButton tone="dark" />
        <AppText variant="bodyMedium" color={colors.white} style={styles.topTitle}>
          Scan New Coconut Leaf
        </AppText>
        <Pressable onPress={onClose} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Close scanner" style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.white} />
        </Pressable>
      </View>
      <View style={[styles.fallbackBody, { paddingBottom: insets.bottom + 40 }]}>{children}</View>
    </ImageBackground>
  );
}

const FRAME = 230;
const CORNER = 34;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  center: { flex: 1, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screen, paddingBottom: 10, backgroundColor: 'rgba(0,0,0,0.25)' },
  topTitle: { flex: 1, marginLeft: 14 },
  closeBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  frameWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  frame: { width: FRAME, height: FRAME },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: colors.white },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  hint: { marginTop: 18 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 22, backgroundColor: 'rgba(0,0,0,0.45)' },
  sideBtn: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  shutter: { width: 78, height: 78, borderRadius: 39, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  shutterPressed: { transform: [{ scale: 0.95 }] },
  shutterDisabled: { opacity: 0.6 },
  fallbackTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  fallbackBody: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 8 },
  fallbackTitle: { marginTop: 8 },
  fallbackActions: { width: '100%', gap: 12, marginTop: 20 },
});
