import SubscriptionModal from "@/components/subscription/SubscriptionModal";
import { db } from "@/utils/firebase";
import { Session, StreakEntry } from "@/utils/types";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    Modal,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserContext } from "../../context/UserContext";

const { width } = Dimensions.get("window");

const COLORS = {
    bg: "#FFFFFF",
    card: "#FAFAFA",
    cardBorder: "#E4E4E7",
    primary: "#09090B",
    secondary: "#71717A",
    accent: "#3B82F6",
    danger: "#EF4444",
    success: "#10B981",
};

const BentoCard = ({ children, style, delay = 0, colSpan = 1 }: any) => (
    <View style={[styles.bentoCard, { flex: colSpan }, style]}>{children}</View>
);

const ActivityBar = ({ height, label, active }: any) => (
    <View style={styles.activityBarContainer}>
        <View style={styles.barTrack}>
            <LinearGradient
                colors={active ? ["#3B82F6", "#60A5FA"] : ["#93C5FD", "#BFDBFE"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[
                    styles.activityBarGradient,
                    { height: `${height}%`, opacity: active ? 1 : 1 },
                ]}
            />
        </View>
        <Text style={[styles.activityLabel, active && styles.activeLabel]}>
            {label}
        </Text>
        {active && <View style={styles.activeDot} />}
    </View>
);

const SettingsModal = ({ visible, onClose, signOut, isAdmin, router }: any) => {
    const insets = useSafeAreaInsets();
    const { userData } = useUserContext();

    const IOS_HIGHLIGHT = "#E5E5EA"; // The exact color iOS uses for press states

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out my profile on Siora! 🧘‍♂️\n\nhttps://siora.app/u/${userData?.uid}`,
                url: `https://siora.app/u/${userData?.uid}`, // iOS supports generic URL field
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.actionSheetOverlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                    activeOpacity={1}
                />

                <View
                    style={[
                        styles.actionSheetContainer,
                        { paddingBottom: insets.bottom + 10 },
                    ]}
                >
                    <View style={styles.actionGroup}>
                        {/* Edit Profile */}
                        <TouchableHighlight
                            style={styles.actionSheetItem}
                            underlayColor={IOS_HIGHLIGHT}
                            onPress={() => {
                                Haptics.selectionAsync();
                                onClose();
                                router.push("/(protected)/edit-profile");
                            }}
                        >
                            <Text style={styles.actionSheetText}>Edit Profile</Text>
                        </TouchableHighlight>

                        <View style={styles.actionSheetSeparator} />

                        {/* Notifications */}
                        <TouchableHighlight
                            style={styles.actionSheetItem}
                            underlayColor={IOS_HIGHLIGHT}
                            onPress={() => {
                                Haptics.selectionAsync();
                                onClose();
                            }}
                        >
                            <Text style={styles.actionSheetText}>Notifications</Text>
                        </TouchableHighlight>

                        <View style={styles.actionSheetSeparator} />

                        {/* Share Profile */}
                        <TouchableHighlight
                            style={styles.actionSheetItem}
                            underlayColor={IOS_HIGHLIGHT}
                            onPress={handleShare}
                        >
                            <Text style={styles.actionSheetText}>Share Profile</Text>
                        </TouchableHighlight>

                        <View style={styles.actionSheetSeparator} />

                        {/* Log Out */}
                        <TouchableHighlight
                            style={styles.actionSheetItem}
                            underlayColor={IOS_HIGHLIGHT}
                            onPress={() => {
                                Haptics.notificationAsync(
                                    Haptics.NotificationFeedbackType.Warning
                                );
                                signOut();
                            }}
                        >
                            <Text style={styles.actionSheetTextDestructive}>Log Out</Text>
                        </TouchableHighlight>
                    </View>

                    {/* Cancel Button */}
                    <TouchableHighlight
                        style={styles.cancelButton}
                        underlayColor={IOS_HIGHLIGHT}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onClose();
                        }}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableHighlight>
                </View>
            </View>
        </Modal>
    );
};

export default function ProfileScreen() {
    const router = useRouter();
    const { userData } = useUserContext();
    const { signOut } = useAuth();
    const insets = useSafeAreaInsets();

    const [stats, setStats] = useState({
        totalSessions: 0,
        totalDurationMinutes: 0,
        averageDurationMinutes: 0,
        currentStreak: 0,
        dailyActivity: [0, 0, 0, 0, 0, 0, 0],
    });
    const [sessions, setSessions] = useState<Session[]>([]);
    const [streakEntries, setStreakEntries] = useState<StreakEntry[]>([]);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [subscriptionVisible, setSubscriptionVisible] = useState(false);

    const handleShare = async () => {
        const message = `I'm on a ${stats.currentStreak}-day streak with Siora! 🧘‍♂️\n\nTotal Focus: ${stats.totalDurationMinutes} mins\nSessions: ${stats.totalSessions}\n\nCheck out my profile: https://siora.app/u/${userData?.uid}`;
        try {
            const result = await Share.share({
                message: message,
                url: `https://siora.app/u/${userData?.uid}`, // iOS support
            });
            if (result.action === Share.sharedAction) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const parseDate = (date: any): Date => {
        if (!date) return new Date();
        if (typeof date.toDate === "function") return date.toDate(); // Firestore Timestamp
        if (date.seconds) return new Date(date.seconds * 1000); // Timestamp
        return new Date(date); // Date object or string
    };

    const processSessions = useCallback(
        (sessions: Session[], streakEntries: StreakEntry[]) => {
            const totalSessions = sessions.length; // Call sessions
            const totalDurationSecs = sessions.reduce(
                (acc, s) => acc + (s.call_duration_secs || 0),
                0
            );

            // Breathing exercise duration
            const breathingDurationSecs = streakEntries.reduce(
                (acc, entry) => acc + (entry.total_session_duration_seconds || 0),
                0
            );

            // Weekly activity from breathing exercises
            const breathingActivity = calculateBreathingActivity(streakEntries);

            // Streak from breathing exercises
            const breathingStreak = calculateBreathingStreak(streakEntries);

            setStats({
                totalSessions, // Call sessions
                totalDurationMinutes: Math.floor(breathingDurationSecs / 60), // Breathing exercises
                averageDurationMinutes:
                    totalSessions > 0
                        ? Math.round(totalDurationSecs / 60 / totalSessions)
                        : 0, // Call sessions
                currentStreak: breathingStreak, // Breathing exercise streak
                dailyActivity: breathingActivity, // Breathing exercise activity
            });
        },
        []
    );

    // Real-time listener for sessions
    useEffect(() => {
        if (!userData) return;

        const sessionsRef = collection(db, "session");
        const q = query(sessionsRef, where("user_id", "==", userData.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as Session
            );
            setSessions(data);
        });

        return () => unsubscribe();
    }, [userData]);

    // Real-time listener for streak entries
    useEffect(() => {
        if (!userData) return;

        const streakRef = collection(db, "streak");
        const q = query(
            streakRef,
            where("user_id", "==", userData.uid),
            orderBy("completion_time", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as StreakEntry
            );
            setStreakEntries(data);
        });

        return () => unsubscribe();
    }, [userData]);

    // Update stats when data changes
    useEffect(() => {
        processSessions(sessions, streakEntries);
    }, [sessions, streakEntries, processSessions]);

    const calculateStreak = (sessions: Session[]) => {
        if (!sessions.length) return 0;

        const uniqueDates = Array.from(
            new Set(
                sessions.map((s) => {
                    const date = parseDate(s.created_at);
                    return new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    ).getTime();
                })
            )
        ).sort((a, b) => b - a);

        let streak = 0;
        const today = new Date();
        const todayReset = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        ).getTime();

        const hasToday = uniqueDates.includes(todayReset);
        const yesterdayReset = todayReset - 86400000;
        const hasYesterday = uniqueDates.includes(yesterdayReset);

        if (!hasToday && !hasYesterday) return 0;

        let checkTime = hasToday ? todayReset : yesterdayReset;

        while (uniqueDates.includes(checkTime)) {
            streak++;
            checkTime -= 86400000;
        }

        return streak;
    };

    // Calculate Daily Activity
    // Fixed week (Mon-Sun)
    // Map current week's activity
    const calculateDailyActivity = (sessions: Session[]) => {
        const activity = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        sessions.forEach((s) => {
            const sessionDate = parseDate(s.created_at);
            if (sessionDate >= monday) {
                let dayIndex = sessionDate.getDay() - 1;
                if (dayIndex === -1) dayIndex = 6;

                const durationMins = (s.call_duration_secs || 0) / 60;
                activity[dayIndex] += durationMins;
            }
        });

        const maxVal = Math.max(...activity, 1);
        return activity.map((v) => (v / maxVal) * 100);
    };

    // Calculate streak from breathing exercises
    const calculateBreathingStreak = (streakEntries: StreakEntry[]) => {
        if (streakEntries.length === 0) return 0;

        // Unique dates from breathing exercises
        const uniqueDates = Array.from(
            new Set(
                streakEntries
                    .map((entry) => {
                        if (entry.completion_time) {
                            const date = entry.completion_time.toDate();
                            return new Date(
                                date.getFullYear(),
                                date.getMonth(),
                                date.getDate()
                            ).getTime();
                        }
                        return 0;
                    })
                    .filter((d) => d > 0)
            )
        ).sort((a, b) => b - a);

        if (uniqueDates.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        const todayReset = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        ).getTime();

        const hasToday = uniqueDates.includes(todayReset);
        const yesterdayReset = todayReset - 86400000;
        const hasYesterday = uniqueDates.includes(yesterdayReset);

        // Start counting if activity today or yesterday
        if (!hasToday && !hasYesterday) return 0;

        let checkTime = hasToday ? todayReset : yesterdayReset;

        // Count consecutive days
        while (uniqueDates.includes(checkTime)) {
            streak++;
            checkTime -= 86400000; // Go back one day
        }

        return streak;
    };

    const calculateBreathingActivity = (streakEntries: StreakEntry[]) => {
        const activity = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        streakEntries.forEach((entry) => {
            if (entry.completion_time) {
                const entryDate = entry.completion_time.toDate();
                if (entryDate >= monday) {
                    let dayIndex = entryDate.getDay() - 1;
                    if (dayIndex === -1) dayIndex = 6;
                    const durationMins = entry.total_session_duration_seconds / 60;
                    activity[dayIndex] += durationMins;
                }
            }
        });

        const maxVal = Math.max(...activity, 1);
        return activity.map((v) => (v / maxVal) * 100);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>
                <View style={styles.headerRight}>
                    {userData?.isAdmin && (
                        <TouchableOpacity
                            style={styles.settingsBtn}
                            onPress={() => router.push("/(protected)/admin/dashboard")}
                        >
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={20}
                                color={COLORS.primary}
                            />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => setSettingsVisible(true)}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={20}
                            color={COLORS.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.identityRow}>
                    <Image
                        source={userData?.photoURL}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>{userData?.displayName}</Text>
                        <Text style={styles.userEmail}>{userData?.email}</Text>
                    </View>
                    {userData?.isAdmin && (
                        <View style={styles.proBadge}>
                            <Text style={styles.proBadgeText}>ADMIN</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.viewProfileBtn}
                        onPress={() => router.push(`/(protected)/user/${userData?.uid}`)}
                    >
                        <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.gridContainer}>
                    <View style={styles.gridRow}>
                        <BentoCard
                            colSpan={2}
                            delay={100}
                            style={{ backgroundColor: COLORS.card }}
                        >
                            <View style={styles.cardHeader}>
                                <Ionicons name="time" size={16} color={COLORS.secondary} />
                                <Text style={styles.cardLabel}>TIME FOCUSED</Text>
                            </View>
                            <View style={styles.timeContent}>
                                <Text style={styles.timeValue}>
                                    {stats.totalDurationMinutes}
                                </Text>
                                <Text style={styles.timeUnit}>min</Text>
                            </View>
                        </BentoCard>

                        <BentoCard
                            colSpan={1}
                            delay={200}
                            style={{
                                backgroundColor: "#F4F4F5",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Ionicons name="flame" size={24} color={COLORS.danger} />
                            <Text style={[styles.cardValue, { marginTop: 8 }]}>
                                {stats.currentStreak}
                            </Text>
                            <Text style={styles.cardLabelBottom}>STREAK</Text>
                        </BentoCard>
                    </View>

                    <View style={styles.gridRow}>
                        <BentoCard colSpan={3} delay={300} style={{ height: 180 }}>
                            <View
                                style={[styles.cardHeader, { justifyContent: "space-between" }]}
                            >
                                <View
                                    style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                                >
                                    <Ionicons
                                        name="bar-chart"
                                        size={16}
                                        color={COLORS.secondary}
                                    />
                                    <Text style={styles.cardLabel}>WEEKLY ACTIVITY</Text>
                                </View>
                            </View>
                            <View style={styles.chartContainer}>
                                <ActivityBar
                                    height={Math.max(stats.dailyActivity[0], 10)}
                                    label="M"
                                    active={new Date().getDay() === 1}
                                />
                                <ActivityBar
                                    height={Math.max(stats.dailyActivity[1], 10)}
                                    label="T"
                                    active={new Date().getDay() === 2}
                                />
                                <ActivityBar
                                    height={Math.max(stats.dailyActivity[2], 10)}
                                    label="W"
                                    active={new Date().getDay() === 3}
                                />
                                <ActivityBar
                                    height={Math.max(stats.dailyActivity[3], 10)}
                                    label="T"
                                    active={new Date().getDay() === 4}
                                />
                                <ActivityBar
                                    height={Math.max(stats.dailyActivity[4], 10)}
                                    label="F"
                                    active={new Date().getDay() === 5}
                                />
                                <ActivityBar
                                    height={Math.max(stats.dailyActivity[5], 10)}
                                    label="S"
                                    active={new Date().getDay() === 6}
                                />
                                <ActivityBar
                                    height={Math.max(stats.dailyActivity[6], 10)}
                                    label="S"
                                    active={new Date().getDay() === 0}
                                />
                            </View>
                        </BentoCard>
                    </View>

                    <View style={styles.gridRow}>
                        <BentoCard colSpan={1} delay={400}>
                            <Text style={styles.cardValueSmall}>{stats.totalSessions}</Text>
                            <Text style={styles.cardLabelBottom}>SESSIONS</Text>
                        </BentoCard>
                        <BentoCard colSpan={1} delay={500}>
                            <Text style={styles.cardValueSmall}>
                                {stats.averageDurationMinutes}m
                            </Text>
                            <Text style={styles.cardLabelBottom}>AVG TIME</Text>
                        </BentoCard>

                        <BentoCard
                            colSpan={1}
                            delay={600}
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: COLORS.accent,
                            }}
                        >
                            <TouchableOpacity
                                onPress={handleShare}
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flex: 1,
                                    width: "100%",
                                }}
                            >
                                <Ionicons
                                    name="share-outline"
                                    size={24}
                                    color={COLORS.primary}
                                />
                            </TouchableOpacity>
                        </BentoCard>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSubscriptionVisible(true);
                        }}
                    >
                        <Text style={styles.menuText}>Subscription</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{
                                backgroundColor: userData?.subscriptionPlan === 'premium' ? '#F0FDF4' : '#F4F4F5',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 6
                            }}>
                                <Text style={{
                                    fontSize: 10,
                                    fontWeight: '800',
                                    color: userData?.subscriptionPlan === 'premium' ? '#166534' : COLORS.primary,
                                    letterSpacing: 0.5
                                }}>
                                    {userData?.subscriptionPlan === 'premium' ? 'ACTIVE' : 'UPGRADE'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={COLORS.secondary} />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() =>
                            Haptics.notificationAsync(
                                Haptics.NotificationFeedbackType.Success
                            )
                        }
                    >
                        <Text style={styles.menuText}>Achievements</Text>
                        <View
                            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                        >
                            <Text style={{ fontSize: 12, color: COLORS.secondary }}>
                                Coming Soon
                            </Text>
                            <Ionicons
                                name="lock-closed-outline"
                                size={14}
                                color={COLORS.secondary}
                            />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setSettingsVisible(true)}
                    >
                        <Text style={styles.menuText}>Preferences</Text>
                        <Ionicons
                            name="settings-outline"
                            size={16}
                            color={COLORS.secondary}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <SettingsModal
                visible={settingsVisible}
                onClose={() => setSettingsVisible(false)}
                signOut={signOut}
                isAdmin={userData?.isAdmin}
                router={router}
            />

            <SubscriptionModal
                visible={subscriptionVisible}
                onClose={() => setSubscriptionVisible(false)}
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
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 25,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: COLORS.primary,
        letterSpacing: -1,
    },
    headerRight: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    settingsBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 20,
    },

    identityRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
        borderWidth: 2,
        borderColor: COLORS.cardBorder,
    },
    userName: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.primary,
        letterSpacing: -0.5,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.secondary,
    },
    proBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "#FDE047",
        borderRadius: 4,
    },
    proBadgeText: {
        color: "#000",
        fontWeight: "800",
        fontSize: 10,
    },
    viewProfileBtn: {
        padding: 8,
        marginLeft: 4,
        alignItems: "center",
        justifyContent: "center",
    },

    gridContainer: {
        gap: 12,
        marginBottom: 30,
    },
    gridRow: {
        flexDirection: "row",
        gap: 12,
    },
    bentoCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    cardLabel: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    timeContent: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    timeValue: {
        color: COLORS.primary,
        fontSize: 36,
        fontWeight: "700",
        letterSpacing: -1,
    },
    timeUnit: {
        color: COLORS.secondary,
        fontSize: 16,
        marginLeft: 4,
        fontWeight: "600",
    },
    cardLabelBottom: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: "700",
        marginTop: 4,
        letterSpacing: 0.5,
    },
    cardValue: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: "700",
        letterSpacing: -0.5,
    },
    cardValueSmall: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: -0.5,
    },

    chartContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        height: 125,
        paddingBottom: 4,
    },
    activityBarContainer: {
        alignItems: "center",
        justifyContent: "flex-end",
        height: "100%",
        gap: 8,
        width: 34,
    },
    barTrack: {
        width: 14,
        flex: 1,
        backgroundColor: "#F1F5F9", // Softer grey
        borderRadius: 12, // Fully rounded
        overflow: "hidden",
        justifyContent: "flex-end",
    },
    activityBarGradient: {
        width: "100%",
        borderRadius: 12,
    },
    activityLabel: {
        color: COLORS.secondary,
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 2,
    },
    activeLabel: {
        color: COLORS.primary,
        fontWeight: "800",
    },
    activeDot: {
        position: "absolute",
        bottom: -6,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
    },

    menuContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    menuItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    menuText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.cardBorder,
        marginHorizontal: 16,
    },

    actionSheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    actionSheetContainer: {
        paddingHorizontal: 16,
    },
    actionGroup: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 8,
    },
    actionSheetItem: {
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
    },
    actionSheetText: {
        fontSize: 17,
        fontWeight: "500",
        color: "#000000",
        letterSpacing: -0.3, // Tighter tracking for that "premium" feel
    },
    actionSheetTextDestructive: {
        fontSize: 17,
        fontWeight: "600",
        color: "#FF3B30",
        letterSpacing: -0.3,
    },
    actionSheetSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#3C3C4336",
        width: "100%",
    },
    cancelButton: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#000000",
        letterSpacing: -0.3,
    },
});
