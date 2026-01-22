import { NotificationHeader } from "@/components/notifications/NotificationHeader";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { db } from "@/utils/firebase";
import { AppNotification } from "@/utils/notifications";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    collection,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    View,
} from "react-native";

const THEME = {
    bg: "#F5F5F7",
    text: "#000000",
    textSecondary: "#8E8E93",
    primary: "#007AFF",
    border: "#F3F4F6",
};

interface NotificationSection {
    title: string;
    data: AppNotification[];
}

export default function NotificationsScreen() {
    const { userId } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, "notifications"),
            where("recipientId", "==", userId)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AppNotification));

            // Sort locally to avoid needing a Firestore Composite Index
            const sortedData = data.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setNotifications(sortedData);
            setLoading(false);
            setRefreshing(false);
        }, (error) => {
            console.error("Error listening to notifications:", error);
            setLoading(false);
        });

        return () => unsub();
    }, [userId]);

    const groupedNotifications = useMemo(() => {
        const today: AppNotification[] = [];
        const yesterday: AppNotification[] = [];
        const earlier: AppNotification[] = [];

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - (24 * 60 * 60 * 1000);

        notifications.forEach(notification => {
            const date = notification.createdAt?.seconds
                ? notification.createdAt.seconds * 1000
                : Date.now();

            if (date >= startOfToday) {
                today.push(notification);
            } else if (date >= startOfYesterday) {
                yesterday.push(notification);
            } else {
                earlier.push(notification);
            }
        });

        const sections: NotificationSection[] = [];
        if (today.length > 0) sections.push({ title: "Today", data: today });
        if (yesterday.length > 0) sections.push({ title: "Yesterday", data: yesterday });
        if (earlier.length > 0) sections.push({ title: "Earlier", data: earlier });

        return sections;
    }, [notifications]);

    const handleMarkAsRead = async (item: AppNotification) => {
        if (item.isMarkedRead || !item.id) return;
        try {
            await updateDoc(doc(db, "notifications", item.id), { isMarkedRead: true });
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    return (
        <View style={styles.container}>
            <NotificationHeader />

            {loading ? (
                <View style={styles.centerContainer}><ActivityIndicator size="large" color={THEME.primary} /></View>
            ) : notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBg}><Ionicons name="notifications-off-outline" size={32} color={THEME.textSecondary} /></View>
                    <Text style={styles.emptyText}>No notifications yet</Text>
                    <Text style={styles.emptySubText}>We'll let you know when something important happens.</Text>
                </View>
            ) : (
                <SectionList
                    sections={groupedNotifications}
                    keyExtractor={(item) => item.id || Math.random().toString()}
                    renderItem={({ item }) => (
                        <NotificationItem item={item} onPress={handleMarkAsRead} />
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{title}</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    stickySectionHeadersEnabled={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingBottom: 24 },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 8,
        backgroundColor: THEME.bg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: THEME.text,
    },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16 },
    emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 20, fontWeight: '700', color: THEME.text },
    emptySubText: { fontSize: 15, color: THEME.textSecondary, textAlign: 'center', lineHeight: 22 },
});
