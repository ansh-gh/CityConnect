const pool = require("../../config/database");

const createNotification = async (data) => {
    const { user_id, title, message, type } = data;
    const [result] = await pool.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
        [user_id, title, message, type]
    );
    return result.insertId;
};

const getAllNotifications = async () => {
    const [rows] = await pool.query(`
        SELECT
            n.id AS notification_id,
            n.title,
            n.message,
            n.type,
            n.is_read,
            n.created_at,
            u.id AS user_id,
            u.full_name AS name,
            u.email
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        ORDER BY n.created_at DESC
    `);
    return rows;
};

const getNotificationById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            n.id AS notification_id,
            n.title,
            n.message,
            n.type,
            n.is_read,
            n.created_at,
            u.full_name AS name,
            u.email,
            u.phone
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        WHERE n.id = ?
    `, [id]);

    if (rows.length === 0) throw new Error("Notification not found");
    return rows[0];
};

const updateNotification = async (id, data) => {
    const { title, message, type } = data;
    const [result] = await pool.query(
        `UPDATE notifications SET title = ?, message = ?, type = ? WHERE id = ?`,
        [title, message, type, id]
    );
    if (result.affectedRows === 0) throw new Error("Notification not found");
    return true;
};

const deleteNotification = async (id) => {
    const [result] = await pool.query(`DELETE FROM notifications WHERE id = ?`, [id]);
    if (result.affectedRows === 0) throw new Error("Notification not found");
    return true;
};

module.exports = {
    createNotification,
    getAllNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification
};
