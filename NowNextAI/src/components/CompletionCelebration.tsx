import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../theme/theme';

type CompletionCelebrationProps = {
  trigger: number;
  theme: AppTheme;
};

export function CompletionCelebration({ trigger, theme }: CompletionCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!trigger) {
      return;
    }

    setVisible(true);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(750),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -8,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      translateY.setValue(20);
      setVisible(false);
    });
  }, [trigger, opacity, translateY]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons name="sparkles" size={16} color={theme.colors.success} />
      <Text style={[styles.text, { color: theme.colors.textPrimary }]}>Task completed. Keep going!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    top: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  text: {
    fontWeight: '700',
    fontSize: 12,
  },
});
