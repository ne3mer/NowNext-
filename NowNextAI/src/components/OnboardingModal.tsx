import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme, useAppTheme } from '../theme/theme';

type OnboardingModalProps = {
  visible: boolean;
  onClose: () => void;
};

const highlights = [
  {
    icon: 'sparkles-outline' as const,
    title: 'Smart Focus',
    description: 'Get an instant suggestion for the best next task based on priority and deadline.',
  },
  {
    icon: 'today-outline' as const,
    title: 'Flexible Planning',
    description: 'Organize work by daily, weekly, monthly, and yearly categories.',
  },
  {
    icon: 'color-wand-outline' as const,
    title: 'Sticky Experience',
    description: 'Manage tasks in a creative sticky-note style that feels light and motivating.',
  },
];

export function OnboardingModal({ visible, onClose }: OnboardingModalProps) {
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.badge}>NowNext AI</Text>
          <Text style={styles.title}>Welcome to your focus system</Text>
          <Text style={styles.subtitle}>Build momentum every day with a clean planning flow.</Text>

          <View style={styles.list}>
            {highlights.map((item) => (
              <View key={item.title} style={styles.item}>
                <Ionicons name={item.icon} size={18} color={theme.colors.tabActive} />
                <View style={styles.itemCopy}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.cta} onPress={onClose}>
            <Text style={styles.ctaText}>Let&apos;s Start</Text>
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
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadow.card,
  },
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  list: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  item: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  itemCopy: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  itemDesc: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  cta: {
    marginTop: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.tabActive,
    alignItems: 'center',
    paddingVertical: 12,
  },
  ctaText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 15,
  },
  });
}
