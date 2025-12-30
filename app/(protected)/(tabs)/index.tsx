import ParallaxScrollView, { blurhash } from "@/components/ParallaxScrollView";
import { sessions } from "@/utils/sessions";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
    const router = useRouter();

    return (
        <ParallaxScrollView>
            <Text style={styles.title}>Explore Sessions</Text>
            <FlashList<typeof sessions[0]>
                data={sessions}
                renderItem={renderSessionItem}
                keyExtractor={(item) => item.id.toString()}
                // @ts-ignore
                estimatedItemSize={266}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={SessionSeparator}
            />
            <View style={{ height: 40 }} />
        </ParallaxScrollView>
    );
}

const SessionSeparator = () => <View style={{ width: 16 }} />;

const renderSessionItem = ({ item: session }: { item: typeof sessions[0] }) => (
    <SessionItem session={session} />
);

const SessionItem = ({ session }: { session: typeof sessions[0] }) => {
    const router = useRouter();
    return (
        <Pressable
            style={styles.sessionContainer}
            onPress={() =>
                router.navigate({
                    pathname: "/session/[sessionId]",
                    params: { sessionId: session.id },
                })
            }
        >
            <Image
                source={session.image}
                style={styles.sessionImage}
                contentFit="cover"
                transition={200}
                placeholder={{ blurhash }}
                cachePolicy="memory-disk"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.5)']}
                style={styles.gradientOverlay}
            >
                <Text style={styles.sessionTitle}>{session.title}</Text>
            </LinearGradient>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "bold",
        padding: 16,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    sessionContainer: {
        position: "relative",
    },
    sessionImage: {
        width: 250,
        height: 140,
        borderRadius: 16,
        overflow: "hidden",
    },
    gradientOverlay: {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: 16,
        justifyContent: 'flex-end',
    },
    sessionTitle: {
        position: "absolute",
        width: "100%",
        bottom: 16,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
    },
});
