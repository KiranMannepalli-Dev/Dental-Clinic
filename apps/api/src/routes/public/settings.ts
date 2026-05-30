import { Router } from 'express';
import { prisma } from '../../config/database';

const router = Router();

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

// Get public site settings
router.get('/', async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

export default router;
