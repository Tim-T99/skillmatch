import express from "express";
import { deleteUser, getDashboardStats, getUsers, updateUser } from "../controllers/userController";
import { protect } from "../middlewares/auth/protect";
import { processGeminiQuery } from '../controllers/geminiController';

const router = express.Router()

router.get('/', (req, res) => {
  res.send('Auth route');
});
router.post('/gemini/query', protect, processGeminiQuery);
router.get('/users', protect, getUsers);
router.put('/users/:id/:role_id', protect, updateUser);
router.delete('/users/:id/:role_id', protect, deleteUser);
router.get('/dashboard', protect, getDashboardStats);

export default router
