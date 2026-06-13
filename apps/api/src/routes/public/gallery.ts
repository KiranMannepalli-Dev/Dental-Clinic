import { Router } from 'express';
import { prisma } from '../../config/database';

const router = Router();

// GET /public/gallery — list published gallery images
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const where: any = { isPublished: true };
    if (category && category !== 'All') where.category = category;

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    // Extract distinct categories
    const allImages = await prisma.galleryImage.findMany({
      where: { isPublished: true },
      select: { category: true },
    });
    const categories = ['All', ...Array.from(new Set(allImages.map((i) => i.category).filter(Boolean)))];

    res.json({ success: true, data: images, meta: { categories } });
  } catch (error) {
    next(error);
  }
});

export default router;
