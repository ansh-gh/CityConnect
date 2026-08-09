import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, ActivityIndicator, Surface, Avatar, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { updateProfileValidationSchema } from '../features/auth/schemas/authSchemas';
import { useProfile, useUpdateProfile } from '../features/auth/hooks/useAuth';

export default function EditProfileScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { data: user, isLoading: isProfileLoading } = useProfile();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(updateProfileValidationSchema),
        defaultValues: { full_name: '', phone: '' }
    });

    useEffect(() => {
        if (user) {
            reset({ full_name: user.full_name || '', phone: user.phone || '' });
        }
    }, [user, reset]);

    if (isProfileLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const fullName = user?.full_name || 'Citizen';
    const initials = fullName.substring(0, 2).toUpperCase();

    const onSubmit = (data) => {
        updateProfile(data);
    };

    return (
        <KeyboardAvoidingView 
            style={[styles.container, { backgroundColor: theme.colors.background }]} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header with Back Button spaced down nicely */}
            <View style={styles.header}>
                <IconButton 
                    icon="arrow-left" 
                    size={24} 
                    onPress={() => router.back()} 
                    style={styles.backButton}
                />
                <Text variant="headlineMedium" style={styles.headerTitle}>Edit Profile</Text>
            </View>

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    
                    {/* Header with Initials Avatar */}
                    <View style={styles.cardHeader}>
                        <Avatar.Text
                            size={76}
                            label={initials}
                            style={{ backgroundColor: theme.colors.primaryContainer }}
                            color={theme.colors.onPrimaryContainer}
                        />
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Personal Info</Text>
                            <Text variant="bodySmall" style={{ opacity: 0.6, marginTop: 2 }}>Update your account details</Text>
                        </View>
                    </View>

                    {/* Full Name Input */}
                    <Controller 
                        control={control} 
                        name="full_name" 
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput 
                                label="Full Name" 
                                mode="outlined" 
                                onBlur={onBlur} 
                                onChangeText={onChange} 
                                value={value} 
                                error={!!errors.full_name} 
                                style={styles.input} 
                                outlineColor={theme.colors.outlineVariant}
                            />
                        )}
                    />
                    {errors.full_name && <Text style={styles.errorText}>{errors.full_name.message}</Text>}

                    {/* Phone Number Input */}
                    <Controller 
                        control={control} 
                        name="phone" 
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput 
                                label="Phone Number" 
                                mode="outlined" 
                                keyboardType="phone-pad" 
                                onBlur={onBlur} 
                                onChangeText={onChange} 
                                value={value} 
                                error={!!errors.phone} 
                                style={styles.input} 
                                outlineColor={theme.colors.outlineVariant}
                            />
                        )}
                    />
                    {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

                    {/* Submit Button */}
                    <Button 
                        mode="contained" 
                        onPress={handleSubmit(onSubmit)} 
                        loading={isUpdating} 
                        disabled={isUpdating} 
                        style={styles.button}
                        contentStyle={{ height: 52 }}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                    >
                        Save Changes
                    </Button>
                </Surface>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingTop: Platform.OS === 'ios' ? 60 : 40, // Pushed the tabbar/header down a bit more from top
        paddingBottom: 16 
    },
    backButton: { margin: 0 },
    headerTitle: { fontWeight: 'bold', marginLeft: 8 },
    content: { padding: 16, justifyContent: 'center', flexGrow: 1, paddingBottom: 110 }, // Restored centered layout
    formCard: { borderRadius: 24, padding: 20 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    input: { marginBottom: 6, backgroundColor: 'transparent' },
    errorText: { color: '#D32F2F', fontSize: 12, marginTop: -4, marginBottom: 12, marginLeft: 4 },
    button: { marginTop: 12, borderRadius: 16 },
});