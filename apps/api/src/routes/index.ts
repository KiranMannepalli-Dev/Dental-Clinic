import { Router } from 'express';
import publicAppointments from './public/appointments';
import publicDoctors from './public/doctors';
import publicServices from './public/services';
import publicSettings from './public/settings';
import publicBlogs from './public/blogs';
import publicGallery from './public/gallery';
import publicReviews from './public/reviews';

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
import adminStaff from './admin/staff';
import adminPatients from './admin/patients';
import adminUpload from './admin/upload';
import adminBeforeAfter from './admin/beforeAfter';
import adminLabTests from './admin/labTests';
import webhooks from './webhooks';

const router = Router();

// Public routes
router.use('/public/appointments', publicAppointments);
router.use('/public/doctors', publicDoctors);
router.use('/public/services', publicServices);
router.use('/public/settings', publicSettings);
router.use('/public/blogs', publicBlogs);
router.use('/public/gallery', publicGallery);
router.use('/public/reviews', publicReviews);

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
router.use('/admin/staff', adminStaff);
router.use('/admin/patients', adminPatients);
router.use('/admin/upload', adminUpload);
router.use('/admin/before-after', adminBeforeAfter);
router.use('/admin/lab-tests', adminLabTests);

// Webhooks
router.use('/webhooks', webhooks);

export default router;
