import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notifications';

export interface Achievement {
    id?: string;
    user_id: string;
    achievement_type: string;
    title: string;
    description: string;
    earned_at: Timestamp;
}

export async function addAchievement(
    userId: string,
    achievementType: string,
    title: string,
    description: string
): Promise<void> {
    try {
        console.log(`Attempting to add achievement: ${title} for user: ${userId}`);
        const docRef = await addDoc(collection(db, 'achievements'), {
            user_id: userId,
            achievement_type: achievementType,
            title,
            description,
            earned_at: Timestamp.now(),
        });

        // Trigger notification in the new 'notifications' table
        try {
            await createNotification({
                recipientId: userId,
                type: 'achievement',
                title: `${title}`,
                description: description,
                relatedId: docRef.id
            });
        } catch (notifError) {
            console.error('Error sending achievement notification:', notifError);
            // Notification failure shouldn't crash the achievement addition
        }

        console.log('✅ Achievement successfully added to database:', title);

    } catch (error) {
        console.error('Error adding achievement:', error);
        throw error;
    }
}

export async function hasAchievement(
    userId: string,
    achievementType: string
): Promise<boolean> {
    try {
        const achievementsRef = collection(db, 'achievements');
        const q = query(
            achievementsRef,
            where('user_id', '==', userId),
            where('achievement_type', '==', achievementType)
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking achievement:', error);
        return false;
    }
}

export async function addBreathingExerciseAchievement(
    userId: string
): Promise<{ newlyAwarded: boolean }> {
    const achievementType = 'breathing_exercise_completed';
    const hasIt = await hasAchievement(userId, achievementType);

    if (!hasIt) {
        await addAchievement(
            userId,
            achievementType,
            'First Breath',
            'Completed your first breathing exercise'
        );
        return { newlyAwarded: true };
    }

    return { newlyAwarded: false };
}

export async function addFirstFollowAchievement(
    userId: string
): Promise<{ newlyAwarded: boolean }> {
    const achievementType = 'first_follow';
    const hasIt = await hasAchievement(userId, achievementType);

    if (!hasIt) {
        await addAchievement(
            userId,
            achievementType,
            'First Connection',
            'Followed your first user'
        );
        return { newlyAwarded: true };
    }

    return { newlyAwarded: false };
}

export async function checkFiveFollowersAchievement(
    userId: string
): Promise<{ newlyAwarded: boolean }> {
    const achievementType = 'five_followers';
    const hasIt = await hasAchievement(userId, achievementType);

    if (hasIt) {
        return { newlyAwarded: false };
    }

    try {
        const followersQuery = query(
            collection(db, 'follows'),
            where('followingId', '==', userId)
        );
        const snapshot = await getDocs(followersQuery);
        const followerCount = snapshot.size;

        if (followerCount >= 5) {
            await addAchievement(
                userId,
                achievementType,
                'Rising Star',
                'Gained 5 followers'
            );
            return { newlyAwarded: true };
        }
    } catch (error) {
        console.error('Error checking five followers achievement:', error);
    }

    return { newlyAwarded: false };
}
