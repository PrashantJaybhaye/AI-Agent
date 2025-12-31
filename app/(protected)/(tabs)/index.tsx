import ParallaxScrollView, { blurhash } from "@/components/ParallaxScrollView";
import { sessions } from "@/utils/sessions";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export default function Index() {
    const router = useRouter();

    // Select the session to be featured in the banner
    // You can change this logic to pick a random one or based on date
    const todaySession = useMemo(() => sessions[Math.floor(Math.random() * sessions.length)], []);

    // Filter out the featured session from the explore list
    const exploreSessions = useMemo(() => sessions.filter(s => s.id !== todaySession.id), [todaySession]);

    return (
        <ParallaxScrollView featuredSession={todaySession}>
            <View style={styles.header}>
                <Text style={styles.title}>Explore Sessions</Text>
                <Text style={styles.subtitle}>Discover your path to mindfulness</Text>
            </View>
            <FlashList<typeof sessions[0]>
                data={exploreSessions}
                renderItem={renderSessionItem}
                keyExtractor={(item) => item.id.toString()}
                // @ts-ignore
                estimatedItemSize={172} // 160 + 12
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={SessionSeparator}
            />
            <View style={{ height: 40 }} />
        </ParallaxScrollView>
    );
}

const SessionSeparator = () => <View style={{ width: 12 }} />;

const renderSessionItem = ({ item: session }: { item: typeof sessions[0] }) => (
    <SessionItem session={session} />
);

const SessionItem = ({ session }: { session: typeof sessions[0] }) => {
    const router = useRouter();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.sessionContainerWrapper, animatedStyle]}>
            <Pressable
                style={styles.sessionContainer}
                onPress={() =>
                    router.navigate({
                        pathname: "/session/[sessionId]",
                        params: { sessionId: session.id },
                    })
                }
                onPressIn={() => (scale.value = withSpring(0.95))}
                onPressOut={() => (scale.value = withSpring(1))}
            >
                <Image
                    source={session.image}
                    style={styles.sessionImage}
                    contentFit="cover"
                    transition={100}
                    placeholder={{ blurhash }}
                    cachePolicy="memory-disk"
                    allowDownscaling={true}
                />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
                    style={styles.gradientOverlay}
                >
                    <View style={styles.textContent}>
                        <Text style={styles.sessionTitle} numberOfLines={2}>
                            {session.title}
                        </Text>
                        <Text style={styles.sessionDescription} numberOfLines={1}>
                            {session.description}
                        </Text>
                    </View>
                    <View style={styles.playButton}>
                        <Ionicons name="play" size={16} color="white" style={{ marginLeft: 2 }} />
                    </View>
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingBottom: 12,
        paddingTop: 24,
    },
    title: {
        fontSize: 25,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 2,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        color: "#666",
        fontWeight: "500",
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    sessionContainerWrapper: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    sessionContainer: {
        width: 160,
        height: 160,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: '#F0F0F0',
    },
    sessionImage: {
        width: "100%",
        height: "100%",
    },
    gradientOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    textContent: {
        flex: 1,
        marginRight: 8,
        gap: 2,
    },
    sessionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "white",
        lineHeight: 20,
    },
    sessionDescription: {
        fontSize: 11,
        color: "rgba(255, 255, 255, 0.8)",
        fontWeight: "500",
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
});
