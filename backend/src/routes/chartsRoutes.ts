import express from 'express';
import { getEmployerChart, getEmployerMetrics } from '../controllers/chartController';
import { protect } from '../middlewares/auth/protect';

const router = express.Router();

router.get('/charts', protect, getEmployerChart);
router.get('/metrics', protect, getEmployerMetrics);

export default router;