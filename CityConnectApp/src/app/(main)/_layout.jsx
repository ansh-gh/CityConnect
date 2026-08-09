import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { LinearTransition } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CustomTabBar({ state, descriptors, navigation, theme }) {
    // 1. Map your visible routes to their specific icons
    const IconConfig = {
        home: 'home-outline',
        complaints: 'clipboard-alert-outline',
        profile: 'account-outline',
    };

    // 2. Define EXACTLY which tabs should be visible on the bottom bar
    const VISIBLE_TABS = ['home', 'complaints', 'profile'];

    const formatName = (name) => name.charAt(0).toUpperCase() + name.slice(1);

    return (
        <Animated.View
            layout={LinearTransition}
            style={[
                styles.tabBarContainer,
                {
                    backgroundColor: theme.colors.elevation.level2 || theme.colors.surface,
                    borderColor: theme.colors.outlineVariant || 'transparent',
                }
            ]}
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];

                // 3. If the route name is NOT in our visible list, skip drawing it entirely
                if (!VISIBLE_TABS.includes(route.name)) return null;

                const isFocused = state.index === index;
                const iconName = IconConfig[route.name] || 'circle';

                const onPress = () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <AnimatedPressable
                        layout={LinearTransition}
                        key={route.key}
                        onPress={onPress}
                        style={[
                            styles.tabItem,
                            { backgroundColor: isFocused ? theme.colors.primary : 'transparent' }
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={iconName}
                            size={24}
                            color={isFocused ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                        />
                        {isFocused && (
                            <Animated.Text
                                layout={LinearTransition}
                                style={[
                                    styles.tabText,
                                    { color: theme.colors.onPrimary }
                                ]}
                            >
                                {options.title || formatName(route.name)}
                            </Animated.Text>
                        )}
                    </AnimatedPressable>
                );
            })}
        </Animated.View>
    );
}

export default function MainLayout() {
    const theme = useTheme();

    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} theme={theme} />}
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
            }}
        >
            {/* --- VISIBLE TABS --- */}
            <Tabs.Screen name="home" options={{ title: 'Home' }} />
            <Tabs.Screen name="complaints" options={{ title: 'Complaints' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

            {/* --- HIDDEN SCREENS (Accessible only via Home page) --- */}
            <Tabs.Screen name="polls" options={{ href: null, title: 'Polls' }} />
            <Tabs.Screen name="feedback" options={{ href: null, title: 'Feedback' }} />
            <Tabs.Screen name="emergency" options={{ href: null, title: 'Emergency' }} />
            <Tabs.Screen name="parking" options={{ href: null, title: 'Parking' }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 24 : 20,
        alignSelf: 'center',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 64,
        borderRadius: 40,
        paddingHorizontal: 16,
        borderWidth: 1.3,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        // width: '%',
    },
    tabItem: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 100,
        gap: 8,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    }
});