/**
 * Explore Screen - Clubhouse-style iOS Design
 * 
 * Features:
 * - User search with debouncing (300ms)
 * - Tab filtering (top, people, rooms, houses)
 * - Follow/Unfollow functionality with Firestore integration ✅
 * - Dynamic button states (follow/following) ✅
 * - Haptic feedback on interactions
 * - Animated user cards with staggered entrance
 * - Member count display
 * - Navigation to user profiles ✅
 * - Initial follow state fetched from Firestore ✅
 */

import { db } from '@/utils/firebase';
import { User } from '@/utils/types';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    bg: '#F2F1ED',
    cardBg: '#FFFFFF',
    primary: '#000000',
    secondary: '#8A8A8E',
    accent: '#5B75F0',
    border: '#E8E8E8',
    tabBg: '#E8E8E8',
    tabActive: '#FFFFFF',
};

interface UserSearchResult extends User {
    id: string;
    username?: string;
    memberCount?: number;
}

export default function ExploreScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userId } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [allUsers, setAllUsers] = useState<UserSearchResult[]>([]);
    const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

    // Fetch initial follow state from Firestore
    useEffect(() => {
        const fetchFollowState = async () => {
            if (!userId) return;

            try {
                const followsRef = collection(db, 'follows');
                const q = query(followsRef, where('followerId', '==', userId));
                const snapshot = await getDocs(q);

                const followedIds = new Set<string>();
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    followedIds.add(data.followingId);
                });

                setFollowedUsers(followedIds);
            } catch (error) {
                console.error('Error fetching follow state:', error);
            }
        };

        fetchFollowState();
    }, [userId]);

    // Refetch follow state and update counts when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const refreshFollowState = async () => {
                if (!userId) return;

                try {
                    // Refetch follow state
                    const followsRef = collection(db, 'follows');
                    const q = query(followsRef, where('followerId', '==', userId));
                    const snapshot = await getDocs(q);

                    const followedIds = new Set<string>();
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        followedIds.add(data.followingId);
                    });

                    setFollowedUsers(followedIds);

                    // Update user counts if we have users loaded
                    if (allUsers.length > 0) {
                        // Fetch all follows to recalculate counts
                        const allFollowsSnapshot = await getDocs(collection(db, 'follows'));

                        const followerCounts = new Map<string, number>();
                        allFollowsSnapshot.forEach((doc) => {
                            const data = doc.data();
                            const followingId = data.followingId;
                            followerCounts.set(followingId, (followerCounts.get(followingId) || 0) + 1);
                        });

                        // Update counts in user lists
                        const updateCounts = (users: UserSearchResult[]) => {
                            return users.map(u => ({
                                ...u,
                                memberCount: followerCounts.get(u.id) || 0
                            }));
                        };

                        setAllUsers(prev => updateCounts(prev));
                        setSearchResults(prev => updateCounts(prev));
                    }
                } catch (error) {
                    console.error('Error refreshing follow state:', error);
                }
            };

            refreshFollowState();
        }, [userId, allUsers.length])
    );

    // Fetch users from Firestore
    const fetchUsers = useCallback(async () => {
        if (allUsers.length > 0) return;

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('displayName', 'asc'), limit(100));
            const snapshot = await getDocs(q);

            const usersList: UserSearchResult[] = [];

            // Fetch all follows to calculate follower counts
            const followsRef = collection(db, 'follows');
            const followsSnapshot = await getDocs(followsRef);

            // Count followers for each user
            const followerCounts = new Map<string, number>();
            followsSnapshot.forEach((doc) => {
                const data = doc.data();
                const followingId = data.followingId;
                followerCounts.set(followingId, (followerCounts.get(followingId) || 0) + 1);
            });

            snapshot.forEach((doc) => {
                const userData = doc.data() as User;
                if (doc.id !== userId) {
                    usersList.push({
                        id: doc.id,
                        ...userData,
                        username: userData.displayName?.toLowerCase().replace(/\s+/g, ''),
                        memberCount: followerCounts.get(doc.id) || 0, // Real follower count
                    });
                }
            });

            setAllUsers(usersList);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }, [userId, allUsers.length]);

    // Search with debouncing
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim() === '') {
                setSearchResults([]);
                setIsSearching(false);
            } else {
                setIsSearching(true);

                if (allUsers.length === 0) {
                    await fetchUsers();
                }

                const query = searchQuery.toLowerCase();
                const filtered = allUsers.filter((user) =>
                    user.displayName?.toLowerCase().includes(query) ||
                    user.username?.includes(query)
                );

                setSearchResults(filtered);
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, allUsers, fetchUsers]);

    // Navigate to user profile
    const handleUserPress = (user: UserSearchResult) => {
        Haptics.selectionAsync();
        router.push(`/(protected)/user/${user.id}` as any);
    };

    // Follow/Unfollow user with Firestore
    const handleFollowPress = async (user: UserSearchResult) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (!userId) {
            console.error('No userId found');
            return;
        }

        const isFollowing = followedUsers.has(user.id);

        // Optimistic update - update follow state
        setFollowedUsers(prev => {
            const newSet = new Set(prev);
            if (isFollowing) {
                newSet.delete(user.id);
            } else {
                newSet.add(user.id);
            }
            return newSet;
        });

        // Optimistic update - update follower count in user lists
        const updateUserCount = (users: UserSearchResult[]) => {
            return users.map(u => {
                if (u.id === user.id) {
                    return {
                        ...u,
                        memberCount: isFollowing
                            ? Math.max(0, (u.memberCount || 0) - 1)
                            : (u.memberCount || 0) + 1
                    };
                }
                return u;
            });
        };

        setAllUsers(prev => updateUserCount(prev));
        setSearchResults(prev => updateUserCount(prev));

        try {
            const followRef = doc(db, 'follows', `${userId}_${user.id}`);

            if (isFollowing) {
                await deleteDoc(followRef);
            } else {
                await setDoc(followRef, {
                    followerId: userId,
                    followingId: user.id,
                    createdAt: serverTimestamp(),
                });
            }
        } catch (error: any) {
            console.error('Error toggling follow:', error);

            // Revert follow state on error
            setFollowedUsers(prev => {
                const newSet = new Set(prev);
                if (isFollowing) {
                    newSet.add(user.id);
                } else {
                    newSet.delete(user.id);
                }
                return newSet;
            });

            // Revert count on error
            const revertUserCount = (users: UserSearchResult[]) => {
                return users.map(u => {
                    if (u.id === user.id) {
                        return {
                            ...u,
                            memberCount: isFollowing
                                ? (u.memberCount || 0) + 1
                                : Math.max(0, (u.memberCount || 0) - 1)
                        };
                    }
                    return u;
                });
            };

            setAllUsers(prev => revertUserCount(prev));
            setSearchResults(prev => revertUserCount(prev));
        }
    };

    const renderUserItem = ({ item, index }: { item: UserSearchResult; index: number }) => {
        const isFollowing = followedUsers.has(item.id);

        return (
            <Animated.View entering={FadeInDown.delay(index * 30)}>
                <TouchableOpacity
                    style={styles.userCard}
                    onPress={() => handleUserPress(item)}
                    activeOpacity={0.7}
                >
                    <Image
                        source={item.photoURL || 'https://via.placeholder.com/48'}
                        style={styles.userAvatar}
                        contentFit="cover"
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>{item.displayName}</Text>
                        <Text style={styles.memberCount} numberOfLines={1}>
                            {item.memberCount?.toLocaleString()} Members
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            isFollowing && styles.actionButtonFollowing
                        ]}
                        onPress={() => handleFollowPress(item)}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.actionButtonText,
                            isFollowing && styles.actionButtonTextFollowing
                        ]}>
                            {isFollowing ? 'following' : 'follow'}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={COLORS.secondary} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>Try searching for something else</Text>
        </View>
    );



    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Text style={styles.headerTitle}>discover</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="mail-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <View style={styles.profileIcon}>
                            <Ionicons name="person" size={16} color={COLORS.cardBg} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <Animated.View
                entering={FadeInDown.delay(100)}
                style={styles.searchContainer}
            >
                <View style={styles.searchBar}>
                    <Ionicons
                        name="search"
                        size={20}
                        color={COLORS.secondary}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search people"
                        placeholderTextColor={COLORS.secondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setSearchQuery('');
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close-circle" size={18} color={COLORS.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>

            {/* Content */}
            <View style={styles.content}>
                {isSearching ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={COLORS.accent} />
                    </View>
                ) : searchQuery.trim() !== '' ? (
                    <FlatList
                        data={searchResults}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={renderEmptyState}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="search" size={48} color={COLORS.secondary} />
                        <Text style={styles.emptyTitle}>Start searching</Text>
                        <Text style={styles.emptySubtitle}>Find people and communities</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.primary,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    iconButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8E8E8',
        borderRadius: 28,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '400',
        paddingVertical: 0,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: COLORS.tabBg,
    },
    tabActive: {
        backgroundColor: COLORS.tabActive,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.secondary,
    },
    tabTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    listContent: {
        paddingTop: 8,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        gap: 12,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    userInfo: {
        flex: 1,
        gap: 4,
    },
    userName: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.primary,
    },
    memberCount: {
        fontSize: 15,
        color: COLORS.secondary,
    },
    actionButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.accent,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.cardBg,
    },
    actionButtonFollowing: {
        backgroundColor: COLORS.tabBg,
    },
    actionButtonTextFollowing: {
        color: COLORS.primary,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 12,
        marginBottom: 120,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.primary,
    },
    emptySubtitle: {
        fontSize: 15,
        color: COLORS.secondary,
        textAlign: 'center',
    },
});