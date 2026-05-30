import { Router } from 'express';
import { prisma } from '../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only-do-not-use-in-prod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Update last login
    await prisma.admin.update({
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
  } catch (error) {
    next(error);
  }
});

// ─── Update own profile / change password ─────────────────────────────────────
const UpdateMeSchema = z.object({
  name: z.string().min(2).optional(),
  oldPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
});

router.patch('/me', async (req: any, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }
    let decoded: any;
    try { decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET); } catch {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token expired' } });
    }

    const data = UpdateMeSchema.parse(req.body);
    const updateData: any = {};
    if (data.name) updateData.name = data.name;

    if (data.oldPassword && data.newPassword) {
      const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
      if (!admin) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
      const match = await bcrypt.compare(data.oldPassword, admin.passwordHash);
      if (!match) return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Current password is incorrect' } });
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await prisma.admin.update({
      where: { id: decoded.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true }
    });

    res.json({ success: true, data: updated, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
