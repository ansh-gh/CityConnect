const authService = require("../../services/admin/auth.service");

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        return res.status(200).json({ success: true, message: "Login successful", data: result });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
};

module.exports = { login };
