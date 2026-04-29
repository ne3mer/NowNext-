import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTheme, useAppTheme } from '../theme/theme';

type GoalPulseCardProps = {
  goalTitle: string;
  score: number;
};

export function GoalPulseCard({ goalTitle, score }: GoalPulseCardProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.row}>
          <Ionicons name="pulse-outline" size={15} color={theme.colors.textSecondary} />
          <Text style={styles.title}>Goal Pulse</Text>
        </View>
        <Text style={styles.score}>{score}%</Text>
      </View>
      <Text style={styles.goalText}>{goalTitle}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${score}%` }]} />
      </View>
      <Text style={styles.caption}>Most active yearly goal right now</Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    title: {
      color: theme.colors.textPrimary,
      fontWeight: '700',
      fontSize: 13,
    },
    score: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    goalText: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
      fontSize: 13,
    },
    track: {
      height: 7,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: theme.colors.border,
    },
    fill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: theme.colors.success,
    },
    caption: {
      color: theme.colors.textSecondary,
      fontSize: 11,
    },
  });
}
