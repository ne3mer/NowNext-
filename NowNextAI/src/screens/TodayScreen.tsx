import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NowSuggestionCard } from '../components/NowSuggestionCard';
import { TaskCard } from '../components/TaskCard';
import { useTaskStore } from '../store/taskStore';
import { ui } from '../theme/ui';
import { getSuggestedTask } from '../utils/taskSuggestion';

export function TodayScreen() {
  const insets = useSafeAreaInsets();
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
  const hasHydrated = useTaskStore((state) => state.hasHydrated);
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const suggestedTask = getSuggestedTask(tasks);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + ui.spacing.lg }]}
    >
      <Text style={styles.title}>Today</Text>
      <Text style={styles.subtitle}>Your focused tasks and next suggestion.</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="layers-outline" size={16} color={ui.colors.textSecondary} />
          <Text style={styles.statValue}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={16} color={ui.colors.textSecondary} />
          <Text style={styles.statValue}>{pendingTasks.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done-outline" size={16} color={ui.colors.textSecondary} />
          <Text style={styles.statValue}>{completedTasks.length}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      <NowSuggestionCard task={suggestedTask} />

      {!hasHydrated ? (
        <Text style={styles.stateText}>Loading your tasks...</Text>
      ) : pendingTasks.length === 0 ? (
        <Text style={styles.stateText}>No pending task for today.</Text>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending now</Text>
          <View style={styles.list}>
            {pendingTasks.slice(0, 5).map((task) => (
              <TaskCard key={task.id} task={task} onToggleComplete={toggleTaskCompletion} />
            ))}
          </View>
        </View>
      )}

      {hasHydrated && completedTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently completed</Text>
          <View style={styles.list}>
            {completedTasks.slice(0, 3).map((task) => (
              <TaskCard key={task.id} task={task} onToggleComplete={toggleTaskCompletion} />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  content: {
    padding: ui.spacing.lg,
    gap: ui.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: ui.colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: ui.colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: ui.spacing.xs,
  },
  statCard: {
    flex: 1,
    borderRadius: ui.radius.md,
    backgroundColor: ui.colors.surface,
    borderWidth: 1,
    borderColor: ui.colors.border,
    paddingVertical: ui.spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: ui.colors.textPrimary,
  },
  statLabel: {
    color: ui.colors.textSecondary,
    fontSize: 12,
  },
  section: {
    gap: ui.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ui.colors.textPrimary,
  },
  list: {
    gap: ui.spacing.sm,
  },
  stateText: {
    color: ui.colors.textSecondary,
    marginTop: ui.spacing.sm,
  },
});
