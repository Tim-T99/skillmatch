import express from 'express';
import { protect } from '../middlewares/auth/protect';
import { applyJob, getAllSeekerJobs, getSeekerAppliedJobs, getSeekerInterviews, getSeekerJobs, getSeekerStats} from '../controllers/seekerController';

const router = express.Router();

router.get('/seeker-stats', protect, getSeekerStats);
router.get('/allSeeker-jobs', protect, getAllSeekerJobs);
router.get('/seeker-jobs', protect, getSeekerJobs);
router.post('/apply-job', protect, applyJob);
router.get('/seeker-applied-jobs', protect, getSeekerAppliedJobs);
router.get('/seeker-interviews', protect, getSeekerInterviews);
export default router;