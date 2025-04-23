import { Request, Response } from 'express';
import { Pool } from 'pg'; 
import asyncHandler from '../middlewares/asyncHandler';
import pool from '../config/db.config';

interface User {
  id: number;
  name: string;
  role: string;
  status: string;
}

// Get all users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, search } = req.query as { role: string; search: string };

  let query = `
    SELECT u.id, u.first_name, u.second_name, r.name as role, 
           CASE 
             WHEN u.updated_at < NOW() - INTERVAL '30 days' THEN 'Inactive'
             WHEN u.updated_at < NOW() - INTERVAL '7 days' THEN 'Suspended'
             ELSE 'Active'
           END as status
    FROM (
      SELECT id, first_name, second_name, role_id, updated_at FROM seeker
      UNION
      SELECT id, first_name, second_name, role_id, updated_at FROM employer
    ) u
    JOIN role r ON u.role_id = r.id
  `;

  const params: string[] = [];
  const conditions: string[] = [];

  if (role && role !== 'All') {
    conditions.push('r.name = $' + (params.length + 1));
    params.push(role);
  }

  if (search) {
    conditions.push(
      `(u.first_name ILIKE $${params.length + 1} OR u.second_name ILIKE $${params.length + 1})`
    );
    params.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY u.first_name, u.second_name';

  const users = await pool.query(query, params);
  res.json(
    users.rows.map((user) => ({
      id: user.id,
      name: `${user.first_name} ${user.second_name || ''}`.trim(),
      role: user.role,
      status: user.status,
    }))
  );
});

// Update user
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, role, status } = req.body as User;

  const [firstName, secondName] = name.split(' ');
  const roleResult = await pool.query('SELECT id FROM role WHERE name = $1', [role]);
  if (!roleResult.rows[0]) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  // Determine if user is employer or seeker
  let table = 'seeker';
  const seekerCheck = await pool.query('SELECT id FROM seeker WHERE id = $1', [id]);
  if (!seekerCheck.rows[0]) {
    table = 'employer';
  }

  await pool.query(
    `UPDATE ${table} 
     SET first_name = $1, second_name = $2, role_id = $3, 
         updated_at = CURRENT_TIMESTAMP 
     WHERE id = $4`,
    [firstName, secondName || null, roleResult.rows[0].id, id]
  );

  res.json({ message: 'User updated successfully' });
});

// Delete user
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Try deleting from seeker first
  const seekerResult = await pool.query('DELETE FROM seeker WHERE id = $1', [id]);
  if (seekerResult.rowCount === 0) {
    // If not in seeker, try employer
    await pool.query('DELETE FROM employer WHERE id = $1', [id]);
  }
  res.json({ message: 'User deleted successfully' });
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const applications = await pool.query('SELECT COUNT(*) FROM application');
  const interviews = await pool.query(
    'SELECT COUNT(*) FROM interviews WHERE interview_date >= NOW()'
  );
  const jobs = await pool.query('SELECT COUNT(*) FROM job WHERE status = $1', ['Active']);

  res.json({
    applications: parseInt(applications.rows[0].count),
    interviews: parseInt(interviews.rows[0].count),
    jobOpenings: parseInt(jobs.rows[0].count),
  });
});