import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    amount: string;
    planName: string;
    onConfirm: () => Promise<void>;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function PaymentModal({ visible, onClose, amount, planName, onConfirm }: PaymentModalProps) {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi'>('card');

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            slideAnim.setValue(SCREEN_HEIGHT);
            fadeAnim.setValue(0);

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    damping: 25,
                    stiffness: 100,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: SCREEN_HEIGHT,
                damping: 25,
                stiffness: 100,
                useNativeDriver: true,
            })
        ]).start(() => {
            onClose();
        });
    };

    const handlePay = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    styles.container,
                    {
                        paddingBottom: insets.bottom + 12, // Compact bottom padding
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleClose}
                        style={styles.closeBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={22} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Pay with</Text>
                    <View style={{ width: 22 }} />
                </View>

                <View style={styles.divider} />

                {/* Methods List */}
                <View style={styles.content}>
                    {/* Card Option */}
                    <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => setSelectedMethod('card')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconWrapper}>
                            <Ionicons name="card-outline" size={24} color="#484848" />
                        </View>
                        <View style={styles.infoWrapper}>
                            <Text style={styles.optionText}>Credit or debit card</Text>
                        </View>
                        {selectedMethod === 'card' && (
                            <Ionicons name="checkmark-sharp" size={20} color="#000" />
                        )}
                    </TouchableOpacity>

                    <View style={styles.rowSeparator} />

                    {/* UPI Option */}
                    <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => setSelectedMethod('upi')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconWrapper}>
                            <Ionicons name="wallet-outline" size={24} color="#484848" />
                        </View>
                        <View style={styles.infoWrapper}>
                            <Text style={styles.optionText}>UPI / Netbanking</Text>
                        </View>
                        {selectedMethod === 'upi' && (
                            <Ionicons name="checkmark-sharp" size={20} color="#000" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.payBtn, loading && { opacity: 0.8 }]}
                        onPress={handlePay}
                        disabled={loading}
                        activeOpacity={0.9}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.payBtnText}>Confirm and pay {amount}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14, // Compact
    },
    closeBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16, // Verified Compact
        fontWeight: "700",
        color: "#000",
    },
    divider: {
        height: 1,
        backgroundColor: "#F2F2F2",
        width: '100%',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 8, // Compact
        paddingBottom: 16, // Compact
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14, // Compact
    },
    iconWrapper: {
        width: 32,
        alignItems: 'flex-start',
        marginRight: 12, // Compact
    },
    infoWrapper: {
        flex: 1,
    },
    optionText: {
        fontSize: 15, // Compact
        color: "#222222",
        fontWeight: "400",
    },
    rowSeparator: {
        height: 1,
        backgroundColor: "#EBEBEB",
        marginLeft: 44, // Compact indent
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 0,
        paddingBottom: 8,
    },
    payBtn: {
        backgroundColor: "#000000",
        height: 48, // Compact height
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    payBtnText: {
        color: "#FFF",
        fontSize: 15, // Consistent font size
        fontWeight: "600",
    },
});
