import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type NotificationType = 'achievement' | 'follower' | 'system' | 'welcome';

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

        // Send local push notification
        try {
            const { sendLocalNotification } = await import("./pushNotifications");

            const categoryIdentifier =
                params.type === 'achievement' ? 'achievement' as const :
                    params.type === 'follower' ? 'social' as const :
                        'default' as const;

            const notificationBody = params.type === 'follower' && senderName
                ? `${senderName} ${params.description}`
                : params.description;

            await sendLocalNotification({
                title: params.title,
                body: notificationBody,
                data: {
                    type: params.type,
                    relatedId: params.relatedId,
                    senderId: params.senderId,
                },
                categoryIdentifier,
            });
        } catch (pushError) {
            console.error('Push notification error:', pushError);
        }
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

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
