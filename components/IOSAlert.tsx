import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface AlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

interface IOSAlertProps {
    visible: boolean;
    title?: string;
    message?: string;
    buttons?: AlertButton[];
    onClose?: () => void; // Optional fallback
}

export const IOSAlert = ({
    visible,
    title,
    message,
    buttons = [{ text: 'OK', style: 'default' }],
    onClose
}: IOSAlertProps) => {

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(200)}
                        style={styles.alertContainer}
                    >
                        {/* Content */}
                        <View style={styles.contentContainer}>
                            {title && <Text style={styles.title}>{title}</Text>}
                            {message && <Text style={styles.message}>{message}</Text>}
                        </View>

                        {/* Buttons */}
                        <View style={[
                            styles.buttonContainer,
                            buttons.length > 2 && { flexDirection: 'column' }
                        ]}>
                            {buttons.map((btn, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        buttons.length === 2 && index === 0 && styles.buttonBorderRight,
                                        buttons.length > 2 && index < buttons.length - 1 && styles.buttonBorderBottom,
                                        index > 0 && buttons.length <= 2 && { borderLeftWidth: 0 }
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        if (btn.onPress) btn.onPress();
                                        else if (onClose) onClose();
                                    }}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        btn.style === 'destructive' && { color: '#FF3B30' },
                                        btn.style === 'cancel' && { fontWeight: '600' }
                                    ]}>
                                        {btn.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: 270,
        backgroundColor: 'rgba(255,255,255,0.95)', // Nearly opaque white for clean look
        borderRadius: 14,
        overflow: 'hidden',
        // No shadow as requested
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 20,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(60,60,67,0.29)',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
        textAlign: 'center',
    },
    message: {
        fontSize: 13,
        color: '#000',
        textAlign: 'center',
        lineHeight: 18,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    button: {
        flex: 1,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    buttonBorderRight: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: 'rgba(60,60,67,0.29)',
    },
    buttonBorderBottom: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(60,60,67,0.29)',
    },
    buttonText: {
        fontSize: 17,
        color: '#007AFF', // Standard iOS Blue
        fontWeight: '400',
    },
});
