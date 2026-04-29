import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryTabs } from '../components/CategoryTabs';
import { CompletionCelebration } from '../components/CompletionCelebration';
import { TaskCard } from '../components/TaskCard';
import { useTaskStore } from '../store/taskStore';
import { AppTheme, useAppTheme } from '../theme/theme';
import { TaskCategory } from '../types/task';

export function AllTasksScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tasks = useTaskStore((state) => state.tasks);
  const hasHydrated = useTaskStore((state) => state.hasHydrated);
  const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);

  const visibleTasks = useMemo(() => {
    if (selectedCategory === 'all') {
      return tasks;
    }

    return tasks.filter((task) => task.category === selectedCategory);
  }, [selectedCategory, tasks]);

  function handleToggle(taskId: string) {
    const target = tasks.find((task) => task.id === taskId);
    toggleTaskCompletion(taskId);
    if (target && !target.completed) {
      setCelebrationTrigger((prev) => prev + 1);
    }
  }

  function handleDelete(taskId: string) {
    Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(taskId) },
    ]);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}
    >
      <CompletionCelebration trigger={celebrationTrigger} theme={theme} />
      <Text style={styles.title}>All Tasks</Text>
      <Text style={styles.subtitle}>Browse by category and tap any card to complete it.</Text>

      <CategoryTabs selectedCategory={selectedCategory} onChangeCategory={setSelectedCategory} />

      {!hasHydrated ? (
        <Text style={styles.stateText}>Loading tasks...</Text>
      ) : visibleTasks.length === 0 ? (
        <Text style={styles.stateText}>No task found in this category.</Text>
      ) : (
        <View style={styles.list}>
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              parentTitle={task.parentTaskId ? tasksById.get(task.parentTaskId)?.title ?? null : null}
              onToggleComplete={handleToggle}
              onDeleteTask={handleDelete}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  list: {
    gap: theme.spacing.sm,
  },
  stateText: {
    color: theme.colors.textSecondary,
  },
  });
}
