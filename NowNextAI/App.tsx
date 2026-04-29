import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AllTasksScreen } from './src/screens/AllTasksScreen';
import { CreateTaskScreen } from './src/screens/CreateTaskScreen';
import { TodayScreen } from './src/screens/TodayScreen';

type RootTabParamList = {
  Today: undefined;
  Create: undefined;
  Tasks: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={{
            headerTitleAlign: 'center',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Today"
            component={TodayScreen}
            options={{ tabBarIcon: () => <Text>Today</Text> }}
          />
          <Tab.Screen
            name="Create"
            component={CreateTaskScreen}
            options={{ tabBarIcon: () => <Text>New</Text> }}
          />
          <Tab.Screen
            name="Tasks"
            component={AllTasksScreen}
            options={{ title: 'All Tasks', tabBarIcon: () => <Text>All</Text> }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
