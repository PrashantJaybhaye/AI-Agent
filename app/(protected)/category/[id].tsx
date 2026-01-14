import { usePlaylist } from '@/context/PlaylistContext';
import { getCategoryContent, ItunesResult } from '@/utils/itunesApi';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Component to handle audio playback
const AudioController = ({ url, isPlaying, onPlaybackStatusUpdate }: { url: string, isPlaying: boolean, onPlaybackStatusUpdate: (status: any) => void }) => {
    const player = useAudioPlayer(url);
    const status = useAudioPlayerStatus(player);

    useEffect(() => {
        if (player) {
            if (isPlaying) {
                player.play();
            } else {
                player.pause();
            }
        }
    }, [isPlaying, player]);

    useEffect(() => {
        if (status) {
            onPlaybackStatusUpdate(status);
        }
    }, [status]);

    return null;
};

// FullPlayer component removed

export default function CategoryScreen() {
    const { id, title, color } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const categoryTitle = typeof title === 'string' ? title : 'Category';
    const categoryColor = typeof color === 'string' ? color : '#000000';
    const categoryId = typeof id === 'string' ? id : 'music';

    const [loading, setLoading] = useState(true);
    const [activeTrack, setActiveTrack] = useState<ItunesResult | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [progress, setProgress] = useState(0);

    const { savedItems, addToPlaylist, removeFromPlaylist, isSaved, isLoading: isPlaylistLoading } = usePlaylist();

    // Tracks state (restored)
    const [tracks, setTracks] = useState<ItunesResult[]>([]);

    // Sync 'Made For You' playlist separately
    useEffect(() => {
        if (categoryId === 'made') {
            setTracks(savedItems);
            setLoading(isPlaylistLoading);
        }
    }, [categoryId, savedItems, isPlaylistLoading]);

    // Fetch API content only when category changes, not when items are saved
    useEffect(() => {
        if (categoryId === 'made') return;

        const fetchContent = async () => {
            setLoading(true);
            const data = await getCategoryContent(categoryId);
            setTracks(data);
            setLoading(false);
        };

        fetchContent();
    }, [categoryId]);

    const handleTrackPress = (track: ItunesResult) => {
        if (activeTrack?.trackId === track.trackId) {
            setIsPlaying(!isPlaying);
        } else {
            setActiveTrack(track);
            setIsPlaying(true);
            setIsBuffering(true);
            setProgress(0);
        }
    };

    const handleNextTrack = () => {
        if (!activeTrack || tracks.length === 0) return;

        const currentIndex = tracks.findIndex(t => t.trackId === activeTrack.trackId);
        if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
            const nextTrack = tracks[currentIndex + 1];
            setActiveTrack(nextTrack);
            setIsPlaying(true);
            setIsBuffering(true);
            setProgress(0);
        } else if (currentIndex === tracks.length - 1) {
            // Loop back to first track or stop? Let's loop for now
            const nextTrack = tracks[0];
            setActiveTrack(nextTrack);
            setIsPlaying(true);
            setIsBuffering(true);
            setProgress(0);
        }
    };

    const renderItem = ({ item, index }: { item: ItunesResult, index: number }) => {
        const isActive = activeTrack?.trackId === item.trackId;
        const saved = isSaved(item.trackId);

        const handleToggleSave = () => {
            if (saved) {
                removeFromPlaylist(item.trackId);
            } else {
                addToPlaylist(item);
            }
        };

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

                {/* Add/Remove Button */}
                {categoryId !== 'made' && (
                    <TouchableOpacity
                        style={{ padding: 8 }}
                        onPress={handleToggleSave}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={saved ? "add-circle" : "add-circle-outline"}
                            size={28}
                            color={saved ? categoryColor : "#C7C7CC"}
                        />
                    </TouchableOpacity>
                )}

                <View style={styles.playIconContainer}>
                    {isActive && isBuffering ? (
                        <ActivityIndicator size="small" color={categoryColor} />
                    ) : (
                        <Ionicons
                            name={isActive && isPlaying ? "pause-circle" : "play-circle"}
                            size={32}
                            color={isActive ? categoryColor : "#CCC"}
                        />
                    )}
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
                        <Ionicons name="chevron-back" size={24} color="white" />
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
                        keyExtractor={(item, index) => item.trackId ? item.trackId.toString() : index.toString()}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingBottom: activeTrack ? 120 : 40 },
                            tracks.length === 0 && { flex: 1, justifyContent: 'center' }
                        ]}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIconContainer}>
                                    <Ionicons
                                        name={categoryId === 'made' ? "musical-notes" : "search-outline"}
                                        size={48}
                                        color={categoryColor}
                                        style={{ opacity: 0.8 }}
                                    />
                                </View>
                                <Text style={styles.emptyTitle}>
                                    {categoryId === 'made' ? "Your Playlist is Empty" : "No Content Found"}
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    {categoryId === 'made'
                                        ? "Start building your personal collection by adding tracks from other categories."
                                        : "We couldn't find any tracks for this category. Please try again later."}
                                </Text>
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
                    onPlaybackStatusUpdate={(status) => {
                        setIsBuffering(status.isBuffering);
                        if (status.duration > 0) {
                            setProgress((status.currentTime / status.duration) * 100);
                        }
                        if (status.didJustFinish) {
                            handleNextTrack();
                        }
                    }}
                />
            )}

            {/* Mini Player */}
            {activeTrack && (
                <View style={[styles.miniPlayerWrapper, { paddingBottom: insets.bottom }]}>
                    {/* Progress Bar at Top */}
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>

                    <Pressable
                        style={styles.miniPlayerContent}
                    // onPress removed as full player is gone
                    >
                        {/* Left: Artwork */}
                        <Image
                            source={activeTrack.artworkUrl100}
                            style={styles.miniArtwork}
                        />

                        <View style={styles.miniInfo}>
                            <Text style={styles.miniTrackName} numberOfLines={1}>{activeTrack.trackName}</Text>
                            <Text style={styles.miniArtistName} numberOfLines={1}>{activeTrack.artistName}</Text>
                        </View>

                        {/* Right: Controls */}
                        <View style={styles.miniControls}>
                            <TouchableOpacity style={styles.heartButton}>
                                <Ionicons name="heart" size={24} color="#FF4785" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setIsPlaying(!isPlaying)}
                                style={styles.playButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                disabled={isBuffering}
                            >
                                {isBuffering ? (
                                    <ActivityIndicator color="black" size="small" />
                                ) : (
                                    <Ionicons
                                        name={isPlaying ? "pause" : "play"}
                                        size={24}
                                        color="#000000"
                                    />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.nextButton} onPress={handleNextTrack}>
                                <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </View>
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
        padding: 8,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.9)', // Slightly transparent if needed, or plain white
        borderRadius: 12,
        marginBottom: 8, // Tighter spacing
        // Minimal shadow for flat "card" look
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    activeTrackItem: {
        borderColor: 'rgba(0,0,0,0.05)',
        backgroundColor: '#F8F8F8',
    },
    artwork: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#EEE',
    },
    trackInfo: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    trackName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 2,
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
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
    },
    miniPlayerWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#202020', // Move background color here
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden', // Ensure content doesn't bleed
    },
    /* miniPlayerContainer removed */
    miniPlayerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 72,
        paddingHorizontal: 16,
    },
    miniArtwork: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    miniInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },

    miniTrackName: {
        fontSize: 15,
        fontWeight: '700', // Bold
        color: 'white',
        // marginRight: 8, // Removed
        // maxWidth: '85%', // Removed
    },
    miniArtistName: {
        fontSize: 13,
        color: '#B3B3B3', // Muted text
        marginTop: 2,
    },
    heartButton: {
        padding: 4,
    },
    miniControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingLeft: 8,
    },
    playButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF', // High contrast White
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButton: {
        padding: 4,
    },
    progressBarBg: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.08)',
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 10,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FF4785', // Matches heart accent
        shadowColor: '#FF4785',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6, // Glowing effect
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
    },
    // Full Player Styles
});
