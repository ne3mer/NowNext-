import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TASK_CATEGORIES, TaskCategory } from '../types/task';
import { ui } from '../theme/ui';

type CategoryTabsProps = {
  selectedCategory: TaskCategory | 'all';
  onChangeCategory: (category: TaskCategory | 'all') => void;
};

const tabCategories: Array<TaskCategory | 'all'> = ['all', ...TASK_CATEGORIES];

export function CategoryTabs({ selectedCategory, onChangeCategory }: CategoryTabsProps) {
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ui.spacing.xs,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: ui.colors.surface,
    borderWidth: 1,
    borderColor: ui.colors.border,
  },
  tabActive: {
    backgroundColor: ui.colors.tabActive,
    borderColor: ui.colors.tabActive,
  },
  text: {
    color: ui.colors.tabInactive,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  textActive: {
    color: '#ffffff',
  },
});
