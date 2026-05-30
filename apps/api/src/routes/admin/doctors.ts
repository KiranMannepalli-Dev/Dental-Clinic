import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();

router.use(requireAdmin);

// Zod validation schemas
const CreateDoctorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  qualification: z.string().min(1),
  specialization: z.string().min(1),
  experience: z.number().int().nonnegative(),
  consultationFee: z.union([z.number(), z.string()]), // handle both decimals and numbers
  languages: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

const UpdateDoctorSchema = CreateDoctorSchema.partial().extend({
  availability: z.array(z.object({
    id: z.string().optional(),
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
    startTime: z.string(),
    endTime: z.string(),
    slotMinutes: z.number().int().positive(),
    isAvailable: z.boolean()
  })).optional()
});

// Helper to generate unique slug
async function generateUniqueSlug(firstName: string, lastName: string): Promise<string> {
  const baseSlug = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.doctor.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// 1. Get all doctors (active and inactive)
router.get('/', async (req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        availability: true,
        services: {
          include: { service: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
});

// 2. Create a new doctor
router.post('/', async (req, res, next) => {
  try {
    const body = CreateDoctorSchema.parse(req.body);
    const slug = await generateUniqueSlug(body.firstName, body.lastName);
    
    // Check if email unique
    const existingEmail = await prisma.doctor.findUnique({ where: { email: body.email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'A doctor with this email already exists' }
      });
    }

    const doctor = await prisma.doctor.create({
      data: {
        ...body,
        slug,
        consultationFee: String(body.consultationFee),
      }
    });

    // Create default availability for weekdays
    const defaultDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    await Promise.all(defaultDays.map(day => 
      prisma.doctorAvailability.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: day as any,
          startTime: '09:00',
          endTime: '17:00',
          slotMinutes: 30,
          isAvailable: true
        }
      })
    ));

    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
});

// 3. Update an existing doctor
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = UpdateDoctorSchema.parse(req.body);

    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Doctor not found' }
      });
    }

    // Check email uniqueness if email changes
    if (body.email && body.email !== existing.email) {
      const emailDup = await prisma.doctor.findUnique({ where: { email: body.email } });
      if (emailDup) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'A doctor with this email already exists' }
        });
      }
    }

    const { availability, ...doctorData } = body;

    // Update doctor record
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        ...doctorData,
        consultationFee: doctorData.consultationFee ? String(doctorData.consultationFee) : undefined,
      }
    });

    // Update availability if provided
    if (availability) {
      for (const avail of availability) {
        await prisma.doctorAvailability.upsert({
          where: {
            doctorId_dayOfWeek: {
              doctorId: id,
              dayOfWeek: avail.dayOfWeek
            }
          },
          update: {
            startTime: avail.startTime,
            endTime: avail.endTime,
            slotMinutes: avail.slotMinutes,
            isAvailable: avail.isAvailable
          },
          create: {
            doctorId: id,
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
            slotMinutes: avail.slotMinutes,
            isAvailable: avail.isAvailable
          }
        });
      }
    }

    res.json({ success: true, data: updatedDoctor });
  } catch (error) {
    next(error);
  }
});

// 4. Delete a doctor
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Doctor not found' }
      });
    }

    await prisma.doctor.delete({ where: { id } });
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
