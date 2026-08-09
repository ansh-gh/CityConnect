require("dotenv").config();
const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 5000;

// Test DB Connection
pool.getConnection()
    .then(connection => {
        console.log("✅ Database connected successfully");
        connection.release();

        app.listen(PORT, () => {
            console.log(`🚀 CityConnect Backend running on port ${PORT}`);
            console.log(`👉 Admin API: http://localhost:${PORT}/api/admin`);
            console.log(`👉 User API:  http://localhost:${PORT}/cityconnect`);
        });
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);
    });
