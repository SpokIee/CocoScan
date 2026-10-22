import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, AuthBackground, ErrorBanner, PrimaryButton, TextField } from '@/components';
import { AuthSheet } from '@/components/AuthSheet';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/hooks/useAsync';
import { validateConfirm, validateEmail, validatePassword } from '@/hooks/useValidation';

/** SCREEN 3 — Sign Up (Figma 2:347) */
export default function SignupScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null; confirm?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirm(password, confirm),
    };
    setErrors(next);
    setFormError(null);
    if (next.email || next.password || next.confirm) return;
    setLoading(true);
    try {
      await register(email, password);
      router.replace('/(app)/home');
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground brandPosition="upper">
      <AuthSheet title="Sign Up">
        <ErrorBanner message={formError} />
        {formError ? <View style={styles.gap} /> : null}
        <TextField
          icon="email"
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
          icon="lock"
          placeholder="Create Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors((e) => ({ ...e, password: null }));
          }}
          secure
          textContentType="newPassword"
          autoComplete="new-password"
          returnKeyType="next"
          error={errors.password}
        />
        <TextField
          icon="lock"
          placeholder="Confirm Password"
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            if (errors.confirm) setErrors((e) => ({ ...e, confirm: null }));
          }}
          secure
          textContentType="newPassword"
          autoComplete="new-password"
          returnKeyType="done"
          onSubmitEditing={submit}
          error={errors.confirm}
        />
        <PrimaryButton title="Sign Up" variant="muted" size="wide" onPress={submit} loading={loading} style={styles.submit} />
        <View style={styles.footer}>
          <AppText variant="tiny" color={colors.white} style={styles.footerText}>
            Already have an account?{' '}
          </AppText>
          <Pressable onPress={() => router.replace('/(auth)/login')} accessibilityRole="link" hitSlop={8}>
            <AppText variant="tiny" color={colors.white} style={styles.link}>
              Log In
            </AppText>
          </Pressable>
        </View>
      </AuthSheet>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  gap: { height: 12 },
  submit: { height: 40, marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  footerText: { fontFamily: fonts.medium },
  link: { fontFamily: fonts.semiBold },
});
