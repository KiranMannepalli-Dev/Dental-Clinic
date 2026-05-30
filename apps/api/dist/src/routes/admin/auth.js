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
// ─── Update own profile / change password ─────────────────────────────────────
const UpdateMeSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    oldPassword: zod_1.z.string().min(6).optional(),
    newPassword: zod_1.z.string().min(6).optional(),
});
router.patch('/me', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(authHeader.split(' ')[1], JWT_SECRET);
        }
        catch {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token expired' } });
        }
        const data = UpdateMeSchema.parse(req.body);
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.oldPassword && data.newPassword) {
            const admin = await database_1.prisma.admin.findUnique({ where: { id: decoded.id } });
            if (!admin)
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
            const match = await bcryptjs_1.default.compare(data.oldPassword, admin.passwordHash);
            if (!match)
                return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Current password is incorrect' } });
            updateData.passwordHash = await bcryptjs_1.default.hash(data.newPassword, 10);
        }
        const updated = await database_1.prisma.admin.update({
            where: { id: decoded.id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true }
        });
        res.json({ success: true, data: updated, message: 'Profile updated successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
