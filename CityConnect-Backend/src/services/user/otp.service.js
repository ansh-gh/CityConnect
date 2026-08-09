const nodemailer = require("nodemailer");

// In-memory OTP store: email -> { otp, expiresAt }
// ⚠️  BUG-03: This store is WIPED on every server restart and does NOT work across
//    multiple processes/instances. For production, replace with a DB table or Redis.
//    Example DB table: CREATE TABLE otp_store (email VARCHAR(255) PRIMARY KEY, otp VARCHAR(6), expires_at DATETIME);
const otpStore = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const AppError = require("../../utils/AppError");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendOtp = async (email) => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + OTP_EXPIRY_MS;
    otpStore.set(email, { otp, expiresAt });

    const mailOptions = {
        from: `"CityConnect" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "CityConnect – Your OTP Code",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 32px;">
                <h2 style="color: #6C63FF; text-align: center;">CityConnect</h2>
                <h3 style="text-align: center; color: #1a1a2e;">Your OTP Code</h3>
                <p style="color: #555; text-align: center;">Use this one-time password to complete your action.</p>
                <div style="background: #f4f4f8; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #6C63FF;">${otp}</span>
                </div>
                <p style="color: #888; text-align: center; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #aaa; text-align: center; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
};

exports.verifyOtp = (email, otp) => {
    const stored = otpStore.get(email);

    if (!stored) {
        throw new AppError("OTP not found or already used. Please request a new one.", 400);
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    if (stored.otp !== String(otp)) {
        throw new AppError("Invalid OTP. Please check and try again.", 400);
    }

    // Mark OTP as used (one-time use only)
    otpStore.delete(email);
    return true;
};
