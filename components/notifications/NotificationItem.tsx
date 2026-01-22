import { AppNotification } from "@/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NotificationItemProps {
    item: AppNotification;
    onPress: (item: AppNotification) => void;
}

const THEME = {
    text: "#000000",
    textSecondary: "#666666",
    primary: "#2563EB",
    border: "#E5E7EB",
    unreadDot: "#EF4444",
};

export const NotificationItem = ({ item, onPress }: NotificationItemProps) => {
    const date = item.createdAt?.seconds
        ? new Date(item.createdAt.seconds * 1000)
        : new Date();

    const formatNotificationTime = (date: Date) => {
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getIcon = () => {
        if (item.type === 'follower' && item.senderPhoto) {
            return <Image source={{ uri: item.senderPhoto }} style={styles.avatarIcon} />;
        }

        let iconName: keyof typeof Ionicons.glyphMap = "notifications";
        let bgColor = "#1A1A1A";

        switch (item.type) {
            case 'achievement':
                iconName = "trophy";
                bgColor = '#F59E0B';
                break;
            case 'follower':
                iconName = "person-add";
                bgColor = '#3B82F6';
                break;
            case 'welcome':
                iconName = "sparkles";
                bgColor = '#10B981';
                break;
        }

        return (
            <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                <Ionicons name={iconName} size={18} color="#FFF" />
            </View>
        );
    };

    const typeLabel = item.type === 'achievement' ? 'Achievement'
        : item.type === 'follower' ? 'Community'
            : item.type === 'welcome' ? 'Welcome'
                : 'System';

    const title = item.type === 'follower' && item.senderName
        ? `${item.senderName} followed you`
        : item.title;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(item)}
            activeOpacity={0.6}
        >
            <View style={styles.leftSection}>
                {getIcon()}
            </View>

            <View style={styles.contentSection}>
                <View style={styles.headerRow}>
                    <Text style={styles.typeLabel}>{typeLabel}</Text>
                    <Text style={styles.timeText}>{formatNotificationTime(date)}</Text>
                </View>

                <View style={styles.titleRow}>
                    <Text style={[styles.title, !item.isMarkedRead && styles.unreadTitle]} numberOfLines={1}>
                        {title}
                    </Text>
                    {!item.isMarkedRead && <View style={styles.unreadDot} />}
                </View>

                {item.description && item.type !== 'follower' && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: "transparent",
    },
    leftSection: {
        marginRight: 14,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    contentSection: {
        flex: 1,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },
    typeLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: THEME.text,
        letterSpacing: -0.2,
    },
    timeText: {
        fontSize: 11,
        color: THEME.textSecondary,
        fontWeight: "400",
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
        paddingRight: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: THEME.text,
        letterSpacing: -0.3,
        flex: 1,
    },
    unreadTitle: {
        fontWeight: "800",
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: THEME.unreadDot,
        marginLeft: 8,
    },
    description: {
        fontSize: 14,
        color: THEME.textSecondary,
        lineHeight: 19,
        fontWeight: "400",
    },
});
