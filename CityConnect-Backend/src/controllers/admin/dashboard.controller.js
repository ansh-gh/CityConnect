const dashboardService = require("../../services/admin/dashboard.service");

const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await dashboardService.getDashboardStats();
        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };
