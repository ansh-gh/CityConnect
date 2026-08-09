const pool = require("../../config/database");

const parseImages = (complaint) => {
    if (complaint.image_url) {
        try {
            complaint.images = JSON.parse(complaint.image_url);
        } catch {
            complaint.images = complaint.image_url ? [complaint.image_url] : [];
        }
    } else {
        complaint.images = [];
    }
    return complaint;
};

/**
 * Get All Complaints — Admin only
 */
exports.getAllComplaints = async () => {
    const [rows] = await pool.execute(`SELECT * FROM complaints ORDER BY created_at DESC`);
    return {
        success: true,
        complaints: rows.map(parseImages)
    };
};

/**
 * Get Complaint by ID — Admin only
 */
exports.getComplaintById = async (complaintId) => {
    const [rows] = await pool.execute(`SELECT * FROM complaints WHERE id = ?`, [complaintId]);

    if (rows.length === 0) {
        throw new Error("Complaint not found");
    }

    return {
        success: true,
        complaint: parseImages(rows[0])
    };
};

/**
 * Update Complaint Status — Admin only
 */
exports.updateComplaintStatus = async (complaintId, status, remarks, adminId) => {
    const [complaints] = await pool.execute(
        `SELECT id, status FROM complaints WHERE id = ?`,
        [complaintId]
    );

    if (complaints.length === 0) {
        throw new Error("Complaint not found");
    }

    await pool.execute(
        `UPDATE complaints
         SET
            status = ?,
            admin_remark = COALESCE(?, admin_remark),
            resolved_at = CASE WHEN ? = 'resolved' THEN COALESCE(resolved_at, NOW()) ELSE resolved_at END
         WHERE id = ?`,
        [status, remarks ?? null, status, complaintId]
    );

    // Log status history
    await pool.execute(
        `INSERT INTO complaint_status_history (complaint_id, updated_by, status, remarks) VALUES (?, ?, ?, ?)`,
        [complaintId, adminId, status, remarks ?? null]
    );

    return { success: true, message: "Complaint status updated successfully" };
};

/**
 * Get Complaint History — Admin only
 */
exports.getComplaintHistory = async (complaintId) => {
    const [complaints] = await pool.execute(
        `SELECT id FROM complaints WHERE id = ?`,
        [complaintId]
    );

    if (complaints.length === 0) {
        throw new Error("Complaint not found");
    }

    const [history] = await pool.execute(
        `SELECT
            h.id AS update_id,
            h.status,
            h.remarks,
            h.created_at AS updated_at,
            u.id AS updated_by_id,
            u.full_name AS updated_by
         FROM complaint_status_history h
         LEFT JOIN users u ON h.updated_by = u.id
         WHERE h.complaint_id = ?
         ORDER BY h.created_at ASC`,
        [complaintId]
    );

    return { success: true, history };
};
