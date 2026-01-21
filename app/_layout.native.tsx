import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { PermissionsAndroid, Platform, StatusBar } from "react-native";
import { PlaylistProvider } from "../context/PlaylistContext";

import { HomeSkeleton } from "@/components/HomeSkeleton";
import { UserProvider } from "../context/UserContext";

function RootLayoutWithAuth() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === "android") {
        try {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestPermissions();
  }, []);

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
    return <HomeSkeleton />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="oauth-native-callback" />
      <Stack.Screen name="(protected)" />
      <Stack.Screen name="(public)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <UserProvider>
        <PlaylistProvider>
          <StatusBar
            backgroundColor="transparent"
            barStyle="dark-content"
            hidden={false}
          />
          <RootLayoutWithAuth />
        </PlaylistProvider>
      </UserProvider>
    </ClerkProvider>
  );
}
