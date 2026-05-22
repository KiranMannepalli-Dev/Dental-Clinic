"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAdmin);
router.get('/stats', async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const [todayAppointments, pendingAppointments, allCompletedThisMonth] = await Promise.all([
            database_1.prisma.appointment.findMany({
                where: {
                    appointmentDate: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            }),
            database_1.prisma.appointment.count({
                where: { status: 'PENDING' }
            }),
            database_1.prisma.appointment.findMany({
                where: {
                    status: 'COMPLETED',
                    appointmentDate: {
                        gte: firstDayOfMonth
                    }
                },
                include: { service: true }
            })
        ]);
        // Simple revenue calculation (based on priceMin)
        const thisMonthRevenue = allCompletedThisMonth.reduce((acc, curr) => acc + Number(curr.service.priceMin || 0), 0);
        const statusBreakdown = todayAppointments.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});
        res.json({
            success: true,
            data: {
                todayAppointments: {
                    total: todayAppointments.length,
                    breakdown: statusBreakdown
                },
                thisMonthRevenue,
                pendingApprovals: pendingAppointments
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
