import { useEffect, useMemo, useRef, useState } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTaskStore } from '../store/taskStore';
import { AppTheme, useAppTheme } from '../theme/theme';
import { TASK_CATEGORIES, TASK_PRIORITIES, Task, TaskCategory, TaskPriority } from '../types/task';
import { getParentCandidates } from '../utils/taskLinks';

export function CreateTaskScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const createTask = useTaskStore((state) => state.createTask);
  const tasks = useTaskStore((state) => state.tasks);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState<TaskCategory>('daily');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [noteSectionY, setNoteSectionY] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const deadlineLabel = useMemo(() => {
    if (!deadline) {
      return 'No deadline selected';
    }
    return deadline.toLocaleDateString();
  }, [deadline]);

  const parentCandidates = useMemo(
    () => getParentCandidates(tasks, category).slice(0, 8),
    [tasks, category],
  );

  useEffect(() => {
    if (parentTaskId && !parentCandidates.some((task) => task.id === parentTaskId)) {
      setParentTaskId(null);
    }
  }, [parentCandidates, parentTaskId]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const selectedParent = useMemo(
    () => parentCandidates.find((task) => task.id === parentTaskId) ?? null,
    [parentCandidates, parentTaskId],
  );

  function onChangeDeadline(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      setDeadline(selectedDate);
      setError(null);
    }
    setShowDatePicker(false);
  }

  function onSubmit() {
    Keyboard.dismiss();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setError('Title is required.');
      setSuccessMessage(null);
      return;
    }

    const deadlineIso = deadline ? new Date(deadline).toISOString() : null;

    createTask({
      title: normalizedTitle,
      note: note.trim() || undefined,
      category,
      parentTaskId,
      priority,
      deadline: deadlineIso,
    });

    setTitle('');
    setNote('');
    setDeadline(null);
    setCategory('daily');
    setPriority('medium');
    setParentTaskId(null);
    setError(null);
    setSuccessMessage('Task created successfully.');
  }

  function focusNoteField() {
    setTimeout(() => {
      const targetY = Math.max(noteSectionY - 24, 0);
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }, 120);
  }

  function onNoteSectionLayout(event: LayoutChangeEvent) {
    setNoteSectionY(event.nativeEvent.layout.y);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 22}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + keyboardHeight + theme.spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <Text style={styles.title}>Create Task</Text>
        <Text style={styles.subtitle}>Capture it now and let NowNext guide your focus.</Text>
        <View style={styles.card}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Prepare portfolio update"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
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

        <Text style={styles.label}>Link to Bigger Goal (creative mode)</Text>
        {parentCandidates.length === 0 ? (
          <Text style={styles.helperText}>
            This category is top-level right now. Create bigger goals first to connect lower-level tasks.
          </Text>
        ) : (
          <View style={styles.linkGrid}>
            <Pressable
              style={[styles.linkPill, !parentTaskId && styles.linkPillActive]}
              onPress={() => setParentTaskId(null)}
            >
              <Text style={[styles.linkPillText, !parentTaskId && styles.linkPillTextActive]}>
                No parent
              </Text>
            </Pressable>
            {parentCandidates.map((candidate: Task) => {
              const isActive = candidate.id === parentTaskId;
              return (
                <Pressable
                  key={candidate.id}
                  style={[styles.linkPill, isActive && styles.linkPillActive]}
                  onPress={() => setParentTaskId(candidate.id)}
                >
                  <Text style={[styles.linkPillText, isActive && styles.linkPillTextActive]}>
                    {candidate.category}: {candidate.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {!!selectedParent && (
          <Text style={styles.helperText}>
            Impact chain active: this task contributes directly to "{selectedParent.title}".
          </Text>
        )}

        <Text style={styles.label}>Deadline (optional)</Text>
        <View style={styles.dateRow}>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{deadline ? 'Change Date' : 'Pick a Date'}</Text>
          </Pressable>
          <Pressable
            style={[styles.dateButton, !deadline && styles.dateButtonDisabled]}
            onPress={() => setDeadline(null)}
            disabled={!deadline}
          >
            <Text style={styles.dateButtonText}>Clear</Text>
          </Pressable>
        </View>
        <Text style={styles.dateLabel}>{deadlineLabel}</Text>
        {showDatePicker && (
          <DateTimePicker
            value={deadline ?? new Date()}
            mode="date"
            display="default"
            onChange={onChangeDeadline}
            minimumDate={new Date()}
          />
        )}

        <View onLayout={onNoteSectionLayout} style={styles.noteWrap}>
          <Text style={styles.label}>Note (optional)</Text>
          <View style={styles.noteCard}>
            <Text style={styles.noteHelper}>Brain dump freely. This section expands your focus clarity.</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add context for this task..."
              placeholderTextColor="#94a3b8"
              style={[styles.input, styles.noteInput]}
              multiline
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              onFocus={focusNoteField}
            />
          </View>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}

        <Pressable style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitText}>Create Task</Text>
        </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(theme: AppTheme, isDark: boolean) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.lg * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  card: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  label: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
    helperText: {
      marginTop: theme.spacing.xs,
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: isDark ? '#111827' : '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.textPrimary,
  },
  noteInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  noteWrap: {
    marginTop: theme.spacing.xs,
  },
  noteCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 10,
    backgroundColor: theme.colors.background,
    gap: 8,
  },
  noteHelper: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
    linkGrid: {
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    linkPill: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: isDark ? '#111827' : '#ffffff',
    },
    linkPillActive: {
      borderColor: theme.colors.tabActive,
      backgroundColor: theme.colors.tabActive,
    },
    linkPillText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    linkPillTextActive: {
      color: '#ffffff',
    },
  dateRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: isDark ? '#111827' : '#ffffff',
  },
  dateButtonDisabled: {
    opacity: 0.45,
  },
  dateButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  dateLabel: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  pill: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: isDark ? '#111827' : '#ffffff',
  },
  pillActive: {
    backgroundColor: theme.colors.tabActive,
    borderColor: theme.colors.tabActive,
  },
  pillText: {
    color: theme.colors.tabInactive,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  errorText: {
    marginTop: theme.spacing.sm,
    color: '#b91c1c',
    fontWeight: '600',
  },
  successText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.success,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.tabActive,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    paddingVertical: 12,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  });
}
