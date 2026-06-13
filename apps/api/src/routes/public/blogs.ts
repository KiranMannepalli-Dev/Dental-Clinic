import { Router } from 'express';
import { prisma } from '../../config/database';

const router = Router();

// GET /public/blogs — list published blogs with optional category & pagination
router.get('/', async (req, res, next) => {
  try {
    const { category, page = '1', limit = '9', featured } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 9));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { status: 'PUBLISHED' };
    if (category && category !== 'All') where.category = category;
    if (featured === 'true') where.isFeatured = true;

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: { author: { select: { firstName: true, lastName: true, specialization: true, avatarUrl: true } } },
        orderBy: [{ publishedAt: 'desc' }],
        skip,
        take: limitNum,
      }),
      prisma.blog.count({ where }),
    ]);

    // Extract distinct categories from all published blogs
    const allBlogs = await prisma.blog.findMany({
      where: { status: 'PUBLISHED' },
      select: { category: true },
    });
    const categories = ['All', ...Array.from(new Set(allBlogs.map((b) => b.category).filter(Boolean)))];

    res.json({
      success: true,
      data: blogs,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /public/blogs/:slug — get single published blog
router.get('/:slug', async (req, res, next) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: {
          select: { firstName: true, lastName: true, specialization: true, avatarUrl: true, slug: true },
        },
      },
    });

    if (!blog || blog.status !== 'PUBLISHED') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Blog post not found' },
      });
    }

    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
});

export default router;
