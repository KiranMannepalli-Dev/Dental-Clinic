"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
router.use(auth_1.requireAdmin);
// Get all appointments with filters and pagination
router.get('/', async (req, res, next) => {
    try {
        const { status, doctorId, serviceId, search, dateFrom, dateTo, page = '1', limit = '20' } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const where = {};
        // Filter by doctor if the logged-in user is a doctor
        if (req.admin?.role === 'DOCTOR') {
            const doctor = await database_1.prisma.doctor.findUnique({
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
        }
        else {
            if (doctorId)
                where.doctorId = doctorId;
        }
        if (status)
            where.status = status;
        if (serviceId)
            where.serviceId = serviceId;
        // Date range filter
        if (dateFrom || dateTo) {
            where.appointmentDate = {};
            if (dateFrom)
                where.appointmentDate.gte = new Date(dateFrom);
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                where.appointmentDate.lte = toDate;
            }
        }
        if (search) {
            where.OR = [
                { bookingRef: { contains: search, mode: 'insensitive' } },
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { phone: { contains: search } } }
            ];
        }
        const [appointments, total] = await Promise.all([
            database_1.prisma.appointment.findMany({
                where,
                include: { patient: true, doctor: true, service: true },
                orderBy: { appointmentDate: 'desc' },
                skip,
                take: limitNumber
            }),
            database_1.prisma.appointment.count({ where })
        ]);
        res.json({
            success: true,
            data: appointments,
            meta: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) }
        });
    }
    catch (error) {
        next(error);
    }
});
const BulkUpdateStatusSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string()),
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
});
// Bulk update appointment status
router.patch('/bulk-status', async (req, res, next) => {
    try {
        const { ids, status } = BulkUpdateStatusSchema.parse(req.body);
        const result = await database_1.prisma.appointment.updateMany({
            where: { id: { in: ids } },
            data: { status }
        });
        res.json({
            success: true,
            data: result,
            message: `Successfully marked ${result.count} appointments as ${status}`
        });
    }
    catch (error) {
        next(error);
    }
});
const UpdateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
});
// Update appointment status
router.patch('/:id/status', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = UpdateStatusSchema.parse(req.body);
        const appointment = await database_1.prisma.appointment.update({
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
    }
    catch (error) {
        next(error);
    }
});
const RescheduleSchema = zod_1.z.object({
    doctorId: zod_1.z.string(),
    appointmentDate: zod_1.z.string(),
    startTime: zod_1.z.string(),
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'RESCHEDULED']).optional()
});
// Reschedule appointment
router.patch('/:id/reschedule', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { doctorId, appointmentDate, startTime, status } = RescheduleSchema.parse(req.body);
        const appointment = await database_1.prisma.appointment.update({
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
    }
    catch (error) {
        next(error);
    }
});
const UpdatePaymentSchema = zod_1.z.object({
    paymentStatus: zod_1.z.enum(['PENDING', 'PAID']),
    paymentMethod: zod_1.z.enum(['CASH', 'CARD', 'UPI', 'INSURANCE'])
});
// Update payment status
router.patch('/:id/payment', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { paymentStatus, paymentMethod } = UpdatePaymentSchema.parse(req.body);
        const appointment = await database_1.prisma.appointment.update({
            where: { id },
            data: {
                paymentStatus,
                paymentMethod
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
            message: `Payment recorded as ${paymentStatus} via ${paymentMethod}`
        });
    }
    catch (error) {
        next(error);
    }
});
const CreateAppointmentSchema = zod_1.z.object({
    serviceId: zod_1.z.string(),
    doctorId: zod_1.z.string(),
    appointmentDate: zod_1.z.string(),
    startTime: zod_1.z.string(),
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'COMPLETED']).default('CONFIRMED'),
    patient: zod_1.z.object({
        firstName: zod_1.z.string().min(2),
        lastName: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().min(10),
        isFirstVisit: zod_1.z.boolean().default(true),
        chiefComplaint: zod_1.z.string().optional()
    })
});
// Create appointment as admin
router.post('/', async (req, res, next) => {
    try {
        const data = CreateAppointmentSchema.parse(req.body);
        const bookingRef = `BS-${new Date().getFullYear()}-${(0, uuid_1.v4)().substring(0, 6).toUpperCase()}`;
        // Find or create patient by email
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
        const appointment = await database_1.prisma.appointment.create({
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
