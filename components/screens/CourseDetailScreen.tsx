import { dailyRecommendations } from "@/utils/sessions";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    PanResponder,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function CourseDetailScreen() {
    const { courseId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const loadingRef = React.useRef(false);

    // Slider State
    const slideAnim = React.useRef(new Animated.Value(0)).current;

    // Reset on Focus (coming back from details)
    useFocusEffect(
        useCallback(() => {
            setIsLoading(false);
            loadingRef.current = false;
            slideAnim.setValue(0);
        }, [slideAnim])
    );

    // Calculate total slide distance (screen width - padding - thumb width)
    const MAX_SLIDE = width - 48 - 48 - 14;

    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !loadingRef.current,
            onMoveShouldSetPanResponder: () => !loadingRef.current,
            onPanResponderGrant: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            },
            onPanResponderMove: (_, gestureState) => {
                if (loadingRef.current) return;
                // Clamp the value
                const newX = Math.max(0, Math.min(MAX_SLIDE, gestureState.dx));
                slideAnim.setValue(newX);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (loadingRef.current) return;

                if (gestureState.dx > MAX_SLIDE * 0.65) {
                    // Success detected
                    loadingRef.current = true;
                    setIsLoading(true);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    // Snap to end (Smooth Soft Spring)
                    Animated.spring(slideAnim, {
                        toValue: MAX_SLIDE,
                        stiffness: 100,
                        damping: 18,
                        mass: 1,
                        useNativeDriver: true,
                    }).start(() => {
                        // Trigger action after small delay for effect
                        handleStart();
                    });
                } else {
                    // Reset (Gentle Bounce)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        stiffness: 150,
                        damping: 16,
                        mass: 0.9,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    // Data Guard
    const course = dailyRecommendations.find((c) => c.id === Number(courseId));
    const details = useMemo(() => course?.courseDetails || {
        participants: "2.4k",
        type: "Course",
        duration: "N/A",
        lessons: 0,
        difficulty: "All Levels",
        fullDescription: course?.description || "",
        syllabus: [],
    }, [course]);

    if (!course) return null;

    const handleStart = () => {
        router.push({ pathname: "/session/[sessionId]", params: { sessionId: course.id } });
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this course: ${course.title}`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isLast = index === (details.syllabus?.length || 0) - 1;

        return (
            <View style={styles.timelineRow}>
                {/* Timeline Connector */}
                <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, index === 0 && styles.activeDot]}>
                        {index === 0 && <View style={styles.innerDot} />}
                    </View>
                    {!isLast && <View style={styles.timelineLine} />}
                </View>

                <TouchableOpacity style={styles.episodeStrip} activeOpacity={0.7}>
                    <View style={styles.episodeContent}>
                        <Text style={[styles.episodeTitle, index === 0 && styles.activeEpisodeTitle]}>
                            {item.title}
                        </Text>
                        <Text style={styles.episodeDuration}>
                            {String(index + 1).padStart(2, '0')} • {item.duration}
                        </Text>
                    </View>
                    <Ionicons
                        name={index === 0 ? "play-circle" : "lock-closed-outline"}
                        size={24}
                        color={index === 0 ? "#000" : "#CCC"}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    const GoodToKnowCard = ({ icon, title, description }: { icon: keyof typeof Ionicons.glyphMap, title: string, description: string }) => (
        <View style={styles.infoCard}>
            <View style={styles.infoIconBox}>
                <Ionicons name={icon} size={20} color="#1E1E1E" />
            </View>
            <View>
                <Text style={styles.infoCardTitle}>{title}</Text>
                <Text style={styles.infoCardDesc} numberOfLines={2}>{description}</Text>
            </View>
        </View>
    );

    const headerContent = useMemo(() => (
        <View style={styles.mainContent}>
            {/* Cinematic Hero */}
            <View style={styles.heroImageContainer}>
                <Image
                    source={course.image}
                    style={styles.heroImage}
                    contentFit="cover"
                    transition={500}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                    style={styles.heroGradient}
                />
                <View style={styles.heroContent}>
                    <View style={styles.tagRow}>
                        <View style={styles.blurTag}>
                            <Text style={styles.tagText}>{details.type}</Text>
                        </View>
                        <View style={styles.blurTag}>
                            <Text style={styles.tagText}>{details.lessons} Sessions</Text>
                        </View>
                    </View>
                    <Text style={styles.mainTitle}>{course.title}</Text>
                </View>
            </View>

            {/* White Sheet Content */}
            <View style={styles.sheetContainer}>
                <View style={styles.handleBar} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>About this course</Text>
                    <Text
                        style={styles.descriptionText}
                        numberOfLines={isDescriptionExpanded ? undefined : 3}
                    >
                        {details.fullDescription}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    >
                        <Text style={styles.readMoreText}>
                            {isDescriptionExpanded ? "Show Less" : "Read More"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollContent}
                >
                    <GoodToKnowCard
                        icon="trophy-outline"
                        title="Certificate"
                        description="Earn a certificate upon completion."
                    />
                    <GoodToKnowCard
                        icon="infinite-outline"
                        title="Lifetime Access"
                        description="Learn at your own pace, forever."
                    />
                    <GoodToKnowCard
                        icon="hardware-chip-outline"
                        title="AI Powered"
                        description="Personalized feedback on your progress."
                    />
                </ScrollView>

                <View style={styles.section}>
                    <View style={styles.syllabusHeaderRow}>
                        <Text style={styles.sectionHeader}>Curriculum</Text>
                        <Text style={styles.syllabusCount}>{details.syllabus?.length || 0} items</Text>
                    </View>
                </View>
            </View>
        </View>
    ), [course, details, isDescriptionExpanded]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header / Navbar */}
            <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
                    <BlurView intensity={40} tint="dark" style={styles.navBtnGlass}>
                        <Ionicons name="chevron-back" size={24} color="#FFF" />
                    </BlurView>
                </TouchableOpacity>
                <View style={styles.navActions}>
                    <TouchableOpacity onPress={handleShare} activeOpacity={0.8}>
                        <BlurView intensity={40} tint="dark" style={styles.navBtnGlass}>
                            <Ionicons name="share-outline" size={24} color="#FFF" />
                        </BlurView>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8}>
                        <BlurView intensity={40} tint="dark" style={styles.navBtnGlass}>
                            <Ionicons name="heart-outline" size={24} color="#FFF" />
                        </BlurView>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Scrollable Content */}
            <FlashList
                data={details.syllabus || []}
                renderItem={renderItem}
                // @ts-ignore
                estimatedItemSize={70}
                ListHeaderComponent={headerContent}
                contentContainerStyle={{ paddingBottom: 100, backgroundColor: "#FFF" }}
                showsVerticalScrollIndicator={false}
            />

            {/* Slide-to-Start Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <BlurView intensity={30} tint="dark" style={styles.sliderTrack}>
                    <Text style={styles.sliderText}>Slide to start session</Text>
                    <Animated.View
                        style={[
                            styles.sliderThumb,
                            {
                                transform: [{ translateX: slideAnim }]
                            }
                        ]}
                        {...panResponder.panHandlers}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Ionicons name="arrow-forward" size={24} color="#000" />
                        )}
                    </Animated.View>
                </BlurView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F7F4", // Creamy white
    },
    navBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 100,
    },
    navBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)', // Note: backdropFilter is web-only, but harmless here.
    },
    navBtnGlass: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: "hidden",
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)', // Slight tint for contrast
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    navActions: {
        flexDirection: 'row',
        gap: 12,
    },
    mainContent: {
        backgroundColor: "#000", // Dark bg behind sheet
    },
    heroImageContainer: {
        width: width,
        height: Dimensions.get('window').height * 0.55,
        backgroundColor: '#000',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        opacity: 0.9,
    },
    heroGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '80%',
    },
    heroContent: {
        position: 'absolute',
        bottom: 48, // Moved up to clear sheet
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    blurTag: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tagText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    mainTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -1,
        lineHeight: 40,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    sheetContainer: {
        marginTop: -40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        backgroundColor: '#FFF',
        paddingTop: 12,
        paddingBottom: 20,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E5EA',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    section: {
        paddingHorizontal: 24,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
        marginBottom: 8,
    },
    readMoreText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#007AFF',
    },
    // Good To Know 
    horizontalScrollContent: {
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 24,
    },
    infoCard: {
        width: 150,
        padding: 16,
        backgroundColor: '#F9F9F9',
        borderRadius: 20,
        justifyContent: 'space-between',
        height: 140,
    },
    infoIconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E1E1E',
        marginBottom: 4,
    },
    infoCardDesc: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    // Syllabus
    syllabusHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    syllabusCount: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },
    // Timeline Episode
    timelineRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 16,
        width: 20,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E0E0E0',
        marginTop: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeDot: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        width: 20,
        height: 20,
        borderRadius: 10,
        marginTop: 2,
    },
    innerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#000',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 4,
    },
    episodeStrip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 24,
    },
    episodeContent: {
        flex: 1,
        marginRight: 12,
    },
    episodeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    activeEpisodeTitle: {
        fontWeight: '700',
        color: '#000',
    },
    episodeDuration: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500',
    },
    // Footer (Slider Visual)
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 12,
        alignItems: 'center',
    },
    sliderTrack: {
        width: '100%',
        height: 64,
        borderRadius: 32,
        overflow: 'hidden', // Essential for BlurView
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        backgroundColor: 'rgba(20,20,20,0.7)', // Semi-transparent for blur
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        position: 'relative',
    },
    sliderThumb: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        zIndex: 2, // Above text
    },
    sliderText: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#AAA', // Lighter text for dark track
        letterSpacing: 0.5,
        zIndex: 1,
    },
});
