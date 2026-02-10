import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, useRouter, useSegments } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from "react";
import { LogBox, PermissionsAndroid, Platform, StatusBar } from "react-native";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { PlaylistProvider } from "../context/PlaylistContext";

// Suppress known Expo Router warning about linking configuration
// This is a false positive when using expo-router with deep linking
LogBox.ignoreLogs([
  'Looks like you have configured linking in multiple places',
]);

import { HomeSkeleton } from "@/components/HomeSkeleton";
import { UserProvider } from "../context/UserContext";

function RootLayoutWithAuth() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Lock to portrait on mount
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch((error) => {
      // Orientation lock may not be supported on all platforms (e.g., web, some tablets)
      console.error('Failed to lock screen orientation to portrait:', error);
    });
  }, []);

  // Mark component as mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const requestPermissions = async () => {
      // Request notification permissions (iOS & Android)
      try {
        const { requestNotificationPermissions } = await import('@/utils/pushNotifications');
        await requestNotificationPermissions();
      } catch (err) {
        console.warn('Notification permissions error:', err);
      }

      // Request Android-specific permissions
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
    // Don't navigate until component is mounted and auth is loaded
    if (!isLoaded || !isMounted) return;

    const inProtectedGroup = segments[0] === "(protected)";
    const inPublicGroup = segments[0] === "(public)";
    const isOAuthCallback = segments[0] === "oauth-native-callback";

    // Skip redirect if on OAuth callback - it handles its own redirect
    if (isOAuthCallback) {
      return;
    }

    // Add small delay to ensure navigation is ready
    const timeoutId = setTimeout(() => {
      // Redirect based on auth state
      if (isSignedIn && !inProtectedGroup) {
        router.replace("/(protected)/(tabs)");
      } else if (!isSignedIn && !inPublicGroup) {
        router.replace("/(public)");
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isSignedIn, isLoaded, segments, isMounted]);

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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
