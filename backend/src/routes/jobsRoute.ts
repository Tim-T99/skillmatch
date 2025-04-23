import express from 'express';
import { createJob, deleteJobs, getJobs, setInterview, updateJobs } from '../controllers/jobsController';
import { protect } from '../middlewares/auth/protect';

const router = express.Router();

router.post('/jobs', protect, createJob);
router.get('/jobs', protect, getJobs);
router.put('/jobs/:id', protect, updateJobs);
router.delete('/jobs/:id', protect, deleteJobs);
router.post('/interviews', protect, setInterview);

export default router;