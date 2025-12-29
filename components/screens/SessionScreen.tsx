import { useUserContext } from "@/context/UserContext";
import { useConversation } from "@/hooks/useConversation";
import { sessions } from "@/utils/sessions";
import { Ionicons } from "@expo/vector-icons";
import * as Brightness from "expo-brightness";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gradient } from "../gradient";

const { width } = Dimensions.get("window");

export default function SessionScreen() {
    const { userData, loading } = useUserContext();
    const { sessionId } = useLocalSearchParams();
    const router = useRouter();

    // State for the session, defaulting to params or first session
    const [currentSession, setCurrentSession] = useState(
        sessions.find((s) => s.id === Number(sessionId)) ?? sessions[0]
    );

    useEffect(() => {
        const manageSessionPersistence = async () => {
            if (sessionId) {
                // If sessionId is present in params, use it and persist it
                const s = sessions.find((s) => s.id === Number(sessionId));
                if (s) {
                    setCurrentSession(s);
                    await SecureStore.setItemAsync("last_session_id", String(s.id));
                }
            } else {
                // If no sessionId in params (e.g. after reload), try to restore
                try {
                    const savedId = await SecureStore.getItemAsync("last_session_id");
                    if (savedId) {
                        const s = sessions.find((s) => s.id === Number(savedId));
                        if (s) setCurrentSession(s);
                    }
                } catch (e) {
                    console.warn("Failed to restore session ID", e);
                }
            }
        };
        manageSessionPersistence();
    }, [sessionId]);

    const [isStarting, setIsStarting] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const conversation = useConversation({
        onConnect: (data: any) => {
            console.log('Connected to conversation', data);
            if (data?.conversationId) {
                setConversationId(data.conversationId);
            }
        },
        onDisconnect: () => console.log('Disconnected from conversation'),
        onMessage: (message: any) => console.log('Received message:', message),
        onError: (error: any) => console.error('Conversation error:', error),
        onModeChange: (mode: any) => console.log('Conversation mode changed:', mode),
        onStatusChange: (prop: any) => console.log('Conversation status changed:', prop.status),
        onCanSendFeedbackChange: (prop: any) =>
            console.log('Can send feedback changed:', prop.canSendFeedback),
        onUnhandledClientToolCall: (params: any) => console.log('Unhandled client tool call:', params),

        clientTools: {
            handleSetBrightness: async (params: unknown) => {
                try {
                    const { brightnessValue } = params as { brightnessValue: number };
                    console.log("🌞 setting brightness to ", { brightnessValue });
                    const { status } = await Brightness.requestPermissionsAsync();
                    if (status === "granted") {
                        await Brightness.setSystemBrightnessAsync(brightnessValue);
                        return brightnessValue;
                    }
                } catch (e) {
                    console.error("Error setting brightness:", e);
                    return -1;
                }
            }
        }
    });

    const startConversation = async () => {
        if (isStarting) return;
        if (conversation.status !== "disconnected") return;

        try {
            setIsStarting(true);
            const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
            if (!agentId) {
                console.error("Missing EXPO_PUBLIC_AGENT_ID");
                return;
            }

            console.log("Starting session with:", {
                agentId,
                username: userData?.displayName,
                title: currentSession.title,
                description: currentSession.description
            });

            await conversation.startSession({
                agentId,
                dynamicVariables: {
                    username: userData?.displayName || "user",
                    session_title: String(currentSession.title),
                    session_description: String(currentSession.description)
                }
            });
        } catch (e) {
            console.error("Error starting conversation: ", e);
        } finally {
            setIsStarting(false);
        }
    }

    const endConversation = async () => {
        if (conversation.status !== "connected") return;

        try {
            await conversation.endSession();
            if (conversationId) {
                router.push(`/summary?conversationId=${conversationId}`);
            }
        } catch (e) {
            console.log("Error ending conversation: ", e);
        }
    }

    if (loading) return null;

    const isConnected = conversation.status === "connected";
    const isConnecting = conversation.status === "connecting" || isStarting;
    const isActive = isConnected || isConnecting;

    return (
        <View style={styles.container}>
            <Gradient
                position="top"
                isSpeaking={isActive}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="chevron-back" size={28} color={isActive ? "#fff" : "#000"} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Animated.View
                        entering={FadeInDown.delay(200).springify()}
                        style={styles.textContainer}
                    >
                        <Text style={styles.title}>{currentSession.title}</Text>
                        <Text style={styles.description}>{currentSession.description}</Text>
                    </Animated.View>
                </View>

                <View style={styles.controls}>
                    <Animated.View style={styles.buttonWrapper}>
                        <TouchableOpacity
                            onPress={isConnected ? endConversation : startConversation}
                            disabled={isConnecting}
                            activeOpacity={0.8}
                        >
                            <View
                                style={[
                                    styles.mainButton,
                                    isConnecting && styles.buttonDisabled,
                                    { backgroundColor: '#007AFF' }
                                ]}
                            >
                                {isConnecting ? (
                                    <Text style={styles.buttonText}>Connecting...</Text>
                                ) : (
                                    <>
                                        <Ionicons
                                            name={isConnected ? "call" : "mic"}
                                            size={24}
                                            color="#fff"
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={styles.buttonText}>
                                            {isConnected ? "End Session" : "Start Session"}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        height: 60,
        justifyContent: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    textContainer: {
        alignItems: 'center',
        gap: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: "800",
        color: "#1a1a1a",
        textAlign: "center",
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 18,
        fontWeight: "500",
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
        maxWidth: width * 0.8,
    },
    controls: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 20 : 40,
    },
    buttonWrapper: {
        width: '100%',
        shadowColor: "#007AFF",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    mainButton: {
        flexDirection: 'row',
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
});