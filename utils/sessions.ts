import { ImageSourcePropType } from "react-native";

interface Session {
    id: number;
    title: string;
    description: string;
    image: ImageSourcePropType | undefined;
    themeColors?: {
        primary: string;
        secondary: string;
        accent: string;
    };
    videoUrl?: string;
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
        whyRecommended: Array<{
            icon: string;
            label: string;
            color: string;
            isActive: boolean;
        }>;
    };
}

export const sessions: Session[] = [
    {
        id: 1,
        title: "Forest Serenity",
        description: "Mindful walking through nature",
        image: { uri: "https://repo-asset.vercel.app/assets/forest-path.png" },
        themeColors: {
            primary: "#2D5016",
            secondary: "#7CB342",
            accent: "#AED581"
        }
    },
    {
        id: 2,
        title: "Mountain Stillness",
        description: "Grounding mountain meditation practice",
        image: { uri: "https://repo-asset.vercel.app/assets/mountain-view.png" },
        themeColors: {
            primary: "#455A64",
            secondary: "#78909C",
            accent: "#B0BEC5"
        }
    },
    {
        id: 3,
        title: "Ocean Rhythms",
        description: "Relaxing ocean meditation practice",
        image: { uri: "https://repo-asset.vercel.app/assets/ocean-waves.png" },
        themeColors: {
            primary: "#006064",
            secondary: "#0097A7",
            accent: "#4DD0E1"
        }
    },
    {
        id: 4,
        title: "Morning Glow",
        description: "Morning mindfulness practice",
        image: { uri: "https://repo-asset.vercel.app/assets/sunrise-sky.png" },
        themeColors: {
            primary: "#F57C00",
            secondary: "#FFB74D",
            accent: "#FFE082"
        }
    },
    {
        id: 5,
        title: "Zen Balance",
        description: "Focused balance practice",
        image: { uri: "https://repo-asset.vercel.app/assets/zen-stones.png" },
        themeColors: {
            primary: "#5D4037",
            secondary: "#8D6E63",
            accent: "#BCAAA4"
        }
    }
]

export const dailyRecommendations: Session[] = [
    {
        id: 101,
        title: "Sleep Journey",
        description: "Drift off into deep relaxation",
        image: { uri: "https://repo-asset.vercel.app/assets/sleep-journey.png" },
        themeColors: {
            primary: "#1A237E",
            secondary: "#5C6BC0",
            accent: "#9FA8DA"
        },
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
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
            ],
            whyRecommended: [
                { icon: "moon", label: "Sleep", color: "#9FA8DA", isActive: true },
                { icon: "heart", label: "Wellness", color: "#CE93D8", isActive: false },
                { icon: "time", label: "Evening", color: "#90CAF9", isActive: false }
            ]
        }
    },
    {
        id: 102,
        title: "Anxiety Release",
        description: "Let go of daily stressors",
        image: { uri: "https://repo-asset.vercel.app/assets/anxiety-release.png" },
        themeColors: {
            primary: "#00695C",
            secondary: "#4DB6AC",
            accent: "#B2DFDB"
        },
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
            ],
            whyRecommended: [
                { icon: "leaf", label: "Calm", color: "#80CBC4", isActive: false },
                { icon: "sunny", label: "Energy", color: "#FFD54F", isActive: true },
                { icon: "fitness", label: "Balance", color: "#A5D6A7", isActive: false }
            ]
        }
    },
    {
        id: 103,
        title: "Focus Flow",
        description: "Enhance your concentration",
        image: { uri: "https://repo-asset.vercel.app/assets/focus-flow.png" },
        themeColors: {
            primary: "#E65100",
            secondary: "#FF9800",
            accent: "#FFD54F"
        },
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
            ],
            whyRecommended: [
                { icon: "flash", label: "Focus", color: "#FFD700", isActive: true },
                { icon: "trending-up", label: "Growth", color: "#FF9800", isActive: false },
                { icon: "bulb", label: "Clarity", color: "#FFA726", isActive: false }
            ]
        }
    }
]