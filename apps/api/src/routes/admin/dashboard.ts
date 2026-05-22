import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';

const router = Router();

router.use(requireAdmin);

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
      allCompletedThisMonth
    ] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          appointmentDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.appointment.count({
        where: { status: 'PENDING' }
      }),
      prisma.appointment.findMany({
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
    const thisMonthRevenue = allCompletedThisMonth.reduce((acc: number, curr: any) => acc + Number(curr.service.priceMin || 0), 0);

    const statusBreakdown = todayAppointments.reduce((acc: Record<string, number>, curr: any) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
  } catch (error) {
    next(error);
  }
});

export default router;
