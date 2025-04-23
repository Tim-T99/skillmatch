// src/controllers/adminController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.config';
import asyncHandler from '../middlewares/asyncHandler';

interface Admin {
  firstName: string;
  secondName: string;
  email: string;
  password?: string;
}


const generateToken = (adminId: number) => {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });
};

export const createAdmin = async (req: Request, res: Response) => {
  const { email, password, first_name, second_name, role_id = 1 } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admin (email, password, first_name, second_name, role_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email, hashedPassword, first_name, second_name, role_id]
    );

    const token = generateToken(result.rows[0].id);

    res.status(201).json({ admin: result.rows[0], token });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Server error creating admin' });
  }
};

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM admin');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching admins' });
  }
};

export const getAdminById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM admin WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching admin' });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, first_name, second_name } = req.body;

  try {
    const result = await pool.query(
      `UPDATE admin SET email = $1, first_name = $2, second_name = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [email, first_name, second_name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating admin' });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM admin WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting admin' });
  }
};

export const getAdminProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user || user.role_id !== 1) {
    res.status(403).json({ error: 'Access denied. Admin only.' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT id, first_name, second_name, email FROM admin WHERE id = $1',
      [String(user.id)] // Convert number to string
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    const admin = result.rows[0];
    res.json({
      firstName: admin.first_name,
      secondName: admin.second_name,
      email: admin.email,
    });
  } catch (error) {
    console.error('Error in getAdminProfile:', error);
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
});

export const updateAdminProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user || user.role_id !== 1) {
    res.status(403).json({ error: 'Access denied. Admin only.' });
    return;
  }

  const { firstName, secondName, email, password }: Admin = req.body;

  if (!firstName || !secondName || !email) {
    res.status(400).json({ error: 'First name, second name, and email are required' });
    return;
  }

  try {
    const updateFields: (string | null)[] = [firstName, secondName, email];
    let query = 'UPDATE admin SET first_name = $1, second_name = $2, email = $3';
    if (password) {
      query += ', password = $4';
      updateFields.push(password);
    }
    query += ' WHERE id = $' + (updateFields.length + 1) + ' RETURNING id';
    updateFields.push(String(user.id)); // Convert number to string

    const result = await pool.query(query, updateFields);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error in updateAdminProfile:', error);
    res.status(500).json({ error: 'Failed to update admin profile' });
  }
});