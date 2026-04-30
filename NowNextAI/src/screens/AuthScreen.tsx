import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { AppTheme, useAppTheme } from '../theme/theme';

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useAuthStore((state) => state.register);
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  async function onSubmit() {
    clearError();
    if (mode === 'register') {
      await register(name.trim(), email.trim(), password);
      return;
    }
    await login(email.trim(), password);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
      <Text style={styles.badge}>NowNext AI</Text>
      <Text style={styles.title}>Focus starts with secure sync</Text>
      <Text style={styles.subtitle}>Create your account to sync tasks across devices.</Text>

      <View style={styles.modeRow}>
        <Pressable style={[styles.modePill, mode === 'register' && styles.modePillActive]} onPress={() => setMode('register')}>
          <Text style={[styles.modeText, mode === 'register' && styles.modeTextActive]}>Register</Text>
        </Pressable>
        <Pressable style={[styles.modePill, mode === 'login' && styles.modePillActive]} onPress={() => setMode('login')}>
          <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>Login</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        {mode === 'register' && (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your name" placeholderTextColor="#94a3b8" />
          </>
        )}
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#94a3b8"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder="At least 8 characters"
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={[styles.cta, loading && styles.ctaDisabled]} onPress={onSubmit} disabled={loading}>
          <Text style={styles.ctaText}>{loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Continue'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme, isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.lg },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
      color: theme.colors.textPrimary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      fontSize: 12,
      fontWeight: '700',
    },
    title: { marginTop: 14, fontSize: 26, fontWeight: '800', color: theme.colors.textPrimary },
    subtitle: { marginTop: 8, color: theme.colors.textSecondary, fontSize: 14 },
    modeRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
    modePill: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 999,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    modePillActive: { backgroundColor: theme.colors.tabActive, borderColor: theme.colors.tabActive },
    modeText: { color: theme.colors.textPrimary, fontWeight: '700' },
    modeTextActive: { color: theme.colors.background },
    card: {
      marginTop: 16,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
    },
    label: { marginTop: 10, marginBottom: 6, color: theme.colors.textSecondary, fontWeight: '600' },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: isDark ? '#111827' : '#ffffff',
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.colors.textPrimary,
    },
    error: { marginTop: 10, color: '#b91c1c', fontWeight: '600' },
    cta: {
      marginTop: 14,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.tabActive,
      alignItems: 'center',
      paddingVertical: 12,
    },
    ctaDisabled: { opacity: 0.6 },
    ctaText: { color: theme.colors.background, fontSize: 15, fontWeight: '700' },
  });
}
