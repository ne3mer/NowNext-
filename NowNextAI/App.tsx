import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OnboardingModal } from './src/components/OnboardingModal';
import { AllTasksScreen } from './src/screens/AllTasksScreen';
import { CreateTaskScreen } from './src/screens/CreateTaskScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { ui } from './src/theme/ui';

type RootTabParamList = {
  Today: undefined;
  Create: undefined;
  Tasks: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const ONBOARDING_SEEN_KEY = 'nownext-onboarding-seen';

export default function App() {
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

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: ui.colors.background,
            },
            headerShadowVisible: false,
            headerTitleStyle: {
              color: ui.colors.textPrimary,
              fontWeight: '700',
            },
            tabBarActiveTintColor: ui.colors.tabActive,
            tabBarInactiveTintColor: ui.colors.tabInactive,
            tabBarStyle: {
              borderTopColor: ui.colors.border,
              backgroundColor: ui.colors.surface,
              height: 64,
              paddingTop: 6,
              paddingBottom: 8,
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
