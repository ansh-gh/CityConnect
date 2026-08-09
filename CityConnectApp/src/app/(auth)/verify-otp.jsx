import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme, Surface } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { verifyOtpSchema } from '../../features/auth/schemas/authSchemas';
import { useVerifyOtp, useResendOtp } from '../../features/auth/hooks/useAuth'; // <-- Updated import

export default function VerifyOtpScreen() {
    const theme = useTheme();
    const { email } = useLocalSearchParams(); 
    
    const { mutate: verifyOtp, isPending } = useVerifyOtp();
    const { mutate: resendOtp, isPending: isResending } = useResendOtp(); // <-- Uses dedicated resend hook

    // Timer State
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: { otp: '' }
    });

    const onSubmit = (data) => {
        verifyOtp({ email, otp: data.otp });
    };

    const handleResend = () => {
        resendOtp({ email });
        setTimeLeft(30); // Reset timer to 30 seconds
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
                            <MaterialCommunityIcons name="shield-key-outline" size={32} color={theme.colors.primary} />
                        </View>
                        <Text variant="headlineMedium" style={styles.title}>Verify Your Account</Text>
                        <Text variant="bodyMedium" style={styles.subtitle}>
                            We sent a verification code to{'\n'}<Text style={{ fontWeight: 'bold' }}>{email || 'your email'}</Text>
                        </Text>
                    </View>

                    {/* OTP Input */}
                    <Controller
                        control={control}
                        name="otp"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Enter 6-Digit OTP"
                                mode="outlined"
                                keyboardType="number-pad"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={!!errors.otp}
                                style={styles.input}
                                outlineColor={theme.colors.outlineVariant}
                                maxLength={6}
                            />
                        )}
                    />
                    {errors.otp && <Text style={styles.errorText}>{errors.otp.message}</Text>}

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
                        Verify & Complete
                    </Button>

                    {/* Resend OTP Section */}
                    <View style={styles.resendContainer}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Didn't receive the code? </Text>
                        {timeLeft > 0 ? (
                            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                Resend in {timeLeft}s
                            </Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend} disabled={isResending}>
                                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    {isResending ? 'Sending...' : 'Resend OTP'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
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
    title: { fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
    subtitle: { opacity: 0.6, textAlign: 'center', lineHeight: 20 },
    input: { marginBottom: 4, backgroundColor: 'transparent', textAlign: 'center', letterSpacing: 4 },
    errorText: { color: '#D32F2F', fontSize: 12, marginTop: -2, marginBottom: 12, marginLeft: 4 },
    button: { marginTop: 12, borderRadius: 16 },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    }
});