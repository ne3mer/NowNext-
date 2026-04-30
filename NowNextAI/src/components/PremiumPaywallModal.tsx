import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme, useAppTheme } from '../theme/theme';

type PremiumPaywallModalProps = {
  visible: boolean;
  onClose: () => void;
  onUnlock: () => void;
};

const premiumBenefits = [
  'Unlimited Smart Suggestions',
  'AI-like explanation for every recommendation',
  'Suggestion history and weekly intelligence',
  'Focus Mode with premium controls',
];

const compareRows = [
  { label: 'Suggestions per day', free: '1', premium: 'Unlimited' },
  { label: 'Reasoning explanation', free: 'No', premium: 'Yes' },
  { label: 'History + weekly insights', free: 'No', premium: 'Yes' },
  { label: 'Focus mode controls', free: 'Limited', premium: 'Full' },
];

export function PremiumPaywallModal({ visible, onClose, onUnlock }: PremiumPaywallModalProps) {
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="diamond-outline" size={13} color={theme.colors.textPrimary} />
              <Text style={styles.badgeText}>PREMIUM</Text>
            </View>
            <Text style={styles.price}>€5 one-time</Text>
          </View>

          <Text style={styles.title}>Unlock Smart AI Productivity</Text>
          <Text style={styles.subtitle}>Feel the premium difference every day, not just once.</Text>

          <View style={styles.section}>
            {premiumBenefits.map((item) => (
              <View key={item} style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                <Text style={styles.benefitText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.compareBox}>
            {compareRows.map((row) => (
              <View key={row.label} style={styles.compareRow}>
                <Text style={styles.compareLabel}>{row.label}</Text>
                <Text style={styles.compareFree}>{row.free}</Text>
                <Text style={styles.comparePremium}>{row.premium}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.unlockButton} onPress={onUnlock}>
            <Text style={styles.unlockText}>Unlock Premium €5</Text>
          </Pressable>
          <Pressable style={styles.laterButton} onPress={onClose}>
            <Text style={styles.laterText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: AppTheme, isDark: boolean) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(2, 6, 23, 0.72)' : 'rgba(15, 23, 42, 0.35)',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    card: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      ...theme.shadow.card,
    },
    badgeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: {
      color: theme.colors.textPrimary,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    price: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '800',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 19,
      fontWeight: '800',
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
    section: {
      gap: 6,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    benefitText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    compareBox: {
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      padding: 8,
      gap: 6,
    },
    compareRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    compareLabel: {
      flex: 1,
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    compareFree: {
      color: '#ef4444',
      fontSize: 11,
      fontWeight: '700',
      minWidth: 52,
      textAlign: 'center',
    },
    comparePremium: {
      color: theme.colors.success,
      fontSize: 11,
      fontWeight: '700',
      minWidth: 72,
      textAlign: 'center',
    },
    unlockButton: {
      marginTop: 2,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.tabActive,
      alignItems: 'center',
      paddingVertical: 11,
    },
    unlockText: {
      color: theme.colors.background,
      fontSize: 14,
      fontWeight: '800',
    },
    laterButton: {
      borderRadius: theme.radius.md,
      alignItems: 'center',
      paddingVertical: 8,
    },
    laterText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
  });
}
