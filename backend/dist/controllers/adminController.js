"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdminProfile = exports.getAdminProfile = exports.deleteAdmin = exports.updateAdmin = exports.getAdminById = exports.getAllAdmins = exports.createAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_config_1 = __importDefault(require("../config/db.config"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const generateToken = (adminId) => {
    return jsonwebtoken_1.default.sign({ id: adminId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};
const createAdmin = async (req, res) => {
    const { email, password, first_name, second_name, role_id = 1 } = req.body;
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const result = await db_config_1.default.query(`INSERT INTO admin (email, password, first_name, second_name, role_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [email, hashedPassword, first_name, second_name, role_id]);
        const token = generateToken(result.rows[0].id);
        res.status(201).json({ admin: result.rows[0], token });
    }
    catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Server error creating admin' });
    }
};
exports.createAdmin = createAdmin;
const getAllAdmins = async (req, res) => {
    try {
        const result = await db_config_1.default.query('SELECT * FROM admin');
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error fetching admins' });
    }
};
exports.getAllAdmins = getAllAdmins;
const getAdminById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db_config_1.default.query('SELECT * FROM admin WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error fetching admin' });
    }
};
exports.getAdminById = getAdminById;
const updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { email, first_name, second_name } = req.body;
    try {
        const result = await db_config_1.default.query(`UPDATE admin SET email = $1, first_name = $2, second_name = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`, [email, first_name, second_name, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error updating admin' });
    }
};
exports.updateAdmin = updateAdmin;
const deleteAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db_config_1.default.query('DELETE FROM admin WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ message: 'Admin deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error deleting admin' });
    }
};
exports.deleteAdmin = deleteAdmin;
exports.getAdminProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const user = req.user;
    if (!user || user.role_id !== 1) {
        res.status(403).json({ error: 'Access denied. Admin only.' });
        return;
    }
    try {
        const result = await db_config_1.default.query('SELECT id, first_name, second_name, email FROM admin WHERE id = $1', [String(user.id)] // Convert number to string
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
    }
    catch (error) {
        console.error('Error in getAdminProfile:', error);
        res.status(500).json({ error: 'Failed to fetch admin profile' });
    }
});
exports.updateAdminProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const user = req.user;
    if (!user || user.role_id !== 1) {
        res.status(403).json({ error: 'Access denied. Admin only.' });
        return;
    }
    const { firstName, secondName, email, password } = req.body;
    if (!firstName || !secondName || !email) {
        res.status(400).json({ error: 'First name, second name, and email are required' });
        return;
    }
    try {
        const updateFields = [firstName, secondName, email];
        let query = 'UPDATE admin SET first_name = $1, second_name = $2, email = $3';
        if (password) {
            query += ', password = $4';
            updateFields.push(password);
        }
        query += ' WHERE id = $' + (updateFields.length + 1) + ' RETURNING id';
        updateFields.push(String(user.id)); // Convert number to string
        const result = await db_config_1.default.query(query, updateFields);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }
        res.json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Error in updateAdminProfile:', error);
        res.status(500).json({ error: 'Failed to update admin profile' });
    }
});
