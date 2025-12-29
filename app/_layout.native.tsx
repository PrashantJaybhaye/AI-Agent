import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { UserProvider } from "../context/UserContext";

function RootLayoutWithAuth() {

  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inProtectedGroup = segments[0] === "(protected)";
    const inPublicGroup = segments[0] === "(public)";
    const isOAuthCallback = segments[0] === "oauth-native-callback";

    // Skip redirect if on OAuth callback - it handles its own redirect
    if (isOAuthCallback) {
      return;
    }

    // Redirect based on auth state
    if (isSignedIn && !inProtectedGroup) {
      router.replace("/(protected)/(tabs)");
    } else if (!isSignedIn && !inPublicGroup) {
      router.replace("/(public)");
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) {
    // You can render a loading screen here
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="oauth-native-callback" options={{ headerShown: false }} />
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <UserProvider>
        <StatusBar backgroundColor="transparent" barStyle="dark-content" hidden={false} />
        <RootLayoutWithAuth />
      </UserProvider>
    </ClerkProvider>
  )
}
