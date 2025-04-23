import { Request, Response } from 'express';
import pool from '../config/db.config';

// GET /admin/employers
export const getAllEmployers = async (_req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM employer');
  res.json(rows);
};

// GET /admin/employers/:id
export const getEmployerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM employer WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Employer not found' });
  res.json(rows[0]);
};

// POST /admin/employers
export const createEmployer = async (req: Request, res: Response) => {
  const {
    role_id, company_id, email, password, first_name, second_name,
    telephone_1, telephone_2, address, postal_code,
  } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO employer (
      role_id, company_id, email, password, first_name, second_name,
      telephone_1, telephone_2, address, postal_code
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [role_id, company_id, email, password, first_name, second_name, telephone_1, telephone_2, address, postal_code]
  );

  res.status(201).json(rows[0]);
};

// PUT /admin/employers/:id
export const updateEmployer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    role_id, company_id, email, password, first_name, second_name,
    telephone_1, telephone_2, address, postal_code,
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE employer SET
      role_id=$1, company_id=$2, email=$3, password=$4,
      first_name=$5, second_name=$6, telephone_1=$7, telephone_2=$8,
      address=$9, postal_code=$10, updated_at=NOW()
     WHERE id=$11 RETURNING *`,
    [role_id, company_id, email, password, first_name, second_name, telephone_1, telephone_2, address, postal_code, id]
  );

  res.json(rows[0]);
};

// DELETE /admin/employers/:id
export const deleteEmployer = async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM employer WHERE id = $1', [id]);
  res.status(204).send();
};
