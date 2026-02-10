import { IOSAlert } from "@/components/IOSAlert";
import { useUserContext } from "@/context/UserContext";
import { db } from "@/utils/firebase";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PaymentModal from "./PaymentModal";

const FEATURES = [
    "Unlimited access to all courses",
    "Offline downloads",
    "Ad-free experience",
    "Priority support",
    "Exclusive meditation sessions",
];

interface SubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function SubscriptionModal({ visible, onClose }: SubscriptionModalProps) {
    const insets = useSafeAreaInsets();
    const { userData } = useUserContext();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
    const [showPayment, setShowPayment] = useState(false);

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: "",
        message: "",
        buttons: [] as any[],
    });

    const isPremium = userData?.subscriptionPlan === "premium";

    const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

    const handleSubscribe = async () => {
        if (!userData?.uid) return;

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const userRef = doc(db, "users", userData.uid);
            await updateDoc(userRef, {
                subscriptionPlan: "premium",
            });
            setShowPayment(false);
            setAlertConfig({
                visible: true,
                title: "Success",
                message: "Welcome to Premium! 🌟",
                buttons: [{ text: "OK", style: "default", onPress: () => { closeAlert(); onClose(); } }]
            });
        } catch (error) {
            console.error(error);
            setAlertConfig({
                visible: true,
                title: "Error",
                message: "Something went wrong. Please try again.",
                buttons: [{ text: "OK", onPress: closeAlert }]
            });
        }
    };

    const onSubscribePress = () => {
        if (isPremium) {
            handleDowngrade();
        } else {
            setShowPayment(true);
        }
    };

    const handleDowngrade = async () => {
        if (!userData?.uid) return;

        setAlertConfig({
            visible: true,
            title: "Cancel Subscription",
            message: "Are you sure you want to cancel your Premium subscription?",
            buttons: [
                { text: "No", style: "cancel", onPress: closeAlert },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        closeAlert();
                        setLoading(true);
                        try {
                            const userRef = doc(db, "users", userData.uid);
                            await updateDoc(userRef, { subscriptionPlan: "free" });
                            setAlertConfig({
                                visible: true,
                                title: "Subscription Cancelled",
                                message: "You are now on the Free plan.",
                                buttons: [{ text: "OK", onPress: () => { closeAlert(); onClose(); } }]
                            });
                        } catch (e) {
                            setAlertConfig({
                                visible: true,
                                title: "Error",
                                message: "Failed to cancel.",
                                buttons: [{ text: "OK", onPress: closeAlert }]
                            });
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        });
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Hero Banner */}
                <View style={styles.heroContainer}>
                    <Image
                        source={require("@/assets/images/blue_croc_hero.png")}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                        style={styles.heroGradient}
                    />

                    <TouchableOpacity
                        onPress={onClose}
                        style={[styles.closeBtn, { top: insets.top + 10 }]}
                        activeOpacity={0.7}
                    >
                        <BlurView
                            intensity={25}
                            tint="light"
                            style={styles.glassBtnInner}
                        >
                            <Ionicons name="close" size={18} color="#000" />
                        </BlurView>
                    </TouchableOpacity>

                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
                        <Text style={styles.heroSubtitle}>
                            Get unlimited access to all courses and features designed for your growth.
                        </Text>
                    </View>
                </View>

                {/* Main Content Area */}
                <View style={[styles.contentWrapper, { paddingBottom: insets.bottom + 10 }]}>

                    {/* Features - Grouped Card */}
                    <View style={styles.featuresContainer}>
                        {FEATURES.map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                                <Ionicons name="checkmark-sharp" size={20} color="#007AFF" />
                                <Text style={styles.featureText}>{feature}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Pricing - Side by Side Selection */}
                    <View style={styles.pricingContainer}>
                        {/* Yearly Plan (Default Selected) */}
                        <TouchableOpacity
                            style={[
                                styles.pricingCard,
                                selectedPlan === 'yearly' && styles.selectedCard,
                                isPremium && styles.disabledCard
                            ]}
                            activeOpacity={0.9}
                            onPress={() => setSelectedPlan('yearly')}
                            disabled={isPremium || loading}
                        >
                            {selectedPlan === 'yearly' && (
                                <View style={styles.badgeLabel}>
                                    <Text style={styles.badgeLabelText}>17% OFF</Text>
                                </View>
                            )}

                            <View style={styles.cardTopRow}>
                                <Text style={styles.planTitle}>Yearly</Text>
                                <Ionicons
                                    name={selectedPlan === 'yearly' ? "checkmark-circle" : "ellipse-outline"}
                                    size={24}
                                    color={selectedPlan === 'yearly' ? "#007AFF" : "#C7C7CC"}
                                />
                            </View>
                            <Text style={styles.priceLarge}>₹249<Text style={styles.priceSmall}>/mo</Text></Text>
                            <Text style={styles.billingSubtext}>Billed at ₹2,999/yr</Text>
                        </TouchableOpacity>

                        {/* Monthly Plan */}
                        <TouchableOpacity
                            style={[
                                styles.pricingCard,
                                selectedPlan === 'monthly' && styles.selectedCard,
                                isPremium && styles.disabledCard
                            ]}
                            activeOpacity={0.9}
                            onPress={() => setSelectedPlan('monthly')}
                            disabled={isPremium || loading}
                        >
                            <View style={styles.cardTopRow}>
                                <Text style={styles.planTitle}>Monthly</Text>
                                <Ionicons
                                    name={selectedPlan === 'monthly' ? "checkmark-circle" : "ellipse-outline"}
                                    size={24}
                                    color={selectedPlan === 'monthly' ? "#007AFF" : "#C7C7CC"}
                                />
                            </View>
                            <Text style={styles.priceLarge}>₹299<Text style={styles.priceSmall}>/mo</Text></Text>
                            <Text style={styles.billingSubtext}>Billed monthly</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* Sticky Footer */}
                <View style={[styles.footerContainer, { paddingBottom: insets.bottom + 16 }]}>
                    <TouchableOpacity
                        style={[
                            styles.actionBtn,
                            isPremium && styles.cancelBtn,
                            loading && { opacity: 0.8 }
                        ]}
                        onPress={onSubscribePress}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={[styles.actionBtnText, isPremium && styles.cancelBtnText]}>
                                {isPremium ? "Cancel Subscription" : `Start 7-Day Free Trial`}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footerMeta}>
                        <Text style={styles.footerMetaText}>
                            {!isPremium
                                ? `7 days free, then ${selectedPlan === 'yearly' ? '₹249/mo' : '₹299/mo'}. Cancel anytime.`
                                : 'Plan Active'}
                        </Text>
                        <Text style={styles.footerMetaText}>•</Text>
                        <TouchableOpacity>
                            <Text style={styles.restoreText}>Restore</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <IOSAlert
                    visible={alertConfig.visible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    buttons={alertConfig.buttons}
                    onClose={closeAlert}
                />

                <PaymentModal
                    visible={showPayment}
                    onClose={() => setShowPayment(false)}
                    amount={selectedPlan === 'yearly' ? '₹2,999' : '₹299'}
                    planName={selectedPlan === 'yearly' ? 'Yearly Premium' : 'Monthly Premium'}
                    onConfirm={handleSubscribe}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    heroContainer: {
        height: 350,
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '60%',
    },
    closeBtn: {
        position: 'absolute',
        right: 16,
        zIndex: 10,
    },
    glassBtnInner: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    heroContent: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#FFF",
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.9)",
        lineHeight: 18,
        fontWeight: "500",
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 140, // Increased for footer
        justifyContent: 'flex-start', // Top align now
        gap: 16, // Use gap for spacing between sections
    },
    featuresContainer: {
        backgroundColor: "#F9F9F9",
        borderRadius: 16,
        padding: 16,
        gap: 12,
        marginBottom: 20,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    featureText: {
        fontSize: 14,
        color: "#1C1C1E",
        fontWeight: "500",
        flex: 1,
        lineHeight: 20,
    },
    pricingContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 8,
    },
    pricingCard: {
        flex: 1,
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E5EA",
        justifyContent: 'space-between',
        height: 124,
    },
    selectedCard: {
        borderColor: "#007AFF",
        borderWidth: 2,
        backgroundColor: "#F8FBFF",
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    planTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#000",
    },
    priceLarge: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000",
        letterSpacing: -0.5,
    },
    priceSmall: {
        fontSize: 13,
        fontWeight: "500",
        color: "#8E8E93",
        letterSpacing: 0,
    },
    billingSubtext: {
        fontSize: 11,
        color: "#8E8E93",
        fontWeight: "500",
        marginTop: 4,
    },
    badgeLabel: {
        position: 'absolute',
        top: -10,
        left: 12,
        backgroundColor: "#34C759", // Green for offer
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        zIndex: 5,
    },
    badgeLabelText: {
        color: "#FFF",
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    // disabledCard moved to bottom with specific styling
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(255,255,255,0.95)", // slightly translucent
        borderTopWidth: 0.5,
        borderTopColor: "rgba(0,0,0,0.1)",
        paddingTop: 12,
        paddingHorizontal: 20,
    },
    actionBtn: {
        backgroundColor: "#007AFF",
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        width: '100%',
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    cancelBtn: {
        backgroundColor: "#C62828",
        borderWidth: 0,
        borderColor: "transparent",
        shadowColor: "#C62828",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    actionBtnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: -0.2,
    },
    cancelBtnText: {
        color: "#FFF",
        fontWeight: "600",
    },
    disabledCard: {
        backgroundColor: "#F5F5F7",
        borderColor: "#E5E5EA",
        // Remove shadow for disabled state
        shadowOpacity: 0,
        elevation: 0,
    },
    footerMeta: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 4,
        gap: 16, // Space between text and restore
    },
    footerMetaText: {
        fontSize: 11,
        color: "#8E8E93",
        textAlign: "center",
    },
    restoreText: {
        fontSize: 11,
        color: "#007AFF",
        fontWeight: "600",
    },
});
