import { Request, Response } from 'express';
import pool from '../config/db.config';

export const getAllSeekers = async (_req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM seeker');
  res.json(rows);
};

export const getSeekerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM seeker WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Seeker not found' });
  res.json(rows[0]);
};

export const createSeeker = async (req: Request, res: Response) => {
  const {
    role_id, email, password, first_name, second_name,
    telephone_1, telephone_2, address, postal_code,
    education_level, institution, cv,
  } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO seeker (
      role_id, email, password, first_name, second_name,
      telephone_1, telephone_2, address, postal_code,
      education_level, institution, cv
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [role_id, email, password, first_name, second_name, telephone_1, telephone_2, address, postal_code, education_level, institution, cv]
  );

  res.status(201).json(rows[0]);
};

export const updateSeeker = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    role_id, email, password, first_name, second_name,
    telephone_1, telephone_2, address, postal_code,
    education_level, institution, cv,
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE seeker SET
      role_id=$1, email=$2, password=$3, first_name=$4, second_name=$5,
      telephone_1=$6, telephone_2=$7, address=$8, postal_code=$9,
      education_level=$10, institution=$11, cv=$12, updated_at=NOW()
     WHERE id=$13 RETURNING *`,
    [role_id, email, password, first_name, second_name, telephone_1, telephone_2, address, postal_code, education_level, institution, cv, id]
  );

  res.json(rows[0]);
};

export const deleteSeeker = async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM seeker WHERE id = $1', [id]);
  res.status(204).send();
};
