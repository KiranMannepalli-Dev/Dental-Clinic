import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireSuperAdmin } from '../../middleware/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const router = Router();

// Protect all routes under staff management to only SUPER_ADMIN (Owner)
router.use(requireSuperAdmin);

// Get all staff members
router.get('/', async (req, res, next) => {
  try {
    const staff = await prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
});

const CreateStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['SUPER_ADMIN', 'RECEPTIONIST', 'DOCTOR']),
  isActive: z.boolean().default(true)
});

// Create new staff member
router.post('/', async (req, res, next) => {
  try {
    const data = CreateStaffSchema.parse(req.body);

    // Check if email already exists
    const existing = await prisma.admin.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Email already registered for another staff' }
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const staff = await prisma.admin.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash,
        isActive: data.isActive
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      data: staff,
      message: 'Staff member added successfully'
    });
  } catch (error) {
    next(error);
  }
});

const UpdateStaffSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(2).optional(),
  role: z.enum(['SUPER_ADMIN', 'RECEPTIONIST', 'DOCTOR']).optional(),
  isActive: z.boolean().optional()
});

// Update a staff member
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = UpdateStaffSchema.parse(req.body);

    // Check if staff exists
    const staffMember = await prisma.admin.findUnique({
      where: { id }
    });

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Staff member not found' }
      });
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) {
      // Prevent deactivating oneself
      if (req.admin?.id === id && data.isActive === false) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'You cannot deactivate your own account' }
        });
      }
      updateData.isActive = data.isActive;
    }

    if (data.email !== undefined && data.email !== staffMember.email) {
      // Check email collision
      const collision = await prisma.admin.findUnique({
        where: { email: data.email }
      });
      if (collision) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Email already in use by another account' }
        });
      }
      updateData.email = data.email;
    }

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: updated,
      message: 'Staff member details updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete staff member
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting oneself
    if (req.admin?.id === id) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'You cannot delete your own account' }
      });
    }

    // Check if staff exists
    const staffMember = await prisma.admin.findUnique({
      where: { id }
    });

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Staff member not found' }
      });
    }

    await prisma.admin.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
