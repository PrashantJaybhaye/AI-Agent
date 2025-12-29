import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface UserDetailModalProps {
    visible: boolean;
    user: any;
    onClose: () => void;
    onDelete: () => void;
    onToggleAdmin: () => void;
    onUpdate?: (data: { displayName: string; email: string }) => Promise<void>;
    isCurrentUser: boolean;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
    visible,
    user,
    onClose,
    onDelete,
    onToggleAdmin,
    onUpdate,
    isCurrentUser,
}) => {
    const colorScheme = useColorScheme();

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setEmail(user.email || '');
            setIsEditing(false);
        }
    }, [user, visible]);

    if (!user) return null;

    const handleSave = async () => {
        if (!onUpdate) return;

        setIsLoading(true);
        try {
            await onUpdate({ displayName, email });
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isEditing) {
            setDisplayName(user.displayName || '');
            setEmail(user.email || '');
            setIsEditing(false);
        } else {
            onClose();
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
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
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={{ flex: 1 }}>
                {visible && (
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        exiting={FadeOut.duration(300)}
                        style={styles.overlay}
                    >
                        <TouchableOpacity
                            style={styles.backdrop}
                            activeOpacity={1}
                            onPress={handleClose}
                        />

                        <Animated.View
                            entering={SlideInDown.duration(300)}
                            exiting={SlideOutDown.duration(300)}
                            style={styles.keyboardView}
                        >
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={{ flex: 1 }}
                            >
                                <View style={styles.modalContainer}>
                                    {/* Grabber */}
                                    <View style={styles.grabberContainer}>
                                        <View style={styles.grabber} />
                                    </View>

                                    {/* Header */}
                                    <View style={styles.header}>
                                        <TouchableOpacity
                                            onPress={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                            style={styles.headerBtn}
                                        >
                                            <Text style={[styles.headerBtnText, isEditing && styles.cancelText]}>
                                                {isEditing ? 'Cancel' : 'Edit'}
                                            </Text>
                                        </TouchableOpacity>

                                        <Text style={styles.headerTitle}>
                                            {isEditing ? 'Edit Profile' : 'User Details'}
                                        </Text>

                                        <TouchableOpacity
                                            onPress={isEditing ? handleSave : onClose}
                                            style={styles.headerBtn}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator size="small" color="#007AFF" />
                                            ) : (
                                                <Text style={[styles.headerBtnText, styles.doneText]}>
                                                    {isEditing ? 'Save' : 'Done'}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                                        {/* Profile Hero */}
                                        {/* Profile Hero */}
                                        <View style={styles.heroSection}>
                                            <View style={styles.avatarWrapper}>
                                                <Image
                                                    source={user.photoURL}
                                                    style={styles.avatar}
                                                    contentFit="cover"
                                                />
                                                {user.isAdmin && (
                                                    <View style={styles.adminBadge}>
                                                        <Ionicons name="shield-checkmark" size={14} color="#FFF" />
                                                    </View>
                                                )}
                                            </View>
                                            {!isEditing && (
                                                <View style={styles.heroText}>
                                                    <Text style={styles.heroName}>{user.displayName || 'Unknown'}</Text>
                                                    <Text style={styles.heroEmail}>{user.email}</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Info Rows */}
                                        <View style={styles.section}>
                                            <View style={styles.groupContainer}>
                                                {isEditing ? (
                                                    <View style={styles.formContent}>
                                                        <View style={styles.inputGroup}>
                                                            <Text style={styles.inputLabel}>Display Name</Text>
                                                            <TextInput
                                                                style={styles.textInput}
                                                                value={displayName}
                                                                onChangeText={setDisplayName}
                                                                placeholder="Enter name"
                                                                placeholderTextColor="#999"
                                                            />
                                                        </View>
                                                        <View style={[styles.inputGroup, styles.noBorder]}>
                                                            <Text style={styles.inputLabel}>Email Address</Text>
                                                            <TextInput
                                                                style={styles.textInput}
                                                                value={email}
                                                                onChangeText={setEmail}
                                                                placeholder="Enter email"
                                                                placeholderTextColor="#999"
                                                                keyboardType="email-address"
                                                                autoCapitalize="none"
                                                            />
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <>
                                                        <InfoRow
                                                            icon="calendar-outline"
                                                            label="Joined"
                                                            value={formatDate(user.createdAt)}
                                                            iconColor="#007AFF"
                                                        />
                                                        <InfoRow
                                                            icon="time-outline"
                                                            label="Last Seen"
                                                            value={formatDate(user.lastLoginAt)}
                                                            iconColor="#34C759"
                                                        />
                                                        <InfoRow
                                                            icon="finger-print-outline"
                                                            label="User ID"
                                                            value={user.id}
                                                            mono
                                                            last
                                                            iconColor="#8E8E93"
                                                        />
                                                    </>
                                                )}
                                            </View>
                                        </View>

                                        {/* Actions */}
                                        <View style={styles.section}>
                                            <View style={styles.groupContainer}>
                                                <View style={styles.compactButtonRow}>
                                                    <TouchableOpacity
                                                        style={[styles.compactButton, isCurrentUser && styles.disabledRow]}
                                                        onPress={onToggleAdmin}
                                                        disabled={isCurrentUser}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={styles.compactButtonLabel}>
                                                            {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                                        </Text>
                                                    </TouchableOpacity>

                                                    <View style={styles.verticalSeparator} />

                                                    <TouchableOpacity
                                                        style={[styles.compactButton, isCurrentUser && styles.disabledRow]}
                                                        onPress={onDelete}
                                                        disabled={isCurrentUser}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={[styles.compactButtonLabel, styles.destructiveLabel]}>
                                                            Delete
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ height: 60 }} />
                                    </ScrollView>
                                </View>
                            </KeyboardAvoidingView>
                        </Animated.View>
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
};

const InfoRow = ({ icon, label, value, mono, last, iconColor = "#8E8E93" }: any) => (
    <View style={[styles.infoRow, last && styles.noBorder]}>
        <View style={styles.rowLabelGroup}>
            <Ionicons name={icon} size={20} color={iconColor} style={styles.rowIcon} />
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <Text style={[styles.infoValue, mono && styles.monoText]} numberOfLines={1}>
            {value}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    keyboardView: {
        width: '100%',
        height: '70%',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    grabberContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    grabber: {
        width: 36,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#C7C7CC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    headerBtn: {
        minWidth: 60,
    },
    headerBtnText: {
        fontSize: 17,
        color: '#007AFF',
    },
    doneText: {
        fontWeight: '600',
        textAlign: 'right',
    },
    cancelText: {
        color: '#FF3B30',
    },
    content: {
        flex: 1,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    adminBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#007AFF',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    heroText: {
        alignItems: 'center',
        gap: 4,
    },
    heroName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
    },
    heroEmail: {
        fontSize: 15,
        color: '#8E8E93',
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    groupContainer: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#C6C6C8',
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    rowLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowIcon: {
        width: 24,
    },
    infoLabel: {
        fontSize: 16,
        color: '#000',
    },
    infoValue: {
        fontSize: 16,
        color: '#8E8E93',
        flex: 1,
        textAlign: 'right',
        marginLeft: 20,
    },
    monoText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
    },
    formContent: {
        paddingVertical: 4,
    },
    inputGroup: {
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#C6C6C8',
    },
    inputLabel: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    textInput: {
        fontSize: 17,
        color: '#000',
        padding: 0,
    },
    compactButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
    },
    compactButton: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    compactButtonLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    verticalSeparator: {
        width: StyleSheet.hairlineWidth,
        height: '60%',
        backgroundColor: '#C6C6C8',
    },
    destructiveLabel: {
        color: '#FF3B30',
    },
    disabledRow: {
        opacity: 0.5,
    },
});
