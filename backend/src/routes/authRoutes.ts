import express from 'express';
import { createEmployer, createSeeker, createUser, getEmployer, loginUser, logoutUser, updateEmployer } from '../controllers/authController';
import { protect } from '../middlewares/auth/protect';
import { getSeekerProfile, updateSeekerProfile } from '../controllers/seekerController';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Auth route');
});

// Public routes
router.post('/register/admin', createUser);
router.post('/register', createEmployer);
router.post('/register/seeker', createSeeker);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.get('/employerProfile', protect, getEmployer);
router.post('/update/employer', protect, updateEmployer);
router.get('/seekerProfile', protect, getSeekerProfile);
router.post('/seekerUpdate', protect, updateSeekerProfile);


export default router;