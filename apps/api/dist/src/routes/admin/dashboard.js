"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAdmin);
// ─── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const [todayAppointments, pendingAppointments, allCompletedThisMonth, totalPatients, newPatientsThisMonth,] = await Promise.all([
            database_1.prisma.appointment.findMany({
                where: { appointmentDate: { gte: today, lt: tomorrow } }
            }),
            database_1.prisma.appointment.count({ where: { status: 'PENDING' } }),
            database_1.prisma.appointment.findMany({
                where: { status: 'COMPLETED', appointmentDate: { gte: firstDayOfMonth } },
                include: { service: true }
            }),
            database_1.prisma.patient.count(),
            database_1.prisma.patient.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
        ]);
        const thisMonthRevenue = allCompletedThisMonth.reduce((acc, curr) => acc + Number(curr.service?.priceMin || 0), 0);
        const statusBreakdown = todayAppointments.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});
        res.json({
            success: true,
            data: {
                todayAppointments: { total: todayAppointments.length, breakdown: statusBreakdown },
                thisMonthRevenue,
                pendingApprovals: pendingAppointments,
                totalPatients,
                newPatientsThisMonth,
                completedThisMonth: allCompletedThisMonth.length,
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// ─── Activity Feed (real data) ─────────────────────────────────────────────────
router.get('/activity', async (req, res, next) => {
    try {
        const [recentAppointments, recentContacts, recentReviews] = await Promise.all([
            database_1.prisma.appointment.findMany({
                orderBy: { createdAt: 'desc' },
                take: 8,
                include: {
                    patient: { select: { firstName: true, lastName: true } },
                    service: { select: { name: true } },
                    doctor: { select: { firstName: true, lastName: true } },
                }
            }),
            database_1.prisma.contactSubmission.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            database_1.prisma.review.findMany({
                orderBy: { createdAt: 'desc' },
                take: 4,
                include: { patient: { select: { firstName: true, lastName: true } } }
            }),
        ]);
        const activities = [];
        recentAppointments.forEach((appt) => {
            activities.push({
                id: `appt-${appt.id}`,
                type: 'booking',
                text: `New appointment ${appt.bookingRef} — ${appt.patient.firstName} ${appt.patient.lastName} for ${appt.service.name}`,
                status: appt.status,
                time: appt.createdAt,
            });
        });
        recentContacts.forEach((contact) => {
            activities.push({
                id: `contact-${contact.id}`,
                type: 'lead',
                text: `New inquiry from ${contact.name}: "${contact.subject}"`,
                status: contact.isResolved ? 'RESOLVED' : 'NEW',
                time: contact.createdAt,
            });
        });
        recentReviews.forEach((review) => {
            activities.push({
                id: `review-${review.id}`,
                type: 'review',
                text: `${review.rating}★ review submitted by ${review.patient.firstName} ${review.patient.lastName}`,
                status: review.isPublished ? 'PUBLISHED' : 'PENDING',
                time: review.createdAt,
            });
        });
        // Sort all events by time, newest first
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        res.json({ success: true, data: activities.slice(0, 15) });
    }
    catch (error) {
        next(error);
    }
});
// ─── Charts Data ──────────────────────────────────────────────────────────────
router.get('/charts', async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        // Last 7 days — daily appointment counts
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const weeklyAppointments = await database_1.prisma.appointment.findMany({
            where: { createdAt: { gte: sevenDaysAgo, lte: today } },
            select: { createdAt: true, status: true },
        });
        // Group by day
        const dayLabels = [];
        const dayCounts = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
            const rawKey = d.toISOString().split('T')[0];
            dayLabels.push(key);
            dayCounts[rawKey] = { total: 0, confirmed: 0, pending: 0 };
        }
        weeklyAppointments.forEach((appt) => {
            const rawKey = new Date(appt.createdAt).toISOString().split('T')[0];
            if (dayCounts[rawKey]) {
                dayCounts[rawKey].total++;
                if (appt.status === 'CONFIRMED' || appt.status === 'COMPLETED')
                    dayCounts[rawKey].confirmed++;
                if (appt.status === 'PENDING')
                    dayCounts[rawKey].pending++;
            }
        });
        const weeklyData = Object.entries(dayCounts).map(([date, counts], i) => ({
            day: dayLabels[i],
            date,
            ...counts,
        }));
        // Last 6 months — monthly revenue from completed appointments
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const monthlyCompleted = await database_1.prisma.appointment.findMany({
            where: {
                status: 'COMPLETED',
                appointmentDate: { gte: sixMonthsAgo, lte: today },
            },
            select: {
                appointmentDate: true,
                service: {
                    select: {
                        priceMin: true,
                    },
                },
            },
        });
        const monthlyRevenue = {};
        const monthLabels = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today);
            d.setMonth(today.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            monthlyRevenue[key] = 0;
            monthLabels.push(label);
        }
        monthlyCompleted.forEach((appt) => {
            const d = new Date(appt.appointmentDate);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyRevenue[key] !== undefined) {
                monthlyRevenue[key] += Number(appt.service?.priceMin || 0);
            }
        });
        const monthlyData = Object.entries(monthlyRevenue).map(([month, revenue], i) => ({
            month: monthLabels[i],
            revenue,
        }));
        // Top services by bookings
        const allServiceAppointments = await database_1.prisma.appointment.findMany({
            select: { serviceId: true, service: { select: { name: true } } },
        });
        const serviceCounts = {};
        allServiceAppointments.forEach((appt) => {
            const sid = appt.serviceId;
            if (!serviceCounts[sid])
                serviceCounts[sid] = { name: appt.service?.name || sid, count: 0 };
            serviceCounts[sid].count++;
        });
        const topServices = Object.values(serviceCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        res.json({
            success: true,
            data: { weeklyData, monthlyData, topServices },
        });
    }
    catch (error) {
        next(error);
    }
});
// ─── Notification Count (pending appointments + unread contacts) ──────────────
router.get('/notifications', async (req, res, next) => {
    try {
        const [pendingCount, unreadContacts] = await Promise.all([
            database_1.prisma.appointment.count({ where: { status: 'PENDING' } }),
            database_1.prisma.contactSubmission.count({ where: { isRead: false } }),
        ]);
        res.json({
            success: true,
            data: { pendingAppointments: pendingCount, unreadContacts, total: pendingCount + unreadContacts }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
