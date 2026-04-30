import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme, useAppTheme } from '../theme/theme';
import { Task } from '../types/task';

type TaskCardProps = {
  task: Task;
  parentTitle?: string | null;
  impactPath?: string | null;
  linkCandidates?: Task[];
  onToggleComplete?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onLinkTask?: (taskId: string, parentTaskId: string | null) => void;
};

export function TaskCard({
  task,
  parentTitle,
  impactPath,
  linkCandidates = [],
  onToggleComplete,
  onDeleteTask,
  onLinkTask,
}: TaskCardProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showActions, setShowActions] = useState(false);
  const [showLinkOptions, setShowLinkOptions] = useState(false);
  const [showImpactPath, setShowImpactPath] = useState(false);
  const [activePathNode, setActivePathNode] = useState(0);
  const linkPulse = useRef(new Animated.Value(0.55)).current;
  const impactAnim = useRef(new Animated.Value(0)).current;
  const categoryPalette = theme.colors.category as Record<string, string>;
  const categoryColor = categoryPalette[task.category] ?? theme.colors.surface;
  const priorityColor = theme.colors.priority[task.priority];
  const horizonSteps = ['daily', 'weekly', 'monthly', 'yearly'];
  const activeStepIndex = horizonSteps.indexOf(task.category);
  const impactNodes = useMemo(
    () => (impactPath ? impactPath.split(' -> ').filter((node) => node.trim().length > 0) : []),
    [impactPath],
  );

  useEffect(() => {
    if (!parentTitle) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(linkPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(linkPulse, {
          toValue: 0.55,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [linkPulse, parentTitle]);

  useEffect(() => {
    if (!impactPath) {
      return;
    }

    Animated.timing(impactAnim, {
      toValue: showImpactPath ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [impactAnim, impactPath, showImpactPath]);

  return (
    <Pressable
      style={[styles.card, { backgroundColor: categoryColor }]}
      onPress={() => setShowActions(true)}
      accessibilityRole="button"
      accessibilityHint="Opens task actions"
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
      {!!task.description && <Text style={styles.note}>{task.description}</Text>}
      <Text style={styles.deadline}>
        {task.deadline
          ? `Due ${new Date(task.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`
          : 'No deadline'}
      </Text>
      {!!parentTitle && (
        <View style={styles.linkedWrap}>
          <Animated.View style={[styles.linkPulseDot, { opacity: linkPulse }]} />
          <View style={styles.linkedCard}>
            <View style={styles.linkedTopRow}>
              <Ionicons name="sparkles" size={13} color={theme.colors.textPrimary} />
              <Text style={styles.linkedBadge}>MISSION LINK ACTIVE</Text>
            </View>
            <Text style={styles.linkedText}>This task feeds into: {parentTitle}</Text>
            {!!impactPath && (
              <>
                <Pressable style={styles.pathToggle} onPress={() => setShowImpactPath((prev) => !prev)}>
                  <Ionicons
                    name={showImpactPath ? 'chevron-up-outline' : 'chevron-down-outline'}
                    size={13}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.pathToggleText}>
                    {showImpactPath ? 'Hide impact path' : 'Show impact path'}
                  </Text>
                </Pressable>
                {showImpactPath && (
                  <Animated.View style={{ opacity: impactAnim }}>
                    <Text style={styles.pathText}>{impactPath}</Text>
                    <View style={styles.timelineWrap}>
                      {impactNodes.map((node, index) => {
                        const isActive = index === activePathNode;
                        const isLast = index === impactNodes.length - 1;

                        return (
                          <View key={`${task.id}-impact-${node}-${index}`} style={styles.timelineItem}>
                            <Pressable
                              style={[styles.timelineNode, isActive && styles.timelineNodeActive]}
                              onPress={() => setActivePathNode(index)}
                            >
                              <Text style={[styles.timelineNodeText, isActive && styles.timelineNodeTextActive]}>
                                {node}
                              </Text>
                            </Pressable>
                            {!isLast && <View style={styles.timelineConnector} />}
                          </View>
                        );
                      })}
                    </View>
                    <Text style={styles.timelineDetail}>
                      Focus point: {impactNodes[activePathNode] ?? impactNodes[0]}
                    </Text>
                  </Animated.View>
                )}
              </>
            )}
          </View>
        </View>
      )}
      <View style={styles.horizonRow}>
        {horizonSteps.map((step, index) => (
          <View
            key={`${task.id}-${step}`}
            style={[
              styles.horizonDot,
              index <= activeStepIndex && styles.horizonDotActive,
              index === activeStepIndex && styles.horizonDotCurrent,
            ]}
          />
        ))}
      </View>
      <View style={styles.tapHintRow}>
        <Ionicons
          name={task.completed ? 'refresh-circle-outline' : 'checkmark-circle-outline'}
          size={14}
          color={theme.colors.textSecondary}
        />
        <Text style={styles.tapHint}>Tap to open task actions</Text>
      </View>

      <Modal visible={showActions} transparent animationType="fade" onRequestClose={() => setShowActions(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{task.title}</Text>
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                setShowActions(false);
                onToggleComplete?.(task.id);
              }}
            >
              <Ionicons
                name={task.completed ? 'refresh-circle-outline' : 'checkmark-circle-outline'}
                size={16}
                color={theme.colors.textPrimary}
              />
              <Text style={styles.actionText}>{task.completed ? 'Mark as pending' : 'Mark as completed'}</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                setShowActions(false);
                onDeleteTask?.(task.id);
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#b91c1c" />
              <Text style={[styles.actionText, styles.actionDanger]}>Delete task</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                setShowActions(false);
                setShowLinkOptions(true);
              }}
            >
              <Ionicons name="git-branch-outline" size={16} color={theme.colors.textPrimary} />
              <Text style={styles.actionText}>Link to another goal</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setShowActions(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showLinkOptions} transparent animationType="fade" onRequestClose={() => setShowLinkOptions(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Link "{task.title}"</Text>
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                setShowLinkOptions(false);
                onLinkTask?.(task.id, null);
              }}
            >
              <Ionicons name="close-circle-outline" size={16} color={theme.colors.textPrimary} />
              <Text style={styles.actionText}>Remove parent link</Text>
            </Pressable>
            {linkCandidates.slice(0, 8).map((candidate) => (
              <Pressable
                key={`${task.id}-link-${candidate.id}`}
                style={styles.actionButton}
                onPress={() => {
                  setShowLinkOptions(false);
                  onLinkTask?.(task.id, candidate.id);
                }}
              >
                <Ionicons name="arrow-up-circle-outline" size={16} color={theme.colors.textPrimary} />
                <Text style={styles.actionText}>
                  {candidate.category}: {candidate.title}
                </Text>
              </Pressable>
            ))}
            <Pressable style={styles.cancelButton} onPress={() => setShowLinkOptions(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    linkedText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    linkedWrap: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    linkPulseDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      backgroundColor: theme.colors.success,
    },
    linkedCard: {
      flex: 1,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: theme.colors.background,
      gap: 4,
    },
    linkedTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    linkedBadge: {
      color: theme.colors.textPrimary,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    pathToggle: {
      marginTop: 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    pathToggleText: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    pathText: {
      marginTop: 4,
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 17,
    },
    timelineWrap: {
      marginTop: 8,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      rowGap: 8,
    },
    timelineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 4,
    },
    timelineNode: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 999,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    timelineNodeActive: {
      borderColor: theme.colors.textPrimary,
      backgroundColor: theme.colors.textPrimary,
    },
    timelineNodeText: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    timelineNodeTextActive: {
      color: theme.colors.background,
    },
    timelineConnector: {
      width: 12,
      height: 1,
      marginHorizontal: 5,
      backgroundColor: theme.colors.border,
    },
    timelineDetail: {
      marginTop: 8,
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    horizonRow: {
      marginTop: 6,
      flexDirection: 'row',
      gap: 5,
    },
    horizonDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
      backgroundColor: theme.colors.border,
    },
    horizonDotActive: {
      backgroundColor: theme.colors.textSecondary,
      opacity: 0.65,
    },
    horizonDotCurrent: {
      width: 14,
      borderRadius: 999,
      opacity: 1,
      backgroundColor: theme.colors.textPrimary,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    modalCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      ...theme.shadow.card,
    },
    modalTitle: {
      color: theme.colors.textPrimary,
      fontWeight: '700',
      fontSize: 16,
    },
    actionButton: {
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingVertical: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionText: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    actionDanger: {
      color: '#b91c1c',
    },
    cancelButton: {
      borderRadius: theme.radius.md,
      paddingVertical: 10,
      alignItems: 'center',
    },
    cancelText: {
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
  });
}
