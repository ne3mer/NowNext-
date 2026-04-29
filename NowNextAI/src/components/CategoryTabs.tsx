import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme, useAppTheme } from '../theme/theme';
import { TASK_CATEGORIES, TaskCategory } from '../types/task';

type CategoryTabsProps = {
  selectedCategory: TaskCategory | 'all';
  onChangeCategory: (category: TaskCategory | 'all') => void;
};

const tabCategories: Array<TaskCategory | 'all'> = ['all', ...TASK_CATEGORIES];

export function CategoryTabs({ selectedCategory, onChangeCategory }: CategoryTabsProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {tabCategories.map((category) => {
        const isActive = category === selectedCategory;

        return (
          <Pressable
            key={category}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChangeCategory(category)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {category === 'all' ? 'All' : category}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.tabActive,
    borderColor: theme.colors.tabActive,
  },
  text: {
    color: theme.colors.tabInactive,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  textActive: {
    color: theme.colors.background,
  },
  });
}
