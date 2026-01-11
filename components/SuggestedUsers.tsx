import { UserSearchResult } from '@/app/(protected)/(tabs)/explore';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface SuggestedUsersProps {
    users: UserSearchResult[];
    followedUsers: Set<string>;
    onFollowPress: (user: UserSearchResult) => void;
    onUserPress: (user: UserSearchResult) => void;
}

const COLORS = {
    primary: '#1C1C1E',
    secondary: '#8E8E93',
    accent: '#5B75F0',
    border: '#E8E8E8',
    cardBg: '#FFFFFF',
    tabBg: '#E8E8E8',
};

export const SuggestedUsers = ({ users, followedUsers, onFollowPress, onUserPress }: SuggestedUsersProps) => {
    const [suggestedIds, setSuggestedIds] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (suggestedIds.length === 0 && users && users.length > 0) {
            const shuffled = [...users]
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            setSuggestedIds(shuffled.map(u => u.id));
        }
    }, [users, suggestedIds]);

    const displayedUsers = React.useMemo(() => {
        return suggestedIds
            .map(id => users.find(u => u.id === id))
            .filter((u): u is UserSearchResult => !!u);
    }, [suggestedIds, users]);

    const renderUserItem = ({ item, index }: { item: UserSearchResult; index: number }) => {
        const isFollowing = followedUsers.has(item.id);

        return (
            <Animated.View entering={FadeInDown.delay(index * 30)}>
                <TouchableOpacity
                    style={styles.compactUserItem}
                    onPress={() => onUserPress(item)}
                    activeOpacity={0.7}
                >
                    <Image
                        source={item.photoURL || 'https://via.placeholder.com/44'}
                        style={styles.compactAvatar}
                        contentFit="cover"
                        transition={200}
                    />
                    <View style={styles.compactInfo}>
                        <Text style={styles.compactName} numberOfLines={1}>{item.displayName}</Text>
                        <Text style={styles.compactFollowers} numberOfLines={1}>
                            {item.memberCount || 0} followers
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.compactActionButton,
                            isFollowing && styles.compactActionButtonFollowing
                        ]}
                        onPress={() => onFollowPress(item)}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.compactActionText,
                            isFollowing && styles.compactActionTextFollowing
                        ]}>
                            {isFollowing ? 'following' : 'follow'}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <FlatList
            data={displayedUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Disable scrolling as it's a small section
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={() => (
                <View style={styles.suggestedHeader}>
                    <Text style={styles.suggestedTitle}>People you might know</Text>
                    <Text style={styles.suggestedSubtitle}>Based on your interests</Text>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingTop: 8,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    suggestedHeader: {
        paddingHorizontal: 0,
        paddingTop: 12,
        paddingBottom: 8,
    },
    suggestedTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: -0.3,
    },
    suggestedSubtitle: {
        fontSize: 12,
        color: COLORS.secondary,
        marginTop: 1,
    },
    compactUserItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 16,
    },
    compactAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F2F2F7',
    },
    compactInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    compactName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
        letterSpacing: -0.1,
    },
    compactFollowers: {
        fontSize: 14,
        color: COLORS.secondary,
        marginTop: 2,
    },
    compactActionButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: COLORS.accent,
        minWidth: 80,
        alignItems: 'center',
    },
    compactActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    compactActionButtonFollowing: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    compactActionTextFollowing: {
        color: COLORS.secondary,
    },
});
