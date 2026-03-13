import { db } from '@/utils/firebase';
import { Achievement, Session, StreakEntry, User } from '@/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc, onSnapshot, query, where, Timestamp, limit } from 'firebase/firestore';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface UserActivityProps {
    userId: string;
    isMutual: boolean;
    isFollowing: boolean;
    isSelf: boolean;
}

type ActivityItem = {
    id: string;
    type: 'session' | 'streak' | 'achievement' | 'joined';
    title: string;
    subtitle: string;
    description?: string;
    timestamp: Date;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
};

type GroupedActivity = {
    date: string;
    items: ActivityItem[];
};

export default function UserActivity({ userId, isMutual, isFollowing, isSelf }: UserActivityProps) {
    const [groupedActivities, setGroupedActivities] = useState<GroupedActivity[]>([]);
    const [privacyStatus, setPrivacyStatus] = useState<'allowed' | 'denied' | 'loading'>('loading');

    const formatDateHeader = (date: Date) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (itemDate.getTime() === today.getTime()) return 'Today';
        if (itemDate.getTime() === yesterday.getTime()) return 'Yesterday';
        
        return itemDate.toLocaleDateString(undefined, { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "0m";
        const mins = Math.floor(seconds / 60);
        if (mins === 0) return `${seconds}s`;
        return `${mins}m`;
    };

    useEffect(() => {
        if (!userId) return;

        setPrivacyStatus('loading');
        let unsubscribeFunctions: (() => void)[] = [];

        const startFetchingData = (userData: User | null) => {
            // Speed optimization: add limits to activity queries
            const sessionsQuery = query(
                collection(db, 'session'), 
                where('user_id', '==', userId),
                limit(15)
            );
            const streakQuery = query(
                collection(db, 'streak'), 
                where('user_id', '==', userId),
                limit(15)
            );

            let sessionsData: Session[] = [];
            let streakData: StreakEntry[] = [];

            const mergeAndSetActivities = () => {
                const items: ActivityItem[] = [];

                // AI Sessions
                sessionsData.forEach(s => {
                    items.push({
                        id: s.id,
                        type: 'session',
                        title: s.call_summary_title || "Mindful Reflection",
                        subtitle: `${formatDuration(s.call_duration_secs)} Exploration`,
                        description: s.transcript_summary || undefined,
                        timestamp: s.created_at ? new Date(s.created_at) : new Date(),
                        icon: 'sparkles',
                        color: '#6366F1',
                        bgColor: '#EEF2FF'
                    });
                });

                // Streak Entries (Exercises)
                streakData.forEach(st => {
                    items.push({
                        id: st.id || Math.random().toString(),
                        type: 'streak',
                        title: st.session_title || "Breathing Exercise",
                        subtitle: `${st.session_type === 'breathing' ? 'Breathwork' : 'Guided'} • ${Math.round(st.total_session_duration_seconds / 60)}m`,
                        timestamp: st.completion_time instanceof Timestamp ? st.completion_time.toDate() : new Date(),
                        icon: 'leaf',
                        color: '#10B981',
                        bgColor: '#ECFDF5'
                    });
                });

                // Joined Event
                if (userData?.createdAt && items.length < 5) {
                    const joinedDate = userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : new Date(userData.createdAt);
                    items.push({
                        id: 'joined',
                        type: 'joined',
                        title: 'Journey Began',
                        subtitle: 'Member of Siora Community',
                        timestamp: joinedDate,
                        icon: 'flag-sharp',
                        color: '#3B82F6',
                        bgColor: '#EFF6FF'
                    });
                }

                // Sort and Group
                items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                
                const groups: { [key: string]: ActivityItem[] } = {};
                items.forEach(item => {
                    const dateKey = formatDateHeader(item.timestamp);
                    if (!groups[dateKey]) groups[dateKey] = [];
                    groups[dateKey].push(item);
                });

                setGroupedActivities(Object.keys(groups).map(date => ({
                    date,
                    items: groups[date]
                })));
            };

            unsubscribeFunctions.push(onSnapshot(sessionsQuery, (snap) => {
                sessionsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
                mergeAndSetActivities();
            }));

            unsubscribeFunctions.push(onSnapshot(streakQuery, (snap) => {
                streakData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as StreakEntry));
                mergeAndSetActivities();
            }));
        };

        // Faster privacy check
        getDoc(doc(db, 'users', userId)).then(docSnap => {
            if (docSnap.exists()) {
                const user = { uid: docSnap.id, ...docSnap.data() } as User;
                const privacy = user?.activityPrivacy || 'followers';
                const isAllowed = isSelf || (privacy === 'public') || (privacy === 'followers' && isFollowing);

                if (!isAllowed) {
                    setPrivacyStatus('denied');
                } else {
                    setPrivacyStatus('allowed');
                    startFetchingData(user);
                }
            } else {
                setPrivacyStatus('denied');
            }
        });

        return () => unsubscribeFunctions.forEach(unsub => unsub());
    }, [userId, isFollowing, isSelf]);

    if (privacyStatus === 'loading') {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="small" color="#6366F1" />
            </View>
        );
    }

    if (privacyStatus === 'denied') {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.iconBg}>
                    <Ionicons name="lock-closed" size={32} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyTitle}>Private Activity</Text>
                <Text style={styles.emptyText}>This user's practice is private.</Text>
            </View>
        );
    }

    if (groupedActivities.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.iconBg}>
                    <Ionicons name="journal-outline" size={32} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyTitle}>No Activity Yet</Text>
                <Text style={styles.emptyText}>Start your first session to see it here.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {groupedActivities.map((group, groupIdx) => (
                <View key={group.date} style={styles.dateGroup}>
                    <Text style={styles.dateHeader}>{group.date}</Text>
                    {group.items.map((item, itemIdx) => (
                        <Animated.View 
                            key={item.id + itemIdx} 
                            entering={FadeInDown.delay(itemIdx * 100)}
                            style={styles.timelineItem}
                        >
                            {/* Line */}
                            <View style={[
                                styles.timelineLine,
                                (itemIdx === group.items.length - 1 && groupIdx === groupedActivities.length - 1) && { height: 20 }
                            ]} />
                            
                            {/* Node */}
                            <View style={[styles.timelineNode, { borderColor: item.color + '40' }]}>
                                <View style={[styles.nodeInner, { backgroundColor: item.color }]} />
                            </View>

                            <View style={styles.itemCard}>
                                <View style={styles.itemHeader}>
                                    <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
                                        <Ionicons name={item.icon} size={16} color={item.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                                    </View>
                                    <Text style={styles.itemTime}>{formatTime(item.timestamp)}</Text>
                                </View>
                                
                                {item.description && (
                                    <Text style={styles.itemDescription} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                )}
                            </View>
                        </Animated.View>
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
    },
    centerContainer: {
        alignItems: 'center',
        paddingVertical: 80,
        gap: 12,
    },
    iconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        maxWidth: '80%',
    },
    dateGroup: {
        marginBottom: 24,
    },
    dateHeader: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 20,
        paddingLeft: 40,
    },
    timelineItem: {
        flexDirection: 'row',
        paddingLeft: 40,
        marginBottom: 16,
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        left: 20,
        top: 24,
        bottom: -16,
        width: 2,
        backgroundColor: '#F3F4F6',
    },
    timelineNode: {
        position: 'absolute',
        left: 11,
        top: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 4,
        backgroundColor: '#FFFFFF',
        zIndex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nodeInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    itemCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        
        // Removed soft shadow and added 3D border
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderBottomWidth: 4,
        borderBottomColor: '#D1D5DB',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: -0.2,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    itemTime: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        textTransform: 'uppercase',
    },
    itemDescription: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 10,
        lineHeight: 18,
        fontStyle: 'italic',
    },
});
