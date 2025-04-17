import express from "express";
import { createBook, deleteBook, getBookById, getBooks, updateBook } from "../controllers/bookController";
import { adminGuard, borrowerGuard, librarianGuard, adminLibGuard } from "@app/middlewares/auth/roleMiddleWare";


const router = express.Router();

router.post("/", adminLibGuard, createBook);
router.get("/", borrowerGuard, getBooks);
router.get("/:id", borrowerGuard, getBookById);
router.put("/:id", librarianGuard, updateBook);
router.delete("/:id", adminGuard, deleteBook);

export default router