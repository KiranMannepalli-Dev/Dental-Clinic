import { Router } from 'express';
import { prisma } from '../../config/database';
import { getAvailableSlots } from '../../lib/slots';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const SlotQuerySchema = z.object({
  doctorId: z.string(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
});

router.get('/slots', async (req, res, next) => {
  try {
    const { doctorId, date } = SlotQuerySchema.parse(req.query);
    
    // Normalize date to YYYY-MM-DD
    const dateStr = date.split('T')[0];
    
    const slots = await getAvailableSlots(doctorId, dateStr);
    
    res.json({
      success: true,
      data: slots
    });
  } catch (error) {
    next(error);
  }
});

const BookAppointmentSchema = z.object({
  serviceId: z.string(),
  doctorId: z.string(),
  appointmentDate: z.string(),
  startTime: z.string(),
  patient: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    isFirstVisit: z.boolean().default(true),
    chiefComplaint: z.string().optional()
  })
});

router.post('/', async (req, res, next) => {
  try {
    const data = BookAppointmentSchema.parse(req.body);
    
    // Generate booking reference
    const bookingRef = `BS-${new Date().getFullYear()}-${uuidv4().substring(0, 6).toUpperCase()}`;
    
    // Find patient by email
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

    const appointmentDate = new Date(data.appointmentDate);

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        bookingRef,
        patientId: patient.id,
        doctorId: data.doctorId,
        serviceId: data.serviceId,
        appointmentDate: appointmentDate,
        startTime: data.startTime,
        endTime: "TBD", // Simplification
        status: "PENDING",
        chiefComplaint: data.patient.chiefComplaint,
        isFirstVisit: data.patient.isFirstVisit
      }
    });

    res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment booked successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;
