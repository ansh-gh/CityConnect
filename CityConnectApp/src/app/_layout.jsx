import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useAppTheme } from '../context/ThemeContext';

// Keep the splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

// Initialize React Query Client
const queryClient = new QueryClient();

function MainNavigator() {
    const colorScheme = useColorScheme(); // device system theme
    const { themePreference } = useAppTheme();

    // Determine if dark mode should be active
   // App will default to light mode and only switch if explicitly set to 'dark'
    const isDarkMode = themePreference === 'dark';
    
    // Custom base themes with your preferred primary color (#007AFF)
    const lightTheme = {
        ...MD3LightTheme,
        colors: {
            ...MD3LightTheme.colors,
            primary: '#007AFF',
        },
    };

    const darkTheme = {
        ...MD3DarkTheme,
        colors: {
            ...MD3DarkTheme.colors,
            primary: '#007AFF',
        },
    };

    const theme = isDarkMode ? darkTheme : lightTheme;

    useEffect(() => {
        // Hide splash screen once the root layout and provider are fully mounted
        async function hideSplash() {
            try {
                await SplashScreen.hideAsync();
            } catch (e) {
                console.warn(e);
            }
        }
        hideSplash();
    }, []);

    return (
        <PaperProvider theme={theme}>
            <Stack 
                screenOptions={{ 
                    headerShown: false,
                    // Ensures background color matches your active theme globally to prevent white flashes during transitions
                    contentStyle: { backgroundColor: theme.colors.background }
                }} 
            />
        </PaperProvider>
    );
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <MainNavigator />
            </ThemeProvider>
        </QueryClientProvider>
    );
}