import { useUser } from "@clerk/clerk-expo";
import * as Location from 'expo-location';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { User } from "../utils/types";

interface UserContextType {
    userData: User | null;
    loading: boolean;
}

const UserContext = createContext<UserContextType>({
    userData: null,
    loading: true,
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

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
                    // Create new user document
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
                } else {
                    // Update last login & ensure username exists
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

        // Listen to user changes
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

    return (
        <UserContext.Provider value={{ userData, loading }}>
            {children}
        </UserContext.Provider>
    );
};
