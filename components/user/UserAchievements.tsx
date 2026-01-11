import { db } from '@/utils/firebase';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const THEME = {
    card: '#F8F9FA',
    text: '#111827',
    textSecondary: '#6B7280',
    primary: '#2563EB',
    textTertiary: '#9CA3AF',
};

export interface Achievement {
    id: string;
    achievement_type: string;
    title: string;
    description: string;
    earned_at?: any;
    user_id: string;
}

interface UserAchievementsProps {
    userId: string;
}

const AchievementCard = ({ item }: { item: Achievement }) => {
    let iconName: any = 'trophy';
    let color = THEME.primary;

    // Switch case for icon/color logic based on achievement_type
    switch (item.achievement_type) {
        case 'breathing_exercise_completed':
            iconName = 'leaf';
            color = '#10B981'; // Emerald/Green for breathing
            break;

        case 'first_follow':
            iconName = 'person-add';
            color = '#3B82F6'; // Blue
            break;

        case 'five_followers':
            iconName = 'star';
            color = '#F59E0B'; // Amber
            break;
        default:
            iconName = 'ribbon';
            color = THEME.textSecondary;
            break;
    }

    return (
        <View style={[styles.achievementItem, { backgroundColor: THEME.card }]}>
            <View style={[styles.achievementIconBox, { backgroundColor: color + '15' }]}>
                <Ionicons name={iconName} size={22} color={color} />
            </View>
            <View style={styles.achievementContent}>
                <Text style={[styles.achievementTitle, { color: THEME.text }]}>{item.title}</Text>
                <Text style={[styles.achievementDesc, { color: THEME.textSecondary }]}>{item.description}</Text>
            </View>
        </View>
    );
};

export default function UserAchievements({ userId }: UserAchievementsProps) {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!userId) return;
            try {
                // Query top-level 'achievements' collection where user_id matches
                const q = query(
                    collection(db, 'achievements'),
                    where('user_id', '==', userId)
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
                    setAchievements(data);
                } else {
                    setAchievements([]);
                }
            } catch (error) {
                console.error("Error fetching achievements", error);
                setAchievements([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, [userId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                {/* Minimal loader or skeleton could go here */}
            </View>
        );
    }

    if (achievements.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={32} color={THEME.textTertiary} />
                <Text style={[styles.emptyText, { color: THEME.textSecondary }]}>No achievements yet</Text>
            </View>
        );
    }

    return (
        <View style={styles.achievementsList}>
            {achievements.map((item) => (
                <AchievementCard key={item.id} item={item} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    achievementsList: {
        gap: 12,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 16,
    },
    achievementIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    achievementContent: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    achievementDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '500',
    },
});
