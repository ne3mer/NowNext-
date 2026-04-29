import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme, useAppTheme } from '../theme/theme';
import { Task } from '../types/task';

type TaskCardProps = {
  task: Task;
  onToggleComplete?: (taskId: string) => void;
};

export function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const categoryColor = theme.colors.category[task.category];
  const priorityColor = theme.colors.priority[task.priority];

  return (
    <Pressable
      style={[styles.card, { backgroundColor: categoryColor }]}
      onPress={() => onToggleComplete?.(task.id)}
      accessibilityRole="button"
      accessibilityHint="Toggles task completion"
    >
      <View style={styles.headerRow}>
        <View style={styles.categoryRow}>
          <Ionicons name="bookmark-outline" size={13} color={theme.colors.textSecondary} />
          <Text style={styles.category}>{task.category.toUpperCase()}</Text>
        </View>
        <View style={styles.priorityRow}>
          <Ionicons name="flag" size={12} color={priorityColor} />
          <Text style={[styles.priority, { color: priorityColor }]}>{task.priority}</Text>
        </View>
      </View>
      <Text style={[styles.title, task.completed && styles.titleCompleted]}>{task.title}</Text>
      {!!task.note && <Text style={styles.note}>{task.note}</Text>}
      <Text style={styles.deadline}>
        {task.deadline ? `Due ${new Date(task.deadline).toLocaleDateString()}` : 'No deadline'}
      </Text>
      <View style={styles.tapHintRow}>
        <Ionicons
          name={task.completed ? 'refresh-circle-outline' : 'checkmark-circle-outline'}
          size={14}
          color={theme.colors.textSecondary}
        />
        <Text style={styles.tapHint}>{task.completed ? 'Tap to mark as pending' : 'Tap to complete'}</Text>
      </View>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      ...theme.shadow.card,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    priorityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    title: {
      color: theme.colors.textPrimary,
      fontWeight: '700',
      fontSize: 16,
      marginTop: theme.spacing.xs,
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
      opacity: 0.65,
    },
    category: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    priority: {
      textTransform: 'capitalize',
      fontSize: 12,
      fontWeight: '700',
    },
    note: {
      marginTop: theme.spacing.xs,
      color: theme.colors.textSecondary,
    },
    deadline: {
      marginTop: theme.spacing.sm,
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    tapHint: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      opacity: 0.9,
    },
    tapHintRow: {
      marginTop: theme.spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  });
}
