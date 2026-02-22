import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type NotificationType = 'achievement' | 'system' | 'welcome' | 'follow';

export interface AppNotification {
    id?: string;
    recipientId: string;
    senderId?: string;
    senderName?: string;
    senderPhoto?: string;
    type: NotificationType;
    title: string;
    description: string;
    relatedId?: string;
    isMarkedRead: boolean;
    createdAt: any;
}

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
            senderName,
            senderPhoto,
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

