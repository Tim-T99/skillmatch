// backend/middleware/protect.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import pool from '../../config/db.config';
import asyncHandler from '../asyncHandler';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      email: string;
      first_name: string;
      second_name: string;
      role_id: number;
    };
  }
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies?.refreshToken) {
    token = req.cookies.refreshToken;
  }

  if (!token) {
    console.log('Protect: No token provided');
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('Protect: JWT_SECRET is not defined');
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload & { id: number; role_id: number };

    let userQuery;
    let table: string;

    switch (decoded.role_id) {
      case 1:
        table = 'admin';
        userQuery = await pool.query(
          `SELECT id, email, first_name, second_name, role_id FROM admin WHERE id = $1`,
          [decoded.id]
        );
        break;
      case 2:
        table = 'employer';
        userQuery = await pool.query(
          `SELECT id, email, first_name, second_name, role_id FROM employer WHERE id = $1`,
          [decoded.id]
        );
        break;
      case 3:
        table = 'seeker';
        userQuery = await pool.query(
          `SELECT id, email, first_name, second_name, role_id FROM seeker WHERE id = $1`,
          [decoded.id]
        );
        break;
      default:
        console.log('Protect: Invalid role_id:', decoded.role_id);
        res.status(401).json({ message: 'Invalid role_id' });
        return;
    }

    if (userQuery.rows.length === 0) {
      console.log(`Protect: ${table} not found for id: ${decoded.id}`);
      res.status(401).json({ message: `${table.charAt(0).toUpperCase() + table.slice(1)} not found` });
      return;
    }

    req.user = userQuery.rows[0];
    next();
  } catch (error) {
    console.error('Protect: JWT verification failed:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
});