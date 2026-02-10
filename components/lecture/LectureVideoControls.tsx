import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, GestureResponderEvent, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

interface Props {
    title: string;
    isPlaying: boolean;
    position: number;
    duration: number;
    onPlayPause: () => void;
    onSeek: (position: number) => void;
    onBack: () => void;
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
}

const formatTime = (millis: number) => {
    if (!millis || millis < 0) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function LectureVideoControls({
    title,
    isPlaying,
    position,
    duration,
    onPlayPause,
    onSeek,
    onBack,
    isFullscreen = false,
    onToggleFullscreen,
}: Props) {
    const [isVisible, setIsVisible] = useState(true);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Seek State
    const [sliderWidth, setSliderWidth] = useState(0);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [scrubValue, setScrubValue] = useState(0);

    const resetTimer = () => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        if (!isVisible) {
            setIsVisible(true);
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        }

        if (isPlaying && !isScrubbing) {
            hideTimer.current = setTimeout(() => {
                setIsVisible(false);
                Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
            }, 3000);
        }
    };

    useEffect(() => {
        if (!isScrubbing) resetTimer();
        return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
    }, [isPlaying, isScrubbing]);

    const toggleControls = () => {
        if (isVisible) {
            setIsVisible(false);
            if (hideTimer.current) clearTimeout(hideTimer.current);
            Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
        } else {
            resetTimer();
        }
    };

    const handleSeekTap = (evt: GestureResponderEvent) => {
        if (sliderWidth > 0 && duration > 0) {
            const tapX = evt.nativeEvent.locationX;
            const progress = tapX / sliderWidth;
            const newPosition = progress * duration;
            onSeek(Math.floor(newPosition));
            resetTimer();
        }
    };

    const displayPosition = isScrubbing ? scrubValue : position;
    const progressPercent = duration > 0 ? Math.min(Math.max((displayPosition / duration) * 100, 0), 100) : 0;

    return (
        <TouchableWithoutFeedback onPress={toggleControls}>
            <View style={StyleSheet.absoluteFill}>

                {/* Dark Gradient Overlay */}
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]} pointerEvents="none">
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>

                {/* Top Header */}
                <Animated.View style={[styles.header, { opacity: fadeAnim }]} pointerEvents={isVisible ? 'auto' : 'none'}>
                    <TouchableOpacity onPress={onBack} style={styles.glassBtn}>
                        <BlurView intensity={20} tint="dark" style={styles.blurContainerBottom} />
                        <View style={styles.iconContainer}>
                            <Ionicons name={isFullscreen ? "close" : "chevron-back"} size={24} color="#FFF" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>

                    <TouchableOpacity style={styles.glassBtn}>
                        <BlurView intensity={20} tint="dark" style={styles.blurContainerBottom} />
                        <View style={styles.iconContainer}>
                            <Ionicons name="settings-outline" size={20} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Center Play Button & Skips */}
                <Animated.View style={[styles.centerContainer, { opacity: fadeAnim }]} pointerEvents={isVisible ? 'box-none' : 'none'}>
                    <View style={styles.centerRow}>
                        {/* Skip Back */}
                        <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={() => { onSeek(Math.max(0, position - 10000)); resetTimer(); }}
                        >
                            <Ionicons name="play-back" size={28} color="#FFF" />
                            <Text style={styles.skipText}>10</Text>
                        </TouchableOpacity>

                        {/* Play/Pause */}
                        <TouchableOpacity
                            onPress={() => {
                                onPlayPause();
                                resetTimer();
                            }}
                            activeOpacity={0.8}
                            style={styles.playBtnWrapper}
                        >
                            <BlurView intensity={30} tint="dark" style={styles.playButtonCircle}>
                                <Ionicons name={isPlaying ? "pause" : "play"} size={42} color="#FFF" style={{ marginLeft: isPlaying ? 0 : 4 }} />
                            </BlurView>
                        </TouchableOpacity>

                        {/* Skip Forward */}
                        <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={() => { onSeek(Math.min(duration, position + 10000)); resetTimer(); }}
                        >
                            <Text style={styles.skipText}>10</Text>
                            <Ionicons name="play-forward" size={28} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Bottom Controls */}
                <Animated.View style={[styles.bottomBar, { opacity: fadeAnim }]} pointerEvents={isVisible ? 'auto' : 'none'}>
                    <Text style={styles.timeText}>{formatTime(displayPosition)}</Text>

                    {/* Seek Bar */}
                    <TouchableWithoutFeedback onPress={handleSeekTap}>
                        <View
                            style={styles.sliderContainer}
                            onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                        >
                            <View style={styles.trackBg} />
                            <View style={[styles.trackFill, { width: `${progressPercent}%` }]} />
                            <View style={[styles.thumb, { left: `${progressPercent}%` }]} />
                        </View>
                    </TouchableWithoutFeedback>

                    <Text style={styles.timeText}>{formatTime(duration)}</Text>

                    {/* Fullscreen Toggle Button */}
                    {onToggleFullscreen && (
                        <TouchableOpacity
                            style={styles.fullscreenBtn}
                            onPress={() => {
                                onToggleFullscreen();
                                resetTimer();
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name={isFullscreen ? "contract-outline" : "expand-outline"}
                                size={20}
                                color="#FFF"
                            />
                        </TouchableOpacity>
                    )}
                </Animated.View>

            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 16,
        justifyContent: 'space-between',
        zIndex: 50,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    glassBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Fix BlurView nesting: Container needs to be absolute sized or wrapped
    blurContainerBottom: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        zIndex: 2,
    },

    // Center
    centerContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 40,
    },
    centerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        gap: 40,
    },
    playBtnWrapper: {
        borderRadius: 36,
        overflow: 'hidden',
    },
    playButtonCircle: {
        width: 72,
        height: 72,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    skipBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
    },
    skipText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
    },

    // Bottom
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 20,
        zIndex: 50,
        gap: 12,
    },
    timeText: {
        color: '#FFF',
        fontSize: 12,
        fontVariant: ['tabular-nums'],
        fontWeight: '600',
        width: 40,
        textAlign: 'center',
    },
    sliderContainer: {
        flex: 1,
        height: 30, // Increased tap target
        justifyContent: 'center',
    },
    trackBg: {
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        width: '100%',
    },
    trackFill: {
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFF',
        position: 'absolute',
    },
    thumb: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#FFF',
        position: 'absolute',
        marginLeft: -7,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
    },
    // Fullscreen toggle
    fullscreenBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
