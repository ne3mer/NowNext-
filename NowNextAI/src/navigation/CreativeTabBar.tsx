import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CreativeTabBarProps = BottomTabBarProps & {
  isDark: boolean;
};

export function CreativeTabBar({ isDark, ...props }: CreativeTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  const gradientColors = isDark
    ? (['#0c1222', '#151b2e', '#1a1033'] as const)
    : (['#ffffff', '#f0f4ff', '#ede9fe'] as const);

  return (
    <View style={[styles.shell, { paddingBottom: bottomPad }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.glowTop} />
      <View style={[styles.rim, { borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(99,102,241,0.2)' }]} />
      <BottomTabBar {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: 12,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#4f46e5',
        shadowOpacity: 0.22,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
      },
      android: {
        elevation: 14,
      },
    }),
  },
  glowTop: {
    position: 'absolute',
    top: -40,
    left: '20%',
    right: '20%',
    height: 56,
    borderRadius: 999,
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  rim: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: 12,
    marginBottom: 0,
    borderRadius: 26,
    borderWidth: 1,
    pointerEvents: 'none',
  },
});
