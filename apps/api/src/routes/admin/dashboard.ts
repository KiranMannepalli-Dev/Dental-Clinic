import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';

const router = Router();

router.use(requireAdmin);

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayAppointments,
      pendingAppointments,
      allCompletedThisMonth,
      totalPatients,
      newPatientsThisMonth,
    ] = await Promise.all([
      prisma.appointment.findMany({
        where: { appointmentDate: { gte: today, lt: tomorrow } }
      }),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.findMany({
        where: { status: 'COMPLETED', appointmentDate: { gte: firstDayOfMonth } },
        include: { service: true }
      }),
      prisma.patient.count(),
      prisma.patient.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
    ]);

    const thisMonthRevenue = allCompletedThisMonth.reduce(
      (acc: number, curr: any) => acc + Number(curr.service?.priceMin || 0), 0
    );

    const statusBreakdown = todayAppointments.reduce(
      (acc: Record<string, number>, curr: any) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>
    );

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
  } catch (error) {
    next(error);
  }
});

// ─── Activity Feed (real data) ─────────────────────────────────────────────────
router.get('/activity', async (req, res, next) => {
  try {
    const [recentAppointments, recentContacts, recentReviews] = await Promise.all([
      prisma.appointment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          patient: { select: { firstName: true, lastName: true } },
          service: { select: { name: true } },
          doctor: { select: { firstName: true, lastName: true } },
        }
      }),
      prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: { patient: { select: { firstName: true, lastName: true } } }
      }),
    ]);

    const activities: any[] = [];

    recentAppointments.forEach((appt: any) => {
      activities.push({
        id: `appt-${appt.id}`,
        type: 'booking',
        text: `New appointment ${appt.bookingRef} — ${appt.patient.firstName} ${appt.patient.lastName} for ${appt.service.name}`,
        status: appt.status,
        time: appt.createdAt,
      });
    });

    recentContacts.forEach((contact: any) => {
      activities.push({
        id: `contact-${contact.id}`,
        type: 'lead',
        text: `New inquiry from ${contact.name}: "${contact.subject}"`,
        status: contact.isResolved ? 'RESOLVED' : 'NEW',
        time: contact.createdAt,
      });
    });

    recentReviews.forEach((review: any) => {
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
  } catch (error) {
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

    const weeklyAppointments = await prisma.appointment.findMany({
      where: { createdAt: { gte: sevenDaysAgo, lte: today } },
      select: { createdAt: true, status: true },
    });

    // Group by day
    const dayLabels: string[] = [];
    const dayCounts: Record<string, { total: number; confirmed: number; pending: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      const rawKey = d.toISOString().split('T')[0];
      dayLabels.push(key);
      dayCounts[rawKey] = { total: 0, confirmed: 0, pending: 0 };
    }

    weeklyAppointments.forEach((appt: any) => {
      const rawKey = new Date(appt.createdAt).toISOString().split('T')[0];
      if (dayCounts[rawKey]) {
        dayCounts[rawKey].total++;
        if (appt.status === 'CONFIRMED' || appt.status === 'COMPLETED') dayCounts[rawKey].confirmed++;
        if (appt.status === 'PENDING') dayCounts[rawKey].pending++;
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

    const monthlyCompleted = await prisma.appointment.findMany({
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

    const monthlyRevenue: Record<string, number> = {};
    const monthLabels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(today.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      monthlyRevenue[key] = 0;
      monthLabels.push(label);
    }

    (monthlyCompleted as any[]).forEach((appt: any) => {
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

    // Top services by bookings (optimized database-level aggregation)
    const groupedServices = await prisma.appointment.groupBy({
      by: ['serviceId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const serviceIds = groupedServices.map(g => g.serviceId);
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true },
    });

    const topServices = groupedServices.map(g => {
      const s = services.find(x => x.id === g.serviceId);
      return {
        name: s?.name || 'Unknown',
        count: g._count.id,
      };
    });

    res.json({
      success: true,
      data: { weeklyData, monthlyData, topServices },
    });
  } catch (error) {
    next(error);
  }
});

// ─── Notification Count (pending appointments + unread contacts + pending reviews) ──────────────
router.get('/notifications', async (req, res, next) => {
  try {
    const [pendingCount, unreadContacts, pendingReviews] = await Promise.all([
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.contactSubmission.count({ where: { isRead: false } }),
      prisma.review.count({ where: { isPublished: false } }),
    ]);
    res.json({
      success: true,
      data: {
        pendingAppointments: pendingCount,
        unreadContacts,
        pendingReviews,
        total: pendingCount + unreadContacts + pendingReviews
      }
    });
  } catch (error) {
    next(error);
  }
});

// ─── Today's Schedule ─────────────────────────────────────────────────────────
router.get('/today-schedule', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: { appointmentDate: { gte: today, lt: tomorrow } },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { firstName: true, lastName: true } },
        service: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 20,
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
});

// ─── Doctor Performance Stats ─────────────────────────────────────────────────
router.get('/doctor-stats', async (req, res, next) => {
  try {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      select: {
        id: true, firstName: true, lastName: true, specialization: true,
        rating: true, reviewCount: true, consultationFee: true,
        appointments: {
          where: { appointmentDate: { gte: firstDayOfMonth } },
          select: { status: true }
        }
      }
    });

    const data = doctors.map((doc: any) => {
      const total = doc.appointments.length;
      const completed = doc.appointments.filter((a: any) => a.status === 'COMPLETED').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        id: doc.id,
        name: `Dr. ${doc.firstName} ${doc.lastName}`,
        specialization: doc.specialization,
        rating: doc.rating,
        reviewCount: doc.reviewCount,
        consultationFee: Number(doc.consultationFee),
        appointmentsThisMonth: total,
        completedThisMonth: completed,
        completionRate,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ─── Patient Growth (last 6 months) ──────────────────────────────────────────
router.get('/patient-growth', async (req, res, next) => {
  try {
    const today = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      const label = month.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      const count = await prisma.patient.count({
        where: { createdAt: { gte: month, lt: nextMonth } }
      });
      data.push({ month: label, patients: count });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ─── Revenue by Doctor this month ─────────────────────────────────────────────
router.get('/revenue-by-doctor', async (req, res, next) => {
  try {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const completedAppts = await prisma.appointment.findMany({
      where: { status: 'COMPLETED', appointmentDate: { gte: firstDayOfMonth } },
      select: {
        doctor: { select: { firstName: true, lastName: true } },
        service: { select: { priceMin: true } }
      }
    });

    const revenueMap: Record<string, number> = {};
    (completedAppts as any[]).forEach((a: any) => {
      const name = `Dr. ${a.doctor?.firstName} ${a.doctor?.lastName}`;
      revenueMap[name] = (revenueMap[name] || 0) + Number(a.service?.priceMin || 0);
    });

    const data = Object.entries(revenueMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
