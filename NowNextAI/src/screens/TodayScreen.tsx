import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompletionCelebration } from '../components/CompletionCelebration';
import { GoalPulseCard } from '../components/GoalPulseCard';
import { NowSuggestionCard } from '../components/NowSuggestionCard';
import { TaskCard } from '../components/TaskCard';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { AppTheme, useAppTheme } from '../theme/theme';
import {
  chainToLabel,
  chainToTitlePath,
  getParentCandidates,
  getTaskChain,
  getTopGoalPulse,
} from '../utils/taskLinks';
import { getSuggestedTask } from '../utils/taskSuggestion';
import { cancelTaskNotification, scheduleDeadlineNotification } from '../utils/notifications';

function dayKey(dateLike: string | Date): string {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function computeStreak(completedAtDates: string[]): number {
  if (completedAtDates.length === 0) {
    return 0;
  }
  const daySet = new Set(completedAtDates.map(dayKey));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!daySet.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (daySet.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const setLocalTaskMeta = useTaskStore((state) => state.setLocalTaskMeta);
  const hasHydrated = useTaskStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);
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
  const streakDays = useMemo(
    () => computeStreak(completedTasks.map((task) => task.completedAt).filter((item): item is string => Boolean(item))),
    [completedTasks],
  );
  const urgency = useMemo(() => {
    const now = Date.now();
    const in24h = now + 24 * 60 * 60 * 1000;
    const pendingWithDeadline = pendingTasks.filter((task) => !!task.deadline);
    const overdue = pendingWithDeadline.filter((task) => new Date(task.deadline as string).getTime() < now).length;
    const dueSoon = pendingWithDeadline.filter((task) => {
      const deadlineTime = new Date(task.deadline as string).getTime();
      return deadlineTime >= now && deadlineTime <= in24h;
    }).length;
    return { overdue, dueSoon };
  }, [pendingTasks]);
  const motivationalLine =
    completionRate >= 75
      ? 'You are in flow mode today.'
      : completionRate >= 40
        ? 'Momentum is building. Keep shipping.'
        : 'Start one small task to unlock momentum.';

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

      <View style={styles.premiumRow}>
        <View style={styles.premiumCard}>
          <Ionicons name="flame" size={15} color={theme.colors.textPrimary} />
          <Text style={styles.premiumValue}>{streakDays} day streak</Text>
          <Text style={styles.premiumHint}>Consistency builds compounding results.</Text>
        </View>
        <View style={styles.premiumCard}>
          <Ionicons name="alarm-outline" size={15} color={theme.colors.textPrimary} />
          <Text style={styles.premiumValue}>
            {urgency.overdue} overdue • {urgency.dueSoon} due soon
          </Text>
          <Text style={styles.premiumHint}>Your urgency radar for the next 24h.</Text>
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
  premiumRow: {
    gap: theme.spacing.xs,
  },
  premiumCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    gap: 6,
  },
  premiumValue: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  premiumHint: {
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
