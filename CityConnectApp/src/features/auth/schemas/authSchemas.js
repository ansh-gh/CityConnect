import { z } from 'zod';

export const loginValidationSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const verifyOtpSchema = z.object({
    otp: z.string().min(4, "OTP must be at least 4 digits").max(6, "OTP cannot exceed 6 digits"),
});

export const forgotPasswordValidationSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordValidationSchema = z.object({
    otp: z.string().min(4, "OTP is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const changePasswordValidationSchema = z.object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const updateProfileValidationSchema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
});