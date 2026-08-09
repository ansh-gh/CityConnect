const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow serving static images across origins

// Secure CORS Policy for Production & Local Development
// Example .env: CORS_ORIGINS=https://admin.cityconnect.com,http://localhost:5173
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map(o => o.trim())
    : [];

app.use(cors({
    origin: (origin, callback) => {
        // !origin allows requests from mobile apps (React Native) or tools like Postman
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin ${origin} is not allowed`));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting: Protects against spam/DDoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Logging middleware (only active in development mode)
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// Serve static files (like Cloudinary fallbacks or local uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Welcome Route / Health Check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to CityConnect Unified API (Admin & User)"
    });
});

// Import Route Groups
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");

// Mount Route Groups
app.use("/api/admin", adminRoutes);
app.use("/cityconnect", userRoutes);

// Handle 404 - Unmatched Routes
app.use(/.*/, (req, res, next) => {
    const AppError = require("./utils/AppError");
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
const errorHandler = require("./middleware/error.middleware");
app.use(errorHandler);

module.exports = app;