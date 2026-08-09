const pool = require("../../config/database");

const getAllUsers = async () => {
    const [rows] = await pool.query(`
        SELECT id AS user_id, id, full_name AS name, full_name, email, phone, role,
               profile_image AS profile_pic_url, profile_image, is_verified, created_at
        FROM users
        WHERE role != 'admin'
        ORDER BY id DESC
    `);
    return rows;
};

const getUserById = async (userId) => {
    const [rows] = await pool.query(`
        SELECT id, full_name AS name, email, phone, role,
               address, profile_image AS profile_pic_url, is_active, created_at
        FROM users WHERE id = ?
    `, [userId]);

    if (rows.length === 0) throw new Error("User not found");
    return rows[0];
};

const deleteUser = async (userId) => {
    const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [userId]);
    if (result.affectedRows === 0) throw new Error("User not found");
    return true;
};

const updateUser = async (userId, data) => {
    const { name, email, phone, role } = data;
    const [result] = await pool.query(`
        UPDATE users 
        SET full_name = COALESCE(?, full_name), 
            email = COALESCE(?, email), 
            phone = COALESCE(?, phone), 
            role = COALESCE(?, role)
        WHERE id = ?
    `, [name, email, phone, role, userId]);
    
    if (result.affectedRows === 0) throw new Error("User not found");
    return true;
};

const updateUserStatus = async (userId, status) => {
    const isActive = status === 'active' ? 1 : 0;
    const [result] = await pool.query(`UPDATE users SET is_active = ? WHERE id = ?`, [isActive, userId]);
    if (result.affectedRows === 0) throw new Error("User not found");
    return true;
};

module.exports = { getAllUsers, getUserById, deleteUser, updateUser, updateUserStatus };
