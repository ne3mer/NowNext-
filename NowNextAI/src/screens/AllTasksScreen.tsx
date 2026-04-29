import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryTabs } from '../components/CategoryTabs';
import { CompletionCelebration } from '../components/CompletionCelebration';
import { TaskCard } from '../components/TaskCard';
import { useAuthStore } from '../store/authStore';
import { useCategoryStore } from '../store/categoryStore';
import { useTaskStore } from '../store/taskStore';
import { AppTheme, useAppTheme } from '../theme/theme';
import { TaskCategory } from '../types/task';
import { chainToTitlePath, getParentCandidates, getTaskChain } from '../utils/taskLinks';
import { cancelTaskNotification, scheduleDeadlineNotification } from '../utils/notifications';

export function AllTasksScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tasks = useTaskStore((state) => state.tasks);
  const hasHydrated = useTaskStore((state) => state.hasHydrated);
  const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const setLocalTaskMeta = useTaskStore((state) => state.setLocalTaskMeta);
  const token = useAuthStore((state) => state.token);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const categories = useCategoryStore((state) => state.categories);
  const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const categoryOptions = useMemo(() => {
    const fromTasks = tasks.map((task) => task.category);
    const fromStore = categories.map((item) => item.name);
    return Array.from(new Set([...fromStore, ...fromTasks]));
  }, [categories, tasks]);

  const visibleTasks = useMemo(() => {
    if (selectedCategory === 'all') {
      return tasks;
    }

    return tasks.filter((task) => task.category === selectedCategory);
  }, [selectedCategory, tasks]);

  async function handleToggle(taskId: string) {
    const target = tasks.find((task) => task.id === taskId);
    await toggleTaskCompletion(taskId, token);
    if (target?.notificationId) {
      await cancelTaskNotification(target.notificationId);
    }
    if (target && target.completed && target.deadline) {
      const notificationId = await scheduleDeadlineNotification(target.title, target.deadline);
      if (notificationId) {
        setLocalTaskMeta(taskId, { notificationId });
      }
    } else if (target) {
      setLocalTaskMeta(taskId, { notificationId: null });
    }
    if (target && !target.completed) {
      setCelebrationTrigger((prev) => prev + 1);
    }
  }

  function handleDelete(taskId: string) {
    Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const target = tasks.find((task) => task.id === taskId);
          void cancelTaskNotification(target?.notificationId);
          void deleteTask(taskId, token);
        },
      },
    ]);
  }

  function handleLinkTask(taskId: string, parentTaskId: string | null) {
    setLocalTaskMeta(taskId, { parentTaskId });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}
    >
      <CompletionCelebration trigger={celebrationTrigger} theme={theme} />
      <Text style={styles.title}>All Tasks</Text>
      <Text style={styles.subtitle}>Browse by category and tap any card to complete it.</Text>

      <CategoryTabs
        categories={categoryOptions}
        selectedCategory={selectedCategory}
        onChangeCategory={setSelectedCategory}
      />

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
              impactPath={task.parentTaskId ? chainToTitlePath(getTaskChain(task, tasks)) : null}
              onToggleComplete={(id) => {
                void handleToggle(id);
              }}
              onDeleteTask={handleDelete}
              linkCandidates={getParentCandidates(tasks, task.category, task.id)}
              onLinkTask={handleLinkTask}
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
