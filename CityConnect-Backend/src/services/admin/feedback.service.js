const pool = require("../../config/database");

const getAllFeedbacks = async () => {
    const [rows] = await pool.query(`
        SELECT
            f.id AS feedback_id,
            f.rating,
            f.feedback AS message,
            f.created_at,
            u.id AS user_id,
            u.full_name AS user_name,
            u.email,
            c.id AS complaint_id,
            c.title AS complaint_title
        FROM feedbacks f
        JOIN users u ON f.user_id = u.id
        LEFT JOIN complaints c ON f.complaint_id = c.id
    `);
    return rows;
};

const getFeedbackById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            f.id AS feedback_id,
            f.rating,
            f.feedback AS message,
            f.created_at,
            u.full_name AS name,
            u.email,
            u.phone,
            c.id AS complaint_id,
            c.title
        FROM feedbacks f
        JOIN users u ON f.user_id = u.id
        LEFT JOIN complaints c ON f.complaint_id = c.id
        WHERE f.id = ?
    `, [id]);

    if (rows.length === 0) throw new Error("Feedback not found");
    return rows[0];
};

const deleteFeedback = async (id) => {
    const [result] = await pool.query(`DELETE FROM feedbacks WHERE id = ?`, [id]);
    if (result.affectedRows === 0) throw new Error("Feedback not found");
    return true;
};

module.exports = { getAllFeedbacks, getFeedbackById, deleteFeedback };
