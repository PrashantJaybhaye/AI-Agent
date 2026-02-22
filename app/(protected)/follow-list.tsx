import { db } from "@/utils/firebase";
import { User } from "@/utils/types";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THEME = {
    bg: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#F3F4F6",
    accent: "#5B75F0",
};

interface FollowUser extends User {
    id: string;
    followerCount?: number;
}

export default function FollowListScreen() {
    const { userId: currentUserId } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userId, type } = useLocalSearchParams<{
        userId: string;
        type: "followers" | "following";
    }>();

    const [users, setUsers] = useState<FollowUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

    // Fetch the follow list
    useEffect(() => {
        const fetchList = async () => {
            if (!userId || !type) return;

            try {
                const followsRef = collection(db, "follows");

                // "followers" => people who follow this user (followingId === userId)
                // "following" => people this user follows (followerId === userId)
                const q =
                    type === "followers"
                        ? query(followsRef, where("followingId", "==", userId))
                        : query(followsRef, where("followerId", "==", userId));

                const snapshot = await getDocs(q);

                const userIds: string[] = [];
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    userIds.push(
                        type === "followers" ? data.followerId : data.followingId
                    );
                });

                // Fetch user details for each
                const userPromises = userIds.map(async (uid) => {
                    const userDoc = await getDoc(doc(db, "users", uid));
                    if (userDoc.exists()) {
                        return { id: uid, ...userDoc.data() } as FollowUser;
                    }
                    return null;
                });

                const fetchedUsers = (await Promise.all(userPromises)).filter(
                    Boolean
                ) as FollowUser[];

                // Fetch follower count for each user
                const countPromises = fetchedUsers.map(async (user) => {
                    const countQuery = query(
                        followsRef,
                        where("followingId", "==", user.id)
                    );
                    const countSnap = await getDocs(countQuery);
                    return { ...user, followerCount: countSnap.size };
                });

                const usersWithCounts = await Promise.all(countPromises);
                setUsers(usersWithCounts);
            } catch (error) {
                console.error("Error fetching follow list:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, [userId, type]);

    // Fetch current user's follow state
    useEffect(() => {
        const fetchFollowState = async () => {
            if (!currentUserId) return;
            try {
                const followsRef = collection(db, "follows");
                const q = query(
                    followsRef,
                    where("followerId", "==", currentUserId)
                );
                const snapshot = await getDocs(q);

                const ids = new Set<string>();
                snapshot.forEach((docSnap) => {
                    ids.add(docSnap.data().followingId);
                });
                setFollowedUsers(ids);
            } catch (error) {
                console.error("Error fetching follow state:", error);
            }
        };
        fetchFollowState();
    }, [currentUserId]);

    const handleFollowToggle = async (targetUserId: string) => {
        if (!currentUserId) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const isFollowing = followedUsers.has(targetUserId);

        // Optimistic update
        setFollowedUsers((prev) => {
            const next = new Set(prev);
            if (isFollowing) next.delete(targetUserId);
            else next.add(targetUserId);
            return next;
        });

        // Update follower count optimistically
        setUsers((prev) =>
            prev.map((u) =>
                u.id === targetUserId
                    ? {
                        ...u,
                        followerCount: isFollowing
                            ? Math.max(0, (u.followerCount || 0) - 1)
                            : (u.followerCount || 0) + 1,
                    }
                    : u
            )
        );

        try {
            const followRef = doc(
                db,
                "follows",
                `${currentUserId}_${targetUserId}`
            );
            if (isFollowing) {
                await deleteDoc(followRef);
            } else {
                await setDoc(followRef, {
                    followerId: currentUserId,
                    followingId: targetUserId,
                    createdAt: serverTimestamp(),
                });
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
            // Revert
            setFollowedUsers((prev) => {
                const next = new Set(prev);
                if (isFollowing) next.add(targetUserId);
                else next.delete(targetUserId);
                return next;
            });
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === targetUserId
                        ? {
                            ...u,
                            followerCount: isFollowing
                                ? (u.followerCount || 0) + 1
                                : Math.max(0, (u.followerCount || 0) - 1),
                        }
                        : u
                )
            );
        }
    };

    const renderItem = ({
        item,
        index,
    }: {
        item: FollowUser;
        index: number;
    }) => {
        const isCurrentUser = item.id === currentUserId;
        const isFollowing = followedUsers.has(item.id);

        return (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
                <TouchableOpacity
                    style={styles.userRow}
                    onPress={() => {
                        Haptics.selectionAsync();
                        router.push(`/(protected)/user/${item.id}` as any);
                    }}
                    activeOpacity={0.7}
                >
                    {item.photoURL ? (
                        <Image
                            source={{ uri: item.photoURL }}
                            style={styles.avatar}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitial}>
                                {item.displayName?.[0] || "?"}
                            </Text>
                        </View>
                    )}

                    <View style={styles.userInfo}>
                        <Text style={styles.displayName} numberOfLines={1}>
                            {item.displayName}
                        </Text>
                        <Text style={styles.followerText} numberOfLines={1}>
                            {item.followerCount || 0} followers
                        </Text>
                    </View>

                    {!isCurrentUser && (
                        <TouchableOpacity
                            style={[
                                styles.followBtn,
                                isFollowing && styles.followBtnFollowing,
                            ]}
                            onPress={() => handleFollowToggle(item.id)}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    styles.followBtnText,
                                    isFollowing && styles.followBtnTextFollowing,
                                ]}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const title = type === "followers" ? "Followers" : "Following";

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                    }}
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={24} color={THEME.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={styles.backBtn} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={THEME.accent} />
                </View>
            ) : users.length === 0 ? (
                <View style={styles.center}>
                    <View style={styles.emptyIconBg}>
                        <Ionicons
                            name={
                                type === "followers"
                                    ? "people-outline"
                                    : "person-add-outline"
                            }
                            size={32}
                            color={THEME.textSecondary}
                        />
                    </View>
                    <Text style={styles.emptyTitle}>
                        {type === "followers"
                            ? "No followers yet"
                            : "Not following anyone"}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                        {type === "followers"
                            ? "When people follow this account, they'll show up here."
                            : "When this account follows people, they'll show up here."}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: THEME.text,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        gap: 14,
    },
    emptyIconBg: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: THEME.border,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: THEME.text,
    },
    emptySubtitle: {
        fontSize: 14,
        color: THEME.textSecondary,
        textAlign: "center",
        lineHeight: 20,
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 24,
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 14,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        backgroundColor: THEME.border,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitial: {
        fontSize: 18,
        fontWeight: "600",
        color: THEME.textSecondary,
    },
    userInfo: {
        flex: 1,
        justifyContent: "center",
    },
    displayName: {
        fontSize: 16,
        fontWeight: "600",
        color: THEME.text,
        letterSpacing: -0.2,
    },
    followerText: {
        fontSize: 14,
        color: THEME.textSecondary,
        marginTop: 2,
    },
    followBtn: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: THEME.accent,
        minWidth: 90,
        alignItems: "center",
    },
    followBtnFollowing: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    followBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    followBtnTextFollowing: {
        color: THEME.textSecondary,
    },
});
