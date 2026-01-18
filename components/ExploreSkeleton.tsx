import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const SkeletonItem = () => {
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

    return (
        <View style={styles.itemContainer}>
            <Animated.View style={[styles.avatar, animatedStyle]} />
            <View style={styles.infoContainer}>
                <Animated.View style={[styles.namePlaceholder, animatedStyle]} />
                <Animated.View style={[styles.followersPlaceholder, animatedStyle]} />
            </View>
            <Animated.View style={[styles.buttonPlaceholder, animatedStyle]} />
        </View>
    );
};

interface ExploreSkeletonProps {
    itemCount?: number;
}

export const ExploreSkeleton = ({ itemCount = 8 }: ExploreSkeletonProps) => {
    return (
        <View style={styles.container}>
            {Array.from({ length: itemCount }).map((_, index) => (
                <SkeletonItem key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        gap: 16,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#E1E9EE",
    },
    infoContainer: {
        flex: 1,
        gap: 6,
    },
    namePlaceholder: {
        width: "60%",
        height: 16,
        borderRadius: 4,
        backgroundColor: "#E1E9EE",
    },
    followersPlaceholder: {
        width: "40%",
        height: 12,
        borderRadius: 4,
        backgroundColor: "#E1E9EE",
    },
    buttonPlaceholder: {
        width: 80,
        height: 32,
        borderRadius: 18,
        backgroundColor: "#E1E9EE",
    },
});
