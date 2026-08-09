const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../config/database");
const AppError = require("../../utils/AppError");
const otpService = require("./otp.service");

const findByEmail = async (email) => {
    const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0];
};

const findByPhone = async (phone) => {
    const [rows] = await db.execute(`SELECT * FROM users WHERE phone = ?`, [phone]);
    return rows[0];
};

exports.register = async (data) => {
    const existingUser = await findByEmail(data.email);

    if (existingUser) {
        // Allow re-sending OTP if account is unverified
        if (existingUser.is_verified === 0 || existingUser.is_verified === false) {
            await otpService.sendOtp(data.email);
            return {
                success: true,
                message: "Account already exists but is unverified. A new OTP has been sent.",
                email: data.email,
                requiresVerification: true
            };
        }
        throw new AppError("Email already exists", 400);
    }

    const existingPhone = await findByPhone(data.phone);
    if (existingPhone) throw new AppError("Phone already exists", 400);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [result] = await db.execute(
        `INSERT INTO users (full_name, email, phone, password, role, is_verified) VALUES (?, ?, ?, ?, ?, 0)`,
        [data.full_name, data.email, data.phone, hashedPassword, "user"]
    );

    await otpService.sendOtp(data.email);

    return {
        success: true,
        message: "Registration successful. Please verify the OTP sent to your email.",
        email: data.email
    };
};

exports.verifyOtp = async (email, otp) => {
    const user = await findByEmail(email);
    if (!user) throw new AppError("User not found", 404);

    await otpService.verifyOtp(email, otp); // BUG-01 fix: ensure async-safe call

    await db.execute(`UPDATE users SET is_verified = 1 WHERE email = ?`, [email]);

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    return {
        success: true,
        message: "OTP verified successfully. Account activated.",
        token,
        user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, is_verified: 1 }
    };
};

exports.login = async (data) => {
    const user = await findByEmail(data.email);
    if (!user) throw new AppError("Invalid email or password", 401);

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

    if (user.is_verified === 0 || user.is_verified === false) {
        throw new AppError("Invalid email or password", 401);
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    return {
        success: true,
        message: "Login successful",
        token,
        user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
    };
};

exports.forgotPassword = async (email) => {
    const user = await findByEmail(email);
    if (!user) {
        return { success: true, message: "If that email exists, an OTP has been sent." };
    }
    await otpService.sendOtp(email);
    return { success: true, message: "OTP sent to your email address. Valid for 10 minutes." };
};

exports.resetPassword = async (email, otp, newPassword) => {
    const user = await findByEmail(email);
    if (!user) throw new AppError("User not found", 404);

    await otpService.verifyOtp(email, otp); // BUG-01 fix: ensure async-safe call

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute(`UPDATE users SET password = ? WHERE email = ?`, [hashedPassword, email]);

    return { success: true, message: "Password reset successfully. You can now log in." };
};

exports.resendOtp = async (email) => {
    const user = await findByEmail(email);
    if (!user) {
        return { success: true, message: "If that email exists, an OTP has been sent." };
    }
    await otpService.sendOtp(email);
    return { success: true, message: "A new OTP has been sent to your email." };
};

exports.changePassword = async (userId, oldPassword, newPassword) => {
    const [rows] = await db.execute(`SELECT password FROM users WHERE id = ?`, [userId]);
    if (rows.length === 0) throw new AppError("User not found", 404);

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch) throw new AppError("Current password is incorrect", 400);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userId]);

    return { success: true, message: "Password changed successfully." };
};
