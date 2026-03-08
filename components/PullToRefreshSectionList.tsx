import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    SectionList as RNSectionList,
    SectionListProps,
    StyleSheet,
    View,
} from "react-native";
import {
    Gesture,
    GestureDetector,
    createNativeWrapper,
} from "react-native-gesture-handler";
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    type SharedValue,
} from "react-native-reanimated";

// ----------------------------------------------------------------------
// Reusable Types & Interfaces
// ----------------------------------------------------------------------

interface PullToRefreshSectionListProps<ItemT, SectionT>
    extends SectionListProps<ItemT, SectionT> {
    onRefresh: () => Promise<void>;
    topOffset?: number;
    refreshColor?: string;
}

// ----------------------------------------------------------------------
// Constants / Config
// ----------------------------------------------------------------------

const PULL_THRESHOLD = 90;
const REFRESH_HEIGHT = 70;
const SPRING_CONFIG = {
    damping: 30,
    stiffness: 100,
    mass: 1,
    overshootClamping: true,
};

// ----------------------------------------------------------------------
// Internal Components
// ----------------------------------------------------------------------

const RefreshIndicator = ({
    pullY,
    state,
    topOffset,
    refreshColor,
}: {
    pullY: SharedValue<number>;
    state: "idle" | "pulling" | "refreshing" | "done";
    topOffset: number;
    refreshColor: string;
}) => {
    // 1. Container Style
    const containerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            pullY.value,
            [15, 50],
            [0, 1],
            Extrapolation.CLAMP
        );
        const translateY = interpolate(
            pullY.value,
            [0, PULL_THRESHOLD],
            [-60, 20],
            Extrapolation.EXTEND
        );

        return {
            opacity,
            transform: [{ translateY }],
            top: topOffset, // Align using the passed offset
        };
    });

    // 2. Icon Rotation
    const arrowStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            pullY.value,
            [0, PULL_THRESHOLD],
            [0, 180],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ rotate: `${rotate}deg` }],
            opacity: state === "refreshing" || state === "done" ? 0 : 1,
        };
    });

    // 3. Spinner / Done Scale
    const statusIconStyle = useAnimatedStyle(() => {
        const scale = state === "refreshing" || state === "done" ? 1 : 0;
        return {
            transform: [{ scale: withSpring(scale) }],
            opacity: state === "refreshing" || state === "done" ? 1 : 0,
            position: "absolute",
        };
    });

    return (
        <Animated.View style={[styles.indicatorContainer, containerStyle]}>
            <View style={styles.indicatorCircle}>
                <Animated.View style={arrowStyle}>
                    <Ionicons name="arrow-down" size={20} color={refreshColor} />
                </Animated.View>

                <Animated.View style={statusIconStyle}>
                    {state === "done" ? (
                        <Ionicons name="checkmark" size={22} color={refreshColor} />
                    ) : (
                        <ActivityIndicator size="small" color={refreshColor} />
                    )}
                </Animated.View>
            </View>
        </Animated.View>
    );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

// Create a GestureHandler-aware SectionList
const WrappedSectionList = createNativeWrapper(RNSectionList, {});
const AnimatedSectionList = Animated.createAnimatedComponent(WrappedSectionList);

export function PullToRefreshSectionList<ItemT, SectionT>({
    onRefresh,
    topOffset = 0,
    refreshColor = "#111827",
    contentContainerStyle,
    style,
    ...props
}: PullToRefreshSectionListProps<ItemT, SectionT>) {
    const [refreshState, setRefreshState] = useState<
        "idle" | "pulling" | "refreshing" | "done"
    >("idle");

    const pullY = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    // Ref for the list to coordinate gestures
    const listRef = useRef<any>(null);

    // --------------------------------------------------
    // Logic
    // --------------------------------------------------

    const hapticImpact = (style: Haptics.ImpactFeedbackStyle) => {
        runOnJS(Haptics.impactAsync)(style);
    };

    const handleRefreshComplete = useCallback(() => {
        setRefreshState("done");
        setTimeout(() => {
            pullY.value = withSpring(0, SPRING_CONFIG, (finished) => {
                if (finished) {
                    runOnJS(setRefreshState)("idle");
                }
            });
        }, 800);
    }, []);

    const triggerRefresh = useCallback(async () => {
        if (refreshState === "refreshing") return;

        setRefreshState("refreshing");
        hapticImpact(Haptics.ImpactFeedbackStyle.Heavy);
        pullY.value = withSpring(REFRESH_HEIGHT, SPRING_CONFIG);

        try {
            await onRefresh();
            handleRefreshComplete();
        } catch (e) {
            console.error(e);
            pullY.value = withSpring(0);
            setRefreshState("idle");
        }
    }, [onRefresh, refreshState]);

    // --------------------------------------------------
    // Gestures & scroll
    // --------------------------------------------------

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const panGesture = Gesture.Pan()
        // Combine with the List's native scroll gesture
        .simultaneousWithExternalGesture(listRef)
        .onStart(() => {
            // No strict conditions here, evaluate in onUpdate for smoother catching
        })
        .onUpdate((e) => {
            // Active if we are at the top (or negative scroll on iOS) and pulling down
            // On Android, scrollY stays 0 when stopped at top.
            // e.translationY > 0 means pulling DOWN.

            const isAtTop = scrollY.value <= 1; // Tolerance for floating point
            const isPullingDown = e.translationY > 0;

            if (isAtTop && isPullingDown) {
                // We are pulling the refresher
                isDragging.value = true;

                // Apply friction
                const friction = 0.55;
                pullY.value = e.translationY * friction;
            } else {
                // We are scrolling normally or not at top
                isDragging.value = false;
                pullY.value = 0;
            }
        })
        .onEnd(() => {
            if (isDragging.value) {
                isDragging.value = false;
                if (pullY.value > PULL_THRESHOLD) {
                    runOnJS(triggerRefresh)();
                } else {
                    pullY.value = withSpring(0, SPRING_CONFIG);
                }
            }
        });

    // Haptic Trigger
    useAnimatedReaction(
        () => pullY.value,
        (current, previous) => {
            if (
                previous !== null &&
                current > PULL_THRESHOLD &&
                previous <= PULL_THRESHOLD &&
                isDragging.value
            ) {
                runOnJS(hapticImpact)(Haptics.ImpactFeedbackStyle.Heavy);
            }
        }
    );

    // --------------------------------------------------
    // Styles
    // --------------------------------------------------

    const listAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: pullY.value }],
    }));

    const AnimatedSectionListAny = AnimatedSectionList as any;

    return (
        <View style={styles.container}>
            <RefreshIndicator
                pullY={pullY}
                state={refreshState}
                topOffset={topOffset}
                refreshColor={refreshColor}
            />

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.flexOne, listAnimatedStyle]}>
                    <AnimatedSectionListAny
                        ref={listRef}
                        {...props}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        bounces={false}
                        contentContainerStyle={contentContainerStyle}
                    />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: "hidden",
    },
    flexOne: {
        flex: 1,
    },
    indicatorContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 0,
    },
    indicatorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
});
