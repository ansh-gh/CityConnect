const pool = require("../../config/database");

/* ===========================
   PARKING ZONES
=========================== */

const createZone = async (data) => {
    const { zone_name, location, latitude, longitude, total_slots, hourly_rate, is_active } = data;
    const [result] = await pool.query(
        `INSERT INTO parking_zones (zone_name, location, latitude, longitude, total_slots, hourly_rate, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            zone_name,
            location || null,
            latitude !== undefined && latitude !== "" ? latitude : null,
            longitude !== undefined && longitude !== "" ? longitude : null,
            total_slots !== undefined ? total_slots : 0,
            hourly_rate !== undefined ? hourly_rate : 0.00,
            is_active !== undefined ? is_active : 1
        ]
    );
    return result.insertId;
};

const getAllZones = async () => {
    const [rows] = await pool.query(`
        SELECT id AS zone_id, id, zone_name, location, latitude, longitude,
               total_slots, hourly_rate, is_active, created_at
        FROM parking_zones
        ORDER BY id DESC
    `);
    return rows;
};

const getZoneById = async (id) => {
    const [rows] = await pool.query(
        `SELECT id AS zone_id, id, zone_name, location, latitude, longitude,
                total_slots, hourly_rate, is_active, created_at
         FROM parking_zones WHERE id = ?`,
        [id]
    );
    if (rows.length === 0) throw new Error("Parking zone not found");
    return rows[0];
};

const updateZone = async (id, data) => {
    const { zone_name, location, latitude, longitude, total_slots, hourly_rate, is_active } = data;
    const [result] = await pool.query(
        `UPDATE parking_zones
         SET zone_name = ?, location = ?, latitude = ?, longitude = ?,
             total_slots = ?, hourly_rate = ?, is_active = ?
         WHERE id = ?`,
        [
            zone_name,
            location || null,
            latitude !== undefined && latitude !== "" ? latitude : null,
            longitude !== undefined && longitude !== "" ? longitude : null,
            total_slots !== undefined ? total_slots : 0,
            hourly_rate !== undefined ? hourly_rate : 0.00,
            is_active !== undefined ? is_active : 1,
            id
        ]
    );
    if (result.affectedRows === 0) throw new Error("Parking zone not found");
    return true;
};

const deleteZone = async (id) => {
    const [result] = await pool.query(`DELETE FROM parking_zones WHERE id = ?`, [id]);
    if (result.affectedRows === 0) throw new Error("Parking zone not found");
    return true;
};

/* ===========================
   PARKING SLOTS
=========================== */

const createSlot = async (data) => {
    const { zone_id, slot_code, slot_type, is_available } = data;
    const availableFlag = is_available !== undefined ? is_available : 1;
    const [result] = await pool.query(
        `INSERT INTO parking_slots (zone_id, slot_code, slot_type, is_available)
         VALUES (?, ?, ?, ?)`,
        [zone_id, slot_code, slot_type || "car", availableFlag]
    );
    return result.insertId;
};

const getAllSlots = async () => {
    const [rows] = await pool.query(`
        SELECT s.id AS slot_id, s.id, s.zone_id, s.slot_code, s.slot_type,
               s.is_available, s.created_at, z.zone_name
        FROM parking_slots s
        JOIN parking_zones z ON s.zone_id = z.id
        ORDER BY s.id DESC
    `);
    return rows;
};

const getSlotById = async (id) => {
    const [rows] = await pool.query(`
        SELECT s.id AS slot_id, s.id, s.zone_id, s.slot_code, s.slot_type,
               s.is_available, s.created_at, z.zone_name
        FROM parking_slots s
        JOIN parking_zones z ON s.zone_id = z.id
        WHERE s.id = ?
    `, [id]);
    if (rows.length === 0) throw new Error("Parking slot not found");
    return rows[0];
};

const updateSlot = async (id, data) => {
    const { zone_id, slot_code, slot_type, is_available } = data;
    const availableFlag = is_available !== undefined ? is_available : 1;
    const [result] = await pool.query(
        `UPDATE parking_slots SET zone_id = ?, slot_code = ?, slot_type = ?,
         is_available = ? WHERE id = ?`,
        [zone_id, slot_code, slot_type, availableFlag, id]
    );
    if (result.affectedRows === 0) throw new Error("Parking slot not found");
    return true;
};

const deleteSlot = async (id) => {
    const [result] = await pool.query(`DELETE FROM parking_slots WHERE id = ?`, [id]);
    if (result.affectedRows === 0) throw new Error("Parking slot not found");
    return true;
};

/* ===========================
   BOOKINGS
=========================== */

const getAllBookings = async () => {
    const [rows] = await pool.query(`
        SELECT
            b.id AS booking_id, b.booking_no, b.user_id,
            u.full_name AS user_name, b.slot_id, s.slot_code, z.zone_name,
            b.created_at AS booking_time,
            b.booking_start AS start_time, b.booking_end AS end_time,
            b.total_amount, b.booking_status AS status
        FROM parking_bookings b
        JOIN users u ON b.user_id = u.id
        JOIN parking_slots s ON b.slot_id = s.id
        JOIN parking_zones z ON s.zone_id = z.id
        ORDER BY b.created_at DESC
    `);
    return rows;
};

const getBookingById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            b.id AS booking_id, b.booking_no, b.user_id, b.slot_id,
            b.booking_start AS start_time, b.booking_end AS end_time,
            b.total_amount, b.qr_payload, b.payment_status, b.booking_status AS status,
            b.created_at, u.full_name AS name, u.phone, s.slot_code, z.zone_name
        FROM parking_bookings b
        JOIN users u ON b.user_id = u.id
        JOIN parking_slots s ON b.slot_id = s.id
        JOIN parking_zones z ON s.zone_id = z.id
        WHERE b.id = ?
    `, [id]);
    if (rows.length === 0) throw new Error("Booking not found");
    return rows[0];
};

module.exports = {
    createZone, getAllZones, getZoneById, updateZone, deleteZone,
    createSlot, getAllSlots, getSlotById, updateSlot, deleteSlot,
    getAllBookings, getBookingById
};