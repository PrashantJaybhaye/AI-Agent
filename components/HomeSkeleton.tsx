import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 410;

const SkeletonBlock = ({ style }: { style: any }) => {
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

    return <Animated.View style={[styles.block, style, animatedStyle]} />;
};

export const HomeSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Hero Section Skeleton */}
            <View style={styles.heroContainer}>
                <SkeletonBlock style={styles.heroImage} />
                <View style={styles.heroContent}>
                    <SkeletonBlock style={styles.heroSubtitle} />
                    <SkeletonBlock style={styles.heroTitle} />
                    <SkeletonBlock style={styles.heroDescription} />
                    <SkeletonBlock style={styles.heroButton} />
                </View>
            </View>

            <View style={styles.contentContainer}>
                {/* Header Text Skeleton */}
                <View style={styles.header}>
                    <SkeletonBlock style={styles.title} />
                    <SkeletonBlock style={styles.subtitle} />
                </View>

                {/* Horizontal List Skeleton */}
                <View style={styles.horizontalList}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <View key={index} style={styles.cardContainer}>
                            <SkeletonBlock style={styles.cardImage} />
                        </View>
                    ))}
                </View>

                {/* Section Header Skeleton */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <SkeletonBlock style={styles.sectionTitle} />
                    <SkeletonBlock style={styles.sectionSubtitle} />
                </View>

                {/* Vertical List Skeleton */}
                <View style={styles.verticalList}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <View key={index} style={styles.row}>
                            <SkeletonBlock style={styles.thumbnail} />
                            <View style={styles.rowContent}>
                                <SkeletonBlock style={styles.rowTitle} />
                                <SkeletonBlock style={styles.rowSubtitle} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9FB",
    },
    block: {
        backgroundColor: "#E1E9EE",
    },
    heroContainer: {
        height: HEADER_HEIGHT,
        width: "100%",
        position: "relative",
        marginBottom: 24,
    },
    heroImage: {
        width: "100%",
        height: "100%",
    },
    heroContent: {
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: "center",
        paddingHorizontal: 20,
        gap: 12,
    },
    heroSubtitle: {
        width: 100,
        height: 20,
        borderRadius: 10,
    },
    heroTitle: {
        width: "70%",
        height: 40,
        borderRadius: 8,
    },
    heroDescription: {
        width: "90%",
        height: 16,
        borderRadius: 4,
    },
    heroButton: {
        width: 140,
        height: 44,
        borderRadius: 22,
        marginTop: 12,
    },
    contentContainer: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 12,
    },
    title: {
        width: 180,
        height: 30,
        borderRadius: 6,
        marginBottom: 8,
    },
    subtitle: {
        width: 220,
        height: 16,
        borderRadius: 4,
    },
    horizontalList: {
        flexDirection: "row",
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 12,
        overflow: "hidden",
    },
    cardContainer: {
        width: 160,
        height: 160,
        borderRadius: 20,
        overflow: "hidden",
    },
    cardImage: {
        width: "100%",
        height: "100%",
    },
    sectionHeader: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    sectionTitle: {
        width: 100,
        height: 30,
        borderRadius: 6,
        marginBottom: 8,
    },
    sectionSubtitle: {
        width: 150,
        height: 16,
        borderRadius: 4,
    },
    verticalList: {
        paddingHorizontal: 24,
        gap: 16,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    rowContent: {
        flex: 1,
        marginLeft: 16,
        gap: 8,
    },
    rowTitle: {
        width: "70%",
        height: 18,
        borderRadius: 4,
    },
    rowSubtitle: {
        width: "40%",
        height: 14,
        borderRadius: 4,
    },
});
