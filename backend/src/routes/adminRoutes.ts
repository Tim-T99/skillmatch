import { Router } from 'express';
import {
  getAllEmployers,
  getEmployerById,
  createEmployer,
  updateEmployer,
  deleteEmployer
} from '../controllers/adminEmployerController';
import asyncHandler from '../middlewares/asyncHandler';
import { createSeeker, deleteSeeker, getAllSeekers, getSeekerById, updateSeeker } from '../controllers/adminSeekerController';
import { createAdmin, deleteAdmin, getAdminById, getAdminProfile, getAllAdmins, updateAdmin, updateAdminProfile } from '../controllers/adminController';
import { protect } from '../middlewares/auth/protect';
import { getChartData, getDashboardStats } from '../controllers/dashboardController';

const router = Router();
router.post('/admin', createAdmin);
router.get('/admin/profile', protect, getAdminProfile);
router.put('/admin/profile', protect, updateAdminProfile);
router.get('/metrics', protect, getDashboardStats);
router.get('/dashboard/chart', protect, getChartData);
router.get('/admins', protect, asyncHandler(getAllAdmins));
router.get('/admin/:id', protect, asyncHandler(getAdminById));
router.put('/admin/:id', protect, asyncHandler(updateAdmin));
router.delete('/admin/:id', protect, asyncHandler(deleteAdmin));
router.get('/admin/employers', asyncHandler(getAllEmployers));
router.get('/admin/employers/:id', asyncHandler(getEmployerById));
router.post('/admin/employers', asyncHandler(createEmployer));
router.put('/admin/employers/:id', asyncHandler(updateEmployer));
router.delete('/admin/employers/:id', asyncHandler(deleteEmployer));
router.get('/admin/seekers', asyncHandler(getAllSeekers));
router.get('/admin/seekers/:id', asyncHandler(getSeekerById));
router.post('/admin/seekers', asyncHandler(createSeeker));
router.post('/admin/seekers/:id', asyncHandler(updateSeeker));
router.delete('/admin/seekers/:id', asyncHandler(deleteSeeker));

export default router;


