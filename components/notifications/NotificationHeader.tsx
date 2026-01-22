import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationHeaderProps {
    onMarkAllRead: () => void;
    hasUnread: boolean;
}

const THEME = {
    primary: "#2563EB",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
};

export const NotificationHeader = ({ onMarkAllRead, hasUnread }: NotificationHeaderProps) => {
    const router = useRouter();

    return (
        <Stack.Screen
            options={{
                title: "Notifications",
                headerShown: true,
                headerShadowVisible: false,
                headerTransparent: false,
                headerStyle: {
                    backgroundColor: '#FAFAFA',
                },
                headerTitleStyle: {
                    fontSize: 20,
                    fontWeight: '700',
                    color: THEME.text,
                    fontFamily: 'System',
                },
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.headerButton}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="chevron-back" size={22} color={THEME.text} />
                        </View>
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <TouchableOpacity
                        onPress={onMarkAllRead}
                        disabled={!hasUnread}
                        style={[styles.markReadButton, !hasUnread && styles.disabledButton]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.markReadText, !hasUnread && styles.disabledText]}>
                            Mark read
                        </Text>
                    </TouchableOpacity>
                ),
            }}
        />
    );
};

const styles = StyleSheet.create({
    headerButton: {
        padding: 4,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    markReadButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: THEME.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    disabledButton: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
    },
    markReadText: {
        fontSize: 13,
        fontWeight: '600',
        color: THEME.primary,
    },
    disabledText: {
        color: THEME.textSecondary,
        opacity: 0.5,
    },
});
