import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface SessionCardProps {
    session: any;
    onDelete: () => void;
    delay?: number;
}

export const SessionCard: React.FC<SessionCardProps> = ({
    session,
    onDelete,
    delay = 0,
}) => {
    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Animated.View entering={FadeInUp.delay(delay)} style={styles.card}>
            <View style={styles.leftSection}>
                <View style={styles.iconContainer}>
                    <Ionicons name="timer-outline" size={20} color="#000" />
                </View>
                <View style={styles.info}>
                    <Text style={styles.duration}>
                        {session.call_duration_secs ? `${Math.floor(session.call_duration_secs / 60)}m ${session.call_duration_secs % 60}s` : 'N/A'}
                    </Text>
                    <Text style={styles.date}>
                        {formatDate(session.created_at)} • {formatTime(session.created_at)}
                    </Text>
                    <Text style={styles.type} numberOfLines={1}>
                        {session.call_summary_title || 'Session'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={onDelete}
            >
                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#FFF',
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        gap: 4,
    },
    duration: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        letterSpacing: -0.3,
    },
    date: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '400',
    },
    type: {
        fontSize: 11,
        fontWeight: '600',
        color: '#007AFF', // iOS Blue
        letterSpacing: 0.5,
    },
    deleteBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
