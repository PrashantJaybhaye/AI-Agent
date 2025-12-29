import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    destructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    destructive = false,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onCancel}
                />

                <View style={styles.modalContainer}>
                    <View style={styles.modal}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                        </View>

                        <Text style={styles.message}>{message}</Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onCancel}
                            >
                                <Text style={styles.cancelText}>{cancelText}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, destructive ? styles.destructiveButton : styles.confirmButton]}
                                onPress={onConfirm}
                            >
                                <Text style={[styles.confirmText, destructive && styles.destructiveText]}>
                                    {confirmText}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)', // Standard iOS dim
    },
    backdrop: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        width: 270, // Standard iOS Alert width
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: 'rgba(242,242,247,0.85)', // Glassy effect base
    },
    modal: {
        backgroundColor: '#F2F2F7', // iOS System Gray 6
        borderRadius: 14,
    },
    header: {
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 0,
        alignItems: 'center',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 4,
    },
    message: {
        fontSize: 13,
        color: '#000',
        textAlign: 'center',
        paddingHorizontal: 16,
        paddingBottom: 20,
        lineHeight: 18,
    },
    buttonContainer: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#3F3F3F', // Darker separator for contrast
        backgroundColor: 'rgba(255,255,255,0.8)', // Slightly lighter button area
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 44, // Standard iOS touch target
    },
    cancelButton: {
        borderRightWidth: 0.5,
        borderRightColor: '#3F3F3F',
    },
    confirmButton: {
        backgroundColor: 'transparent',
    },
    destructiveButton: {
        backgroundColor: 'transparent',
    },
    cancelText: {
        fontSize: 17,
        color: '#007AFF', // iOS Blue
        fontWeight: '400',
    },
    confirmText: {
        fontSize: 17,
        color: '#007AFF',
        fontWeight: '600',
    },
    destructiveText: {
        color: '#FF3B30', // iOS Red
        fontWeight: '600',
    },
});
