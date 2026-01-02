import { dailyRecommendations } from "@/utils/sessions";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

    // Reset on Focus
    useFocusEffect(
        useCallback(() => {
            setIsLoading(false);
            loadingRef.current = false;
            slideAnim.setValue(0);
        }, [slideAnim])
    );

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
                const newX = Math.max(0, Math.min(MAX_SLIDE, gestureState.dx));
                slideAnim.setValue(newX);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (loadingRef.current) return;

                if (gestureState.dx > MAX_SLIDE * 0.65) {
                    loadingRef.current = true;
                    setIsLoading(true);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    Animated.spring(slideAnim, {
                        toValue: MAX_SLIDE,
                        stiffness: 100, damping: 18, mass: 1, useNativeDriver: true,
                    }).start(() => {
                        handleStart();
                    });
                } else {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    Animated.spring(slideAnim, {
                        toValue: 0, stiffness: 150, damping: 16, mass: 0.9, useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

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
        router.push({ pathname: "/course/lecture", params: { courseId: course.id } });
    };

    const handleShare = async () => {
        try {
            await Share.share({ message: `Check out this course: ${course.title}` });
        } catch (error) { console.log(error); }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isLast = index === (details.syllabus?.length || 0) - 1;

        return (
            <View style={styles.listRow}>
                {/* Index / Status Column */}
                <View style={styles.indexCol}>
                    {item.isLocked ? (
                        <MaterialCommunityIcons name="lock-outline" size={16} color="#C7C7CC" />
                    ) : (
                        <View style={styles.playIndexBox}>
                            <Text style={styles.indexText}>{index + 1}</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <TouchableOpacity style={styles.listContent} activeOpacity={0.7} disabled={item.isLocked}>
                    <View style={styles.textContainer}>
                        <Text style={[styles.listTitle, !item.isLocked && styles.activeListTitle]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={styles.listSub}>{item.duration}</Text>
                    </View>
                    {!item.isLocked && (
                        <MaterialCommunityIcons name="play-circle-outline" size={24} color="#000" />
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    const StatPill = ({ icon, label }: { icon: any, label: string }) => (
        <View style={styles.statPill}>
            <Ionicons name={icon} size={14} color="#666" />
            <Text style={styles.statText}>{label}</Text>
        </View>
    );

    const headerContent = useMemo(() => (
        <View style={styles.headerWrapper}>
            {/* Hero Image */}
            <View style={styles.heroContainer}>
                <Image
                    source={course.image}
                    style={styles.heroImage}
                    contentFit="cover"
                    transition={500}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                    style={styles.heroGradient}
                />
                <View style={styles.heroTextContent}>
                    <View style={styles.badgeRow}>
                        <BlurView intensity={30} tint="light" style={styles.badge}>
                            <Text style={styles.badgeText}>{details.type.toUpperCase()}</Text>
                        </BlurView>
                        <BlurView intensity={30} tint="light" style={styles.badge}>
                            <Text style={styles.badgeText}>{details.difficulty}</Text>
                        </BlurView>
                    </View>
                    <Text style={styles.heroTitle}>{course.title}</Text>
                </View>
            </View>

            {/* Sheet Content */}
            <View style={styles.sheetContainer}>
                <View style={styles.handle} />

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <StatPill icon="time-outline" label={details.duration} />
                    <View style={styles.statDivider} />
                    <StatPill icon="people-outline" label={details.participants} />
                    <View style={styles.statDivider} />
                    <StatPill icon="book-outline" label={`${details.lessons} Lessons`} />
                </View>

                <View style={styles.divider} />

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About this Course</Text>
                    <Text style={styles.description} numberOfLines={isDescriptionExpanded ? undefined : 3}>
                        {details.fullDescription}
                    </Text>
                    <TouchableOpacity onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                        <Text style={styles.readMore}>{isDescriptionExpanded ? "Show Less" : "Read More"}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, { paddingBottom: 8, paddingTop: 32 }]}>
                    <View style={styles.curriculumHeader}>
                        <Text style={styles.sectionTitle}>Curriculum</Text>
                        <Text style={styles.itemCount}>{details.syllabus?.length} Episodes</Text>
                    </View>
                </View>
            </View>
        </View>
    ), [course, details, isDescriptionExpanded]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Navbar */}
            <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <BlurView intensity={50} tint="dark" style={styles.blurBtn}>
                        <Ionicons name="chevron-back" size={24} color="#FFF" />
                    </BlurView>
                </TouchableOpacity>
                <View style={styles.navRight}>
                    <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                        <BlurView intensity={50} tint="dark" style={styles.blurBtn}>
                            <Ionicons name="share-outline" size={22} color="#FFF" />
                        </BlurView>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <BlurView intensity={50} tint="dark" style={styles.blurBtn}>
                            <Ionicons name="heart-outline" size={22} color="#FFF" />
                        </BlurView>
                    </TouchableOpacity>
                </View>
            </View>

            {/* List */}
            <FlashList
                data={details.syllabus || []}
                renderItem={renderItem}
                //@ts-ignore
                estimatedItemSize={64}
                ListHeaderComponent={headerContent}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <BlurView intensity={30} tint="dark" style={styles.sliderTrack}>
                    <Text style={styles.sliderText}>Slide to start session</Text>
                    <Animated.View
                        style={[styles.sliderThumb, { transform: [{ translateX: slideAnim }] }]}
                        {...panResponder.panHandlers}
                    >
                        {isLoading ? <ActivityIndicator color="#000" /> : <Ionicons name="arrow-forward" size={24} color="#000" />}
                    </Animated.View>
                </BlurView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212", // Dark base
    },
    // Nav
    navBar: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 100,
    },
    navRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    blurBtn: {
        width: 44, height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    // Hero
    headerWrapper: {
        backgroundColor: '#FFF',
    },
    heroContainer: {
        height: 420,
        width: '100%',
        backgroundColor: '#000',
    },
    heroImage: {
        width: '100%', height: '100%',
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    heroTextContent: {
        position: 'absolute',
        bottom: 48,
        left: 20,
        right: 20,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    heroTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    // Sheet
    sheetContainer: {
        marginTop: -32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        backgroundColor: '#FFF',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E5EA',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    // Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3A3A3C',
    },
    statDivider: {
        width: 1,
        height: 14,
        backgroundColor: '#E5E5EA',
        marginHorizontal: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#F2F2F7',
        marginBottom: 24,
    },
    // Content
    section: {
        marginBottom: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: '#666',
    },
    readMore: {
        color: '#007AFF',
        fontWeight: '600',
        marginTop: 6,
        fontSize: 15,
    },
    // Curriculum
    curriculumHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    itemCount: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500',
    },
    // List
    listContainer: {
        paddingBottom: 120,
        backgroundColor: '#FFF',
    },
    listRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    indexCol: {
        width: 32,
        alignItems: 'center',
    },
    playIndexBox: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
    },
    indexText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
    },
    listContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        marginRight: 10,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#AAA', // Locked state
    },
    activeListTitle: {
        color: '#000',
        fontWeight: '600',
    },
    listSub: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 2,
    },
    // Footer
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
