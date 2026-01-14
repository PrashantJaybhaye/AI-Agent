import { getCategoryContent, ItunesResult } from '@/utils/itunesApi';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Component to handle audio playback
const AudioController = ({ url, isPlaying, onPlaybackStatusUpdate }: { url: string, isPlaying: boolean, onPlaybackStatusUpdate: (status: any) => void }) => {
    const player = useAudioPlayer(url);

    useEffect(() => {
        if (player) {
            if (isPlaying) {
                player.play();
            } else {
                player.pause();
            }
        }
    }, [isPlaying, player]);

    // Simple status update simulation or actual connection if expo-audio supports it
    // For now we just rely on the player action
    return null;
};

export default function CategoryScreen() {
    const { id, title, color } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const categoryTitle = typeof title === 'string' ? title : 'Category';
    const categoryColor = typeof color === 'string' ? color : '#000000';
    const categoryId = typeof id === 'string' ? id : 'music';

    const [loading, setLoading] = useState(true);
    const [tracks, setTracks] = useState<ItunesResult[]>([]);
    const [activeTrack, setActiveTrack] = useState<ItunesResult | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        loadContent();
    }, [categoryId]);

    const loadContent = async () => {
        setLoading(true);
        const data = await getCategoryContent(categoryId);
        setTracks(data);
        setLoading(false);
    };

    const handleTrackPress = (track: ItunesResult) => {
        if (activeTrack?.trackId === track.trackId) {
            setIsPlaying(!isPlaying);
        } else {
            setActiveTrack(track);
            setIsPlaying(true);
        }
    };

    const renderItem = ({ item, index }: { item: ItunesResult, index: number }) => {
        const isActive = activeTrack?.trackId === item.trackId;

        return (
            <TouchableOpacity
                style={[styles.trackItem, isActive && styles.activeTrackItem]}
                onPress={() => handleTrackPress(item)}
                activeOpacity={0.7}
            >
                <Image
                    source={item.artworkUrl100}
                    style={styles.artwork}
                    contentFit="cover"
                />
                <View style={styles.trackInfo}>
                    <Text style={[styles.trackName, isActive && { color: categoryColor }]} numberOfLines={1}>
                        {item.trackName}
                    </Text>
                    <Text style={styles.artistName} numberOfLines={1}>
                        {item.artistName}
                    </Text>
                </View>
                <View style={styles.playIconContainer}>
                    <Ionicons
                        name={isActive && isPlaying ? "pause-circle" : "play-circle"}
                        size={32}
                        color={isActive ? categoryColor : "#CCC"}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top,
                backgroundColor: categoryColor
            }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{categoryTitle}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.headerBackground}>
                    <Text style={styles.hugeTitle}>{categoryTitle}</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={categoryColor} />
                    </View>
                ) : (
                    <FlatList
                        data={tracks}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.trackId.toString()}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingBottom: activeTrack ? 120 : 40 }
                        ]}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No content found</Text>
                            </View>
                        )}
                    />
                )}
            </View>

            {/* Audio Controller (Logic) */}
            {activeTrack && activeTrack.previewUrl && (
                <AudioController
                    key={activeTrack.trackId}
                    url={activeTrack.previewUrl}
                    isPlaying={isPlaying}
                    onPlaybackStatusUpdate={() => { }}
                />
            )}

            {/* Mini Player */}
            {activeTrack && (
                <BlurView intensity={80} tint="light" style={[styles.miniPlayer, { paddingBottom: insets.bottom + 12 }]}>
                    <View style={styles.miniPlayerContent}>
                        <Image
                            source={activeTrack.artworkUrl100}
                            style={styles.miniArtwork}
                        />
                        <View style={styles.miniInfo}>
                            <Text style={styles.miniTrackName} numberOfLines={1}>{activeTrack.trackName}</Text>
                            <Text style={styles.miniArtistName} numberOfLines={1}>{activeTrack.artistName}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                            <Ionicons
                                name={isPlaying ? "pause" : "play"}
                                size={28}
                                color="#1C1C1E"
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.progressBar, { width: isPlaying ? '100%' : '0%', backgroundColor: categoryColor }]} />
                </BlurView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9FB',
    },
    header: {
        paddingBottom: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    headerBackground: {
        position: 'absolute',
        bottom: -20,
        left: 20,
        opacity: 0.2,
    },
    hugeTitle: {
        fontSize: 80,
        fontWeight: '800',
        color: 'white',
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    activeTrackItem: {
        borderColor: 'rgba(0,0,0,0.05)',
        backgroundColor: '#F8F8F8',
    },
    artwork: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#EEE',
    },
    trackInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    trackName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    artistName: {
        fontSize: 14,
        color: '#8E8E93',
    },
    playIconContainer: {
        marginLeft: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: {
        color: '#8E8E93',
        fontSize: 16,
    },
    miniPlayer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    miniPlayerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 0,
    },
    miniArtwork: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#EEE',
    },
    miniInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    miniTrackName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    miniArtistName: {
        fontSize: 12,
        color: '#8E8E93',
    },
    progressBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 2,
    }
});
