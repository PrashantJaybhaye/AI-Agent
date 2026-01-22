import { db } from '@/utils/firebase';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

const THEME = {
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    primary: '#2563EB',
    textTertiary: '#9CA3AF',
    border: '#F3F4F6',
    shadow: 'rgba(0,0,0,0.06)'
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

    let mainColor = '#FFC800';
    let shadowColor = '#E5B400';

    switch (item.achievement_type) {
        case 'breathing_exercise_completed':
            iconName = 'headset';
            mainColor = '#58CC02';
            shadowColor = '#46A302';
            break;

        case 'first_follow':
            iconName = 'person-add-outline';
            mainColor = '#1CB0F6';
            shadowColor = '#1899D6';
            break;

        case 'five_followers':
            iconName = 'star';
            mainColor = '#FFC800';
            shadowColor = '#E5B400';
            break;

        case 'pioneer':
            iconName = 'rocket';
            mainColor = '#CE82FF';
            shadowColor = '#A545EE';
            break;

        default:
            iconName = 'ribbon';
            mainColor = '#FF9600';
            shadowColor = '#CC7500';
            break;
    }

    const earnedDate = item.earned_at?.seconds
        ? new Date(item.earned_at.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : null;

    return (
        <View style={styles.cardContainer}>
            {/* Left: Circular "Medal" Icon */}
            <View style={[
                styles.iconBox,
                {
                    backgroundColor: mainColor,
                    borderBottomColor: shadowColor,
                    borderColor: shadowColor
                }
            ]}>
                {/* Inner Ring for Medal Effect */}
                <View style={[styles.innerRing, { borderColor: 'rgba(255,255,255,0.3)' }]} />
                <Ionicons name={iconName} size={24} color="#FFFFFF" />
            </View>

            {/* Right: Content */}
            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    {earnedDate && <Text style={styles.date}>{earnedDate}</Text>}
                </View>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            </View>
        </View>
    );
};

export default function UserAchievements({ userId }: UserAchievementsProps) {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, 'achievements'),
            where('user_id', '==', userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
                setAchievements(data);
            } else {
                setAchievements([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching achievements", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                {/* Optional: Add skeleton here */}
            </View>
        );
    }

    if (achievements.length === 0) {
        return (
            <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                    <Ionicons name="trophy" size={28} color="#E5E7EB" />
                </View>
                <Text style={styles.emptyText}>No achievements yet</Text>
            </View>
        );
    }

    return (
        <View style={styles.listContainer}>
            {achievements.map((item) => (
                <AchievementCard key={item.id} item={item} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        gap: 12, // Tighter gap
        paddingBottom: 20,
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 12, // Reduced padding
        borderRadius: 12, // Slightly smaller radius
        alignItems: 'center',

        // Compact 3D Look
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderBottomWidth: 3, // Thinner 3D edge
        borderBottomColor: '#D1D5DB',
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25, // Circular Medal
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderBottomWidth: 3,
        borderWidth: 2, // Rim width
        position: 'relative',
    },
    innerRing: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        opacity: 0.6,
    },
    cardContent: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2, // Tighter spacing
    },
    title: {
        fontSize: 15, // Smaller title
        fontWeight: '800',
        color: '#4B5563',
        letterSpacing: 0.1,
        flex: 1,
        marginRight: 8,
    },
    date: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 13, // Smaller description
        color: '#6B7280',
        fontWeight: '600',
        lineHeight: 18,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 10,
    },
    emptyIconBg: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderBottomWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#9CA3AF',
    },
});
