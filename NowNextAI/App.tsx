import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OnboardingModal } from './src/components/OnboardingModal';
import { AllTasksScreen } from './src/screens/AllTasksScreen';
import { CreateTaskScreen } from './src/screens/CreateTaskScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { useAppTheme } from './src/theme/theme';

type RootTabParamList = {
  Today: undefined;
  Create: undefined;
  Tasks: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const ONBOARDING_SEEN_KEY = 'nownext-onboarding-seen';

export default function App() {
  const { theme, isDark, toggleTheme } = useAppTheme();
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
        <Tab.Navigator
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
              <Pressable onPress={toggleTheme} style={{ marginRight: 12 }}>
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </Pressable>
            ),
            tabBarActiveTintColor: theme.colors.tabActive,
            tabBarInactiveTintColor: theme.colors.tabInactive,
            tabBarStyle: {
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              height: 78,
              paddingTop: 8,
              paddingBottom: 14,
            },
            tabBarItemStyle: {
              paddingVertical: 2,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            tabBarIcon: ({ color, size, focused }) => {
              const iconSize = focused ? size + 2 : size;

              if (route.name === 'Today') {
                return <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={iconSize} color={color} />;
              }
              if (route.name === 'Create') {
                return <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={iconSize} color={color} />;
              }
              return <Ionicons name={focused ? 'albums' : 'albums-outline'} size={iconSize} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Today" component={TodayScreen} />
          <Tab.Screen name="Create" component={CreateTaskScreen} />
          <Tab.Screen
            name="Tasks"
            component={AllTasksScreen}
            options={{ title: 'All Tasks' }}
          />
        </Tab.Navigator>
        <OnboardingModal visible={showOnboarding} onClose={closeOnboarding} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
