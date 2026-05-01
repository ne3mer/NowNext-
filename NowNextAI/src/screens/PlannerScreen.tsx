import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ScreenAuraBackground } from '../components/ScreenAuraBackground';
import { TaskCard } from '../components/TaskCard';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { AppTheme, useAppTheme } from '../theme/theme';
import { chainToTitlePath, getParentCandidates, getTaskChain } from '../utils/taskLinks';

function toDayKey(dateLike: string) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

export function PlannerScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const setLocalTaskMeta = useTaskStore((state) => state.setLocalTaskMeta);
  const token = useAuthStore((state) => state.token);

  const todayKey = new Date().toISOString().slice(0, 10);
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const task of tasks) {
      const key = task.deadline ? toDayKey(task.deadline) : toDayKey(task.createdAt);
      if (!key) {
        continue;
      }
      map.set(key, [...(map.get(key) ?? []), task]);
    }
    return map;
  }, [tasks]);

  const selectedDayTasks = tasksByDay.get(selectedDay) ?? [];

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }> =
      {};
    for (const [day, dayTasks] of tasksByDay.entries()) {
      const pending = dayTasks.some((task) => !task.completed);
      const overdue = dayTasks.some(
        (task) => !task.completed && !!task.deadline && new Date(task.deadline).getTime() < Date.now(),
      );
      marks[day] = {
        marked: true,
        dotColor: overdue ? '#ef4444' : pending ? theme.colors.tabActive : theme.colors.success,
      };
    }
    marks[selectedDay] = {
      ...(marks[selectedDay] ?? {}),
      selected: true,
      selectedColor: theme.colors.tabActive,
    };
    return marks;
  }, [selectedDay, tasksByDay, theme.colors.success, theme.colors.tabActive]);

  return (
    <View style={styles.screenShell}>
      <ScreenAuraBackground theme={theme} variant="sunset" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + theme.spacing.lg }]}
      >
        <Text style={styles.title}>Planner Calendar</Text>
        <Text style={styles.subtitle}>Touch a day and manage everything visually.</Text>

      <View style={styles.calendarCard}>
        <Calendar
          markedDates={markedDates}
          onDayPress={(day: DateData) => setSelectedDay(day.dateString)}
          theme={{
            calendarBackground: theme.colors.surface,
            dayTextColor: theme.colors.textPrimary,
            monthTextColor: theme.colors.textPrimary,
            textDisabledColor: theme.colors.textSecondary,
            selectedDayTextColor: theme.colors.background,
            arrowColor: theme.colors.tabActive,
            todayTextColor: theme.colors.tabActive,
          }}
          hideExtraDays
          enableSwipeMonths
        />
      </View>

      <View style={styles.dayHeader}>
        <Text style={styles.dayHeaderTitle}>{new Date(selectedDay).toLocaleDateString([], { dateStyle: 'full' })}</Text>
        <Text style={styles.dayHeaderMeta}>{selectedDayTasks.length} task(s)</Text>
      </View>

      {selectedDayTasks.length === 0 ? (
        <Text style={styles.emptyText}>No tasks on this day. Pick another date or add a new task.</Text>
      ) : (
        <View style={styles.list}>
          {selectedDayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              parentTitle={task.parentTaskId ? tasksById.get(task.parentTaskId)?.title ?? null : null}
              impactPath={task.parentTaskId ? chainToTitlePath(getTaskChain(task, tasks)) : null}
              onToggleComplete={(id) => void toggleTaskCompletion(id, token)}
              onDeleteTask={(id) => void deleteTask(id, token)}
              linkCandidates={getParentCandidates(tasks, task.category, task.id)}
              onLinkTask={(id, parentTaskId) => setLocalTaskMeta(id, { parentTaskId })}
              onEditTask={(id, updates) => updateTask(id, updates, token)}
            />
          ))}
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
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    calendarCard: {
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card,
    },
    dayHeader: {
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.sm,
      gap: 2,
    },
    dayHeaderTitle: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    dayHeaderMeta: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    emptyText: {
      color: theme.colors.textSecondary,
    },
    list: {
      gap: theme.spacing.sm,
    },
  });
}
