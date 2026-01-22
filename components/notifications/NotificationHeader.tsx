import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationHeaderProps { }

const COLORS = {
    headerBg: "#F9F9FB",
    screenBg: "#F5F5F7",
    text: "#000000",
    secondary: "#8E8E93",
    border: "#E5E5E7",
};

export const NotificationHeader = ({ }: NotificationHeaderProps) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        activeOpacity={0.5}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="chevron-back" size={26} color={COLORS.text} />
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <Text style={styles.headerTitle}>Notifications</Text>
                    </View>

                    <View style={styles.rightPlaceholder} />
                </View>
                <View style={styles.divider} />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: COLORS.headerBg,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        height: 56,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: -4,
    },
    titleContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.text,
        letterSpacing: Platform.OS === 'ios' ? -0.4 : 0,
    },
    rightPlaceholder: {
        width: 40,
        height: 40,
    },
    divider: {
        height: 0.5,
        backgroundColor: COLORS.border,
    },
});

