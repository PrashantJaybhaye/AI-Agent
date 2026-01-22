import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { Stack } from "expo-router";

export default function ProtectedLayout() {
    return (
        <NotificationProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </NotificationProvider>
    );
}
