import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../types/task';
import { ui } from '../theme/ui';

type NowSuggestionCardProps = {
  task: Task | null;
};

export function NowSuggestionCard({ task }: NowSuggestionCardProps) {
  const reasonText = task
    ? task.deadline
      ? 'Recommended because this task has strong priority and a close deadline.'
      : 'Recommended because this task has the highest current priority.'
    : null;

  return (
    <Pressable style={styles.container}>
      <Text style={styles.title}>What should I do now?</Text>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: ui.radius.lg,
    backgroundColor: '#dbeafe',
    padding: ui.spacing.md,
    ...ui.shadow.card,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  subtitle: {
    marginTop: ui.spacing.xs,
    color: '#1d4ed8',
  },
  meta: {
    marginTop: ui.spacing.xs,
    color: '#1e40af',
    fontWeight: '600',
    fontSize: 12,
  },
  metaRow: {
    gap: ui.spacing.xs,
  },
  reason: {
    color: '#1d4ed8',
    fontSize: 12,
  },
});
