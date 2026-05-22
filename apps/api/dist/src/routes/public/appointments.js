"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../config/database");
const slots_1 = require("../../lib/slots");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
const SlotQuerySchema = zod_1.z.object({
    doctorId: zod_1.z.string(),
    date: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
});
router.get('/slots', async (req, res, next) => {
    try {
        const { doctorId, date } = SlotQuerySchema.parse(req.query);
        // Normalize date to YYYY-MM-DD
        const dateStr = date.split('T')[0];
        const slots = await (0, slots_1.getAvailableSlots)(doctorId, dateStr);
        res.json({
            success: true,
            data: slots
        });
    }
    catch (error) {
        next(error);
    }
});
const BookAppointmentSchema = zod_1.z.object({
    serviceId: zod_1.z.string(),
    doctorId: zod_1.z.string(),
    appointmentDate: zod_1.z.string(),
    startTime: zod_1.z.string(),
    patient: zod_1.z.object({
        firstName: zod_1.z.string().min(2),
        lastName: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().min(10),
        isFirstVisit: zod_1.z.boolean().default(true),
        chiefComplaint: zod_1.z.string().optional()
    })
});
router.post('/', async (req, res, next) => {
    try {
        const data = BookAppointmentSchema.parse(req.body);
        // Generate booking reference
        const bookingRef = `BS-${new Date().getFullYear()}-${(0, uuid_1.v4)().substring(0, 6).toUpperCase()}`;
        // Find patient by email
        let patient = await database_1.prisma.patient.findFirst({
            where: { email: data.patient.email }
        });
        if (patient) {
            patient = await database_1.prisma.patient.update({
                where: { id: patient.id },
                data: {
                    firstName: data.patient.firstName,
                    lastName: data.patient.lastName,
                    phone: data.patient.phone
                }
            });
        }
        else {
            patient = await database_1.prisma.patient.create({
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
        const appointment = await database_1.prisma.appointment.create({
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
