import UserAchievements from "@/components/user/UserAchievements";
import {
    addFirstFollowAchievement,
    checkFiveFollowersAchievement,
} from "@/utils/achievements";
import { db } from "@/utils/firebase";
import { User } from "@/utils/types";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
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
    Dimensions,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Permanent Light Theme Palette
const THEME = {
    bg: "#FFFFFF",
    card: "#F8F9FA",
    cardSecondary: "#F3F4F6",
    text: "#111827",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    border: "#E5E7EB",
    primary: "#2563EB",
    glass: "rgba(255,255,255,0.95)",
    shadow: "rgba(0, 0, 0, 0.05)",
    destructive: "#EF4444",
};

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userId } = useAuth();

    const theme = THEME;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [activeTab, setActiveTab] = useState<"achievements" | "about">(
        "achievements"
    );

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;
            try {
                const userDoc = await getDoc(doc(db, "users", id));
                if (userDoc.exists()) {
                    setUser(userDoc.data() as User);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!userId || !id) return;
            try {
                const followDoc = await getDoc(doc(db, "follows", `${userId}_${id}`));
                setIsFollowing(followDoc.exists());
            } catch (error) {
                console.error("Error checking follow status:", error);
            }
        };
        checkFollowStatus();
    }, [userId, id]);

    useEffect(() => {
        const fetchCounts = async () => {
            if (!id) return;
            try {
                const followersQuery = query(
                    collection(db, "follows"),
                    where("followingId", "==", id)
                );
                const followersSnapshot = await getDocs(followersQuery);
                setFollowerCount(followersSnapshot.size);

                const followingQuery = query(
                    collection(db, "follows"),
                    where("followerId", "==", id)
                );
                const followingSnapshot = await getDocs(followingQuery);
                setFollowingCount(followingSnapshot.size);
            } catch (error) {
                console.error("Error fetching counts:", error);
            }
        };
        fetchCounts();
    }, [id, isFollowing]);

    // Check for First Follow Achievement
    useEffect(() => {
        if (isFollowing && userId) {
            addFirstFollowAchievement(userId);
        }
    }, [isFollowing, userId]);

    // Fetch achievements

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleFollow = async () => {
        if (!userId || !id) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const wasFollowing = isFollowing;
        setIsFollowing(!isFollowing);

        if (wasFollowing) {
            setFollowerCount((prev) => Math.max(0, prev - 1));
        } else {
            setFollowerCount((prev) => prev + 1);
        }

        try {
            const followRef = doc(db, "follows", `${userId}_${id}`);
            if (wasFollowing) {
                await deleteDoc(followRef);
            } else {
                await setDoc(followRef, {
                    followerId: userId,
                    followingId: id,
                    createdAt: serverTimestamp(),
                });

                // Check if the target user has reached 5 followers
                await checkFiveFollowersAchievement(id);
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
            setIsFollowing(wasFollowing);
            if (wasFollowing) setFollowerCount((prev) => prev + 1);
            else setFollowerCount((prev) => Math.max(0, prev - 1));
        }
    };

    // Animated Header Styles
    const headerBorderOpacity = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [20, 50],
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    const headerTitleOpacity = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [60, 100],
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!user) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle="dark-content" />

            {/* Navbar */}
            <View
                style={[
                    styles.navbar,
                    { paddingTop: insets.top, height: 50 + insets.top },
                ]}
            >
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.navbarBg,
                        headerBorderOpacity,
                    ]}
                >
                    <BlurView
                        intensity={80}
                        tint="light"
                        style={StyleSheet.absoluteFill}
                    />
                    <View
                        style={[styles.borderBottom, { borderBottomColor: theme.border }]}
                    />
                </Animated.View>

                <View style={styles.navbarContent}>
                    <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <Animated.Text
                        style={[styles.navTitle, { color: theme.text }, headerTitleOpacity]}
                        numberOfLines={1}
                    >
                        {user.displayName}
                    </Animated.Text>

                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="ellipsis-horizontal" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: 60 + insets.top },
                ]}
            >
                {/* Profile Header Block */}
                <View style={styles.profileHeader}>
                    {/* Top Row: Avatar & Actions */}
                    <View style={styles.topRow}>
                        <View
                            style={[styles.avatarContainer, { borderColor: theme.border }]}
                        >
                            <Image
                                source={{
                                    uri: user.photoURL || "https://via.placeholder.com/150",
                                }}
                                style={styles.avatar}
                            />
                        </View>

                        <View style={styles.actionsContainer}>
                            {userId === id ? (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.btnPrimary,
                                            styles.btnOutline,
                                            { borderColor: theme.text },
                                        ]}
                                        onPress={() => router.push("/(protected)/edit-profile")}
                                    >
                                        <Text style={[styles.btnText, { color: theme.text }]}>
                                            Edit Profile
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.btnIcon, { borderColor: theme.border }]}
                                        onPress={() => {
                                            Share.share({
                                                message: `Check out my profile on Siora! 🧘‍♂️\n\nhttps://siora.app/u/${id}`,
                                                url: `https://siora.app/u/${id}`,
                                            });
                                        }}
                                    >
                                        <Ionicons
                                            name="share-outline"
                                            size={20}
                                            color={theme.text}
                                        />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.btnPrimary,
                                            isFollowing ? styles.btnOutline : styles.btnSolid,
                                            {
                                                backgroundColor: isFollowing
                                                    ? "transparent"
                                                    : theme.text,
                                                borderColor: theme.text,
                                            },
                                        ]}
                                        onPress={handleFollow}
                                    >
                                        <Text
                                            style={[
                                                styles.btnText,
                                                { color: isFollowing ? theme.text : "#FFF" },
                                            ]}
                                        >
                                            {isFollowing ? "Following" : "Follow"}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.btnIcon, { borderColor: theme.border }]}
                                    >
                                        <Ionicons
                                            name="mail-outline"
                                            size={20}
                                            color={theme.text}
                                        />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Info */}
                    <View style={styles.infoBlock}>
                        <Text style={[styles.displayName, { color: theme.text }]}>
                            {user.displayName}
                        </Text>
                        <Text style={[styles.handle, { color: theme.textSecondary }]}>
                            @
                            {user.username ||
                                user.displayName?.toLowerCase().replace(/\s+/g, "")}
                        </Text>

                        <Text style={[styles.bio, { color: theme.text }]}>
                            {user.bio || "No bio yet."}
                        </Text>
                    </View>
                </View>

                {/* Horizontal Divider */}
                <View
                    style={[
                        styles.sectionDivider,
                        { backgroundColor: theme.cardSecondary },
                    ]}
                />

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statVal, { color: theme.text }]}>
                            {followerCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                            Followers
                        </Text>
                    </View>
                    <View
                        style={[styles.vertDivider, { backgroundColor: theme.border }]}
                    />
                    <View style={styles.statItem}>
                        <Text style={[styles.statVal, { color: theme.text }]}>
                            {followingCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                            Following
                        </Text>
                    </View>
                </View>

                {/* Content Tabs */}
                <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
                    {["Achievements", "About"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tabItem,
                                activeTab === tab.toLowerCase() && styles.tabItemActive,
                            ]}
                            onPress={() => setActiveTab(tab.toLowerCase() as any)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color:
                                            activeTab === tab.toLowerCase()
                                                ? theme.text
                                                : theme.textSecondary,
                                    },
                                ]}
                            >
                                {tab}
                            </Text>
                            {activeTab === tab.toLowerCase() && (
                                <View
                                    style={[
                                        styles.activeIndicator,
                                        { backgroundColor: theme.text },
                                    ]}
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab Content */}
                <View style={styles.contentArea}>
                    {activeTab === "achievements" ? (
                        <UserAchievements userId={id} />
                    ) : (
                        <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color={theme.textSecondary}
                                />
                                <Text style={[styles.detailText, { color: theme.text }]}>
                                    Joined{" "}
                                    {user.createdAt?.seconds
                                        ? new Date(
                                            user.createdAt.seconds * 1000
                                        ).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })
                                        : "Unknown"}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="location-outline"
                                    size={20}
                                    color={theme.textSecondary}
                                />
                                <Text style={[styles.detailText, { color: theme.text }]}>
                                    {user.location || "Unknown Location"}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="link-outline"
                                    size={20}
                                    color={theme.textSecondary}
                                />
                                <Text style={[styles.detailText, { color: theme.primary }]}>
                                    siora.app/u/user
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navbar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        justifyContent: "center",
    },
    navbarBg: {
        // Blur and Border handled in inline styles
    },
    borderBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        borderBottomWidth: 1,
    },
    navbarContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    navTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    iconBtn: {
        padding: 8,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // Profile Header
    profileHeader: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        padding: 2,
    },
    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: 40,
    },
    actionsContainer: {
        flexDirection: "row",
        gap: 8,
        paddingTop: 10,
    },
    btnPrimary: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    btnSolid: {
        // Color set in inline
    },
    btnOutline: {
        // Color set in inline
    },
    btnText: {
        fontSize: 14,
        fontWeight: "600",
    },
    btnIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    infoBlock: {
        gap: 4,
    },
    displayName: {
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    handle: {
        fontSize: 15,
        marginBottom: 8,
    },
    bio: {
        fontSize: 15,
        lineHeight: 22,
    },

    // Stats
    sectionDivider: {
        height: 8,
        width: "100%",
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 24,
        justifyContent: "space-between", // Spread out
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    vertDivider: {
        width: 1,
        height: "100%",
    },
    statVal: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 13,
    },

    // Tabs
    tabBar: {
        flexDirection: "row",
        borderBottomWidth: 1,
        marginBottom: 20,
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 14,
        position: "relative",
    },
    tabItemActive: {
        // logic handled logic
    },
    tabText: {
        fontSize: 15,
        fontWeight: "600",
    },
    activeIndicator: {
        position: "absolute",
        bottom: 0,
        height: 2,
        width: "40%",
        borderRadius: 2,
    },

    // Content
    contentArea: {
        paddingHorizontal: 20,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: "500",
    },
    detailCard: {
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    detailText: {
        fontSize: 15,
    },
});
