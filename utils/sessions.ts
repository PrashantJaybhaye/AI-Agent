import { ImageSourcePropType } from "react-native";

interface Session {
    id: number;
    title: string;
    description: string;
    image: ImageSourcePropType | undefined;
}

export const sessions: Session[] = [
    {
        id: 1,
        title: "Forest Serenity",
        description: "Mindful walking through nature",
        image: require("@/assets/sessions/forest-path.png")
    },
    {
        id: 2,
        title: "Mountain Stillness",
        description: "Grounding mountain meditation practice",
        image: require("@/assets/sessions/mountain-view.png")
    },
    {
        id: 3,
        title: "Ocean Rhythms",
        description: "Relaxing ocean meditation practice",
        image: require("@/assets/sessions/ocean-waves.png")
    },
    {
        id: 4,
        title: "Morning Glow",
        description: "Morning mindfulness practice",
        image: require("@/assets/sessions/sunrise-sky.png")
    },
    {
        id: 5,
        title: "Zen Balance",
        description: "Focused balance practice",
        image: require("@/assets/sessions/zen-stones.png")
    }
]