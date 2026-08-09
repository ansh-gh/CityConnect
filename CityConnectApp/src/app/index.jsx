import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken } from '../utils/secureStore';
import React from 'react';
import { useTheme } from 'react-native-paper';
import SplashScreen from '../components/SplashScreen';

export default function Index() {
    const theme = useTheme();
    const router = useRouter();
    // Show animated JS splash first, then check auth
    const [showSplash, setShowSplash] = useState(true);
    const [isChecking, setIsChecking] = useState(false);

    // Called when the animated splash finishes
    const handleSplashFinish = () => {
        setShowSplash(false);
        setIsChecking(true);
    };

    useEffect(() => {
        if (!isChecking) return;

        const checkAuthStatus = async () => {
            try {
                // Use your secureStore utility to grab the correct key ('cityconnect_jwt_token')
                const token = await getToken();

                if (token) {
                    // User is logged in, redirect to main app flow
                    router.replace('/(main)/home');
                } else {
                    // No token, redirect to auth flow
                    router.replace('/(auth)/login');
                }
            } catch (error) {
                console.error("Error checking auth token:", error);
                router.replace('/(auth)/login');
            } finally {
                setIsChecking(false);
            }
        };

        checkAuthStatus();
    }, [isChecking]);

    // Step 1: Show the animated splash screen
    if (showSplash) {
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

    // Step 2: Auth check in progress — show brief loading indicator
    if (isChecking) {
        return (
            <View style={[styles.container, { backgroundColor: '#0F172A' }]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});