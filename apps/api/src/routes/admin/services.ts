import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';
import { googleSheetsService } from '../../services/googleSheets';

const router = Router();

router.use(requireAdmin);

// Zod validation schemas
const CreateServiceSchema = z.object({
  name: z.string().min(1),
  shortDescription: z.string().min(1),
  fullDescription: z.string().min(1),
  category: z.enum(['COSMETIC', 'ORTHODONTICS', 'PEDIATRIC', 'ORAL_SURGERY', 'PREVENTIVE', 'EMERGENCY', 'IMPLANTS', 'GENERAL']),
  iconName: z.string().optional().nullable(),
  duration: z.number().int().positive(),
  priceMin: z.union([z.number(), z.string()]).optional().nullable(),
  priceMax: z.union([z.number(), z.string()]).optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  symptoms: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  recoveryTime: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

const UpdateServiceSchema = CreateServiceSchema.partial();

// Helper to generate unique slug
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.service.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// 1. Get all services (active and inactive)
router.get('/', async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
});

// 2. Create a new service
router.post('/', async (req, res, next) => {
  try {
    const body = CreateServiceSchema.parse(req.body);
    const slug = await generateUniqueSlug(body.name);

    // Check if name unique
    const existing = await prisma.service.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'A service with this name already exists' }
      });
    }

    const service = await prisma.service.create({
      data: {
        ...body,
        slug,
        priceMin: body.priceMin ? String(body.priceMin) : null,
        priceMax: body.priceMax ? String(body.priceMax) : null,
      }
    });

    // Fire and forget sync to Google Sheets
    googleSheetsService.syncService(service).catch(console.error);

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
});

// 3. Update an existing service
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = UpdateServiceSchema.parse(req.body);

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found' }
      });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...body,
        priceMin: body.priceMin !== undefined ? (body.priceMin ? String(body.priceMin) : null) : undefined,
        priceMax: body.priceMax !== undefined ? (body.priceMax ? String(body.priceMax) : null) : undefined,
      }
    });

    // Fire and forget sync to Google Sheets
    googleSheetsService.syncService(updatedService).catch(console.error);

    res.json({ success: true, data: updatedService });
  } catch (error) {
    next(error);
  }
});

// 4. Delete a service
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found' }
      });
    }

    await prisma.service.delete({ where: { id } });
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
