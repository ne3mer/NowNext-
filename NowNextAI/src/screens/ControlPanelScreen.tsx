import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { AppTheme, useAppTheme } from '../theme/theme';

export function ControlPanelScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const tasks = useTaskStore((state) => state.tasks);
  const user = useAuthStore((state) => state.user);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(tasks[0]?.id ?? null);
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );

  const pendingCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const overdueCount = tasks.filter(
    (task) => !task.completed && !!task.deadline && new Date(task.deadline).getTime() < Date.now(),
  ).length;
  const withTimeWindow = tasks.filter((task) => task.startTime || task.endTime).length;
  const linkedTasks = tasks.filter((task) => !!task.parentTaskId).length;
  const topCategory = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const task of tasks) {
      byCategory.set(task.category, (byCategory.get(task.category) ?? 0) + 1);
    }
    return [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'n/a';
  }, [tasks]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + theme.spacing.lg }]}
    >
      <Text style={styles.title}>Control Panel</Text>
      <Text style={styles.subtitle}>Everything in one place. Read signals, understand performance.</Text>

      <View style={styles.userCard}>
        <Text style={styles.userTitle}>{user?.name ?? 'User'}</Text>
        <Text style={styles.userMeta}>{user?.email ?? 'No email'}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{overdueCount}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{withTimeWindow}</Text>
          <Text style={styles.statLabel}>With time window</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{linkedTasks}</Text>
          <Text style={styles.statLabel}>Linked tasks</Text>
        </View>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Portfolio Insights</Text>
        <Text style={styles.metaText}>Top category: {topCategory}</Text>
        <Text style={styles.metaText}>
          Completion rate: {tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100)}%
        </Text>
        <Text style={styles.metaText}>
          Focusability score: {tasks.length === 0 ? 0 : Math.round((withTimeWindow / tasks.length) * 100)}%
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Task Explorer</Text>
      <View style={styles.taskChipWrap}>
        {tasks.map((task) => {
          const active = task.id === selectedTaskId;
          return (
            <Pressable key={task.id} style={[styles.taskChip, active && styles.taskChipActive]} onPress={() => setSelectedTaskId(task.id)}>
              <Text style={[styles.taskChipText, active && styles.taskChipTextActive]} numberOfLines={1}>
                {task.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!selectedTask ? (
        <Text style={styles.emptyText}>No task selected yet.</Text>
      ) : (
        <View style={styles.editorCard}>
          <Text style={styles.editorTitle}>Task Detail Lens</Text>
          <Text style={styles.metaText}>Title: {selectedTask.title}</Text>
          <Text style={styles.metaText}>Category: {selectedTask.category}</Text>
          <Text style={styles.metaText}>Priority: {selectedTask.priority}</Text>
          <Text style={styles.metaText}>Status: {selectedTask.completed ? 'done' : 'pending'}</Text>
          <Text style={styles.metaText}>Quick note: {selectedTask.note?.trim() ? selectedTask.note : 'none'}</Text>
          <Text style={styles.metaText}>
            Description: {selectedTask.description?.trim() ? selectedTask.description : 'none'}
          </Text>
          <Text style={styles.metaText}>
            Deadline: {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'none'}
          </Text>
          <Text style={styles.metaText}>
            Window: {selectedTask.startTime ? new Date(selectedTask.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} - {selectedTask.endTime ? new Date(selectedTask.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </Text>
          <Text style={styles.metaText}>
            Completed at: {selectedTask.completedAt ? new Date(selectedTask.completedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'not completed yet'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(theme: AppTheme, isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.lg, gap: theme.spacing.md },
    title: { fontSize: 28, fontWeight: '800', color: theme.colors.textPrimary },
    subtitle: { color: theme.colors.textSecondary },
    userCard: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: isDark ? '#111827' : '#eff6ff',
      padding: theme.spacing.md,
    },
    userTitle: { color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 },
    userMeta: { color: theme.colors.textSecondary, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    statCard: {
      minWidth: '30%',
      flex: 1,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingVertical: 8,
      alignItems: 'center',
    },
    statValue: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: 16 },
    statLabel: { color: theme.colors.textSecondary, fontSize: 11 },
    insightCard: {
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.sm,
      gap: 4,
    },
    insightTitle: { color: theme.colors.textPrimary, fontWeight: '800' },
    sectionTitle: { color: theme.colors.textPrimary, fontWeight: '700', fontSize: 14 },
    taskChipWrap: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
    taskChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: theme.colors.surface,
      maxWidth: '48%',
    },
    taskChipActive: { borderColor: theme.colors.tabActive, backgroundColor: theme.colors.tabActive },
    taskChipText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' },
    taskChipTextActive: { color: theme.colors.background },
    emptyText: { color: theme.colors.textSecondary },
    editorCard: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      gap: 8,
    },
    editorTitle: { color: theme.colors.textPrimary, fontWeight: '800' },
    metaText: { color: theme.colors.textSecondary, fontSize: 12 },
  });
}
