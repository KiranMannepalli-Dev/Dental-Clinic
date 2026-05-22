"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../config/database");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const doctors = await database_1.prisma.doctor.findMany({
            where: { isActive: true },
            include: {
                services: {
                    include: {
                        service: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: doctors
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:slug', async (req, res, next) => {
    try {
        const doctor = await database_1.prisma.doctor.findUnique({
            where: { slug: req.params.slug },
            include: {
                services: {
                    include: { service: true }
                },
                reviews: {
                    where: { isPublished: true },
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!doctor) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Doctor not found' } });
        }
        res.json({
            success: true,
            data: doctor
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
