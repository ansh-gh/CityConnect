import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, Surface } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { forgotPasswordValidationSchema } from '../../features/auth/schemas/authSchemas';
import { useForgotPassword } from '../../features/auth/hooks/useAuth';

export default function ForgotPasswordScreen() {
    const theme = useTheme();
    const { mutate: forgotPassword, isPending } = useForgotPassword();

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(forgotPasswordValidationSchema),
        defaultValues: { email: '' }
    });

    const onSubmit = (data) => {
        forgotPassword(data);
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
                            <MaterialCommunityIcons name="lock-reset" size={32} color={theme.colors.primary} />
                        </View>
                        <Text variant="headlineMedium" style={styles.title}>Reset Password</Text>
                        <Text variant="bodyMedium" style={styles.subtitle}>
                            Enter your registered email address to receive a verification code.
                        </Text>
                    </View>

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Email Address"
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
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

                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        loading={isPending}
                        disabled={isPending}
                        style={styles.button}
                        contentStyle={{ height: 52 }}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                    >
                        Send OTP
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
    iconWrapper: { 
        width: 64, 
        height: 64, 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 16 
    },
    title: { fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
    subtitle: { opacity: 0.6, textAlign: 'center', lineHeight: 20 },
    input: { marginBottom: 4, backgroundColor: 'transparent' },
    errorText: { color: '#D32F2F', fontSize: 12, marginTop: -2, marginBottom: 12, marginLeft: 4 },
    button: { marginTop: 12, borderRadius: 16 },
});