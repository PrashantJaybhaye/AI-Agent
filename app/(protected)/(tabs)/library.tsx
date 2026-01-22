import { ActionSheet, ActionSheetItem } from "@/components/ui/ActionSheet";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Responsive scaling utilities
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

// Enhanced data with slightly softer, more sophisticated colors
const SESSIONS = [
    {
        id: "1",
        title: "Morning Focus",
        description: "Start your day with clarity and purpose.",
        duration: "3 min",
        icon: "sunny",
        // Softer Orange/Peach
        accentColor: "#FBBF24", // Yellow 500
        bgColor: "#FFFBEB", // Lightest Yellow bg
        iconColor: "#92400E",
        audioUri: "https://repo-asset.vercel.app/assets/nature.mp3",
    },
    {
        id: "2",
        title: "Deep Relax",
        description: "For times when you really need a break.",
        duration: "5 min",
        icon: "moon",
        // Softer Pink/Rose
        accentColor: "#F9A8D4", // Pink 300
        bgColor: "#FFF7FB", // Lightest Pink bg
        iconColor: "#9D174D",
        audioUri: "https://repo-asset.vercel.app/assets/piano-music.mp3",
    },
    {
        id: "3",
        title: "Anxiety Relief",
        description: "Mindfulness tips to deepen your practice.",
        duration: "7 min",
        icon: "leaf",
        // Softer Green/Teal
        accentColor: "#6EE7B7", // Emerald 300
        bgColor: "#F0FFF4", // Lightest Green bg
        iconColor: "#065F46",
        audioUri: "https://repo-asset.vercel.app/assets/anxiety.ogg",
    },
    {
        id: "4",
        title: "Sleep Well",
        description: "Drift away into a peaceful slumber night.",
        duration: "10 min",
        icon: "bed",
        // Softer Purple/Lavender
        accentColor: "#C4B5FD", // Violet 300
        bgColor: "#FAF5FF", // Lightest Purple bg
        iconColor: "#5B21B6",
        audioUri: "https://repo-asset.vercel.app/assets/sleep.mp3",
    },
];

export default function LibraryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    // State for modal
    const [selectedSession, setSelectedSession] = useState<
        (typeof SESSIONS)[0] | null
    >(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [sortOption, setSortOption] = useState<
        "default" | "shortest" | "longest"
    >("default");

    const getSortedSessions = () => {
        let sessions = [...SESSIONS];
        if (sortOption === "shortest") {
            sessions.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
        } else if (sortOption === "longest") {
            sessions.sort((a, b) => parseInt(b.duration) - parseInt(a.duration));
        }
        return sessions;
    };

    const displayedSessions = getSortedSessions();

    const handleSessionPress = (session: (typeof SESSIONS)[0]) => {
        setSelectedSession(session);
        setModalVisible(true);
    };

    const startSession = (withAudio: boolean) => {
        if (!selectedSession) return;
        setModalVisible(false);
        router.push({
            pathname: "/meditate",
            params: {
                ...selectedSession,
                playAudio: withAudio ? "true" : "false", // Pass as string param
            },
        });
    };

    const handleRemindPress = () => {
        // console.log('Remind me pressed'); // Placeholder for reminder logic
    };

    return (
        <View style={styles.container}>
            {/* iOS Premium Header (Solid White) */}
            <View
                style={[
                    styles.glassHeader,
                    { paddingTop: insets.top + 12, backgroundColor: "#FFFFFF" },
                ]}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitleLarge}>Library</Text>
                    <View style={styles.headerRightButtons}>
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={() => setMenuVisible(true)}
                        >
                            <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 92 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.cardList}>
                    {displayedSessions.map((session, index) => (
                        <Animated.View
                            key={session.id}
                            entering={FadeInDown.delay(index * 120)}
                        >
                            <TouchableOpacity
                                style={[styles.card, { backgroundColor: session.bgColor }]}
                                activeOpacity={0.8}
                                onPress={() => handleSessionPress(session)}
                            >
                                <View style={styles.cardContent}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardTitle}>{session.title}</Text>
                                        <Text style={styles.cardDescription}>
                                            {session.description}
                                        </Text>
                                        <View style={styles.durationBadge}>
                                            <Ionicons name="time-outline" size={14} color="#6B7280" />
                                            <Text style={styles.durationText}>
                                                {session.duration}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.graphicContainer}>
                                        <View
                                            style={[
                                                styles.graphicCircle,
                                                { backgroundColor: session.accentColor },
                                            ]}
                                        >
                                            <Ionicons
                                                name={session.icon as any}
                                                size={30}
                                                color={session.iconColor}
                                            />
                                        </View>
                                        <View
                                            style={[
                                                styles.graphicBlob,
                                                { backgroundColor: session.accentColor, opacity: 0.4 },
                                            ]}
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <View style={styles.divider} />
                <Text style={styles.sectionHeading}>Community</Text>

                <Animated.View
                    entering={FadeInDown.delay(300)}
                    style={styles.groupSection}
                >
                    <View style={styles.groupCard}>
                        {/* Left Content */}
                        <View style={styles.groupMainContent}>
                            <View style={styles.groupBadgeContainer}>
                                <View style={styles.liveDotPulse} />
                                <Text style={styles.groupBadgeText}>UPCOMING • 11:00 AM</Text>
                            </View>

                            <Text style={styles.groupCardTitle}>Group Meditation</Text>
                            <Text style={styles.groupCardSubtitle}>
                                Practice mindfulness with the community.
                            </Text>

                            <TouchableOpacity
                                style={styles.minimalButton}
                                activeOpacity={0.7}
                                onPress={handleRemindPress}
                            >
                                <Text style={styles.minimalButtonText}>Notify Me</Text>
                                <Ionicons name="notifications-outline" size={14} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {/* Right Visuals - Minimalist Avatars */}
                        <View style={styles.avatarStack}>
                            <View
                                style={[
                                    styles.avatarCircle,
                                    { backgroundColor: "#E0E7FF", zIndex: 3, right: 30 },
                                ]}
                            >
                                <Text
                                    style={{ fontSize: 10, fontWeight: "600", color: "#4338CA" }}
                                >
                                    JD
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.avatarCircle,
                                    { backgroundColor: "#FCE7F3", zIndex: 2, right: 15 },
                                ]}
                            >
                                <Text
                                    style={{ fontSize: 10, fontWeight: "600", color: "#BE185D" }}
                                >
                                    AL
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.avatarCircle,
                                    { backgroundColor: "#F3F4F6", zIndex: 1, right: 0 },
                                ]}
                            >
                                <Text
                                    style={{ fontSize: 10, fontWeight: "600", color: "#4B5563" }}
                                >
                                    +40
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Audio Option Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <BlurView
                        intensity={20}
                        tint="light"
                        style={StyleSheet.absoluteFill}
                    />

                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.alertContainer}>
                            <BlurView
                                intensity={80}
                                tint="light"
                                style={StyleSheet.absoluteFill}
                            />

                            <View style={styles.alertContent}>
                                <Text style={styles.alertTitle}>Start Session</Text>
                                <Text style={styles.alertMessage}>
                                    Would you like to play background audio?
                                </Text>
                            </View>

                            <View style={styles.alertButtons}>
                                <TouchableOpacity
                                    style={styles.alertButton}
                                    onPress={() => startSession(false)}
                                >
                                    <Text style={styles.alertButtonTextCancel}>No, Silent</Text>
                                </TouchableOpacity>

                                <View style={styles.alertButtonSeparator} />

                                <TouchableOpacity
                                    style={styles.alertButton}
                                    onPress={() => startSession(true)}
                                >
                                    <Text style={styles.alertButtonTextConfirm}>Play Audio</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Menu Options Modal */}
            <ActionSheet
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                title="Library Options"
            >
                <ActionSheetItem
                    icon="arrow-down-outline"
                    label="Sort by Duration (Shortest)"
                    onPress={() => {
                        setSortOption("shortest");
                        setMenuVisible(false);
                    }}
                    check={sortOption === "shortest"}
                />
                <ActionSheetItem
                    icon="arrow-up-outline"
                    label="Sort by Duration (Longest)"
                    onPress={() => {
                        setSortOption("longest");
                        setMenuVisible(false);
                    }}
                    check={sortOption === "longest"}
                />
                <ActionSheetItem
                    icon="refresh-outline"
                    label="Reset to Default"
                    onPress={() => {
                        setSortOption("default");
                        setMenuVisible(false);
                    }}
                    check={sortOption === "default"}
                    isLast
                />
            </ActionSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    sectionHeading: {
        fontSize: moderateScale(20),
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: verticalScale(16),
        paddingHorizontal: scale(4),
    },
    divider: {
        height: 1,
        backgroundColor: "#F3F4F6",
        marginVertical: verticalScale(22),
    },
    glassHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: "rgba(255,255,255,0.0)",
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(16),
    },
    headerTitleLarge: {
        fontSize: moderateScale(28),
        fontWeight: "700",
        color: "#000",
    },
    headerRightButtons: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(12),
    },
    moreButton: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: "#F2F2F7",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContent: {
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(40),
    },
    cardList: {
        gap: verticalScale(16),
        marginBottom: verticalScale(24),
    },
    card: {
        borderRadius: moderateScale(20),
        overflow: "visible",
        minHeight: verticalScale(138),
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: moderateScale(24),
    },
    textContainer: {
        flex: 1,
        padding: scale(16),
        paddingRight: scale(8),
    },
    cardTitle: {
        fontSize: moderateScale(17),
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: verticalScale(6),
    },
    cardDescription: {
        fontSize: moderateScale(13),
        color: "#4B5563",
        lineHeight: moderateScale(18),
        marginBottom: verticalScale(10),
    },
    durationBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(4),
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(15),
        backgroundColor: "#F5F5F5",
        alignSelf: "flex-start",
    },
    durationText: {
        fontSize: moderateScale(13),
        color: "#4B5563",
        fontWeight: "600",
    },
    graphicContainer: {
        width: scale(90),
        height: verticalScale(100),
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    graphicCircle: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
    },
    graphicBlob: {
        position: "absolute",
        width: scale(70),
        height: scale(70),
        borderRadius: scale(35),
        right: scale(-15),
        bottom: scale(-15),
        zIndex: 1,
    },
    groupSection: {
        marginTop: verticalScale(8),
        marginBottom: verticalScale(24),
    },
    groupCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: moderateScale(24),
        padding: scale(24),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    groupMainContent: {
        flex: 1,
        paddingRight: scale(16),
    },
    groupBadgeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: verticalScale(8),
    },
    liveDotPulse: {
        width: scale(6),
        height: scale(6),
        borderRadius: scale(3),
        backgroundColor: "#10B981",
        marginRight: scale(6),
    },
    groupBadgeText: {
        fontSize: moderateScale(10),
        fontWeight: "700",
        color: "#6B7280",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    groupCardTitle: {
        fontSize: moderateScale(18),
        fontWeight: "700",
        color: "#111827",
        marginBottom: verticalScale(4),
    },
    groupCardSubtitle: {
        fontSize: moderateScale(13),
        color: "#6B7280",
        lineHeight: moderateScale(18),
        marginBottom: verticalScale(16),
    },
    minimalButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(14),
        backgroundColor: "#fff",
        borderRadius: moderateScale(100),
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignSelf: "flex-start",
        gap: scale(6),
    },
    minimalButtonText: {
        fontSize: moderateScale(12),
        fontWeight: "600",
        color: "#111827",
    },
    avatarStack: {
        width: scale(80),
        height: scale(40),
        position: "relative",
        justifyContent: "center",
    },
    avatarCircle: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        borderWidth: 2,
        borderColor: "#F9FAFB",
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    alertContainer: {
        width: Math.min(scale(270), SCREEN_WIDTH * 0.7),
        borderRadius: moderateScale(14),
        overflow: "hidden",
        backgroundColor: "rgba(245,245,245,0.85)",
    },
    alertContent: {
        paddingTop: verticalScale(20),
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(20),
        alignItems: "center",
    },
    alertTitle: {
        fontSize: moderateScale(17),
        fontWeight: "600",
        color: "#000",
        textAlign: "center",
        marginBottom: verticalScale(4),
    },
    alertMessage: {
        fontSize: moderateScale(13),
        color: "#000",
        textAlign: "center",
        lineHeight: moderateScale(18),
    },
    alertButtons: {
        flexDirection: "row",
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#3C3C4336",
    },
    alertButton: {
        flex: 1,
        height: verticalScale(44),
        alignItems: "center",
        justifyContent: "center",
    },
    alertButtonSeparator: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: "#3C3C4336",
        height: "100%",
    },
    alertButtonTextCancel: {
        fontSize: moderateScale(17),
        color: "#007AFF",
        fontWeight: "400",
    },
    alertButtonTextConfirm: {
        fontSize: moderateScale(17),
        color: "#007AFF",
        fontWeight: "600",
    },
});
