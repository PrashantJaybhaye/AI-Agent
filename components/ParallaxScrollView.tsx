import { sessions } from "@/utils/sessions";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { PropsWithChildren, ReactNode, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollOffset,
} from "react-native-reanimated";
import Button from "./Button";

export const blurhash = "L6D]4w~q4n?b?bD%IUM{4n-;M{Rj";
const HEADER_HEIGHT = 410;

type ParallaxScrollViewProps = PropsWithChildren<{
    headerRight?: ReactNode;
    featuredSession?: (typeof sessions)[0];
}>;

export default function ParallaxScrollView({
    children,
    headerRight,
    featuredSession,
}: ParallaxScrollViewProps) {
    const router = useRouter();
    const todaySession = useMemo(
        () =>
            featuredSession || sessions[Math.floor(Math.random() * sessions.length)],
        [featuredSession],
    );
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffset = useScrollOffset(scrollRef);

    const headerAnimatedStyle = useAnimatedStyle(() => {
        const translateY =
            scrollOffset.value <= 0
                ? interpolate(
                    scrollOffset.value,
                    [-HEADER_HEIGHT, 0],
                    [-HEADER_HEIGHT / 2, 0],
                )
                : 0;

        const scale =
            scrollOffset.value <= 0
                ? interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0], [2, 1])
                : 1;

        return {
            transform: [
                {
                    translateY,
                },
                {
                    scale,
                },
            ],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
                scrollEventThrottle={16}
            >
                <Animated.View style={headerAnimatedStyle}>
                    <Image
                        source={todaySession.image}
                        placeholder={blurhash}
                        style={{ width: "100%", height: HEADER_HEIGHT }}
                        cachePolicy="memory-disk"
                        allowDownscaling={true}
                        transition={200}
                    />
                </Animated.View>
                <LinearGradient
                    colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.55)"]}
                    style={styles.headerContainer}
                >
                    <View style={{ flex: 1 }} />

                    <View style={styles.headerContent}>
                        <BlurView
                            intensity={20}
                            tint="light"
                            style={styles.subtitleContainer}
                        >
                            <Text style={styles.headerSubtitle}>FEATURED SESSION</Text>
                        </BlurView>
                        <Text style={styles.headerTitle}>{todaySession.title}</Text>
                        <Text style={styles.headerDescription}>
                            {todaySession.description}
                        </Text>
                        <Button
                            onPress={() =>
                                router.push({
                                    pathname: "/session/[sessionId]",
                                    params: { sessionId: todaySession.id },
                                })
                            }
                        >
                            <Text style={styles.buttonText}>Start Session</Text>
                        </Button>
                        <View style={{ flex: 1 }} />
                    </View>
                </LinearGradient>
                {children}
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    buttonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 13,
        letterSpacing: 0.5,
    },
    subtitleContainer: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: "transparent",
        borderWidth: 0.5,
        borderColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 20,
        marginBottom: 6,
        overflow: "hidden",
        alignSelf: "center",
    },
    headerSubtitle: {
        fontSize: 10,
        color: "white",
        fontWeight: "700",
        letterSpacing: 2,
    },
    headerTitle: {
        fontSize: 38,
        fontWeight: "700",
        color: "white",
        textAlign: "center",
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    headerDescription: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.9)",
        textAlign: "center",
        marginBottom: 20,
        maxWidth: "80%",
        lineHeight: 22,
    },
    headerContainer: {
        position: "absolute",
        width: "100%",
        height: HEADER_HEIGHT,
    },
    headerLeftGlassContainer: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
    },
    headerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    headerRightContainer: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
    },
    glassBadge: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 20,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        overflow: "hidden",
    },
    glassText: {
        color: "#FFFFFF",
        fontWeight: "700",
        letterSpacing: 0.5,
    },
});
