import { useUser } from "@clerk/clerk-expo";
import * as Location from 'expo-location';
import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { User } from "../utils/types";

interface UserContextType {
    userData: User | null;
    loading: boolean;
    unreadCount: number;
}

const UserContext = createContext<UserContextType>({
    userData: null,
    loading: true,
    unreadCount: 0,
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    // Sync user profile & listen to user data changes
    useEffect(() => {
        if (!user) {
            setUserData(null);
            setLoading(false);
            return;
        }

        const userRef = doc(db, "users", user.id);

        const syncUser = async () => {
            try {
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    const newUser: User = {
                        uid: user.id,
                        email: user.primaryEmailAddress?.emailAddress || "",
                        displayName: user.fullName || user.username || "User",
                        username: (user.username || user.fullName?.replace(/\s+/g, '').toLowerCase() || "user") + Math.floor(Math.random() * 10000),
                        photoURL: user.imageUrl,
                        isAdmin: false,
                        createdAt: serverTimestamp(),
                        lastLoginAt: serverTimestamp(),
                    };
                    await setDoc(userRef, newUser);

                    // Trigger Welcome Notification
                    const { createNotification } = await import("../utils/notifications");
                    await createNotification({
                        recipientId: user.id,
                        type: 'welcome',
                        title: "Welcome to Siora! 🧘‍♂️",
                        description: "We're glad to have you on your journey to mindfulness.",
                    });
                } else {
                    const data = userSnap.data();
                    const updates: any = { lastLoginAt: serverTimestamp() };

                    if (!data.username) {
                        updates.username = (user.username || user.fullName?.replace(/\s+/g, '').toLowerCase() || "user") + Math.floor(Math.random() * 10000);
                    }

                    if (!data.location) {
                        try {
                            const { status } = await Location.getForegroundPermissionsAsync();
                            if (status === 'granted') {
                                const location = await Location.getCurrentPositionAsync({});
                                const reverseGeocode = await Location.reverseGeocodeAsync({
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude
                                });
                                if (reverseGeocode.length > 0) {
                                    const address = reverseGeocode[0];
                                    const city = address.city || address.subregion || address.district || address.name;
                                    const country = address.country || address.region;
                                    const locationString = [city, country].filter(Boolean).join(', ');
                                    if (locationString) {
                                        updates.location = locationString;
                                    }
                                }
                            }
                        } catch (e) {
                            console.log("Auto-location failed", e);
                        }
                    }

                    await setDoc(userRef, updates, { merge: true });
                }
            } catch (error) {
                console.error("Error syncing user to Firestore:", error);
            }
        };

        syncUser();

        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                setUserData(doc.data() as User);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Track unread notifications count - Updated to use the new 'notifications' table
    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        const q = query(
            collection(db, 'notifications'),
            where('recipientId', '==', user.id),
            where('isMarkedRead', '==', false)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setUnreadCount(snapshot.size);
        }, (err) => {
            console.error("Error listening to notification unread count", err);
        });

        return () => unsub();
    }, [user]);

    return (
        <UserContext.Provider value={{ userData, loading, unreadCount }}>
            {children}
        </UserContext.Provider>
    );
};
