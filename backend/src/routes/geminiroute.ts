import express from "express";
import { protect } from "../middlewares/auth/protect";
import { processGeminiQuery } from '../controllers/geminiController';

const router = express.Router()

router.get('/gemini', (req, res) => {
  res.send('gemini route');
});
router.post('/gemini/query', protect, processGeminiQuery);

export default router