import { Image } from 'expo-image';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserDetailModalProps {
    visible: boolean;
    user: any;
    onClose: () => void;
    onDelete: () => void;
    onToggleAdmin: () => void;
    isCurrentUser: boolean;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
    visible,
    user,
    onClose,
    onDelete,
    onToggleAdmin,
    isCurrentUser,
}) => {
    if (!user) return null;

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={styles.modalContainer}>
                    <View style={styles.grabberContainer}>
                        <View style={styles.grabber} />
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>User Details</Text>
                        <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Profile Section */}
                        <View style={styles.profileSection}>
                            <Image
                                source={user.photoURL}
                                style={styles.avatar}
                                contentFit="cover"
                            />
                            {user.isAdmin && (
                                <View style={styles.adminBadge}>
                                    <Text style={styles.adminBadgeText}>Administrator</Text>
                                </View>
                            )}
                        </View>

                        {/* Info Section - Grouped Style */}
                        <View style={styles.groupContainer}>
                            <InfoRow label="Name" value={user.displayName || 'Unknown'} first />
                            <InfoRow label="Email" value={user.email} />
                            <InfoRow label="User ID" value={user.id} mono />
                            <InfoRow label="Created" value={formatDate(user.createdAt)} />
                            <InfoRow label="Last Login" value={formatDate(user.lastLoginAt)} last />
                        </View>

                        {/* Actions */}
                        <View style={styles.actionsSection}>
                            <TouchableOpacity
                                style={[styles.actionButton, isCurrentUser && styles.actionButtonDisabled]}
                                onPress={onToggleAdmin}
                                disabled={isCurrentUser}
                            >
                                <Text style={[styles.actionButtonText, isCurrentUser && styles.actionButtonTextDisabled]}>
                                    {user.isAdmin ? 'Revoke Admin Access' : 'Grant Admin Access'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton, isCurrentUser && styles.actionButtonDisabled]}
                                onPress={onDelete}
                                disabled={isCurrentUser}
                            >
                                <Text style={[styles.actionButtonText, styles.deleteButtonText, isCurrentUser && styles.actionButtonTextDisabled]}>
                                    Delete User
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const InfoRow: React.FC<{ label: string; value: string; mono?: boolean; highlight?: boolean; first?: boolean; last?: boolean }> = ({
    label,
    value,
    mono = false,
    highlight = false,
    first = false,
    last = false
}) => (
    <View style={[styles.infoRow, last && styles.noBorder]}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[
            styles.infoValue,
            mono && styles.monoValue,
            highlight && styles.highlightValue
        ]} numberOfLines={1}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        backgroundColor: '#F2F2F7', // iOS System Gray 6
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 40,
        height: '90%',
    },
    grabberContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    grabber: {
        width: 36,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#C7C7CC', // iOS Grabber Gray
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 22, // iOS Large Title
        fontWeight: '700',
        color: '#000',
        letterSpacing: -0.5,
    },
    doneBtn: {
        backgroundColor: '#E5E5EA',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
    },
    doneText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#007AFF', // iOS Blue
    },
    content: {
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E5E5EA',
        marginBottom: 12,
    },
    adminBadge: {
        backgroundColor: '#E5E5EA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    adminBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
    },
    groupContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 16,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E5EA', // Separator
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    infoLabel: {
        fontSize: 16,
        color: '#000',
        fontWeight: '400',
    },
    infoValue: {
        fontSize: 16,
        color: '#8E8E93',
        fontWeight: '400',
        flex: 1,
        textAlign: 'right',
    },
    monoValue: {
        fontFamily: 'Courier',
        fontSize: 14,
    },
    highlightValue: {
        color: '#007AFF',
    },
    actionsSection: {
        marginTop: 24,
        paddingHorizontal: 16,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF', // White pill button
        paddingVertical: 16,
        borderRadius: 12,
    },
    actionButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#FFF', // Native iOS destructive is often white in sheets too, or separate red
        marginTop: 8,
    },
    deleteButtonText: {
        color: '#FF3B30',
    },
    actionButtonDisabled: {
        opacity: 0.5,
    },
    actionButtonTextDisabled: {
        color: '#C7C7CC',
    },
});
