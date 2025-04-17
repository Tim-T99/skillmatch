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
const PORT = process.env.PORT;

app.use(cors({
  origin: "http://localhost:4200", // Adjust if your frontend port differs
  methods: ["GET", "PUT", "DELETE", "POST"],
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
