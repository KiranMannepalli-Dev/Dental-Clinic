"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only-do-not-use-in-prod';
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = LoginSchema.parse(req.body);
        const admin = await database_1.prisma.admin.findUnique({
            where: { email }
        });
        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }
            });
        }
        const isMatch = await bcryptjs_1.default.compare(password, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '12h' });
        // Update last login
        await database_1.prisma.admin.update({
            where: { id: admin.id },
            data: { lastLogin: new Date() }
        });
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
