import UserAchievements from "@/components/user/UserAchievements";
import UserActivity from "@/components/user/UserActivity";
import {
    addFirstFollowAchievement,
    checkFiveFollowersAchievement,
} from "@/utils/achievements";
import { createNotification } from "@/utils/notifications";
import { getStreakEntries, getWeeklyStreakActivity } from "@/utils/streak";

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
    const [isFollower, setIsFollower] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [totalSessions, setTotalSessions] = useState(0);
    const [weeklyActivity, setWeeklyActivity] = useState<number[]>([0,0,0,0,0,0,0]);
    const [activeTab, setActiveTab] = useState<"achievements" | "activity" | "about">(
        "achievements",
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
                
                const followerDoc = await getDoc(doc(db, "follows", `${id}_${userId}`));
                setIsFollower(followerDoc.exists());
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
                    where("followingId", "==", id),
                );
                const followersSnapshot = await getDocs(followersQuery);
                setFollowerCount(followersSnapshot.size);

                const followingQuery = query(
                    collection(db, "follows"),
                    where("followerId", "==", id),
                );
                const followingSnapshot = await getDocs(followingQuery);
                setFollowingCount(followingSnapshot.size);
            } catch (error) {
                console.error("Error fetching counts:", error);
            }
        };
        fetchCounts();
    }, [id, isFollowing]);

    useEffect(() => {
        const fetchStreakData = async () => {
            if (!id) return;
            try {
                const entries = await getStreakEntries(id);
                setTotalSessions(entries.length);
                const totalSecs = entries.reduce((acc, entry) => acc + (entry.total_session_duration_seconds || 0), 0);
                setTotalMinutes(Math.floor(totalSecs / 60));
                
                const activity = await getWeeklyStreakActivity(id);
                setWeeklyActivity(activity);
            } catch (error) {
                console.error("Error fetching streak data:", error);
            }
        };
        fetchStreakData();
    }, [id]);


    // Check for First Follow Achievement
    useEffect(() => {
        if (isFollowing && userId) {
            addFirstFollowAchievement(userId);
        }
    }, [isFollowing, userId]);

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        router.back();
    };

    const handleFollow = async () => {
        if (!userId || !id) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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

                // Create a notification for the person being followed
                const currentUserDoc = await getDoc(doc(db, "users", userId));
                const currentUserName = currentUserDoc.exists() ? currentUserDoc.data()?.displayName : "Someone";

                await createNotification({
                    recipientId: id,
                    type: 'follow',
                    title: 'New Follower',
                    description: `${currentUserName} started following you!`,
                    senderId: userId,
                });
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
            Extrapolation.CLAMP,
        );
        return { opacity };
    });

    const headerTitleOpacity = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [60, 100],
            [0, 1],
            Extrapolation.CLAMP,
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
                    { 
                        paddingTop: 60 + insets.top,
                        paddingBottom: activeTab === "about" ? 0 : 40 
                    },
                ]}
                scrollEnabled={activeTab !== "about"}
                bounces={activeTab !== "about"}
            >
                {/* Profile Header Block */}
                <View style={styles.profileHeader}>
                    <View style={styles.headerTopRow}>
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

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <TouchableOpacity
                                style={styles.statItem}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                    router.push(`/(protected)/follow-list?userId=${id}&type=followers` as any);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.statVal, { color: theme.text }]}>
                                    {followerCount}
                                </Text>
                                <Text
                                    style={[styles.statLabel, { color: theme.textSecondary }]}
                                >
                                    Followers
                                </Text>
                            </TouchableOpacity>
                            <View
                                style={[styles.vertDivider, { backgroundColor: theme.border }]}
                            />
                            <TouchableOpacity
                                style={styles.statItem}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                    router.push(`/(protected)/follow-list?userId=${id}&type=following` as any);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.statVal, { color: theme.text }]}>
                                    {followingCount}
                                </Text>
                                <Text
                                    style={[styles.statLabel, { color: theme.textSecondary }]}
                                >
                                    Following
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={[styles.displayName, { color: theme.text }]}>
                            {user.displayName}
                        </Text>
                        <Text style={[styles.handle, { color: theme.textSecondary }]}>
                            @
                            {user.username ||
                                user.displayName?.toLowerCase().replace(/\s+/g, "")}
                        </Text>

                        {user.bio && (
                            <Text style={[styles.bio, { color: theme.textSecondary }]}>
                                {user.bio}
                            </Text>
                        )}
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        {userId === id ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.btnPrimary, { backgroundColor: theme.text }]}
                                    onPress={() => router.push("/(protected)/edit-profile")}
                                >
                                    <Text style={styles.btnTextPrimary}>Edit Profile</Text>
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
                                    <Ionicons name="share-outline" size={22} color={theme.text} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.btnPrimary,
                                        isFollowing
                                            ? {
                                                backgroundColor: theme.cardSecondary,
                                                borderWidth: 1,
                                                borderColor: theme.border,
                                            }
                                            : { backgroundColor: "#5B75F0" },
                                    ]}
                                    onPress={handleFollow}
                                >
                                    <Text
                                        style={[
                                            styles.btnTextPrimary,
                                            isFollowing && { color: theme.text },
                                        ]}
                                    >
                                        {isFollowing ? "Following" : "Follow"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.btnIcon,
                                        { borderColor: theme.border, backgroundColor: theme.card },
                                    ]}
                                >
                                    <Ionicons name="mail-outline" size={22} color={theme.text} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {/* Content Tabs */}
                <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
                    {["Achievements", "Activity", "About"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={styles.tabItem}
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
                    ) : activeTab === "activity" ? (
                        <UserActivity userId={id} isMutual={isFollowing && isFollower} isFollowing={isFollowing} isSelf={userId === id} />
                    ) : (
                        <View style={[styles.aboutList, { paddingBottom: 0 }]}>
                            <View style={styles.achRow}>
                                {/* Joined Card */}
                                <View style={[styles.achCard, { flex: 1, flexDirection: 'column', alignItems: 'center', padding: 16 }]}>
                                    <View style={[styles.achIconBox, { backgroundColor: '#3B82F6', borderColor: '#2563EB', borderBottomColor: '#1D4ED8', marginRight: 0, marginBottom: 12 }]}>
                                        <View style={styles.achInnerRing} />
                                        <Ionicons name="calendar" size={24} color="#FFF" />
                                    </View>
                                    <View style={[styles.achContent, { alignItems: 'center' }]}>
                                        <Text style={styles.achLabel}>Joined</Text>
                                        <Text style={styles.achValue}>
                                            {user?.createdAt?.seconds
                                                ? new Date(user.createdAt.seconds * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                                                : "Recent"}
                                        </Text>
                                    </View>
                                </View>

                                {/* Location Card */}
                                <View style={[styles.achCard, { flex: 1, flexDirection: 'column', alignItems: 'center', padding: 16 }]}>
                                    <View style={[styles.achIconBox, { backgroundColor: '#10B981', borderColor: '#059669', borderBottomColor: '#047857', marginRight: 0, marginBottom: 12 }]}>
                                        <View style={styles.achInnerRing} />
                                        <Ionicons name="location" size={24} color="#FFF" />
                                    </View>
                                    <View style={[styles.achContent, { alignItems: 'center' }]}>
                                        <Text style={styles.achLabel}>Location</Text>
                                        <Text style={styles.achValue} numberOfLines={1}>{user?.location || "Global"}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Weekly Activity Card (Tall) */}
                            <View style={[styles.achCard, { flexDirection: 'column', alignItems: 'flex-start', padding: 20 }]}>
                                <View style={styles.chartHeaderRow}>
                                    <View style={[styles.achIconMini, { backgroundColor: '#F59E0B', borderColor: '#D97706' }]}>
                                        <Ionicons name="flash" size={16} color="#FFF" />
                                    </View>
                                    <Text style={styles.achCardTitle}>Weekly Intensity</Text>
                                </View>
                                
                                <View style={styles.chartContainer}>
                                    {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                                        <View key={i} style={styles.chartCol}>
                                            <View style={styles.chartBarTrack}>
                                                <View style={[
                                                    styles.chartBarFill, 
                                                    { 
                                                        height: Math.max(8, Math.min(100, (weeklyActivity[i] || 0) * 1.5)),
                                                        backgroundColor: (weeklyActivity[i] || 0) > 0 ? '#F59E0B' : '#E5E7EB',
                                                        borderBottomLeftRadius: 4,
                                                        borderBottomRightRadius: 4,
                                                    }
                                                ]}>
                                                    <View style={styles.barHighlight} />
                                                </View>
                                            </View>
                                            <Text style={[styles.chartDay, (weeklyActivity[i] || 0) > 0 && { color: '#111827', fontWeight: '800' }]}>{day}</Text>
                                        </View>
                                    ))}
                                </View>
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
    navbarBg: {},
    borderBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        borderBottomWidth: 1,
        opacity: 0.5,
    },
    navbarContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    navTitle: {
        fontSize: 17,
        fontWeight: "600",
    },
    iconBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    profileHeader: {
        alignItems: "center",
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    headerTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        padding: 3,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: 40,
    },
    infoBlock: {
        alignItems: "center",
        gap: 4,
        marginBottom: 20,
        width: "100%",
    },
    displayName: {
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: -0.5,
        textAlign: "center",
    },
    handle: {
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
    },
    bio: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: "center",
        marginTop: 8,
        maxWidth: "90%",
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.03)",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 24,
        gap: 30,
    },
    statItem: {
        alignItems: "center",
        gap: 2,
    },
    vertDivider: {
        width: 1,
        height: 20,
        opacity: 0.5,
    },
    statVal: {
        fontSize: 18,
        fontWeight: "700",
    },
    statLabel: {
        fontSize: 12,
        fontWeight: "500",
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        width: "100%",
        maxWidth: 300,
    },
    btnPrimary: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    btnTextPrimary: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
    btnIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    tabBar: {
        flexDirection: "row",
        borderBottomWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    tabItem: {
        marginRight: 24,
        paddingVertical: 14,
        position: "relative",
    },
    tabText: {
        fontSize: 16,
        fontWeight: "600",
    },
    activeIndicator: {
        position: "absolute",
        bottom: 0,
        height: 3,
        width: "100%",
        borderRadius: 3,
    },
    contentArea: {
        paddingHorizontal: 20,
    },
    aboutList: {
        gap: 12,
    },
    achRow: {
        flexDirection: 'row',
        gap: 12,
    },
    achCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderBottomWidth: 4,
        borderBottomColor: '#D1D5DB',
    },
    achIconBox: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 2,
        borderBottomWidth: 4,
        position: 'relative',
    },
    achInnerRing: {
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    achContent: {
        flex: 1,
    },
    achLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    achValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1F2937',
    },
    chartHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    achIconMini: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderBottomWidth: 3,
    },
    achCardTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1F2937',
        letterSpacing: -0.3,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 100,
        width: '100%',
    },
    chartCol: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    chartBarTrack: {
        width: 30,
        height: 80,
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        justifyContent: 'flex-end',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chartBarFill: {
        width: '100%',
        borderRadius: 15,
        position: 'relative',
    },
    barHighlight: {
        position: 'absolute',
        top: 4,
        left: 4,
        right: 4,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    chartDay: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
    },
});
