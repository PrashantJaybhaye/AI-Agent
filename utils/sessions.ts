import { ImageSourcePropType } from "react-native";

interface Session {
    id: number;
    title: string;
    description: string;
    image: ImageSourcePropType | undefined;
    courseDetails?: {
        participants: string;
        type: string;
        duration: string;
        lessons: number;
        difficulty: string;
        fullDescription: string;
        syllabus?: Array<{
            id: number;
            title: string;
            duration: string;
            videoUrl: string;
            isLocked: boolean;
        }>;
    };
}

export const sessions: Session[] = [
    {
        id: 1,
        title: "Forest Serenity",
        description: "Mindful walking through nature",
        image: { uri: "https://repo-asset.vercel.app/assets/forest-path.png" },
    },
    {
        id: 2,
        title: "Mountain Stillness",
        description: "Grounding mountain meditation practice",
        image: { uri: "https://repo-asset.vercel.app/assets/mountain-view.png" },
    },
    {
        id: 3,
        title: "Ocean Rhythms",
        description: "Relaxing ocean meditation practice",
        image: { uri: "https://repo-asset.vercel.app/assets/ocean-waves.png" },
    },
    {
        id: 4,
        title: "Morning Glow",
        description: "Morning mindfulness practice",
        image: { uri: "https://repo-asset.vercel.app/assets/sunrise-sky.png" },
    },
    {
        id: 5,
        title: "Zen Balance",
        description: "Focused balance practice",
        image: { uri: "https://repo-asset.vercel.app/assets/zen-stones.png" },
    }
]

export const dailyRecommendations: Session[] = [
    {
        id: 101,
        title: "Sleep Journey",
        description: "Drift off into deep relaxation",
        image: { uri: "https://repo-asset.vercel.app/assets/sleep-journey.png" },
        courseDetails: {
            participants: "124K people started",
            type: "Course",
            duration: "7 days",
            lessons: 7,
            difficulty: "Beginner",
            fullDescription: "Discover the art of restful sleep through guided meditation. This 7-day journey will help you unwind, release tension, and prepare your mind and body for deep, restorative sleep. Each session uses calming visualization and breathing techniques.",
            syllabus: [
                { id: 1, title: "The Sleep Mindset", duration: "10 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", isLocked: false },
                { id: 2, title: "Body Scan for Sleep", duration: "12 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", isLocked: false },
                { id: 3, title: "Dreamy Visualization", duration: "15 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", isLocked: true },
                { id: 4, title: "Letting Go of the Day", duration: "10 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", isLocked: true },
                { id: 5, title: "Quietening the Mind", duration: "12 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", isLocked: true },
                { id: 6, title: "Deep Rest Technique", duration: "20 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", isLocked: true },
                { id: 7, title: "Complete Stillness", duration: "15 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", isLocked: true }
            ]
        }
    },
    {
        id: 102,
        title: "Anxiety Release",
        description: "Let go of daily stressors",
        image: { uri: "https://repo-asset.vercel.app/assets/anxiety-release.png" },
        courseDetails: {
            participants: "89K people started",
            type: "Course",
            duration: "10 days",
            lessons: 10,
            difficulty: "All levels",
            fullDescription: "Learn the fundamentals of meditation and mindfulness. You will meditate each day for several minutes, building skills to manage stress and anxiety. Perfect for those seeking calm in a busy world.",
            syllabus: [
                { id: 1, title: "Finding Your Breath", duration: "8 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", isLocked: false },
                { id: 2, title: "Labeling Thoughts", duration: "10 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", isLocked: false },
                { id: 3, title: "Anchoring in Chaos", duration: "12 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", isLocked: true },
                { id: 4, title: "Kindness for Self", duration: "10 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4", isLocked: true },
                { id: 5, title: "The Nature of Anxiety", duration: "15 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", isLocked: true }
            ]
        }
    },
    {
        id: 103,
        title: "Focus Flow",
        description: "Enhance your concentration",
        image: { uri: "https://repo-asset.vercel.app/assets/focus-flow.png" },
        courseDetails: {
            participants: "156K people started",
            type: "Course",
            duration: "14 days",
            lessons: 14,
            difficulty: "Intermediate",
            fullDescription: "Sharpen your mind and boost productivity with focused meditation techniques. This course teaches you how to eliminate distractions, maintain concentration, and achieve flow state in your daily activities.",
            syllabus: [
                { id: 1, title: "Object Concentration", duration: "10 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", isLocked: false },
                { id: 2, title: "Counting the Breath", duration: "12 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", isLocked: false },
                { id: 3, title: "Open Awareness", duration: "15 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", isLocked: true },
                { id: 4, title: "The Flow State", duration: "15 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", isLocked: true },
                { id: 5, title: "Deep Productivity", duration: "20 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", isLocked: true }
            ]
        }
    }
]