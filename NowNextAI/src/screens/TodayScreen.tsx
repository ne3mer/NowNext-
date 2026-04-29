import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NowSuggestionCard } from '../components/NowSuggestionCard';
import { TaskCard } from '../components/TaskCard';
import { useTaskStore } from '../store/taskStore';
import { ui } from '../theme/ui';
import { getSuggestedTask } from '../utils/taskSuggestion';

export function TodayScreen() {
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
  const hasHydrated = useTaskStore((state) => state.hasHydrated);
  const pendingTasks = tasks.filter((task) => !task.completed);
  const suggestedTask = getSuggestedTask(tasks);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.subtitle}>Your focused tasks and next suggestion.</Text>

      <NowSuggestionCard task={suggestedTask} />

      {!hasHydrated ? (
        <Text style={styles.stateText}>Loading your tasks...</Text>
      ) : pendingTasks.length === 0 ? (
        <Text style={styles.stateText}>No pending task for today.</Text>
      ) : (
        <View style={styles.list}>
          {pendingTasks.slice(0, 5).map((task) => (
            <TaskCard key={task.id} task={task} onToggleComplete={toggleTaskCompletion} />
          ))}
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
  list: {
    gap: ui.spacing.sm,
  },
  stateText: {
    color: ui.colors.textSecondary,
    marginTop: ui.spacing.sm,
  },
});
