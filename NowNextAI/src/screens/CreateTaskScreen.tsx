import { StyleSheet, Text, View } from 'react-native';
import { ui } from '../theme/ui';

export function CreateTaskScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Task</Text>
      <View style={styles.card}>
        <Text style={styles.subtitle}>Task form will be implemented in Phase 7.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: ui.spacing.lg,
    backgroundColor: ui.colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: ui.colors.textPrimary,
  },
  card: {
    marginTop: ui.spacing.md,
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    padding: ui.spacing.md,
    borderWidth: 1,
    borderColor: ui.colors.border,
    ...ui.shadow.card,
  },
  subtitle: {
    fontSize: 16,
    color: ui.colors.textSecondary,
  },
});
