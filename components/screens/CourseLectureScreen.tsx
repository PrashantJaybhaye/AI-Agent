import { dailyRecommendations } from "@/utils/sessions";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CourseLectureScreen() {
    const { courseId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const course = dailyRecommendations.find((c) => c.id === Number(courseId));

    const videoSource = course?.videoUrl || null;

    if (!course || !videoSource) {
        return (
            <View style={[styles.container, styles.center]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 20, left: 20 }]}>
                    <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={{ color: 'white' }}>No video available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <Video
                source={{ uri: videoSource }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping
            />

            <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.backBtn, { top: insets.top + 20, left: 20 }]}
            >
                <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    backBtn: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    }
});
