import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompletionCelebration } from '../components/CompletionCelebration';
import { GoalPulseCard } from '../components/GoalPulseCard';
import { NowSuggestionCard } from '../components/NowSuggestionCard';
import { TaskCard } from '../components/TaskCard';
import { useTaskStore } from '../store/taskStore';
import { AppTheme, useAppTheme } from '../theme/theme';
import { chainToLabel, getTaskChain, getTopGoalPulse } from '../utils/taskLinks';
import { getSuggestedTask } from '../utils/taskSuggestion';

export function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
  const hasHydrated = useTaskStore((state) => state.hasHydrated);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const suggestedTask = getSuggestedTask(tasks);
  const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const suggestionChainLabel = suggestedTask ? chainToLabel(getTaskChain(suggestedTask, tasks)) : null;
  const topGoalPulse = useMemo(() => getTopGoalPulse(tasks), [tasks]);
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100);
  const linkedTasksCount = tasks.filter((task) => !!task.parentTaskId).length;
  const linkRate = tasks.length === 0 ? 0 : Math.round((linkedTasksCount / tasks.length) * 100);
  const motivationalLine =
    completionRate >= 75
      ? 'You are in flow mode today.'
      : completionRate >= 40
        ? 'Momentum is building. Keep shipping.'
        : 'Start one small task to unlock momentum.';

  function handleToggle(taskId: string) {
    const target = tasks.find((task) => task.id === taskId);
    toggleTaskCompletion(taskId);
    if (target && !target.completed) {
      setCelebrationTrigger((prev) => prev + 1);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}
    >
      <CompletionCelebration trigger={celebrationTrigger} theme={theme} />
      <Text style={styles.title}>Today</Text>
      <Text style={styles.subtitle}>Your focused tasks and next suggestion.</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="layers-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.statValue}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.statValue}>{pendingTasks.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.statValue}>{completedTasks.length}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightRow}>
          <Text style={styles.insightTitle}>Creative Insights</Text>
          <Text style={styles.insightValue}>{completionRate}% done</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
        </View>
        <View style={styles.insightPills}>
          <View style={styles.insightPill}>
            <Ionicons name="git-network-outline" size={13} color={theme.colors.textSecondary} />
            <Text style={styles.insightPillText}>{linkRate}% linked goals</Text>
          </View>
          <View style={styles.insightPill}>
            <Ionicons name="flame-outline" size={13} color={theme.colors.textSecondary} />
            <Text style={styles.insightPillText}>{motivationalLine}</Text>
          </View>
        </View>
      </View>

      <NowSuggestionCard task={suggestedTask} chainLabel={suggestionChainLabel} />

      {!!topGoalPulse && <GoalPulseCard goalTitle={topGoalPulse.title} score={topGoalPulse.score} />}

      {!hasHydrated ? (
        <Text style={styles.stateText}>Loading your tasks...</Text>
      ) : pendingTasks.length === 0 ? (
        <Text style={styles.stateText}>No pending task for today.</Text>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending now</Text>
          <View style={styles.list}>
            {pendingTasks.slice(0, 5).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                parentTitle={task.parentTaskId ? tasksById.get(task.parentTaskId)?.title ?? null : null}
                onToggleComplete={handleToggle}
              />
            ))}
          </View>
        </View>
      )}

      {hasHydrated && completedTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently completed</Text>
          <View style={styles.list}>
            {completedTasks.slice(0, 3).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                parentTitle={task.parentTaskId ? tasksById.get(task.parentTaskId)?.title ?? null : null}
                onToggleComplete={handleToggle}
              />
            ))}
          </View>
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
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  statCard: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  insightCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  insightValue: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.success,
  },
  insightPills: {
    gap: 6,
  },
  insightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.background,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  insightPillText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  list: {
    gap: theme.spacing.sm,
  },
  stateText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  });
}
