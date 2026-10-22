import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText, AuthBackground, ErrorBanner, PrimaryButton, TextField } from '@/components';
import { AuthSheet } from '@/components/AuthSheet';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/hooks/useAsync';
import { validateEmail, validatePassword } from '@/hooks/useValidation';
import { IS_DEMO } from '@/services/config';
import { DEMO_ACCOUNT } from '@/services/demo';

/** SCREEN 2 — Login */
export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next = { email: validateEmail(email), password: password ? null : 'Password is required.' };
    setErrors(next);
    setFormError(null);
    if (next.email || next.password) return;
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(app)/home');
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      IS_DEMO
        ? `Password reset is not available yet. You can use the demo account:\n\n${DEMO_ACCOUNT.email}\n${DEMO_ACCOUNT.password}`
        : 'Password reset is not available in this version. Please contact your administrator.',
    );
  };

  return (
    <AuthBackground brandPosition="upper">
      <AuthSheet title="Login">
        <ErrorBanner message={formError} />
        {formError ? <View style={styles.gap} /> : null}
        <TextField
          icon="mail"
          placeholder="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors((e) => ({ ...e, email: null }));
          }}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="next"
          error={errors.email}
        />
        <TextField
          icon="lock-closed"
          placeholder="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors((e) => ({ ...e, password: null }));
          }}
          secure
          textContentType="password"
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={submit}
          error={errors.password}
        />
        <Pressable onPress={forgotPassword} style={styles.forgot} accessibilityRole="link" hitSlop={8}>
          <AppText variant="tiny" color={colors.white}>
            Forgot Password?
          </AppText>
        </Pressable>
        <PrimaryButton title="Login" onPress={submit} loading={loading} style={styles.submit} />
        <View style={styles.footer}>
          <AppText variant="tiny" color={colors.white}>
            Don't have an account?{' '}
          </AppText>
          <Pressable onPress={() => router.replace('/(auth)/signup')} accessibilityRole="link" hitSlop={8}>
            <AppText variant="tiny" color={colors.white} style={styles.link}>
              Sign Up
            </AppText>
          </Pressable>
        </View>
        {IS_DEMO ? (
          <AppText variant="tiny" color="rgba(255,255,255,0.7)" align="center" style={styles.demoHint}>
            Demo Mode · {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
          </AppText>
        ) : null}
      </AuthSheet>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  gap: { height: spacing.md },
  forgot: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 14 },
  submit: { minHeight: 44 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  link: { fontFamily: 'Poppins_600SemiBold' },
  demoHint: { marginTop: 12 },
});
