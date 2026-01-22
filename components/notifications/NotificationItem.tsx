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
    textPrimary: "#1A1A1A",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    unreadDot: "#EF4444",
    divider: "#F3F4F6",
};

export const NotificationItem = ({ item, onPress }: NotificationItemProps) => {
    const date = item.createdAt?.seconds
        ? new Date(item.createdAt.seconds * 1000)
        : new Date();

    const formatNotificationTime = (date: Date) => {
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getIcon = () => {
        // Switch statement for different notification types
        switch (item.type) {
            case 'achievement':
                // Golden trophy with gradient background
                return (
                    <View style={[styles.iconCircle, styles.achievementIcon]}>
                        <Ionicons name="trophy" size={24} color="#F59E0B" />
                    </View>
                );

            case 'welcome':
                // Sparkles with gradient background
                return (
                    <View style={[styles.iconCircle, styles.welcomeIcon]}>
                        <Ionicons name="sparkles" size={24} color="#10B981" />
                    </View>
                );

            case 'follower':
                // User avatar for follower notifications
                if (item.senderPhoto) {
                    return <Image source={{ uri: item.senderPhoto }} style={styles.avatar} />;
                }
                // Fallback to icon if no photo
                return (
                    <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                        <Ionicons name="person-add" size={20} color="#3B82F6" />
                    </View>
                );

            case 'system':
            default:
                // Default system notification icon
                return (
                    <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
                        <Ionicons name="notifications" size={20} color="#6B7280" />
                    </View>
                );
        }
    };

    // Get label based on notification type
    const getNotificationLabel = () => {
        switch (item.type) {
            case 'achievement': return 'Achievement';
            case 'follower': return 'New follower';
            case 'welcome': return 'Getting started';
            default: return 'Notification';
        }
    };

    // Determine the main display title
    const mainTitle = item.type === 'follower' && item.senderName
        ? item.senderName
        : item.title;

    // Determine the subtitle/description
    const subtitle = item.type === 'follower'
        ? 'started following you'
        : item.description;

    const typeLabel = getNotificationLabel();

    return (
        <TouchableOpacity
            style={styles.notificationCard}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.iconSection}>
                {getIcon()}
            </View>

            <View style={styles.contentSection}>
                {/* Type Label */}
                <Text style={styles.typeText} numberOfLines={1}>
                    {typeLabel}
                </Text>

                {/* Main Title */}
                <Text
                    style={[
                        styles.titleText,
                        !item.isMarkedRead && styles.unreadTitle
                    ]}
                    numberOfLines={1}
                >
                    {mainTitle}
                </Text>

                {/* Description/Subtitle */}
                {subtitle && (
                    <Text style={styles.subtitleText} numberOfLines={2}>
                        {subtitle}
                    </Text>
                )}
            </View>

            <View style={styles.metaSection}>
                <Text style={styles.timeText}>{formatNotificationTime(date)}</Text>
                {!item.isMarkedRead && <View style={styles.unreadIndicator} />}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    notificationCard: {
        flexDirection: "row",
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: THEME.divider,
    },
    iconSection: {
        marginRight: 14,
        paddingTop: 2,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    achievementIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    welcomeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    contentSection: {
        flex: 1,
        justifyContent: "center",
        gap: 2,
    },
    typeText: {
        fontSize: 13,
        fontWeight: "600",
        color: THEME.textPrimary,
        marginBottom: 1,
    },
    titleText: {
        fontSize: 15,
        fontWeight: "500",
        color: THEME.textPrimary,
        letterSpacing: -0.2,
    },
    unreadTitle: {
        fontWeight: "600",
    },
    subtitleText: {
        fontSize: 14,
        fontWeight: "400",
        color: THEME.textTertiary,
        lineHeight: 18,
        marginTop: 2,
    },
    metaSection: {
        alignItems: "flex-end",
        justifyContent: "flex-start",
        paddingTop: 2,
        paddingLeft: 12,
    },
    timeText: {
        fontSize: 11,
        fontWeight: "400",
        color: THEME.textSecondary,
    },
    unreadIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: THEME.unreadDot,
        marginTop: 8,
    },
});

