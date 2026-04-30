import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme, useAppTheme } from '../theme/theme';
import { Task } from '../types/task';

type NowSuggestionCardProps = {
  task: Task | null;
  explanation?: string | null;
  chainLabel?: string | null;
  isPremiumUser: boolean;
  freeSuggestionLocked: boolean;
  minTasksRequired: boolean;
  onRequestSuggestion: () => void;
};

export function NowSuggestionCard({
  task,
  explanation,
  chainLabel,
  isPremiumUser,
  freeSuggestionLocked,
  minTasksRequired,
  onRequestSuggestion,
}: NowSuggestionCardProps) {
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const confidenceScore = task ? (task.priority === 'high' ? 92 : task.priority === 'medium' ? 74 : 58) : 0;
  const reasonText = isPremiumUser ? explanation : null;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="flash" size={16} color="#1e3a8a" />
        <Text style={styles.title}>What should I do now?</Text>
        {isPremiumUser && (
          <View style={styles.proTag}>
            <Text style={styles.proTagText}>PRO</Text>
          </View>
        )}
      </View>
      <Text style={styles.subtitle}>
        {task
          ? task.title
          : !minTasksRequired
            ? 'Add at least 5 pending tasks to activate smart suggestions.'
            : freeSuggestionLocked
              ? 'Free suggestion used today. Unlock premium for unlimited insights.'
              : 'Tap below to get a suggestion.'}
      </Text>
      <Pressable
        style={[styles.ctaButton, !minTasksRequired && styles.ctaButtonDisabled]}
        onPress={onRequestSuggestion}
        disabled={!minTasksRequired}
      >
        <Text style={styles.ctaText}>
          {!minTasksRequired
            ? 'Need 5+ tasks to activate'
            : isPremiumUser
              ? 'Get Smart Suggestion'
              : freeSuggestionLocked
                ? 'Unlock Smart Suggestions - €5'
                : 'Get Free Suggestion'}
        </Text>
      </Pressable>
      {task && (
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            {task.priority.toUpperCase()}
            {task.deadline
              ? `  •  Due ${new Date(task.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`
              : '  •  No deadline'}
          </Text>
          <Text style={styles.reason}>{reasonText}</Text>
          {!!chainLabel && <Text style={styles.chain}>Impact path: {chainLabel}</Text>}
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <Text style={styles.confidencePercent}>{confidenceScore}%</Text>
          </View>
          <View style={styles.confidenceTrack}>
            <View style={[styles.confidenceFill, { width: `${confidenceScore}%` }]} />
          </View>
        </View>
      )}
      <View style={styles.footerRow}>
        <Ionicons name="arrow-forward-circle-outline" size={14} color="#1d4ed8" />
        <Text style={styles.footerText}>
          {task ? 'Start with this one and build momentum.' : 'Create a task to unlock smart suggestions.'}
        </Text>
      </View>
    </View>
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
  chain: {
    color: isDark ? '#dbeafe' : '#1e40af',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confidenceLabel: {
    color: isDark ? '#bfdbfe' : '#1d4ed8',
    fontSize: 11,
  },
  confidencePercent: {
    color: isDark ? '#dbeafe' : '#1e40af',
    fontSize: 11,
    fontWeight: '700',
  },
  confidenceTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: isDark ? '#1e40af' : '#93c5fd',
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: isDark ? '#dbeafe' : '#1d4ed8',
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
  ctaButton: {
    marginTop: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: isDark ? '#93c5fd' : '#1d4ed8',
    backgroundColor: isDark ? '#1e40af' : '#bfdbfe',
    paddingVertical: 9,
    alignItems: 'center',
  },
  ctaText: {
    color: isDark ? '#e0f2fe' : '#1e3a8a',
    fontWeight: '700',
    fontSize: 12,
  },
  ctaButtonDisabled: {
    opacity: 0.45,
  },
  proTag: {
    marginLeft: 'auto',
    borderRadius: 999,
    backgroundColor: isDark ? '#e0f2fe' : '#1e3a8a',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  proTagText: {
    color: isDark ? '#0f172a' : '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  });
}
