import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import Animated, { Easing, FadeIn, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    cancelText?: string;
}

/**
 * A reusable iOS-style Bottom Sheet / Action Sheet component.
 * Features:
 * - Glassmorphism background and content
 * - Smooth entrance animations
 * - Grouped content with a separate Cancel button
 */
export function BottomSheet({
    visible,
    onClose,
    title,
    children,
    cancelText = "Cancel",
}: BottomSheetProps) {
    const insets = useSafeAreaInsets();

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none" // We handle animation with Reanimated
            onRequestClose={onClose}
        >
            <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
                {/* Backdrop -> Dismiss on press */}
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <BlurView
                        intensity={20}
                        tint="light"
                        style={StyleSheet.absoluteFill}
                    />
                </TouchableOpacity>

                {/* Sheet Content */}
                <Animated.View
                    entering={SlideInDown.duration(300).easing(Easing.out(Easing.quad))}
                    style={[styles.sheetContainer, { paddingBottom: insets.bottom }]}
                >
                    {/* Main Options Group */}
                    <View style={styles.contentGroup}>
                        <BlurView
                            intensity={80}
                            tint="light" // Matches iOS system material
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.innerContent}>
                            {title && <Text style={styles.title}>{title}</Text>}
                            {children}
                        </View>
                    </View>
                    {/* Cancel Button */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        activeOpacity={0.9}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelText}>{cancelText}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

// ----------------------------------------------------------------------
// BottomSheet Item Component
// ----------------------------------------------------------------------

interface BottomSheetItemProps {
    icon?: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    check?: boolean;
    isLast?: boolean;
    style?: ViewStyle;
    textColor?: string;
    iconColor?: string;
}

export function BottomSheetItem({
    icon,
    label,
    onPress,
    check = false,
    isLast = false,
    style,
    textColor = "#000000",
    iconColor = "#000000",
}: BottomSheetItemProps) {
    return (
        <React.Fragment>
            <TouchableOpacity
                style={[styles.itemContainer, style]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={iconColor}
                        style={styles.itemIcon}
                    />
                )}
                <Text style={[styles.itemLabel, { color: textColor }]}>{label}</Text>
                {check && <Ionicons name="checkmark" size={18} color="#007AFF" />}
            </TouchableOpacity>
            {!isLast && <View style={styles.separator} />}
        </React.Fragment>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheetContainer: {
        paddingHorizontal: 12, // Compact side padding
        paddingTop: 0,
    },
    contentGroup: {
        borderRadius: 13,
        overflow: "hidden",
        backgroundColor: "rgba(245,245,245,0.8)",
        marginBottom: 5, // Tight gap
    },
    innerContent: {
        // Transparent to let blur show through
    },
    title: {
        fontSize: 12,
        fontWeight: "600",
        color: "rgba(60, 60, 67, 0.6)",
        textAlign: "center",
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(60, 60, 67, 0.2)",
    },
    cancelButton: {
        backgroundColor: "#FFFFFF",
        borderRadius: 13,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#007AFF",
    },
    // Item Styles
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: "rgba(255,255,255,0.5)",
    },
    itemIcon: {
        marginRight: 10,
    },
    itemLabel: {
        fontSize: 16,
        flex: 1,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(60, 60, 67, 0.2)",
        marginLeft: 50, // Indent separator
    },
});
