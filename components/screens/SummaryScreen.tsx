import { useUserContext } from "@/context/UserContext";
import { colors } from "@/utils/colors";
import { db } from "@/utils/firebase";
import { ConversationResponse, TranscriptEntry } from "@/utils/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassBlur } from "../GlassBlur";
import { Gradient } from "../gradient";

// Optimized message component
const MessageBubble = React.memo(({ item }: { item: TranscriptEntry }) => {
    const isUser = item.role === "user";
    return (
        <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
            {!isUser && (
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                </View>
            )}
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
                    {item.message}
                </Text>
            </View>
        </View>
    );
});

export default function SummaryScreen() {
    const { conversationId, sessionId } = useLocalSearchParams();
    const router = useRouter();
    const { userData } = useUserContext();
    const [conversation, setConversation] = useState<ConversationResponse>();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // If we have a sessionId, we are viewing history (saved data)
    const isHistoryView = !!sessionId;

    useEffect(() => {
        if (sessionId) {
            fetchHistorySession(sessionId as string);
        } else if (conversationId) {
            getSummary();
        }
    }, [sessionId, conversationId]);

    // Auto-refresh every 5 seconds ONLY when conversation is active/processing and NOT in history view
    useEffect(() => {
        if (conversation?.status && conversation.status !== "done" && !isHistoryView) {
            const intervalId = setInterval(() => {
                console.log("Auto-refreshing conversation status...");
                getSummary();
            }, 5000); // 5 seconds

            return () => clearInterval(intervalId);
        }
    }, [conversation?.status, isHistoryView]);

    async function fetchHistorySession(id: string) {
        try {
            setIsLoadingHistory(true);
            const docRef = doc(db, "session", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Try to parse stored JSON transcript, fallback to splitting text or single bubble
                let recoveredTranscript: TranscriptEntry[] = [];
                if (data.transcript_json) {
                    try {
                        recoveredTranscript = JSON.parse(data.transcript_json);
                    } catch (e) {
                        console.log("Failed to parse transcript json", e);
                    }
                }

                if (recoveredTranscript.length === 0 && data.transcript) {
                    // Fallback: Treat typically as a simplified display
                    recoveredTranscript = [{
                        role: 'assistant',
                        message: data.transcript,
                        time_in_call_secs: 0
                    }];
                }

                setConversation({
                    agent_id: 'history',
                    conversation_id: data.conv_id || 'history',
                    status: 'done',
                    transcript: recoveredTranscript,
                    metadata: {
                        start_time_unix_secs: new Date(data.created_at).getTime() / 1000,
                        call_duration_secs: data.call_duration_secs || 0,
                        cost: data.tokens || 0,
                    },
                    has_audio: false,
                    has_user_audio: false,
                    has_response_audio: false,
                    analysis: {
                        call_successful: 'success',
                        call_summary_title: data.call_summary_title || 'History Session',
                        transcript_summary: data.transcript_summary || data.transcript_summary || '',
                        evaluation_criteria_results: {},
                        data_collection_results: {},
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching history session:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    }

    async function getSummary() {
        if (!conversationId) return;
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/api/conversations?conversationId=${conversationId}`
            );

            if (!response.ok) {
                const text = await response.text();
                console.error("Failed to fetch summary:", text);
                return;
            }

            const data: { conversation: ConversationResponse } = await response.json();
            setConversation(data.conversation);
        } catch (error) {
            console.error("Error fetching summary:", error);
        }
    }

    async function saveAndContinue() {
        try {
            setIsSaving(true);
            await addDoc(collection(db, "session"), {
                user_id: userData?.uid,
                status: conversation?.status,
                conv_id: conversationId,
                tokens: Number(conversation?.metadata?.cost),
                call_duration_secs: Number(conversation?.metadata?.call_duration_secs),
                // Save JSON for full fidelity restoration
                transcript_json: JSON.stringify(conversation?.transcript),
                transcript: conversation?.transcript.map((t) => t.message).join("\n"),
                call_summary_title: conversation?.analysis?.call_summary_title,
                transcript_summary: conversation?.analysis?.transcript_summary,
                created_at: new Date().toISOString(),
            });

            router.dismissAll();
        } catch (error) {
            console.error("Error saving summary:", error);
        } finally {
            setIsSaving(false);
        }
    }

    const formatDuration = (seconds: number) => {
        if (!seconds) return "0s";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const formatDate = (unixSeconds: number) => {
        if (!unixSeconds) return "";
        const date = new Date(unixSeconds * 1000);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusColor = () => {
        const success = conversation?.analysis?.call_successful;
        if (success === "success") return colors.green;
        if (success === "failure") return colors.red;
        return colors.primary;
    };

    const getStatusLabel = () => {
        const success = conversation?.analysis?.call_successful;
        if (success === "success") return "Successful";
        if (success === "failure") return "Failed";
        return "Completed";
    };

    const transcriptData = useMemo(
        () => conversation?.transcript || [],
        [conversation?.transcript]
    );

    if (isLoadingHistory || (conversation?.status !== "done")) {
        return (
            <View style={styles.container}>
                <Gradient position="top" isSpeaking={false} />
                <SafeAreaView style={styles.safeArea}>
                    {isHistoryView && (
                        <View style={styles.header}>
                            <Pressable onPress={() => router.back()} style={styles.backButtonWrapper}>
                                <GlassBlur style={styles.backButton} intensity={40}>
                                    <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
                                </GlassBlur>
                            </Pressable>
                        </View>
                    )}
                    <View style={styles.loadingWrapper}>
                        <View style={styles.loadingContent}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingTitle}>
                                {isLoadingHistory ? "Loading History" : "Processing Call"}
                            </Text>
                            <Text style={styles.loadingSubtitle}>
                                {isLoadingHistory ? "Retrieving session data..." : (conversation?.status || "Initializing") + "..."}
                            </Text>
                            {!isLoadingHistory && (
                                <Pressable onPress={getSummary} style={styles.retryButton}>
                                    <Text style={styles.retryText}>Refresh</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Gradient position="bottom" isSpeaking={false} />
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {isHistoryView && (
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()} style={styles.backButtonWrapper}>
                            <GlassBlur style={styles.backButton} intensity={40}>
                                <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
                            </GlassBlur>
                        </Pressable>
                    </View>
                )}

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={styles.headerCentered}>
                        <View style={[styles.statusPill, { backgroundColor: getStatusColor() + '20' }]}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                            <Text style={[styles.statusText, { color: getStatusColor() }]}>
                                {getStatusLabel()}
                            </Text>
                        </View>
                        <Text style={styles.centeredTitle}>
                            {conversation?.analysis?.call_summary_title || "Untitled Session"}
                        </Text>
                        <Text style={styles.centeredDate}>
                            {formatDate(conversation?.metadata?.start_time_unix_secs)}
                        </Text>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {formatDuration(conversation?.metadata?.call_duration_secs)}
                            </Text>
                            <Text style={styles.statLabel}>Duration</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {conversation?.metadata?.cost}
                            </Text>
                            <Text style={styles.statLabel}>Tokens</Text>
                        </View>
                    </View>

                    {/* AI Summary Section */}
                    <View style={styles.sectionContainer}>
                        <LinearGradient
                            colors={["rgba(50, 50, 50, 0.05)", "rgba(0, 0, 0, 0.02)"]}
                            style={styles.glassCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardHeaderRow}>
                                <Ionicons name="sparkles-sharp" size={16} color={colors.primary} />
                                <Text style={styles.cardTitle}>AI Summary</Text>
                            </View>
                            <Text style={styles.summaryText}>
                                {conversation?.analysis?.transcript_summary.trim()}
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Transcript Section */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionHeader}>Transcript</Text>
                        <View style={styles.transcriptList}>
                            {transcriptData.map((item, index) => (
                                <MessageBubble key={`msg-${index}`} item={item} />
                            ))}
                        </View>
                    </View>

                    {/* Save Button */}
                    {!isHistoryView && (
                        <View style={styles.footer}>
                            <Pressable
                                onPress={saveAndContinue}
                                disabled={isSaving}
                                style={[styles.actionButton, isSaving && styles.disabledButton]}
                            >
                                <Text style={styles.actionButtonText}>
                                    {isSaving ? "Saving..." : "Save Session"}
                                </Text>
                            </Pressable>
                        </View>
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 50, // Push down into viewable area
        left: 24,
        zIndex: 10,
    },
    backButtonWrapper: {
        borderRadius: 22,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 80, // Add padding for fixed header
        paddingBottom: 40,
    },
    loadingWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingContent: {
        alignItems: "center",
        gap: 16,
    },
    loadingTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    loadingSubtitle: {
        fontSize: 15,
        color: "#666",
    },
    retryButton: {
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: "#F2F2F7",
        borderRadius: 20,
    },
    retryText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#007AFF",
    },

    // Header Centered
    headerCentered: {
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 24,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginBottom: 16,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    centeredTitle: {
        fontSize: 32, // Large
        fontWeight: '800',
        color: '#000',
        lineHeight: 38,
        textAlign: 'center',
        marginBottom: 8,
    },
    centeredDate: {
        fontSize: 15,
        color: '#8E8E93',
        fontWeight: '500',
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        gap: 40,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#888',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#E5E5EA',
    },

    // Summary Section
    sectionContainer: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    glassCard: {
        padding: 20, // Reduced padding
        borderRadius: 20, // Slightly smaller radius
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        backgroundColor: 'rgba(240, 240, 245, 0.5)', // Subtle backdrop
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8, // Tighter spacing
    },
    cardTitle: {
        fontSize: 12, // Slightly smaller
        fontWeight: '600',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    summaryText: {
        fontSize: 15, // Slightly smaller text for minimal feel
        lineHeight: 22,
        color: '#444', // Softer black
        fontWeight: '400',
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 16,
    },

    // Transcript (Existing)
    transcriptList: {
        gap: 16,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 12,
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    aiRow: {
        justifyContent: 'flex-start',
    },
    avatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    bubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    aiBubble: {
        backgroundColor: '#F2F2F7',
        borderBottomLeftRadius: 4,
    },
    userBubble: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    bubbleText: {
        fontSize: 16,
        lineHeight: 22,
        color: '#000',
    },
    userBubbleText: {
        color: '#FFF',
    },

    // Footer (Action Button)
    footer: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    actionButton: {
        height: 56,
        backgroundColor: '#000',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
    actionButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
});
