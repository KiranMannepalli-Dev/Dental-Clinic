"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.requireAdmin);
// Get all appointments with filters and pagination
router.get('/', async (req, res, next) => {
    try {
        const { status, doctorId, serviceId, search, page = '1', limit = '20' } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const where = {};
        if (status)
            where.status = status;
        if (doctorId)
            where.doctorId = doctorId;
        if (serviceId)
            where.serviceId = serviceId;
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
                include: {
                    patient: true,
                    doctor: true,
                    service: true
                },
                orderBy: { appointmentDate: 'desc' },
                skip,
                take: limitNumber
            }),
            database_1.prisma.appointment.count({ where })
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
exports.default = router;
