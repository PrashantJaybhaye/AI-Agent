import { db } from '@/utils/firebase';
import { ItunesResult } from '@/utils/itunesApi';
import { useAuth } from '@clerk/clerk-expo';
import { arrayRemove, arrayUnion, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface PlaylistContextType {
    savedItems: ItunesResult[];
    addToPlaylist: (item: ItunesResult) => Promise<void>;
    removeFromPlaylist: (trackId: number) => Promise<void>;
    isSaved: (trackId: number) => boolean;
    isLoading: boolean;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const usePlaylist = () => {
    const context = useContext(PlaylistContext);
    if (!context) {
        throw new Error('usePlaylist must be used within a PlaylistProvider');
    }
    return context;
};

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
    const { userId } = useAuth();
    const [savedItems, setSavedItems] = useState<ItunesResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setSavedItems([]);
            setIsLoading(false);
            return;
        }

        const playlistRef = doc(db, 'playlists', userId);

        // Real-time listener
        const unsubscribe = onSnapshot(playlistRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSavedItems(data.items || []);
            } else {
                setSavedItems([]);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to playlist:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const addToPlaylist = async (item: ItunesResult) => {
        if (!userId) return;
        try {
            const playlistRef = doc(db, 'playlists', userId);

            // Allow optimistic UI updates if needed, but Firestore listener handles it fast.
            // Using arrayUnion to avoid duplicates
            // Check if doc exists first or use set with merge
            await setDoc(playlistRef, {
                userId: userId,
                items: arrayUnion(item)
            }, { merge: true });

        } catch (error) {
            console.error('Error adding to playlist:', error);
        }
    };

    const removeFromPlaylist = async (trackId: number) => {
        if (!userId) return;
        try {
            const itemToRemove = savedItems.find(i => i.trackId === trackId);
            if (!itemToRemove) return;

            const playlistRef = doc(db, 'playlists', userId);
            await updateDoc(playlistRef, {
                items: arrayRemove(itemToRemove)
            });
        } catch (error) {
            console.error('Error removing from playlist:', error);
        }
    };

    const isSaved = (trackId: number) => {
        return savedItems.some(item => item.trackId === trackId);
    };

    return (
        <PlaylistContext.Provider value={{ savedItems, addToPlaylist, removeFromPlaylist, isSaved, isLoading }}>
            {children}
        </PlaylistContext.Provider>
    );
};