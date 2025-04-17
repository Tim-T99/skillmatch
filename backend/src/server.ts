import { setupAliases } from "import-aliases";
setupAliases()
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { readFileSync } from 'fs';

import cors from 'cors';
import pool from './config/db.config';
import authRoutes from '@app/routes/authRoutes'
import usersRoutes from '@app/routes/usersRoute'
import booksRoutes from '@app/routes/booksRoute'
import borrowersRoutes from '@app/routes/borrowersRoute'
import { notFound } from '@app/middlewares/errorMiddlewares';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:4200', 'http://skillmatch25.s3-website.eu-north-1.amazonaws.com'];

app.use(cors({
  origin: (origin, callback) => {
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
  optionsSuccessStatus: 204
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use("/api/auth", authRoutes)
app.use("/api/users", usersRoutes )
app.use("/api/books", booksRoutes )
app.use("/api/borrowers", borrowersRoutes )
app.use(cookieParser())

app.use(notFound)

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
