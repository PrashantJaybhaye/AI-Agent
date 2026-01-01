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
    courseDetails?: {
        participants: string;
        type: string;
        duration: string;
        lessons: number;
        difficulty: string;
        fullDescription: string;
        syllabus?: Array<{
            title: string;
            duration: string;
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
        image: require("@/assets/sessions/forest-path.png"),
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
        image: require("@/assets/sessions/mountain-view.png"),
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
        image: require("@/assets/sessions/ocean-waves.png"),
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
        image: require("@/assets/sessions/sunrise-sky.png"),
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
        image: require("@/assets/sessions/zen-stones.png"),
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
        image: require("@/assets/sessions/sleep-journey.png"),
        themeColors: {
            primary: "#1A237E",
            secondary: "#5C6BC0",
            accent: "#9FA8DA"
        },
        courseDetails: {
            participants: "124K people started",
            type: "Course",
            duration: "7 days",
            lessons: 7,
            difficulty: "Beginner",
            fullDescription: "Discover the art of restful sleep through guided meditation. This 7-day journey will help you unwind, release tension, and prepare your mind and body for deep, restorative sleep. Each session uses calming visualization and breathing techniques.",
            syllabus: [
                { title: "The Sleep Mindset", duration: "10 min" },
                { title: "Body Scan for Sleep", duration: "12 min" },
                { title: "Dreamy Visualization", duration: "15 min" },
                { title: "Letting Go of the Day", duration: "10 min" },
                { title: "Quietening the Mind", duration: "12 min" },
                { title: "Deep Rest Technique", duration: "20 min" },
                { title: "Complete Stillness", duration: "15 min" }
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
        image: require("@/assets/sessions/anxiety-release.png"),
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
                { title: "Finding Your Breath", duration: "8 min" },
                { title: "Labeling Thoughts", duration: "10 min" },
                { title: "Anchoring in Chaos", duration: "12 min" },
                { title: "Kindness for Self", duration: "10 min" },
                { title: "The Nature of Anxiety", duration: "15 min" }
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
        image: require("@/assets/sessions/focus-flow.png"),
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
                { title: "Object Concentration", duration: "10 min" },
                { title: "Counting the Breath", duration: "12 min" },
                { title: "Open Awareness", duration: "15 min" },
                { title: "The Flow State", duration: "15 min" },
                { title: "Deep Productivity", duration: "20 min" }
            ],
            whyRecommended: [
                { icon: "flash", label: "Focus", color: "#FFD700", isActive: true },
                { icon: "trending-up", label: "Growth", color: "#FF9800", isActive: false },
                { icon: "bulb", label: "Clarity", color: "#FFA726", isActive: false }
            ]
        }
    }
]