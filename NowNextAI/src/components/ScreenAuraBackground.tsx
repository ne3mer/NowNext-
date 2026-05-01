import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppTheme } from '../theme/theme';

type ScreenAuraBackgroundProps = {
  theme: AppTheme;
  variant?: 'blue' | 'violet' | 'sunset';
};

function getPalette(variant: ScreenAuraBackgroundProps['variant']) {
  if (variant === 'violet') {
    return ['#7c3aed', '#a78bfa', '#22d3ee'];
  }
  if (variant === 'sunset') {
    return ['#f97316', '#fb7185', '#60a5fa'];
  }
  return ['#2563eb', '#14b8a6', '#8b5cf6'];
}

export const ScreenAuraBackground = memo(function ScreenAuraBackground({
  theme,
  variant = 'blue',
}: ScreenAuraBackgroundProps) {
  const [primary, secondary, tertiary] = getPalette(variant);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={[styles.orb, styles.orbTop, { backgroundColor: primary }]} />
      <View style={[styles.orb, styles.orbRight, { backgroundColor: secondary }]} />
      <View style={[styles.orb, styles.orbBottom, { backgroundColor: tertiary }]} />
      <View style={[styles.overlay, { backgroundColor: theme.colors.background }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.17,
  },
  orbTop: {
    width: 260,
    height: 260,
    left: -70,
    top: -35,
  },
  orbRight: {
    width: 240,
    height: 240,
    right: -90,
    top: 220,
  },
  orbBottom: {
    width: 280,
    height: 280,
    left: 80,
    bottom: -110,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.86,
  },
});
