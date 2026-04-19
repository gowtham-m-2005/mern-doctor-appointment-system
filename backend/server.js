const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const { apiLimiter, loginLimiter, registerLimiter } = require("./middleware/rateLimit.middleware");
const sanitizeInput = require("./middleware/xss.middleware");
const { logRequest } = require("./middleware/securityLogger.middleware");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler.middleware");
const { enforceHTTPS, additionalSecurityHeaders } = require("./middleware/https.middleware");
const { redisClient } = require("./config/redis");
const { initializeNotificationService } = require("./services/notificationService");
const { cleanupExpiredSlots } = require("./jobs/cleanupExpiredSlots");

dotenv.config();

const app = express();

// HIPAA Compliant Security Headers
if (process.env.ENABLE_HTTPS === 'true' && process.env.NODE_ENV === 'production') {
  app.use(enforceHTTPS);
}
app.use(additionalSecurityHeaders);

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security middleware
app.use(mongoSanitize());
app.use(sanitizeInput);
app.use(logRequest);

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Public branding endpoint (no auth required)
const Settings = require('./models/Settings.model');
app.get("/api/branding", async (req, res) => {
  try {
    const settings = await Settings.findOne() || {};
    res.json({
      appName: settings.appName || 'DocBook',
      appLogo: settings.appLogo || '',
      contactEmail: settings.contactEmail || '',
      commissionPercent: settings.commissionPercent || 10,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Routes with specific rate limiters
app.use("/api/auth", loginLimiter, require("./routes/auth.routes"));
app.use("/api/auth/register", registerLimiter);
app.use("/api/users", apiLimiter, require("./routes/user.routes"));
app.use("/api/doctor", apiLimiter, require("./routes/doctor.routes"));
app.use("/api/appointments", apiLimiter, require("./routes/appointment.routes"));
app.use("/api/admin", apiLimiter, require("./routes/admin.routes"));
app.use("/api/theme", apiLimiter, require("./routes/theme.routes"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK" }));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Connect DB then start server
mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB connected");

        // Connect to Redis
        await redisClient.connect();
        console.log("Redis connected");

        // Initialize notification service
        initializeNotificationService();

        // Start notification scheduler after DB is ready
        require("./utils/notificationScheduler");

        // Run expired slots cleanup on startup and every hour
        cleanupExpiredSlots();
        setInterval(cleanupExpiredSlots, 60 * 60 * 1000);

        app.listen(process.env.PORT, () =>
            console.log(`Server running on port ${process.env.PORT}`)
        );
    })
    .catch((err) => {
        console.error("DB connection error:", err);
        process.exit(1);
    });
