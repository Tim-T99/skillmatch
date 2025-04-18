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
exports.deleteBorrower = exports.updateBorrower = exports.getBorrowerById = exports.getBorrowers = exports.createBorrower = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const db_config_1 = __importDefault(require("../config/db.config"));
// Create borrower
exports.createBorrower = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, book_id, librarian_who_processed, borrow_date, return_date, status } = req.body;
        //check if borrower exists
        const userCheck = yield db_config_1.default.query("SELECT user_id FROM borrowers WHERE user_id = $1", [user_id]);
        if (userCheck.rows.length > 0) {
            res.status(400).json({
                message: "Borrower already exists"
            });
            return;
        }
        //insert the borrower
        const userResult = yield db_config_1.default.query("INSERT INTO borrowers (user_id, book_id, librarian_who_processed, borrow_date, return_date, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [user_id, book_id, librarian_who_processed, borrow_date, return_date, status]);
        res.status(201).json({
            message: "Borrower successfully created",
            user: userResult.rows[0]
        });
    }
    catch (error) {
        console.error("Error creating borrower:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//Get all borrowers
exports.getBorrowers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_config_1.default.query("SELECT * FROM borrowers ORDER BY user_id ASC ");
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error("Error getting borrowers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//Get single borrower 
exports.getBorrowerById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield db_config_1.default.query("SELECT * FROM public.borrowers WHERE borrow_id = $1", [id]);
        if (result.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error("Error getting borower:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//update borrower
exports.updateBorrower = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { user_id, book_id, librarian_who_processed, borrow_date, return_date, status } = req.body;
        const checkUser = yield db_config_1.default.query("SELECT * FROM public.borrowers WHERE borrow_id = $1", [id]);
        if (checkUser.rows.length === 0) {
            res.status(400).json({ message: "Borrower not found" });
            return;
        }
        const result = yield db_config_1.default.query("UPDATE borrowers SET user_id=$1, book_id=$2, librarian_who_processed=$3, borrow_date=$4, return_date=$5, status=$6 RETURNING *", [user_id, book_id, librarian_who_processed, borrow_date, return_date, status]);
        res.json({ message: "Borrower updated", user: result.rows[0] });
    }
    catch (error) {
        console.error("Error updating borrower:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//delete user  
exports.deleteBorrower = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const checkUser = yield db_config_1.default.query("SELECT * FROM public.borrowers WHERE user_id = $1", [id]);
        if (checkUser.rows.length === 0) {
            res.status(400).json({ message: "Borrower not found" });
            return;
        }
        yield db_config_1.default.query("DELETE FROM public.borrowers WHERE user_id = $1", [id]);
        res.json({ message: "Borrower deleted successful" });
    }
    catch (error) {
        console.error("Error deleting borrower:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
