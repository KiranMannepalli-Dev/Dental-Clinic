import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();

router.use(requireAdmin);

// Zod validation schemas
const CreateGallerySchema = z.object({
  url: z.string().min(1),
  thumbUrl: z.string().optional(),
  caption: z.string().optional().nullable(),
  category: z.string().min(1),
  altText: z.string().min(1),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

const UpdateGallerySchema = CreateGallerySchema.partial();

// 1. Get all gallery images
router.get('/', async (req, res, next) => {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: images });
  } catch (error) {
    next(error);
  }
});

// 2. Add an image
router.post('/', async (req, res, next) => {
  try {
    const body = CreateGallerySchema.parse(req.body);

    const image = await prisma.galleryImage.create({
      data: {
        ...body,
        thumbUrl: body.thumbUrl || body.url
      }
    });

    res.status(201).json({ success: true, data: image });
  } catch (error) {
    next(error);
  }
});

// 3. Update an image
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = UpdateGallerySchema.parse(req.body);

    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Gallery image not found' }
      });
    }

    const updatedImage = await prisma.galleryImage.update({
      where: { id },
      data: body
    });

    res.json({ success: true, data: updatedImage });
  } catch (error) {
    next(error);
  }
});

// 4. Delete an image
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Gallery image not found' }
      });
    }

    await prisma.galleryImage.delete({ where: { id } });
    res.json({ success: true, message: 'Gallery image deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
