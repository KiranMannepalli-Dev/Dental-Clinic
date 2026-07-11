import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';
import { googleSheetsService } from '../../services/googleSheets';

const router = Router();

router.use(requireAdmin);

// Zod validation schemas
const UpdateReviewSchema = z.object({
  isPublished: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().optional().nullable(),
  content: z.string().optional(),
});

// 1. Get all reviews
router.get('/', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        patient: true,
        doctor: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

// 2. Update a review (e.g. publish/verify/edit details)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = UpdateReviewSchema.parse(req.body);

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Review not found' }
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: body,
      include: {
        patient: true,
        doctor: true
      }
    });

    googleSheetsService.syncReview(updatedReview).catch(console.error);
    res.json({ success: true, data: updatedReview });
  } catch (error) {
    next(error);
  }
});

// 3. Delete a review
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Review not found' }
      });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
