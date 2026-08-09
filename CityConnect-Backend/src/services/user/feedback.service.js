const db = require("../../config/database");
const AppError = require("../../utils/AppError");

exports.createFeedback = async (userId, data) => {
    const [complaints] = await db.execute(
        `SELECT id, status FROM complaints WHERE id = ? AND user_id = ?`,
        [data.complaint_id, userId]
    );
    if (complaints.length === 0) throw new AppError("Complaint not found", 404);
    if (complaints[0].status !== "resolved") {
        throw new AppError("Feedback can only be given for resolved complaints", 400);
    }

    const [existing] = await db.execute(
        `SELECT id FROM feedbacks WHERE complaint_id = ? AND user_id = ?`,
        [data.complaint_id, userId]
    );
    if (existing.length > 0) throw new AppError("Feedback already submitted", 400);

    await db.execute(
        `INSERT INTO feedbacks (complaint_id, user_id, rating, feedback) VALUES (?, ?, ?, ?)`,
        [data.complaint_id, userId, data.rating, data.feedback]
    );

    return { success: true, message: "Feedback submitted successfully" };
};

exports.getMyFeedbacks = async (userId) => {
    const sql = `
        SELECT f.id, f.complaint_id, c.ticket_no, c.title, f.rating, f.feedback, f.created_at
        FROM feedbacks f
        JOIN complaints c ON c.id = f.complaint_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    `;
    const [rows] = await db.execute(sql, [userId]);
    return { success: true, feedbacks: rows };
};

exports.deleteFeedback = async (feedbackId, userId) => {
    const [feedback] = await db.execute(
        `SELECT id FROM feedbacks WHERE id = ? AND user_id = ?`,
        [feedbackId, userId]
    );
    if (feedback.length === 0) throw new AppError("Feedback not found", 404);

    await db.execute(`DELETE FROM feedbacks WHERE id = ? AND user_id = ?`, [feedbackId, userId]);
    return { success: true, message: "Feedback deleted successfully" };
};
