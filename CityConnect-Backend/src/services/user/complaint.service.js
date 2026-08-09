const db = require("../../config/database");
const AppError = require("../../utils/AppError");
const cloudinary = require("../../config/cloudinary");

exports.createComplaint = async (userId, data, imageFiles = []) => {
    const ticketNo = "CC" + Date.now();

    const uploadPromises = imageFiles.map((file) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "cityconnect/complaints" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result.secure_url);
                }
            );
            stream.end(file.buffer);
        });
    });

    const imageUrls = await Promise.all(uploadPromises);
    const imageUrlJson = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;

    const sql = `INSERT INTO complaints
        (ticket_no, user_id, title, description, category, latitude, longitude, address, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.execute(sql, [
        ticketNo, userId, data.title, data.description, data.category,
        data.latitude ?? null, data.longitude ?? null, data.address ?? null, imageUrlJson
    ]);

    const complaintId = result.insertId;
    await db.execute(
        `INSERT INTO complaint_status_history (complaint_id, status, remarks, updated_by) VALUES (?, ?, ?, ?)`,
        [complaintId, "submitted", "Complaint submitted successfully", null]
    );

    return {
        success: true,
        message: "Complaint submitted successfully",
        ticket_no: ticketNo,
        complaint_id: complaintId
    };
};

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

exports.getMyComplaints = async (userId) => {
    const sql = `SELECT id, ticket_no, title, description, category, latitude, longitude, address, image_url, status, created_at
                 FROM complaints WHERE user_id = ? ORDER BY created_at DESC`;
    const [result] = await db.execute(sql, [userId]);
    return { success: true, complaints: result.map(parseImages) };
};

exports.getComplaint = async (complaintId, userId) => {
    const sql = `SELECT id, ticket_no, title, description, category, latitude, longitude, address, image_url, status, created_at
                 FROM complaints WHERE id = ? AND user_id = ?`;
    const [result] = await db.execute(sql, [complaintId, userId]);
    if (result.length === 0) throw new AppError("Complaint not found", 404);
    return { success: true, complaint: parseImages(result[0]) };
};

exports.updateComplaint = async (complaintId, userId, data, imageFiles = []) => {
    const [complaints] = await db.execute(
        `SELECT status FROM complaints WHERE id = ? AND user_id = ?`,
        [complaintId, userId]
    );
    if (complaints.length === 0) throw new AppError("Complaint not found", 404);
    if (complaints[0].status !== "submitted") {
        throw new AppError("Complaint cannot be updated after review starts", 400);
    }

    // BUG-06 fix: if new images are provided, upload them; otherwise keep existing image_url
    let imageUrlJson = data.image_url ?? null;
    if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map((file) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "cityconnect/complaints" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                stream.end(file.buffer);
            });
        });
        const imageUrls = await Promise.all(uploadPromises);
        imageUrlJson = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
    }

    await db.execute(
        `UPDATE complaints SET title = ?, description = ?, category = ?, latitude = ?, longitude = ?, address = ?, image_url = ?
         WHERE id = ? AND user_id = ?`,
        [data.title, data.description, data.category, data.latitude ?? null,
         data.longitude ?? null, data.address ?? null, imageUrlJson, complaintId, userId]
    );

    return { success: true, message: "Complaint updated successfully" };
};

exports.deleteComplaint = async (complaintId, userId) => {
    const [complaints] = await db.execute(
        `SELECT status FROM complaints WHERE id = ? AND user_id = ?`,
        [complaintId, userId]
    );
    if (complaints.length === 0) throw new AppError("Complaint not found", 404);
    if (complaints[0].status !== "submitted") {
        throw new AppError("Complaint cannot be deleted after review starts", 400);
    }

    await db.execute(`DELETE FROM complaints WHERE id = ? AND user_id = ?`, [complaintId, userId]);
    return { success: true, message: "Complaint deleted successfully" };
};

exports.trackComplaint = async (ticketNo, userId) => {
    const sql = `SELECT ticket_no, title, category, status, admin_remark, created_at, updated_at, resolved_at
                 FROM complaints WHERE ticket_no = ? AND user_id = ?`;
    const [rows] = await db.execute(sql, [ticketNo, userId]);
    if (rows.length === 0) throw new AppError("Complaint not found", 404);
    return { success: true, complaint: rows[0] };
};

exports.getComplaintHistory = async (complaintId, userId) => {
    const [complaints] = await db.execute(
        `SELECT id FROM complaints WHERE id = ? AND user_id = ?`,
        [complaintId, userId]
    );
    if (complaints.length === 0) throw new AppError("Complaint not found", 404);

    const [history] = await db.execute(
        `SELECT status, remarks, created_at FROM complaint_status_history
         WHERE complaint_id = ? ORDER BY created_at ASC`,
        [complaintId]
    );
    return { success: true, history };
};
