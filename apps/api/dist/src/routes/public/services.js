"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../config/database");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const services = await database_1.prisma.service.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
        res.json({
            success: true,
            data: services
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:slug', async (req, res, next) => {
    try {
        const service = await database_1.prisma.service.findUnique({
            where: { slug: req.params.slug },
            include: {
                doctors: {
                    include: { doctor: true }
                },
                beforeAfterImages: {
                    where: { isPublished: true }
                }
            }
        });
        if (!service) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
        }
        res.json({
            success: true,
            data: service
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
