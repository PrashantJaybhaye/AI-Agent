import { db } from '@/utils/firebase';
import { User } from '@/utils/types';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    bg: '#F2F1ED',
    cardBg: '#FFFFFF',
    primary: '#000000',
    secondary: '#8A8A8E',
    accent: '#5B75F0',
    border: '#E8E8E8',
};

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userId } = useAuth();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', id));
                if (userDoc.exists()) {
                    setUser(userDoc.data() as User);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    // Fetch initial follow state
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!userId || !id) return;

            try {
                const followDoc = await getDoc(doc(db, 'follows', `${userId}_${id}`));
                setIsFollowing(followDoc.exists());
            } catch (error) {
                console.error('Error checking follow status:', error);
            }
        };

        checkFollowStatus();
    }, [userId, id]);

    // Fetch follower and following counts
    useEffect(() => {
        const fetchCounts = async () => {
            if (!id) return;

            try {
                // Count followers
                const followersQuery = query(
                    collection(db, 'follows'),
                    where('followingId', '==', id)
                );
                const followersSnapshot = await getDocs(followersQuery);
                setFollowerCount(followersSnapshot.size);

                // Count following
                const followingQuery = query(
                    collection(db, 'follows'),
                    where('followerId', '==', id)
                );
                const followingSnapshot = await getDocs(followingQuery);
                setFollowingCount(followingSnapshot.size);
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };

        fetchCounts();
    }, [id, isFollowing]);

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleFollow = async () => {
        if (!userId || !id) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Optimistic update
        const wasFollowing = isFollowing;
        setIsFollowing(!isFollowing);

        // Update counts optimistically
        if (wasFollowing) {
            setFollowerCount(prev => Math.max(0, prev - 1));
        } else {
            setFollowerCount(prev => prev + 1);
        }

        try {
            const followRef = doc(db, 'follows', `${userId}_${id}`);

            if (wasFollowing) {
                await deleteDoc(followRef);
            } else {
                await setDoc(followRef, {
                    followerId: userId,
                    followingId: id,
                    createdAt: serverTimestamp(),
                });
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            // Revert on error
            setIsFollowing(wasFollowing);
            if (wasFollowing) {
                setFollowerCount(prev => prev + 1);
            } else {
                setFollowerCount(prev => Math.max(0, prev - 1));
            }
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                </View>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.errorContainer}>
                    <Ionicons name="person-outline" size={64} color={COLORS.secondary} />
                    <Text style={styles.errorText}>User not found</Text>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Info */}
                <View style={styles.profileSection}>
                    <Image
                        source={user.photoURL || 'https://via.placeholder.com/120'}
                        style={styles.profileImage}
                        contentFit="cover"
                    />
                    <Text style={styles.displayName}>{user.displayName}</Text>
                    <Text style={styles.username}>
                        @{user.displayName?.toLowerCase().replace(/\s+/g, '') || 'user'}
                    </Text>

                    {/* Follow Button */}
                    {userId !== id && (
                        <TouchableOpacity
                            style={[styles.followButton, isFollowing && styles.followingButton]}
                            onPress={handleFollow}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    styles.followButtonText,
                                    isFollowing && styles.followingButtonText,
                                ]}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{followerCount}</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{followingCount}</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Sessions</Text>
                        </View>
                    </View>
                </View>

                {/* Activity Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.card}>
                        <View style={styles.emptyState}>
                            <Ionicons name="time-outline" size={40} color={COLORS.secondary} />
                            <Text style={styles.emptyText}>No recent activity</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 16,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.primary,
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.accent,
        borderRadius: 20,
        marginTop: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.cardBg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.primary,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
    },
    displayName: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 4,
    },
    username: {
        fontSize: 16,
        color: COLORS.secondary,
        marginBottom: 20,
    },
    followButton: {
        paddingHorizontal: 32,
        paddingVertical: 10,
        backgroundColor: COLORS.accent,
        borderRadius: 20,
        marginBottom: 24,
    },
    followingButton: {
        backgroundColor: COLORS.border,
    },
    followButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.cardBg,
    },
    followingButtonText: {
        color: COLORS.primary,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.border,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: COLORS.secondary,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 12,
    },
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.secondary,
    },
});
