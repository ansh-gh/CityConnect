import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function ComplaintsLayout() {
    const theme = useTheme();

    return (
        <Stack
            screenOptions={{
                // BUG-06 fix: theme the header so it matches dark/light mode
                headerStyle: { backgroundColor: theme.colors.surface },
                headerTintColor: theme.colors.onSurface,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: theme.colors.background },
            }}
        >
            <Stack.Screen
                name="index"
                options={{ title: 'My Complaints' }}
            />
            <Stack.Screen
                name="create"
                options={{ title: 'File a New Complaint' }}
            />
            <Stack.Screen
                name="[id]"
                options={{ title: 'Complaint Details' }}
            />
        </Stack>
    );
}