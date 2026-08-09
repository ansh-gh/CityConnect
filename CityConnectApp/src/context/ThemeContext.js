import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [themePreference, setThemePreference] = useState('light'); // 'system' | 'light' | 'dark'

    useEffect(() => {
        // Load saved theme preference on startup
        (async () => {
            try {
                const savedTheme = await SecureStore.getItemAsync('user_theme_preference');
                if (savedTheme) {
                    setThemePreference(savedTheme);
                }
            } catch (error) {
                console.error('Failed to load theme preference', error);
            }
        })();
    }, []);

    const changeTheme = async (newTheme) => {
        try {
            setThemePreference(newTheme);
            await SecureStore.setItemAsync('user_theme_preference', newTheme);
        } catch (error) {
            console.error('Failed to save theme preference', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ themePreference, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useAppTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useAppTheme must be used within a ThemeProvider');
    }
    return context;
}