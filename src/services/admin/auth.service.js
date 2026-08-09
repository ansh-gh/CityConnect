const pool = require("../../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (email, password) => {
    const [rows] = await pool.query(
        `SELECT id, full_name, email, password, role FROM users WHERE email = ?`,
        [email]
    );

    if (rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const admin = rows[0];

    // Only admins can log in via this endpoint
    if (admin.role !== "admin") {
        throw new Error("Access denied");
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    return {
        token,
        admin: {
            id: admin.id,
            name: admin.full_name,
            email: admin.email,
            role: admin.role
        }
    };
};

module.exports = { login };
