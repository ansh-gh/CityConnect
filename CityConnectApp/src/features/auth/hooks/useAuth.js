import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { authApi } from '../api/authApi';
import { saveToken, removeToken } from '../../../utils/secureStore';

// Helper: shows a user-facing alert for API errors
const showError = (title, error) => {
    const message = error?.response?.data?.message || error?.message || 'An unexpected error occurred.';
    Alert.alert(title, message);
};

export const useLogin = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (credentials) => authApi.login(credentials),
        onSuccess: async (response) => {
            const token = response?.data?.token;

            if (token && typeof token === 'string') {
                await saveToken(token);
                router.replace('/(main)/home');
            } else {
                Alert.alert('Login Failed', 'No token received from server. Please try again.');
            }
        },
        onError: (error) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;

            if (status === 403 && message?.includes('not verified')) {
                const attemptedEmail = error?.config?.data ? JSON.parse(error.config.data).email : '';
                router.push({
                    pathname: '/(auth)/verify-otp',
                    params: { email: attemptedEmail }
                });
            } else {
                // BUG-07 fix: show user-facing error instead of silent console.error
                showError('Login Failed', error);
            }
        },
    });
};

export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const logout = async () => {
        await removeToken();
        queryClient.clear();
        router.replace('/(auth)/login');
    };

    return logout;
};

export const useRegister = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (userData) => authApi.register(userData),
        onSuccess: (response, variables) => {
            router.push({
                pathname: '/(auth)/verify-otp',
                params: { email: variables.email }
            });
        },
        onError: (error) => {
            // BUG-08 fix: show user-facing error instead of silent console.error
            showError('Registration Failed', error);
        },
    });
};

export const useVerifyOtp = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data) => authApi.verifyOtp(data),
        onSuccess: async (response) => {
            const token = response?.data?.token || response?.token;

            if (token && typeof token === 'string') {
                await saveToken(token);
                router.replace('/(main)/home');
            }
        },
        onError: (error) => {
            Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid or expired OTP.');
        }
    });
};

export const useResendOtp = () => {
    return useMutation({
        // BUG-02 fix: use dedicated resendOtp endpoint, not forgotPassword
        mutationFn: async ({ email }) => {
            const response = await authApi.resendOtp({ email });
            return response;
        },
        onError: (error) => {
            Alert.alert('Resend Failed', error.response?.data?.message || 'Failed to resend OTP. Please try again.');
        }
    });
};

export const useForgotPassword = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data) => authApi.forgotPassword(data),
        onSuccess: (response, variables) => {
            router.push({
                pathname: '/(auth)/reset-password',
                params: { email: variables.email }
            });
        },
        onError: (error) => {
            // BUG-15 fix: show user-facing error
            showError('Request Failed', error);
        },
    });
};

export const useResetPassword = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data) => authApi.resetPassword(data),
        onSuccess: () => {
            Alert.alert('Success', 'Your password has been reset. Please log in.', [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') }
            ]);
        },
        onError: (error) => {
            showError('Reset Failed', error);
        },
    });
};

export const useChangePassword = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data) => authApi.changePassword(data),
        onSuccess: () => {
            Alert.alert('Success', 'Your password has been updated.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        },
        onError: (error) => {
            // BUG-14 fix: show user-facing error
            showError('Update Failed', error);
        },
    });
};

export const useProfile = () => {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const response = await authApi.getProfile();
            return response.user || response.data?.user || response;
        },
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data) => authApi.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            Alert.alert('Success', 'Your profile has been updated.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        },
        onError: (error) => {
            // BUG-14 fix: show user-facing error
            showError('Update Failed', error);
        },
    });
};

export const useDeleteAccount = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await authApi.deleteAccount();
            return response;
        },
        onSuccess: async () => {
            await removeToken();
            queryClient.clear();
            router.replace('/(auth)/login');
        },
        onError: async (error) => {
            // BUG-17 fix: show user-facing error
            if (error?.response?.status === 404 || error?.response?.data?.message === 'User not found') {
                await removeToken();
                queryClient.clear();
                router.replace('/(auth)/login');
            } else {
                showError('Delete Failed', error);
            }
        },
    });
};
