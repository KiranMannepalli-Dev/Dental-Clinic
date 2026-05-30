"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const requestId_1 = require("./middleware/requestId");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Security Middleware
app.use(requestId_1.requestId);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Always allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) {
            callback(null, true);
            return;
        }
        // In development, allow everything
        if (process.env.NODE_ENV !== 'production') {
            callback(null, true);
            return;
        }
        const cleanOrigin = origin.replace(/\/$/, '');
        // Allow localhost
        if (cleanOrigin.startsWith('http://localhost') || cleanOrigin.startsWith('http://127.0.0.1')) {
            callback(null, true);
            return;
        }
        // Allow any Vercel deployment (*.vercel.app)
        if (cleanOrigin.endsWith('.vercel.app')) {
            callback(null, true);
            return;
        }
        // Allow explicitly configured frontend URL
        const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');
        if (frontendUrl && cleanOrigin === frontendUrl) {
            callback(null, true);
            return;
        }
        callback(new Error(`CORS: origin "${origin}" not allowed`));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10kb' }));
// Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
// Serve static uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// API Routes
const routes_1 = __importDefault(require("./routes"));
app.use('/api/v1', routes_1.default);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
