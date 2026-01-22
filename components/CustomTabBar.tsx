import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const [totalWidth, setTotalWidth] = useState(0);

    // Separate 'explore' route (Search) from the others (Tab Group)
    const mainRoutes = state.routes.filter(r => r.name !== 'explore');
    const exploreRoute = state.routes.find(r => r.name === 'explore');

    // Find the active index within the main routes, ignore explore
    const activeRouteIndex = mainRoutes.findIndex(r => r.key === state.routes[state.index].key);

    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0); // For fading the pill in/out

    useEffect(() => {
        // If we have a valid width and a valid active index (not 'explore' or unrelated)
        if (totalWidth > 0 && activeRouteIndex !== -1) {
            const tabWidth = totalWidth / mainRoutes.length;

            // Move the pill
            translateX.value = withSpring(activeRouteIndex * tabWidth, {
                mass: 1,
                damping: 25,
                stiffness: 250,
            });

            // Make sure pill is visible
            opacity.value = withTiming(1, { duration: 250 });
        } else {
            // If activeRouteIndex is -1 (e.g. we are on 'explore'), hide the pill
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [activeRouteIndex, totalWidth, mainRoutes.length]);

    const animatedPillStyle = useAnimatedStyle(() => {
        // Safe guard against divide by zero if width not set yet
        const tabWidth = totalWidth > 0 ? (totalWidth / mainRoutes.length) : 0;

        return {
            transform: [{ translateX: translateX.value }],
            width: tabWidth,
            opacity: opacity.value,
        };
    });

    return (
        <View style={[styles.container, {
            // When gesture navigation is hidden (insets.bottom = 0), add +10 offset
            // When gesture navigation is visible (insets.bottom > 0), use only insets value
            bottom: insets.bottom > 0 ? insets.bottom : 10
        }]}>
            {/* Main Tabs Group */}
            <View style={styles.tabGroupContainer}>
                <View style={[styles.blurContainer, { backgroundColor: '#ffffff' }]}>
                    <View
                        style={styles.tabGroupInner}
                        onLayout={(e: LayoutChangeEvent) => setTotalWidth(e.nativeEvent.layout.width)}
                    >
                        {/* Animated Glass Pill - Rendered behind content but inside the group */}
                        <Animated.View style={[styles.pillContainer, animatedPillStyle]}>
                            <View style={styles.pillInner} />
                        </Animated.View>

                        {mainRoutes.map((route, index) => {
                            const { options } = descriptors[route.key];
                            const label = options.title !== undefined ? options.title : route.name;
                            const isFocused = state.index === state.routes.indexOf(route);

                            const onPress = () => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                const event = navigation.emit({
                                    type: 'tabPress',
                                    target: route.key,
                                    canPreventDefault: true,
                                });

                                if (!isFocused && !event.defaultPrevented) {
                                    navigation.navigate(route.name);
                                }
                            };

                            let iconName: keyof typeof Ionicons.glyphMap = "home";
                            if (route.name === 'index') {
                                iconName = isFocused ? "home" : "home-outline";
                            } else if (route.name === 'library') {
                                iconName = isFocused ? "library" : "library-outline";
                            } else if (route.name === 'history') {
                                iconName = isFocused ? "layers" : "layers-outline";
                            }

                            return (
                                <TouchableOpacity
                                    key={route.key}
                                    onPress={onPress}
                                    style={[styles.tabItem]} // No static activeTabItem styles
                                    accessibilityRole="button"
                                    accessibilityState={isFocused ? { selected: true } : {}}
                                >
                                    <Ionicons
                                        name={iconName}
                                        size={22}
                                        color={isFocused ? "#000000" : "#8E8E93"}
                                    />
                                    <Text style={[
                                        styles.tabLabel,
                                        { color: isFocused ? "#000000" : "#8E8E93" }
                                    ]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
            </View>

            {/* Search/Explore Button */}
            {exploreRoute && (
                <TouchableOpacity
                    style={styles.searchButtonContainer}
                    activeOpacity={1}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate(exploreRoute.name);
                    }}
                    accessibilityRole="button"
                >
                    <View style={[styles.searchButtonBlur, { backgroundColor: '#ffffff' }]}>
                        <Ionicons
                            name="search"
                            size={24}
                            color={state.index === state.routes.indexOf(exploreRoute) ? "#007AFF" : "#000000"}
                        />
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        flexDirection: 'row',
        left: 20,
        right: 20,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    tabGroupContainer: {
        flex: 1,
        marginRight: 15,
        borderRadius: 35,
        overflow: 'hidden',
        height: 65,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    blurContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    tabGroupInner: {
        flexDirection: 'row',
        flex: 1,
        height: '100%',
        alignItems: 'center',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        zIndex: 2,
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 2,
        fontWeight: '500',
    },
    // The moving container for the pill
    pillContainer: {
        position: 'absolute',
        height: '100%',
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    // The actual visible pill shape
    pillInner: {
        width: '85%',
        height: 55,
        borderRadius: 45,
        backgroundColor: 'rgba(191, 191, 191, 0.44)',
    },
    searchButtonContainer: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    searchButtonBlur: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
