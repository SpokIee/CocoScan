import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

/** Auth guard: everything under (app) requires a signed-in user. */
export default function AppLayout() {
  const { isAuthenticated, isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.green700} />
      </View>
    );
  }
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="home" options={{ animation: 'fade' }} />
      <Stack.Screen name="scan/camera" options={{ animation: 'slide_from_bottom', contentStyle: { backgroundColor: colors.black } }} />
      <Stack.Screen name="scan/confirm" options={{ animation: 'fade', contentStyle: { backgroundColor: colors.black } }} />
      <Stack.Screen name="scan/detecting" options={{ gestureEnabled: false }} />
      <Stack.Screen name="scan/result" options={{ gestureEnabled: false }} />
      <Stack.Screen name="scan/saved" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
