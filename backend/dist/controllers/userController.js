"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.deleteUser = exports.updateUser = exports.getUsers = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const db_config_1 = __importDefault(require("../config/db.config"));
// Get all users
exports.getUsers = (0, asyncHandler_1.default)(async (req, res) => {
    const { role, search } = req.query;
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
    const params = [];
    const conditions = [];
    if (role && role !== 'All') {
        conditions.push('r.name = $' + (params.length + 1));
        params.push(role);
    }
    if (search) {
        conditions.push(`(u.first_name ILIKE $${params.length + 1} OR u.second_name ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
    }
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY u.first_name, u.second_name';
    const users = await db_config_1.default.query(query, params);
    res.json(users.rows.map((user) => ({
        id: user.id,
        name: `${user.first_name} ${user.second_name || ''}`.trim(),
        role: user.role,
        status: user.status,
    })));
});
// Update user
exports.updateUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { name, role, status } = req.body;
    const [firstName, secondName] = name.split(' ');
    const roleResult = await db_config_1.default.query('SELECT id FROM role WHERE name = $1', [role]);
    if (!roleResult.rows[0]) {
        res.status(400).json({ error: 'Invalid role' });
        return;
    }
    // Determine if user is employer or seeker
    let table = 'seeker';
    const seekerCheck = await db_config_1.default.query('SELECT id FROM seeker WHERE id = $1', [id]);
    if (!seekerCheck.rows[0]) {
        table = 'employer';
    }
    await db_config_1.default.query(`UPDATE ${table} 
     SET first_name = $1, second_name = $2, role_id = $3, 
         updated_at = CURRENT_TIMESTAMP 
     WHERE id = $4`, [firstName, secondName || null, roleResult.rows[0].id, id]);
    res.json({ message: 'User updated successfully' });
});
// Delete user
exports.deleteUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    // Try deleting from seeker first
    const seekerResult = await db_config_1.default.query('DELETE FROM seeker WHERE id = $1', [id]);
    if (seekerResult.rowCount === 0) {
        // If not in seeker, try employer
        await db_config_1.default.query('DELETE FROM employer WHERE id = $1', [id]);
    }
    res.json({ message: 'User deleted successfully' });
});
exports.getDashboardStats = (0, asyncHandler_1.default)(async (req, res) => {
    const applications = await db_config_1.default.query('SELECT COUNT(*) FROM application');
    const interviews = await db_config_1.default.query('SELECT COUNT(*) FROM interviews WHERE interview_date >= NOW()');
    const jobs = await db_config_1.default.query('SELECT COUNT(*) FROM job WHERE status = $1', ['Active']);
    res.json({
        applications: parseInt(applications.rows[0].count),
        interviews: parseInt(interviews.rows[0].count),
        jobOpenings: parseInt(jobs.rows[0].count),
    });
});
