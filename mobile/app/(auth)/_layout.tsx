import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, isRestoring } = useAuth();
  if (!isRestoring && isAuthenticated) return <Redirect href="/(app)/home" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#0E1F0D' } }} />;
}
