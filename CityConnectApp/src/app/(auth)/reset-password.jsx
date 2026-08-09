import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { resetPasswordValidationSchema } from '../../features/auth/schemas/authSchemas';
import { useResetPassword } from '../../features/auth/hooks/useAuth';

export default function ResetPasswordScreen() {
    const theme = useTheme();
    // Grab the email passed from the forgot password screen
    const { email } = useLocalSearchParams(); 
    
    const { mutate: resetPassword, isPending } = useResetPassword();

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(resetPasswordValidationSchema),
        defaultValues: { otp: '', newPassword: '' }
    });

    const onSubmit = (data) => {
        // Pass the email along with the new data to the backend
        resetPassword({
            email: email,
            otp: data.otp,
            newPassword: data.newPassword // Ensure this key matches what your backend expects
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineMedium" style={styles.title}>Create New Password</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                Enter the OTP sent to {email} and your new password.
            </Text>

            <Controller
                control={control}
                name="otp"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        label="Enter OTP"
                        mode="outlined"
                        keyboardType="number-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={!!errors.otp}
                        style={styles.input}
                    />
                )}
            />
            {errors.otp && <Text style={styles.errorText}>{errors.otp.message}</Text>}

            <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        label="New Password"
                        mode="outlined"
                        secureTextEntry
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={!!errors.newPassword}
                        style={styles.input}
                    />
                )}
            />
            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword.message}</Text>}

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={isPending}
                disabled={isPending}
                style={styles.button}
            >
                Reset Password
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center' },
    title: { textAlign: 'center', fontWeight: 'bold', marginBottom: 8 },
    subtitle: { textAlign: 'center', marginBottom: 32, opacity: 0.7 },
    input: { marginBottom: 8 },
    errorText: { color: 'red', fontSize: 12, marginBottom: 8 },
    button: { marginTop: 16, paddingVertical: 6 },
});