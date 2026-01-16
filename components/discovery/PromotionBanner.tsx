import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';



const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16, // Matched with StartBrowsing
        marginBottom: 16,
    },
    touchable: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    card: {
        height: 72, // Slightly more compact
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1C1C1E',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    leftSection: {
        flex: 1,
        justifyContent: 'center',
        gap: 2,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    brandText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    mainInfo: {
        justifyContent: 'center',
    },
    headline: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#5B75F0', // App Accent Color
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    ctaText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },
    arrowIcon: {
        marginLeft: -2,
    }
});

export const PromotionBanner = () => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => Haptics.selectionAsync()}
                style={styles.touchable}
            >
                <View style={styles.card}>
                    {/* Background */}
                    <Image
                        source="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                        style={StyleSheet.absoluteFillObject}
                        contentFit="cover"
                        transition={500}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />

                    <View style={styles.content}>
                        <View style={styles.leftSection}>
                            <View style={styles.badgeContainer}>
                                <Ionicons name="infinite" size={12} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.brandText}>Premium</Text>
                            </View>
                            <View style={styles.mainInfo}>
                                <Text style={styles.headline}>No limits. Just music.</Text>
                            </View>
                        </View>

                        <View style={styles.rightSection}>
                            <Text style={styles.ctaText}>Try Free</Text>
                            <Ionicons name="arrow-forward" size={14} color="white" style={styles.arrowIcon} />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};
