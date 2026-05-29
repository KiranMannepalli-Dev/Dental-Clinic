import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();

router.use(requireAdmin);

// Zod validation schemas
const UpdateContactSchema = z.object({
  isRead: z.boolean().optional(),
  isResolved: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

// 1. Get all contact submissions
router.get('/', async (req, res, next) => {
  try {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
});

// 2. Update a submission status or notes
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = UpdateContactSchema.parse(req.body);

    const existing = await prisma.contactSubmission.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact submission not found' }
      });
    }

    const updatedSubmission = await prisma.contactSubmission.update({
      where: { id },
      data: body
    });

    res.json({ success: true, data: updatedSubmission });
  } catch (error) {
    next(error);
  }
});

// 3. Delete a submission
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.contactSubmission.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact submission not found' }
      });
    }

    await prisma.contactSubmission.delete({ where: { id } });
    res.json({ success: true, message: 'Contact submission deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
