import { PullToRefreshSectionList } from "@/components/PullToRefreshSectionList";
import { useUserContext } from "@/context/UserContext";
import { colors, sessionThemes } from "@/utils/colors";
import { db } from "@/utils/firebase";
import { Session } from "@/utils/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HistorySection = {
    title: string;
    data: Session[];
};

const getSessionTheme = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % sessionThemes.length;
    return sessionThemes[index];
};

export default function HistoryScreen() {
    const insets = useSafeAreaInsets();
    const { userData } = useUserContext();
    const router = useRouter();
    const [sections, setSections] = useState<HistorySection[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchSessions();
    }, [userData]);

    const fetchSessions = async () => {
        if (!userData) return;
        try {
            if (sections.length === 0) setLoading(true);

            const sessionsRef = collection(db, "session");
            const q = query(sessionsRef, where("user_id", "==", userData.uid));
            const querySnapshot = await getDocs(q);

            const sessions: Session[] = [];
            querySnapshot.forEach((doc) => {
                sessions.push({ id: doc.id, ...doc.data() } as Session);
            });

            sessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            const grouped = groupSessions(sessions);
            setSections(grouped);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        await fetchSessions();
        setRefreshKey(prev => prev + 1);
    };

    const groupSessions = (sessions: Session[]): HistorySection[] => {
        const groups: { [key: string]: Session[] } = {
            "Today": [],
            "Yesterday": [],
            "This Week": [],
            "Earlier": []
        };

        const now = new Date();
        const todayStr = now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        sessions.forEach(session => {
            const date = new Date(session.created_at);
            const dateStr = date.toDateString();

            if (dateStr === todayStr) {
                groups["Today"].push(session);
            } else if (dateStr === yesterdayStr) {
                groups["Yesterday"].push(session);
            } else if (date > lastWeek) {
                groups["This Week"].push(session);
            } else {
                groups["Earlier"].push(session);
            }
        });

        return Object.entries(groups)
            .map(([title, data]) => ({ title, data }))
            .filter(section => section.data.length > 0);
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "0m";
        const mins = Math.floor(seconds / 60);
        // If less than a minute, show seconds, else show minutes
        if (mins === 0) return `${seconds}s`;
        return `${mins}m`;
    };

    const renderHeader = () => (
        <View
            style={[styles.glassHeader, { paddingTop: insets.top + 12 }]}
            pointerEvents="box-none"
        >
            <View style={styles.headerContent}>
                <Text style={styles.headerTitleLarge}>History</Text>
                <View style={styles.headerRightButtons}>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="search" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.avatarButton}
                        onPress={() => router.push("/profile")}
                    >
                        {userData?.photoURL ? (
                            <Image source={{ uri: userData.photoURL }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitial}>{userData?.displayName?.[0] || "U"}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <Animated.View
            entering={FadeInDown.delay(200).duration(800).springify()}
            style={styles.emptyContainer}
        >
            {/* Ghost Cards Visualization */}
            <View style={styles.ghostStack}>
                {/* Bottom Ghost (Faintest) */}
                <View style={[styles.ghostCard, styles.ghostCardBottom]} />
                {/* Middle Ghost */}
                <View style={[styles.ghostCard, styles.ghostCardMiddle]} />
                {/* Top Ghost (Most visible) */}
                <View style={[styles.ghostCard, styles.ghostCardTop]}>
                    <View style={styles.ghostRow}>
                        <View style={styles.ghostAvatar} />
                        <View style={styles.ghostLines}>
                            <View style={styles.ghostLineShort} />
                            <View style={styles.ghostLineLong} />
                        </View>
                    </View>
                </View>

                {/* Floating Icon Overlay */}
                <View style={styles.ghostIconOverlay}>
                    <Ionicons name="journal-outline" size={32} color="#6B7280" />
                </View>
            </View>

            <Text style={styles.emptyTitle}>Your History is Empty</Text>
            <Text style={styles.emptySubtitle}>
                Conversations will be saved here automatically.{'\n'}Start a new session to begin.
            </Text>

            {/* Button removed as requested */}
        </Animated.View>
    );

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    // Avatar randomization arrays
    const avatarIcons = [
        'chatbubbles', 'mic', 'musical-notes', 'sparkles', 'flame', 'headset',
        'rocket', 'heart', 'star', 'bulb', 'videocam', 'people',
        'chatbox', 'radio', 'megaphone', 'happy', 'café', 'git-branch'
    ];

    const avatarColors = [
        { bg: '#E9D5FF', icon: '#9333EA' }, // Purple
        { bg: '#D1FAE5', icon: '#10B981' }, // Green
        { bg: '#FED7AA', icon: '#F59E0B' }, // Orange
        { bg: '#FCE7F3', icon: '#EC4899' }, // Rose
        { bg: '#DBEAFE', icon: '#3B82F6' }, // Blue
        { bg: '#CCFBF1', icon: '#14B8A6' }, // Teal
        { bg: '#FEEBC8', icon: '#F59E0B' }, // Amber
        { bg: '#E0E7FF', icon: '#6366F1' }, // Indigo
        { bg: '#FCE7F3', icon: '#EC4899' }, // Pink
    ];

    // Generate consistent random values from session ID
    const getRandomForSession = (sessionId: string, index: number) => {
        let hash = 0;
        const seed = sessionId + index.toString();
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    };

    const HistoryCard = ({ item, index }: { item: Session, index: number }) => {
        // Generate 6 unique random avatars for this card
        const avatars = Array.from({ length: 6 }, (_, i) => {
            const iconIndex = getRandomForSession(item.id, i) % avatarIcons.length;
            const colorIndex = getRandomForSession(item.id, i + 100) % avatarColors.length;
            return {
                icon: avatarIcons[iconIndex],
                color: avatarColors[colorIndex],
            };
        });

        // Bubble cluster layout with varied sizes and overlapping
        const bubbleConfig = [
            { size: 40, iconSize: 18, top: 5, left: 8, zIndex: 2 },      // Medium
            { size: 48, iconSize: 20, top: 0, right: 0, zIndex: 4 },     // Large (prominent)
            { size: 36, iconSize: 16, top: 30, left: 0, zIndex: 1 },     // Small
            { size: 42, iconSize: 18, top: 26, left: 24, zIndex: 3 },    // Medium-large
            { size: 38, iconSize: 17, bottom: 0, right: 10, zIndex: 2 }, // Medium-small
            { size: 34, iconSize: 15, top: 18, right: 16, zIndex: 1 },   // Small
        ];

        return (
            <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
                <Pressable
                    style={({ pressed }) => [
                        styles.cardContainer,
                        pressed && styles.cardPressed
                    ]}
                    onPress={() => {
                        router.push({
                            pathname: "/summary",
                            params: {
                                sessionId: item.id,
                                title: item.call_summary_title,
                                createdAt: item.created_at
                            }
                        });
                    }}
                >
                    <View style={styles.cardContent}>
                        {/* LEFT SIDE: Text Content */}
                        <ScrollView
                            style={styles.cardLeft}
                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.cardContextRow}>
                                <Text style={styles.cardContextText}>
                                    {new Date(item.created_at).toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()} • {formatTime(item.created_at)} • {item.tokens || 0} TOKENS
                                </Text>
                            </View>

                            <Text style={styles.cardTitle}>
                                {item.call_summary_title || "Untitled Session"}
                            </Text>

                            <View style={styles.cardTagRow}>
                                <View style={styles.pillTag}>
                                    <Text style={styles.pillText}>{formatDuration(item.call_duration_secs)}</Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* RIGHT SIDE: Bubble Cluster */}
                        <View style={styles.cardRight}>
                            <View style={styles.avatarCluster}>
                                {/* Connected bubble cluster with varied sizes */}
                                {avatars.map((avatar, idx) => {
                                    const config = bubbleConfig[idx];
                                    return (
                                        <View
                                            key={idx}
                                            style={[
                                                styles.chAvatar,
                                                {
                                                    backgroundColor: avatar.color.bg,
                                                    width: config.size,
                                                    height: config.size,
                                                    borderRadius: config.size / 2,
                                                    top: config.top,
                                                    left: config.left,
                                                    right: config.right,
                                                    bottom: config.bottom,
                                                    zIndex: config.zIndex
                                                }
                                            ]}
                                        >
                                            <Ionicons
                                                name={avatar.icon as any}
                                                size={config.iconSize}
                                                color={avatar.color.icon}
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

    if (loading && sections.length === 0) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

                {renderHeader()}

                <PullToRefreshSectionList
                    sections={sections}
                    keyExtractor={(item: any) => `${item.id}-${refreshKey}`}
                    renderItem={({ item, index }: any) => <HistoryCard item={item} index={index} />}
                    renderSectionHeader={renderSectionHeader}
                    onRefresh={handleRefresh}
                    contentContainerStyle={[
                        styles.listContent,
                        {
                            paddingBottom: insets.bottom + 100,
                            paddingTop: insets.top + 72,
                            flexGrow: 1,
                        }
                    ]}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={false}
                    topOffset={insets.top + 64}
                />
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    // Library-style Header
    glassHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitleLarge: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
    },
    headerRightButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    moreButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Shared Avatar styles
    avatarButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E5E5EA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
    },

    listContent: {
        paddingHorizontal: 20, // Match header padding (was 16)
    },
    sectionHeader: {
        marginBottom: 10,
        marginTop: 0, // More breathing room
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: 1.2, // Slightly wider
    },

    // Clubhouse Card
    cardContainer: {
        backgroundColor: "#F9F8F4",
        borderRadius: 24,
        marginBottom: 16,
        padding: 24, // Increased padding for spacious feel
    },
    cardPressed: {
        opacity: 0.7, // Standard opacity feedback
    },
    cardContent: {
        flexDirection: 'row',
    },
    cardLeft: {
        flex: 1,
        paddingRight: 16,
        maxHeight: 150, // Limit height to enable internal scrolling
    },
    cardContextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    roomIcon: {
        width: 20,
        height: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContextText: {
        fontSize: 11,
        fontWeight: "800", // Extra Bold for small text
        color: "#6B7280", // Slightly darker gray
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    cardTitle: {
        fontSize: 19, // Slightly reduced for better flow
        fontWeight: "700",
        color: "#111827",
        lineHeight: 26,
        marginBottom: 14, // More space before tags
    },
    cardTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pillTag: {
        backgroundColor: "#EAE9E4",
        paddingHorizontal: 12,
        paddingVertical: 6, // Plumper pills
        borderRadius: 16,
    },
    pillText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#4B5563",
    },

    // Clubhouse Bubble Cluster
    cardRight: {
        width: 105,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCluster: {
        width: 95,
        height: 75,
        position: 'relative',
    },
    // Base Clubhouse Avatar Style
    chAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E9D5FF', // Purple tint default
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2.5,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
    },
    // Color Variants
    chAvatarGreen: {
        backgroundColor: '#D1FAE5', // Emerald tint
    },
    chAvatarOrange: {
        backgroundColor: '#FED7AA', // Amber tint
    },
    chAvatarRose: {
        backgroundColor: '#FCE7F3', // Pink tint
    },
    chAvatarBlue: {
        backgroundColor: '#DBEAFE', // Sky tint
    },
    chAvatarTeal: {
        backgroundColor: '#CCFBF1', // Teal tint
    },
    // Enhanced Count Badge
    chCountBadge: {
        position: 'absolute',
        bottom: -5,
        right: -2,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#F9F8F4',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
        zIndex: 10,
    },
    chCountText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#4F46E5',
        letterSpacing: 0.2,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    ghostStack: {
        width: 250,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
    },
    ghostCard: {
        position: 'absolute',
        width: '100%',
        height: 80,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    ghostCardBottom: {
        width: '80%',
        top: 0,
        opacity: 0.4,
        transform: [{ scale: 0.85 }],
    },
    ghostCardMiddle: {
        width: '90%',
        top: 15,
        opacity: 0.7,
        transform: [{ scale: 0.92 }],
    },
    ghostCardTop: {
        width: '100%',
        top: 30,
        backgroundColor: '#FFFFFF',
        height: 90,
        justifyContent: 'center',
        paddingHorizontal: 20,
        shadowOpacity: 0.1,
        elevation: 4,
    },
    ghostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        opacity: 0.5,
    },
    ghostAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
    },
    ghostLines: {
        flex: 1,
        gap: 8,
    },
    ghostLineShort: {
        width: '60%',
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E7EB',
    },
    ghostLineLong: {
        width: '90%',
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F3F4F6',
    },
    ghostIconOverlay: {
        position: 'absolute',
        bottom: -15,
        right: -10,
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 16,
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        transform: [{ rotate: '-5deg' }],
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    emptySubtitle: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
});
