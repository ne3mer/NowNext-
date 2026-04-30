import { useEffect, useMemo, useRef, useState } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import {
  Animated,
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
import { useAuthStore } from '../store/authStore';
import { useCategoryStore } from '../store/categoryStore';
import { useTaskStore } from '../store/taskStore';
import { AppTheme, useAppTheme } from '../theme/theme';
import { TASK_CATEGORIES, TASK_PRIORITIES, Task, TaskCategory, TaskPriority } from '../types/task';
import { getParentCandidates } from '../utils/taskLinks';
import { scheduleDeadlineNotification } from '../utils/notifications';

const QUICK_TEMPLATES: Array<{
  id: string;
  label: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  note: string;
  dueInHours: number;
}> = [
  {
    id: 'deep-work',
    label: 'Deep Work',
    title: '90-minute deep work sprint',
    category: 'daily',
    priority: 'high',
    note: 'Focus mode on. No distractions.',
    dueInHours: 2,
  },
  {
    id: 'weekly-review',
    label: 'Weekly Review',
    title: 'Review weekly priorities and blockers',
    category: 'weekly',
    priority: 'medium',
    note: 'Check progress and adjust next actions.',
    dueInHours: 24,
  },
  {
    id: 'goal-step',
    label: 'Goal Step',
    title: 'Ship one meaningful step for monthly goal',
    category: 'monthly',
    priority: 'high',
    note: 'Pick one high-impact action and finish it.',
    dueInHours: 48,
  },
];

export function CreateTaskScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const createTask = useTaskStore((state) => state.createTask);
  const setLocalTaskMeta = useTaskStore((state) => state.setLocalTaskMeta);
  const tasks = useTaskStore((state) => state.tasks);
  const token = useAuthStore((state) => state.token);
  const categories = useCategoryStore((state) => state.categories);
  const createCategory = useCategoryStore((state) => state.createCategory);
  const categoryError = useCategoryStore((state) => state.error);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end' | null>(null);
  const [category, setCategory] = useState<TaskCategory>('daily');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const categoryOptions = useMemo(() => {
    const fromBackend = categories.map((item) => item.name);
    const all = [...fromBackend, ...TASK_CATEGORIES];
    return Array.from(new Set(all));
  }, [categories]);

  useEffect(() => {
    if (!categoryOptions.includes(category)) {
      setCategory(categoryOptions[0] ?? 'daily');
    }
  }, [category, categoryOptions]);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [noteSectionY, setNoteSectionY] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const heroScaleAnim = useRef(new Animated.Value(1)).current;
  const ctaPulseAnim = useRef(new Animated.Value(1)).current;

  const deadlineLabel = useMemo(() => {
    if (!deadline) {
      return 'No deadline selected';
    }
    return deadline.toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }, [deadline]);
  const startTimeLabel = useMemo(
    () =>
      startTime
        ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'No start time',
    [startTime],
  );
  const endTimeLabel = useMemo(
    () => (endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No end time'),
    [endTime],
  );

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
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [entranceAnim]);

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
  const formMomentum = useMemo(() => {
    let score = 34;
    if (title.trim().length > 0) {
      score += 26;
    }
    if (deadline) {
      score += 18;
    }
    if (note.trim().length > 0) {
      score += 10;
    }
    if (description.trim().length > 0) {
      score += 8;
    }
    if (parentTaskId) {
      score += 12;
    }
    return Math.min(score, 100);
  }, [title, deadline, note, description, parentTaskId]);

  useEffect(() => {
    if (title.trim().length === 0) {
      return;
    }
    Animated.sequence([
      Animated.timing(heroScaleAnim, {
        toValue: 1.015,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(heroScaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroScaleAnim, title]);

  useEffect(() => {
    if (formMomentum < 72) {
      ctaPulseAnim.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ctaPulseAnim, {
          toValue: 1.04,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(ctaPulseAnim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [ctaPulseAnim, formMomentum]);

  function onChangeDeadline(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === 'dismissed') {
      setPickerMode(null);
      return;
    }

    if (selectedDate) {
      if (pickerMode === 'time') {
        const baseDate = deadline ?? new Date();
        const mergedDateTime = new Date(baseDate);
        mergedDateTime.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
        setDeadline(mergedDateTime);
      } else {
        const nextDate = new Date(selectedDate);
        const previous = deadline;
        if (previous) {
          nextDate.setHours(previous.getHours(), previous.getMinutes(), 0, 0);
        } else {
          nextDate.setHours(9, 0, 0, 0);
        }
        setDeadline(nextDate);
      }
      setError(null);
    }
    setPickerMode(null);
  }

  function onChangeTaskTime(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === 'dismissed') {
      setTimePickerTarget(null);
      return;
    }
    if (!selectedDate || !timePickerTarget) {
      setTimePickerTarget(null);
      return;
    }
    const next = new Date();
    next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    if (timePickerTarget === 'start') {
      setStartTime(next);
    } else {
      setEndTime(next);
    }
    setTimePickerTarget(null);
  }

  async function onSubmit() {
    Keyboard.dismiss();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setError('Title is required.');
      setSuccessMessage(null);
      return;
    }

    const deadlineIso = deadline ? new Date(deadline).toISOString() : null;

    const createdTask = await createTask(
      {
      title: normalizedTitle,
      note: note.trim() || undefined,
      description: description.trim() || undefined,
      category,
      parentTaskId,
      priority,
      deadline: deadlineIso,
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: endTime ? new Date(endTime).toISOString() : null,
      },
      token,
    );
    if (!createdTask) {
      setError('Please login first.');
      return;
    }

    if (deadlineIso) {
      const notificationId = await scheduleDeadlineNotification(normalizedTitle, deadlineIso);
      if (notificationId) {
        setLocalTaskMeta(createdTask.id, { notificationId });
      }
    }

    setTitle('');
    setNote('');
    setDescription('');
    setDeadline(null);
    setStartTime(null);
    setEndTime(null);
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

  function applyTemplate(templateId: string) {
    const template = QUICK_TEMPLATES.find((item) => item.id === templateId);
    if (!template) {
      return;
    }
    const dueDate = new Date(Date.now() + template.dueInHours * 60 * 60 * 1000);
    setTitle(template.title);
    setCategory(template.category);
    setPriority(template.priority);
    setNote(template.note);
    setDescription('');
    setDeadline(dueDate);
    setStartTime(null);
    setEndTime(null);
    setError(null);
    setSuccessMessage(null);
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) {
      return;
    }
    await createCategory(token, newCategoryName);
    setCategory(newCategoryName.trim().toLowerCase());
    setNewCategoryName('');
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
        <Text style={styles.subtitle}>Build a clear task with a premium flow.</Text>
        <Animated.View style={[styles.heroCard, { transform: [{ scale: heroScaleAnim }] }]}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroTitle}>Live draft preview</Text>
            <View style={styles.heroMomentumBadge}>
              <Ionicons name="flash-outline" size={12} color="#ffffff" />
              <Text style={styles.heroMomentumText}>{formMomentum}% ready</Text>
            </View>
          </View>
          <Text style={styles.heroDraftTitle}>{title.trim() || 'Untitled task'}</Text>
          <Text style={styles.heroDraftMeta}>
            {category.toUpperCase()} • {priority.toUpperCase()} • {deadline ? deadlineLabel : 'No schedule yet'}
          </Text>
          {!!selectedParent && <Text style={styles.heroDraftMeta}>Linked to: {selectedParent.title}</Text>}
        </Animated.View>
        <View style={styles.templateWrap}>
          <Text style={styles.templateTitle}>Quick Start Templates</Text>
          <View style={styles.templateRow}>
            {QUICK_TEMPLATES.map((template) => (
              <Pressable key={template.id} style={styles.templateChip} onPress={() => applyTemplate(template.id)}>
                <Ionicons name="sparkles-outline" size={13} color={theme.colors.textSecondary} />
                <Text style={styles.templateChipText}>{template.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: entranceAnim,
              transform: [
                {
                  translateY: entranceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            },
          ]}
        >
        <View style={styles.sectionHeader}>
          <Ionicons name="create-outline" size={15} color={theme.colors.textSecondary} />
          <Text style={styles.sectionTitle}>Core details</Text>
        </View>
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

        <View style={styles.sectionHeader}>
          <Ionicons name="layers-outline" size={15} color={theme.colors.textSecondary} />
          <Text style={styles.sectionTitle}>Planning setup</Text>
        </View>
        <Text style={styles.label}>Category</Text>
        <View style={styles.row}>
          {categoryOptions.map((item) => {
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
        <View style={styles.customCategoryRow}>
          <TextInput
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            placeholder="Create new category"
            placeholderTextColor="#94a3b8"
            style={[styles.input, styles.customCategoryInput]}
          />
          <Pressable style={styles.addCategoryButton} onPress={() => void handleCreateCategory()}>
            <Text style={styles.addCategoryText}>Add</Text>
          </Pressable>
        </View>
        {!!categoryError && <Text style={styles.errorText}>{categoryError}</Text>}

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
          <View style={styles.linkStatusCard}>
            <Ionicons name="git-branch-outline" size={13} color={theme.colors.textPrimary} />
            <Text style={styles.linkStatusText}>
              Impact chain active: this task contributes directly to "{selectedParent.title}".
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={15} color={theme.colors.textSecondary} />
          <Text style={styles.sectionTitle}>Schedule</Text>
        </View>
        <Text style={styles.label}>Deadline (optional)</Text>
        <View style={styles.dateRow}>
          <Pressable style={styles.dateButton} onPress={() => setPickerMode('date')}>
            <Text style={styles.dateButtonText}>{deadline ? 'Change Date' : 'Pick a Date'}</Text>
          </Pressable>
          <Pressable
            style={[styles.dateButton, !deadline && styles.dateButtonDisabled]}
            onPress={() => setPickerMode('time')}
            disabled={!deadline}
          >
            <Text style={styles.dateButtonText}>{deadline ? 'Pick Time' : 'Select date first'}</Text>
          </Pressable>
          <Pressable
            style={[styles.dateButton, styles.dateButtonClear, !deadline && styles.dateButtonDisabled]}
            onPress={() => setDeadline(null)}
            disabled={!deadline}
          >
            <Text style={styles.dateButtonText}>Clear</Text>
          </Pressable>
        </View>
        <Text style={styles.dateLabel}>{deadlineLabel}</Text>
        <Text style={styles.label}>Task Time Window (optional)</Text>
        <View style={styles.dateRow}>
          <Pressable style={styles.dateButton} onPress={() => setTimePickerTarget('start')}>
            <Text style={styles.dateButtonText}>{startTime ? 'Change Start' : 'Set Start Time'}</Text>
          </Pressable>
          <Pressable style={styles.dateButton} onPress={() => setTimePickerTarget('end')}>
            <Text style={styles.dateButtonText}>{endTime ? 'Change End' : 'Set End Time'}</Text>
          </Pressable>
          <Pressable
            style={[styles.dateButton, styles.dateButtonClear, !startTime && !endTime && styles.dateButtonDisabled]}
            onPress={() => {
              setStartTime(null);
              setEndTime(null);
            }}
            disabled={!startTime && !endTime}
          >
            <Text style={styles.dateButtonText}>Clear times</Text>
          </Pressable>
        </View>
        <Text style={styles.dateLabel}>Start: {startTimeLabel} • End: {endTimeLabel}</Text>
        {pickerMode && (
          <DateTimePicker
            value={deadline ?? new Date()}
            mode={pickerMode}
            display="default"
            onChange={onChangeDeadline}
            minimumDate={pickerMode === 'date' ? new Date() : undefined}
          />
        )}
        {timePickerTarget && (
          <DateTimePicker value={new Date()} mode="time" display="default" onChange={onChangeTaskTime} />
        )}

        <View onLayout={onNoteSectionLayout} style={styles.noteWrap}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={15} color={theme.colors.textSecondary} />
            <Text style={styles.sectionTitle}>Context note</Text>
          </View>
          <Text style={styles.label}>Quick Note (optional)</Text>
          <View style={styles.noteCard}>
            <Text style={styles.noteHelper}>One-liner vibe: short, sharp, and instantly scannable on the card.</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Call before 5pm"
              placeholderTextColor="#94a3b8"
              style={[styles.input, styles.noteInput]}
              multiline
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              onFocus={focusNoteField}
            />
          </View>
          <Text style={styles.label}>Description (optional)</Text>
          <Text style={styles.noteHelper}>Long-form details, steps, and background info for execution.</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Write detailed plan, checklist, or context..."
            placeholderTextColor="#94a3b8"
            style={[styles.input, styles.noteInput]}
            multiline
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}

        <Animated.View style={{ transform: [{ scale: ctaPulseAnim }] }}>
          <Pressable style={styles.submitButton} onPress={onSubmit}>
            <Text style={styles.submitText}>Create Task</Text>
          </Pressable>
        </Animated.View>
        </Animated.View>
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
  heroCard: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: isDark ? '#111827' : '#eef2ff',
    padding: theme.spacing.md,
    gap: 6,
    ...theme.shadow.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroMomentumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1d4ed8',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  heroMomentumText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  heroDraftTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  heroDraftMeta: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  templateWrap: {
    marginTop: theme.spacing.sm,
    gap: 8,
  },
  templateTitle: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  templateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  templateChipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
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
  sectionHeader: {
    marginTop: theme.spacing.md,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  linkStatusCard: {
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 10,
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  linkStatusText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
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
  customCategoryRow: {
    marginTop: theme.spacing.xs,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  customCategoryInput: {
    flex: 1,
  },
  addCategoryButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.tabActive,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addCategoryText: {
    color: theme.colors.background,
    fontWeight: '700',
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
      color: theme.colors.background,
    },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  dateButton: {
    minWidth: '48%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#111827' : '#ffffff',
  },
  dateButtonClear: {
    minWidth: '100%',
  },
  dateButtonDisabled: {
    opacity: 0.45,
  },
  dateButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
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
    color: theme.colors.background,
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
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  });
}
