import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const DOCK_RADIUS = 32;
const PILL_HEIGHT = 44;
const FAB_SIZE = 62;
const FAB_LIFT = 30;

type NowNextTabBarProps = BottomTabBarProps & {
  isDark: boolean;
  activeTint: string;
  inactiveTint: string;
};

export function NowNextTabBar({
  state,
  descriptors,
  navigation,
  insets,
  isDark,
  activeTint,
  inactiveTint,
}: NowNextTabBarProps) {
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const [innerWidth, setInnerWidth] = useState(0);
  const slideX = useRef(new Animated.Value(0)).current;
  const [pillWidth, setPillWidth] = useState(56);
  const didInitSlide = useRef(false);
  const enterY = useRef(new Animated.Value(28)).current;
  const enterOpacity = useRef(new Animated.Value(0)).current;
  const neon = useRef(new Animated.Value(0.35)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;

  const routes = state.routes;
  const n = routes.length || 1;

  const computePill = useCallback(
    (width: number, index: number) => {
      const seg = width / n;
      const w = Math.max(48, seg * 0.62);
      const x = index * seg + (seg - w) / 2;
      return { w, x };
    },
    [n],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(enterY, {
        toValue: 0,
        tension: 52,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
    ]).start();
  }, [enterOpacity, enterY]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(neon, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(neon, {
          toValue: 0.32,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [neon]);

  useEffect(() => {
    const createIndex = routes.findIndex((r) => r.name === 'Create');
    if (createIndex < 0 || state.index !== createIndex) {
      fabPulse.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => {
      pulse.stop();
      fabPulse.setValue(1);
    };
  }, [fabPulse, routes, state.index]);

  useEffect(() => {
    if (innerWidth <= 0) return;
    const { w, x } = computePill(innerWidth, state.index);
    setPillWidth(w);
    if (!didInitSlide.current) {
      slideX.setValue(x);
      didInitSlide.current = true;
      return;
    }
    Animated.spring(slideX, {
      toValue: x,
      useNativeDriver: true,
      tension: 68,
      friction: 11,
    }).start();
  }, [computePill, innerWidth, slideX, state.index]);

  const onDockLayout = useCallback(
    (e: LayoutChangeEvent) => {
      onHeightChange?.(e.nativeEvent.layout.height);
    },
    [onHeightChange],
  );

  const onRowLayout = useCallback((e: LayoutChangeEvent) => {
    setInnerWidth(e.nativeEvent.layout.width);
  }, []);

  const gradientColors = useMemo(
    () =>
      isDark
        ? (['#030712', '#1e1b4b', '#312e81', '#4c1d95'] as const)
        : (['#faf5ff', '#ede9fe', '#e0e7ff', '#cffafe'] as const),
    [isDark],
  );

  const rimOpacity = neon.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.95],
  });

  return (
    <Animated.View
      style={[
        styles.root,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          opacity: enterOpacity,
          transform: [{ translateY: enterY }],
        },
      ]}
      onLayout={onDockLayout}
    >
      <View style={styles.outerPad}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dock}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.neonRim,
              {
                opacity: rimOpacity,
                borderColor: isDark ? '#a78bfa' : '#6366f1',
              },
            ]}
          />
          <View style={styles.innerClip} onLayout={onRowLayout}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.slidingPill,
                {
                  width: pillWidth,
                  transform: [{ translateX: slideX }],
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.55)',
                },
              ]}
            />
            <View style={styles.tabsRow}>
              {routes.map((route, index) => {
                const focused = state.index === index;
                const { options } = descriptors[route.key];
                const onPress = () => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.dispatch({
                      ...CommonActions.navigate(route),
                      target: state.key,
                    });
                  }
                };
                const onLongPress = () => {
                  navigation.emit({ type: 'tabLongPress', target: route.key });
                };

                const tint = focused ? activeTint : inactiveTint;
                const iconNode =
                  options.tabBarIcon?.({
                    focused,
                    color: route.name === 'Create' ? '#ffffff' : tint,
                    size: route.name === 'Create' ? 30 : 24,
                  }) ?? (
                    <Ionicons
                      name={focused ? 'ellipse' : 'ellipse-outline'}
                      size={24}
                      color={tint}
                    />
                  );

                const labelFromOptions = options.tabBarLabel;
                const labelText =
                  typeof labelFromOptions === 'string'
                    ? labelFromOptions
                    : (options.title ?? (route.name === 'Create' ? 'New' : route.name));

                const isCreate = route.name === 'Create';

                return (
                  <TabSlot
                    key={route.key}
                    focused={focused}
                    isCreate={isCreate}
                    labelText={labelText}
                    tint={tint}
                    fabPulse={fabPulse}
                    onPress={onPress}
                    onLongPress={onLongPress}
                  >
                    {iconNode}
                  </TabSlot>
                );
              })}
            </View>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

type TabSlotProps = {
  children: ReactNode;
  focused: boolean;
  isCreate: boolean;
  labelText: string;
  tint: string;
  fabPulse: Animated.Value;
  onPress: () => void;
  onLongPress: () => void;
};

function TabSlot({
  children,
  focused,
  isCreate,
  labelText,
  tint,
  fabPulse,
  onPress,
  onLongPress,
}: TabSlotProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 300,
      friction: 18,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 12,
    }).start();
  };

  const iconWrapper = isCreate ? (
    <Animated.View style={{ transform: [{ scale: fabPulse }] }}>{children}</Animated.View>
  ) : (
    <Animated.View style={{ transform: [{ scale: focused ? 1.05 : 1 }] }}>{children}</Animated.View>
  );

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={styles.slotPress}
    >
      <Animated.View style={[styles.slotInner, { transform: [{ scale }] }]}>
        <View style={[styles.iconWrap, isCreate && styles.iconWrapFab]}>{iconWrapper}</View>
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: tint,
              fontWeight: focused ? '800' : '600',
              opacity: isCreate ? (focused ? 1 : 0.92) : focused ? 1 : 0.72,
              marginTop: isCreate ? 2 : 4,
            },
          ]}
        >
          {labelText}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  outerPad: {
    marginHorizontal: 10,
    marginTop: FAB_LIFT + 6,
  },
  dock: {
    borderRadius: DOCK_RADIUS,
    paddingVertical: 10,
    paddingHorizontal: 6,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#7c3aed',
        shadowOpacity: 0.45,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
      },
      android: {
        elevation: 18,
      },
    }),
  },
  neonRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: DOCK_RADIUS,
    borderWidth: 2,
    margin: -1,
  },
  innerClip: {
    minHeight: PILL_HEIGHT + 26,
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  slidingPill: {
    position: 'absolute',
    left: 0,
    bottom: 4,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  slotPress: {
    flex: 1,
    alignItems: 'center',
  },
  slotInner: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
  },
  iconWrapFab: {
    marginTop: -FAB_LIFT,
    minHeight: FAB_SIZE,
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
