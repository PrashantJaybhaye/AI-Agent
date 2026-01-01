import { Stack } from "expo-router";

export default function CourseLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        />
    );
}
