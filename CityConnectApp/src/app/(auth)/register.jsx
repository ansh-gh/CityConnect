import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, Surface } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { z } from 'zod';
import { useRegister } from '../../features/auth/hooks/useAuth';
import { useRouter } from 'expo-router';

// Local schema matching your backend requirements
const registerValidationSchema = z.object({
    full_name: z.string().min(2, 'Full name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
});

export default function RegisterScreen() {
    const theme = useTheme();
    const { mutate: register, isPending } = useRegister();
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerValidationSchema),
        defaultValues: { full_name: '', email: '', password: '', phone: '' },
    });

    const onSubmit = (data) => {
        register(data);
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconWrapper, { backgroundColor: theme.colors.primary + '15' }]}>
                            <MaterialCommunityIcons name="account-plus-outline" size={32} color={theme.colors.primary} />
                        </View>
                        <Text variant="headlineMedium" style={styles.title}>Join CityConnect</Text>
                        <Text variant="bodyMedium" style={styles.subtitle}>Create your citizen account</Text>
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

                    {/* Email Input */}
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Email"
                                mode="outlined"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={!!errors.email}
                                style={styles.input}
                                outlineColor={theme.colors.outlineVariant}
                            />
                        )}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                    {/* Phone Number Input */}
                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Phone Number (Optional)"
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

                    {/* Password Input */}
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Password"
                                mode="outlined"
                                secureTextEntry={!showPassword}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={!!errors.password}
                                style={styles.input}
                                outlineColor={theme.colors.outlineVariant}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? "eye-off" : "eye"}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                            />
                        )}
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

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
                        Register
                    </Button>

                    {/* Login Link */}
                    <Button
                        mode="text"
                        style={styles.loginButton}
                        onPress={() => router.replace('/(auth)/login')}
                    >
                        Already have an account? Login
                    </Button>
                </Surface>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 16 },
    formCard: { borderRadius: 24, padding: 24 },
    cardHeader: { alignItems: 'center', marginBottom: 24 },
    iconWrapper: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontWeight: 'bold', marginBottom: 4 },
    subtitle: { opacity: 0.6, textAlign: 'center' },
    input: { marginBottom: 4, backgroundColor: 'transparent' },
    errorText: { color: '#D32F2F', fontSize: 12, marginTop: -2, marginBottom: 12, marginLeft: 4 },
    button: { marginTop: 12, borderRadius: 16 },
    loginButton: { marginTop: 16 },
});