import LectureVideoControls from "@/components/lecture/LectureVideoControls";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";
import { useUserContext } from "@/context/UserContext";
import { dailyRecommendations } from "@/utils/sessions";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IOS_BG = '#F2F2F7';
const PRIMARY_BLUE = '#007AFF';
const SEPARATOR_COLOR = '#C6C6C8';

export default function CourseLectureScreen() {
    const { courseId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userData } = useUserContext();

    // Capture portrait dimensions once on mount — avoids race conditions
    // with reactive hooks that report new values mid-rotation
    const portraitDims = useRef(() => {
        const { width, height } = Dimensions.get('screen');
        return {
            width: Math.min(width, height),   // portrait width  = shorter edge
            height: Math.max(width, height),   // portrait height = longer edge
        };
    }).current;

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showSubscription, setShowSubscription] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Playback Logic
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isBuffering, setIsBuffering] = useState(true);

    const isPremium = userData?.subscriptionPlan === 'premium';

    const parsedId = Array.isArray(courseId) ? parseInt(courseId[0], 10) : parseInt(courseId || "", 10);
    const course = dailyRecommendations.find((c) => c.id === parsedId);

    const syllabus = course?.courseDetails?.syllabus || [];
    const activeLesson = syllabus[currentLessonIndex];
    const videoSource = activeLesson?.videoUrl || null;

    // Helper to play next lesson
    const playNextLesson = () => {
        if (currentLessonIndex < syllabus.length - 1) {
            const nextIndex = currentLessonIndex + 1;
            const nextLesson = syllabus[nextIndex];
            const isLocked = nextLesson.isLocked && !isPremium;
            if (!isLocked) {
                setCurrentLessonIndex(nextIndex);
            }
        }
    };

    // Expo Video Player
    const player = useVideoPlayer(videoSource, (player) => {
        player.loop = false;
        player.play();
    });

    // Effect to handle listeners and auto-play logic
    useEffect(() => {
        const subPlaying = player.addListener('playingChange', (event) => {
            setIsPlaying(event.isPlaying);
            if (event.isPlaying) {
                setIsBuffering(false);
            }
        });

        const subEnd = player.addListener('playToEnd', () => {
            playNextLesson();
        });

        // Polling for progress (every 250ms)
        const interval = setInterval(() => {
            // expo-video properties are in seconds
            setPosition(player.currentTime * 1000);
            setDuration(player.duration * 1000);
        }, 250);

        return () => {
            subPlaying.remove();
            subEnd.remove();
            clearInterval(interval);
        };
    }, [player, currentLessonIndex]); // Re-bind if index changes (for playNextLesson closure)

    // Lock orientation to portrait on unmount
    useEffect(() => {
        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch((error) => {
                console.error('Failed to restore portrait orientation on unmount:', error);
            });
        };
    }, []);

    const handleBack = useCallback(async () => {
        if (isFullscreen) {
            // Restore portrait FIRST, then update state
            try {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                setIsFullscreen(false);
            } catch (error) {
                console.error('Failed to restore portrait on back:', error);
                setIsFullscreen(false);
            }
            return;
        }
        player.pause();
        router.back();
    }, [isFullscreen, player, router]);

    const handleLessonPress = (index: number) => {
        const lesson = syllabus[index];
        const isLocked = lesson.isLocked && !isPremium;
        if (isLocked) {
            setShowSubscription(true);
            return;
        }
        setCurrentLessonIndex(index);
    };

    const handlePlayPause = () => {
        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
    };

    const handleSeek = (newPosMillis: number) => {
        player.currentTime = newPosMillis / 1000;
    };

    const handleToggleFullscreen = useCallback(async () => {
        try {
            if (isFullscreen) {
                // Exit fullscreen → Portrait
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                setIsFullscreen(false);
            } else {
                // Enter fullscreen → Landscape
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
                setIsFullscreen(true);
            }
        } catch (error) {
            console.error('Failed to toggle fullscreen orientation:', error);
            // State is not changed on failure, so the UI stays consistent
        }
    }, [isFullscreen]);

    if (!course || !videoSource) return null;

    // Video dimensions — use stable portrait dims to avoid race conditions
    const pw = portraitDims().width;
    const ph = portraitDims().height;
    const videoWidth = isFullscreen ? ph : pw;            // landscape width = portrait height
    const videoHeight = isFullscreen ? pw : pw * (9 / 16); // landscape height = portrait width

    // Count locked lessons
    const lockedCount = syllabus.filter(s => s.isLocked).length;

    return (
        <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#000"
                hidden={isFullscreen}
            />

            {/* Video Container (Pinned Top) */}
            <View style={[
                styles.videoContainer,
                !isFullscreen && { paddingTop: insets.top },
                isFullscreen && styles.fullscreenVideoContainer,
            ]}>
                <View style={[
                    styles.videoWrapper,
                    isFullscreen
                        ? StyleSheet.absoluteFillObject
                        : { width: videoWidth, height: videoHeight },
                ]}>
                    <VideoView
                        player={player}
                        style={styles.video}
                        contentFit="cover"
                        nativeControls={false}
                    />

                    {/* Buffering Indicator */}
                    {isBuffering && !isPlaying && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator color="#FFF" size="large" />
                        </View>
                    )}

                    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                        <LectureVideoControls
                            title={activeLesson ? activeLesson.title : course.title}
                            isPlaying={isPlaying}
                            position={position}
                            duration={duration}
                            onPlayPause={handlePlayPause}
                            onSeek={handleSeek}
                            onBack={handleBack}
                            isFullscreen={isFullscreen}
                            onToggleFullscreen={handleToggleFullscreen}
                        />
                    </View>
                </View>
            </View>

            {/* Content below video (hidden in fullscreen) */}
            {!isFullscreen && (
                <>
                    {/* Fixed Meta Section (Non-scrollable) */}
                    <View style={styles.metaContainer}>
                        <View style={styles.metaHeader}>
                            <Text style={styles.courseTitle} numberOfLines={2}>
                                {activeLesson ? activeLesson.title : course.title}
                            </Text>
                            <TouchableOpacity style={styles.iconBtn}>
                                <MaterialCommunityIcons name="dots-horizontal" size={26} color={PRIMARY_BLUE} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.captionText}>
                            Episode {currentLessonIndex + 1}
                        </Text>

                        <TouchableOpacity onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                            <Text style={styles.descriptionText} numberOfLines={isDescriptionExpanded ? undefined : 2}>
                                {course.courseDetails?.fullDescription || course.description}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.compactActionBtn}>
                                <MaterialCommunityIcons name="calendar-clock-outline" size={20} color={PRIMARY_BLUE} />
                                <Text style={styles.actionText}>Schedule</Text>
                            </TouchableOpacity>
                            <View style={styles.verticalDivider} />
                            <TouchableOpacity style={styles.compactActionBtn}>
                                <MaterialCommunityIcons name="heart-outline" size={20} color={PRIMARY_BLUE} />
                                <Text style={styles.actionText}>Favorite</Text>
                            </TouchableOpacity>
                            <View style={styles.verticalDivider} />
                            <TouchableOpacity style={styles.compactActionBtn}>
                                <MaterialCommunityIcons name="script-text-outline" size={20} color={PRIMARY_BLUE} />
                                <Text style={styles.actionText}>Transcript</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Scrollable Syllabus List */}
                    <ScrollView
                        style={styles.contentScroll}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Premium Banner for non-subscribers */}
                        {!isPremium && lockedCount > 0 && (
                            <TouchableOpacity
                                style={styles.premiumBanner}
                                activeOpacity={0.7}
                                onPress={() => setShowSubscription(true)}
                            >
                                <View style={styles.premiumBannerInner}>
                                    <View style={styles.premiumBannerIcon}>
                                        <Ionicons name="lock-closed" size={16} color={PRIMARY_BLUE} />
                                    </View>
                                    <View style={styles.premiumBannerContent}>
                                        <Text style={styles.premiumBannerTitle}>
                                            {lockedCount} lessons locked
                                        </Text>
                                        <Text style={styles.premiumBannerSub}>
                                            Upgrade to unlock the full course
                                        </Text>
                                    </View>
                                    <View style={styles.premiumBannerAction}>
                                        <Text style={styles.premiumBannerActionText}>Upgrade</Text>
                                        <Ionicons name="chevron-forward" size={14} color={PRIMARY_BLUE} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}

                        <Text style={styles.sectionHeader}>UP NEXT</Text>

                        <View style={[styles.cardContainer, styles.listCard]}>
                            {syllabus.map((item, index) => {
                                const isCurrent = currentLessonIndex === index;
                                const isLocked = item.isLocked && !isPremium;
                                const isLast = index === syllabus.length - 1;

                                return (
                                    <View key={index}>
                                        <TouchableOpacity
                                            style={[
                                                styles.lessonRow,
                                                isCurrent && styles.activeRow,
                                                isLocked && styles.lockedRow,
                                            ]}
                                            activeOpacity={isLocked ? 0.7 : 0.6}
                                            onPress={() => handleLessonPress(index)}
                                        >
                                            <View style={styles.statusCol}>
                                                {isLocked ? (
                                                    <View style={styles.lockCircle}>
                                                        <Ionicons name="lock-closed" size={10} color="#8E8E93" />
                                                    </View>
                                                ) : isCurrent ? (
                                                    <MaterialCommunityIcons name="play" size={16} color={PRIMARY_BLUE} />
                                                ) : (
                                                    <Text style={styles.indexText}>{index + 1}</Text>
                                                )}
                                            </View>

                                            <View style={styles.contentCol}>
                                                <Text
                                                    style={[
                                                        styles.lessonTitle,
                                                        isCurrent && styles.activeTitle,
                                                        isLocked && styles.lockedTitle,
                                                    ]}
                                                    numberOfLines={1}
                                                >
                                                    {item.title}
                                                </Text>
                                                <Text style={[styles.durationText, isLocked && { color: '#C7C7CC' }]}>
                                                    {item.duration}
                                                </Text>
                                            </View>

                                            {isLocked ? (
                                                <View style={styles.proChip}>
                                                    <Ionicons name="lock-closed" size={9} color="#8E8E93" />
                                                    <Text style={styles.proChipText}>PRO</Text>
                                                </View>
                                            ) : (
                                                <MaterialCommunityIcons name="chevron-right" size={20} color="#C7C7CC" style={{ marginLeft: 4 }} />
                                            )}
                                        </TouchableOpacity>
                                        {!isLast && <View style={styles.separator} />}
                                    </View>
                                );
                            })}
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </>
            )}

            {/* Subscription Modal */}
            <SubscriptionModal
                visible={showSubscription}
                onClose={() => setShowSubscription(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: IOS_BG,
    },
    fullscreenContainer: {
        backgroundColor: '#000',
    },
    // Video
    videoContainer: {
        backgroundColor: '#000',
        zIndex: 100,
    },
    fullscreenVideoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoWrapper: {
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    // Content
    contentScroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    // Meta (No Card)
    metaContainer: {
        backgroundColor: '#FFF',
        padding: 16,
        paddingTop: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: SEPARATOR_COLOR,
    },
    // Cards
    cardContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    listCard: {
        padding: 0,
        overflow: 'hidden',
        marginHorizontal: 16,
        marginTop: 8,
    },
    // Meta Header
    metaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        flex: 1,
        marginRight: 8,
        letterSpacing: -0.4,
    },
    iconBtn: {
        padding: 4,
        marginTop: -4,
        marginRight: -4,
    },
    captionText: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#3A3A3C',
        marginBottom: 20,
    },
    // Action Row
    actionRow: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        padding: 8,
        alignItems: 'center',
    },
    compactActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '500',
        color: PRIMARY_BLUE,
    },
    verticalDivider: {
        width: 1,
        height: 16,
        backgroundColor: '#D1D1D6',
    },
    // Premium Banner
    premiumBanner: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    premiumBannerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    premiumBannerIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F5FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    premiumBannerContent: {
        flex: 1,
    },
    premiumBannerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    premiumBannerSub: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '400',
    },
    premiumBannerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    premiumBannerActionText: {
        fontSize: 13,
        fontWeight: '600',
        color: PRIMARY_BLUE,
    },
    // List
    sectionHeader: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6D6D72',
        marginBottom: 8,
        marginTop: 24,
        marginLeft: 20,
        textTransform: 'uppercase',
    },
    lessonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
    },
    activeRow: {
        backgroundColor: '#F2F2F7',
    },
    lockedRow: {
        backgroundColor: '#FAFAFA',
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: SEPARATOR_COLOR,
        marginLeft: 44,
    },
    statusCol: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#E5E5EA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indexText: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500',
    },
    contentCol: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 8,
    },
    lessonTitle: {
        fontSize: 14,
        color: '#000',
        flex: 1,
        marginRight: 8,
    },
    activeTitle: {
        fontWeight: '600',
        color: PRIMARY_BLUE,
    },
    lockedTitle: {
        color: '#B0B0B0',
    },
    durationText: {
        fontSize: 12,
        color: '#8E8E93',
    },
    proChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
        marginLeft: 6,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    proChipText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#8E8E93',
        letterSpacing: 0.5,
    },
});
