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

interface ActionSheetProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    cancelText?: string;
}

/**
 * A reusable iOS-style Action Sheet component.
 * Features:
 * - Glassmorphism background and content
 * - Smooth entrance animations
 * - Grouped content with a separate Cancel button
 */
export function ActionSheet({
    visible,
    onClose,
    title,
    children,
    cancelText = "Cancel",
}: ActionSheetProps) {
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
                    style={[
                        styles.sheetContainer,
                        { paddingBottom: Math.max(insets.bottom, 24) },
                    ]}
                >
                    {/* Main Options Group */}
                    <View style={styles.contentGroup}>
                        <BlurView
                            intensity={80}
                            tint="extraLight" // Cleaner, whiter glass effect
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
// ActionSheet Item Component
// ----------------------------------------------------------------------

interface ActionSheetItemProps {
    icon?: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    check?: boolean;
    isLast?: boolean;
    style?: ViewStyle;
    textColor?: string;
    iconColor?: string;
}

export function ActionSheetItem({
    icon,
    label,
    onPress,
    check = false,
    isLast = false,
    style,
    textColor = "#000000",
    iconColor = "#000000",
}: ActionSheetItemProps) {
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
        backgroundColor: "rgba(0,0,0,0.3)", // Slightly lighter backdrop
    },
    sheetContainer: {
        paddingHorizontal: 24, // Wider side padding for "medium" width look
        paddingTop: 0,
    },
    contentGroup: {
        borderRadius: 16, // Compact radius
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.85)", // Less transparency for clearer text
        marginBottom: 10, // Tighter gap
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.6)",
    },
    innerContent: {
        // Transparent
    },
    title: {
        fontSize: 12,
        fontWeight: "600",
        color: "#8E8E93",
        textAlign: "center",
        paddingVertical: 12, // Compact padding
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(0,0,0,0.08)",
    },
    cancelButton: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16, // Match contentGroup
        paddingVertical: 13, // Compact button height
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cancelText: {
        fontSize: 16, // Refined font size
        fontWeight: "600",
        color: "#007AFF",
    },
    // Item Styles
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13, // Compact hit area
        paddingHorizontal: 16,
        backgroundColor: "transparent",
    },
    itemIcon: {
        marginRight: 12,
    },
    itemLabel: {
        fontSize: 16, // Standard compact text size
        flex: 1,
        color: "#000",
        fontWeight: "400",
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(0, 0, 0, 0.08)",
        marginLeft: 48,
    },
});
