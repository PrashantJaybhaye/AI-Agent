import { dailyRecommendations } from "@/utils/sessions";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function CourseDetailScreen() {
    const { courseId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Data Guard
    const course = dailyRecommendations.find((c) => c.id === Number(courseId));
    const details = useMemo(() => course?.courseDetails || {
        participants: "0",
        type: "Course",
        duration: "N/A",
        lessons: 0,
        difficulty: "All Levels",
        fullDescription: course?.description || "",
        syllabus: [],
        whyRecommended: [],
    }, [course]);

    if (!course) return null;

    const handleStart = () => {
        router.push({ pathname: "/session/[sessionId]", params: { sessionId: course.id } });
    };

    const BentoHeader = () => (
        <View style={styles.bentoContainer}>
            {/* Row 1: Visual + Actions */}
            <View style={styles.rowOne}>
                <Animated.View entering={FadeInDown.delay(100)} style={styles.visualCard}>
                    <Image
                        source={course.image}
                        style={styles.imageFill}
                        contentFit="cover"
                        transition={300}
                    />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{details.type}</Text>
                    </View>
                </Animated.View>

                <View style={styles.actionColumn}>
                    <Animated.View entering={FadeInDown.delay(200)} style={{ flex: 1 }}>
                        <TouchableOpacity style={styles.playBlock} onPress={handleStart} activeOpacity={0.9}>
                            <Ionicons name="play" size={32} color="#FFF" />
                            <Text style={styles.playText}>START</Text>
                        </TouchableOpacity>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(300)}>
                        <TouchableOpacity style={styles.iconBlock}>
                            <Ionicons name="bookmark-outline" size={24} color="#000" />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>

            {/* Row 2: Title & Meta */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.titleCard}>
                <Text style={styles.bentoTitle} numberOfLines={2}>{course.title}</Text>

                <View style={styles.tagRow}>
                    <View style={styles.tag}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.tagText}>{details.duration}</Text>
                    </View>
                    <View style={styles.tag}>
                        <Ionicons name="layers-outline" size={14} color="#666" />
                        <Text style={styles.tagText}>{details.lessons} Items</Text>
                    </View>
                    <View style={styles.tag}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.tagText}>4.9</Text>
                    </View>
                </View>
            </Animated.View>

            {/* Row 3: Description */}
            <Animated.View entering={FadeInDown.delay(500)} style={styles.descCard}>
                <Text style={styles.descTitle}>ABOUT</Text>
                <Text style={styles.descBody} numberOfLines={3}>{details.fullDescription}</Text>
            </Animated.View>

            <Text style={styles.listHeading}>EPISODES</Text>
        </View>
    );

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <Animated.View entering={FadeInDown.delay(600 + (index * 50))}>
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
                <View style={styles.listIndex}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <View style={styles.listContent}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.duration}</Text>
                </View>
                <View style={styles.playMini}>
                    <Ionicons name="play" size={12} color="#000" />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Simple Top Bar */}
            <View style={[styles.navBar, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Course Details</Text>
                <TouchableOpacity style={styles.navBtn}>
                    <Ionicons name="share-social-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <FlashList
                data={details.syllabus || []}
                renderItem={renderItem}
                estimatedItemSize={72}
                ListHeaderComponent={BentoHeader}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F2", // Clean light gray
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    navBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    // Bento Layout
    bentoContainer: {
        paddingHorizontal: 20,
        paddingTop: 12,
        gap: 12,
        marginBottom: 24,
    },
    rowOne: {
        flexDirection: 'row',
        height: 220,
        gap: 12,
    },
    visualCard: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    imageFill: {
        width: '100%',
        height: '100%',
        backgroundColor: '#DDD',
    },
    badge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#000',
        textTransform: 'uppercase',
    },
    actionColumn: {
        width: 90,
        gap: 12,
    },
    playBlock: {
        flex: 1,
        backgroundColor: '#111',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    playText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    iconBlock: {
        height: 90,
        backgroundColor: '#FFF',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
    },
    bentoTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#000',
        marginBottom: 16,
        lineHeight: 28,
        letterSpacing: -0.5,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#444',
    },
    descCard: {
        backgroundColor: '#EBEBEB', // Slightly darker than background for contrast
        borderRadius: 24,
        padding: 20,
    },
    descTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#888',
        marginBottom: 8,
    },
    descBody: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        fontWeight: '500',
    },
    listHeading: {
        fontSize: 13,
        fontWeight: '700',
        color: '#888',
        marginTop: 12,
        marginLeft: 4,
        marginBottom: 8,
        letterSpacing: 1,
    },
    // List Item
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginBottom: 10,
        padding: 16,
        borderRadius: 20,
    },
    listIndex: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    indexText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#999',
    },
    listContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#888',
        fontWeight: '500',
    },
    playMini: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
