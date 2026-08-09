import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Animated JS Splash Screen for CityConnect.
 * 
 * Designed to run AFTER expo-splash-screen (native) has been hidden.
 * Call onFinish() to transition to the main app.
 * 
 * @param {Function} onFinish - Callback fired when animation + hold completes
 */
const SplashScreen = ({ onFinish }) => {
    // ── Animation values ──────────────────────────────────────────────────────
    const fadeAnim       = useRef(new Animated.Value(0)).current;   // overall opacity
    const scaleAnim      = useRef(new Animated.Value(0.85)).current; // logo pop (starting slightly larger for a smoother pop)
    const translateYAnim = useRef(new Animated.Value(30)).current; // slide up
    const taglineFade    = useRef(new Animated.Value(0)).current;   // tagline appears last
    const glowAnim       = useRef(new Animated.Value(0)).current;   // subtle glow pulse

    useEffect(() => {
        // Phase 1: Logo entrance (fade + scale + slide)
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 0,
                duration: 900,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Phase 2: Tagline fades in after logo is settled
            Animated.parallel([
                Animated.timing(taglineFade, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                // Subtle glow pulse on the logo
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.5,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start(() => {
                // Phase 3: Hold for 1.2s then call onFinish
                setTimeout(() => {
                    if (onFinish) {
                        onFinish();
                    }
                }, 1200);
            });
        });
    }, [fadeAnim, scaleAnim, translateYAnim, taglineFade, glowAnim, onFinish]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Background gradient rings (decorative) */}
            <View style={styles.ringOuter} />
            <View style={styles.ringInner} />

            {/* Main Content Block */}
            <Animated.View
                style={[
                    styles.contentWrapper,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { translateY: translateYAnim },
                        ],
                    },
                ]}
            >
                {/* Logo and Glow strictly centered together */}
                <View style={styles.logoWrapper}>
                    <Animated.View style={[styles.glow, { opacity: glowAnim }]} />
                    <Animated.Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.appName}>
                    <Text style={styles.appNameCity}>City</Text>
                    <Text style={styles.appNameConnect}>Connect</Text>
                </Text>

                {/* Tagline fades in separately */}
                <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
                    Your City, Your Network
                </Animated.Text>
            </Animated.View>

            {/* Footer */}
            <Animated.Text style={[styles.footer, { opacity: taglineFade }]}>
                Connecting communities
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
        width,
        height,
    },
    // Decorative concentric rings for depth
    ringOuter: {
        position: 'absolute',
        width: 380,
        height: 380,
        borderRadius: 190,
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.05)',
    },
    ringInner: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.08)',
    },
    contentWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Dedicated wrapper guarantees perfect concentric alignment of the absolute glow and the logo
    logoWrapper: {
        width: 240,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    // Soft blue glow behind the logo
    glow: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 50,
        elevation: 24, // Increased elevation for stronger Android glow
    },
    logo: {
        width: 180, // Increased from 130
        height: 180, // Increased from 130
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    appName: {
        fontSize: 46, // Scaled up to match the larger logo
        fontWeight: '900', // Made slightly bolder
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    appNameCity: {
        color: '#FFFFFF',
    },
    appNameConnect: {
        color: '#3B82F6',
    },
    tagline: {
        fontSize: 16,
        color: '#94A3B8', // Softer slate color for better contrast
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        fontSize: 13,
        color: '#475569',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontWeight: '500',
    },
});

export default SplashScreen;