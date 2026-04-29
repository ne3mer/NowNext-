import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryTabs } from '../components/CategoryTabs';
import { TaskCard } from '../components/TaskCard';
import { useTaskStore } from '../store/taskStore';
import { TaskCategory } from '../types/task';
import { ui } from '../theme/ui';

export function AllTasksScreen() {
  const insets = useSafeAreaInsets();
  const tasks = useTaskStore((state) => state.tasks);
  const hasHydrated = useTaskStore((state) => state.hasHydrated);
  const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');

  const visibleTasks = useMemo(() => {
    if (selectedCategory === 'all') {
      return tasks;
    }

    return tasks.filter((task) => task.category === selectedCategory);
  }, [selectedCategory, tasks]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + ui.spacing.lg }]}
    >
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
  },
});
