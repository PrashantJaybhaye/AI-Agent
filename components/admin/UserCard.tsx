import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface UserCardProps {
    user: any;
    onPress: () => void;
    onToggleAdmin: () => void;
    onDelete: () => void;
    isCurrentUser: boolean;
    delay?: number;
}

export const UserCard: React.FC<UserCardProps> = ({
    user,
    onPress,
    onToggleAdmin,
    onDelete,
    isCurrentUser,
    delay = 0,
}) => {
    return (
        <Animated.View entering={FadeInUp.delay(delay)}>
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.leftSection}>
                    <Image
                        source={user.photoURL}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1}>
                            {user.displayName || 'Unknown'}
                        </Text>
                        <Text style={styles.email} numberOfLines={1}>
                            {user.email}
                        </Text>
                        {user.isAdmin && (
                            <View style={styles.adminBadge}>
                                <Ionicons name="shield-checkmark" size={10} color="#000" />
                                <Text style={styles.adminBadgeText}>ADMIN</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[
                            styles.actionBtn
                        ]}
                        onPress={(e) => {
                            e.stopPropagation();
                            onToggleAdmin();
                        }}
                        disabled={isCurrentUser}
                    >
                        <Ionicons
                            name={user.isAdmin ? "shield-checkmark" : "shield-outline"}
                            size={16}
                            color={user.isAdmin ? "#000" : "#8E8E93"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.actionBtn,
                            isCurrentUser && styles.disabledBtn
                        ]}
                        onPress={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        disabled={isCurrentUser}
                    >
                        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity >
        </Animated.View >
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
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
    },
    info: {
        flex: 1,
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        letterSpacing: -0.3,
    },
    email: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '400',
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    adminBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#000',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
    },
    disabledBtn: {
        opacity: 0.25,
    },
});

