import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();

router.use(requireAdmin);

// Zod validation schemas
const UpdateSettingsSchema = z.object({
  clinicName: z.string().min(1),
  tagline: z.string().optional().nullable(),
  phone: z.string().min(1),
  emergencyPhone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  city: z.string().min(1),
  mapLat: z.number(),
  mapLng: z.number(),
  socialLinks: z.object({
    whatsapp: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    facebook: z.string().optional().nullable(),
    youtube: z.string().optional().nullable(),
  }),
  workingHours: z.array(z.object({
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
    startTime: z.string(),
    endTime: z.string(),
    slotMinutes: z.number().int().positive(),
    isAvailable: z.boolean()
  })).optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  analyticsId: z.string().optional().nullable(),
});

const CreateHolidaySchema = z.object({
  date: z.string().transform((val) => new Date(val)),
  name: z.string().min(1),
  type: z.string().optional(),
});

// Helper to get or create settings record
async function getOrCreateSettings() {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' }
  });
  
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        id: 'singleton',
        clinicName: 'Heshvitha Multi Speciality Dental Clinic',
        tagline: 'Your Smile, Our Priority',
        phone: '+91 99999 99999',
        emergencyPhone: '+91 99999 99999',
        email: 'info@heshvithadental.com',
        address: 'Main Road, Hyderabad',
        city: 'Hyderabad',
        mapLat: 17.3850,
        mapLng: 78.4867,
        socialLinks: {
          whatsapp: 'https://wa.me/919999999999',
          instagram: 'https://instagram.com',
          facebook: 'https://facebook.com',
          youtube: 'https://youtube.com'
        },
        workingHours: [
          { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
          { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
          { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
          { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
          { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
          { dayOfWeek: 'SATURDAY', startTime: '09:00', endTime: '13:00', slotMinutes: 30, isAvailable: true },
          { dayOfWeek: 'SUNDAY', startTime: '09:00', endTime: '13:00', slotMinutes: 30, isAvailable: false }
        ],
        seoTitle: 'Heshvitha Multi Speciality Dental Clinic',
        seoDescription: 'Leading dental care and treatments in Hyderabad.',
        analyticsId: 'G-XXXXXXXXXX'
      }
    });
  }
  return settings;
}

// 1. Get site settings
router.get('/', async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// 2. Update site settings
router.put('/', async (req, res, next) => {
  try {
    const body = UpdateSettingsSchema.parse(req.body);
    
    // Ensure record exists
    await getOrCreateSettings();

    const updatedSettings = await prisma.siteSettings.update({
      where: { id: 'singleton' },
      data: {
        ...body,
        socialLinks: body.socialLinks,
        workingHours: body.workingHours as any
      }
    });

    res.json({ success: true, data: updatedSettings });
  } catch (error) {
    next(error);
  }
});

// 3. Get all holidays
router.get('/holidays', async (req, res, next) => {
  try {
    const holidays = await prisma.clinicHoliday.findMany({
      orderBy: { date: 'asc' }
    });
    res.json({ success: true, data: holidays });
  } catch (error) {
    next(error);
  }
});

// 4. Create a holiday closure
router.post('/holidays', async (req, res, next) => {
  try {
    const body = CreateHolidaySchema.parse(req.body);
    
    // Ensure date doesn't already exist
    const dup = await prisma.clinicHoliday.findUnique({
      where: { date: body.date }
    });
    
    if (dup) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'A holiday closure is already registered for this date' }
      });
    }

    const holiday = await prisma.clinicHoliday.create({
      data: body
    });

    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
});

// 5. Delete a holiday closure
router.delete('/holidays/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.clinicHoliday.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Holiday not found' }
      });
    }

    await prisma.clinicHoliday.delete({ where: { id } });
    res.json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
