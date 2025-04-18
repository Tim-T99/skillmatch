"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const db_config_1 = __importDefault(require("../config/db.config"));
// Create users
//Get All users 
exports.getUsers = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const result = await db_config_1.default.query("SELECT * FROM users ORDER BY user_id ASC ");
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//Get single user
exports.getUserById = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_config_1.default.query("SELECT * FROM public.users WHERE user_id = $1", [id]);
        if (result.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//update user 
exports.updateUser = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const checkUser = await db_config_1.default.query("SELECT * FROM public.users WHERE user_id = $1", [id]);
        if (checkUser.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        const result = await db_config_1.default.query("UPDATE users SET name=$1, email=$2, password=$3, updated_at=NOW() WHERE user_id=$4 RETURNING *", [name, email, password, id]);
        res.json({ message: "User updated", user: result.rows[0] });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//delete user  
exports.deleteUser = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { id } = req.params;
        const checkUser = await db_config_1.default.query("SELECT * FROM public.users WHERE user_id = $1", [id]);
        if (checkUser.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        await db_config_1.default.query("DELETE FROM public.users WHERE user_id = $1", [id]);
        res.json({ message: "User deleted successful" });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
