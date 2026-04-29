import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const DAILY_REMINDER_KEY = 'nownext-daily-reminder-id';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationsBootstrapped() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  const existingId = await AsyncStorage.getItem(DAILY_REMINDER_KEY);
  if (existingId) {
    return;
  }

  const reminderId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'NowNext AI',
      body: 'Quick check-in: review your top priority task for today.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });

  await AsyncStorage.setItem(DAILY_REMINDER_KEY, reminderId);
}

export async function scheduleDeadlineNotification(title: string, deadlineIso: string): Promise<string | null> {
  const deadlineTime = new Date(deadlineIso).getTime();
  if (Number.isNaN(deadlineTime) || deadlineTime <= Date.now()) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Upcoming task deadline',
      body: `${title} is scheduled now.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(deadlineTime),
    },
  });

  return id;
}

export async function cancelTaskNotification(notificationId: string | null | undefined) {
  if (!notificationId) {
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
