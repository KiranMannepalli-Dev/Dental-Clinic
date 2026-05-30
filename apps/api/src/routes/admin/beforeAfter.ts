import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(requireAdmin);

// Zod validation schemas
const CreateBeforeAfterSchema = z.object({
  serviceId: z.string().min(1),
  beforeUrl: z.string().min(1),
  afterUrl: z.string().min(1),
  caption: z.string().optional().nullable(),
  patientNote: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

const UpdateBeforeAfterSchema = CreateBeforeAfterSchema.partial();

// 1. Get all before/after images
router.get('/', async (req, res, next) => {
  try {
    const images = await prisma.beforeAfterImage.findMany({
      include: {
        service: {
          select: { name: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: images });
  } catch (error) {
    next(error);
  }
});

// 2. Add a before/after image mapping
router.post('/', async (req, res, next) => {
  try {
    const body = CreateBeforeAfterSchema.parse(req.body);

    const image = await prisma.beforeAfterImage.create({
      data: body
    });

    res.status(201).json({ success: true, data: image });
  } catch (error) {
    next(error);
  }
});

// 3. Update a before/after image mapping
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = UpdateBeforeAfterSchema.parse(req.body);

    const existing = await prisma.beforeAfterImage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Before/after image not found' }
      });
    }

    const updatedImage = await prisma.beforeAfterImage.update({
      where: { id },
      data: body
    });

    res.json({ success: true, data: updatedImage });
  } catch (error) {
    next(error);
  }
});

// 4. Delete a before/after image mapping
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.beforeAfterImage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Before/after image not found' }
      });
    }

    await prisma.beforeAfterImage.delete({ where: { id } });
    res.json({ success: true, message: 'Before/after image deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
