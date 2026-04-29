import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../types/task';
import { ui } from '../theme/ui';

type TaskCardProps = {
  task: Task;
  onToggleComplete?: (taskId: string) => void;
};

export function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  const categoryColor = ui.colors.category[task.category];
  const priorityColor = ui.colors.priority[task.priority];

  return (
    <Pressable
      style={[styles.card, { backgroundColor: categoryColor }]}
      onPress={() => onToggleComplete?.(task.id)}
      accessibilityRole="button"
      accessibilityHint="Toggles task completion"
    >
      <View style={styles.headerRow}>
        <View style={styles.categoryRow}>
          <Ionicons name="bookmark-outline" size={13} color={ui.colors.textSecondary} />
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
        <Ionicons name={task.completed ? 'refresh-circle-outline' : 'checkmark-circle-outline'} size={14} color={ui.colors.textSecondary} />
        <Text style={styles.tapHint}>{task.completed ? 'Tap to mark as pending' : 'Tap to complete'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: ui.radius.lg,
    padding: ui.spacing.md,
    ...ui.shadow.card,
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
    color: ui.colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
    marginTop: ui.spacing.xs,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.65,
  },
  category: {
    color: ui.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  priority: {
    textTransform: 'capitalize',
    fontSize: 12,
    fontWeight: '700',
  },
  note: {
    marginTop: ui.spacing.xs,
    color: ui.colors.textSecondary,
  },
  deadline: {
    marginTop: ui.spacing.sm,
    color: ui.colors.textSecondary,
    fontSize: 12,
  },
  tapHint: {
    fontSize: 11,
    color: ui.colors.textSecondary,
    opacity: 0.9,
  },
  tapHintRow: {
    marginTop: ui.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
