import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, Surface, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { changePasswordValidationSchema } from '../features/auth/schemas/authSchemas';
import { useChangePassword } from '../features/auth/hooks/useAuth';

export default function ChangePasswordScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { mutate: changePassword, isPending } = useChangePassword();
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(changePasswordValidationSchema),
        defaultValues: { oldPassword: '', newPassword: '' }
    });

    const onSubmit = (data) => {
        changePassword(data);
    };

    return (
        <KeyboardAvoidingView 
            style={[styles.container, { backgroundColor: theme.colors.background }]} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header with Back Button */}
            <View style={styles.header}>
                <IconButton 
                    icon="arrow-left" 
                    size={24} 
                    onPress={() => router.back()} 
                    style={styles.backButton}
                />
                <Text variant="headlineMedium" style={styles.headerTitle}>Change Password</Text>
            </View>

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconWrapper, { backgroundColor: '#FF980015' }]}>
                            <MaterialCommunityIcons name="lock-reset" size={28} color="#FF9800" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Security</Text>
                            <Text variant="bodySmall" style={{ opacity: 0.6 }}>Update your account password</Text>
                        </View>
                    </View>

                    {/* Current Password */}
                    <Controller 
                        control={control} 
                        name="oldPassword" 
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput 
                                label="Current Password" 
                                mode="outlined" 
                                secureTextEntry={!showOldPassword} 
                                onBlur={onBlur} 
                                onChangeText={onChange} 
                                value={value} 
                                error={!!errors.oldPassword} 
                                style={styles.input} 
                                outlineColor={theme.colors.outlineVariant}
                                right={
                                    <TextInput.Icon 
                                        icon={showOldPassword ? "eye-off" : "eye"} 
                                        onPress={() => setShowOldPassword(!showOldPassword)} 
                                    />
                                } 
                            />
                        )}
                    />
                    {errors.oldPassword && <Text style={styles.errorText}>{errors.oldPassword.message}</Text>}

                    {/* New Password */}
                    <Controller 
                        control={control} 
                        name="newPassword" 
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput 
                                label="New Password" 
                                mode="outlined" 
                                secureTextEntry={!showNewPassword} 
                                onBlur={onBlur} 
                                onChangeText={onChange} 
                                value={value} 
                                error={!!errors.newPassword} 
                                style={styles.input} 
                                outlineColor={theme.colors.outlineVariant}
                                right={
                                    <TextInput.Icon 
                                        icon={showNewPassword ? "eye-off" : "eye"} 
                                        onPress={() => setShowNewPassword(!showNewPassword)} 
                                    />
                                } 
                            />
                        )}
                    />
                    {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword.message}</Text>}

                    {/* Submit Button */}
                    <Button 
                        mode="contained" 
                        onPress={handleSubmit(onSubmit)} 
                        loading={isPending} 
                        disabled={isPending} 
                        style={styles.button}
                        contentStyle={{ height: 52 }}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                    >
                        Update Password
                    </Button>
                </Surface>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingTop: Platform.OS === 'ios' ? 60 : 40, 
        paddingBottom: 16 
    },
    backButton: { margin: 0 },
    headerTitle: { fontWeight: 'bold', marginLeft: 8 },
    content: { padding: 16, justifyContent: 'center', flexGrow: 1, paddingBottom: 110 },
    formCard: { borderRadius: 24, padding: 20 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
    iconWrapper: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    input: { marginBottom: 6, backgroundColor: 'transparent' },
    errorText: { color: '#D32F2F', fontSize: 12, marginTop: -4, marginBottom: 12, marginLeft: 4 },
    button: { marginTop: 12, borderRadius: 16 },
});