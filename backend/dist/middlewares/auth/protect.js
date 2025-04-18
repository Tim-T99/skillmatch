"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_config_1 = __importDefault(require("../../config/db.config"));
const asyncHandler_1 = __importDefault(require("../asyncHandler"));
//Auth middleware to protect routes 
exports.protect = (0, asyncHandler_1.default)(async (req, res, next) => {
    let token;
    //trying to get token from Authorization Header 
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    //get the token from cookies 
    if (!token && req.cookies?.access_token) {
        token = req.cookies.access_token;
    }
    //if no token found
    if (!token) {
        res.status(401).json({ message: "Not authorized , no token" });
    }
    try {
        //we have the token but we nneed to verify it 
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        //verify token 
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        //get the user from database
        const userQuery = await db_config_1.default.query("SELECT users.id, users.name, users.email, users.role_id, user_roles.role_name FROM users JOIN user_roles ON users.role_id = user_roles.id WHERE users.id = $1", [decoded.userId]);
        if (userQuery.rows.length === 0) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        //attach the user to the request 
        req.user = userQuery.rows[0];
        next(); //proceed to next thing 
    }
    catch (error) {
        console.error("JWT Error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
});
