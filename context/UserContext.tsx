import { useUser } from "@clerk/clerk-expo";
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
                        photoURL: user.imageUrl,
                        isAdmin: false,
                        createdAt: serverTimestamp(),
                        lastLoginAt: serverTimestamp(),
                    };
                    await setDoc(userRef, newUser);
                } else {
                    // Update last login
                    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
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
