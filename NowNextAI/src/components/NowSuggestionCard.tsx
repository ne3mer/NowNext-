import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme, useAppTheme } from '../theme/theme';
import { Task } from '../types/task';

type NowSuggestionCardProps = {
  task: Task | null;
};

export function NowSuggestionCard({ task }: NowSuggestionCardProps) {
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const reasonText = task
    ? task.deadline
      ? 'Recommended because this task has strong priority and a close deadline.'
      : 'Recommended because this task has the highest current priority.'
    : null;

  return (
    <Pressable style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="flash" size={16} color="#1e3a8a" />
        <Text style={styles.title}>What should I do now?</Text>
      </View>
      <Text style={styles.subtitle}>
        {task ? task.title : 'No pending tasks yet. Add one from the Create tab.'}
      </Text>
      {task && (
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            {task.priority.toUpperCase()}
            {task.deadline
              ? `  •  Due ${new Date(task.deadline).toLocaleDateString()}`
              : '  •  No deadline'}
          </Text>
          <Text style={styles.reason}>{reasonText}</Text>
        </View>
      )}
      <View style={styles.footerRow}>
        <Ionicons name="arrow-forward-circle-outline" size={14} color="#1d4ed8" />
        <Text style={styles.footerText}>
          {task ? 'Start with this one and build momentum.' : 'Create a task to unlock smart suggestions.'}
        </Text>
      </View>
    </Pressable>
  );
}

function createStyles(theme: AppTheme, isDark: boolean) {
  return StyleSheet.create({
  container: {
    borderRadius: theme.radius.lg,
    backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: isDark ? '#dbeafe' : '#1e3a8a',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    color: isDark ? '#bfdbfe' : '#1d4ed8',
  },
  meta: {
    marginTop: theme.spacing.xs,
    color: isDark ? '#dbeafe' : '#1e40af',
    fontWeight: '600',
    fontSize: 12,
  },
  metaRow: {
    gap: theme.spacing.xs,
  },
  reason: {
    color: isDark ? '#bfdbfe' : '#1d4ed8',
    fontSize: 12,
  },
  footerRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: isDark ? '#bfdbfe' : '#1d4ed8',
    fontSize: 12,
  },
  });
}
