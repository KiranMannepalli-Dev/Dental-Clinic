import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();

router.use(requireAdmin);

// Get all appointments with filters and pagination
router.get('/', async (req, res, next) => {
  try {
    const { status, doctorId, serviceId, search, page = '1', limit = '20' } = req.query;
    
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;
    if (serviceId) where.serviceId = serviceId;
    
    if (search) {
      where.OR = [
        { bookingRef: { contains: search as string, mode: 'insensitive' } },
        { patient: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { patient: { phone: { contains: search as string } } }
      ];
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: true,
          doctor: true,
          service: true
        },
        orderBy: { appointmentDate: 'desc' },
        skip,
        take: limitNumber
      }),
      prisma.appointment.count({ where })
    ]);

    res.json({
      success: true,
      data: appointments,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    next(error);
  }
});

const UpdateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
});

// Update appointment status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = UpdateStatusSchema.parse(req.body);

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: true,
        doctor: true,
        service: true
      }
    });

    res.json({
      success: true,
      data: appointment,
      message: `Appointment marked as ${status}`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
