"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.requireAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only-do-not-use-in-prod';
const requireAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'No authentication token provided' }
            });
        }
        const token = authHeader.split(' ')[1];
        // In a real app, also check if token is blacklisted in Redis here
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.role !== 'SUPER_ADMIN' &&
            decoded.role !== 'RECEPTIONIST' &&
            decoded.role !== 'DOCTOR') {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
            });
        }
        req.admin = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
        });
    }
};
exports.requireAdmin = requireAdmin;
const requireSuperAdmin = (req, res, next) => {
    (0, exports.requireAdmin)(req, res, () => {
        if (req.admin?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Only Owners (SUPER_ADMIN) have access' }
            });
        }
        next();
    });
};
exports.requireSuperAdmin = requireSuperAdmin;
