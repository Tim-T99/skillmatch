"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployer = exports.updateEmployer = exports.createEmployer = exports.getEmployerById = exports.getAllEmployers = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
// GET /admin/employers
const getAllEmployers = async (_req, res) => {
    const { rows } = await db_config_1.default.query('SELECT * FROM employer');
    res.json(rows);
};
exports.getAllEmployers = getAllEmployers;
// GET /admin/employers/:id
const getEmployerById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await db_config_1.default.query('SELECT * FROM employer WHERE id = $1', [id]);
    if (rows.length === 0)
        return res.status(404).json({ message: 'Employer not found' });
    res.json(rows[0]);
};
exports.getEmployerById = getEmployerById;
// POST /admin/employers
const createEmployer = async (req, res) => {
    const { role_id, company_id, email, password, first_name, second_name, telephone_1, telephone_2, address, postal_code, } = req.body;
    const { rows } = await db_config_1.default.query(`INSERT INTO employer (
      role_id, company_id, email, password, first_name, second_name,
      telephone_1, telephone_2, address, postal_code
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, [role_id, company_id, email, password, first_name, second_name, telephone_1, telephone_2, address, postal_code]);
    res.status(201).json(rows[0]);
};
exports.createEmployer = createEmployer;
// PUT /admin/employers/:id
const updateEmployer = async (req, res) => {
    const { id } = req.params;
    const { role_id, company_id, email, password, first_name, second_name, telephone_1, telephone_2, address, postal_code, } = req.body;
    const { rows } = await db_config_1.default.query(`UPDATE employer SET
      role_id=$1, company_id=$2, email=$3, password=$4,
      first_name=$5, second_name=$6, telephone_1=$7, telephone_2=$8,
      address=$9, postal_code=$10, updated_at=NOW()
     WHERE id=$11 RETURNING *`, [role_id, company_id, email, password, first_name, second_name, telephone_1, telephone_2, address, postal_code, id]);
    res.json(rows[0]);
};
exports.updateEmployer = updateEmployer;
// DELETE /admin/employers/:id
const deleteEmployer = async (req, res) => {
    const { id } = req.params;
    await db_config_1.default.query('DELETE FROM employer WHERE id = $1', [id]);
    res.status(204).send();
};
exports.deleteEmployer = deleteEmployer;
