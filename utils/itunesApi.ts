export interface ItunesResult {
    trackId: number;
    artistName: string;
    trackName: string;
    previewUrl: string;
    artworkUrl100: string;
}

export const searchItunes = async (term: string, entity: string = 'song', limit: number = 20): Promise<ItunesResult[]> => {
    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=${limit}`;
        const response = await fetch(url);
        const data = await response.json();

        // Filter and map results to ensure consistent data structure
        return data.results
            .filter((item: any) => item.previewUrl && (item.trackId || item.collectionId))
            .map((item: any) => ({
                trackId: item.trackId || item.collectionId,
                trackName: item.trackName || item.collectionName || 'Unknown Title',
                artistName: item.artistName || 'Unknown Artist',
                previewUrl: item.previewUrl,
                artworkUrl100: item.artworkUrl100 || item.artworkUrl60 || '',
            }))
            .sort((a: ItunesResult, b: ItunesResult) => a.trackName.localeCompare(b.trackName));
    } catch (error) {
        console.error('Error fetching from iTunes:', error);
        return [];
    }
};

export const getCategoryContent = async (categoryId: string) => {
    switch (categoryId) {
        // Fetch some trending or genre specific music
        case 'music':
            return await searchItunes('pop hits', 'song');
        case 'podcasts':
            return await searchItunes('meditation', 'podcastEpisode');
        case 'audiobooks':
            return await searchItunes('audiobook', 'audiobook');
        case 'made':
            return [];
        default:
            return await searchItunes('music', 'song');
    }
};
