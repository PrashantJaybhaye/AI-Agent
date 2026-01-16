import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 20px padding on sides + 8px gap

const CATEGORIES = [
    {
        id: 'music',
        title: 'Music',
        color: '#E8125C', // Pink
        image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&q=80',
        rotate: '25deg',
        right: -10,
        bottom: 0,
    },
    {
        id: 'podcasts',
        title: 'Podcasts',
        color: '#0D735B', // Teal
        image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80',
        rotate: '25deg',
        right: -10,
        bottom: 0,
    },
    {
        id: 'audiobooks',
        title: 'Audiobooks',
        color: '#1E3264', // Navy Blue
        image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=400&q=80',
        rotate: '25deg',
        right: -10,
        bottom: 0,
    },
    {
        id: 'made',
        title: 'Playlists',
        color: '#148A08', // Green
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
        rotate: '25deg',
        right: -10,
        bottom: 0,
    },
];

export const StartBrowsing = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Start browsing</Text>
            <View style={styles.grid}>
                {CATEGORIES.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[styles.card, { backgroundColor: category.color }]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            router.push({
                                pathname: '/(protected)/category/[id]',
                                params: {
                                    id: category.id,
                                    title: category.title,
                                    color: category.color
                                }
                            } as any);
                        }}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.cardTitle}>{category.title}</Text>
                        <View style={[styles.imageContainer, {
                            transform: [{ rotate: category.rotate }]
                        }]}>
                            <Image
                                source={category.image}
                                style={styles.cardImage}
                                contentFit="cover"
                                transition={200}
                            />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 16,
        letterSpacing: -0.4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: CARD_WIDTH,
        height: 90,
        borderRadius: 10,
        padding: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    cardTitle: {
        fontSize: 14.5,
        fontWeight: '700',
        color: '#FFFFFF',
        maxWidth: '75%',
        letterSpacing: -0.3,
    },
    imageContainer: {
        position: 'absolute',
        width: 55,
        height: 55,
        bottom: 0,
        right: -10,
        borderRadius: 6,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
});
