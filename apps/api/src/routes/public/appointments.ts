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
    
    // Resolve doctorId (can be CUID or slug)
    let resolvedDoctorId = doctorId;
    const doctor = await prisma.doctor.findFirst({
      where: {
        OR: [
          { id: doctorId },
          { slug: doctorId }
        ]
      }
    });
    if (doctor) {
      resolvedDoctorId = doctor.id;
    }
    
    const slots = await getAvailableSlots(resolvedDoctorId, dateStr);
    
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
    
    // Resolve doctorId (can be CUID or slug)
    let doctorId = data.doctorId;
    const doctor = await prisma.doctor.findFirst({
      where: {
        OR: [
          { id: doctorId },
          { slug: doctorId }
        ]
      }
    });
    if (!doctor) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: `Doctor not found for ID or slug: "${doctorId}"`
        }
      });
    }
    doctorId = doctor.id;

    // Resolve serviceId (can be CUID or slug)
    let serviceId = data.serviceId;
    const service = await prisma.service.findFirst({
      where: {
        OR: [
          { id: serviceId },
          { slug: serviceId }
        ]
      }
    });
    if (!service) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: `Service not found for ID or slug: "${serviceId}"`
        }
      });
    }
    serviceId = service.id;

    // Validate slot availability
    const dateStr = data.appointmentDate.split('T')[0];
    const slots = await getAvailableSlots(doctorId, dateStr);
    const chosenSlot = slots.find(s => s.time === data.startTime);
    if (!chosenSlot) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: `The selected time slot ${data.startTime} is not available for this date.`
        }
      });
    }
    if (!chosenSlot.available) {
      let msg = `The selected time slot ${data.startTime} is unavailable.`;
      if (chosenSlot.status === 'FULLY_BOOKED') {
        msg = `The selected time slot ${data.startTime} is fully booked. Each slot accommodates up to 3 patients.`;
      } else if (chosenSlot.status === 'PAST') {
        msg = `The selected time slot ${data.startTime} is in the past and cannot be booked today.`;
      } else if (chosenSlot.status === 'BLOCKED') {
        msg = `The selected time slot ${data.startTime} is blocked by the administrator.`;
      }
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: msg
        }
      });
    }

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
        doctorId: doctorId,
        serviceId: serviceId,
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
