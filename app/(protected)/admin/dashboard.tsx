import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConfirmModal } from "../../../components/admin/ConfirmModal";
import { SessionCard } from "../../../components/admin/SessionCard";
import { UserCard } from "../../../components/admin/UserCard";
import { UserDetailModal } from "../../../components/admin/UserDetailModal";
import { useUserContext } from "../../../context/UserContext";
import { db } from "../../../utils/firebase";

const COLORS = {
    bg: "#F2F2F7", // iOS System Gray 6
    card: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.04)", // Very subtle border/shadow outline
    primary: "#000000",
    secondary: "#8E8E93", // iOS System Gray
    accent: "#007AFF", // iOS System Blue
    danger: "#FF3B30", // iOS System Red
    success: "#34C759", // iOS System Green
};

type ContentTab = "users" | "sessions";

const BentoCard = ({ children, style, delay = 0, colSpan = 1 }: any) => (
    <View style={[styles.bentoCard, { flex: colSpan }, style]}>{children}</View>
);

const SkeletonItem = ({ style, borderRadius = 8 }: any) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 }),
            ),
            -1,
            true,
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                { backgroundColor: "#E1E9EE", borderRadius },
                style,
                animatedStyle,
            ]}
        />
    );
};

const DashboardSkeleton = () => (
    <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
            {/* Activity Chart Skeleton */}
            <BentoCard colSpan={2} style={{ height: 150 }}>
                <View
                    style={{
                        marginBottom: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <SkeletonItem style={{ width: 14, height: 14, borderRadius: 4 }} />
                    <SkeletonItem style={{ width: 45, height: 10 }} />
                </View>
                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        paddingBottom: 5,
                        paddingHorizontal: 8,
                    }}
                >
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <SkeletonItem
                            key={i}
                            style={{
                                width: 12,
                                height: 30 + Math.random() * 50,
                                borderRadius: 6,
                            }}
                        />
                    ))}
                </View>
            </BentoCard>

            {/* Profile Skeleton */}
            <BentoCard
                colSpan={1}
                style={{ height: 150, justifyContent: "space-between" }}
            >
                <View
                    style={{
                        marginBottom: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <SkeletonItem style={{ width: 14, height: 14, borderRadius: 4 }} />
                    <SkeletonItem style={{ width: 40, height: 10 }} />
                </View>
                <View
                    style={{
                        alignItems: "center",
                        gap: 8,
                        flex: 1,
                        justifyContent: "center",
                    }}
                >
                    <SkeletonItem style={{ width: 44, height: 44, borderRadius: 22 }} />
                    <SkeletonItem style={{ width: 50, height: 18, borderRadius: 6 }} />
                    <SkeletonItem style={{ width: 60, height: 10 }} />
                </View>
            </BentoCard>
        </View>

        <View style={styles.gridRow}>
            <BentoCard
                colSpan={1}
                style={{ aspectRatio: 1, justifyContent: "space-between" }}
            >
                <View>
                    <SkeletonItem style={{ width: 60, height: 28, marginBottom: 8 }} />
                    <SkeletonItem style={{ width: 70, height: 10 }} />
                </View>
            </BentoCard>
            <BentoCard
                colSpan={1}
                style={{ aspectRatio: 1, justifyContent: "space-between" }}
            >
                <View>
                    <SkeletonItem style={{ width: 45, height: 28, marginBottom: 8 }} />
                    <SkeletonItem style={{ width: 65, height: 10 }} />
                </View>
            </BentoCard>
            <BentoCard
                colSpan={1}
                style={{
                    aspectRatio: 1,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <SkeletonItem style={{ width: 32, height: 32, borderRadius: 16 }} />
            </BentoCard>
        </View>
    </View>
);

const ActivityBar = ({ height, label, active }: any) => (
    <View style={styles.activityBarContainer}>
        <View style={styles.barTrack}>
            <LinearGradient
                colors={active ? ["#3B82F6", "#60A5FA"] : ["#E5E7EB", "#F3F4F6"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[
                    styles.activityBarGradient,
                    { height: `${height}%`, opacity: 1 },
                ]}
            />
        </View>
        <Text style={[styles.activityLabel, active && styles.activeLabel]}>
            {label}
        </Text>
        {active && <View style={styles.activeDot} />}
    </View>
);

export default function AdminDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userData } = useUserContext();

    // State management
    const [totalUsers, setTotalUsers] = useState(0);
    const [weeklyActivity, setWeeklyActivity] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [loading, setLoading] = useState(true);
    const [retentionRate, setRetentionRate] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Content tab
    const [activeContentTab, setActiveContentTab] = useState<ContentTab>("users");

    // Users management
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showUserDetail, setShowUserDetail] = useState(false);

    // Sessions management
    const [sessions, setSessions] = useState<any[]>([]);

    // Modals
    const [confirmModal, setConfirmModal] = useState<{
        visible: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        destructive?: boolean;
    }>({
        visible: false,
        title: "",
        message: "",
        onConfirm: () => { },
        destructive: false,
    });

    // Fetch total users
    const fetchTotalUsers = async () => {
        try {
            const usersRef = collection(db, "users");
            const usersSnapshot = await getDocs(usersRef);
            setTotalUsers(usersSnapshot.size);
        } catch (error) {
            console.error("Error fetching total users:", error);
        }
    };

    // Fetch users list
    const fetchUsers = async () => {
        try {
            const usersRef = collection(db, "users");
            const usersQuery = query(usersRef, orderBy("displayName", "asc"));
            const usersSnapshot = await getDocs(usersQuery);
            const usersList = usersSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch sessions
    const fetchSessions = async () => {
        try {
            const sessionsRef = collection(db, "session");
            const sessionsSnapshot = await getDocs(sessionsRef);
            const sessionsList = sessionsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Sort by created_at in memory (since it's a string ISO date)
            sessionsList.sort((a: any, b: any) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateB - dateA; // Descending order (newest first)
            });

            setSessions(sessionsList);
            console.log(`Fetched ${sessionsList.length} sessions`);
        } catch (error) {
            console.error("Error fetching sessions:", error);
        }
    };

    // Delete user with protection
    const handleDeleteUser = (user: any) => {
        if (user.id === userData?.uid) {
            return; // Prevent deleting self
        }

        setConfirmModal({
            visible: true,
            title: "Delete User",
            message: `Are you sure you want to delete ${user.displayName || user.email}? This action cannot be undone.`,
            destructive: true,
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, "users", user.id));
                    await fetchUsers();
                    await fetchTotalUsers();
                    setConfirmModal({ ...confirmModal, visible: false });
                } catch (error) {
                    console.error("Error deleting user:", error);
                }
            },
        });
    };

    // Toggle admin status with protection
    const handleToggleAdmin = (user: any) => {
        if (user.id === userData?.uid) {
            return; // Prevent modifying self
        }

        setConfirmModal({
            visible: true,
            title: user.isAdmin ? "Revoke Admin" : "Grant Admin",
            message: `Are you sure you want to ${user.isAdmin ? "revoke admin privileges from" : "grant admin privileges to"} ${user.displayName || user.email}?`,
            destructive: user.isAdmin,
            onConfirm: async () => {
                try {
                    await updateDoc(doc(db, "users", user.id), {
                        isAdmin: !user.isAdmin,
                    });
                    await fetchUsers();
                    if (showUserDetail && selectedUser?.id === user.id) {
                        setSelectedUser({ ...user, isAdmin: !user.isAdmin });
                    }
                    setConfirmModal({ ...confirmModal, visible: false });
                } catch (error) {
                    console.error("Error updating user:", error);
                }
            },
        });
    };

    // Delete session
    const handleDeleteSession = (session: any) => {
        setConfirmModal({
            visible: true,
            title: "Delete Session",
            message:
                "Are you sure you want to delete this session? This action cannot be undone.",
            destructive: true,
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, "session", session.id));
                    await fetchSessions();
                    await fetchWeeklyActivity();
                    setConfirmModal({ ...confirmModal, visible: false });
                } catch (error) {
                    console.error("Error deleting session:", error);
                }
            },
        });
    };

    // Fetch weekly activity
    const fetchWeeklyActivity = async () => {
        try {
            const sessionsRef = collection(db, "session");

            const now = new Date();
            const currentDay = now.getDay();
            const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() + mondayOffset);
            startOfWeek.setHours(0, 0, 0, 0);

            // Fetch recent sessions (we'll filter in memory because of potential string/timestamp mismatch)
            // Querying strings with >= works for ISO dates, so we use startOfWeek.toISOString()
            const weekQuery = query(
                sessionsRef,
                where("created_at", ">=", startOfWeek.toISOString()),
                orderBy("created_at", "asc"),
            );

            const sessionsSnapshot = await getDocs(weekQuery);
            const activityData = [0, 0, 0, 0, 0, 0, 0];

            sessionsSnapshot.forEach((doc) => {
                const sessionData = doc.data();
                if (sessionData.created_at) {
                    // Handle both Timestamp and ISO string
                    let sessionDate;
                    if (sessionData.created_at?.toDate) {
                        sessionDate = sessionData.created_at.toDate();
                    } else {
                        sessionDate = new Date(sessionData.created_at);
                    }

                    const dayOfWeek = sessionDate.getDay();
                    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    activityData[dayIndex]++;
                }
            });

            const maxActivity = Math.max(...activityData, 1);
            const normalizedActivity = activityData.map((count) =>
                maxActivity > 0 ? Math.round((count / maxActivity) * 100) : 0,
            );

            setWeeklyActivity(normalizedActivity);
        } catch (error) {
            console.error("Error fetching weekly activity:", error);
            // Fallback to zeros instead of fake data to show real state
            setWeeklyActivity([0, 0, 0, 0, 0, 0, 0]);
        }
    };

    // Calculate retention rate
    const calculateRetention = async () => {
        try {
            const sessionsRef = collection(db, "session");
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentQuery = query(
                sessionsRef,
                where("created_at", ">=", thirtyDaysAgo.toISOString()),
            );

            const recentSnapshot = await getDocs(recentQuery);
            const uniqueUsers = new Set();

            recentSnapshot.forEach((doc) => {
                const sessionData = doc.data();
                if (sessionData.userId) {
                    uniqueUsers.add(sessionData.userId);
                }
            });

            const activeUsers = uniqueUsers.size;
            const retention =
                totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
            setRetentionRate(retention);
        } catch (error) {
            console.error("Error calculating retention:", error);
            setRetentionRate(85);
        }
    };

    // Fetch all data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([
                fetchTotalUsers(),
                fetchWeeklyActivity(),
                fetchUsers(),
                fetchSessions(),
            ]);
            setLoading(false);
        };

        fetchData();
    }, []);

    // Calculate retention after total users is fetched
    useEffect(() => {
        if (totalUsers > 0) {
            calculateRetention();
        }
    }, [totalUsers]);

    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchTotalUsers(),
            fetchWeeklyActivity(),
            fetchUsers(),
            fetchSessions(),
        ]);
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#FFFFFF", "#F2F2F7"]}
                style={StyleSheet.absoluteFill}
            />
            {/* Header */}
            <BlurView
                intensity={80}
                tint="light"
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top,
                        height: 60 + insets.top,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 100,
                    },
                ]}
            >
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.accent} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <View
                    style={[styles.titleWrapper, { top: insets.top, height: 60 }]}
                    pointerEvents="none"
                >
                    <Text style={styles.headerTitle}>Dashboard</Text>
                </View>
            </BlurView>

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 72 },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.accent]}
                    />
                }
            >
                {/* Overview Section */}
                {loading ? (
                    <DashboardSkeleton />
                ) : (
                    <View style={styles.gridContainer}>
                        <View style={styles.gridRow}>
                            {/* Activity Chart - Compact */}
                            <BentoCard colSpan={2} delay={100} style={{ height: 150 }}>
                                <View style={styles.cardHeader}>
                                    <Ionicons
                                        name="bar-chart"
                                        size={14}
                                        color={COLORS.secondary}
                                    />
                                    <Text style={styles.cardLabel}>ACTIVITY</Text>
                                </View>
                                <View style={styles.chartContainer}>
                                    {weeklyActivity.map((val, index) => (
                                        <ActivityBar
                                            key={index}
                                            height={val}
                                            label={["M", "T", "W", "T", "F", "S", "S"][index]}
                                            active={new Date().getDay() === (index + 1) % 7}
                                        />
                                    ))}
                                </View>
                            </BentoCard>

                            {/* Profile Card - Compact */}
                            <BentoCard
                                colSpan={1}
                                delay={200}
                                style={{
                                    height: 150,
                                    justifyContent: "space-between",
                                    backgroundColor: "#FFF",
                                }}
                            >
                                <View style={styles.cardHeader}>
                                    <Ionicons name="person" size={14} color={COLORS.secondary} />
                                    <Text style={styles.cardLabel}>PROFILE</Text>
                                </View>

                                <View style={styles.profileContent}>
                                    <Image
                                        source={userData?.photoURL}
                                        style={styles.avatar}
                                        contentFit="cover"
                                    />
                                    <View style={styles.proBadge}>
                                        <Text style={styles.proBadgeText}>ADMIN</Text>
                                    </View>
                                    <Text style={styles.profileName} numberOfLines={1}>
                                        {userData?.displayName || "Admin"}
                                    </Text>
                                </View>
                            </BentoCard>
                        </View>

                        <View style={styles.gridRow}>
                            <BentoCard colSpan={1} delay={300}>
                                <Text style={styles.cardValueSmall}>
                                    {totalUsers.toLocaleString()}
                                </Text>
                                <Text style={styles.cardLabelBottom}>TOTAL USERS</Text>
                            </BentoCard>
                            <BentoCard colSpan={1} delay={400}>
                                <Text style={styles.cardValueSmall}>{retentionRate}%</Text>
                                <Text style={styles.cardLabelBottom}>RETENTION</Text>
                            </BentoCard>
                            <BentoCard
                                colSpan={1}
                                delay={500}
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: COLORS.accent,
                                }}
                            >
                                <Ionicons name="add" size={28} color="#FFF" />
                            </BentoCard>
                        </View>
                    </View>
                )}

                {/* Segmented Control */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeContentTab === "users" && styles.activeTab,
                        ]}
                        onPress={() => setActiveContentTab("users")}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeContentTab === "users" && styles.activeTabText,
                            ]}
                        >
                            Users
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeContentTab === "sessions" && styles.activeTab,
                        ]}
                        onPress={() => setActiveContentTab("sessions")}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeContentTab === "sessions" && styles.activeTabText,
                            ]}
                        >
                            Sessions
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content Section */}
                <View style={[styles.contentSection, loading && { flex: 1 }]}>
                    {loading ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 300,
                            }}
                        >
                            <ActivityIndicator size="large" color={COLORS.secondary} />
                        </View>
                    ) : activeContentTab === "users" ? (
                        <View style={styles.listContainer}>
                            {users.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons
                                        name="people-outline"
                                        size={48}
                                        color={COLORS.secondary}
                                    />
                                    <Text style={styles.emptyText}>No users found</Text>
                                </View>
                            ) : (
                                users.map((user, index) => (
                                    <UserCard
                                        key={user.id}
                                        user={user}
                                        onPress={() => {
                                            setSelectedUser(user);
                                            setShowUserDetail(true);
                                        }}
                                        onToggleAdmin={() => handleToggleAdmin(user)}
                                        onDelete={() => handleDeleteUser(user)}
                                        isCurrentUser={user.id === userData?.uid}
                                        delay={index * 50}
                                    />
                                ))
                            )}
                        </View>
                    ) : (
                        <View style={styles.listContainer}>
                            {sessions.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons
                                        name="time-outline"
                                        size={48}
                                        color={COLORS.secondary}
                                    />
                                    <Text style={styles.emptyText}>No sessions found</Text>
                                </View>
                            ) : (
                                sessions.map((session, index) => (
                                    <SessionCard
                                        key={session.id}
                                        session={session}
                                        onDelete={() => handleDeleteSession(session)}
                                        delay={index * 50}
                                    />
                                ))
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Confirm Modal */}
            <ConfirmModal
                visible={confirmModal.visible}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Confirm"
                cancelText="Cancel"
                destructive={confirmModal.destructive}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ ...confirmModal, visible: false })}
            />

            {/* User Detail Modal */}
            <UserDetailModal
                visible={showUserDetail}
                user={selectedUser}
                onClose={() => {
                    setShowUserDetail(false);
                    setSelectedUser(null);
                }}
                onDelete={() => {
                    setShowUserDetail(false);
                    handleDeleteUser(selectedUser);
                }}
                onToggleAdmin={() => {
                    handleToggleAdmin(selectedUser);
                }}
                onUpdate={async (data) => {
                    if (!selectedUser) return;
                    try {
                        const userRef = doc(db, "users", selectedUser.id);
                        await updateDoc(userRef, data);
                        await fetchUsers(); // Refresh list
                        setSelectedUser({ ...selectedUser, ...data });
                    } catch (error) {
                        console.error("Error updating profile:", error);
                        throw error;
                    }
                }}
                isCurrentUser={selectedUser?.id === userData?.uid}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
        zIndex: 100,
    },
    titleWrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.primary,
        letterSpacing: -0.4,
    },
    backBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 4,
        height: "100%",
        zIndex: 10,
    },
    backText: {
        fontSize: 17,
        color: COLORS.accent,
        marginLeft: -4,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    gridContainer: {
        gap: 12,
        marginBottom: 20,
    },
    gridRow: {
        flexDirection: "row",
        gap: 12,
    },
    bentoCard: {
        backgroundColor: "#FFF",
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.10)",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    cardLabel: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.4,
    },
    chartContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1,
        alignItems: "flex-end",
        paddingBottom: 4,
        paddingHorizontal: 4,
    },
    activityBarContainer: {
        alignItems: "center",
        justifyContent: "flex-end",
        height: "100%",
        gap: 6,
        width: 20,
    },
    barTrack: {
        width: 12,
        flex: 1,
        backgroundColor: "#F2F2F7",
        borderRadius: 6,
        overflow: "hidden",
        justifyContent: "flex-end",
    },
    activityBarGradient: {
        width: "100%",
        borderRadius: 6,
    },
    activityLabel: {
        color: COLORS.secondary,
        fontSize: 9,
        fontWeight: "600",
    },
    activeLabel: {
        color: COLORS.accent,
        fontWeight: "700",
    },
    activeDot: {
        position: "absolute",
        bottom: -8,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.accent,
    },
    profileContent: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: 8,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: "#E5E5EA",
        marginBottom: 4,
    },
    profileName: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.primary,
        textAlign: "center",
        letterSpacing: -0.2,
    },
    profileEmail: {
        fontSize: 11,
        color: COLORS.secondary,
        textAlign: "center",
    },
    proBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "#FDE047",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#F59E0B",
    },
    proBadgeText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#92400E",
        letterSpacing: 0.5,
    },
    cardValueSmall: {
        color: COLORS.primary,
        fontSize: 28,
        fontWeight: "700",
        letterSpacing: -0.8,
        marginBottom: 2,
    },
    cardLabelBottom: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: "600",
        marginTop: 4,
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 15,
        color: COLORS.secondary,
        fontWeight: "400",
        letterSpacing: -0.2,
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#E5E5EA", // iOS Segmented Control Background
        padding: 2,
        borderRadius: 9,
        marginBottom: 16,
        height: 36,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7,
    },
    activeTab: {
        backgroundColor: "#FFFFFF",
        shadowColor: "rgba(0,0,0,0.12)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#000",
        letterSpacing: -0.1,
    },
    activeTabText: {
        fontWeight: "600",
    },
    contentSection: {
        gap: 0,
    },
    listContainer: {
        gap: 0,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
        gap: 10,
        backgroundColor: "#FFF",
        borderRadius: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    emptyText: {
        fontSize: 15,
        color: COLORS.secondary,
        fontWeight: "400",
    },
});
