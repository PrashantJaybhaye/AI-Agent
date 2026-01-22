import { colors } from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ActionSheetProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

const ExpandOpen = new Keyframe({
    0: {
        opacity: 0,
        transform: [{ scale: 0.8 }, { translateX: 20 }, { translateY: -15 }],
    },
    100: {
        opacity: 1,
        transform: [{ scale: 1 }, { translateX: 0 }, { translateY: 0 }],
        easing: Easing.out(Easing.cubic),
    },
}).duration(250);

const ShrinkClose = new Keyframe({
    0: {
        opacity: 1,
        transform: [{ scale: 1 }, { translateX: 0 }, { translateY: 0 }],
    },
    100: {
        opacity: 0,
        transform: [{ scale: 0.8 }, { translateX: 20 }, { translateY: -15 }],
        easing: Easing.out(Easing.cubic),
    },
}).duration(200);

/**
 * A floating dropdown menu component (popover style).
 * Features:
 * - Top-right positioning (anchored to header area usually)
 * - Compact Light theme (White)
 * - Compact animated entrance (Diagonal expansion)
 */
export function ActionSheet({
    visible,
    onClose,
    title,
    children,
}: ActionSheetProps) {
    const insets = useSafeAreaInsets();

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    entering={ExpandOpen}
                    exiting={ShrinkClose}
                    style={[
                        styles.dropdownContainer,
                        { top: insets.top + 60 },
                    ]}
                >
                    <View style={styles.contentGroup}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />
                        <View style={styles.innerContent}>
                            {title && <Text style={styles.title}>{title}</Text>}
                            {children}
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

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
    textColor = "#000000", // Default to Black
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
                        size={18}
                        color={iconColor}
                        style={styles.itemIcon}
                    />
                )}
                <Text style={[styles.itemLabel, { color: textColor }]}>{label}</Text>
                {check && <Ionicons name="checkmark" size={16} color={colors.primary} />}
            </TouchableOpacity>
            {!isLast && <View style={styles.separator} />}
        </React.Fragment>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: "flex-end",
        justifyContent: "flex-start",
    },
    dropdownContainer: {
        marginRight: 16,
        width: 200,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, // Softer shadow for light theme
        shadowRadius: 16,
        elevation: 10,
    },
    contentGroup: {
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)", // Subtle border
    },
    // menuBackground removed
    innerContent: {
        paddingVertical: 2,
    },
    title: {
        fontSize: 11,
        fontWeight: "600",
        color: "#8E8E93", // Gray
        marginLeft: 16,
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E5EA", // Light separator
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 11, // Compact
        paddingHorizontal: 16,
    },
    itemIcon: {
        marginRight: 12,
    },
    itemLabel: {
        fontSize: 15,
        fontWeight: "400",
        color: "#000000",
        flex: 1,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#E5E5EA", // Light Separator
        marginLeft: 46,
    },
});
