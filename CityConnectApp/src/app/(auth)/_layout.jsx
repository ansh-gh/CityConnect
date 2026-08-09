import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function AuthLayout() {
    const theme = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false, // Hides the default ugly header for all auth screens
                contentStyle: { backgroundColor: theme.colors.background },
                animation: 'slide_from_right', // Optional: gives a nice slide effect
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            
            {/* FIX: Explicitly declaring the previously missing screens */}
            <Stack.Screen name="verify-otp" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="reset-password" />
        </Stack>
    );
}