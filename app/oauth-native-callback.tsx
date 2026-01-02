import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function OAuthCallback() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    useEffect(() => {


        if (!isLoaded) {

            return;
        }

        // Small delay to ensure session is fully activated
        const timer = setTimeout(() => {

            if (isSignedIn) {

                router.replace("/(protected)/(tabs)");
            } else {

                router.replace("/(public)");
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [isSignedIn, isLoaded]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});
