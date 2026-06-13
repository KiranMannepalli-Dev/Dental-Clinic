import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(requireAdmin);

// Get all appointments with filters and pagination
router.get('/', async (req, res, next) => {
  try {
    const { status, doctorId, serviceId, search, dateFrom, dateTo, page = '1', limit = '20' } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    // Filter by doctor if the logged-in user is a doctor
    if (req.admin?.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { email: req.admin.email }
      });
      if (!doctor) {
        return res.json({
          success: true,
          data: [],
          meta: { total: 0, page: pageNumber, limit: limitNumber, totalPages: 0 }
        });
      }
      where.doctorId = doctor.id;
    } else {
      if (doctorId) where.doctorId = doctorId;
    }

    if (status) where.status = status;
    if (serviceId) where.serviceId = serviceId;

    // Date range filter
    if (dateFrom || dateTo) {
      where.appointmentDate = {};
      if (dateFrom) where.appointmentDate.gte = new Date(dateFrom as string);
      if (dateTo) {
        const toDate = new Date(dateTo as string);
        toDate.setHours(23, 59, 59, 999);
        where.appointmentDate.lte = toDate;
      }
    }

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
        include: { patient: true, doctor: true, service: true },
        orderBy: { appointmentDate: 'desc' },
        skip,
        take: limitNumber
      }),
      prisma.appointment.count({ where })
    ]);

    res.json({
      success: true,
      data: appointments,
      meta: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) }
    });
  } catch (error) {
    next(error);
  }
});
const BulkUpdateStatusSchema = z.object({
  ids: z.array(z.string()),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
});

// Bulk update appointment status
router.patch('/bulk-status', async (req, res, next) => {
  try {
    const { ids, status } = BulkUpdateStatusSchema.parse(req.body);

    const result = await prisma.appointment.updateMany({
      where: { id: { in: ids } },
      data: { status }
    });

    res.json({
      success: true,
      data: result,
      message: `Successfully marked ${result.count} appointments as ${status}`
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

const RescheduleSchema = z.object({
  doctorId: z.string(),
  appointmentDate: z.string(),
  startTime: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'RESCHEDULED']).optional()
});

// Reschedule appointment
router.patch('/:id/reschedule', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { doctorId, appointmentDate, startTime, status } = RescheduleSchema.parse(req.body);

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        doctorId,
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime: "TBD",
        status: status || 'CONFIRMED'
      },
      include: {
        patient: true,
        doctor: true,
        service: true
      }
    });

    res.json({
      success: true,
      data: appointment,
      message: "Appointment rescheduled successfully"
    });
  } catch (error) {
    next(error);
  }
});

const UpdatePaymentSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'PAID']),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'INSURANCE'])
});

// Update payment status
router.patch('/:id/payment', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = UpdatePaymentSchema.parse(req.body);

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        paymentStatus,
        paymentMethod
      } as any,
      include: {
        patient: true,
        doctor: true,
        service: true
      }
    });

    res.json({
      success: true,
      data: appointment,
      message: `Payment recorded as ${paymentStatus} via ${paymentMethod}`
    });
  } catch (error) {
    next(error);
  }
});

const CreateAppointmentSchema = z.object({
  serviceId: z.string(),
  doctorId: z.string(),
  appointmentDate: z.string(),
  startTime: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED']).default('CONFIRMED'),
  patient: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    isFirstVisit: z.boolean().default(true),
    chiefComplaint: z.string().optional()
  })
});

// Create appointment as admin
router.post('/', async (req, res, next) => {
  try {
    const data = CreateAppointmentSchema.parse(req.body);
    const bookingRef = `BS-${new Date().getFullYear()}-${uuidv4().substring(0, 6).toUpperCase()}`;
    
    // Find or create patient by email
    let patient = await prisma.patient.findFirst({
      where: { email: data.patient.email }
    });

    if (patient) {
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          firstName: data.patient.firstName,
          lastName: data.patient.lastName,
          phone: data.patient.phone
        }
      });
    } else {
      patient = await prisma.patient.create({
        data: {
          firstName: data.patient.firstName,
          lastName: data.patient.lastName,
          email: data.patient.email,
          phone: data.patient.phone
        }
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        bookingRef,
        patientId: patient.id,
        doctorId: data.doctorId,
        serviceId: data.serviceId,
        appointmentDate: new Date(data.appointmentDate),
        startTime: data.startTime,
        endTime: "TBD",
        status: data.status,
        chiefComplaint: data.patient.chiefComplaint,
        isFirstVisit: data.patient.isFirstVisit,
        confirmedAt: data.status === 'CONFIRMED' ? new Date() : null
      },
      include: {
        patient: true,
        doctor: true,
        service: true
      }
    });

    res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment created successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Delete an appointment
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Appointment not found' }
      });
    }

    await prisma.appointment.delete({ where: { id } });
    
    res.json({
      success: true,
      message: "Appointment deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;
