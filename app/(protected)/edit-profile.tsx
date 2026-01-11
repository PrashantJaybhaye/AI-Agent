import { db } from "@/utils/firebase";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Image } from "expo-image";
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserContext } from "../../context/UserContext";

const COLORS = {
    bg: '#F2F2F7', // iOS Grouped Background
    card: '#FFFFFF',
    text: '#000000',
    subtext: '#8E8E93',
    primary: '#007AFF', // iOS Blue
    border: '#C6C6C8',
    destructive: '#FF3B30',
};

export default function EditProfileScreen() {
    const router = useRouter();
    const { userData } = useUserContext();
    const insets = useSafeAreaInsets();

    const [displayName, setDisplayName] = useState(userData?.displayName || '');
    const [username, setUsername] = useState(userData?.username || '');
    const [bio, setBio] = useState(userData?.bio || '');
    const [location, setLocation] = useState(userData?.location || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const handleGetCurrentLocation = async () => {
        try {
            setIsLocating(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (reverseGeocode.length > 0) {
                const address = reverseGeocode[0];
                // Prefer City, but fallback to subregion/district/name
                const city = address.city || address.subregion || address.district || address.name;
                const country = address.country || address.region;

                const locationString = [city, country].filter(Boolean).join(', ');

                if (locationString) {
                    setLocation(locationString);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                    Alert.alert('Location found', 'But could not determine city/country name.');
                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not fetch location. Please try again.');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsLocating(false);
        }
    };

    const handleSave = async () => {
        if (!displayName.trim()) {
            Alert.alert("Required", "Please enter your name.");
            return;
        }

        if (!username.trim()) {
            Alert.alert("Required", "Please enter a username.");
            return;
        }

        if (!userData?.uid) return;

        try {
            setIsSaving(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            if (username.trim() !== userData.username) {
                // Check if username is taken
                const usernameQuery = query(collection(db, "users"), where("username", "==", username.trim()));
                const usernameSnap = await getDocs(usernameQuery);
                if (!usernameSnap.empty) {
                    Alert.alert("Unavailable", "This username is already taken. Please choose another one.");
                    return;
                }
            }

            const userRef = doc(db, "users", userData.uid);
            await updateDoc(userRef, {
                displayName: displayName.trim(),
                username: username.trim(),
                bio: bio.trim(),
                location: location.trim()
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Could not update profile.");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Native-style Navigation Bar */}
            <View style={[styles.navBar, { paddingTop: insets.top }]}>
                <View style={styles.navBarContent}>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.back()}
                        disabled={isSaving}
                        hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
                    >
                        <Text style={styles.navButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <Text style={styles.navTitle}>Edit Profile</Text>

                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={handleSave}
                        disabled={isSaving}
                        hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <Text style={[styles.navButtonText, styles.saveButtonText]}>Done</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View entering={FadeInUp.duration(500).springify()}>

                        {/* Avatar Section */}
                        <View style={styles.avatarSection}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={userData?.photoURL}
                                    style={styles.avatar}
                                    contentFit="cover"
                                    transition={200}
                                />
                                <View style={styles.cameraBadge}>
                                    <Ionicons name="camera-outline" size={14} color="#FFF" />
                                </View>
                            </View>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => Haptics.selectionAsync()}>
                                <Text style={styles.editPhotoText}>Edit Picture</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form Section */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.formGroup}>
                                <View style={styles.inputRow}>
                                    <Text style={styles.label}>Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={displayName}
                                        onChangeText={setDisplayName}
                                        placeholder="Name"
                                        placeholderTextColor={COLORS.subtext}
                                        autoCorrect={false}
                                        clearButtonMode="while-editing"
                                    />
                                </View>

                                <View style={styles.separator} />

                                <View style={styles.inputRow}>
                                    <Text style={styles.label}>Username</Text>
                                    <TextInput
                                        style={[styles.input, userData?.username ? { color: COLORS.subtext } : {}]}
                                        value={username}
                                        onChangeText={setUsername}
                                        placeholder="username"
                                        placeholderTextColor={COLORS.subtext}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        clearButtonMode={userData?.username ? "never" : "while-editing"}
                                        editable={!userData?.username}
                                    />
                                    {userData?.username && (
                                        <Ionicons name="lock-closed-outline" size={16} color={COLORS.subtext} />
                                    )}
                                </View>

                                <View style={styles.separator} />

                                <View style={styles.inputRow}>
                                    <Text style={styles.label}>Email</Text>
                                    <TextInput
                                        style={[styles.input, { color: COLORS.subtext }]}
                                        value={userData?.email}
                                        editable={false}
                                    />
                                    <Ionicons name="lock-closed-outline" size={16} color={COLORS.subtext} />
                                </View>
                            </View>
                            <Text style={styles.footerText}>
                                This is how your name will appear to other users in the community.
                            </Text>
                        </View>

                        {/* Bio Section */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.formGroup}>
                                <View style={[styles.inputRow, { alignItems: 'flex-start', paddingVertical: 12 }]}>
                                    <Text style={[styles.label, { marginTop: 4 }]}>Bio</Text>
                                    <TextInput
                                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                        value={bio}
                                        onChangeText={setBio}
                                        placeholder="Tell us about yourself..."
                                        placeholderTextColor={COLORS.subtext}
                                        multiline
                                        maxLength={160}
                                    />
                                </View>
                            </View>
                            <Text style={styles.footerText}>
                                {bio.length}/160
                            </Text>
                        </View>

                        {/* Location Section */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.formGroup}>
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.label}>Location</Text>
                                        <TextInput
                                            style={[styles.input, userData?.location ? { color: COLORS.subtext } : {}]}
                                            value={location}
                                            onChangeText={setLocation}
                                            placeholder="City, Country"
                                            placeholderTextColor={COLORS.subtext}
                                            autoCorrect={false}
                                            clearButtonMode={userData?.location ? "never" : "while-editing"}
                                            editable={!userData?.location}
                                        />
                                    </View>
                                    {!userData?.location && (
                                        <TouchableOpacity
                                            onPress={handleGetCurrentLocation}
                                            disabled={isLocating}
                                            style={{ padding: 4 }}
                                        >
                                            {isLocating ? (
                                                <ActivityIndicator size="small" color={COLORS.primary} />
                                            ) : (
                                                <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    {userData?.location && (
                                        <Ionicons name="lock-closed-outline" size={16} color={COLORS.subtext} />
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Additional Info Section - e.g. Username/Bio could go here */}
                        <Animated.View
                            entering={FadeInDown.delay(200).duration(500)}
                            style={styles.sectionContainer}
                        >
                            <View style={styles.formGroup}>
                                <View style={styles.inputRow}>
                                    <Text style={styles.label}>ID</Text>
                                    <Text style={[styles.input, { color: COLORS.subtext }]} numberOfLines={1}>
                                        {userData?.uid}
                                    </Text>
                                    <TouchableOpacity onPress={() => {
                                        // Clipboard logic could go here
                                        Haptics.selectionAsync();
                                    }}>
                                        <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.footerText}>
                                User ID is unique and cannot be changed.
                            </Text>
                        </Animated.View>

                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    navBar: {
        backgroundColor: COLORS.bg, // Or slight transparency with blur if desired
        zIndex: 10,
    },
    navBarContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 44,
        paddingHorizontal: 16,
    },
    navButton: {
        padding: 4,
        minWidth: 60,
    },
    navButtonText: {
        fontSize: 17,
        color: COLORS.primary,
        fontWeight: '400',
    },
    saveButtonText: {
        fontWeight: '600',
        alignSelf: 'flex-end',
    },
    navTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.text,
    },
    scrollContent: {
        paddingTop: 20,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        marginBottom: 12,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.card, // Fallback
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#000',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.bg,
    },
    editPhotoText: {
        fontSize: 15,
        color: COLORS.primary,
        fontWeight: '500',
    },
    sectionContainer: {
        marginBottom: 24,
    },
    formGroup: {
        backgroundColor: COLORS.card,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.border,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 48,
    },
    label: {
        width: 80,
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '400',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        height: '100%',
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.border,
        marginLeft: 16, // Inset
    },
    footerText: {
        fontSize: 13,
        color: COLORS.subtext,
        marginTop: 8,
        marginHorizontal: 16,
    },
});
