import { Router } from 'express';
import publicAppointments from './public/appointments';
import publicDoctors from './public/doctors';
import publicServices from './public/services';

import adminAuth from './admin/auth';
import adminDashboard from './admin/dashboard';
import adminAppointments from './admin/appointments';
import adminDoctors from './admin/doctors';
import adminServices from './admin/services';
import adminBlogs from './admin/blogs';
import adminGallery from './admin/gallery';
import adminReviews from './admin/reviews';
import adminContacts from './admin/contacts';
import adminSettings from './admin/settings';

const router = Router();

// Public routes
router.use('/public/appointments', publicAppointments);
router.use('/public/doctors', publicDoctors);
router.use('/public/services', publicServices);

// Admin routes
router.use('/admin/auth', adminAuth);
router.use('/admin/dashboard', adminDashboard);
router.use('/admin/appointments', adminAppointments);
router.use('/admin/doctors', adminDoctors);
router.use('/admin/services', adminServices);
router.use('/admin/blogs', adminBlogs);
router.use('/admin/gallery', adminGallery);
router.use('/admin/reviews', adminReviews);
router.use('/admin/contacts', adminContacts);
router.use('/admin/settings', adminSettings);

export default router;
