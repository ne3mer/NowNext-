import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../types/task';
import { ui } from '../theme/ui';

type NowSuggestionCardProps = {
  task: Task | null;
};

export function NowSuggestionCard({ task }: NowSuggestionCardProps) {
  return (
    <Pressable style={styles.container}>
      <Text style={styles.title}>What should I do now?</Text>
      <Text style={styles.subtitle}>
        {task ? task.title : 'No pending tasks yet. Add one from the Create tab.'}
      </Text>
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
});
