const pool = require("../../config/database");

const getDashboardStats = async () => {
    const results = await Promise.all([
        pool.query(`SELECT COUNT(*) AS totalUsers FROM users WHERE role != 'admin'`),
        pool.query(`SELECT COUNT(*) AS totalComplaints FROM complaints`),
        pool.query(`SELECT COUNT(*) AS pendingComplaints FROM complaints WHERE status IN ('submitted', 'under_review', 'in_progress')`),
        pool.query(`SELECT COUNT(*) AS resolvedComplaints FROM complaints WHERE status = 'resolved'`),
        pool.query(`SELECT COUNT(*) AS rejectedComplaints FROM complaints WHERE status = 'rejected'`),
        pool.query(`SELECT COUNT(*) AS activeParkingBookings FROM parking_bookings WHERE booking_status = 'active'`),
        pool.query(`SELECT COUNT(*) AS totalFeedbacks FROM feedbacks`),
        pool.query(`SELECT COUNT(*) AS activePolls FROM polls WHERE is_active = 1`)
    ]);

    const [users, complaints, pending, resolved, rejected, bookings, feedbacks, polls] = results.map(r => r[0]);

    return {
        totalUsers: users[0]?.totalUsers || 0,
        totalComplaints: complaints[0]?.totalComplaints || 0,
        pendingComplaints: pending[0]?.pendingComplaints || 0,
        resolvedComplaints: resolved[0]?.resolvedComplaints || 0,
        rejectedComplaints: rejected[0]?.rejectedComplaints || 0,
        activeParkingBookings: bookings[0]?.activeParkingBookings || 0,
        totalFeedbacks: feedbacks[0]?.totalFeedbacks || 0,
        activePolls: polls[0]?.activePolls || 0
    };
};

module.exports = { getDashboardStats };
