import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, Surface } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loginValidationSchema } from '../../features/auth/schemas/authSchemas';
import { useLogin } from '../../features/auth/hooks/useAuth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const theme = useTheme();
    const { mutate: login, isPending } = useLogin();
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginValidationSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = (data) => {
        login(data);
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
                            <MaterialCommunityIcons name="city-variant-outline" size={32} color={theme.colors.primary} />
                        </View>
                        <Text variant="headlineMedium" style={styles.title}>CityConnect</Text>
                        <Text variant="bodyMedium" style={styles.subtitle}>Welcome back, please log in</Text>
                    </View>

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

                    <Button
                        mode="text"
                        style={styles.forgotPasswordButton}
                        onPress={() => router.push('/(auth)/forgot-password')}
                    >
                        Forgot Password?
                    </Button>

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
                        Login
                    </Button>

                    {/* Register Link */}
                    <Button
                        mode="text"
                        style={styles.registerButton}
                        onPress={() => router.replace('/(auth)/register')}
                    >
                        Don't have an account? Register
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
    forgotPasswordButton: { alignSelf: 'flex-end', marginTop: 2, marginBottom: 16, marginRight: -8 },
    forgotPasswordText: { fontSize: 13 },
    button: { borderRadius: 16 },
    registerButton: { marginTop: 16 },
});