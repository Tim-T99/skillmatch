"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.borrowerGuard = exports.librarianGuard = exports.adminLibGuard = exports.adminGuard = exports.roleGuard = void 0;
const asyncHandler_1 = __importDefault(require("../asyncHandler"));
//ensure user has required roles 
const roleGuard = (allowedRoles) => (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !allowedRoles.includes(req.user.role_name)) {
        res.status(403).json({ message: "Access denied: Insufficient permissions" });
        return;
    }
    next();
}));
exports.roleGuard = roleGuard;
// Specific guards
exports.adminGuard = (0, exports.roleGuard)(["Admin"]); // Full app control
exports.adminLibGuard = (0, exports.roleGuard)(["Admin", "Librarian"]);
exports.librarianGuard = (0, exports.roleGuard)(["Librarian"]); // Book creation & management
exports.borrowerGuard = (0, exports.roleGuard)(["Borrower"]); // Borrower-only actions
