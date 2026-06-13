import { Router } from 'express';
import { prisma } from '../../config/database';

const router = Router();

// GET /public/reviews — list published reviews
router.get('/', async (req, res, next) => {
  try {
    const { limit = '20' } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));

    const reviews = await prisma.review.findMany({
      where: { isPublished: true },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { firstName: true, lastName: true, specialization: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

export default router;
