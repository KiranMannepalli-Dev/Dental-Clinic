import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';
import { googleSheetsService } from '../../services/googleSheets';

const router = Router();

router.use(requireAdmin);

// Zod validation schemas
const CreateBlogSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  featuredImageUrl: z.string().optional().nullable(),
  authorId: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  readTimeMinutes: z.number().int().positive().optional(),
});

const UpdateBlogSchema = CreateBlogSchema.partial();

// Helper to generate unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// 1. Get all blogs
router.get('/', async (req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        author: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: blogs });
  } catch (error) {
    next(error);
  }
});

// 2. Create a new blog
router.post('/', async (req, res, next) => {
  try {
    const body = CreateBlogSchema.parse(req.body);
    const slug = await generateUniqueSlug(body.title);

    // Verify doctor exists as author
    const author = await prisma.doctor.findUnique({ where: { id: body.authorId } });
    if (!author) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'The specified author does not exist' }
      });
    }

    const blog = await prisma.blog.create({
      data: {
        ...body,
        slug,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : null
      }
    });

    googleSheetsService.syncBlog(blog).catch(console.error);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
});

// 3. Update a blog
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = UpdateBlogSchema.parse(req.body);

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Blog not found' }
      });
    }

    if (body.authorId) {
      const author = await prisma.doctor.findUnique({ where: { id: body.authorId } });
      if (!author) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'The specified author does not exist' }
        });
      }
    }

    // Set publishedAt timestamp if status is transitioning to PUBLISHED
    let publishedAt = undefined;
    if (body.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      publishedAt = new Date();
    } else if (body.status === 'DRAFT' || body.status === 'ARCHIVED') {
      publishedAt = null;
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        ...body,
        publishedAt
      }
    });

    googleSheetsService.syncBlog(updatedBlog).catch(console.error);
    res.json({ success: true, data: updatedBlog });
  } catch (error) {
    next(error);
  }
});

// 4. Delete a blog
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Blog not found' }
      });
    }

    await prisma.blog.delete({ where: { id } });
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
