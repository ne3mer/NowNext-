import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OnboardingModal } from './src/components/OnboardingModal';
import { NowNextTabBar } from './src/navigation/NowNextTabBar';
import { AuthScreen } from './src/screens/AuthScreen';
import { ControlPanelScreen } from './src/screens/ControlPanelScreen';
import { CreateTaskScreen } from './src/screens/CreateTaskScreen';
import { PlannerScreen } from './src/screens/PlannerScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { useAuthStore } from './src/store/authStore';
import { useCategoryStore } from './src/store/categoryStore';
import { useTaskStore } from './src/store/taskStore';
import { useAppTheme } from './src/theme/theme';
import { ensureNotificationsBootstrapped } from './src/utils/notifications';

type RootTabParamList = {
  Today: undefined;
  Create: undefined;
  Planner: undefined;
  Panel: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const ONBOARDING_SEEN_KEY = 'nownext-onboarding-seen';

export default function App() {
  const { theme, isDark, toggleTheme } = useAppTheme();
  const token = useAuthStore((state) => state.token);
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const syncFromBackend = useTaskStore((state) => state.syncFromBackend);
  const resetTasks = useTaskStore((state) => state.reset);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }

    void checkOnboarding();
  }, []);

  useEffect(() => {
    void ensureNotificationsBootstrapped();
  }, []);

  useEffect(() => {
    if (!token) {
      resetTasks();
      return;
    }
    void syncFromBackend(token);
    void fetchCategories(token);
  }, [fetchCategories, resetTasks, syncFromBackend, token]);

  async function closeOnboarding() {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setShowOnboarding(false);
  }

  const navigationTheme: Theme = {
    dark: isDark,
    colors: {
      primary: theme.colors.tabActive,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.success,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '800',
      },
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {!authHydrated ? null : !token ? (
          <AuthScreen />
        ) : (
        <Tab.Navigator
          tabBar={(props) => (
            <NowNextTabBar
              {...props}
              isDark={isDark}
              activeTint={isDark ? '#f8fafc' : '#0f172a'}
              inactiveTint={isDark ? 'rgba(248,250,252,0.38)' : 'rgba(15,23,42,0.4)'}
            />
          )}
          screenOptions={({ route }) => ({
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerShadowVisible: false,
            headerTitleStyle: {
              color: theme.colors.textPrimary,
              fontWeight: '700',
            },
            headerRight: () => (
              <View style={{ marginRight: 12, flexDirection: 'row', gap: 10 }}>
                <Pressable onPress={logout}>
                  <Ionicons name="log-out-outline" size={20} color={theme.colors.textPrimary} />
                </Pressable>
                <Pressable onPress={toggleTheme}>
                  <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={theme.colors.textPrimary} />
                </Pressable>
              </View>
            ),
            tabBarActiveTintColor: theme.colors.tabActive,
            tabBarInactiveTintColor: theme.colors.tabInactive,
            tabBarShowLabel: false,
            tabBarStyle: {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              borderTopWidth: 0,
              backgroundColor: 'transparent',
              height: 128,
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarLabel:
              route.name === 'Today'
                ? 'Today'
                : route.name === 'Create'
                  ? 'New'
                  : route.name === 'Planner'
                    ? 'Plan'
                    : 'Hub',
            tabBarIcon: ({ color, size, focused }) => {
              const iconSize = focused ? size + 2 : size;

              if (route.name === 'Today') {
                return <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={iconSize} color={color} />;
              }
              if (route.name === 'Create') {
                return (
                  <LinearGradient
                    colors={
                      focused
                        ? (['#22d3ee', '#a855f7', '#ec4899'] as const)
                        : (['#38bdf8', '#c084fc', '#f472b6'] as const)
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.createFab}
                  >
                    <Ionicons name="add" size={32} color="#ffffff" />
                  </LinearGradient>
                );
              }
              if (route.name === 'Planner') {
                return <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={iconSize} color={color} />;
              }
              if (route.name === 'Panel') {
                return <Ionicons name={focused ? 'grid' : 'grid-outline'} size={iconSize} color={color} />;
              }
              return <Ionicons name={focused ? 'albums' : 'albums-outline'} size={iconSize} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Today" component={TodayScreen} />
          <Tab.Screen name="Create" component={CreateTaskScreen} />
          <Tab.Screen name="Planner" component={PlannerScreen} options={{ title: 'Planner' }} />
          <Tab.Screen name="Panel" component={ControlPanelScreen} options={{ title: 'Control Panel' }} />
        </Tab.Navigator>
        )}
        <OnboardingModal visible={showOnboarding} onClose={closeOnboarding} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  createFab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOpacity: 0.45,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
});
