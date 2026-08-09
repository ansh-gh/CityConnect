const db = require("../../config/database");
const AppError = require("../../utils/AppError");
const QRCode = require("qrcode");

exports.getZones = async () => {
    const sql = `
        SELECT
            pz.id,
            pz.zone_name as name,
            pz.latitude as lat,
            pz.longitude as lng,
            pz.hourly_rate as price_per_hour,
            pz.total_slots as total_spots,
            COALESCE(SUM(CASE WHEN ps.is_available = 1 THEN 1 ELSE 0 END), 0) as available_spots
        FROM parking_zones pz
        LEFT JOIN parking_slots ps ON pz.id = ps.zone_id
        WHERE pz.is_active = 1
        GROUP BY pz.id
    `;
    const [zones] = await db.execute(sql);
    return zones.map(zone => ({
        ...zone,
        total_spots: Number(zone.total_spots) || 0,
        available_spots: Number(zone.available_spots) || 0
    }));
};

exports.getAvailableSlots = async (zoneId) => {
    const [slots] = await db.execute(
        `SELECT id, slot_code, slot_type FROM parking_slots WHERE zone_id = ? AND is_available = 1`,
        [zoneId]
    );
    return slots;
};

exports.createBooking = async (userId, data) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [slots] = await connection.execute(
            `SELECT ps.id, ps.slot_code, pz.hourly_rate
             FROM parking_slots ps
             JOIN parking_zones pz ON pz.id = ps.zone_id
             WHERE ps.id = ? AND ps.is_available = 1 FOR UPDATE`,
            [data.slot_id]
        );
        if (slots.length === 0) throw new AppError("Slot is no longer available", 400);

        const start = new Date(data.booking_start);
        const end = new Date(data.booking_end);
        const hours = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60));
        const totalAmount = hours * slots[0].hourly_rate;
        const bookingNo = "BK" + Date.now();

        const mysqlStart = start.toISOString().slice(0, 19).replace("T", " ");
        const mysqlEnd = end.toISOString().slice(0, 19).replace("T", " ");

        const [result] = await connection.execute(
            `INSERT INTO parking_bookings (booking_no, user_id, slot_id, booking_start, booking_end, total_amount)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [bookingNo, userId, data.slot_id, mysqlStart, mysqlEnd, totalAmount]
        );

        await connection.execute(
            `UPDATE parking_slots SET is_available = 0 WHERE id = ?`,
            [data.slot_id]
        );

        const qrPayload = JSON.stringify({
            bookingNo, bookingId: result.insertId,
            slotCode: slots[0].slot_code, userId,
            startTime: mysqlStart, endTime: mysqlEnd
        });

        await connection.execute(
            `UPDATE parking_bookings SET qr_payload = ? WHERE id = ?`,
            [qrPayload, result.insertId]
        );

        await connection.commit();

        return {
            success: true,
            booking_id: result.insertId,
            booking_no: bookingNo,
            total_amount: totalAmount,
            qr_payload: qrPayload
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.getMyBookings = async (userId) => {
    const [bookings] = await db.execute(
        `SELECT pb.*, ps.slot_code, pz.zone_name
         FROM parking_bookings pb
         JOIN parking_slots ps ON ps.id = pb.slot_id
         JOIN parking_zones pz ON pz.id = ps.zone_id
         WHERE pb.user_id = ?
         ORDER BY pb.created_at DESC`,
        [userId]
    );
    return bookings;
};

exports.getBooking = async (bookingId, userId) => {
    const [bookings] = await db.execute(
        `SELECT * FROM parking_bookings WHERE id = ? AND user_id = ?`,
        [bookingId, userId]
    );
    if (bookings.length === 0) throw new AppError("Booking not found", 404);
    return bookings[0];
};

exports.cancelBooking = async (bookingId, userId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [bookings] = await connection.execute(
            `SELECT * FROM parking_bookings WHERE id = ? AND user_id = ? FOR UPDATE`,
            [bookingId, userId]
        );
        if (bookings.length === 0) throw new AppError("Booking not found", 404);

        // BUG-04 fix: prevent double-cancellation and slot availability corruption
        if (bookings[0].booking_status === "cancelled") {
            throw new AppError("Booking is already cancelled", 400);
        }

        await connection.execute(
            `UPDATE parking_bookings SET booking_status = 'cancelled' WHERE id = ?`,
            [bookingId]
        );
        await connection.execute(
            `UPDATE parking_slots SET is_available = 1 WHERE id = ?`,
            [bookings[0].slot_id]
        );

        await connection.commit();
        return { success: true, message: "Booking cancelled successfully" };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
