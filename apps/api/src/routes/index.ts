import { Router } from 'express';
import publicAppointments from './public/appointments';
import publicDoctors from './public/doctors';
import publicServices from './public/services';

import adminAuth from './admin/auth';
import adminDashboard from './admin/dashboard';
import adminAppointments from './admin/appointments';

const router = Router();

// Public routes
router.use('/public/appointments', publicAppointments);
router.use('/public/doctors', publicDoctors);
router.use('/public/services', publicServices);

// Admin routes
router.use('/admin/auth', adminAuth);
router.use('/admin/dashboard', adminDashboard);
router.use('/admin/appointments', adminAppointments);

export default router;
