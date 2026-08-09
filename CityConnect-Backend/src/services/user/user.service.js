const db = require("../../config/database");
const AppError = require("../../utils/AppError");

const findById = async (id) => {
    const [result] = await db.execute(
        `SELECT id, full_name, email, phone, role, profile_image FROM users WHERE id = ?`,
        [id]
    );
    return result[0];
};

exports.getProfile = async (userId) => {
    const user = await findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return { success: true, user };
};

exports.updateProfile = async (userId, data) => {
    const user = await findById(userId);
    if (!user) throw new AppError("User not found", 404);

    await db.execute(
        `UPDATE users SET full_name = ?, phone = ? WHERE id = ?`,
        [data.full_name, data.phone, userId]
    );
    return { success: true, message: "Profile updated successfully" };
};

exports.updateProfileImage = async (userId, imageUrl) => {
    const user = await findById(userId);
    if (!user) throw new AppError("User not found", 404);

    await db.execute(`UPDATE users SET profile_image = ? WHERE id = ?`, [imageUrl, userId]);
    return { success: true, message: "Profile picture updated successfully", profile_image: imageUrl };
};

exports.deleteUser = async (userId) => {
    const user = await findById(userId);
    if (!user) throw new AppError("User not found", 404);

    await db.execute(`DELETE FROM users WHERE id = ?`, [userId]);
    return { success: true, message: "Account deleted successfully" };
};
