import { useUserContext } from "@/context/UserContext";
import { addBreathingExerciseAchievement } from "@/utils/achievements";
import { colors } from "@/utils/colors";
import { saveStreakEntry } from "@/utils/streak";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Text as RNText,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedProps,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Button from "./Button";
import ExerciseCompletionScreen from "./ExerciseCompletionScreen";

const { width } = Dimensions.get("window");
const BLOB_SIZE = width * 1.5;

interface BreathingExerciseProps {
    session?: {
        title?: string;
        accentColor?: string;
        duration?: string;
        audioUri?: string;
        playAudio?: string; // Receive as string from params
    };
}

export default function BreathingExercise({ session }: BreathingExerciseProps) {
    const router = useRouter();
    const { userData } = useUserContext();
    const insets = useSafeAreaInsets();
    const progress = useSharedValue(0);
    const isInhaling = useSharedValue(true);
    const [instruction, setInstruction] = useState("Breathe in");
    const [showCompletion, setShowCompletion] = useState(false);
    const [achievementEarned, setAchievementEarned] = useState<
        | {
            title: string;
            description: string;
            icon: keyof typeof Ionicons.glyphMap;
        }
        | undefined
    >(undefined);
    const [isSkipping, setIsSkipping] = useState(false);

    // Timer Logic
    const durationString = session?.duration || "3 min";
    const initialSeconds = parseInt(durationString) * 60;
    const [remainingSeconds, setRemainingSeconds] = useState(
        initialSeconds || 180,
    );

    const blobColor = session?.accentColor || colors.teal;

    // Audio State
    const [isAudioEnabled, setIsAudioEnabled] = useState(
        session?.playAudio === "true",
    );
    // Audio State handled by expo-audio hook
    const player = useAudioPlayer(session?.audioUri || null);

    useEffect(() => {
        if (player) {
            player.loop = true;
            player.volume = 0.5;
            if (isAudioEnabled) {
                player.play();
            }
        }
    }, [player]);

    // Handle Mute/Unmute
    useEffect(() => {
        if (player) {
            if (isAudioEnabled) {
                player.play();
            } else {
                player.pause();
            }
        }
    }, [isAudioEnabled, player]);

    const toggleAudio = () => {
        setIsAudioEnabled((prev) => !prev);
    };

    const handleSessionComplete = async () => {
        if (!userData?.uid) {
            console.error("No user ID available");
            return;
        }

        try {
            const actualDurationSeconds = initialSeconds;

            await saveStreakEntry({
                userId: userData.uid,
                sessionType: "breathing",
                sessionTitle: session?.title || "Breathing Exercise",
                sessionDetails: {
                    duration_minutes: parseInt(session?.duration || "3"),
                    accent_color: session?.accentColor,
                    audio_enabled: isAudioEnabled,
                },
                totalDurationSeconds: actualDurationSeconds,
            });

            const achievementResult = await addBreathingExerciseAchievement(
                userData.uid,
            );

            // Check if a new achievement was earned
            if (achievementResult?.newlyAwarded) {
                setAchievementEarned({
                    title: "First Breath",
                    description: "Completed your first breathing exercise",
                    icon: "trophy",
                });
            }

            console.log("✅ Session data saved and achievement checked");
        } catch (error) {
            console.error("Error saving session data:", error);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSessionComplete().then(() => {
                        setShowCompletion(true);
                        // Stop audio when showing completion
                        if (player) {
                            player.pause();
                        }
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const duration = 5000;
        progress.value = withRepeat(
            withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
            -1,
            true,
        );

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    useDerivedValue(() => {
        if (isInhaling.value && progress.value >= 0.95) {
            isInhaling.value = false;
            runOnJS(setInstruction)("Breathe out");
        } else if (!isInhaling.value && progress.value <= 0.05) {
            isInhaling.value = true;
            runOnJS(setInstruction)("Breathe in");
        }
    });

    const blobAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(progress.value, [0, 1], [50, -100]);
        const scale = interpolate(progress.value, [0, 1], [1, 1.15]);
        return {
            transform: [{ translateY }, { scale }],
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                progress.value,
                [0, 0.05, 0.95, 1],
                [0.5, 1, 1, 0.5],
            ),
        };
    });

    // Face Animation - slightly look up/down or stretch
    const faceAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(progress.value, [0, 1], [0, -10]);
        const scaleY = interpolate(progress.value, [0, 1], [1, 1.05]);
        return {
            transform: [{ translateY }, { scaleY }],
        };
    });

    // Mouth Animation - smile grows during inhale, shrinks during exhale
    const mouthAnimatedProps = useAnimatedProps(() => {
        // When breathing in (progress 0->1), smile gets bigger (more curve)
        // When breathing out (progress 1->0), smile gets smaller
        const smileIntensity = interpolate(progress.value, [0, 1], [85, 105]);
        return {
            d: `M 40 80 Q 80 ${smileIntensity} 120 80`,
        };
    });

    // Show completion screen when exercise is done
    if (showCompletion) {
        return (
            <ExerciseCompletionScreen
                sessionTitle={session?.title || "Breathing Exercise"}
                durationMinutes={parseInt(session?.duration || "3")}
                accentColor={blobColor}
                achievement={achievementEarned}
                onComplete={() => router.back()}
            />
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + 10 }]}
                onPress={() => router.back()}
                activeOpacity={0.7}
            >
                <BlurView intensity={100} tint="extraLight" style={styles.blurContent}>
                    <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
                </BlurView>
            </TouchableOpacity>

            {session?.audioUri && (
                <TouchableOpacity
                    style={[styles.audioButton, { top: insets.top + 10 }]}
                    onPress={toggleAudio}
                    activeOpacity={0.7}
                >
                    <BlurView
                        intensity={100}
                        tint="extraLight"
                        style={styles.blurContent}
                    >
                        <Ionicons
                            name={isAudioEnabled ? "volume-high" : "volume-mute"}
                            size={24}
                            color="#1a1a1a"
                        />
                    </BlurView>
                </TouchableOpacity>
            )}

            {/* Admin Skip Button */}
            {userData?.isAdmin && (
                <View
                    style={[
                        styles.skipButtonContainer,
                        { top: insets.top + (session?.audioUri ? 70 : 10) },
                    ]}
                >
                    <Button
                        disabled={isSkipping}
                        onPress={() => {
                            if (isSkipping) return;
                            setIsSkipping(true);
                            handleSessionComplete().then(() => {
                                setShowCompletion(true);
                                if (player) {
                                    player.pause();
                                }
                                setIsSkipping(false);
                            });
                        }}
                    >
                        {isSkipping ? "Skipping..." : "Skip"}
                    </Button>
                </View>
            )}

            <View style={styles.textContainer}>
                {session?.title && (
                    <RNText style={styles.sessionTitle}>{session.title}</RNText>
                )}
                <Animated.Text style={[styles.instructionText, textAnimatedStyle]}>
                    {instruction}
                </Animated.Text>
                <RNText style={styles.timerText}>{formatTime(remainingSeconds)}</RNText>
            </View>

            <Animated.View style={[styles.blobContainer, blobAnimatedStyle]}>
                <View style={[styles.blob, { backgroundColor: blobColor }]} />
                <Animated.View style={[styles.faceContainer, faceAnimatedStyle]}>
                    <Svg height="100" width="160" viewBox="0 0 160 100">
                        {/* Left Eye */}
                        <Path
                            d="M 30 50 Q 50 65 70 50"
                            fill="none"
                            stroke="#5C5C5C"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                        {/* Right Eye */}
                        <Path
                            d="M 90 50 Q 110 65 130 50"
                            fill="none"
                            stroke="#5C5C5C"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                        {/* Mouth - Animated Smile */}
                        <AnimatedPath
                            animatedProps={mouthAnimatedProps}
                            fill="none"
                            stroke="#5C5C5C"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                    </Svg>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "space-between",
        overflow: "hidden",
    },
    textContainer: {
        marginTop: 100,
        alignItems: "center",
        zIndex: 10,
    },
    instructionText: {
        fontSize: 28,
        fontWeight: "600",
        color: "#4a4a4a",
        letterSpacing: 0.5,
    },
    sessionTitle: {
        fontSize: 18,
        color: "#666",
        marginBottom: 8,
        fontWeight: "500",
    },
    timerText: {
        marginTop: 12,
        fontSize: 16,
        color: "#888",
        fontWeight: "500",
        fontVariant: ["tabular-nums"],
    },
    blobContainer: {
        width: BLOB_SIZE,
        height: BLOB_SIZE,
        position: "absolute",
        bottom: -BLOB_SIZE * 0.6,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    blob: {
        width: "100%",
        height: "100%",
        borderRadius: BLOB_SIZE / 2,
        backgroundColor: colors.teal,
    },
    faceContainer: {
        position: "absolute",
        top: 50, // Adjust to place face on top of the blob
    },
    backButton: {
        position: "absolute",
        left: 20,
        zIndex: 50,
        borderRadius: 50,
        overflow: "hidden",
    },
    // New Audio Button Styles
    audioButton: {
        position: "absolute",
        right: 20,
        zIndex: 50,
        borderRadius: 50,
        overflow: "hidden",
    },
    skipButtonContainer: {
        position: "absolute",
        right: 20,
        zIndex: 50,
    },
    blurContent: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.2)", // Subtle fill
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
});
