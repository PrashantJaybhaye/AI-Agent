import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Notification permission not granted');
            return false;
        }

        // For Android, create notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#5B75F0',
            });

            // Additional channels for different notification types
            await Notifications.setNotificationChannelAsync('achievements', {
                name: 'Achievements',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#F59E0B',
                sound: 'default',
            });

            await Notifications.setNotificationChannelAsync('social', {
                name: 'Social',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 150, 150, 150],
                lightColor: '#3B82F6',
                sound: 'default',
            });
        }

        return true;
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
}

/**
 * Send a local push notification (device-only, no server needed)
 */
export async function sendLocalNotification(params: {
    title: string;
    body: string;
    data?: any;
    categoryIdentifier?: 'achievement' | 'social' | 'default';
}) {
    try {
        const channelId = params.categoryIdentifier === 'achievement' ? 'achievements'
            : params.categoryIdentifier === 'social' ? 'social'
                : 'default';

        await Notifications.scheduleNotificationAsync({
            content: {
                title: params.title,
                body: params.body,
                data: params.data || {},
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
            ...(Platform.OS === 'android' && { identifier: channelId }),
        });
    } catch (error) {
        console.error('Error sending local notification:', error);
    }
}

/**
 * Set up notification response listeners
 */
export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
        if (onNotificationReceived) {
            onNotificationReceived(notification);
        }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        if (onNotificationTapped) {
            onNotificationTapped(response);
        }
    });

    return () => {
        receivedSubscription.remove();
        responseSubscription.remove();
    };
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
}
