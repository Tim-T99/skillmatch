import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/db.config';
import usersRoutes from './routes/usersRoute';
import authRoutes from './routes/authRoutes';
import jobsRoutes from './routes/jobsRoute';
import chartsRoutes from './routes/chartsRoutes';
import seekerRoutes from './routes/seekerRoutes';
import adminRoutes from './routes/adminRoutes';
import geminiRoute from './routes/geminiroute';
import { notFound } from './middlewares/errorMiddlewares';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:4200', 'http://skillmatch25.s3-website.eu-north-1.amazonaws.com'];
    console.log('Request Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

app.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Test RDS connection
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      message: 'Welcome to SkillMatch backend',
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error('Database error in root route:', error);
    next(error);

  }

});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api', jobsRoutes);
app.use('/api', chartsRoutes);
app.use('/api', seekerRoutes);
app.use('/api', adminRoutes);
app.use('/api', usersRoutes)
app.use('/api', geminiRoute)
app.use(notFound);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port: ${PORT}`);
});