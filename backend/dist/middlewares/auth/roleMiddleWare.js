"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.borrowerGuard = exports.librarianGuard = exports.adminLibGuard = exports.adminGuard = exports.roleGuard = void 0;
const asyncHandler_1 = __importDefault(require("../asyncHandler"));
//ensure user has required roles 
const roleGuard = (allowedRoles) => (0, asyncHandler_1.default)(async (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role_name)) {
        res.status(403).json({ message: "Access denied: Insufficient permissions" });
        return;
    }
    next();
});
exports.roleGuard = roleGuard;
// Specific guards
exports.adminGuard = (0, exports.roleGuard)(["Admin"]); // Full app control
exports.adminLibGuard = (0, exports.roleGuard)(["Admin", "Librarian"]);
exports.librarianGuard = (0, exports.roleGuard)(["Librarian"]); // Book creation & management
exports.borrowerGuard = (0, exports.roleGuard)(["Borrower"]); // Borrower-only actions
