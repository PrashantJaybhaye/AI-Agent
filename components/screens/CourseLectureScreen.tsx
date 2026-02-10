import LectureVideoControls from "@/components/lecture/LectureVideoControls";
import { useUserContext } from "@/context/UserContext";
import { dailyRecommendations } from "@/utils/sessions";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

const IOS_BG = '#F2F2F7';
const PRIMARY_BLUE = '#007AFF';
const SEPARATOR_COLOR = '#C6C6C8';

export default function CourseLectureScreen() {
    const { courseId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userData } = useUserContext();

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    // Playback Logic
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isBuffering, setIsBuffering] = useState(true);

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
            const isLocked = nextLesson.isLocked && userData?.subscriptionPlan !== 'premium';
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

    const handleBack = () => {
        player.pause();
        router.back();
    };

    const handleLessonPress = (index: number) => {
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

    if (!course || !videoSource) return null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Video Container (Pinned Top) */}
            <View style={[styles.videoContainer, { paddingTop: insets.top }]}>
                <View style={styles.videoWrapper}>
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
                        />
                    </View>
                </View>
            </View>

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
                <Text style={styles.sectionHeader}>UP NEXT</Text>

                <View style={[styles.cardContainer, styles.listCard]}>
                    {syllabus.map((item, index) => {
                        const isCurrent = currentLessonIndex === index;
                        // Unlock if user is premium
                        const isLocked = item.isLocked && userData?.subscriptionPlan !== 'premium';
                        const isLast = index === syllabus.length - 1;

                        return (
                            <View key={index}>
                                <TouchableOpacity
                                    style={[
                                        styles.lessonRow,
                                        isCurrent && styles.activeRow
                                    ]}
                                    activeOpacity={isLocked ? 1 : 0.6}
                                    onPress={() => !isLocked && handleLessonPress(index)}
                                >
                                    <View style={styles.statusCol}>
                                        {isCurrent ? (
                                            <MaterialCommunityIcons name="play" size={16} color={PRIMARY_BLUE} />
                                        ) : (
                                            <Text style={styles.indexText}>{index + 1}</Text>
                                        )}
                                    </View>

                                    <View style={styles.contentCol}>
                                        <Text
                                            style={[styles.lessonTitle, isCurrent && styles.activeTitle]}
                                            numberOfLines={1}
                                        >
                                            {item.title}
                                        </Text>
                                        <Text style={styles.durationText}>{item.duration}</Text>
                                    </View>

                                    {isLocked && (
                                        <MaterialCommunityIcons name="lock-outline" size={14} color="#8E8E93" style={{ marginLeft: 8 }} />
                                    )}

                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#C7C7CC" style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                                {!isLast && <View style={styles.separator} />}
                            </View>
                        );
                    })}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: IOS_BG,
    },
    // Video
    videoContainer: {
        backgroundColor: '#000',
        zIndex: 100,
    },
    videoWrapper: {
        width: width,
        height: width * (9 / 16),
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
        // Shadow for depth
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
    // List
    sectionHeader: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6D6D72',
        marginBottom: 8,
        marginTop: 24,
        marginLeft: 20, // Align with inset
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
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: SEPARATOR_COLOR,
        marginLeft: 44, // Align with text
    },
    statusCol: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'center',
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
    durationText: {
        fontSize: 12,
        color: '#8E8E93',
    },
});
