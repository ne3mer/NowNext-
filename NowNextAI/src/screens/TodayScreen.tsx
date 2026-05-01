import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompletionCelebration } from '../components/CompletionCelebration';
import { GoalPulseCard } from '../components/GoalPulseCard';
import { NowSuggestionCard } from '../components/NowSuggestionCard';
import { PremiumPaywallModal } from '../components/PremiumPaywallModal';
import { ScreenAuraBackground } from '../components/ScreenAuraBackground';
import { TaskCard } from '../components/TaskCard';
import { useAuthStore } from '../store/authStore';
import { usePremiumStore } from '../store/premiumStore';
import { useTaskStore } from '../store/taskStore';
import { AppTheme, useAppTheme } from '../theme/theme';
import { UpdateTaskInput } from '../types/task';
import {
  chainToLabel,
  chainToTitlePath,
  getParentCandidates,
  getTaskChain,
  getTopGoalPulse,
} from '../utils/taskLinks';
import {
  getBestTaskSuggestion,
  getSimpleSuggestion,
  MIN_PENDING_TASKS_FOR_SUGGESTION,
  SuggestionResult,
} from '../utils/taskSuggestion';
import {
  cancelAllFocusNotifications,
  cancelScheduledNotification,
  cancelTaskNotification,
  scheduleDeadlineNotification,
  scheduleFocusEndNotification,
  scheduleFocusEndNotificationMs,
} from '../utils/notifications';

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
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const setLocalTaskMeta = useTaskStore((state) => state.setLocalTaskMeta);
  const hasHydrated = useTaskStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?._id ?? null);
  const getIsPremiumForUser = usePremiumStore((state) => state.getIsPremiumForUser);
  const unlockPremium = usePremiumStore((state) => state.unlockPremium);
  const canUseFreeSuggestionForUser = usePremiumStore((state) => state.canUseFreeSuggestionForUser);
  const consumeFreeSuggestion = usePremiumStore((state) => state.consumeFreeSuggestion);
  const getSuggestionHistory = usePremiumStore((state) => state.getSuggestionHistory);
  const getFocusModeUntil = usePremiumStore((state) => state.getFocusModeUntil);
  const getFocusNotificationId = usePremiumStore((state) => state.getFocusNotificationId);
  const getFocusPausedRemainingMs = usePremiumStore((state) => state.getFocusPausedRemainingMs);
  const setFocusNotificationId = usePremiumStore((state) => state.setFocusNotificationId);
  const setFocusMode = usePremiumStore((state) => state.setFocusMode);
  const setFocusModeFromRemainingMs = usePremiumStore((state) => state.setFocusModeFromRemainingMs);
  const setFocusPausedRemainingMs = usePremiumStore((state) => state.setFocusPausedRemainingMs);
  const clearFocusMode = usePremiumStore((state) => state.clearFocusMode);
  const addSuggestionHistory = usePremiumStore((state) => state.addSuggestionHistory);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);
  const [suggestionResult, setSuggestionResult] = useState<SuggestionResult | null>(null);
  const [simpleSuggestionTask, setSimpleSuggestionTask] = useState<ReturnType<typeof getSimpleSuggestion>>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const isPremiumUser = getIsPremiumForUser(userId);
  const canUseFreeSuggestion = canUseFreeSuggestionForUser(userId);
  const suggestionHistory = getSuggestionHistory(userId);
  const focusModeUntil = getFocusModeUntil(userId);
  const focusNotificationId = getFocusNotificationId(userId);
  const pausedFocusRemainingMs = getFocusPausedRemainingMs(userId);
  const pendingTasks = tasks.filter((task) => !task.completed);
  const hasEnoughTasksForSuggestion = pendingTasks.length >= MIN_PENDING_TASKS_FOR_SUGGESTION;
  const completedTasks = tasks.filter((task) => task.completed);
  const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const selectedSuggestionTask = suggestionResult?.task ?? simpleSuggestionTask;
  const suggestionChainLabel = selectedSuggestionTask ? chainToLabel(getTaskChain(selectedSuggestionTask, tasks)) : null;
  const freeSuggestionLocked = !isPremiumUser && !canUseFreeSuggestion;
  const isFocusModeActive = !!focusModeUntil && new Date(focusModeUntil).getTime() > Date.now();
  const focusRemainingMs = focusModeUntil ? Math.max(new Date(focusModeUntil).getTime() - nowTick, 0) : 0;
  const hasPausedFocus = !isFocusModeActive && (pausedFocusRemainingMs ?? 0) > 0;
  const premiumWeeklyInsight = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const lastWeekTasks = tasks.filter((task) => new Date(task.createdAt).getTime() >= weekAgo);
    const done = lastWeekTasks.filter((task) => task.completed).length;
    const rate = lastWeekTasks.length === 0 ? 0 : Math.round((done / lastWeekTasks.length) * 100);
    const byCategory = new Map<string, number>();
    for (const task of lastWeekTasks) {
      byCategory.set(task.category, (byCategory.get(task.category) ?? 0) + 1);
    }
    const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'n/a';
    return { rate, topCategory, total: lastWeekTasks.length };
  }, [tasks]);
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

  useEffect(() => {
    // Reset session-scoped suggestion UI when account changes.
    setSuggestionResult(null);
    setSimpleSuggestionTask(null);
    setShowPaywall(false);
  }, [userId]);

  useEffect(() => {
    if (!isFocusModeActive) {
      return;
    }
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isFocusModeActive]);

  useEffect(() => {
    if (!isFocusModeActive && focusModeUntil) {
      clearFocusMode(userId);
    }
  }, [clearFocusMode, focusModeUntil, isFocusModeActive, userId]);

  const focusTimerLabel = useMemo(() => {
    const totalSeconds = Math.floor(focusRemainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [focusRemainingMs]);

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

  async function handleEditTask(taskId: string, updates: UpdateTaskInput) {
    await updateTask(taskId, updates, token);
  }

  function handleSuggestionRequest() {
    if (!hasEnoughTasksForSuggestion) {
      return;
    }
    const recentIds = suggestionHistory.slice(0, 2).map((item) => item.taskId);
    if (isPremiumUser) {
      const best = getBestTaskSuggestion(tasks, {
        excludeTaskIds: recentIds,
        contextSeed: suggestionHistory.length + tasks.length,
      });
      setSuggestionResult(best);
      setSimpleSuggestionTask(null);
      if (best) {
        addSuggestionHistory(userId, {
          taskId: best.task.id,
          taskTitle: best.task.title,
          score: best.score,
          explanation: best.explanation,
        });
      }
      return;
    }

    if (canUseFreeSuggestion) {
      const simpleTask = getSimpleSuggestion(tasks);
      setSimpleSuggestionTask(simpleTask);
      setSuggestionResult(null);
      consumeFreeSuggestion(userId);
      if (simpleTask) {
        addSuggestionHistory(userId, {
          taskId: simpleTask.id,
          taskTitle: simpleTask.title,
          score: 0,
          explanation: null,
        });
      }
      return;
    }

    setShowPaywall(true);
  }

  function handleUnlockPremium() {
    unlockPremium(userId);
    setShowPaywall(false);
    const best = getBestTaskSuggestion(tasks, {
      excludeTaskIds: suggestionHistory.slice(0, 2).map((item) => item.taskId),
      contextSeed: suggestionHistory.length + tasks.length,
    });
    setSuggestionResult(best);
    setSimpleSuggestionTask(null);
    if (best) {
      addSuggestionHistory(userId, {
        taskId: best.task.id,
        taskTitle: best.task.title,
        score: best.score,
        explanation: best.explanation,
      });
    }
  }

  async function handleStartFocus(minutes: number) {
    if (!isPremiumUser) {
      setShowPaywall(true);
      return;
    }
    if (focusNotificationId) {
      try {
        await cancelScheduledNotification(focusNotificationId);
      } catch {
        // Keep focus flow resilient even if old notification id is invalid.
      }
    }
    setFocusMode(userId, minutes);
    setFocusPausedRemainingMs(userId, null);
    setNowTick(Date.now());
    const notificationId = await scheduleFocusEndNotification(minutes);
    setFocusNotificationId(userId, notificationId);
  }

  async function handlePauseFocus() {
    if (!isFocusModeActive || !focusModeUntil) {
      return;
    }
    const remainingMs = Math.max(new Date(focusModeUntil).getTime() - Date.now(), 0);
    if (focusNotificationId) {
      try {
        await cancelScheduledNotification(focusNotificationId);
      } catch {
        // Best-effort cancellation, continue pausing timer state.
      }
    }
    await cancelAllFocusNotifications();
    setFocusNotificationId(userId, null);
    setFocusPausedRemainingMs(userId, remainingMs > 0 ? remainingMs : null);
    setNowTick(Date.now());
  }

  async function handleResumeFocus() {
    if (!hasPausedFocus || !pausedFocusRemainingMs || pausedFocusRemainingMs <= 0) {
      return;
    }
    setFocusModeFromRemainingMs(userId, pausedFocusRemainingMs);
    const notificationId = await scheduleFocusEndNotificationMs(pausedFocusRemainingMs);
    setFocusNotificationId(userId, notificationId);
    setNowTick(Date.now());
  }

  async function handleStopFocus() {
    if (focusNotificationId) {
      try {
        await cancelScheduledNotification(focusNotificationId);
      } catch {
        // Ignore cancellation failures and still clear local focus state.
      }
    }
    await cancelAllFocusNotifications();
    clearFocusMode(userId);
    setFocusNotificationId(userId, null);
    setFocusPausedRemainingMs(userId, null);
    setNowTick(Date.now());
  }

  return (
    <View style={styles.screenShell}>
      <ScreenAuraBackground theme={theme} variant="blue" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + theme.spacing.lg }]}
      >
        <CompletionCelebration trigger={celebrationTrigger} theme={theme} />
      <PremiumPaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUnlock={handleUnlockPremium}
      />
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

      {isPremiumUser && (
        <View style={styles.premiumExperienceCard}>
          <View style={styles.premiumExperienceHeader}>
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond-outline" size={13} color={theme.colors.textPrimary} />
              <Text style={styles.premiumBadgeText}>PREMIUM ACTIVE</Text>
            </View>
            <Text style={styles.premiumHint}>
              Weekly done {premiumWeeklyInsight.rate}% • Top category {premiumWeeklyInsight.topCategory}
            </Text>
          </View>
          <View style={styles.focusRow}>
            <View style={styles.focusPrimaryRow}>
              <Pressable
                style={[styles.focusButton, isFocusModeActive && styles.focusButtonActive]}
                onPress={() => void handleStartFocus(45)}
              >
                <Text style={styles.focusButtonText}>
                  {isFocusModeActive ? `Focus Active ${focusTimerLabel}` : 'Start 45m Focus Mode'}
                </Text>
              </Pressable>
              <Pressable style={styles.focusGhostButton} onPress={() => void handleStartFocus(25)}>
                <Text style={styles.focusGhostText}>25m</Text>
              </Pressable>
              <Pressable style={styles.focusGhostButton} onPress={() => void handleStopFocus()}>
                <Text style={styles.focusGhostText}>Stop</Text>
              </Pressable>
            </View>
            <View style={styles.focusSecondaryRow}>
              <Pressable
                style={[styles.focusGhostButton, !isFocusModeActive && styles.focusGhostDisabled]}
                onPress={() => void handlePauseFocus()}
                disabled={!isFocusModeActive}
              >
                <Text style={styles.focusGhostText}>Pause</Text>
              </Pressable>
              <Pressable
                style={[styles.focusGhostButton, !hasPausedFocus && styles.focusGhostDisabled]}
                onPress={() => void handleResumeFocus()}
                disabled={!hasPausedFocus}
              >
                <Text style={styles.focusGhostText}>Resume</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.historyTitle}>Suggestion History</Text>
          {suggestionHistory.length === 0 ? (
            <Text style={styles.premiumHint}>No suggestions yet. Tap Smart Suggestion to build your history.</Text>
          ) : (
            suggestionHistory.slice(0, 3).map((item) => (
              <View key={`${item.taskId}-${item.createdAt}`} style={styles.historyItem}>
                <Text style={styles.historyItemTitle}>{item.taskTitle}</Text>
                <Text style={styles.historyItemMeta}>
                  {new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  {item.score > 0 ? ` • score ${item.score}` : ' • free suggestion'}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      <NowSuggestionCard
        task={selectedSuggestionTask}
        explanation={suggestionResult?.explanation ?? null}
        chainLabel={suggestionChainLabel}
        isPremiumUser={isPremiumUser}
        freeSuggestionLocked={freeSuggestionLocked}
        minTasksRequired={hasEnoughTasksForSuggestion}
        onRequestSuggestion={handleSuggestionRequest}
      />

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
                onEditTask={handleEditTask}
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
                onEditTask={handleEditTask}
              />
            ))}
          </View>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
  screenShell: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  premiumExperienceCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  premiumExperienceHeader: {
    gap: 6,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.background,
  },
  premiumBadgeText: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  focusRow: {
    marginTop: 2,
    gap: 8,
  },
  focusPrimaryRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  focusSecondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  focusButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.tabActive,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  focusButtonActive: {
    backgroundColor: theme.colors.success,
  },
  focusButtonText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 12,
  },
  focusGhostButton: {
    minWidth: 68,
    minHeight: 38,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusGhostText: {
    color: theme.colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  focusGhostDisabled: {
    opacity: 0.45,
  },
  historyTitle: {
    marginTop: 2,
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  historyItem: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    padding: 8,
    gap: 2,
  },
  historyItemTitle: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  historyItemMeta: {
    color: theme.colors.textSecondary,
    fontSize: 11,
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
