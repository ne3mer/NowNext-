import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ui } from '../theme/ui';

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
                <Ionicons name={item.icon} size={18} color={ui.colors.tabActive} />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    padding: ui.spacing.lg,
  },
  card: {
    borderRadius: ui.radius.lg,
    backgroundColor: ui.colors.surface,
    padding: ui.spacing.lg,
    gap: ui.spacing.sm,
    ...ui.shadow.card,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    color: ui.colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: ui.colors.textPrimary,
  },
  subtitle: {
    color: ui.colors.textSecondary,
    fontSize: 14,
  },
  list: {
    marginTop: ui.spacing.xs,
    gap: ui.spacing.sm,
  },
  item: {
    flexDirection: 'row',
    gap: ui.spacing.sm,
    alignItems: 'flex-start',
  },
  itemCopy: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontWeight: '700',
    color: ui.colors.textPrimary,
  },
  itemDesc: {
    color: ui.colors.textSecondary,
    fontSize: 12,
  },
  cta: {
    marginTop: ui.spacing.sm,
    borderRadius: ui.radius.md,
    backgroundColor: ui.colors.tabActive,
    alignItems: 'center',
    paddingVertical: 12,
  },
  ctaText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
