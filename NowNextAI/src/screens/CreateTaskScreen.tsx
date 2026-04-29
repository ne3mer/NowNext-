import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTaskStore } from '../store/taskStore';
import { ui } from '../theme/ui';
import { TASK_CATEGORIES, TASK_PRIORITIES, TaskCategory, TaskPriority } from '../types/task';

export function CreateTaskScreen() {
  const createTask = useTaskStore((state) => state.createTask);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState<TaskCategory>('daily');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const normalizedDeadline = useMemo(() => deadline.trim(), [deadline]);

  function onSubmit() {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setError('Title is required.');
      setSuccessMessage(null);
      return;
    }

    let deadlineIso: string | null = null;
    if (normalizedDeadline) {
      const matched = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDeadline);
      const parsed = matched ? new Date(`${normalizedDeadline}T23:59:59.000Z`) : null;
      if (!parsed || Number.isNaN(parsed.getTime())) {
        setError('Deadline format should be YYYY-MM-DD.');
        setSuccessMessage(null);
        return;
      }
      deadlineIso = parsed.toISOString();
    }

    createTask({
      title: normalizedTitle,
      note: note.trim() || undefined,
      category,
      priority,
      deadline: deadlineIso,
    });

    setTitle('');
    setNote('');
    setDeadline('');
    setCategory('daily');
    setPriority('medium');
    setError(null);
    setSuccessMessage('Task created successfully.');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Task</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Prepare portfolio update"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.row}>
          {TASK_CATEGORIES.map((item) => {
            const isActive = item === category;
            return (
              <Pressable
                key={item}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Priority</Text>
        <View style={styles.row}>
          {TASK_PRIORITIES.map((item) => {
            const isActive = item === priority;
            return (
              <Pressable
                key={item}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setPriority(item)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Deadline (optional)</Text>
        <TextInput
          value={deadline}
          onChangeText={setDeadline}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Add context for this task..."
          placeholderTextColor="#94a3b8"
          style={[styles.input, styles.noteInput]}
          multiline
        />

        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}

        <Pressable style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitText}>Create Task</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  content: {
    padding: ui.spacing.lg,
    paddingBottom: ui.spacing.lg * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: ui.colors.textPrimary,
  },
  card: {
    marginTop: ui.spacing.md,
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    padding: ui.spacing.md,
    borderWidth: 1,
    borderColor: ui.colors.border,
    ...ui.shadow.card,
  },
  label: {
    marginTop: ui.spacing.sm,
    marginBottom: ui.spacing.xs,
    fontSize: 13,
    fontWeight: '600',
    color: ui.colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: ui.colors.textPrimary,
  },
  noteInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ui.spacing.xs,
  },
  pill: {
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  pillActive: {
    backgroundColor: ui.colors.tabActive,
    borderColor: ui.colors.tabActive,
  },
  pillText: {
    color: ui.colors.tabInactive,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  errorText: {
    marginTop: ui.spacing.sm,
    color: '#b91c1c',
    fontWeight: '600',
  },
  successText: {
    marginTop: ui.spacing.sm,
    color: '#15803d',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: ui.spacing.md,
    backgroundColor: ui.colors.tabActive,
    borderRadius: ui.radius.md,
    alignItems: 'center',
    paddingVertical: 12,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
