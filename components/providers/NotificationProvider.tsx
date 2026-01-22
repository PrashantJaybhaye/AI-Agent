import { useUserContext } from '@/context/UserContext';
import { setBadgeCount, setupNotificationListeners } from '@/utils/pushNotifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { unreadCount } = useUserContext();

    useEffect(() => {
        const cleanup = setupNotificationListeners(
            undefined,
            () => router.push('/(protected)/notifications')
        );

        return cleanup;
    }, [router]);

    useEffect(() => {
        setBadgeCount(unreadCount);
    }, [unreadCount]);

    return <>{children}</>;
}
