import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type NotificationType = 'achievement' | 'follower' | 'system' | 'welcome';

export interface AppNotification {
    id?: string;
    recipientId: string;    // The user who receives the notification
    senderId?: string;       // Optional: The user who triggered it (e.g., the follower)
    senderName?: string;     // Denormalized name for security (don't fetch full user object)
    senderPhoto?: string;    // Denormalized photo
    type: NotificationType;
    title: string;
    description: string;
    relatedId?: string;      // ID of the related object (e.g., achievement ID or follow doc ID)
    isMarkedRead: boolean;
    createdAt: any;
}

/**
 * Creates a notification in the dedicated 'notifications' collection.
 * This approach is more secure as it centralizes notifications and allows 
 * for strict security rules where users can only read docs where recipientId == theirUid.
 */
export async function createNotification(params: {
    recipientId: string;
    type: NotificationType;
    title: string;
    description: string;
    senderId?: string;
    relatedId?: string;
}) {
    try {
        let senderName = "";
        let senderPhoto = "";

        // If there's a sender, fetch basic info once to denormalize (Cybersafe: limited data)
        if (params.senderId) {
            const userSnap = await getDoc(doc(db, "users", params.senderId));
            if (userSnap.exists()) {
                const userData = userSnap.data();
                senderName = userData.displayName || "Someone";
                senderPhoto = userData.photoURL || "";
            }
        }

        const notificationData: any = {
            recipientId: params.recipientId,
            senderName: senderName,
            senderPhoto: senderPhoto,
            type: params.type,
            title: params.title,
            description: params.description,
            isMarkedRead: false,
            createdAt: serverTimestamp(),
        };

        if (params.senderId) notificationData.senderId = params.senderId;
        if (params.relatedId) notificationData.relatedId = params.relatedId;

        await addDoc(collection(db, "notifications"), notificationData);
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

/**
 * Removes notifications matching a specific relatedId and type.
 * Useful for undoing notifications (e.g., when unfollowing).
 */
export async function removeNotification(params: {
    recipientId: string;
    type: NotificationType;
    relatedId: string;
}) {
    try {
        const { getDocs, query, where, collection, deleteDoc } = await import("firebase/firestore");
        const q = query(
            collection(db, "notifications"),
            where("recipientId", "==", params.recipientId),
            where("type", "==", params.type),
            where("relatedId", "==", params.relatedId)
        );

        const snapshot = await getDocs(q);
        const promises = snapshot.docs.map(notificationDoc => deleteDoc(notificationDoc.ref));
        await Promise.all(promises);
    } catch (error) {
        console.error("Error removing notification:", error);
    }
}
