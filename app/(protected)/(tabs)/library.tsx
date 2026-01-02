import { useUserContext } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Enhanced data with slightly softer, more sophisticated colors
const SESSIONS = [
    {
        id: '1',
        title: 'Morning Focus',
        description: 'Start your day with clarity and purpose.',
        duration: '3 min',
        icon: 'sunny',
        // Softer Orange/Peach
        accentColor: '#FBBF24', // Yellow 500
        bgColor: '#FFFBEB', // Lightest Yellow bg
        iconColor: '#92400E',
        audioUri: 'https://repo-asset.vercel.app/assets/nature.mp3',
    },
    {
        id: '2',
        title: 'Deep Relax',
        description: 'For times when you really need a break.',
        duration: '5 min',
        icon: 'moon',
        // Softer Pink/Rose
        accentColor: '#F9A8D4', // Pink 300
        bgColor: '#FFF7FB', // Lightest Pink bg
        iconColor: '#9D174D',
        audioUri: 'https://repo-asset.vercel.app/assets/piano-music.mp3',
    },
    {
        id: '3',
        title: 'Anxiety Relief',
        description: 'Mindfulness tips to deepen your practice.',
        duration: '4 min',
        icon: 'leaf',
        // Softer Green/Teal
        accentColor: '#6EE7B7', // Emerald 300
        bgColor: '#F0FFF4', // Lightest Green bg
        iconColor: '#065F46',
        audioUri: 'https://repo-asset.vercel.app/assets/anxiety.ogg',
    },
    {
        id: '4',
        title: 'Sleep Well',
        description: 'Drift away into a peaceful slumber.',
        duration: '10 min',
        icon: 'bed',
        // Softer Purple/Lavender
        accentColor: '#C4B5FD', // Violet 300
        bgColor: '#FAF5FF', // Lightest Purple bg
        iconColor: '#5B21B6',
        audioUri: 'https://repo-asset.vercel.app/assets/sleep.mp3',
    },
];

export default function LibraryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userData } = useUserContext();

    // State for modal
    const [selectedSession, setSelectedSession] = useState<typeof SESSIONS[0] | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleSessionPress = (session: typeof SESSIONS[0]) => {
        setSelectedSession(session);
        setModalVisible(true);
    };

    const startSession = (withAudio: boolean) => {
        if (!selectedSession) return;
        setModalVisible(false);
        router.push({
            pathname: '/meditate',
            params: {
                ...selectedSession,
                playAudio: withAudio ? 'true' : 'false' // Pass as string param
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
                style={[styles.glassHeader, { paddingTop: insets.top + 5, backgroundColor: '#FFFFFF' }]}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitleLarge}>Library</Text>
                    <View style={styles.headerRightButtons}>
                        <TouchableOpacity style={styles.moreButton}>
                            <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.avatarButton}>
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

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 90 }
                ]}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.cardList}>
                    {SESSIONS.map((session, index) => (
                        <Animated.View
                            key={session.id}
                            entering={FadeInDown.delay(index * 120).springify()}
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
                                            <Text style={styles.durationText}>{session.duration}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.graphicContainer}>
                                        <View style={[styles.graphicCircle, { backgroundColor: session.accentColor }]}>
                                            <Ionicons name={session.icon as any} size={30} color={session.iconColor} />
                                        </View>
                                        <View style={[styles.graphicBlob, { backgroundColor: session.accentColor, opacity: 0.4 }]} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <View style={styles.divider} />
                <Text style={styles.sectionHeading}>Community</Text>

                <Animated.View
                    entering={FadeInDown.delay(300).springify()}
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
                            <View style={[styles.avatarCircle, { backgroundColor: '#E0E7FF', zIndex: 3, right: 30 }]}>
                                <Text style={{ fontSize: 10, fontWeight: '600', color: '#4338CA' }}>JD</Text>
                            </View>
                            <View style={[styles.avatarCircle, { backgroundColor: '#FCE7F3', zIndex: 2, right: 15 }]}>
                                <Text style={{ fontSize: 10, fontWeight: '600', color: '#BE185D' }}>AL</Text>
                            </View>
                            <View style={[styles.avatarCircle, { backgroundColor: '#F3F4F6', zIndex: 1, right: 0 }]}>
                                <Text style={{ fontSize: 10, fontWeight: '600', color: '#4B5563' }}>+40</Text>
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
                    <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />

                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.alertContainer}>
                            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />

                            <View style={styles.alertContent}>
                                <Text style={styles.alertTitle}>Start Session</Text>
                                <Text style={styles.alertMessage}>Would you like to play background audio?</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // New Styles for Headings and Divider
    sectionHeading: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
        paddingHorizontal: 4, // Align visually with cards
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 24,
    },
    // Header Styles (Preserved)
    glassHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.0)',
    },
    headerContent: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerTitleLarge: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: 0.35,
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

    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    cardList: {
        gap: 16,
        marginBottom: 24,
    },
    card: {
        borderRadius: 20,
        overflow: 'visible',
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden', // Keep content inside the rounded corners
        borderRadius: 24,
    },
    textContainer: {
        flex: 1,
        padding: 16,
        paddingRight: 8,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 6,
    },
    cardDescription: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 18,
        marginBottom: 10,
    },
    durationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
        backgroundColor: '#F5F5F5',
        alignSelf: 'flex-start',
    },
    durationText: {
        fontSize: 13, // Slightly bigger text in badge
        color: '#4B5563',
        fontWeight: '600',
    },
    graphicContainer: {
        width: 90,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    graphicCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    graphicBlob: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        right: -15,
        bottom: -15,
        zIndex: 1,
    },
    groupSection: {
        marginTop: 8,
        marginBottom: 24,
    },
    groupCard: {
        backgroundColor: '#F9FAFB', // iOS System Gray 6 (ish)
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    groupMainContent: {
        flex: 1,
        paddingRight: 16,
    },
    groupBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    liveDotPulse: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981', // Emerald 500
        marginRight: 6,
    },
    groupBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6B7280', // Gray 500
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    groupCardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    groupCardSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 16,
    },
    minimalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: '#fff',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignSelf: 'flex-start',
        gap: 6,
    },
    minimalButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#111827',
    },
    avatarStack: {
        width: 80,
        height: 40,
        position: 'relative',
        justifyContent: 'center',
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#F9FAFB', // Match card bg
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    alertContainer: {
        width: 270,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: 'rgba(245,245,245,0.85)',
    },
    alertContent: {
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 20,
        alignItems: 'center',
    },
    alertTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 4,
    },
    alertMessage: {
        fontSize: 13,
        color: '#000',
        textAlign: 'center',
        lineHeight: 18,
    },
    alertButtons: {
        flexDirection: 'row',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#3C3C4336',
    },
    alertButton: {
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertButtonSeparator: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: '#3C3C4336',
        height: '100%',
    },
    alertButtonTextCancel: {
        fontSize: 17,
        color: '#007AFF',
        fontWeight: '400',
    },
    alertButtonTextConfirm: {
        fontSize: 17,
        color: '#007AFF',
        fontWeight: '600',
    },
});
